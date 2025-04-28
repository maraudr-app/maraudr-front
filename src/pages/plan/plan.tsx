import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to set the view once the map is initialized
function SetViewOnLoad({ coords }: { coords: [number, number] }) {
    const map = useMap();
    React.useEffect(() => {
        map.setView(coords, 13);
    }, [map, coords]);

    return null;
}

const Plan: React.FC = () => {
    const position: [number, number] = [48.8566, 2.3522]; // Paris

    return (
        <div className="h-96">
            <MapContainer
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <SetViewOnLoad coords={position} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        Paris, France
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default Plan;