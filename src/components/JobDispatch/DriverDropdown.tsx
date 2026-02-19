import {
    DRIVER_STATUS,
    Job
} from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import { AssignPayload } from '@/app/dashboard/job-dispatch/(form)/JobDriverConfirmation';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useGetListDrivers } from '@/hooks/useDrivers';
import { useState } from 'react';

interface Driver {
    id: string;
    username: string;
}

export default function SelectDriver({
    job,
    onAssign
}: {
    job: Job;
    onAssign: (payload: AssignPayload) => void;
}) {
    const { data } = useGetListDrivers({
        top: 9999,
        page: 1,
        status: DRIVER_STATUS.ACTIVE
    });
    const drivers = data?.value ?? [];

    const hasDefault = drivers.some(
        (driver: Driver) => driver.id === job.driver.driverId
    );

    const options = hasDefault
        ? drivers
        : [{ id: job.driver.driverId, username: job.driver.name }, ...drivers];

    const [selectedDriver, setSelectedDriver] = useState(job.driver.driverId);

    const handleOnValueChange = (driverId: string) => {
        setSelectedDriver(driverId);

        onAssign({
            jobId: job.jobId,
            driverId,
            shipmentIds: job.shipmentIds
        });
    };

    const selectedDriverName =
        options.find((d: Driver) => d.id === selectedDriver)?.username || '';

    return (
        <Select value={selectedDriver} onValueChange={handleOnValueChange}>
            <SelectTrigger className="w-[140px] bg-white border border-gray-400 text-gray-900 cursor-pointer">
                <SelectValue>{selectedDriverName}</SelectValue>
            </SelectTrigger>

            <SelectContent>
                <SelectGroup>
                    {options.map((driver: Driver) => (
                        <SelectItem
                            key={driver.id}
                            value={driver.id}
                            className="cursor-pointer"
                        >
                            {driver.username}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
