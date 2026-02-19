import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 1. Extend Day.js with the necessary plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// 2. Set the global default timezone
// This ensures that dayjs() calls without .tz() will default to ICT
dayjs.tz.setDefault(process.env.NEXT_PUBLIC_LMD_TIMEZONE ?? 'Asia/Phnom_Penh');

const MDayjs = dayjs;

export { MDayjs };

export const getFormattedDate = (
    date?: string | Date,
    format?: string
): string => {
    return MDayjs(date).format(
        format ?? process.env.NEXT_PUBLIC_LMD_DATE_FORMAT ?? 'DD MMM YYYY'
    );
};
