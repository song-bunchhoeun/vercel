/**
 * Web Worker: Job Data Enriched (Strictly Typed)
 * Updated with exact Enum values for Shipment Task Status and Type.
 * Color codes synchronized with global.css theme palettes.
 */

import { TaskData, VisitData } from '@/models/response.model';
import { SHIPMENT_TASK_STATUS } from './(form)/job.dispatch.service';
import { getFormattedDate } from '@/lib/dayjs';

interface StatusConfig {
    readonly color: string; // Text color
    readonly bg: string; // Solid background for dot
    readonly border: string; // Border color for node
    readonly label: string; // Status key
}

const UI_CONFIG: Record<
    'FAILED' | 'IN_TRANSIT' | 'COMPLETED' | 'DEFAULT',
    StatusConfig
> = {
    FAILED: {
        color: 'text-error-700',
        bg: 'bg-error-500',
        border: 'border-error-500',
        label: 'job_dispatch.details.shipment_statuses.failed'
    },
    IN_TRANSIT: {
        color: 'text-mango-700',
        bg: 'bg-mango-500',
        border: 'border-mango-500',
        label: 'job_dispatch.details.shipment_statuses.in_transit'
    },
    COMPLETED: {
        color: 'text-success-700',
        bg: 'bg-success-500',
        border: 'border-success-500',
        label: 'job_dispatch.details.shipment_statuses.delivered'
    },
    DEFAULT: {
        color: 'text-neutral-500',
        bg: 'bg-neutral-300',
        border: 'border-neutral-300',
        label: 'job_dispatch.details.shipment_statuses.pending'
    }
};

//eslint-disable-next-line
addEventListener('message', (event: MessageEvent<any[]>) => {
    const rawJobs = event.data;

    if (!Array.isArray(rawJobs)) {
        postMessage([]);
        return;
    }

    const enrichedJobs = rawJobs.map((job) => {
        let activeVisit: VisitData | null = null;

        const totalTasksMetric = job.metrics?.totalShipments ?? 0;
        const shipmentCount = Math.ceil(totalTasksMetric / 2);
        const estimateArrival = getFormattedDate(
            job.metrics?.arrivalHour,
            'HH:mm A'
        );

        const processedVisits = job.visits.map((visit: VisitData) => {
            const tasks = visit.tasks || [];

            // 1. Check for Failures (Status 6)
            const hasFailed = tasks.some(
                (t: TaskData) => t.status === SHIPMENT_TASK_STATUS.FAILED
            );

            // 2. Check for Active/In-Progress (Status 1, 2, 3)
            const hasActiveTasks = tasks.some((t: TaskData) =>
                [
                    SHIPMENT_TASK_STATUS.NEW,
                    SHIPMENT_TASK_STATUS.IN_TRANSIT,
                    SHIPMENT_TASK_STATUS.ARRIVED
                ].includes(t.status)
            );

            // 3. Check for Completion (Status 4 or 5)
            const isAllCompleted =
                tasks.length > 0 &&
                tasks.every(
                    (t: TaskData) =>
                        t.status === SHIPMENT_TASK_STATUS.DELIVERED ||
                        t.status === SHIPMENT_TASK_STATUS.PICKED_UP
                );

            let config: StatusConfig = UI_CONFIG.DEFAULT;

            if (hasFailed) {
                config = UI_CONFIG.FAILED;
            } else if (hasActiveTasks) {
                config = UI_CONFIG.IN_TRANSIT;
            } else if (isAllCompleted) {
                config = UI_CONFIG.COMPLETED;
            }

            const processedVisit = {
                ...visit,
                statusColor: config.color,
                statusBg: config.bg,
                statusBorder: config.border,
                statusLabel: config.label
            };

            if (hasActiveTasks && !activeVisit) {
                activeVisit = processedVisit;
            }

            return processedVisit;
        });

        return {
            ...job,
            shipmentCount,
            estimateArrival,
            visits: processedVisits,
            currentVisit:
                activeVisit ||
                processedVisits.find(
                    (v: VisitData) =>
                        v.statusLabel ===
                        'job_dispatch.details.shipment_statuses.failed'
                ) ||
                processedVisits[0]
        };
    });

    postMessage(enrichedJobs);
});
