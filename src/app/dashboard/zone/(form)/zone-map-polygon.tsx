'use client';

import { useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useMapLayoutContext } from '@/components/MapLayout/zone-map.context';
import { useZoneExclusivity } from './useZoneExclusivity';

const PERSISTENT_DRAW_LAYER_ID = 'lmd-zone-draw-layer';

const ZoneMapPolygon = () => {
    const { isReady, mapRef, drawnItemsRef, setDrawnGeoJson } =
        useMapLayoutContext();
    const { isHadDistrict } = useZoneExclusivity();

    const isInitializedRef = useRef(false);
    const drawControlRef = useRef<L.Control | null>(null);
    const setDrawnGeoJsonRef = useRef(setDrawnGeoJson);

    useEffect(() => {
        setDrawnGeoJsonRef.current = setDrawnGeoJson;
    }, [setDrawnGeoJson]);

    const getFeatures = useCallback((): GeoJSON.Feature[] => {
        const items = drawnItemsRef.current;
        if (!items) return [];
        const fc = items.toGeoJSON() as GeoJSON.FeatureCollection;
        return (fc?.features ?? []) as GeoJSON.Feature[];
    }, [drawnItemsRef]);

    const fireChanged = useCallback(() => {
        const features = getFeatures();
        setDrawnGeoJsonRef.current(features.length ? features : []);
    }, [getFeatures]);

    useEffect(() => {
        if (!isReady || !mapRef.current || isInitializedRef.current) return;

        const map = mapRef.current;
        //eslint-disable-next-line
        const DrawEvent = (L as any).Draw.Event;

        let existingLayer: L.FeatureGroup | null = null;
        //eslint-disable-next-line
        map.eachLayer((layer: any) => {
            if (
                layer.options &&
                layer.options.id === PERSISTENT_DRAW_LAYER_ID
            ) {
                existingLayer = layer as L.FeatureGroup;
            }
        });

        if (existingLayer) {
            drawnItemsRef.current = existingLayer;
        } else if (!drawnItemsRef.current) {
            drawnItemsRef.current = new L.FeatureGroup([], {
                id: PERSISTENT_DRAW_LAYER_ID
                //eslint-disable-next-line
            } as any);
            map.addLayer(drawnItemsRef.current);
        }

        const drawnItems = drawnItemsRef.current;

        if (!drawControlRef.current) {
            //eslint-disable-next-line
            const drawControl = new (L.Control as any).Draw({
                position: 'topright',
                draw: {
                    polygon: true,
                    rectangle: false,
                    circle: false,
                    polyline: false,
                    marker: false,
                    circlemarker: false
                },
                edit: { featureGroup: drawnItems }
            });
            drawControlRef.current = drawControl;
            map.addControl(drawControl);
        }

        //eslint-disable-next-line
        const onCreated = (e: any) => {
            if (isHadDistrict) {
                map.removeLayer(e.layer);
                return;
            }
            drawnItems.addLayer(e.layer);
            fireChanged();
        };

        const onAction = () => fireChanged();

        map.on(DrawEvent.CREATED, onCreated);
        map.on(DrawEvent.EDITED, onAction);
        map.on(DrawEvent.DELETED, onAction);

        isInitializedRef.current = true;

        return () => {
            map.off(DrawEvent.CREATED, onCreated);
            map.off(DrawEvent.EDITED, onAction);
            map.off(DrawEvent.DELETED, onAction);

            if (drawControlRef.current) {
                map.removeControl(drawControlRef.current);
                drawControlRef.current = null;
                isInitializedRef.current = false;
            }
        };
    }, [isReady, mapRef, drawnItemsRef, fireChanged, isHadDistrict]);

    return null;
};

export default ZoneMapPolygon;
