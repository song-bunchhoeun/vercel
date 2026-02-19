'use client';

import { ListPageTitleComponent } from '@/components/ListPage/ListPageTitleComponent';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { DISPATCH_STATUS } from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';

interface DispatchListPageTitleProps {
    activeStatus: number;
    onChangeStatus: (status: number) => void;
    showCreateButton?: boolean;
}

export default function DispatchListPageTitle({
    activeStatus,
    onChangeStatus,
    showCreateButton
}: DispatchListPageTitleProps) {
    const { t } = useTranslation();
    return (
        <div className="pt-8 px-8 bg-neutral-50/30">
            <ListPageTitleComponent
                title={t('job_dispatch.list_page.header_title')}
                createHref="/dashboard/job-dispatch/create"
                createLabel={t('job_dispatch.list_page.create_btn')}
                showCreateButton={showCreateButton}
                filterItem={
                    <div className="flex gap-1 mt-4">
                        {Object.values(DISPATCH_STATUS).map((status) => {
                            const active = activeStatus === status.value;
                            return (
                                <Button
                                    key={status.value}
                                    variant="ghost"
                                    onClick={() => onChangeStatus(status.value)}
                                    className={cn(
                                        'rounded-none border-b-2 h-10 text-sm font-bold transition-all hover:bg-transparent p-0 mx-4 cursor-pointer',
                                        active
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray hover:text-primary'
                                    )}
                                >
                                    {t(status.label)}
                                </Button>
                            );
                        })}
                    </div>
                }
            />
        </div>
    );
}
