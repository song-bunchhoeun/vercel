'use client';

import {
    BaseDialogConfirmation,
    BaseDialogContentProps
} from '@/components/BaseForm/BaseDialogConfirmation';
import Toast from '@/components/common/toast/Toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useGetSetting, useUpdateSettingStatus } from '@/hooks/useSetting';
import { AlertTriangle, CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface SettingProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SettingDialog({ open, onOpenChange }: SettingProps) {
    const { t } = useTranslation();
    const [openConfirm, setOpenConfirm] = useState(false);
    const [dialogContent, setDialogContent] =
        useState<BaseDialogContentProps>();

    const { data: setting } = useGetSetting();
    const updateSetting = useUpdateSettingStatus();

    const currentStatus = setting?.settings.RequireDriverPod === 'true';

    const handleConfirmUpdate = () => {
        if (!setting?.id) return;

        updateSetting.mutate(
            {
                id: setting.id,
                requireDriverPod: !currentStatus
            },
            {
                onSuccess: () => {
                    setDialogContent(statusSuccessProps);
                },
                onError: () => {
                    toast.custom((toastId) => (
                        <Toast
                            toastId={toastId}
                            status="failed"
                            description={t('setting.permission.failed')}
                        />
                    ));
                    setOpenConfirm(false);
                }
            }
        );
    };

    const statusConfirmProps = (
        currentlyActive: boolean
    ): BaseDialogContentProps => ({
        icon: (
            <span
                className={`p-3 rounded-full ${
                    currentlyActive ? 'bg-warning-50' : 'bg-success-50'
                }`}
            >
                {currentlyActive ? (
                    <AlertTriangle className="w-6 h-6 text-warning-500" />
                ) : (
                    <CircleCheck className="w-6 h-6 text-success-500" />
                )}
            </span>
        ),
        title: t('setting.permission.title'),
        description: currentlyActive
            ? t('setting.permission.desc_enabled')
            : t('setting.permission.desc_disabled'),
        actions: (
            <div className="flex w-full justify-center gap-4">
                <Button
                    variant="outline"
                    disabled={updateSetting.isPending}
                    onClick={handleConfirmUpdate}
                    className="cursor-pointer"
                >
                    {updateSetting.isPending
                        ? t('common.status.updating')
                        : t('setting.permission.confirm')}
                </Button>
                <Button
                    variant="warning"
                    onClick={() => setOpenConfirm(false)}
                    className="cursor-pointer"
                >
                    {t('setting.permission.cancel')}
                </Button>
            </div>
        )
    });

    const statusSuccessProps: BaseDialogContentProps = {
        icon: (
            <span className="bg-success-50 p-3 rounded-full">
                <CircleCheck className="text-success-500 w-6 h-6" />
            </span>
        ),
        title: t('setting.permission.title'),
        description: t('setting.permission.success')
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="p-4 max-w-150">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {t('setting.title')}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="bg-white p-4 rounded-2xl space-y-4">
                        <div className="justify-center">
                            <p className="text-mtext-gray text-xs sm:text-sm">
                                {t('setting.permission.title')}
                            </p>
                            <div className="flex gap-1.5 items-center">
                                <p className="text-sm sm:text-base font-medium">
                                    {t('setting.permission.label')}
                                </p>
                                <Switch
                                    id="status"
                                    checked={currentStatus}
                                    className="h-5 cursor-pointer transition-colors data-[state=checked]:bg-success-600 data-[state=unchecked]:bg-neutral-200"
                                    onCheckedChange={() => {
                                        setDialogContent(
                                            statusConfirmProps(currentStatus)
                                        );
                                        setOpenConfirm(true);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <BaseDialogConfirmation
                open={openConfirm}
                onOpenChange={() => setOpenConfirm(false)}
                dialogContent={dialogContent!}
            />
        </>
    );
}
