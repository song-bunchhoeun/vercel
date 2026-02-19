'use client';

import {
    BaseDialogConfirmation,
    BaseDialogContentProps
} from '@/components/BaseForm/BaseDialogConfirmation';
import FormActions from '@/components/BaseForm/FormActions';
import FormPageTitle from '@/components/BaseForm/FormPageTitle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    FormControlGroup,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useGetProvincesDistrict } from '@/hooks/useMap';
// Added
import { AlertTriangle, Calendar, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DistrictGroup } from './district-group';
import { ZoneProvince, ZoneRequest, zoneSchema } from './zone.form.service';

const BaseForm = dynamic(() => import('@/components/BaseForm/BaseForm'), {
    ssr: false
});

const ZoneMapPolygon = dynamic(() => import('./zone-map-polygon'), {
    ssr: false
});
interface ZoneFormProps {
    zone?: ZoneRequest;
    isEdit?: boolean;
    isLoading?: boolean;
    onFormValid?: (data: ZoneRequest) => void;
    customPolygon?: GeoJSON.Feature[];
}

const CustomPolygonSync = ({
    customPolygon
}: {
    customPolygon?: GeoJSON.Feature[];
}) => {
    const { setValue } = useFormContext<ZoneRequest>();
    const didInitRef = useRef(false);

    useEffect(() => {
        const next = customPolygon ?? [];

        setValue('customPolygon', next as ZoneRequest['customPolygon'], {
            shouldDirty: true,
            shouldValidate: true
        });

        if (!didInitRef.current) didInitRef.current = true;
    }, [customPolygon, setValue]);

    return null;
};

const ZoneForm = ({
    zone,
    isEdit,
    onFormValid,
    customPolygon,
    isLoading = false
}: ZoneFormProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [openConfirm, setOpenConfirm] = useState(false);
    const [dialogContent, setDialogContent] =
        useState<BaseDialogContentProps>();
    const { data: provincesDistrictData } = useGetProvincesDistrict();

    // 1. Logic: Form is ONLY locked if status is Inactive (0)
    const isLocked = isEdit && zone?.status === 0;
    const isStatusNew = isEdit && zone?.status === 2;

    const cancelDialogProps: BaseDialogContentProps = {
        icon: (
            <span className="bg-warning-50 p-3 rounded-full">
                <AlertTriangle className="text-warning-500 w-6 h-6" />
            </span>
        ),
        title: t('zones.form.discard'),
        description: t('zones.form.discard_desc'),
        actions: (
            <div className="w-full flex justify-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/zone')}
                    className="border cursor-pointer"
                >
                    {t('zones.form.discard')}
                </Button>
                <Button
                    variant="warning"
                    className="cursor-pointer"
                    onClick={() => setOpenConfirm(false)}
                >
                    {t('zones.form.keep_editing')}
                </Button>
            </div>
        )
    };

    return (
        <>
            <BaseForm
                schema={zoneSchema}
                defaultValues={zone}
                onValid={onFormValid}
                onInValid={(errors) => console.log(errors)}
                disabled={isLocked || isLoading}
            >
                <ZoneMapPolygon />

                {/* Zone Form controls */}
                <div className="h-[calc(100vh-165px)] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    <div className="bg-white rounded-md border-2 p-4">
                        <div className="flex justify-between items-start mb-4">
                            <FormPageTitle
                                title={
                                    isEdit
                                        ? t('zones.form.edit_title', {
                                              name: zone?.name
                                          })
                                        : t('zones.form.create_title')
                                }
                                subtitle={
                                    isEdit ? '' : t('zones.form.subtitle')
                                }
                                status={isStatusNew}
                            />
                        </div>

                        <div className="mb-4">
                            <FormControlGroup
                                leftAddon={
                                    <>
                                        <div className="text-sm flex gap-2 items-center">
                                            <Calendar className="w-4 h-4" />{' '}
                                            {t('zones.form.header_country')}
                                        </div>
                                        <Separator
                                            orientation="vertical"
                                            className="ml-3 max-h-6"
                                        />
                                    </>
                                }
                            >
                                <Input
                                    readOnly
                                    placeholder="Cambodia"
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </FormControlGroup>
                        </div>

                        <div className="mb-4">
                            <FormControlGroup
                                className="text-sm"
                                leftAddon={
                                    <>
                                        {' '}
                                        {t('zones.form.header_city')}{' '}
                                        <Separator
                                            orientation="vertical"
                                            className="ml-3 max-h-6"
                                        />{' '}
                                    </>
                                }
                            >
                                <div className="flex items-center px-3 py-2 gap-2 overflow-x-auto">
                                    {provincesDistrictData?.value.map(
                                        (item) => (
                                            <Badge
                                                key={item.id}
                                                variant="outline"
                                                className="font-normal whitespace-nowrap"
                                            >
                                                {item.name}
                                            </Badge>
                                        )
                                    )}
                                </div>
                            </FormControlGroup>
                        </div>

                        <div className="mb-4">
                            <FormField
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('zones.form.name_label')}{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControlGroup
                                            rightAddon={
                                                <Button
                                                    disabled={
                                                        isLocked || isLoading
                                                    }
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() =>
                                                        field.onChange('')
                                                    }
                                                >
                                                    <X />
                                                </Button>
                                            }
                                        >
                                            <Input
                                                disabled={isLocked || isLoading}
                                                placeholder={t(
                                                    'zones.form.name_placeholder'
                                                )}
                                                className="border-0 focus-visible:ring-0"
                                                {...field}
                                            />
                                        </FormControlGroup>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <CustomPolygonSync customPolygon={customPolygon} />

                        <FormField
                            name="districtIds"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-4">
                                    {provincesDistrictData?.value.map(
                                        (item: ZoneProvince) => (
                                            <div
                                                key={`zone-province-${item.id}`}
                                            >
                                                <DistrictGroup
                                                    disabled={
                                                        isLocked || isLoading
                                                    }
                                                    label={`Select ${item.name} Districts`}
                                                    districts={
                                                        item.districts ?? []
                                                    }
                                                    field={field}
                                                    currentSelection={
                                                        field.value || []
                                                    }
                                                />
                                            </div>
                                        )
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormActions
                        onCancelClicked={() => {
                            setDialogContent(cancelDialogProps);
                            setOpenConfirm(true);
                        }}
                        cancelText={t('zones.form.actions.cancel')}
                        submitText={
                            isEdit
                                ? t('zones.form.actions.save')
                                : t('zones.form.actions.create')
                        }
                        disabled={isLocked || isLoading}
                    />
                </div>
            </BaseForm>

            <BaseDialogConfirmation
                open={openConfirm}
                onOpenChange={setOpenConfirm}
                dialogContent={dialogContent!}
                className="z-1001"
                overlayClassName="z-1001"
            />
        </>
    );
};

export default ZoneForm;
