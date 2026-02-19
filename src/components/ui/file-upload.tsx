'use client';

import { WarehouseDocument } from '@/app/dashboard/warehouse/(form)/warehouse.form.service';
import { cn } from '@/lib/utils';
import { Images, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Dropzone, { FileRejection } from 'react-dropzone';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormMessage } from './form';
import { Input } from './input';

interface PreviewItem {
    id?: number | string;
    name: string;
    url: string; // can be blob: URL or remote
    isExisting: boolean;
    file?: File;
}

interface BaseFileUploadProps {
    disabled?: boolean;
}

const BaseFileUpload = ({ disabled }: BaseFileUploadProps) => {
    const { control, setValue, setError, clearErrors } = useFormContext();

    // RHF field watchers
    const files = useWatch({ control, name: 'files' }) as File[] | undefined;
    const documents = useWatch({ control, name: 'documents' }) as
        | WarehouseDocument[]
        | undefined;

    const [filePreviews, setFilePreviews] = useState<PreviewItem[]>([]);

    // Generate object URLs for new files
    useEffect(() => {
        if (!files || files.length === 0) {
            setFilePreviews([]);
            return;
        }

        const mapped = files.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
            file,
            isExisting: false
        }));

        setFilePreviews(mapped);

        return () => {
            mapped.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [files]);

    // 🧠 Merge both sources into one preview array
    const mergedPreviews = useMemo<PreviewItem[]>(() => {
        const existingDocs =
            documents?.map((d) => ({
                id: d.id,
                name: d.name,
                url: d.url,
                isExisting: true
            })) || [];
        return [...existingDocs, ...filePreviews];
    }, [documents, filePreviews]);

    // 📥 Handle file drop
    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            if (acceptedFiles.length > 0) clearErrors('files');

            if (rejectedFiles.length > 0) {
                const firstError = rejectedFiles[0].errors[0];

                let customMessage = firstError.message;

                switch (firstError.code) {
                    case 'file-too-large':
                        customMessage = 'File is larger than 5MB';
                        break;
                    case 'too-many-files':
                        customMessage = 'You can only upload up to 3 files';
                        break;
                    case 'file-invalid-type':
                        customMessage =
                            'Invalid file type. Please upload image JPG or PNG';
                        break;
                }

                setError('files', { type: 'manual', message: customMessage });
                return;
            }

            const updated = [...(files || []), ...acceptedFiles].slice(0, 3);
            setValue('files', updated, { shouldValidate: true });
        },
        [files, setValue, setError, clearErrors]
    );

    // 🗑 Remove file or document (based on type)
    const removeItem = (index: number, isExisting: boolean) => {
        if (isExisting) {
            const updated = (documents || []).filter((_, i) => i !== index);
            setValue('documents', updated, { shouldValidate: true });
        } else {
            const newFileIndex = index - (documents?.length || 0);
            const removed = filePreviews[newFileIndex];
            if (removed) URL.revokeObjectURL(removed.url);
            const updated = (files || []).filter((_, i) => i !== newFileIndex);
            setValue('files', updated, { shouldValidate: true });
        }
    };

    return (
        <>
            {/* ========== DROPZONE (FILES INPUT) ========== */}
            <FormField
                control={control}
                name="files"
                render={() => (
                    <FormItem>
                        <FormControl>
                            <Dropzone
                                disabled={disabled}
                                onDrop={onDrop}
                                accept={{
                                    'image/jpeg': ['.jpg', '.jpeg'],
                                    'image/png': ['.png']
                                }}
                                maxFiles={3}
                                maxSize={5 * 1024 * 1024}
                            >
                                {({ getRootProps, getInputProps }) => (
                                    <section>
                                        <div
                                            {...getRootProps()}
                                            className={cn(
                                                'p-4 border-2 border-dashed border-gray-300 rounded-md bg-white flex justify-center',
                                                !disabled && 'cursor-pointer',
                                                disabled && ' opacity-50'
                                            )}
                                        >
                                            <input
                                                disabled={disabled}
                                                {...getInputProps()}
                                            />
                                            <div className="max-w-sm text-center flex flex-col items-center gap-2">
                                                <Images
                                                    size={40}
                                                    strokeWidth={1}
                                                />
                                                <p>
                                                    <span className="underline text-primary font-semibold">
                                                        Click to upload
                                                    </span>
                                                    {''} or drag and drop PNG,
                                                    JPG
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Max 3 files • Max 5MB each
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </Dropzone>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Hidden documents field (RHF awareness) */}
            <FormField
                control={control}
                name="documents"
                render={({ field }) => (
                    <FormItem className="hidden">
                        <FormControl>
                            <Input
                                type="hidden"
                                value={JSON.stringify(field.value || [])}
                                readOnly
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            {/* ========== COMBINED PREVIEW ========== */}
            {mergedPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-12 gap-2">
                    {mergedPreviews.map((item, index) => (
                        <div
                            key={item.name + index}
                            className="border rounded-md p-2 col-span-4 border-gray-200 bg-gray-50"
                        >
                            <div
                                className={cn(
                                    'flex items-start gap-3 mb-2',
                                    disabled && ' opacity-50'
                                )}
                            >
                                <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-sm">
                                    <Image
                                        src={item.url}
                                        alt={item.name}
                                        fill
                                        className="object-cover border rounded-sm"
                                    />
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium text-sm truncate">
                                        {item.name}
                                    </p>
                                    {!item.isExisting && item.file && (
                                        <p className="text-xs text-gray-500">
                                            {(
                                                item.file.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{' '}
                                            MB
                                        </p>
                                    )}
                                </div>

                                <button
                                    disabled={disabled}
                                    type="button"
                                    onClick={() =>
                                        removeItem(index, item.isExisting)
                                    }
                                    className={cn(
                                        'text-sm text-neutral-400',
                                        !disabled &&
                                            'hover:text-red-500 cursor-pointer'
                                    )}
                                >
                                    <X strokeWidth={1.5} size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default BaseFileUpload;
