"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { authService } from "@/lib/api/auth";
import { organisationApi } from "@/lib/api/organisation";
import { useAuthStore } from "@/stores/auth-store";
import { useOrganisationStore } from "@/stores/organisation-store";
import { Eye, EyeOff, Loader2, Bot } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const { setOrganisations, setSelectedOrganisation } =
        useOrganisationStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await authService.login({ email, password });

            // Store auth data in zustand
            setAuth(
                response.data.user,
                response.data.accessToken,
                response.data.refreshToken,
            );

            // Fetch organisations and redirect to first org's dashboard
            try {
                const orgsResponse = await organisationApi.getAll();
                if (orgsResponse.data.length > 0) {
                    setOrganisations(orgsResponse.data);
                    setSelectedOrganisation(orgsResponse.data[0]);
                    router.push(`/org/${orgsResponse.data[0].id}/dashboard`);
                } else {
                    // No organisations, redirect to a default page
                    router.push("/dashboard");
                }
            } catch (orgError) {
                console.error("Failed to fetch organisations:", orgError);
                // Fallback to dashboard without org context
                router.push("/dashboard");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left side - Branding */}
            <div className="from-primary/90 via-primary to-primary/80 relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br p-12 lg:flex lg:w-1/2">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-black" />

                <div className="relative z-10">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                            <Bot className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">
                            AskChimps
                        </span>
                    </div>

                    <div className="mt-16 space-y-6">
                        <h1 className="text-4xl leading-tight font-bold text-white">
                            AI-Powered Customer Engagement Platform
                        </h1>
                        <p className="max-w-md text-lg text-white/80">
                            Automate conversations, manage leads, and scale your
                            customer interactions with intelligent AI agents.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-start gap-3 text-white/90">
                        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                            <svg
                                className="h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold">Smart AI Agents</h3>
                            <p className="text-sm text-white/70">
                                Deploy intelligent agents for marketing, sales,
                                and support
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 text-white/90">
                        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                            <svg
                                className="h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold">Lead Management</h3>
                            <p className="text-sm text-white/70">
                                Track and nurture leads with automated workflows
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 text-white/90">
                        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
                            <svg
                                className="h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold">
                                Analytics & Insights
                            </h3>
                            <p className="text-sm text-white/70">
                                Get detailed insights into your customer
                                interactions
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="bg-background flex flex-1 items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                            <Bot className="text-primary h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold">AskChimps</span>
                    </div>

                    <Card className="border-0 shadow-lg">
                        <CardHeader className="space-y-1 pb-6">
                            <CardTitle className="text-3xl font-bold tracking-tight">
                                Welcome back
                            </CardTitle>
                            <CardDescription className="text-base">
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                                autoComplete="on"
                            >
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium"
                                    >
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                        disabled={isLoading}
                                        className="h-11"
                                        autoComplete="username email"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium"
                                    >
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                            disabled={isLoading}
                                            className="h-11 pr-10"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
                                            disabled={isLoading}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
                                        <svg
                                            className="h-5 w-5 flex-shrink-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="h-11 w-full text-base font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign in"
                                    )}
                                </Button>
                            </form>

                            <div className="text-muted-foreground mt-6 text-center text-sm">
                                <p>© 2024 AskChimps. All rights reserved.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
