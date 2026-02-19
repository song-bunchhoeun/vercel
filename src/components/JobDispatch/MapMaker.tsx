import { SHIPMENT_TASK_STATUS } from '@/app/dashboard/job-dispatch/(form)/job.dispatch.service';
import L from 'leaflet';

/**
 * Generates custom status-based pins for the map.
 * Anchor [22, 53] ensures the tip of the pin perfectly touches the coordinate.
 */
export const getShipmentIcon = (
    statusValue: number,
    isWarehouse: boolean | undefined,
    count: number
) => {
    let color = '#a3a3a3';
    let bgLight = '#fafafa';

    if (statusValue === SHIPMENT_TASK_STATUS.NEW) {
        color = '#3B82F6';
        bgLight = '#EFF6FF';
    } // In-Transit
    else if (statusValue === SHIPMENT_TASK_STATUS.IN_TRANSIT) {
        color = '#F98707';
        bgLight = '#FFF9EB';
    } // Arrived
    else if (statusValue === SHIPMENT_TASK_STATUS.ARRIVED) {
        color = '#B74106';
        bgLight = '#FFF9EB';
    } // Delivered
    else if (statusValue === SHIPMENT_TASK_STATUS.DELIVERED) {
        color = '#27C04B';
        bgLight = '#F0FDF2';
    } // Pick Up
    else if (statusValue === SHIPMENT_TASK_STATUS.PICKED_UP) {
        color = '#18632B';
        bgLight = '#F0FDF2';
    } // Failed
    else if (statusValue === SHIPMENT_TASK_STATUS.FAILED) {
        color = '#F34040';
        bgLight = '#FEF2F2';
    }

    return L.divIcon({
        className: 'custom-map-pin',
        html: `
        <div style="display:flex; flex-direction:column; align-items:center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
            <div style="width:44px; height:44px; background:#fff; border:2px solid ${color}; border-radius:12px; display:flex; align-items:center; justify-content:center; z-index:2;">
                <img src="${isWarehouse ? '/icons/home-map-maker.svg' : '/icons/map-maker.svg'}" style="width:24px; height:24px;" />
            </div>
            <div style="width:0; height:0; border-left:8px solid transparent; border-right:8px solid transparent; border-top:10px solid ${color}; margin-top:-1px;"></div>
            <div style="margin-top:4px; width:26px; height:26px; background:${bgLight}; border:1px solid ${color}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:${color};">
                ${isWarehouse ? 'W' : count}
            </div>
        </div>`,
        iconSize: [44, 82],
        iconAnchor: [22, 53]
    });
};
