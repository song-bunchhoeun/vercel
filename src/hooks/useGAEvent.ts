export const useGAEvent = () => {
    const sendEvent = (name: string, params = {}) => {
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', name, params);
        }
    };

    return { sendEvent };
};
