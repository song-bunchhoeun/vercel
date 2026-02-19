'use client';

import ActiveStatusToggle from '@/components/ActiveStatusToggle/ActiveStatusToggle';
import {
    BaseDialogConfirmation,
    BaseDialogContentProps
} from '@/components/BaseForm/BaseDialogConfirmation';
import FormActions from '@/components/BaseForm/FormActions';
import FormPageTitle from '@/components/BaseForm/FormPageTitle';
import { FormSection } from '@/components/BaseForm/FormSection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    FormControl,
    FormControlGroup,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import PhoneInput from '@/components/ui/phone-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    useGetFleetTypeList,
    useGetZoneList,
    useUpdateDriverStatus
} from '@/hooks/useDrivers';
import { cn } from '@/lib/utils';
import { AlertTriangle, CircleCheck, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
    driverDefaultValues,
    DriverRequestData,
    driverSchema
} from './driver.form.service';

const BaseForm = dynamic(() => import('@/components/BaseForm/BaseForm'), {
    ssr: false
});

interface DriverFormProps {
    driver: DriverRequestData;
    isEdit?: boolean;
    onFormValid: (formData: DriverRequestData) => void;
    isLoading?: boolean;
}

const DriverForm = ({
    driver,
    isEdit,
    onFormValid,
    isLoading = false
}: DriverFormProps) => {
    const router = useRouter();
    const { t } = useTranslation();

    // Only lock if status is Inactive (0)
    const isLocked = isEdit && driver?.status === 0;
    const isStatusNew = isEdit && driver?.status === 2;

    const [isActive, setIsActive] = useState(driver?.status === 1);
    const [preview, setPreview] = useState<string>(driver.profileUrl || '');
    const [openConfirm, setOpenConfirm] = useState(false);
    const [dialogContent, setDialogContent] =
        useState<BaseDialogContentProps>();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: zones, isLoading: isLoadingZones } = useGetZoneList();
    const { data: fleetTypes, isLoading: isLoadingFleets } =
        useGetFleetTypeList();
    const { mutate: updateStatus, isPending: isUpdatingStatus } =
        useUpdateDriverStatus(driver?.id ?? '');

    useEffect(() => {
        if (driver.profileUrl) setPreview(driver.profileUrl);
        setIsActive(driver.status === 1);
    }, [driver.profileUrl, driver.status]);

    const handleFileChange = (
        e: ChangeEvent<HTMLInputElement>,
        onChange: (file: File | null) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            toast.error('File too large (max 3MB)');
            return;
        }
        onChange(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleResetPhoto = (onChange: (val: null) => void) => {
        setPreview('');
        onChange(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const statusConfirmProps = (
        currentlyActive: boolean
    ): BaseDialogContentProps => ({
        icon: (
            <span
                className={
                    currentlyActive
                        ? 'bg-warning-50 p-3 rounded-full'
                        : 'bg-success-50 p-3 rounded-full'
                }
            >
                {currentlyActive ? (
                    <AlertTriangle className="text-warning-500 w-6 h-6" />
                ) : (
                    <CircleCheck className="text-success-500 w-6 h-6" />
                )}
            </span>
        ),
        title: currentlyActive
            ? t('drivers.form.deactivate_title')
            : t('drivers.form.activate_title'),
        description: currentlyActive
            ? t('drivers.form.deactivate_desc')
            : t('drivers.form.activate_desc')
    });

    const cancelDialogProps: BaseDialogContentProps = {
        icon: (
            <span className="bg-warning-50 p-3 rounded-full">
                <AlertTriangle className="text-warning-500 w-6 h-6" />
            </span>
        ),
        title: t('drivers.form.discard'),
        description: t('drivers.form.discard_desc'),
        actions: (
            <div className="w-full flex justify-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/driver')}
                    className="cursor-pointer"
                >
                    {t('drivers.form.discard')}
                </Button>
                <Button
                    variant="warning"
                    onClick={() => setOpenConfirm(false)}
                    className="cursor-pointer"
                >
                    {t('drivers.form.keep_editing')}
                </Button>
            </div>
        )
    };

    const statusSuccessProps: BaseDialogContentProps = {
        icon: (
            <span className="bg-success-50 p-3 rounded-full">
                <CircleCheck className="text-success-500 w-6 h-6" />
            </span>
        ),
        title: isActive
            ? t('drivers.form.status_deactivated')
            : t('drivers.form.status_activated'),
        description: isActive
            ? t('drivers.form.status_deactivated_success', {
                  name: driver?.username
              })
            : t('drivers.form.status_activated_success', {
                  name: driver?.username
              })
    };

    return (
        <>
            <BaseForm
                schema={driverSchema}
                defaultValues={driver || driverDefaultValues}
                onValid={onFormValid}
                disabled={isLocked || isLoading}
            >
                <div className="bg-white rounded-2xl p-6">
                    <FormPageTitle
                        title={
                            isEdit
                                ? t('drivers.form.edit_title')
                                : t('drivers.form.create_title')
                        }
                        subtitle={t('drivers.form.subtitle')}
                        status={isStatusNew}
                    />

                    <FormSection
                        title={t('drivers.form.sections.profile.title')}
                        subtitle={t('drivers.form.sections.profile.subtitle')}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                name="photo"
                                render={({ field }) => (
                                    <div className="flex justify-start items-center gap-4">
                                        <Avatar className="w-15 h-15 border">
                                            <AvatarImage
                                                src={
                                                    preview ||
                                                    '/no_image_data.png'
                                                }
                                                className={cn(
                                                    (isLocked || isLoading) &&
                                                        'opacity-50'
                                                )}
                                            />
                                            <AvatarFallback>
                                                {driver.username?.charAt(0) ||
                                                    'D'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button
                                            disabled={isLocked || isLoading}
                                            variant="default"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            type="button"
                                            className="cursor-pointer"
                                        >
                                            {t(
                                                'drivers.form.sections.profile.upload'
                                            )}
                                        </Button>
                                        {preview && (
                                            <Button
                                                disabled={isLocked || isLoading}
                                                variant="outline"
                                                onClick={() =>
                                                    handleResetPhoto(
                                                        field.onChange
                                                    )
                                                }
                                                type="button"
                                                className="cursor-pointer"
                                            >
                                                {t(
                                                    'drivers.form.sections.profile.remove'
                                                )}
                                            </Button>
                                        )}
                                        <Input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={(e) =>
                                                handleFileChange(
                                                    e,
                                                    field.onChange
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            />
                            {isEdit && !isStatusNew && (
                                <div className="flex items-center pt-4 justify-end">
                                    <ActiveStatusToggle
                                        isActive={isActive}
                                        setIsActive={setIsActive}
                                        activeContent={statusConfirmProps(true)}
                                        deactiveContent={statusConfirmProps(
                                            false
                                        )}
                                        successContent={statusSuccessProps}
                                        mutate={updateStatus}
                                        isPending={isUpdatingStatus}
                                    />
                                </div>
                            )}
                        </div>
                    </FormSection>

                    <Separator />

                    <FormSection
                        title={t('drivers.form.sections.info.title')}
                        subtitle={t('drivers.form.sections.info.subtitle')}
                    >
                        <div className="grid grid-cols-2 gap-4 items-start">
                            <FormField
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'drivers.form.sections.info.name'
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControlGroup
                                            rightAddon={
                                                <X
                                                    className="w-4 h-4 cursor-pointer"
                                                    onClick={() =>
                                                        field.onChange('')
                                                    }
                                                />
                                            }
                                        >
                                            <Input
                                                disabled={isLocked || isLoading}
                                                placeholder={t(
                                                    'drivers.form.sections.info.name_placeholder'
                                                )}
                                                {...field}
                                                className="border-0 focus-visible:ring-0"
                                            />
                                        </FormControlGroup>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="nid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'drivers.form.sections.info.nid'
                                            )}
                                        </FormLabel>
                                        <FormControlGroup
                                            rightAddon={
                                                <X
                                                    className="w-4 h-4 cursor-pointer"
                                                    onClick={() =>
                                                        field.onChange('')
                                                    }
                                                />
                                            }
                                        >
                                            <Input
                                                disabled={isLocked || isLoading}
                                                placeholder={t(
                                                    'drivers.form.sections.info.nid_placeholder'
                                                )}
                                                {...field}
                                                className="border-0 focus-visible:ring-0"
                                            />
                                        </FormControlGroup>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-start">
                            <FormField
                                name="primaryPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'drivers.form.sections.contact.primary'
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <PhoneInput
                                            disabled={isLocked || isLoading}
                                            {...field}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name={t(
                                    'drivers.form.sections.contact.secondary'
                                )}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'drivers.form.sections.contact.secondary'
                                            )}
                                        </FormLabel>
                                        <PhoneInput
                                            disabled={isLocked || isLoading}
                                            {...field}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>

                    <Separator />

                    <FormSection
                        title={t('drivers.form.sections.employment.title')}
                        subtitle={t(
                            'drivers.form.sections.employment.subtitle'
                        )}
                    >
                        <div className="grid grid-cols-2 gap-4 items-start">
                            <FormField
                                name="zoneId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'drivers.form.sections.employment.zone'
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <Select
                                            disabled={
                                                isLocked ||
                                                isLoading ||
                                                isLoadingZones
                                            }
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                        placeholder={
                                                            isLoadingZones
                                                                ? t(
                                                                      'common.loading'
                                                                  )
                                                                : t(
                                                                      'drivers.form.sections.employment.select_zone'
                                                                  )
                                                        }
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {zones?.value.map((zone) => (
                                                    <SelectItem
                                                        key={zone.id}
                                                        value={zone.id}
                                                    >
                                                        {zone.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="fleetType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'drivers.form.sections.employment.fleet'
                                            )}
                                        </FormLabel>
                                        <Select
                                            disabled={
                                                isLocked ||
                                                isLoading ||
                                                isLoadingFleets
                                            }
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue
                                                        placeholder={
                                                            isLoadingFleets
                                                                ? t(
                                                                      'common.loading'
                                                                  )
                                                                : t(
                                                                      'drivers.form.sections.employment.select_fleet'
                                                                  )
                                                        }
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {fleetTypes?.data.map(
                                                    (fleet) => (
                                                        <SelectItem
                                                            key={fleet.key}
                                                            value={fleet.key}
                                                        >
                                                            {fleet.display}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>
                </div>
                <FormActions
                    cancelText={t('drivers.form.actions.cancel')}
                    submitText={
                        isEdit
                            ? t('drivers.form.actions.save')
                            : t('drivers.form.actions.create')
                    }
                    onCancelClicked={() => {
                        setDialogContent(cancelDialogProps);
                        setOpenConfirm(true);
                    }}
                    disabled={isLocked || isLoading}
                />
            </BaseForm>
            <BaseDialogConfirmation
                open={openConfirm}
                onOpenChange={setOpenConfirm}
                dialogContent={dialogContent!}
            />
        </>
    );
};

export default DriverForm;
