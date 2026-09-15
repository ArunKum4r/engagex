import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../../components/ui/Toast";

import {
    resendVerification,
    verifyEmail,
} from "../../api/auth";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const VerifyEmailPage = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const emailFromUrl =
        searchParams.get("email") ?? "";

    const [email, setEmail] =
        useState(emailFromUrl);

    const [otp, setOtp] = useState("");

    const [resendCooldown, setResendCooldown] =
        useState(0);

    useEffect(() => {
        if (resendCooldown <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setResendCooldown((value) =>
                value > 0 ? value - 1 : 0,
            );
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [resendCooldown]);

    const verifyMutation = useMutation({
        mutationFn: verifyEmail,

        onSuccess: (data) => {
            toast(data.message, "success");
            navigate("/login", {
                replace: true,
                state: {
                    verified: true,
                },
            });
        },
    });

    const resendMutation = useMutation({
        mutationFn: resendVerification,

        onSuccess: (data) => {
            toast(data.message, "success");
            setResendCooldown(60);
            setOtp("");
        },
    });

    const handleVerify = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        verifyMutation.mutate({
            email: email.trim(),
            otp,
        });
    };

    const handleResend = () => {
        if (!email.trim() || resendCooldown > 0) {
            return;
        }

        resendMutation.mutate({
            email: email.trim(),
        });
    };

    const verifyError =
        verifyMutation.error instanceof Error
            ? verifyMutation.error.message
            : null;

    const resendError =
        resendMutation.error instanceof Error
            ? resendMutation.error.message
            : null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
                        E
                    </div>

                    <span className="text-lg font-semibold text-text">
                        EngageX
                    </span>
                </div>

                <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-text">
                        Verify your email
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                        We sent a 6-digit verification
                        code to your email address.
                    </p>
                </div>

                {(verifyError || resendError) && (
                    <div className="mb-5 rounded-md border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">
                        {verifyError || resendError}
                    </div>
                )}

                <form
                    onSubmit={handleVerify}
                    className="space-y-5"
                >
                    <Input
                        id="email"
                        label="Email address"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target.value,
                            )
                        }
                        autoComplete="email"
                        required
                        disabled={
                            verifyMutation.isPending
                        }
                    />

                    <Input
                        id="otp"
                        label="Verification code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(event) => {
                            const value =
                                event.target.value.replace(
                                    /\D/g,
                                    "",
                                );

                            setOtp(value);
                        }}
                        required
                        disabled={
                            verifyMutation.isPending
                        }
                    />

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={
                            !email.trim() ||
                            otp.length !== 6
                        }
                        loading={
                            verifyMutation.isPending
                        }
                    >
                        Verify email
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={
                            resendCooldown > 0 ||
                            resendMutation.isPending ||
                            !email.trim()
                        }
                        className="text-sm font-medium text-accent hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {resendMutation.isPending
                            ? "Sending..."
                            : resendCooldown > 0
                              ? `Resend code in ${resendCooldown}s`
                              : "Resend verification code"}
                    </button>
                </div>

                <p className="mt-8 text-center text-sm text-text-secondary">
                    Already verified?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-accent hover:text-accent-hover"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmailPage;