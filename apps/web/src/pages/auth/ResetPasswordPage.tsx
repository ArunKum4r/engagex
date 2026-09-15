import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
    Link,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { resetPassword } from "../../api/auth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const toast = useToast();

    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const resetMutation = useMutation({
        mutationFn: resetPassword,

        onSuccess: (data) => {
            toast(data.message, "success");

            navigate("/login", {
                replace: true,
            });
        },
    });

    const passwordsMatch =
        password === confirmPassword;

    const errorMessage =
        resetMutation.error instanceof Error
            ? resetMutation.error.message
            : null;

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-6">
                <div className="w-full max-w-sm text-center">
                    <h1 className="text-2xl font-semibold text-text">
                        Invalid reset link
                    </h1>

                    <p className="mt-2 text-sm text-text-secondary">
                        This password reset link is
                        missing or invalid.
                    </p>

                    <Link
                        to="/forgot-password"
                        className="mt-6 inline-block text-sm font-medium text-accent hover:text-accent-hover"
                    >
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

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
                        Reset your password
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                        Choose a new password for your
                        account.
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

                        resetMutation.mutate({
                            token,
                            password,
                        });
                    }}
                    className="space-y-5"
                >
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1.5 block text-sm font-medium text-text"
                        >
                            New password
                        </label>

                        <div className="relative">
                            <Input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                autoComplete="new-password"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value,
                                    )
                                }
                                required
                                disabled={
                                    resetMutation.isPending
                                }
                                className="pr-10"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (value) =>
                                            !value,
                                    )
                                }
                                className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-text-muted hover:text-text"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={17} />
                                ) : (
                                    <Eye size={17} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="confirm-password"
                            className="mb-1.5 block text-sm font-medium text-text"
                        >
                            Confirm password
                        </label>

                        <div className="relative">
                            <Input
                                id="confirm-password"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                autoComplete="new-password"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value,
                                    )
                                }
                                required
                                disabled={
                                    resetMutation.isPending
                                }
                                error={
                                    confirmPassword &&
                                    !passwordsMatch
                                        ? "Passwords do not match"
                                        : undefined
                                }
                                className="pr-10"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (value) =>
                                            !value,
                                    )
                                }
                                className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-text-muted hover:text-text"
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={17} />
                                ) : (
                                    <Eye size={17} />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={
                            !password ||
                            !confirmPassword ||
                            !passwordsMatch
                        }
                        loading={
                            resetMutation.isPending
                        }
                    >
                        Reset password
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-text-secondary">
                    Remember your password?{" "}
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

export default ResetPasswordPage;