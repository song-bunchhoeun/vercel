'use client';

import { useFormContext } from 'react-hook-form';
import { ZoneRequest } from './zone.form.service';
import { useEffect } from 'react';

export const useZoneExclusivity = () => {
    const { watch, trigger } = useFormContext<ZoneRequest>();

    const districtIds = watch('districtIds') || [];
    const customPolygon = watch('customPolygon') || [];

    const isHadCustom = customPolygon.length > 0;
    const isHadDistrict = districtIds.length > 0;
    const isHadEither = isHadCustom || isHadDistrict;

    // Use useEffect to prevent infinite loops
    useEffect(() => {
        const drawBtn = document.querySelector('.leaflet-draw-draw-polygon');
        if (drawBtn) {
            if (isHadEither) {
                // We use a small delay or microtask to ensure RHF
                // has finished processing the value change
                trigger(['customPolygon', 'districtIds']);

                if (isHadEither) {
                    drawBtn.classList.add('leaflet-disabled');
                    // Optional: Disable pointer events to prevent clicking even if it looks disabled
                    drawBtn.setAttribute(
                        'title',
                        'Disabled: District or Custom Zone already selected'
                    );
                } else {
                    drawBtn.classList.remove('leaflet-disabled');
                    drawBtn.setAttribute('title', 'Draw a polygon');
                }
            } else {
                drawBtn.classList.remove('leaflet-disabled');
                drawBtn.setAttribute('title', 'Draw a polygon');
            }
        }
    }, [isHadEither, trigger]);

    return {
        isHadDistrict: isHadDistrict,
        isHadCustom: isHadCustom,
        isHadEither: isHadEither,
        selectedDistrictId: districtIds
    };
};
