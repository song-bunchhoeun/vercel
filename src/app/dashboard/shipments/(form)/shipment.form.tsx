'use client';

import {
    mapFormToParcelRequest,
    shipmentDefaultValues,
    ShipmentFormModel,
    shipmentSchema
} from '@/app/dashboard/shipments/(form)/shipment.form.service';
import {
    BaseDialogConfirmation,
    BaseDialogContentProps
} from '@/components/BaseForm/BaseDialogConfirmation';
import FormActions from '@/components/BaseForm/FormActions';
import FormPageTitle from '@/components/BaseForm/FormPageTitle';
import { FormSection } from '@/components/BaseForm/FormSection';
import { Button } from '@/components/ui/button';
import {
    FormControlGroup,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import PhoneInput from '@/components/ui/phone-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import AmountInput from '@/components/ui/amount-input';
import QtyInput from '@/components/ui/quantity-input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useGetUserProfile } from '@/hooks/useUsers';
import { useWarehouses } from '@/hooks/useWarehouses';
import { ParcelRequestBody } from '@/models/request.model';
import { CustomerAddress, CustomerData } from '@/models/response.model'; // 🚀 Added CustomerAddress
import { useTranslation } from 'react-i18next';
import ShipmentAddressControl from './shipment-address.control';
import ShipmentCustomerControl from './shipment-customer.control';

const BaseForm = dynamic(() => import('@/components/BaseForm/BaseForm'), {
    ssr: false
});

interface ShipmentFormProps {
    shipment?: ShipmentFormModel;
    isEdit?: boolean;
    onFormValid: (payload: ParcelRequestBody) => void;
    isPending: boolean;
}

const ShipmentForm = ({
    shipment,
    isEdit,
    onFormValid,
    isPending
}: ShipmentFormProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [openConfirm, setOpenConfirm] = useState(false);
    const [dialogContent, setDialogContent] =
        useState<BaseDialogContentProps>();

    /**
     * 🚀 EXPERT BOOTSTRAP:
     * We initialize selectedCustomer with the data from the 'shipment' prop.
     * This fills the 'Hydration Gap' so the RadioGroup shows the selected address immediately.
     */
    const [selectedCustomer, setSelectedCustomer] = useState<
        CustomerData | undefined
    >(() => {
        if (isEdit && shipment?.customer) {
            return {
                id: shipment.customer.id,
                name: shipment.customer.name,
                primaryPhone: shipment.customer.primaryPhone,
                secondaryPhone: shipment.customer.secondaryPhone,
                addresses: [
                    {
                        id: shipment.customer.address.addressId,
                        line: shipment.customer.address.line,
                        label: shipment.customer.address.label,
                        latitude: shipment.customer.address.latitude,
                        longitude: shipment.customer.address.longitude
                    } as CustomerAddress
                ]
            } as CustomerData;
        }
        return undefined;
    });

    const { data: warehouses, isLoading: isLoadingWarehouse } = useWarehouses({
        top: 100,
        page: 1,
        status: '1'
    });
    const { data: profile } = useGetUserProfile();

    const actualDefaultValues = useMemo(() => {
        const defaults = shipment || shipmentDefaultValues;
        if (profile && !profile.isAdmin && profile.warehouse?.id) {
            return {
                ...defaults,
                warehouseId: profile.warehouse.id
            };
        }
        return defaults;
    }, [shipment, profile]);

    const handleFormSubmit = (formData: ShipmentFormModel) => {
        const payload = mapFormToParcelRequest(formData);
        onFormValid(payload);
    };

    const cancelDialogProps: BaseDialogContentProps = {
        icon: (
            <span className="bg-warning-50 p-3 rounded-full">
                <AlertTriangle className="text-warning w-6 h-6" />
            </span>
        ),
        title: t('shipments.form.discard'),
        description: t('shipments.form.discard_desc'),
        actions: (
            <div className="w-full flex justify-center gap-4">
                <Button
                    onClick={() => router.push('/dashboard/shipments')}
                    variant="outline"
                >
                    {t('shipments.form.discard')}
                </Button>
                <Button onClick={() => setOpenConfirm(false)} variant="warning">
                    {t('shipments.form.keep_editing')}
                </Button>
            </div>
        )
    };

    return (
        <>
            <BaseForm
                schema={shipmentSchema}
                defaultValues={actualDefaultValues}
                onValid={handleFormSubmit}
                onInValid={(err) => {
                    console.log(err);
                }}
            >
                <div className="bg-white rounded-2xl p-6">
                    <FormPageTitle
                        title={
                            isEdit
                                ? t('shipments.form.edit_title')
                                : t('shipments.form.create_title')
                        }
                        subtitle={t('shipments.form.subtitle')}
                    />

                    <FormSection
                        title={t('shipments.form.sections.customer.title')}
                        subtitle={t(
                            'shipments.form.sections.customer.subtitle'
                        )}
                    >
                        <ShipmentCustomerControl
                            setSelectedCustomer={setSelectedCustomer}
                        />
                        <div className="grid grid-cols-2 gap-4 items-start">
                            <FormField
                                name="customer.primaryPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'shipments.form.sections.customer.primary_phone'
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControlGroup
                                            rightAddon={
                                                <Button
                                                    variant="ghost"
                                                    className="cursor-pointer hover:bg-none"
                                                    size="icon-sm"
                                                    type="button"
                                                    onClick={() =>
                                                        field.onChange('')
                                                    }
                                                >
                                                    <X />
                                                </Button>
                                            }
                                        >
                                            <PhoneInput
                                                {...field}
                                                className="border-0 focus-visible:outline-0"
                                            />
                                        </FormControlGroup>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="customer.secondaryPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'shipments.form.sections.customer.secondary_phone'
                                            )}
                                        </FormLabel>
                                        <FormControlGroup
                                            rightAddon={
                                                <Button
                                                    variant="ghost"
                                                    className="cursor-pointer hover:bg-none"
                                                    size="icon-sm"
                                                    type="button"
                                                    onClick={() =>
                                                        field.onChange('')
                                                    }
                                                >
                                                    <X className="cursor-pointer" />
                                                </Button>
                                            }
                                        >
                                            <PhoneInput
                                                {...field}
                                                className="border-0 focus-visible:outline-0"
                                            />
                                        </FormControlGroup>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>

                    <Separator />

                    <FormSection
                        title={t('shipments.form.sections.delivery.title')}
                        subtitle={t(
                            'shipments.form.sections.delivery.subtitle'
                        )}
                    >
                        <ShipmentAddressControl
                            selectedCustomer={selectedCustomer}
                            setSelectedCustomer={setSelectedCustomer}
                        />
                        <div className="grid grid-cols-2 gap-4 items-start">
                            <FormField
                                name="qty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'shipments.form.sections.delivery.parcel_qty'
                                            )}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <QtyInput
                                            {...field}
                                            placeholder={t(
                                                'shipments.form.sections.delivery.parcel_qty_placeholder'
                                            )}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="taskType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'shipments.form.sections.delivery.task_type'
                                            )}{' '}
                                        </FormLabel>
                                        <RadioGroup
                                            className="flex gap-4 py-3"
                                            value={String(field.value)}
                                            onValueChange={field.onChange}
                                        >
                                            <Label className="flex items-center gap-2 cursor-pointer">
                                                <RadioGroupItem value="1" />{' '}
                                                {t(
                                                    'shipments.form.sections.delivery.drop_off'
                                                )}
                                            </Label>
                                            <Label className="flex items-center gap-2 cursor-pointer">
                                                <RadioGroupItem value="2" />{' '}
                                                {t(
                                                    'shipments.form.sections.delivery.pick_up'
                                                )}
                                            </Label>
                                        </RadioGroup>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-start">
                            <FormField
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'shipments.form.sections.delivery.amount'
                                            )}
                                        </FormLabel>
                                        <AmountInput
                                            {...field}
                                            placeholder={t(
                                                'shipments.form.sections.delivery.amount_placeholder'
                                            )}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'shipments.form.sections.delivery.currency'
                                            )}
                                        </FormLabel>
                                        <RadioGroup
                                            className="flex gap-4 py-3"
                                            value={String(field.value)}
                                            onValueChange={field.onChange}
                                        >
                                            <Label className="flex items-center gap-2 cursor-pointer">
                                                <RadioGroupItem value="1" />{' '}
                                                {t(
                                                    'shipments.form.sections.delivery.riel'
                                                )}
                                            </Label>
                                            <Label className="flex items-center gap-2 cursor-pointer">
                                                <RadioGroupItem value="2" />{' '}
                                                {t(
                                                    'shipments.form.sections.delivery.dollar'
                                                )}
                                            </Label>
                                        </RadioGroup>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            name="warehouseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t(
                                            'users.form.sections.role.warehouse'
                                        )}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormItem>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value || ''}
                                            disabled={!profile?.isAdmin}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        isLoadingWarehouse
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
                                                    {warehouses?.value.map(
                                                        (item) => (
                                                            <SelectItem
                                                                key={item.id}
                                                                value={item.id}
                                                            >
                                                                {item.name}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t(
                                            'shipments.form.sections.delivery.note'
                                        )}
                                    </FormLabel>
                                    <Textarea
                                        placeholder={t(
                                            'shipments.form.sections.delivery.note_placeholder'
                                        )}
                                        {...field}
                                        className="resize-none"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </FormSection>
                </div>
                <FormActions
                    submitText={
                        isEdit
                            ? t('shipments.form.actions.save')
                            : t('shipments.form.actions.create')
                    }
                    isPending={isPending}
                    onCancelClicked={() => {
                        setDialogContent(cancelDialogProps);
                        setOpenConfirm(true);
                    }}
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

export default ShipmentForm;
