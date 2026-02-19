'use client';

import { RoleViewDetails } from '@/app/dashboard/user/(form)/RoleViewDetails';
import {
    userDefaultValues,
    UserRequestData,
    userSchema
} from '@/app/dashboard/user/(form)/user.form.service';
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
import { Label } from '@/components/ui/label';
import PhoneInput from '@/components/ui/phone-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { useUpdateUserStatus } from '@/hooks/useUsers'; // User Hook
import { useWarehouses } from '@/hooks/useWarehouses'; // Warehouse Hook
import { cn } from '@/lib/utils';
import { AlertTriangle, CircleCheck, Info, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const BaseForm = dynamic(() => import('@/components/BaseForm/BaseForm'), {
    ssr: false
});

interface UserFormProps {
    user: UserRequestData;
    isEdit?: boolean;
    onFormValid: (formData: UserRequestData) => void;
    isLoading?: boolean;
    title: string;
    profile?: boolean;
}

const WarehouseFields = ({ disabled = false }: { disabled?: boolean }) => {
    const { t } = useTranslation();
    const { watch, setValue } = useFormContext<UserRequestData>();
    const isAdmin = watch('isAdmin');
    const { data, isLoading } = useWarehouses({
        top: 100,
        page: 1,
        status: '1'
    });

    const warehouses = isAdmin
        ? [
              {
                  id: 'all',
                  name: t('users.form.sections.role.warehouse_all_label')
              }
          ]
        : data?.value || [];

    useEffect(() => {
        if (isAdmin) {
            setValue('warehouseId', 'all');
        } else if (watch('warehouseId') === 'all') {
            setValue('warehouseId', undefined);
        }
    }, [isAdmin, setValue, watch]);

    return (
        <FormField
            name="warehouseId"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>
                        {t('users.form.sections.role.warehouse')}{' '}
                        <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl>
                        <Select
                            onValueChange={field.onChange}
                            value={field.value || ''}
                            disabled={isAdmin || disabled || isLoading}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={
                                        isLoading
                                            ? t(
                                                  'users.form.sections.role.loading_warehouse'
                                              )
                                            : t(
                                                  'users.form.sections.role.select_warehouse'
                                              )
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {warehouses.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

const UserForm = ({
    user,
    isEdit,
    onFormValid,
    isLoading = false,
    title = '',
    profile = false
}: UserFormProps) => {
    const { t } = useTranslation();
    const router = useRouter();

    const [openRoleDetails, setOpenRoleDetails] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [dialogContent, setDialogContent] =
        useState<BaseDialogContentProps>();

    // Logic: Form is ONLY locked if status is Inactive (0)
    const isLocked = isEdit && user?.status === 0;
    const isStatusNew = isEdit && user?.status === 2;

    const [isActive, setIsActive] = useState(user?.status === 1);
    const [preview, setPreview] = useState<string>(user.profileUrl || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Correct User-specific mutation hook
    const { mutate: updateStatus, isPending: isUpdatingStatus } =
        useUpdateUserStatus(user?.id ?? '');

    useEffect(() => {
        if (user.profileUrl) setPreview(user.profileUrl);
        setIsActive(user.status === 1);
    }, [user.profileUrl, user.status]);

    const handleFileChange = (
        e: ChangeEvent<HTMLInputElement>,
        onChange: (file: File | null) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            toast.error('Image size must be smaller than 3MB.');
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
            ? t('users.form.deactivate_title')
            : t('users.form.activate_title'),
        description: currentlyActive
            ? t('users.form.deactivate_desc')
            : t('users.form.activate_desc')
    });

    const cancelDialogProps: BaseDialogContentProps = {
        icon: (
            <span className="bg-warning-50 p-3 rounded-full">
                <AlertTriangle className="text-warning-500 w-6 h-6" />
            </span>
        ),
        title: t('users.form.discard'),
        description: t('users.form.discard_desc'),
        actions: (
            <div className="w-full flex justify-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/user')}
                    className="cursor-pointer"
                >
                    {t('users.form.discard')}
                </Button>
                <Button
                    variant="warning"
                    onClick={() => setOpenConfirm(false)}
                    className="cursor-pointer"
                >
                    {t('users.form.keep_editing')}
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
        // If isActive was true before the toggle, it is now deactivating/deactivated
        title: isActive
            ? t('users.form.status_deactivated')
            : t('users.form.status_activated'),
        description: isActive
            ? t('users.form.status_deactivated_success', {
                  name: user?.username
              })
            : t('users.form.status_activated_success', { name: user?.username })
    };

    return (
        <>
            <BaseForm
                schema={userSchema}
                defaultValues={user || userDefaultValues}
                onValid={onFormValid}
                disabled={isLocked || isLoading}
            >
                <div className="bg-white rounded-2xl p-6">
                    <FormPageTitle
                        title={title}
                        subtitle={t('users.form.subtitle')}
                        status={isStatusNew}
                    />

                    <FormSection
                        title={t('users.form.sections.profile.title')}
                        subtitle={t('users.form.sections.profile.subtitle')}
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
                                            <AvatarFallback>U</AvatarFallback>
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
                                                'users.form.sections.profile.upload'
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
                                                    'users.form.sections.profile.remove'
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
                            {isEdit && !isStatusNew && !profile && (
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
                        title={t('users.form.sections.info.title')}
                        subtitle={t('users.form.sections.info.subtitle')}
                    >
                        <div className="grid grid-cols-2 gap-4 items-start">
                            <FormField
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('users.form.sections.info.name')}{' '}
                                            <span className="text-danger">
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
                                                    'users.form.sections.info.name_placeholder'
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
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'users.form.sections.info.phone'
                                            )}{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </FormLabel>
                                        <PhoneInput
                                            disabled={isLocked || isLoading}
                                            {...field}
                                            placeholder={t(
                                                'users.form.sections.info.contact'
                                            )}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>

                    <Separator />

                    <FormSection
                        title={t('users.form.sections.role.title')}
                        subtitle={t('users.form.sections.role.subtitle')}
                        icon={
                            <Tooltip>
                                <TooltipTrigger
                                    type="button"
                                    onClick={() => setOpenRoleDetails(true)}
                                >
                                    <Info size={16} className="text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        {t('users.form.sections.role.tooltip')}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        }
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <FormField
                                name="isAdmin"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>
                                            {t(
                                                'users.form.sections.role.role_label'
                                            )}{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </FormLabel>
                                        <RadioGroup
                                            onValueChange={(val) =>
                                                field.onChange(val === 'admin')
                                            }
                                            value={
                                                field.value ? 'admin' : 'user'
                                            }
                                            className="flex gap-4"
                                            disabled={
                                                isLocked || isLoading || profile
                                            }
                                        >
                                            <Label className="flex items-center gap-2 cursor-pointer border p-2 rounded-md hover:bg-gray-50">
                                                <RadioGroupItem value="admin" />{' '}
                                                {t(
                                                    'users.form.sections.role.admin'
                                                )}
                                            </Label>
                                            <Label className="flex items-center gap-2 cursor-pointer border p-2 rounded-md hover:bg-gray-50">
                                                <RadioGroupItem value="user" />{' '}
                                                {t(
                                                    'users.form.sections.role.user'
                                                )}
                                            </Label>
                                        </RadioGroup>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <WarehouseFields disabled={isLocked || isLoading} />
                        </div>
                    </FormSection>
                </div>
                <FormActions
                    cancelText={t('users.form.actions.cancel')}
                    submitText={
                        isEdit
                            ? t('users.form.actions.save')
                            : t('users.form.actions.create')
                    }
                    onCancelClicked={() => {
                        setDialogContent(cancelDialogProps);
                        setOpenConfirm(true);
                    }}
                    disabled={isLocked || isLoading}
                />
            </BaseForm>

            {openRoleDetails && (
                <RoleViewDetails
                    isOpen={openRoleDetails}
                    onOpenChange={setOpenRoleDetails}
                />
            )}
            <BaseDialogConfirmation
                open={openConfirm}
                onOpenChange={setOpenConfirm}
                dialogContent={dialogContent!}
            />
        </>
    );
};

export default UserForm;
