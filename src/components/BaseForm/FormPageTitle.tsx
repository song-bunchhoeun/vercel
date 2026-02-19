'use client';

import React from 'react';

interface FormPageTitleProps {
    title: string;
    subtitle: string;
    status?: boolean;
}

export default function FormPageTitle({
    title,
    subtitle,
    status
}: FormPageTitleProps) {
    return (
        <>
            <div className="mb-6">
                <div className="flex gap-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {title}
                    </h3>
                    {status && (
                        <span className="text-blue-500 bg-blue-100 items-center flex px-2.5 py-0.5 rounded-md text-sm">
                            New
                        </span>
                    )}
                </div>
                <p className="text-sm text-secondary-foreground">{subtitle}</p>
            </div>
        </>
    );
}
