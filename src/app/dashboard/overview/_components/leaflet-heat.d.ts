import 'leaflet';

declare module 'leaflet' {
    export function heatLayer(
        latlngs: Array<[number, number, number?]>,
        options?: HeatLayerOptions
    ): HeatLayer;

    export interface HeatLayerOptions {
        radius?: number;
        blur?: number;
        maxZoom?: number;
        minOpacity?: number;
        gradient?: Record<number, string>;
    }

    export interface HeatLayer extends Layer {
        setLatLngs(latlngs: Array<[number, number, number?]>): this;
        addLatLng(latlng: [number, number, number?]): this;
        setOptions(options: HeatLayerOptions): this;
        redraw(): this;
    }
}
