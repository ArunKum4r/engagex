import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { forgotPassword } from "../../api/auth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";

const ForgotPasswordPage = () => {
    const toast = useToast();

    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const forgotPasswordMutation = useMutation({
        mutationFn: forgotPassword,

        onSuccess: (data) => {
            setSubmitted(true);
            toast(data.message, "success");
        },
    });

    const errorMessage =
        forgotPasswordMutation.error instanceof Error
            ? forgotPasswordMutation.error.message
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

                {!submitted ? (
                    <>
                        <div className="mb-8">
                            <h1 className="text-2xl font-semibold tracking-tight text-text">
                                Forgot your password?
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                                Enter your email and we'll
                                send you a password reset
                                link.
                            </p>
                        </div>

                        {errorMessage && (
                            <div className="mb-5 rounded-md border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">
                                {errorMessage}
                            </div>
                        )}

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();

                                forgotPasswordMutation.mutate({
                                    email: email.trim(),
                                });
                            }}
                            className="space-y-5"
                        >
                            <Input
                                id="email"
                                label="Email address"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value,
                                    )
                                }
                                required
                                disabled={
                                    forgotPasswordMutation.isPending
                                }
                            />

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={!email.trim()}
                                loading={
                                    forgotPasswordMutation.isPending
                                }
                            >
                                Send reset link
                            </Button>
                        </form>
                    </>
                ) : (
                    <div>
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-success/10 text-success">
                            ✓
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-text">
                            Check your email
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-text-secondary">
                            If an account exists for{" "}
                            <span className="font-medium text-text">
                                {email}
                            </span>
                            , we've sent a password reset
                            link.
                        </p>

                        <p className="mt-3 text-sm leading-6 text-text-muted">
                            The link will expire after 15
                            minutes.
                        </p>

                        <div className="mt-6">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-accent hover:text-accent-hover"
                            >
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                )}

                {!submitted && (
                    <p className="mt-8 text-center text-sm text-text-secondary">
                        Remember your password?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-accent hover:text-accent-hover"
                        >
                            Sign in
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;