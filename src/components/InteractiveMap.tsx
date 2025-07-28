import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayersControl, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import { NetworkElement, FiberCable } from '../types/network';
import { networkService } from '../services/networkService';
import {
  Cable,
  Server,
  MapPin,
  Zap,
  Settings,
  Eye,
  EyeOff,
  Layers,
  Navigation
} from 'lucide-react';

// Configuration des icônes Leaflet
const createCustomIcon = (color: string, iconType: string) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">
      <span style="color: white; font-size: 12px;">
        ${iconType === 'cable' ? '━' : iconType === 'dslam' ? '▣' : iconType === 'pole' ? '│' : '●'}
      </span>
    </div>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <foreignObject width="24" height="24">
          ${iconHtml}
        </foreignObject>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const getElementColor = (element: NetworkElement) => {
  switch (element.status) {
    case 'active': return '#10B981';
    case 'maintenance': return '#F59E0B';
    case 'fault': return '#EF4444';
    case 'inactive': return '#6B7280';
    default: return '#8B5CF6';
  }
};

interface InteractiveMapProps {
  selectedLayers: string[];
  onElementSelect?: (element: NetworkElement) => void;
  center?: [number, number];
  zoom?: number;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedLayers,
  onElementSelect,
  center = [4.0511, 9.7679], // Douala par défaut
  zoom = 10
}) => {
  const { t } = useLanguage();
  const [elements, setElements] = useState<NetworkElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);

  useEffect(() => {
    loadNetworkElements();
  }, [selectedLayers, mapBounds]);

  const loadNetworkElements = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (selectedLayers.length > 0 && !selectedLayers.includes('all')) {
        filters.type = selectedLayers[0]; // Simplifié pour la démo
      }
      
      if (mapBounds) {
        filters.bounds = {
          north: mapBounds.getNorth(),
          south: mapBounds.getSouth(),
          east: mapBounds.getEast(),
          west: mapBounds.getWest()
        };
      }

      const networkElements = await networkService.getNetworkElements(filters);
      setElements(networkElements);
    } catch (error) {
      console.error('Erreur lors du chargement des éléments réseau:', error);
    } finally {
      setLoading(false);
    }
  };

  const MapEventHandler = () => {
    const map = useMap();
    
    useEffect(() => {
      const handleMoveEnd = () => {
        setMapBounds(map.getBounds());
      };

      map.on('moveend', handleMoveEnd);
      return () => {
        map.off('moveend', handleMoveEnd);
      };
    }, [map]);

    return null;
  };

  const renderNetworkElement = (element: NetworkElement) => {
    const icon = createCustomIcon(getElementColor(element), element.type);
    
    return (
      <Marker
        key={element.id}
        position={[element.location.lat, element.location.lng]}
        icon={icon}
        eventHandlers={{
          click: () => onElementSelect?.(element)
        }}
      >
        <Popup>
          <div className="p-2 min-w-64">
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: getElementColor(element) }} />
              <h3 className="font-semibold text-sm">{element.name}</h3>
            </div>
            <div className="space-y-1 text-xs">
              <p><span className="font-medium">Type:</span> {element.type}</p>
              <p><span className="font-medium">Statut:</span> {element.status}</p>
              <p><span className="font-medium">Région:</span> {element.region}</p>
              <p><span className="font-medium">Commune:</span> {element.commune}</p>
              {element.type === 'cable' && element.properties.length && (
                <p><span className="font-medium">Longueur:</span> {(element.properties.length / 1000).toFixed(2)} km</p>
              )}
              {element.type === 'dslam' && element.properties.capacity && (
                <p><span className="font-medium">Capacité:</span> {element.properties.capacity} clients</p>
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => onElementSelect?.(element)}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                Voir les détails →
              </button>
            </div>
          </div>
        </Popup>
      </Marker>
    );
  };

  const renderFiberCables = () => {
    return elements
      .filter(el => el.type === 'cable' && selectedLayers.includes('cables'))
      .map(cable => {
        const fiberCable = cable as FiberCable;
        if (!fiberCable.path || fiberCable.path.length < 2) return null;

        const positions: [number, number][] = fiberCable.path.map(point => [point.lat, point.lng]);
        
        return (
          <Polyline
            key={cable.id}
            positions={positions}
            color={getElementColor(cable)}
            weight={4}
            opacity={0.8}
            eventHandlers={{
              click: () => onElementSelect?.(cable)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{cable.name}</h3>
                <p className="text-xs">Longueur: {(fiberCable.properties.length / 1000).toFixed(2)} km</p>
                <p className="text-xs">Fibres: {fiberCable.properties.fiberCount}</p>
                <p className="text-xs">Utilisation: {fiberCable.properties.capacity}%</p>
              </div>
            </Popup>
          </Polyline>
        );
      });
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <MapEventHandler />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
              url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Rendu des câbles fibre */}
        {renderFiberCables()}

        {/* Rendu des équipements et infrastructure */}
        {elements
          .filter(el => el.type !== 'cable')
          .filter(el => selectedLayers.includes('all') || selectedLayers.includes(el.type))
          .map(renderNetworkElement)}
      </MapContainer>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          <span className="text-sm text-gray-600">Chargement des éléments...</span>
        </div>
      )}

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
        <h4 className="font-semibold text-sm mb-2 flex items-center">
          <Layers className="h-4 w-4 mr-1" />
          Légende
        </h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Actif</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Panne</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
            <span>Inactif</span>
          </div>
        </div>
      </div>

      {/* Statistiques en temps réel */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3">
        <h4 className="font-semibold text-sm mb-2">Éléments visibles</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-medium">{elements.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Actifs:</span>
            <span className="font-medium text-green-600">
              {elements.filter(el => el.status === 'active').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Pannes:</span>
            <span className="font-medium text-red-600">
              {elements.filter(el => el.status === 'fault').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;