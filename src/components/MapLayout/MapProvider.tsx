'use client';

import React, { useMemo, useRef, useState, useCallback } from 'react';
import type { Map as LeafletMap, Path, Layer } from 'leaflet';
import type L from 'leaflet';
import { MapContext } from './zone-map.context';
import { defaultStyle, selectedStyle } from './zone-map';

export function MapProvider({ children }: { children: React.ReactNode }) {
    const mapRef = useRef<LeafletMap | null>(null);
    const [isReady, setIsReady] = useState(false);

    const selectedRef = useRef<Set<number>>(new Set());
    const interactiveRef = useRef<boolean>(false);
    const layerByIdRef = useRef<Map<number, Path>>(new Map());
    const layersRef = useRef<Layer[]>([]);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // ✅ Drawing shared refs/state (API shape = GeoJSON.Feature[])
    const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
    const [drawnGeoJson, setDrawnGeoJson] = useState<GeoJSON.Feature[]>([]);

    const applySelection = useCallback((ids: number[]) => {
        const set = new Set(ids.map(Number));
        selectedRef.current = set;

        for (const [id, lyr] of layerByIdRef.current.entries()) {
            lyr.setStyle(set.has(id) ? selectedStyle : defaultStyle);
            if (set.has(id)) lyr.bringToFront();
        }
        setSelectedIds(Array.from(set));
    }, []);

    const clearSelection = useCallback(
        () => applySelection([]),
        [applySelection]
    );

    const fitToSelection = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;

        const layers = [...selectedRef.current]
            .map((id) => layerByIdRef.current.get(id))
            .filter(Boolean) as Path[];

        if (!layers.length) return;

        import('leaflet').then((leafletMod) => {
            const L = leafletMod.default ?? leafletMod;
            const group = L.featureGroup(layers);
            map.fitBounds(group.getBounds().pad(0.15));
        });
    }, []);

    const setInteractive = useCallback((enabled: boolean) => {
        interactiveRef.current = enabled;
    }, []);

    const contextValue = useMemo(
        () => ({
            mapRef,
            isReady,
            selectedIds,
            applySelection,
            clearSelection,
            fitToSelection,
            setInteractive,

            // INTERNAL
            selectedRef,
            interactiveRef,
            layerByIdRef,
            layersRef,
            setIsReady,
            setSelectedIds,

            // ✅ drawing
            drawnItemsRef,
            drawnGeoJson,
            setDrawnGeoJson
        }),
        [
            isReady,
            selectedIds,
            applySelection,
            clearSelection,
            fitToSelection,
            setInteractive,
            drawnGeoJson
        ]
    );

    return (
        <MapContext.Provider value={contextValue}>
            {children}
        </MapContext.Provider>
    );
}

export default MapProvider;
