declare global {
    interface Window {
        //eslint-disable-next-line
        gtag: (...args: any[]) => void;
    }
}

export {};
