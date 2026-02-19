'use client';

import { SessionGuard } from '@/app/dashboard/session-guard';
import SettingDialog from '@/app/setting/page';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { useGAEvent } from '@/hooks/useGAEvent';
import { useGetUserProfile } from '@/hooks/useUsers';
import { getAxios } from '@/interceptors/axios.interceptor';
import { cn } from '@/lib/utils';
import { BellRing, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ActiveLinkProps {
    href: string;
    exact?: boolean;
    className?: string;
    activeClassName?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

const NavLink = ({
    href,
    exact = false,
    className,
    activeClassName = 'text-primary',
    children,
    onClick
}: ActiveLinkProps) => {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex items-center',
                className,
                isActive && activeClassName
            )}
            onClick={onClick}
        >
            <span className="inline-flex items-center gap-1">{children}</span>
        </Link>
    );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [openSetting, setOpenSetting] = useState(false);
    const { data: profile } = useGetUserProfile();
    const { t, i18n } = useTranslation();
    const { sendEvent } = useGAEvent();
    const pathname = usePathname();

    useEffect(() => {
        // user = profile?.data based on your JSON response structure
        const user = profile?.data;

        if (user?.merchantId) {
            // Metric #3: Identification for Frequency tracking (8h/day avg)
            if (typeof window.gtag !== 'undefined') {
                window.gtag('set', 'user_properties', {
                    user_id: user.id,
                    merchant_id: user.merchantId,
                    role_name: user.role?.name
                });

                // Specifically identify the user for Session Stitching
                window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
                    user_id: user.id
                });
            }

            // Metric #2: Track usage grouped by Merchant ID
            sendEvent('merchant_portal_active', {
                merchant_id: user.merchantId,
                username: user.username,
                current_route: pathname
            });
        }
    }, [profile, sendEvent, pathname]);

    useEffect(() => {
        const savedLang = localStorage.getItem('i18nextLng');
        if (savedLang) {
            if (i18n.language !== savedLang) {
                i18n.changeLanguage(savedLang);
            }
            document.documentElement.lang = savedLang;
        }
    }, [i18n]);

    const handleLanguageToggle = () => {
        const currentLang = i18n.language;
        const isKhmer = currentLang.startsWith('km');
        const newLang = isKhmer ? 'en' : 'km';

        i18n.changeLanguage(newLang);
        localStorage.setItem('i18nextLng', newLang);
        document.documentElement.lang = newLang;
    };

    return (
        <div className="h-screen flex flex-col">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="w-full mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center flex-start">
                        <div className="font-medium text-sm">
                            <Image
                                src="/logo.svg"
                                width={140}
                                height={36}
                                alt="Logo"
                                priority
                            />
                        </div>
                        <nav className="flex h-5 items-center space-x-4 px-8">
                            <NavLink href="/dashboard/overview">
                                {t('layout.dashboard', 'Dashboard')}
                            </NavLink>
                            <NavLink href="/dashboard/shipments">
                                {t('layout.shipments', 'Shipments')}
                            </NavLink>
                            <NavLink href="/dashboard/job-dispatch">
                                {t('layout.jobDispatch', 'Job Dispatch')}
                            </NavLink>
                            <Separator orientation="vertical" />
                            <NavLink href="/dashboard/customers">
                                {t('layout.customers', 'Customers')}
                            </NavLink>
                            <NavLink href="/dashboard/warehouse">
                                {t('layout.warehouse', 'Warehouse')}
                            </NavLink>
                            <NavLink href="/dashboard/zone">
                                {t('layout.zone')}
                            </NavLink>
                            <NavLink href="/dashboard/driver">
                                {t('layout.driver')}
                            </NavLink>
                            <NavLink href="/dashboard/user">
                                {t('layout.user')}
                            </NavLink>
                        </nav>
                    </div>

                    <div className="flex h-5 items-center flex-end">
                        <Button
                            variant="ghost"
                            className="p-2 hover:bg-white cursor-pointer transition-all"
                            onClick={handleLanguageToggle}
                        >
                            <Image
                                src={
                                    i18n.language?.startsWith('km')
                                        ? '/language/cambodia-language.svg'
                                        : '/language/english-language.svg'
                                }
                                alt="Switch Language"
                                width={30}
                                height={30}
                                className="h- w-7"
                            />
                        </Button>
                        <NavLink
                            className="p-4 hover:text-primary"
                            href="/dashboard/notifications"
                        >
                            <BellRing size={20} className="text-gray" />
                        </NavLink>
                        <button
                            className="p-4 hover:text-primary"
                            onClick={() => setOpenSetting(true)}
                        >
                            <Settings size={20} className="text-gray" />
                        </button>
                        <Separator orientation="vertical" />
                        <div className="flex items-center flex-end px-4">
                            <NavLink
                                href="/dashboard/profile"
                                className="flex items-center text-sm font-medium"
                            >
                                <Avatar>
                                    <AvatarImage
                                        src={
                                            profile?.profileUrl ??
                                            '/no_image_data.png'
                                        }
                                    />
                                    <AvatarFallback>
                                        {profile?.username?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <small className="text-sm px-2">
                                    {profile?.username}
                                </small>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-[1_1_auto] min-h-0 overflow-auto flex flex-col bg-neutral-50/30">
                <div className="mx-auto w-full h-full flex-[1_1_auto] flex flex-col">
                    {children}
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 flex justify-between px-6 py-3 text-xs text-neutral-400">
                <div>version: 1.0.63</div>
                <div>LMD Portal &copy; 2026</div>
            </footer>

            <Toaster richColors position="top-center" />
            <SettingDialog open={openSetting} onOpenChange={setOpenSetting} />
        </div>
    );
};

const DashboardLayoutWrapper = ({
    children
}: {
    children: React.ReactNode;
}) => {
    useEffect(() => {
        getAxios();
    }, []);

    return (
        <SessionGuard>
            <DashboardLayout>{children}</DashboardLayout>
        </SessionGuard>
    );
};

export default DashboardLayoutWrapper;
