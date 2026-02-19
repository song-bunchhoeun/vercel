'use client';
import ActiveStatusToggle from '@/components/ActiveStatusToggle/ActiveStatusToggle';
import {
    BaseDialogConfirmation,
    BaseDialogContentProps
} from '@/components/BaseForm/BaseDialogConfirmation';
import FormActions from '@/components/BaseForm/FormActions';
import FormPageTitle from '@/components/BaseForm/FormPageTitle';
import { FormSection } from '@/components/BaseForm/FormSection';
import { Button } from '@/components/ui/button';
import BaseFileUpload from '@/components/ui/file-upload';
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
import { Separator } from '@/components/ui/separator';
import { useUpdateWarehouseStatus } from '@/hooks/useWarehouses';
import { AlertTriangle, CircleCheck, LocateFixed } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { WarehouseFormData, warehouseSchema } from './warehouse.form.service';

const AddressMapDialog = dynamic(
    () => import('@/components/AddressMapDialog/address-map.dialog'),
    { ssr: false }
);

const BaseForm = dynamic(() => import('@/components/BaseForm/BaseForm'), {
    ssr: false
});
interface WarehouseFormProps {
    warehouse: WarehouseFormData;
    isEdit?: boolean;
    onFormValid: (formData: FormData) => void;
    // externalErrors?: Record<string, string>; // Changed to object for scalability
    isLoading?: boolean;
}

