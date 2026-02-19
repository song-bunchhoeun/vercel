'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

interface ReactQueryProviderProps {
    children: ReactNode;
}

export default function ReactQueryProvider({
    children
}: ReactQueryProviderProps) {
    // Use a state variable to ensure the client is only created once
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* Optional: Add devtools for debugging */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
