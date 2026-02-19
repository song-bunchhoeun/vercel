import { Job } from '@/models/response.model';

self.onmessage = (e: MessageEvent) => {
    const { jobViewData } = e.data;

    if (!jobViewData?.data?.value) {
        self.postMessage({
            success: false,
            jobIds: []
        });
        return;
    }

    try {
        const jobIds = jobViewData.data.value.map((job: Job) => job.jobId);

        self.postMessage({
            success: true,
            jobIds
        });
    } catch (error) {
        self.postMessage({
            success: false,
            jobIds: [],
            error: (error as Error).message
        });
    }
};
