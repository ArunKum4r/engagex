import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { register } from "../../api/auth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const RegisterPage = () => {
    const navigate = useNavigate();

    // const setUser = useAuthStore(
    //     (state) => state.setUser,
    // );

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] =
        useState(false);

    const registerMutation = useMutation({
        mutationFn: register,

        onSuccess: () => {
            // setUser(data.user);

            // navigate("/dashboard", {
            //     replace: true,
            // });
            navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`)
        },
    });

    const errorMessage =
        registerMutation.error instanceof Error
            ? registerMutation.error.message
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
                        Build smarter automations.
                    </h2>

                    <p className="mt-5 text-base leading-7 opacity-80">
                        Bring your conversations,
                        integrations, and workflows
                        together with EngageX.
                    </p>
                </div>
            </div>

            {/* Form */}

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
                            Create your account
                        </h1>

                        <p className="mt-2 text-sm text-text-secondary">
                            Start building automations
                            with EngageX
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

                            registerMutation.mutate({
                                name: name.trim(),
                                email: email.trim(),
                                password,
                            });
                        }}
                        className="space-y-5"
                    >
                        <Input
                            id="name"
                            label="Full name"
                            type="text"
                            autoComplete="name"
                            placeholder="Arun Kumar"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value,
                                )
                            }
                            required
                            disabled={
                                registerMutation.isPending
                            }
                        />

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
                                registerMutation.isPending
                            }
                        />

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium text-text"
                            >
                                Password
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
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target
                                                .value,
                                        )
                                    }
                                    required
                                    disabled={
                                        registerMutation.isPending
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
                                        registerMutation.isPending
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

                            <p className="mt-1.5 text-xs text-text-muted">
                                Use at least 8 characters.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={
                                !name ||
                                !email ||
                                !password
                            }
                            loading={
                                registerMutation.isPending
                            }
                        >
                            Create account
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-text-secondary">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-accent hover:text-accent-hover"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;