const WarehouseName = ({
    disabled,
    error
}: {
    disabled?: boolean;
    error?: string;
}) => {
    const { t } = useTranslation();
    const { setError } = useFormContext();

    useEffect(() => {
        if (error) {
            setError('name', { type: 'server', message: error });
        }
    }, [error, setError]);

    return (
        <FormField
            disabled={disabled}
            name="name"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>
                        {t('warehouses.form.sections.about.name')}{' '}
                        <span className="text-danger">*</span>
                    </FormLabel>
                    <FormControl>
                        <Input
                            placeholder={t(
                                'warehouses.form.sections.about.name_placeholder'
                            )}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

const WarehouseForm = ({
    warehouse,
    isEdit = false,
    onFormValid,
    // externalErrors,
    isLoading = false // Default to false
}: WarehouseFormProps) => {
    const { t } = useTranslation();
    const [openMap, setOpenMap] = useState(false);
    const [isActive, setIsActive] = useState(warehouse?.status === 1);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [dialogContent, setDialogContent] =
        useState<BaseDialogContentProps>();

    const { mutate, isPending: isUpdatingStatus } = useUpdateWarehouseStatus(
        warehouse?.id
    );

    const activeConfirm = warehouse?.status === 1;

    const cancelDialogProps: BaseDialogContentProps = {
        icon: (
            <span className="bg-warning-50 p-3 rounded-full">
                <AlertTriangle className="text-warning-500 w-6 h-6" />
            </span>
        ),
        title: t('warehouses.form.discard'),
        description: t('warehouses.form.discard_desc'),
        actions: (
            <div className="w-full flex justify-center gap-4">
                <Button
                    onClick={() => {
                        window.location.href = '/dashboard/warehouse';
                        setOpenConfirm(false);
                    }}
                    className="cursor-pointer"
                    variant="outline"
                >
                    {t('warehouses.form.discard')}
                </Button>
                <Button
                    onClick={() => setOpenConfirm(false)}
                    className="cursor-pointer"
                    variant="warning"
                >
                    {t('warehouses.form.keep_editing')}
                </Button>
            </div>
        )
    };

    const getStatusDialogProps = (
        isActive: boolean
    ): BaseDialogContentProps => ({
        icon: (
            <span
                className={
                    isActive
                        ? 'bg-warning-50 p-3 rounded-full'
                        : 'bg-success-50 p-3 rounded-full'
                }
            >
                {isActive ? (
                    <AlertTriangle className="text-warning-500 w-6 h-6" />
                ) : (
                    <CircleCheck className="text-success-500 w-6 h-6" />
                )}
            </span>
        ),
        title: isActive
            ? t('warehouses.form.deactivate_title')
            : t('warehouses.form.activate_title'),
        description: isActive
            ? t('warehouses.form.deactivate_desc')
            : t('warehouses.form.activate_desc')
    });

    const statusSuccessProps: BaseDialogContentProps = {
        icon: (
            <span className="bg-success-50 p-3 rounded-full">
                <CircleCheck className="text-success-500 w-6 h-6" />
            </span>
        ),
        title: activeConfirm
            ? t('warehouses.form.status_deactivated')
            : t('warehouses.form.status_activated'),
        description: isActive
            ? t('warehouses.form.status_deactivated_success', {
                  name: warehouse?.name
              })
            : t('warehouses.form.status_activated_success', {
                  name: warehouse?.name
              })
    };

    const buildMultipartFormData = useCallback(
        (values: WarehouseFormData) => {
            const formData = new FormData();

            Object.entries(values).forEach(([key, value]) => {
                if (value === undefined || value === null) return;

                // Handle Files (Images)
                if (key === 'files' && Array.isArray(value)) {
                    value.forEach((file) => formData.append('files', file));
                }
                // Handle JSON objects (Documents)
                else if (
                    typeof value === 'object' &&
                    !Array.isArray(value) &&
                    !(value instanceof File)
                ) {
                    formData.append(key, JSON.stringify(value));
                }
                // Handle Arrays (Documents/Ids)
                else if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                }
                // Handle Primitives
                else {
                    formData.append(key, String(value));
                }
            });

            onFormValid(formData);
        },
        [onFormValid]
    );

    const handleSubmit = (values: WarehouseFormData) => {
        if (!isActive && !isEdit) return; // Prevent creation if toggled off
        buildMultipartFormData(values);
    };

    return (
        <>
            <BaseForm
                schema={warehouseSchema}
                defaultValues={warehouse}
                onValid={handleSubmit}
                disabled={!isActive}
                onInValid={(err) => console.log(err)}
            >
                <div className="bg-white rounded-2xl p-6">
                    <FormPageTitle
                        title={
                            isEdit
                                ? t('warehouses.form.edit_title')
                                : t('warehouses.form.create_title')
                        }
                        subtitle={t('warehouses.form.subtitle')}
                    />
                    {/* About Warehouse Section */}
                    <FormSection
                        title={t('warehouses.form.sections.about.title')}
                        subtitle={t('warehouses.form.sections.about.subtitle')}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <WarehouseName
                                disabled={!isActive}
                                // error={externalErrors?.name}
                            />

                            {isEdit && (
                                <div className="flex items-center pt-4 justify-end">
                                    <ActiveStatusToggle
                                        isActive={isActive}
                                        setIsActive={setIsActive}
                                        activeContent={getStatusDialogProps(
                                            false
                                        )}
                                        deactiveContent={getStatusDialogProps(
                                            true
                                        )}
                                        successContent={statusSuccessProps}
                                        mutate={mutate}
                                        isPending={isUpdatingStatus}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4">
                            <FormField
                                disabled={!isActive}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'warehouses.form.sections.about.address'
                                            )}{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControlGroup
                                            rightAddon={
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
                                                    onClick={() =>
                                                        setOpenMap(true)
                                                    }
                                                    disabled={!isActive}
                                                >
                                                    <LocateFixed className="w-4 h-4" />
                                                    {t(
                                                        'warehouses.form.sections.about.find_location'
                                                    )}
                                                </button>
                                            }
                                        >
                                            <Input
                                                readOnly
                                                placeholder={t(
                                                    'warehouses.form.sections.about.address_placeholder'
                                                )}
                                                {...field}
                                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                        </FormControlGroup>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-start">
                            <FormField
                                disabled={!isActive}
                                name="primaryPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'warehouses.form.sections.about.primary_phone'
                                            )}{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <PhoneInput
                                                disabled={!isActive}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                disabled={!isActive}
                                name="secondaryPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'warehouses.form.sections.about.secondary_phone'
                                            )}
                                        </FormLabel>
                                        <FormControl>
                                            <PhoneInput
                                                disabled={!isActive}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>

                    <Separator />

                    {/* Upload Section */}
                    <FormSection
                        title={t('warehouses.form.sections.upload.title')}
                        subtitle={t('warehouses.form.sections.upload.subtitle')}
                    >
                        <BaseFileUpload
                            disabled={!isActive}
                            /* setError={form.setError}
                            clearErrors={form.clearErrors} */
                        />
                    </FormSection>

                    {/* Hidden fields for coordinates */}
                    <FormField
                        disabled={!isActive}
                        name="latitude"
                        render={({ field }) => (
                            <FormItem className="hidden">
                                <FormControl>
                                    <Input
                                        type="hidden"
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        disabled={!isActive}
                        name="longitude"
                        render={({ field }) => (
                            <FormItem className="hidden">
                                <FormControl>
                                    <Input
                                        type="hidden"
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <FormActions
                    cancelText={t('warehouses.form.actions.cancel')}
                    submitText={
                        isEdit
                            ? t('warehouses.form.actions.save')
                            : t('warehouses.form.actions.create')
                    }
                    onCancelClicked={() => {
                        setDialogContent(cancelDialogProps);
                        setOpenConfirm(true);
                    }}
                    disabled={!isActive || isLoading}
                />

                {/* Map Dialog */}
                <AddressMapDialog
                    open={openMap}
                    setOpen={setOpenMap}
                    title={t('warehouses.form.map.title')}
                    descriptiom={t('warehouses.form.map.description')}
                    isViewMap={false}
                    latitude={warehouse.latitude}
                    longitude={warehouse.longitude}
                    defaultAddress={warehouse.address}
                    // isEditMap={isEdit}
                />
            </BaseForm>

            <BaseDialogConfirmation
                open={openConfirm}
                onOpenChange={() => setOpenConfirm(false)}
                dialogContent={dialogContent!}
            />
        </>
    );
};

export default WarehouseForm;
