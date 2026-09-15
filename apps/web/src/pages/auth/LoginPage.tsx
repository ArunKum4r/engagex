import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { login } from "../../api/auth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuthStore } from "../../stores/auth.store";
import { useLocation } from "react-router-dom";
import { useToast } from "../../components/ui/Toast";

const LoginPage = () => {
    const toast = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const setUser = useAuthStore(
        (state) => state.setUser,
    );

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (location.state?.verified) {
            toast(
                "Email verified successfully. You can now sign in.",
                "success",
            );

            window.history.replaceState(
                {},
                document.title,
                window.location.pathname,
            );
        }
    }, [location, toast]);

    const loginMutation = useMutation({
        mutationFn: login,

        onSuccess: (data) => {
            const redirectTo = searchParams.get("returnTo")
            toast("Logged in successfully", "success");
            setUser(data.user);
            if (redirectTo) {
                console.log(redirectTo)
                navigate(redirectTo, { replace: true })
            } else {
                navigate("/dashboard", {
                    replace: true,
                });
            }
        },
    });

    const errorMessage =
        loginMutation.error instanceof Error
            ? loginMutation.error.message
            : null;

    return (
        <div className="flex min-h-screen bg-background">
            {/* Brand panel */}

            <div className="hidden flex-1 items-center justify-center bg-accent p-12 lg:flex">
                <div className="max-w-md text-accent-foreground">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">
                            E
                        </div>

                        <span className="text-xl font-semibold">
                            EngageX
                        </span>
                    </div>

                    <h2 className="text-4xl font-semibold leading-tight tracking-tight">
                        Automate your conversations.
                    </h2>

                    <p className="mt-5 text-base leading-7 opacity-80">
                        Connect your platforms, build
                        automations, and manage your
                        customer interactions from one
                        place.
                    </p>
                </div>
            </div>

            {/* Form panel */}

            <div className="flex w-full items-center justify-center px-6 py-12 lg:w-[480px] lg:px-12">
                <div className="w-full max-w-sm">
                    <div className="mb-8 lg:hidden">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
                                E
                            </div>

                            <span className="text-lg font-semibold text-text">
                                EngageX
                            </span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold tracking-tight text-text">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm text-text-secondary">
                            Sign in to your EngageX account
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

                            loginMutation.mutate({
                                email: email.trim(),
                                password,
                                rememberMe,
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
                                loginMutation.isPending
                            }
                        />

                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-text"
                                >
                                    Password
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-accent hover:text-accent-hover"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="relative">
                                <Input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target
                                                .value,
                                        )
                                    }
                                    required
                                    disabled={
                                        loginMutation.isPending
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
                                    disabled={
                                        loginMutation.isPending
                                    }
                                    className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-text-muted transition-colors hover:text-text"
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

                        <label className="flex cursor-pointer items-center gap-2.5">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(event) =>
                                    setRememberMe(
                                        event.target
                                            .checked,
                                    )
                                }
                                disabled={
                                    loginMutation.isPending
                                }
                                className="h-4 w-4 rounded border-border accent-(--accent)"
                            />

                            <span className="text-sm text-text-secondary">
                                Remember me
                            </span>
                        </label>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={
                                !email || !password
                            }
                            loading={
                                loginMutation.isPending
                            }
                        >
                            Sign in
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-text-secondary">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-medium text-accent hover:text-accent-hover"
                        >
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;