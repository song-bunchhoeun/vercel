'use client';

import { getShipmentIcon } from '@/components/JobDispatch/MapMaker';
import { useWarehouses } from '@/hooks/useWarehouses';
import { cn } from '@/lib/utils';
import * as L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';

export interface BaseMapProps {
    options: L.MapOptions;
    onMapLoaded?: (map: L.Map) => void;
    className?: string;
}

const BaseMap = ({ options, onMapLoaded, className }: BaseMapProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const { data } = useWarehouses({ top: 9999, page: 1 });

    const warehouses = useMemo(() => {
        return (
            data?.value?.filter(
                (w) =>
                    typeof w.latitude === 'number' &&
                    typeof w.longitude === 'number'
            ) ?? []
        );
    }, [data]);

    useEffect(() => {
        if (!mapRef.current) return;
        if (!warehouses.length) return;

        const map = mapRef.current;
        const markerLayer = L.layerGroup().addTo(map);

        warehouses.forEach((w, index) => {
            L.marker([w.latitude!, w.longitude!], {
                icon: getShipmentIcon(0, true, index + 1)
            }).addTo(markerLayer);
        });

        return () => {
            markerLayer.remove();
        };
    }, [warehouses]);

    useEffect(() => {
        // Defensive cleanup (important for React StrictMode)
        if (mapRef.current) {
            try {
                mapRef.current.remove();
            } catch {
                /* ignore */
            }
            mapRef.current = null;
        }

        if (!containerRef.current) return;

        try {
            // Initialize Leaflet map once
            const map = L.map(containerRef.current, options);
            mapRef.current = map;

            // Add OSM tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution:
                    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Fire callback
            if (onMapLoaded) onMapLoaded(map);
        } catch (err) {
            console.error('Error loading map:', err);
        }

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once (React StrictMode runs twice but cleans up properly)

    return (
        <>
            {/* Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />

            {/* Map Container */}
            <div
                ref={containerRef}
                className={cn(
                    'w-full h-[348px] rounded-lg overflow-hidden border',
                    className
                )}
            />
        </>
    );
};

export default BaseMap;
