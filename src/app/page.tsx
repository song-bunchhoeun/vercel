'use client';

import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let current = 0;
        const duration = 1200; // 2 seconds
        const interval = 50; // update every 50ms
        const step = (100 - current) / (duration / interval); // progress increment per tick

        const timer = setInterval(() => {
            current += step;
            if (current >= 100) {
                current = 100;
                clearInterval(timer);
                router.push('/login');
            }
            setProgress(Math.floor(current));
        }, interval);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen">
            <Image src="/logo.svg" alt="LMD Logo" width={200} height={200} />
            <Progress
                value={progress}
                className="mt-4 w-[200px] bg-[--progress-bg] [&>div]:bg-[--progress-fill]"
            />
        </div>
    );
}
