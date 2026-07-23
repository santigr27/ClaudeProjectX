"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { mapConfig } from "@/config/site";

const pinIcon = L.divIcon({
  className: "raiz-location-pin",
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:var(--color-brand-700);border:3px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function PropertyLocationMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        minZoom={mapConfig.minZoom}
        maxZoom={mapConfig.maxZoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer url={mapConfig.tileUrl} attribution={mapConfig.tileAttribution} />
        <Marker position={[latitude, longitude]} icon={pinIcon} />
      </MapContainer>
    </div>
  );
}
