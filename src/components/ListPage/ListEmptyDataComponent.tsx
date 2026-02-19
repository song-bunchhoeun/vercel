import { PlusIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export interface EmptyDataProps {
    image?: string;
    title_no_data: string;
    subtitle_no_data: string;
    moreButton?: React.ReactNode;
    createHref: string;
    createLabel?: string;
    onGenerateListClicked?: () => void;
    disabled?: boolean;
    isFiltered?: boolean;
}

export default function ListEmptyDataComponent({
    image,
    title_no_data,
    subtitle_no_data,
    moreButton,
    createHref,
    createLabel,
    onGenerateListClicked,
    disabled = false,
    isFiltered = false
}: EmptyDataProps) {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-center flex-col w-full h-[100vh]">
            {!isFiltered && (
                <>
                    {image && (
                        <Image
                            alt="no_data"
                            width={100}
                            height={100}
                            src={image}
                        />
                    )}
                    <div className="flex items-center flex-col pt-2 pb-4">
                        <span className="font-bold text-xl">
                            {title_no_data}
                        </span>
                        <p className="text-[#6B7280]">{subtitle_no_data}</p>
                    </div>
                    <div className="flex gap-4">
                        {moreButton}
                        {disabled && (
                            <Button
                                disabled
                                className="w-48 h-11 cursor-not-allowed opacity-50"
                            >
                                <PlusIcon size={40} strokeWidth={1} />
                                {createLabel}
                            </Button>
                        )}
                        {!disabled && (
                            <Button
                                asChild
                                className="w-48 h-11 cursor-pointer"
                            >
                                <Link href={createHref}>
                                    <PlusIcon size={40} strokeWidth={1} />
                                    {createLabel}
                                </Link>
                            </Button>
                        )}
                    </div>
                    {onGenerateListClicked && (
                        <Button
                            variant="default"
                            onClick={onGenerateListClicked}
                            className="mt-4 cursor-pointer"
                        >
                            {t('common.empty_state.generate_list')}
                        </Button>
                    )}
                </>
            )}
            {isFiltered && <>{t('common.empty_state.not_found')}</>}
        </div>
    );
}
