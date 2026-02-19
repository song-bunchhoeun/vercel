'use client';

import {
    FormControlGroup,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGetListCustomers } from '@/hooks/useCustomers';
import { CustomerData } from '@/models/response.model';
import { Loader2, Plus, X } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    ShipmentCustomerForm,
    shipmentDefaultValues
} from './shipment.form.service';

interface ShipmentCustomerControlProps {
    setSelectedCustomer: Dispatch<SetStateAction<CustomerData | undefined>>;
}

const ShipmentCustomerControl = ({
    setSelectedCustomer
}: ShipmentCustomerControlProps) => {
    const { t } = useTranslation();
    const { watch, setValue, trigger } = useFormContext();
    const customerName = watch('customer.name');
    const customerId = watch('customer.id');
    const [debouncedSearch, setDebouncedSearch] = useState(customerName);
    const [open, setOpen] = useState(false);

    const { data, isLoading } = useGetListCustomers({
        top: 10,
        page: 1,
        searchText: debouncedSearch
    });

    useEffect(() => {
        if (customerId && data?.value && !isLoading) {
            const existingCustomer = data.value.find(
                (c) => c.id === customerId
            );

            if (existingCustomer) {
                setSelectedCustomer(existingCustomer);
            }
        }
    }, [data, isLoading, customerId, setSelectedCustomer]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(customerName), 500);
        return () => clearTimeout(handler);
    }, [customerName]);

    const handleSelect = (c: CustomerData) => {
        const first = c.addresses?.[0];
        const formVal: ShipmentCustomerForm = {
            id: c.id,
            name: c.name ?? '',
            primaryPhone: c.primaryPhone ?? '',
            secondaryPhone: c.secondaryPhone ?? '',
            address: {
                addressId: first?.id ?? '',
                label: first?.label ?? '',
                line: first?.line ?? '',
                latitude: first?.latitude ?? 11.5564,
                longitude: first?.longitude ?? 104.9282
            }
        };

        setSelectedCustomer(c);
        setValue('customer', formVal);
        trigger('customer');
        setOpen(false);
    };

    const handleCreateNew = () => {
        const newCustomerTemplate: CustomerData = {
            id: '',
            merchantId: null,
            name: customerName,
            gender: null,
            dateCreate: new Date().toISOString(),
            primaryPhone: '',
            secondaryPhone: '',
            hasSubscribed: false,
            addresses: [],
            totalShipments: 0
        };

        setValue('customer', {
            ...shipmentDefaultValues.customer,
            id: undefined,
            name: customerName,
            primaryPhone: '',
            secondaryPhone: '',
            address: {
                ...shipmentDefaultValues.customer.address,
                addressId: '',
                line: '',
                label: ''
            }
        });

        setSelectedCustomer(newCustomerTemplate);
        setOpen(false);
    };

    return (
        <div className="relative">
            <FormField
                name="customer.name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            {t('shipments.form.sections.customer.name')}{' '}
                            <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControlGroup
                            rightAddon={
                                <>
                                    {isLoading && (
                                        <Loader2 className="animate-spin w-4 h-4" />
                                    )}
                                    {!isLoading && field.value && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                field.onChange('');
                                                setOpen(true);
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </>
                            }
                        >
                            <Input
                                {...field}
                                onFocus={() => setOpen(true)}
                                onChange={(e) => {
                                    field.onChange(e.target.value);
                                    setOpen(true);
                                }}
                                autoComplete="off"
                                className="border-0 focus-visible:ring-0"
                                placeholder={t(
                                    'shipments.form.sections.customer.name_placeholder'
                                )}
                            />
                        </FormControlGroup>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 hover:bg-bg-primary-light text-primary font-medium border-b"
                        onClick={handleCreateNew}
                    >
                        <Plus className="w-4 h-4" />
                        {t('shipments.form.sections.customer.create_new')}
                    </button>

                    {!isLoading &&
                        data?.value?.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-bg-primary-light"
                                onClick={() => handleSelect(c)}
                            >
                                <div className="font-medium text-sm">
                                    {c.name}
                                </div>
                                <div className="text-xs text-primary">
                                    {c.primaryPhone}
                                </div>
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
};

export default ShipmentCustomerControl;
