'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { useMapLayoutContext } from '@/components/MapLayout/zone-map.context';

type HeatPoint = [number, number];

interface Props {
    points: HeatPoint[];
}

export default function HeatmapLayer({ points }: Props) {
    const { mapRef, isReady } = useMapLayoutContext();

    useEffect(() => {
        if (!isReady || !mapRef.current || points.length === 0) return;

        const map = mapRef.current;

        const heatLayer = L.heatLayer(
            points.map(([lat, lng]) => [lat, lng, 1]),
            {
                radius: 45,
                blur: 30,
                maxZoom: 15,
                minOpacity: 0.25,
                gradient: {
                    0.1: '#2c7bb6',
                    0.3: '#abd9e9',
                    0.5: '#ffffbf',
                    0.7: '#fdae61',
                    0.9: '#d7191c'
                }
            }
        );

        heatLayer.addTo(map);

        const bounds = L.latLngBounds(
            points.map(([lat, lng]) => L.latLng(lat, lng))
        );

        map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 15,
            animate: true
        });

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [isReady, mapRef, points]);

    return null;
}
