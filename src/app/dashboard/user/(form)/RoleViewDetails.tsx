import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CircleCheck } from 'lucide-react';

interface BaseDialogViewDetailsProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

interface AccessItemProps {
    title: string;
    description: string;
}

const AccessItem = ({ title, description }: AccessItemProps) => (
    <div className="flex items-start gap-3 py-2">
        <CircleCheck className="h-5 w-5 fill-hover text-white mt-0.5 flex-shrink-0" />
        <div>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs opacity-80 mt-0.5">{description}</p>
        </div>
    </div>
);

interface RoleAccessPanelProps {
    roleName: string;
    accessLevel: string;
    items: AccessItemProps[];
}

const RoleAccessPanel = ({
    roleName,
    accessLevel,
    items
}: RoleAccessPanelProps) => (
    <div className="flex-1 p-4 rounded-xl border bg-white">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-md text-primary">{roleName}</h3>
            <span className="text-sm font-medium text-gray-500 ml-2 mt-1 whitespace-nowrap">
                {accessLevel}
            </span>
        </div>
        <Separator className="my-4" />
        <div className="space-y-1">
            {items.map((item, index) => (
                <AccessItem
                    key={index}
                    title={item.title}
                    description={item.description}
                />
            ))}
        </div>
    </div>
);

// Main component
export function RoleViewDetails({
    isOpen,
    onOpenChange
}: BaseDialogViewDetailsProps) {
    const adminAccessItems: AccessItemProps[] = [
        {
            title: 'Shipment',
            description: 'Create, edit, view, and delete Shipment.'
        },
        { title: 'Job Dispatch', description: 'Manage dispatch operations.' },
        {
            title: 'Driver & Fleet',
            description: 'Full control over vehicle and driver data.'
        },
        { title: 'Customer', description: 'Manage all customer records.' },
        {
            title: 'User',
            description: 'Add, edit, activate, or deactivate team members.'
        },
        {
            title: 'Warehouse',
            description: 'Add/edit warehouses and manage inventory locations.'
        }
    ];

    const userAccessItems: AccessItemProps[] = [
        { title: 'Shipment', description: 'Full Shipment management access.' },
        {
            title: 'Job Dispatch',
            description: 'Manage dispatch-related tasks.'
        },
        {
            title: 'Driver & Fleet',
            description: 'View and manage assigned vehicles/drivers.'
        },
        {
            title: 'Customer',
            description: 'View and manage customer information.'
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95%] sm:max-w-[700px] md:max-w-[900px] p-4">
                <DialogHeader>
                    <div className="flex flex-wrap items-center gap-2">
                        <DialogTitle className="text-base sm:text-lg">
                            About Role
                        </DialogTitle>
                        <DialogDescription className="text-blue-500 bg-blue-100 px-2.5 py-0.5 rounded-2xl text-xs sm:text-sm">
                            View
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="flex flex-col lg:flex-row gap-2.5">
                    <RoleAccessPanel
                        roleName="Admin"
                        accessLevel="Unlimited Access"
                        items={adminAccessItems}
                    />
                    <RoleAccessPanel
                        roleName="User"
                        accessLevel="Limited"
                        items={userAccessItems}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
