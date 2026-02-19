'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Map as LeafletMap, Path, PathOptions } from 'leaflet';
import type {
    Feature,
    FeatureCollection,
    Polygon,
    MultiPolygon,
    GeoJsonProperties,
    Geometry
} from 'geojson';

import { useMapLayoutContext } from './zone-map.context';
import { useGetGeometryDetail } from '@/hooks/useMap';

const BaseMap = dynamic(() => import('@/components/ui/base-map'), {
    ssr: false
});

// ---------- Types & helpers ----------
type OSMProps = GeoJsonProperties & {
    id?: number;
    '@id'?: string;
    name?: string;
    tags?: { name?: string };
};

type GeoFeat = Feature<Polygon | MultiPolygon, OSMProps>;
type GeoFC = FeatureCollection<Polygon | MultiPolygon, OSMProps>;

const isPoly = (f: unknown): f is GeoFeat => {
    if (!f || typeof f !== 'object') return false;
    const feat = f as Feature<Geometry, OSMProps>;
    const g = feat.geometry;
    return !!g && (g.type === 'Polygon' || g.type === 'MultiPolygon');
};

const toFeatures = (fcOrFeat: unknown): GeoFeat[] => {
    const asFC = fcOrFeat as FeatureCollection<Geometry, OSMProps>;
    if (asFC?.type === 'FeatureCollection') {
        return (asFC.features ?? []).filter(isPoly) as GeoFeat[];
    }
    return isPoly(fcOrFeat) ? [fcOrFeat as GeoFeat] : [];
};

const makeFeatureId = (f: GeoFeat): number => {
    const p = f.properties ?? {};
    return Number(p.refId ?? p.id ?? p['@id'] ?? p.tags?.name ?? p.name ?? '');
};

export const defaultStyle: PathOptions = {
    color: '#000',
    weight: 8,
    opacity: 0.001,
    fillOpacity: 0
};
export const hoverStyle: PathOptions = {
    color: '#00aaff',
    weight: 3,
    opacity: 1,
    fillColor: '#4da3ff',
    fillOpacity: 0.35
};
export const selectedStyle: PathOptions = {
    color: '#00ccff',
    weight: 3,
    opacity: 1,
    fillColor: '#4da3ff',
    fillOpacity: 0.45
};

// ---------- MAP COMPONENT ----------
export default function ZoneMap() {
    const { data: geometry, isLoading, isError } = useGetGeometryDetail();
    const {
        mapRef,
        isReady,
        selectedRef,
        interactiveRef,
        layerByIdRef,
        layersRef,
        setIsReady,
        setSelectedIds
    } = useMapLayoutContext();

    const mapOptions = {
        zoom: 12,
        minZoom: 10,
        maxZoom: 16,
        maxBoundsViscosity: 1.0
    };

    const onMapLoaded = (map: LeafletMap) => {
        mapRef.current = map;
        setIsReady(true);
    };

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !isReady || isLoading || isError || !geometry) return;

        (async () => {
            const leafletMod = await import('leaflet');
            //eslint-disable-next-line
            const L = (leafletMod as any).default ?? leafletMod;
            const turf = await import('@turf/turf');

            /* ---------------------------- Load geojson ---------------------------- */
            const features = toFeatures(geometry);
            const featureCollection: GeoFC = {
                type: 'FeatureCollection',
                features
            };

            /* --------------------- Static outline (gray borders) --------------------- */
            //eslint-disable-next-line
            const khanOutline = L.geoJSON(featureCollection as any, {
                style: { color: '#888', weight: 3, fillOpacity: 0 },
                interactive: false
            }).addTo(map);

            layersRef.current.push(khanOutline);

            map.fitBounds(khanOutline.getBounds());

            /* ----------------------- Black world mask overlay ----------------------- */
            const world = turf.bboxPolygon([-180, -85, 180, 85]) as GeoFeat;

            const mask =
                (turf.difference({
                    type: 'FeatureCollection',
                    features: [world, ...features]
                }) as GeoFeat) ?? world;

            //eslint-disable-next-line
            const worldMask = L.geoJSON(mask as any, {
                style: {
                    color: 'transparent',
                    weight: 0,
                    fillColor: '#000',
                    fillOpacity: 0.5
                },
                interactive: false
            }).addTo(map);

            layersRef.current.push(worldMask);

            /* -------------------------- Interactive Layer -------------------------- */
            //eslint-disable-next-line
            const interactiveLayer = L.geoJSON(featureCollection as any, {
                style: defaultStyle,
                onEachFeature: (feat: GeoFeat, layer: Path) => {
                    const id = makeFeatureId(feat);
                    layerByIdRef.current.set(id, layer);

                    if (selectedRef.current.has(id)) {
                        layer.setStyle(selectedStyle);
                    }

                    const props = feat.properties ?? {};
                    const name =
                        props['name:en'] ??
                        props.tags?.name ??
                        props.name ??
                        'Area';

                    layer.bindTooltip(name, { direction: 'top' });

                    layer.on('mouseover', () => {
                        if (!interactiveRef.current) return;
                        if (!selectedRef.current.has(id))
                            layer.setStyle(hoverStyle);
                    });
                    layer.on('mouseout', () => {
                        if (!interactiveRef.current) return;
                        if (!selectedRef.current.has(id))
                            layer.setStyle(defaultStyle);
                    });
                    layer.on('click', () => {
                        if (!interactiveRef.current) return;

                        const isSelected = selectedRef.current.has(id);

                        if (isSelected) {
                            selectedRef.current.delete(id);
                            layer.setStyle(defaultStyle);
                        } else {
                            selectedRef.current.add(id);
                            layer.setStyle(selectedStyle);
                            layer.bringToFront();
                        }

                        setSelectedIds(Array.from(selectedRef.current));
                    });
                }
            }).addTo(map);

            layersRef.current.push(interactiveLayer);
        })();

        const currentLayerbyIdRef = layerByIdRef.current;
        const currentselectedRef = selectedRef.current;

        return () => {
            // map.off('zoomend', handleZoom);

            layersRef.current.forEach((layer) => {
                try {
                    map.removeLayer(layer);
                } catch {
                    //
                }
            });

            layersRef.current = [];
            currentLayerbyIdRef.clear();
            currentselectedRef.clear();
            setSelectedIds([]);
        };
    }, [
        isReady,
        isLoading,
        isError,
        geometry,
        interactiveRef,
        layerByIdRef,
        layersRef,
        mapRef,
        selectedRef,
        setSelectedIds
    ]);

    return (
        <BaseMap
            options={mapOptions}
            onMapLoaded={onMapLoaded}
            className="h-full rounded-none"
        />
    );
}
