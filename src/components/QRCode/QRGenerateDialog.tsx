import {
    BaseViewDetailsDialogContent,
    BaseViewDialog
} from '@/components/BaseForm/BaseViewDialog';
import { Copy, Download } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as QRCode from 'qrcode';
import Image from 'next/image';
import { DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';

interface WarehouseViewDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    qrType: string;
    value: string;
    title?: string;
}

export default function QRGeneratDialog({
    open,
    onOpenChange,
    qrType,
    value,
    title
}: WarehouseViewDetailsProps) {
    const [qrUrl, setQrUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const copyRef = useRef<HTMLButtonElement>(null);
    const [openCopy, setOpenCopy] = useState(false);

    useEffect(() => {
        let active = true;

        if (value) {
            QRCode.toDataURL(value, { width: 256 })
                .then((url) => active && setQrUrl(url))
                .catch(console.error);
        }

        setCopied(false);

        return () => {
            active = false;
        };
    }, [value]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);

            // Force tooltip to open
            setOpenCopy(true);

            // Keep tooltip shown for 1 second
            setTimeout(() => {
                setCopied(false); // reset label
                setOpenCopy(false); // close tooltip
            }, 1500);

            // keep focus on the button after re-render
            requestAnimationFrame(() => {
                copyRef?.current?.focus();
            });
        } catch (err) {
            console.error('Copy failed:', err);
        }
    }, [value, copyRef]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = 'driver-app-qrcode.png';
        link.click();
    };

    const dialogContent: BaseViewDetailsDialogContent = {
        title: title ?? 'Log In QR Code',
        text: 'Scan',
        actions: (
            <div className="flex justify-between w-full items-center">
                <div className="flex items-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                onClick={handleDownload}
                                className="text-primary hover:text-hover hover:bg-accent cursor-pointer active:bg-accent2 bg-white p-2 rounded-md"
                            >
                                <Download
                                    size={20}
                                    strokeWidth={1.5}
                                    className="text-primary"
                                />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Download</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <DialogClose asChild>
                    <Button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer text-sm sm:text-base px-3 sm:px-4"
                    >
                        Close
                    </Button>
                </DialogClose>
            </div>
        )
    };

    return (
        <BaseViewDialog
            isOpen={open}
            onOpenChange={onOpenChange}
            dialogContent={dialogContent}
        >
            <p className="text-sm font-normal text-gray-600 text-center mb-0">
                {qrType}
            </p>
            <div className="mb-0">
                {qrUrl && (
                    <Link
                        href={value}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        <Image
                            src={qrUrl}
                            alt="QR Code"
                            className="mx-auto w-70 h-70 "
                            width={72}
                            height={72}
                        />
                    </Link>
                )}
            </div>

            <div className="flex items-center w-full">
                <p className="flex border p-2 rounded-md break-all mr-4">
                    {value}
                </p>
                <Tooltip open={openCopy} onOpenChange={setOpenCopy}>
                    <TooltipTrigger asChild>
                        <Button
                            ref={copyRef}
                            type="button"
                            size="icon"
                            onClick={handleCopy}
                            className="text-primary hover:text-hover hover:bg-accent cursor-pointer active:bg-accent2 bg-white"
                        >
                            <Copy
                                size={20}
                                strokeWidth={1.5}
                                className="text-primary"
                            />
                        </Button>
                    </TooltipTrigger>

                    <TooltipContent>
                        <p>{copied ? 'Copied' : 'Copy'}</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </BaseViewDialog>
    );
}
