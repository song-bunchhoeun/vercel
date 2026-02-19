'use client';

import { Job } from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import { AssignPayload } from '@/app/dashboard/job-dispatch/(form)/JobDriverConfirmation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AssignDriverDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobs: Job[];
    shipmentIds: string[];
    onAssign: (payload: AssignPayload) => void;
    onReset: () => void;
}

export default function SelectChangeDriver({
    open,
    onOpenChange,
    jobs,
    shipmentIds,
    onAssign,
    onReset
}: AssignDriverDialogProps) {
    const [selectedJob, setSelectedJob] = useState<{
        jobId: string;
        driverId: string;
    } | null>(null);

    const handleAssign = () => {
        if (!selectedJob || shipmentIds.length === 0) return;

        onAssign({
            jobId: selectedJob.jobId,
            driverId: selectedJob.driverId,
            shipmentIds
        });

        onReset();
        onOpenChange(false);
        setSelectedJob(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-none md:max-w-[925px] p-6">
                <DialogHeader>
                    <DialogTitle>Assign Driver</DialogTitle>
                    <DialogDescription>
                        Select a driver for selected shipments
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {jobs.map((job) => {
                        const driver = job.driver;
                        const isSelected = selectedJob?.jobId === job.jobId;

                        return (
                            <Card
                                key={driver.driverId}
                                onClick={() =>
                                    setSelectedJob({
                                        jobId: job.jobId,
                                        driverId: driver.driverId
                                    })
                                }
                                className={cn(
                                    'cursor-pointer border transition-colors',
                                    isSelected
                                        ? 'border-primary'
                                        : 'border-gray-300'
                                )}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between">
                                        <div className="flex gap-2">
                                            <Avatar>
                                                <AvatarImage
                                                    src={
                                                        driver.profileUrl ||
                                                        '/driver-profile.svg'
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {driver.name}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <p className="font-semibold">
                                                    {driver.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {driver.primaryPhone}
                                                </p>
                                            </div>
                                        </div>

                                        <Checkbox checked={isSelected} />
                                    </div>

                                    <p className="text-xs bg-gray-100 mt-2 p-2 rounded">
                                        Zone {driver.zone.name}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!selectedJob || shipmentIds.length === 0}
                        onClick={handleAssign}
                    >
                        Assign
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
