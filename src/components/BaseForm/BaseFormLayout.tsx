'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BaseFormLayoutProps {
    children?: React.ReactNode;
    className?: string;
}

const BaseFormLayout = ({ children, className }: BaseFormLayoutProps) => {
    const { t } = useTranslation();
    const onBackClicked = () => {
        // confirm('Are you sure to go back? Unsaved data will be lost.') &&
        window.history.back();
    };

    return (
        <div className={cn(`${className} max-w-6xl mx-auto w-full`)}>
            <Button
                onClick={onBackClicked}
                variant="ghost"
                size="icon"
                className="cursor-pointer mb-4"
            >
                <ArrowLeft size={24} className="w-5 h-5" /> {t('common.back')}
            </Button>
            {children}
        </div>
    );
};

export default BaseFormLayout;
