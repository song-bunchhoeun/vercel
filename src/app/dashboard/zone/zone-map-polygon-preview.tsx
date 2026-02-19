'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMapLayoutContext } from '@/components/MapLayout/zone-map.context';

type Props = {
    autoFit?: boolean;
};

const ZoneMapPolygonPreview = ({ autoFit = true }: Props) => {
    const { isReady, mapRef, drawnGeoJson } = useMapLayoutContext();
    const geoLayerRef = useRef<L.GeoJSON | null>(null);

    useEffect(() => {
        if (!isReady || !mapRef.current) return;

        const map = mapRef.current;

        if (!geoLayerRef.current) {
            geoLayerRef.current = L.geoJSON([], {
                // keep it simple; tweak colors later if needed
                style: () => ({
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.2
                })
            });

            geoLayerRef.current.addTo(map);
        }

        const layer = geoLayerRef.current;

        // refresh layer
        layer.clearLayers();

        if (drawnGeoJson?.length) {
            for (const f of drawnGeoJson) {
                //eslint-disable-next-line
                layer.addData(f as any);
            }

            // ensure on top
            //eslint-disable-next-line
            (layer as any).bringToFront?.();

            if (autoFit) {
                const bounds = layer.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds.pad(0.15));
                }
            }
        }

        return () => {
            // remove layer when component unmounts
            if (geoLayerRef.current) {
                map.removeLayer(geoLayerRef.current);
                geoLayerRef.current = null;
            }
        };
    }, [isReady, mapRef, drawnGeoJson, autoFit]);

    return null;
};

export default ZoneMapPolygonPreview;
