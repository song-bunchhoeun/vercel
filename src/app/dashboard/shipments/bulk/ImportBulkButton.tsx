'use client';

import {
    DOWNLOAD_ASSETS,
    ERROR_TYPE,
    ShipmentImportData
} from '@/app/dashboard/shipments/bulk/bulk.form.service';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ImportBulkButtonProps {
    onImportSuccess?: (data: ShipmentImportData[]) => void;
    className?: string;
    buttonText?: string;
    showIcon?: boolean;
}

export default function ImportBulkButton({
    onImportSuccess,
    className = 'w-36 h-11 border-mdisabled border text-micon-primary hover:text-hover hover:bg-accent cursor-pointer active:bg-accent2',
    showIcon = true
}: ImportBulkButtonProps) {
    const { t } = useTranslation();
    const [errorType, setErrorType] = useState<
        ERROR_TYPE | 'LIMIT_EXCEEDED' | null
    >(null);
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const workerRef = useRef<Worker | null>(null);

    // Initialize Worker on mount
    useEffect(() => {
        workerRef.current = new Worker(
            new URL('./excel-import.worker.ts', import.meta.url)
        );

        workerRef.current.onmessage = (event) => {
            const { type, payload } = event.data;
            setIsParsing(false);

            if (type === 'SUCCESS') {
                if (payload.length > 0) {
                    onImportSuccess?.(payload);
                } else {
                    setErrorType(ERROR_TYPE.NO_DATA);
                }
            } else if (type === 'ERROR') {
                setErrorType(payload); // INVALID_FILE or LIMIT_EXCEEDED
            }
        };

        return () => workerRef.current?.terminate();
    }, [onImportSuccess]);

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file || !workerRef.current) return;

        const validExtensions = ['.xls', '.xlsx'];
        const fileExtension = file.name
            .substring(file.name.lastIndexOf('.'))
            .toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            setErrorType(ERROR_TYPE.INVALID_FILE);
            event.target.value = '';
            return;
        }

        setIsParsing(true);
        workerRef.current.postMessage({ file });
        event.target.value = '';
    };

    const handleDownloadTemplate = () => {
        const { URL, FILENAME } = DOWNLOAD_ASSETS.SHIPMENT_TEMPLATE;
        const link = document.createElement('a');
        link.href = URL;
        link.download = FILENAME;
        link.click();
    };

    return (
        <>
            <input
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />
            <Button
                type="button"
                variant="ghost"
                disabled={isParsing}
                onClick={() => fileInputRef.current?.click()}
                className={className}
            >
                <div className="flex items-center justify-center gap-2">
                    {isParsing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        showIcon && (
                            <Image
                                src="/icons/import_bulk.png"
                                alt="Import"
                                width={20}
                                height={20}
                            />
                        )
                    )}
                    {isParsing
                        ? t('shipments.bulk.loading.parsing')
                        : t('common.import_bulk.button')}
                </div>
            </Button>

            <Dialog
                open={!!errorType}
                onOpenChange={(open) => !open && setErrorType(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            {errorType === 'LIMIT_EXCEEDED' ? (
                                <div className="rounded-full bg-amber-100 p-3">
                                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                                </div>
                            ) : (
                                <div className="rounded-full bg-destructive/10 p-3">
                                    <AlertCircle className="h-6 w-6 text-destructive" />
                                </div>
                            )}
                        </div>
                        <DialogTitle className="text-center">
                            {errorType === ERROR_TYPE.INVALID_FILE
                                ? t('common.import_bulk.dialog.title')
                                : errorType === 'LIMIT_EXCEEDED'
                                  ? t('shipments.bulk.limit_dialog.title')
                                  : t('common.import_bulk.dialog.no_data')}
                        </DialogTitle>
                        <DialogDescription className="text-center mt-2 text-secondary-foreground">
                            {errorType === ERROR_TYPE.INVALID_FILE && (
                                <>
                                    {t(
                                        'common.import_bulk.dialog.description',
                                        {
                                            template: (
                                                <button
                                                    key="template-btn"
                                                    onClick={
                                                        handleDownloadTemplate
                                                    }
                                                    className="hover:text-primary underline font-medium cursor-pointer"
                                                >
                                                    {t(
                                                        'common.import_bulk.dialog.template'
                                                    )}
                                                </button>
                                            )
                                        }
                                    )}
                                </>
                            )}
                            {errorType === 'LIMIT_EXCEEDED' &&
                                t('shipments.bulk.limit_dialog.import_desc')}
                            {errorType === ERROR_TYPE.NO_DATA &&
                                t(
                                    'common.import_bulk.dialog.invalid_description'
                                )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setErrorType(null)}
                            variant={
                                errorType === 'LIMIT_EXCEEDED'
                                    ? 'warning'
                                    : 'destructive'
                            }
                            className="w-full cursor-pointer"
                        >
                            {t('common.import_bulk.dialog.close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
