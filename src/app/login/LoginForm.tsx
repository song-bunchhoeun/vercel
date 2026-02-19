'use client';

import { signIn, signOut } from 'next-auth/react'; // 🚀 Added signOut
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useMemo, useEffect } from 'react'; // 🚀 Added useEffect
import { useTranslation } from 'react-i18next';

// Components
import { Button } from '@/components/ui/button';

export default function LoginForm() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    /**
     * 🚀 EXPERT FIX: The "Kill-Switch"
     * When this page mounts, we clear any existing stale session data.
     * This prevents the middleware from seeing a 'zombie' accessToken and
     * triggering the unauthorized redirect loop.
     */
    useEffect(() => {
        const hasError = searchParams.get('error');
        if (hasError) {
            // Force clear local session state without triggering a redirect
            void signOut({ redirect: false });
        }
    }, [searchParams]);

    // 1. Logic: Prepare the callback URL
    const callbackUrl = useMemo(() => {
        const url = searchParams.get('callbackUrl') || '/dashboard';
        return url === '/login' ? '/dashboard' : url;
    }, [searchParams]);

    // 2. Action: Trigger SSO Sign-in
    const handleLogin = () => {
        signIn('keycloak', { callbackUrl });
    };

    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-background">
            {/* LEFT SIDE: Branding Image */}
            <div className="relative hidden w-1/2 lg:block">
                <Image
                    src="/login/Left-side.svg"
                    alt="DGC Last Mile Delivery Illustration"
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
            </div>

            {/* RIGHT SIDE: Authentication Interaction */}
            <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 bg-card">
                <div className="flex w-full max-w-sm flex-col items-center gap-20">
                    {/* Logo Section */}
                    <Image
                        src="/logo.svg"
                        alt={t('layout.logoAlt', "Last Mile Delivery's logo")}
                        width={180}
                        height={60}
                    />
                    <div className="flex flex-col items-center w-full gap-10">
                        <div className="text-center space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-foreground">
                                {t('login.welcome_title', 'Welcome back!')}
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                {t(
                                    'login.welcome_subtitle',
                                    'Sign in to access your dashboard'
                                )}
                            </p>
                        </div>
                        {/* Login Action */}
                        <Button
                            onClick={handleLogin}
                            size="lg"
                            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer grid grid-cols-[auto_1fr_auto] items-center"
                        >
                            <Image
                                src="/login/login-side.svg"
                                alt={t(
                                    'layout.logoAlt',
                                    "Last Mile Delivery's logo"
                                )}
                                width={180}
                                height={60}
                                className="h-auto w-auto justify-self-start"
                            />
                            {t('login.btn_login', 'Login with DGConnect')}
                        </Button>
                    </div>

                    {/* Supported Section*/}
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                {t('login.welcome_subtitle', 'Supported by')}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Image
                                src="/login/MPTC-logo.svg"
                                alt={t('layout.logoAlt', "MPTC's logo")}
                                width={32}
                                height={32}
                                className="h-auto w-auto"
                            />
                            <Image
                                src="/login/DG-logo.svg"
                                alt={t('layout.logoAlt', "DGC's logo")}
                                width={32}
                                height={32}
                                className="h-auto w-auto"
                            />
                            <Image
                                src="/login/Clients.svg"
                                alt={t('layout.logoAlt', "Client's logo")}
                                width={32}
                                height={32}
                                className="h-auto w-auto"
                            />
                        </div>
                    </div>

                    {/* Footer Info */}
                    <p className="text-xs text-muted-foreground mt-8">
                        © 2025 {t('layout.logoAlt')}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
