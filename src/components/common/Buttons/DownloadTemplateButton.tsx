import { DOWNLOAD_ASSETS } from '@/app/dashboard/shipments/bulk/bulk.form.service';
import { Button } from '@/components/ui/button';
import { LucideDownload } from 'lucide-react';
import Link from 'next/link';

export default function DownloadTemplateButton() {
    const { URL, FILENAME } = DOWNLOAD_ASSETS.SHIPMENT_TEMPLATE;
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 border-mdisabled border text-micon-primary hover:text-hover hover:bg-accent cursor-pointer active:bg-accent2"
            asChild
        >
            <Link href={URL} download={FILENAME}>
                <LucideDownload className="h-4 w-4" />
            </Link>
        </Button>
    );
}
