'use client';

import AddressMapDialog, {
    AddressMapDialogLocation
} from '@/components/AddressMapDialog/address-map.dialog';
import { ToggleButtonGroup } from '@/components/common/ToggleButtonGroup/ToggleButtonGroup';
import {
    FormControlGroup,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CustomerAddress, CustomerData } from '@/models/response.model';
import { BriefcaseBusiness, House, LocateFixed } from 'lucide-react';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface ShipmentAddressControlProps {
    selectedCustomer: CustomerData | undefined;
    setSelectedCustomer: Dispatch<SetStateAction<CustomerData | undefined>>;
}

const ShipmentAddressControl = ({
    selectedCustomer,
    setSelectedCustomer
}: ShipmentAddressControlProps) => {
    const { t } = useTranslation();
    const [openMap, setOpenMap] = useState(false);
    const { watch, setValue, trigger, getValues } = useFormContext(); // 🚀 Added getValues
    const addressLabel = watch('customer.address.label');

    const updateAddressForm = useCallback(
        (addr: CustomerAddress) => {
            setValue('customer.address', {
                addressId: addr.id ?? '',
                label: addr.label ?? '',
                line: addr.line ?? '',
                latitude: addr.latitude,
                longitude: addr.longitude
            });
            trigger('customer.address');
        },
        [setValue, trigger]
    );

    const handleMapSelected = useCallback(
        (loc: AddressMapDialogLocation) => {
            // 🚀 EXPERT FIX:
            // In Edit mode, selectedCustomer might not be hydrated yet.
            // We pull the current customer ID and name from the form state as a fallback.
            const formCustomer = getValues('customer');
            const customerId = selectedCustomer?.id || formCustomer?.id;

            const newAddr: CustomerAddress = {
                id: loc.address!, // Use text as temp ID
                line: loc.address!,
                latitude: loc.lat,
                longitude: loc.lng,
                label: addressLabel || 'Home',
                customerId: customerId || '', // Use the ID from form state
                note: ''
            };

            // Update the UI list if selectedCustomer exists
            if (selectedCustomer) {
                const updated = [
                    ...(selectedCustomer.addresses || []),
                    newAddr
                ];
                setSelectedCustomer({
                    ...selectedCustomer,
                    addresses: updated
                });
            } else {
                // If not hydrated, create a partial customer object so the RadioGroup appears
                setSelectedCustomer({
                    id: customerId,
                    name: formCustomer?.name,
                    addresses: [newAddr]
                } as CustomerData);
            }

            updateAddressForm(newAddr);
        },
        [
            selectedCustomer,
            addressLabel,
            setSelectedCustomer,
            updateAddressForm,
            getValues
        ]
    );

    const handleAddressChange = (id: string) => {
        const found = selectedCustomer?.addresses?.find(
            (a) => String(a.id) === id
        );
        if (found) updateAddressForm(found);
    };

    return (
        <>
            <FormField
                name="customer.address.line"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            {t('shipments.form.sections.delivery.address')}{' '}
                            <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControlGroup
                            rightAddon={
                                <button
                                    type="button"
                                    className="flex items-center gap-1 text-sm font-medium text-primary cursor-pointer"
                                    onClick={() => setOpenMap(true)}
                                >
                                    <LocateFixed className="w-4 h-4" />{' '}
                                    {t(
                                        'shipments.form.sections.delivery.find_location'
                                    )}
                                </button>
                            }
                        >
                            <Input
                                readOnly
                                {...field}
                                className="border-0 focus-visible:ring-0"
                                placeholder={t(
                                    'shipments.form.sections.delivery.address_placeholder'
                                )}
                            />
                        </FormControlGroup>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {selectedCustomer?.addresses &&
                selectedCustomer.addresses.length > 0 && (
                    <div className="grid gap-4 bg-bg-primary-light p-4 rounded-md border border-border">
                        <FormField
                            name="customer.address.addressId"
                            render={({ field }) => (
                                <FormItem>
                                    <RadioGroup
                                        className="flex flex-col gap-3"
                                        value={field.value || ''}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            handleAddressChange(val);
                                        }}
                                    >
                                        {selectedCustomer.addresses?.map(
                                            (item, index) => (
                                                <Label
                                                    key={
                                                        item.id ||
                                                        `addr-${index}`
                                                    }
                                                    className="flex items-start gap-3 cursor-pointer group"
                                                >
                                                    <RadioGroupItem
                                                        value={String(item.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-sm font-bold text-primary">
                                                            {item.label ||
                                                                t(
                                                                    'shipments.form.sections.delivery.address_no_label'
                                                                )}
                                                        </p>
                                                        <span className="text-xs text-primary leading-relaxed">
                                                            {item.line}
                                                        </span>
                                                    </div>
                                                </Label>
                                            )
                                        )}
                                    </RadioGroup>
                                </FormItem>
                            )}
                        />
                    </div>
                )}

            <AddressMapDialog
                open={openMap}
                setOpen={setOpenMap}
                title={t('common.address_map.map_title')}
                descriptiom={t('common.address_map.map_description')}
                onMapConfimed={handleMapSelected}
            >
                <div className="mt-4">
                    <h6 className="mb-2">Add Label</h6>
                    <FormField
                        name="customer.address.label"
                        render={({ field }) => (
                            <FormItem>
                                <ToggleButtonGroup
                                    options={[
                                        {
                                            value: 'Home',
                                            label: t(
                                                'common.address_map.label_home'
                                            ),
                                            icon: <House />
                                        },
                                        {
                                            value: 'Work',
                                            label: t(
                                                'common.address_map.label_work'
                                            ),
                                            icon: <BriefcaseBusiness />
                                        }
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                                <div className="mt-2 space-y-1.5">
                                    <FormLabel className="text-sm text-mtext-primary">
                                        {t('common.address_map.label_name')}
                                    </FormLabel>
                                    <Input
                                        {...field}
                                        placeholder={t(
                                            'common.address_map.label_placeholder'
                                        )}
                                    />
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
            </AddressMapDialog>
        </>
    );
};

export default ShipmentAddressControl;
