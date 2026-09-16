'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteStop, CropListing } from '@/types/kisanrahi';
import { HubCoordinate, DEFAULT_HUBS } from '@/services/routing/hub-assignment';
import { MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix for default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons using Lucide for hubs
const createHubIcon = (status: RouteStop['status']) => {
  const color = status === 'Completed' ? '#10b981' : status === 'EnRoute' ? '#3b82f6' : '#f59e0b';
  const html = renderToString(<MapPin color={color} size={32} />);
  return L.divIcon({
    html,
    className: 'custom-hub-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const FARMER_ICON = L.divIcon({
  html: '<div style="width: 12px; height: 12px; background-color: #f97316; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',
  className: 'custom-farmer-icon',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface RouteMapProps {
  route: RouteStop[];
  listings: CropListing[];
  /** Starting depot for the optimized route polyline */
  depot?: HubCoordinate;
  /** Hub stops in optimized order (used to draw the route polyline) */
  optimizedHubs?: HubCoordinate[];
}

export default function RouteMap({ route, listings, depot, optimizedHubs }: RouteMapProps) {
  // Center map around Bihar corridor
  const center: [number, number] = [24.95, 84.03]; // Near Sasaram

  // Map route stops to hub coordinates for markers
  const routePoints = route.map(stop => {
    const hub = DEFAULT_HUBS.find(h => h.hubId === stop.hubId);
    return {
      ...stop,
      lat: hub?.lat || center[0],
      lng: hub?.lng || center[1]
    };
  });

  // Build polyline: use optimized order if provided, else fall back to route stop order
  const polylinePositions: [number, number][] = (() => {
    if (depot && optimizedHubs && optimizedHubs.length > 0) {
      // Draw: depot → optimized hub 1 → optimized hub 2 → …
      return [
        [depot.lat, depot.lng] as [number, number],
        ...optimizedHubs.map(
          (h) => [h.lat, h.lng] as [number, number],
        ),
      ];
    }
    // Fallback: original route stop order
    return routePoints.map(p => [p.lat, p.lng] as [number, number]);
  })();

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border shadow-sm z-0 relative">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route line connecting the hubs in optimized order */}
        <Polyline positions={polylinePositions} pathOptions={{ color: '#0b2545', weight: 4, opacity: 0.6, dashArray: '8 8' }} />

        {/* Hub Markers */}
        {routePoints.map((point) => (
          <Marker 
            key={point.hubId} 
            position={[point.lat, point.lng]} 
            icon={createHubIcon(point.status)}
          >
            <Popup>
              <div className="font-sans">
                <h4 className="font-bold text-navy">{point.hubName}</h4>
                <p className="text-xs text-gray-600 m-0">Pickup: {point.pickupKg} kg</p>
                <p className="text-xs text-gray-600 m-0">Status: {point.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Farmer Pickups */}
        {listings.map(listing => (
          <Marker 
            key={listing.id} 
            position={[listing.location.lat, listing.location.lng]}
            icon={FARMER_ICON}
          >
            <Popup>
              <div className="font-sans">
                <h4 className="font-bold text-navy">{listing.farmerName}</h4>
                <p className="text-xs text-gray-600 m-0">{listing.crop} - {listing.qtyKg} kg</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

