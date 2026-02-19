import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateArray<T>(generator: () => T, count = 5): T[] {
    return Array.from({ length: count }, generator);
}

export function randomMinMax(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const formatPhone = (val: string | null | undefined) => {
    if (!val) return;
    const digits = val.replace(/\D/g, '');
    return digits
        .replace(/^(\d{3})(\d{3})(\d{0,4}).*$/, (_, g1, g2, g3) =>
            [g1, g2, g3].filter(Boolean).join(' ')
        )
        .trim();
};
