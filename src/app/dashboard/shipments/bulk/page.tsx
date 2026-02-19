'use client';

import { BulkImportSummary } from '@/app/dashboard/shipments/bulk/SummaryDialog';
import { UserResponseData } from '@/app/dashboard/user/(form)/user.form.service';
import { Warehouse } from '@/app/dashboard/warehouse/(form)/warehouse.form.service';
import Toast from '@/components/common/toast/Toast';
import { ListPageTitleComponent as PageHeader } from '@/components/ListPage/ListPageTitleComponent';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { FormControl, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useImportShipments } from '@/hooks/useShipments';
import { useGetUserProfile } from '@/hooks/useUsers';
import { useWarehouses } from '@/hooks/useWarehouses';
import { cn } from '@/lib/utils';
import { WarehouseStatus } from '@/models/status';
import { AxiosError } from 'axios';
import {
    AlertTriangle,
    ArrowLeft,
    Loader2,
    LucideDownload,
    MinusIcon,
    PlusIcon,
    SearchX
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, {
    memo,
    Suspense,
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useState,
    useTransition
} from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';
import { z } from 'zod';
import {
    CurrencyType,
    DOWNLOAD_ASSETS,
    ShipmentImportData,
    shipmentRowSchema,
    TaskType
} from './bulk.form.service';

const BaseForm = dynamic(() => import('@/components/BaseForm/BaseForm'), {
    ssr: false
});

// 📏 Standardized Widths for Header/Body Alignment
const COL_S = 'w-14 shrink-0 flex justify-center items-center border-r h-full';
const COL_M = 'w-30 shrink-0 flex justify-center items-center border-r h-full';
const COL_L = 'w-40 shrink-0 flex justify-center items-center border-r h-full';
const COL_WAREHOUSE =
    'w-48 shrink-0 flex justify-center items-center border-r h-full';
const COL_FLEX_1 = 'flex flex-[1.5] min-w-[140px] border-r h-full items-center';
const COL_FLEX_2 = 'flex flex-[2] min-w-[200px] border-r h-full items-center';
const COL_FLEX_LAST = 'flex flex-[2] min-w-[200px] h-full items-center';

const shipmentSchema = z.object({
    searchText: z.string().optional(),
    rows: z.array(shipmentRowSchema)
});

type FormValues = z.infer<typeof shipmentSchema>;

interface FastCellProps {
    children: React.ReactNode;
    _value: string | number | boolean | null | undefined;
    _isInvalid: boolean;
    className?: string;
}

const FastCell = memo(
    ({ children, className }: FastCellProps) => (
        <div className={cn('flex items-center h-full', className)}>
            {children}
        </div>
    ),
    (prev, next) =>
        prev._value === next._value && prev._isInvalid === next._isInvalid
);
FastCell.displayName = 'FastCell';

/**
 * 🚀 SHIPMENT ROW: Memoized for O(1) performance.
 * originalIndex is used for the RHF path to ensure data integrity during search.
 */
const ShipmentRow = memo(
    ({
        originalIndex,
        id,
        isSelected,
        onToggle,
        validateRow,
        warehouses,
        isAdmin
    }: {
        originalIndex: number;
        id: string;
        isSelected: boolean;
        onToggle: (id: string) => void;
        validateRow: (idx: number) => void;
        warehouses: Warehouse[];
        isAdmin: boolean;
    }) => {
        const { t } = useTranslation();
        return (
            <div className="flex border-b last:border-b-0 h-12 items-center hover:bg-neutral-50/50 transition-colors w-full group">
                <div className={COL_S}>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggle(id)}
                    />
                </div>
                <div
                    className={
                        COL_S + ' text-[14px] font-mono bg-neutral-50/30'
                    }
                >
                    {String(originalIndex + 1).padStart(2, '0')}
                </div>

                <FormField
                    name={`rows.${originalIndex}.customer.name`}
                    render={({ field: f, fieldState }) => (
                        <FastCell
                            _value={f.value}
                            _isInvalid={!!fieldState.error}
                            className={COL_FLEX_2}
                        >
                            <Input
                                {...f}
                                onBlur={() => {
                                    f.onBlur();
                                    validateRow(originalIndex);
                                }}
                                value={f.value ?? ''}
                                className={cn(
                                    'border-0 rounded-none h-full focus-visible:ring-inset bg-transparent placeholder:text-destructive',
                                    fieldState.error && 'bg-cinnabar-50'
                                )}
                                placeholder={
                                    fieldState.error?.message ||
                                    t('shipments.bulk.placeholders.name')
                                }
                            />
                        </FastCell>
                    )}
                />

                <FormField
                    name={`rows.${originalIndex}.customer.primaryPhone`}
                    render={({ field: f, fieldState }) => (
                        <FastCell
                            _value={f.value}
                            _isInvalid={!!fieldState.error}
                            className={COL_FLEX_1}
                        >
                            <IMaskInput
                                {...f}
                                mask="000 000 000[0]"
                                unmask
                                onBlur={() => {
                                    f.onBlur();
                                    validateRow(originalIndex);
                                }}
                                className={cn(
                                    'w-full h-full px-3 text-sm focus:outline-none bg-transparent placeholder:text-destructive',
                                    fieldState.error && 'bg-cinnabar-50'
                                )}
                                onAccept={(value: string) =>
                                    f.onChange(value.replace(/\D/g, ''))
                                }
                                placeholder={
                                    fieldState.error?.message ||
                                    t('shipments.bulk.placeholders.phone')
                                }
                            />
                        </FastCell>
                    )}
                />

                <FormField
                    name={`rows.${originalIndex}.address.line`}
                    render={({ field: f, fieldState }) => (
                        <FastCell
                            _value={f.value}
                            _isInvalid={!!fieldState.error}
                            className={COL_FLEX_2}
                        >
                            <Input
                                {...f}
                                onBlur={() => {
                                    f.onBlur();
                                    validateRow(originalIndex);
                                }}
                                value={f.value ?? ''}
                                className={cn(
                                    'border-0 rounded-none h-full bg-transparent placeholder:text-destructive',
                                    fieldState.error && 'bg-cinnabar-50'
                                )}
                                placeholder={
                                    fieldState.error?.message ||
                                    t('shipments.bulk.placeholders.address')
                                }
                            />
                        </FastCell>
                    )}
                />

                <div className={COL_M}>
                    <FormField
                        name={`rows.${originalIndex}.item.qty`}
                        render={({ field: f, fieldState }) => (
                            <IMaskInput
                                {...f}
                                mask={Number}
                                onBlur={() => {
                                    f.onBlur();
                                    validateRow(originalIndex);
                                }}
                                value={String(f.value ?? '')}
                                onAccept={(v) => f.onChange(v)}
                                className={cn(
                                    'w-full h-full text-center text-sm focus:outline-none bg-transparent placeholder:text-destructive',
                                    fieldState.error && 'bg-cinnabar-50'
                                )}
                                placeholder={t(
                                    'shipments.bulk.placeholders.qty'
                                )}
                            />
                        )}
                    />
                </div>

                <div className={COL_L}>
                    <FormField
                        name={`rows.${originalIndex}.taskType`}
                        render={({ field: f, fieldState }) => (
                            <Select
                                onValueChange={(v) => {
                                    f.onChange(v);
                                    validateRow(originalIndex);
                                }}
                                value={f.value}
                            >
                                <FormControl>
                                    <SelectTrigger
                                        className={cn(
                                            'border-0 w-full h-full rounded-none focus:ring-0',
                                            fieldState.error &&
                                                'text-destructive bg-cinnabar-50'
                                        )}
                                    >
                                        <SelectValue
                                            placeholder={t(
                                                'shipments.bulk.placeholders.select_type'
                                            )}
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={TaskType.DROP_OFF}>
                                        {t(
                                            'shipments.list_page.table.drop_off'
                                        )}
                                    </SelectItem>
                                    <SelectItem value={TaskType.PICK_UP}>
                                        {t('shipments.list_page.table.pick_up')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className={COL_WAREHOUSE}>
                    <FormField
                        name={`rows.${originalIndex}.warehouseId`}
                        render={({ field: f, fieldState }) => (
                            <Select
                                disabled={!isAdmin}
                                onValueChange={(v) => {
                                    f.onChange(v);
                                    validateRow(originalIndex);
                                }}
                                value={f.value}
                            >
                                <FormControl>
                                    <SelectTrigger
                                        className={cn(
                                            'border-0 w-full h-full rounded-none focus:ring-0',
                                            fieldState.error &&
                                                'text-destructive bg-cinnabar-50'
                                        )}
                                    >
                                        <SelectValue
                                            placeholder={t(
                                                'shipments.bulk.placeholders.warehouse'
                                            )}
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {warehouses.map((w) => (
                                        <SelectItem key={w.id} value={w.id}>
                                            {w.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <FormField
                    name={`rows.${originalIndex}.item.amount`}
                    render={({ field: f, fieldState }) => (
                        <FastCell
                            _value={f.value}
                            _isInvalid={!!fieldState.error}
                            className={COL_FLEX_1}
                        >
                            <IMaskInput
                                {...f}
                                mask={Number}
                                onBlur={() => {
                                    f.onBlur();
                                    validateRow(originalIndex);
                                }}
                                value={String(f.value ?? '')}
                                onAccept={(v) => f.onChange(v)}
                                className={cn(
                                    'w-full h-full px-3 text-sm focus:outline-none bg-transparent placeholder:text-destructive',
                                    fieldState.error && 'bg-cinnabar-50'
                                )}
                                placeholder={
                                    fieldState.error?.message ||
                                    t('shipments.bulk.placeholders.amount')
                                }
                            />
                        </FastCell>
                    )}
                />

                <div className={COL_L}>
                    <FormField
                        name={`rows.${originalIndex}.item.currencyType`}
                        render={({ field: f, fieldState }) => (
                            <Select
                                onValueChange={(v) => {
                                    f.onChange(v);
                                    validateRow(originalIndex);
                                }}
                                value={f.value}
                            >
                                <FormControl>
                                    <SelectTrigger
                                        className={cn(
                                            'border-0 w-full h-full rounded-none focus:ring-0',
                                            fieldState.error &&
                                                'text-destructive bg-cinnabar-50'
                                        )}
                                    >
                                        <SelectValue
                                            placeholder={t(
                                                'shipments.bulk.placeholders.currency'
                                            )}
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={CurrencyType.RIEL}>
                                        {t(
                                            'shipments.form.sections.delivery.riel'
                                        )}
                                    </SelectItem>
                                    <SelectItem value={CurrencyType.DOLLAR}>
                                        {t(
                                            'shipments.form.sections.delivery.dollar'
                                        )}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <FormField
                    name={`rows.${originalIndex}.note`}
                    render={({ field: f }) => (
                        <div className={COL_FLEX_LAST}>
                            <Input
                                {...f}
                                onBlur={() => {
                                    f.onBlur();
                                    validateRow(originalIndex);
                                }}
                                value={f.value ?? ''}
                                className="border-0 rounded-none h-full bg-transparent"
                                placeholder={t(
                                    'shipments.bulk.placeholders.retailer_note'
                                )}
                            />
                        </div>
                    )}
                />
            </div>
        );
    }
);
ShipmentRow.displayName = 'ShipmentRow';

interface BulkImportResponse {
    data?: {
        totalReceived: number;
        successCount: number;
        failureCount: number;
    } | null;
}

interface FormContentProps {
    isImporting: boolean;
    summaryDialog: BulkImportResponse | null;
    setSummaryDialog: (data: BulkImportResponse | null) => void;
}

export function BulkImportDataTable() {
    const { t } = useTranslation();
    const [initialData] = useState<ShipmentImportData[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('bulkImportData');
            if (stored) {
                try {
                    return (JSON.parse(stored) as ShipmentImportData[]).slice(
                        0,
                        100
                    );
                } catch {
                    return [];
                }
            }
        }
        return [];
    });

    const { mutate: importShipment, isPending: isImporting } =
        useImportShipments();
    const [summaryDialog, setSummaryDialog] =
        useState<BulkImportResponse | null>(null);

    const { data: profile } = useGetUserProfile();
    const { data: warehousesData } = useWarehouses({
        top: 999,
        page: 1,
        status: String(WarehouseStatus.Active)
    });

    const warehouses = useMemo(
        () => warehousesData?.value || [],
        [warehousesData]
    );
    const isAdmin = profile?.isAdmin ?? false;

    const handleSubmit = (values: FormValues) => {
        if (!values.rows.length) {
            toast.error(t('shipments.bulk.messages.no_data'));
            return;
        }

        importShipment(values.rows, {
            onSuccess: (res: BulkImportResponse) => {
                if (res?.data) setSummaryDialog(res);
                toast.custom((id) => (
                    <Toast
                        toastId={id}
                        status="success"
                        description={t(
                            'shipments.bulk.messages.create_success'
                        )}
                    />
                ));
                sessionStorage.removeItem('bulkImportData');
            },
            onError: (error: Error) => {
                const err = error as AxiosError<{ error: { message: string } }>;
                const msg =
                    err?.response?.data?.error?.message ||
                    t('shipments.bulk.messages.create_error');
                toast.custom((id) => (
                    <Toast toastId={id} status="failed" description={msg} />
                ));
            }
        });
    };

    /**
     * 🚀 FIX: useMemo for defaultValues
     * Prevents BaseForm from resetting the table state when isImporting changes.
     */
    const memoizedDefaultValues = useMemo(
        () => ({
            searchText: '',
            rows: initialData.map((row) => ({
                ...row,
                warehouseId: row.warehouseId || profile?.warehouse?.id || ''
            }))
        }),
        [initialData, profile]
    );

    return (
        <BaseForm
            schema={shipmentSchema}
            defaultValues={memoizedDefaultValues}
            onValid={handleSubmit}
            onInValid={(e) => console.log(e)}
            defaultTrigger={false}
            mode="onChange"
            reValidateMode="onChange"
        >
            <div className="px-4 flex flex-col h-full">
                <div className="pt-4">
                    <Button
                        type="button"
                        onClick={() => window.history.back()}
                        variant="ghost"
                        className="cursor-pointer flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />{' '}
                        {t('shipments.bulk.actions.back')}
                    </Button>
                </div>
                <FormContent
                    isImporting={isImporting}
                    summaryDialog={summaryDialog}
                    setSummaryDialog={setSummaryDialog}
                    warehouses={warehouses}
                    profile={profile}
                    isAdmin={isAdmin}
                />
            </div>
        </BaseForm>
    );
}

const FormContent = ({
    isImporting,
    summaryDialog,
    setSummaryDialog,
    warehouses,
    profile,
    isAdmin
}: FormContentProps & {
    warehouses: Warehouse[];
    profile?: UserResponseData;
    isAdmin: boolean;
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { control, trigger, setValue } = useFormContext<FormValues>();
    const { fields, prepend, remove } = useFieldArray({
        control,
        name: 'rows'
    });

    const [isPending, startTransition] = useTransition();
    const [isReady, setIsReady] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showLimitDialog, setShowLimitDialog] = useState(false);

    // 🚀 Triple-Deferred Strategy to decouple UI priority
    const searchText = useWatch({ control, name: 'searchText' }) || '';
    const deferredSearch = useDeferredValue(searchText);
    const deferredFields = useDeferredValue(fields);
    const deferredSelectedIds = useDeferredValue(selectedIds);

    const isBackgroundWork = searchText !== deferredSearch || isPending;
    const disabledActions = selectedIds.size === 0 || isPending;

    useEffect(() => {
        if (isReady || !warehouses.length || !profile) return;
        setIsReady(true);
        void trigger('rows');
    }, [trigger, warehouses.length, profile, isReady]);

    // 🎯 Filter fields while preserving ORIGINAL indices
    const visibleFields = useMemo(() => {
        const search = deferredSearch.toLowerCase();
        return deferredFields
            .map((field, index) => ({ field, originalIndex: index }))
            .filter(({ field }) => {
                if (!search) return true;
                const r = field as unknown as ShipmentImportData;
                return (
                    r.customer?.name?.toLowerCase().includes(search) ||
                    r.customer?.primaryPhone?.toLowerCase().includes(search)
                );
            });
    }, [deferredFields, deferredSearch]);

    const validateRow = useCallback(
        (idx: number) => {
            void trigger(`rows.${idx}`);
        },
        [trigger]
    );

    const handleToggleRow = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleToggleSelectAll = (checked: boolean) => {
        startTransition(() => {
            if (checked) setSelectedIds(new Set(fields.map((f) => f.id)));
            else setSelectedIds(new Set());
        });
    };

    const handleRemoveSelected = () => {
        startTransition(() => {
            const indicesToRemove = fields
                .map((f, i) => (selectedIds.has(f.id) ? i : -1))
                .filter((i) => i !== -1)
                .sort((a, b) => b - a);

            if (indicesToRemove.length > 0) {
                remove(indicesToRemove);
                setSelectedIds(new Set());
            }
        });
    };

    const handleAddRow = () => {
        if (fields.length >= 100) return setShowLimitDialog(true);
        startTransition(() => {
            prepend({
                customer: { name: '', primaryPhone: '' },
                address: { line: '' },
                item: { qty: 1, amount: 0, currencyType: CurrencyType.RIEL },
                taskType: TaskType.DROP_OFF,
                warehouseId: profile?.warehouse?.id || '',
                note: ''
            });
        });
    };

    return (
        <>
            <div className="sticky top-0 bg-neutral-50 z-20">
                <PageHeader
                    title={t('shipments.bulk.title')}
                    subtitle={t('shipments.bulk.subtitle')}
                    disableDate
                    showCreateButton={false}
                    actionButton={
                        <div className="flex gap-2.5 items-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 border border-mdisabled text-micon-primary hover:bg-neutral-50"
                                onClick={() => {
                                    const { URL, FILENAME } =
                                        DOWNLOAD_ASSETS.SHIPMENT_TEMPLATE;
                                    const link = document.createElement('a');
                                    link.href = URL;
                                    link.download = FILENAME;
                                    link.click();
                                }}
                            >
                                <LucideDownload className="h-4 w-4" />
                            </Button>
                            <Button
                                type="submit"
                                disabled={isImporting || isPending}
                                className="h-11 px-6 gap-2 bg-primary hover:bg-hover text-white"
                            >
                                {isImporting || isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <PlusIcon className="w-4 h-4" />
                                )}{' '}
                                {t('shipments.bulk.actions.create')}
                            </Button>
                        </div>
                    }
                    filterItem={
                        <>
                            <div className="flex gap-4 items-center border-r pr-2">
                                <Button
                                    type="button"
                                    onClick={handleAddRow}
                                    variant="outline"
                                    className="gap-2"
                                    disabled={isPending}
                                >
                                    <PlusIcon className="w-4 h-4" />{' '}
                                    {t('shipments.bulk.actions.add_row')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleRemoveSelected}
                                    variant="outline"
                                    className="gap-2"
                                    disabled={
                                        selectedIds.size === 0 || isPending
                                    }
                                >
                                    <MinusIcon className="w-4 h-4" />{' '}
                                    {t('shipments.bulk.actions.remove_row')}
                                </Button>
                                {isBackgroundWork && (
                                    <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Select
                                    disabled={!isAdmin || disabledActions}
                                    value={
                                        !isAdmin
                                            ? profile?.warehouse?.id
                                            : undefined
                                    }
                                    onValueChange={(v) => {
                                        if (!isAdmin) return;
                                        startTransition(() => {
                                            fields.forEach((f, i) => {
                                                if (selectedIds.has(f.id)) {
                                                    setValue(
                                                        `rows.${i}.warehouseId`,
                                                        v,
                                                        { shouldValidate: true }
                                                    );
                                                }
                                            });
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-44 h-10">
                                        <SelectValue
                                            placeholder={t(
                                                'shipments.bulk.actions.set_warehouse'
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((w) => (
                                            <SelectItem key={w.id} value={w.id}>
                                                {w.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    }
                />

                <div className="flex bg-white border text-[12px] uppercase h-11 items-center w-full font-bold mt-4 rounded-t-md shadow-sm">
                    <div className={COL_S}>
                        <Checkbox
                            checked={
                                selectedIds.size === fields.length &&
                                fields.length > 0
                            }
                            onCheckedChange={handleToggleSelectAll}
                        />
                    </div>
                    <div className={COL_S}>{t('shipments.bulk.table.no')}</div>
                    <div className={COL_FLEX_2 + ' px-3'}>
                        {t('shipments.bulk.table.customer_name')} &nbsp;
                        <span className="text-destructive">*</span>
                    </div>
                    <div className={COL_FLEX_1 + ' px-3'}>
                        {t('shipments.bulk.table.phone')} &nbsp;
                        <span className="text-destructive">*</span>
                    </div>
                    <div className={COL_FLEX_2 + ' px-3'}>
                        {t('shipments.bulk.table.delivery_address')} &nbsp;
                        <span className="text-destructive">*</span>
                    </div>
                    <div className={COL_M + ' px-3 text-center'}>
                        {t('shipments.bulk.table.parcel_qty')} &nbsp;
                        <span className="text-destructive">*</span>
                    </div>
                    <div className={COL_L + ' px-3 text-center'}>
                        {t('shipments.bulk.table.task_type')} &nbsp;
                        <span className="text-destructive">*</span>
                    </div>
                    <div className={COL_WAREHOUSE + ' px-3 text-center'}>
                        {t('shipments.bulk.table.warehouse')} &nbsp;
                        <span className="text-destructive">*</span>
                    </div>
                    <div className={COL_FLEX_1 + ' px-3'}>
                        {t('shipments.bulk.table.amount')}
                    </div>
                    <div className={COL_L + ' px-3 text-center'}>
                        {t('shipments.bulk.table.currency')} &nbsp;
                        <span className="text-destructive">*</span>
                    </div>
                    <div className={COL_FLEX_LAST + ' px-3'}>
                        {t('shipments.bulk.table.retailer_note')}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col border-x border-b rounded-b-md bg-white mb-8 overflow-hidden min-h-100">
                <div
                    className={cn(
                        'flex-1 overflow-y-auto transition-opacity duration-200',
                        isBackgroundWork && 'opacity-60'
                    )}
                >
                    {!isReady ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p>{t('shipments.bulk.loading.preparing')}</p>
                        </div>
                    ) : visibleFields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
                            <SearchX className="w-10 h-10 opacity-20" />
                            <p>
                                {t('shipments.bulk.empty_search', {
                                    search: deferredSearch
                                })}
                            </p>
                        </div>
                    ) : (
                        visibleFields.map(({ field, originalIndex }) => (
                            <ShipmentRow
                                key={field.id}
                                id={field.id}
                                originalIndex={originalIndex}
                                isSelected={deferredSelectedIds.has(field.id)}
                                onToggle={handleToggleRow}
                                validateRow={validateRow}
                                warehouses={warehouses}
                                isAdmin={isAdmin}
                            />
                        ))
                    )}
                </div>
            </div>

            {summaryDialog && (
                <BulkImportSummary
                    isOpen={!!summaryDialog}
                    onOpenChange={(o) => {
                        if (!o) {
                            setSummaryDialog(null);
                            router.push('/dashboard/shipments');
                        }
                    }}
                    data={summaryDialog.data}
                />
            )}

            <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="bg-amber-100 p-3 rounded-full">
                                <AlertTriangle className="text-amber-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center">
                            {t('shipments.bulk.limit_dialog.title')}
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            {t('shipments.bulk.limit_dialog.desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setShowLimitDialog(false)}
                            variant="warning"
                            className="w-full"
                        >
                            {t('shipments.bulk.actions.understood')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default function BulkImportPage() {
    const { t } = useTranslation();
    return (
        <Suspense
            fallback={
                <div className="p-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto animate-spin" />
                    <p className="mt-2 text-muted-foreground">
                        {t('shipments.bulk.loading.loading_page')}
                    </p>
                </div>
            }
        >
            <BulkImportDataTable />
        </Suspense>
    );
}
