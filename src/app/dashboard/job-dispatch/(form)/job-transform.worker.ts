/**
 * Web Worker for transforming JobList data to AutoResponse format.
 * This prevents UI lag when processing large sets of job data for the confirmation form.
 */

import {
    BaseResponse,
    Job,
    MappedJobResponse,
    TaskData,
    VisitData
} from '@/models/response.model';

 

self.onmessage = (e: MessageEvent) => {
    const { jobListData } = e.data;
    if (!jobListData || !jobListData.data || !jobListData.data.value) {
        self.postMessage({ error: 'Invalid data structure' });
        return;
    }

    try {
        const transformedData = transform(jobListData);
        self.postMessage({ success: true, data: transformedData });
    } catch (error) {
        self.postMessage({ success: false, error: (error as Error).message });
    }
};

/**
 * Main transformation logic
 */
function transform(
    source: BaseResponse<{ value: Job[] }>
): BaseResponse<MappedJobResponse> {
    return {
        success: source.success,
        statusCode: source.statusCode,
        message: source.message,
        data: {
            // Map the Job List values to AutoResponse format
            value: source.data.value.map((job: Job) => ({
                jobId: job.jobId,
                driverId: job.driverId,
                driver: {
                    id: job.driver.driverId,
                    username: job.driver.name,
                    primaryPhone: job.driver.phone,
                    profileUrl: job.driver.profileUrl,
                    // Convert string zone to object structure required by UI
                    zone: {
                        name: job.driver.zone
                    },
                    // Minimal defaults for required structure
                    fleetType: 'Motorcycle',
                    role: { name: 'Driver' }
                },
                departureTime: job.dispatchedAt || job.createdAt,
                estArrivalTime: job.deliveryDate,
                // Flatten shipment IDs for the "Change Driver" payload logic
                shipmentIds: job.visits
                    ? job.visits.flatMap((v: VisitData) => v.shipmentIds || [])
                    : [],
                visits: job.visits.map((visit: VisitData) => ({
                    ...visit,
                    tasks: visit.tasks.map((task: TaskData) => ({
                        ...task,
                        // Normalize type for the UI badge logic (Pick-Up vs Drop-Off)
                        type:
                            task.shipmentType === 'warehouse_to_customer'
                                ? 'dropoff'
                                : 'pickup'
                    }))
                })),
                optimizationDetails: {
                    totalTravelTime: job.metrics?.totalHours || 0,
                    provider: 'manual'
                }
            })),
            // Default to empty array as JobList does not provide unassigned shipments
            unassignedShipments: []
        },
        timestamp: new Date().toISOString()
    };
}
