'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Map as LeafletMap } from 'leaflet';
import { Loader2, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '../ui/button';

const BaseMap = dynamic(() => import('@/components/ui/base-map'), {
    ssr: false
});

// ... Interfaces stay the same ...
export interface AddressMapDialogLocation {
    lat: number;
    lng: number;
    address: string;
}
interface AddressMapDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    isViewMap?: boolean;
    title: string;
    descriptiom?: string;
    onMapConfimed?: (data: AddressMapDialogLocation) => void;
    children?: React.ReactNode;
    addressFormKey?: string;
    latitude?: number | null;
    longitude?: number | null;
    defaultAddress?: string;
}
export interface NominatimSearchResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    address: Record<string, string | undefined>;
    boundingbox: [string, string, string, string];
}

export default function AddressMapDialog({
    open,
    setOpen,
    isViewMap = false,
    title,
    descriptiom,
    children,
    addressFormKey = 'address',
    onMapConfimed,
    latitude,
    longitude,
    defaultAddress = ''
}: AddressMapDialogProps) {
    const form = useFormContext();

    const [address, setAddress] = useState(defaultAddress);
    const [coords, setCoords] = useState({
        lat: latitude ?? 11.5564,
        lng: longitude ?? 104.9282
    });
    const [searchResults, setSearchResults] = useState<NominatimSearchResult[]>(
        []
    );
    const [isInitialLoading, setIsInitialLoading] = useState(true); // 🚀 Fix 1: Loading state

    const mapRef = useRef<LeafletMap | null>(null);
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const reverseGeocodeDebounceRef = useRef<NodeJS.Timeout | null>(null);

    // 🚀 Fix 2 & 3: This flag blocks /reverse when the map moves due to a search selection
    const isManualJumpRef = useRef(false);

    useEffect(() => {
        if (open) {
            setIsInitialLoading(true);
            setCoords({ lat: latitude ?? 11.5564, lng: longitude ?? 104.9282 });
            setAddress(defaultAddress || '');
            setSearchResults([]);
            // Simulate/Wait for map readiness
            setTimeout(() => setIsInitialLoading(false), 500);
        }
    }, [open, latitude, longitude, defaultAddress]);

    const fetchNominatim = useCallback(
        async (params: Record<string, string>) => {
            const isReverse = !!params.lat;
            const url = new URL(
                `https://nominatim.openstreetmap.org/${isReverse ? 'reverse' : 'search'}`
            );
            url.search = new URLSearchParams({
                format: 'json',
                addressdetails: '1',
                ...params
            }).toString();

            const response = await fetch(url.toString(), {
                headers: {
                    'User-Agent':
                        'DGCMerchantApp/1.0 (contact: support@dgc.gov.kh)',
                    Referer:
                        typeof window !== 'undefined'
                            ? window.location.origin
                            : ''
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        },
        []
    );

    // --- Search Logic ---
    const handleSearchInput = (value: string) => {
        // 🚀 Fix 4: Directly update state, but clear jump flag if user starts typing
        isManualJumpRef.current = false;
        setAddress(value);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

        searchDebounceRef.current = setTimeout(async () => {
            if (!value.trim()) return setSearchResults([]);
            try {
                const data = await fetchNominatim({
                    q: value,
                    format: 'jsonv2',
                    countrycodes: 'kh',
                    viewbox: '102.3,14.7,107.7,10.3',
                    bounded: '1',
                    limit: '5',
                    featuretype: 'amenity'
                });
                setSearchResults(Array.isArray(data) ? data : []);
            } catch (err) {
                setSearchResults([]);
            }
        }, 600);
    };

    const handleSelectResult = (result: NominatimSearchResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        // 🚀 Fix 2: Set flag to TRUE before moving map
        isManualJumpRef.current = true;

        setCoords({ lat, lng });
        setAddress(result.display_name);
        setSearchResults([]);
        mapRef.current?.setView([lat, lng], 16);
    };

    // --- Map Movement ---
    const updateLocationInfo = useCallback(() => {
        if (!mapRef.current || isViewMap) return;

        // 🚀 Fix 3: If this move was triggered by handleSelectResult, STOP here.
        if (isManualJumpRef.current) {
            isManualJumpRef.current = false; // Reset for next move (user drag)
            return;
        }

        const center = mapRef.current.getCenter();
        setCoords({ lat: center.lat, lng: center.lng });

        if (reverseGeocodeDebounceRef.current)
            clearTimeout(reverseGeocodeDebounceRef.current);

        reverseGeocodeDebounceRef.current = setTimeout(async () => {
            try {
                const data = await fetchNominatim({
                    lat: center.lat.toString(),
                    lon: center.lng.toString()
                });
                // 🚀 Update address from map drag
                setAddress(data.display_name || 'Unknown location');
            } catch (err) {
                setAddress('Location unavailable');
            }
        }, 800);
    }, [isViewMap, fetchNominatim]);

    const onMapLoaded = async (map: LeafletMap) => {
        mapRef.current = map;
        const L = await import('leaflet');

        if (isViewMap) {
            L.marker([coords.lat, coords.lng]).addTo(map);
            map.setView([coords.lat, coords.lng], 16);
        } else {
            map.on('moveend', updateLocationInfo);
            // Only auto-reverse if we have coords but no address string
            if (!address && coords.lat) updateLocationInfo();
        }
    };

    // ... Cleanup and handleConfirm stay the same ...
    useEffect(() => {
        return () => {
            if (mapRef.current)
                mapRef.current.off('moveend', updateLocationInfo);
            if (searchDebounceRef.current)
                clearTimeout(searchDebounceRef.current);
            if (reverseGeocodeDebounceRef.current)
                clearTimeout(reverseGeocodeDebounceRef.current);
        };
    }, [updateLocationInfo]);

    const handleConfirm = () => {
        if (onMapConfimed) {
            onMapConfimed({ lat: coords.lat, lng: coords.lng, address });
        } else if (form) {
            const options = { shouldDirty: true, shouldValidate: true };
            form.setValue('latitude', coords.lat, options);
            form.setValue('longitude', coords.lng, options);
            form.setValue(addressFormKey, address, options);
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                className="min-w-204.5 gap-1.5 bg-neutral-100"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <div className="flex flex-wrap items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {title}
                        </DialogTitle>
                        <p className="text-blue-500 bg-blue-100 px-2.5 py-0.5 rounded-2xl text-xs sm:text-sm">
                            Map
                        </p>
                    </div>
                    <DialogDescription className="text-sm">
                        {descriptiom}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <label className="block text-base font-normal text-gray-800">
                            Search Location{' '}
                            <span className="text-red-700">*</span>
                        </label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                value={address}
                                onChange={(e) =>
                                    handleSearchInput(e.target.value)
                                }
                                disabled={isInitialLoading} // 🚀 Fix 1: Block input during load
                                readOnly={isViewMap}
                                placeholder="Type location name or drag map"
                                className={cn(
                                    'block w-full rounded-md border border-gray-300 p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500',
                                    isInitialLoading &&
                                        'bg-gray-100 text-gray-400 cursor-not-allowed'
                                )}
                            />
                            {isInitialLoading && (
                                <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-gray-400" />
                            )}
                        </div>
                        {/* Results Dropdown */}
                        {searchResults.length > 0 && (
                            <ul className="absolute z-[1001] w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                                {searchResults.map((result) => (
                                    <li
                                        key={result.place_id}
                                        onClick={() =>
                                            handleSelectResult(result)
                                        }
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b last:border-0"
                                    >
                                        {result.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="rounded-lg shadow-sm border border-gray-20 bg-white p-4">
                        <div className="relative w-full overflow-hidden min-h-87">
                            <BaseMap
                                options={{
                                    center: [coords.lat, coords.lng],
                                    zoom: 16,
                                    minZoom: 14,
                                    maxZoom: 18,
                                    maxBounds: [
                                        [11.35, 104.75],
                                        [11.65, 105.0]
                                    ],
                                    maxBoundsViscosity: 1.0
                                }}
                                onMapLoaded={onMapLoaded}
                            />
                            {!isViewMap && (
                                <div className="absolute z-[999] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                                    <MapPin
                                        size={36}
                                        strokeWidth={2}
                                        className="drop-shadow-md text-blue-500"
                                    />
                                </div>
                            )}
                        </div>
                        {children}
                        <div className="flex justify-end pt-2 gap-4">
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => setOpen(false)}
                                className="border cursor-pointer"
                            >
                                Close
                            </Button>
                            {!isViewMap && (
                                <Button
                                    variant="default"
                                    type="button"
                                    onClick={handleConfirm}
                                    className="cursor-pointer"
                                >
                                    Confirm
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
