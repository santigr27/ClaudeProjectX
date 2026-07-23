"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import Image from "next/image";
import Link from "next/link";
import { mapConfig } from "@/config/site";
import { formatCompactCOP, formatCompactRentPerMonth } from "@/lib/currency";
import { createPriceMarkerIcon } from "./marker-icon";
import type { PropertySummary } from "@/types/property";
import type { LatLngBounds } from "leaflet";

export interface MapBoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

function boundsToBbox(bounds: LatLngBounds): MapBoundingBox {
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

function MapEventsWatcher({ onMoved }: { onMoved: (bbox: MapBoundingBox) => void }) {
  useMapEvents({
    moveend: (event) => onMoved(boundsToBbox(event.target.getBounds())),
  });
  return null;
}

export function PropertyMap({
  properties,
  selectedId,
  onSelect,
  onSearchArea,
}: {
  properties: PropertySummary[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onSearchArea?: (bbox: MapBoundingBox) => void;
}) {
  const [hasMoved, setHasMoved] = useState(false);
  const [pendingBbox, setPendingBbox] = useState<MapBoundingBox | null>(null);
  const propertiesRef = useRef(properties);

  useEffect(() => {
    if (propertiesRef.current !== properties) {
      propertiesRef.current = properties;
      setHasMoved(false);
    }
  }, [properties]);

  const center = useMemo(() => {
    if (properties.length === 0) return mapConfig.bogotaCenter;
    const avgLat = properties.reduce((sum, p) => sum + p.latitude, 0) / properties.length;
    const avgLng = properties.reduce((sum, p) => sum + p.longitude, 0) / properties.length;
    return { lat: avgLat, lng: avgLng };
  }, [properties]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={mapConfig.defaultZoom}
        minZoom={mapConfig.minZoom}
        maxZoom={mapConfig.maxZoom}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer url={mapConfig.tileUrl} attribution={mapConfig.tileAttribution} />
        <MapEventsWatcher
          onMoved={(bbox) => {
            setPendingBbox(bbox);
            setHasMoved(true);
          }}
        />
        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
          {properties.map((property) => {
            const label =
              property.listingType === "SALE"
                ? formatCompactCOP(property.price)
                : formatCompactRentPerMonth(property.price);

            return (
              <Marker
                key={property.id}
                position={[property.latitude, property.longitude]}
                icon={createPriceMarkerIcon(label, property.id === selectedId)}
                eventHandlers={{ click: () => onSelect?.(property.id) }}
              >
                <Popup minWidth={220}>
                  <Link href={`/properties/${property.slug}`} className="flex flex-col gap-2">
                    <div className="relative h-28 w-full overflow-hidden rounded-lg bg-ink-100">
                      {property.coverImageUrl && (
                        <Image
                          src={property.coverImageUrl}
                          alt={property.title}
                          fill
                          sizes="220px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <p className="font-semibold text-ink-900">
                      {property.listingType === "SALE"
                        ? formatCompactCOP(property.price)
                        : formatCompactRentPerMonth(property.price)}
                    </p>
                    <p className="text-xs text-ink-500">
                      {property.neighborhood}, {property.locality}
                    </p>
                  </Link>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {hasMoved && pendingBbox && (
        <button
          type="button"
          onClick={() => {
            onSearchArea?.(pendingBbox);
            setHasMoved(false);
          }}
          className="absolute left-1/2 top-4 z-[500] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-800 shadow-lg transition-transform hover:scale-105"
        >
          Buscar en esta área
        </button>
      )}
    </div>
  );
}
