'use client';

import { createContext, useContext } from 'react';
import type React from 'react';
import type { Map as LeafletMap, Path, FeatureGroup } from 'leaflet';

interface MapContextType {
    mapRef: React.RefObject<LeafletMap | null>;
    isReady: boolean;
    selectedIds: number[];
    applySelection: (ids: number[]) => void;
    clearSelection: () => void;
    fitToSelection: () => void;
    setInteractive: (enabled: boolean) => void;

    // INTERNAL
    selectedRef: React.RefObject<Set<number>>;
    interactiveRef: React.RefObject<boolean>;
    layerByIdRef: React.RefObject<Map<number, Path>>;
    //eslint-disable-next-line
    layersRef: React.RefObject<any[]>;

    setIsReady: (v: boolean) => void;
    setSelectedIds: (ids: number[]) => void;

    // ✅ Drawing shared state (GeoJSON)
    drawnItemsRef: React.RefObject<FeatureGroup | null>;
    drawnGeoJson: GeoJSON.Feature[];
    setDrawnGeoJson: (features: GeoJSON.Feature[]) => void;
}

export const MapContext = createContext<MapContextType | null>(null);

export const useMapLayoutContext = () => {
    const ctx = useContext(MapContext);
    if (!ctx) throw new Error('useZoneMap must be used inside <ZoneLayout>');
    return ctx;
};
