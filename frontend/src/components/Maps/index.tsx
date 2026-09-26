import { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface ServiceNode {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
}

interface IServiceMap {
  serviceNodes: ServiceNode[];
  size?: 's' | 'l';
  dotSize?: 's' | 'l';
}

const ZoomWatcher = ({ onZoomChange }: { onZoomChange: (zoom: number) => void }) => {
  useMapEvents({
    zoomend(e) {
      onZoomChange(e.target.getZoom());
    }
  });
  return null;
};

const createCustomIcon = (size: number) =>
  L.divIcon({
    className: '',
    html: renderToStaticMarkup(
      <div
        className="rounded-full bg-cyan-600"
        style={{
          width: size,
          height: size,
        }}
      />
    ),
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });

const ServiceMap = ({ serviceNodes, dotSize = 's' }: IServiceMap) => {
  const [zoom, setZoom] = useState(2);

  const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}{r}.png'

  const tileAttribution = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>';

  const getIconSize = (zoom: number): number => {
    const clampedZoom = Math.max(2, Math.min(zoom, 18));
    const base = 1.8;
    const scale = Math.pow(base, clampedZoom - 2);
    const size = (dotSize === "s" ? 1 : 5) * Math.min(40, Math.max(3, scale));
    return Math.round(size);
  };

  return (
    <div className='rounded-lg overflow-hidden w-full h-full'>
      <MapContainer
        zoomControl
        center={[32.4279, 53.6880]}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ZoomWatcher onZoomChange={setZoom} />
        <TileLayer attribution={tileAttribution} url={tileUrl} />
        {serviceNodes.map((service) => (
          <Marker
            key={service.id}
            position={[service.lat, service.lng]}
            icon={createCustomIcon(getIconSize(zoom))}
          >
            <Popup>
              <strong>{service.name}</strong><br />
              {service.description}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ServiceMap;
