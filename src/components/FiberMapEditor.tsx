import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import { FiberSection, Splice, NETWORK_COLORS } from '../types/fiber';
import { fiberService } from '../services/fiberService';
import {
  Save,
  X,
  MapPin,
  Cable,
  Settings,
  Layers,
  Plus,
  Trash2,
  Edit,
  Navigation,
  Zap
} from 'lucide-react';

interface FiberMapEditorProps {
  onSave: (sectionData: Omit<FiberSection, 'id' | 'fibers' | 'splices' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  existingSections?: FiberSection[];
}

// Fonction pour encoder en base64 compatible avec Unicode
const safeBase64Encode = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (error) {
    // Fallback pour les caractères problématiques
    return btoa(str.replace(/[^\x00-\x7F]/g, ""));
  }
};

// Icônes personnalisées pour les différents éléments
const createCustomIcon = (color: string, iconType: string, size: number = 24) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      font-size: ${size * 0.5}px;
      color: white;
      font-weight: bold;
    ">
      ${iconType === 'start' ? 'A' : iconType === 'end' ? 'B' : iconType === 'splice' ? '⚡' : '●'}
    </div>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${safeBase64Encode(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <foreignObject width="${size}" height="${size}">
          ${iconHtml}
        </foreignObject>
      </svg>
    `)}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

const FiberMapEditor: React.FC<FiberMapEditorProps> = ({ onSave, onCancel, existingSections = [] }) => {
  const { t } = useLanguage();
  const [mapMode, setMapMode] = useState<'select' | 'draw' | 'splice'>('select');
  const [selectedNetworkType, setSelectedNetworkType] = useState<string>('ftth_gpon');
  const [currentPath, setCurrentPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [splices, setSplices] = useState<Array<{ lat: number; lng: number; id: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 24 as const,
    installationType: 'underground' as const,
    installationDate: new Date().toISOString().split('T')[0],
    status: 'projected' as const
  });

  const networkTypes = [
    { value: 'backbone_international', label: 'Backbone International', color: '#DC2626' },
    { value: 'backbone_national', label: 'Backbone National', color: '#DC2626' },
    { value: 'metropolitan', label: 'Métropolitain', color: '#F97316' },
    { value: 'pole_wood', label: 'Poteau Bois', icon: Navigation, color: '#8B4513' },
    { value: 'pole_concrete', label: 'Poteau Béton', icon: Navigation, color: '#6B7280' },
    { value: 'pole_metal', label: 'Poteau Métallique', icon: Navigation, color: '#374151' },
    { value: 'p2p_dedicated', label: 'P2P Dédié', color: '#10B981' },
    { value: 'adsl_copper', label: 'ADSL/Cuivre', color: '#3B82F6' }
  ];

  const capacityOptions = [4, 6, 8, 12, 24, 48, 72, 96, 144, 288, 576];

  const getNetworkColor = () => {
    const networkType = networkTypes.find(nt => nt.value === selectedNetworkType);
    return networkType?.color || '#10B981';
  };

  // Composant pour gérer les clics sur la carte
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        
        if (mapMode === 'draw') {
          setCurrentPath(prev => [...prev, { lat, lng }]);
        } else if (mapMode === 'splice') {
          const spliceId = `SPL-${Date.now()}`;
          setSplices(prev => [...prev, { lat, lng, id: spliceId }]);
        }
      }
    });
    return null;
  };

  const handleSave = () => {
    if (currentPath.length < 2) {
      alert('Veuillez dessiner un tracé avec au moins 2 points');
      return;
    }

    if (!formData.name.trim()) {
      alert('Veuillez saisir un nom pour le tronçon');
      return;
    }

    // Calculer la longueur approximative
    let totalLength = 0;
    for (let i = 1; i < currentPath.length; i++) {
      const prev = currentPath[i - 1];
      const curr = currentPath[i];
      const distance = calculateDistance(prev, curr);
      totalLength += distance;
    }

    const sectionData = {
      name: formData.name,
      startPoint: {
        ...currentPath[0],
        name: `Point A - ${formData.name}`
      },
      endPoint: {
        ...currentPath[currentPath.length - 1],
        name: `Point B - ${formData.name}`
      },
      length: Math.round(totalLength),
      capacity: formData.capacity,
      installationType: formData.installationType,
      installationDate: new Date(formData.installationDate),
      status: formData.status,
      path: currentPath,
      networkType: selectedNetworkType,
      color: getNetworkColor()
    };

    onSave(sectionData);
  };

  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = toRadians(point2.lat - point1.lat);
    const dLng = toRadians(point2.lng - point1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const clearPath = () => {
    setCurrentPath([]);
    setSplices([]);
  };

  const removeSplice = (spliceId: string) => {
    setSplices(prev => prev.filter(s => s.id !== spliceId));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 h-5/6 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Éditeur Cartographique de Tronçons Fibre</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-full space-x-4">
          {/* Panneau de contrôle */}
          <div className="w-80 bg-gray-50 p-4 rounded-lg overflow-y-auto">
            {/* Informations du tronçon */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Informations du Tronçon</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Nom du tronçon</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    placeholder="ex: Douala-Yaoundé Segment 1"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700">Type de réseau</label>
                  <select
                    value={selectedNetworkType}
                    onChange={(e) => setSelectedNetworkType(e.target.value)}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    {networkTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2" 
                      style={{ backgroundColor: getNetworkColor() }}
                    />
                    <span className="text-xs text-gray-500">Couleur sur la carte</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Capacité</label>
                    <select
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) as any })}
                      className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      {capacityOptions.map((capacity) => (
                        <option key={capacity} value={capacity}>{capacity}F</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Type de pose</label>
                    <select
                      value={formData.installationType}
                      onChange={(e) => setFormData({ ...formData, installationType: e.target.value as any })}
                      className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="underground">Souterrain</option>
                      <option value="aerial">Aérien</option>
                      <option value="conduit">Conduit</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Outils de dessin */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Outils de Dessin</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setMapMode('draw')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    mapMode === 'draw' 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Cable className="h-4 w-4 mr-2" />
                  {mapMode === 'draw' ? '🎯 Mode Tracé Actif' : 'Dessiner le tracé'}
                </button>
                
                <button
                  onClick={() => setMapMode('splice')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    mapMode === 'splice' 
                      ? 'bg-orange-600 text-white shadow-lg' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {mapMode === 'splice' ? '🎯 Mode Manchons Actif' : 'Placer manchons'}
                </button>
                
                <button
                  onClick={() => setMapMode('select')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    mapMode === 'select' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigation
                </button>
                
                <button
                  onClick={clearPath}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Effacer tout
                </button>
              </div>
            </div>

            {/* Informations du tracé */}
            {currentPath.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Tracé Actuel</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Points:</span>
                    <span className="font-medium">{currentPath.length}</span>
                  </div>
                  {currentPath.length > 1 && (
                    <div className="flex justify-between">
                      <span>Longueur:</span>
                      <span className="font-medium">
                        {(() => {
                          let totalLength = 0;
                          for (let i = 1; i < currentPath.length; i++) {
                            totalLength += calculateDistance(currentPath[i - 1], currentPath[i]);
                          }
                          return `${(totalLength / 1000).toFixed(2)} km`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Liste des manchons */}
            {splices.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Manchons Placés</h4>
                <div className="space-y-2">
                  {splices.map((splice) => (
                    <div key={splice.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-orange-600 mr-2" />
                        <span className="text-xs">{splice.id}</span>
                      </div>
                      <button
                        onClick={() => removeSplice(splice.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Instructions</h4>
              <div className="text-xs text-gray-600 space-y-1">
                {mapMode === 'draw' && (
                  <p>🖱️ Cliquez sur la carte pour dessiner le tracé du câble</p>
                )}
                {mapMode === 'splice' && (
                  <p>⚡ Cliquez sur la carte pour placer des manchons de raccordement</p>
                )}
                {mapMode === 'select' && (
                  <p>🧭 Mode navigation - déplacez-vous sur la carte</p>
                )}
              </div>
            </div>
          </div>

          {/* Carte */}
          <div className="flex-1 relative">
            <MapContainer
              center={[4.0511, 9.7679]} // Douala
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Couche Google Maps (simulation) */}
              <TileLayer
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                opacity={0.8}
              />

              <MapClickHandler />

              {/* Tronçons existants */}
              {existingSections.map((section) => (
                <React.Fragment key={section.id}>
                  {section.path && section.path.length > 1 && (
                    <Polyline
                      positions={section.path.map(p => [p.lat, p.lng])}
                      color={section.color || '#10B981'}
                      weight={3}
                      opacity={0.6}
                      dashArray="5, 5"
                    />
                  )}
                </React.Fragment>
              ))}

              {/* Tracé en cours */}
              {currentPath.length > 1 && (
                <Polyline
                  positions={currentPath.map(p => [p.lat, p.lng])}
                  color={getNetworkColor()}
                  weight={4}
                  opacity={0.8}
                />
              )}

              {/* Points du tracé */}
              {currentPath.map((point, index) => (
                <Marker
                  key={index}
                  position={[point.lat, point.lng]}
                  icon={createCustomIcon(
                    getNetworkColor(),
                    index === 0 ? 'start' : index === currentPath.length - 1 ? 'end' : 'point'
                  )}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">
                        {index === 0 ? 'Point de départ' : index === currentPath.length - 1 ? 'Point d\'arrivée' : `Point ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-600">
                        {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Manchons */}
              {splices.map((splice) => (
                <Marker
                  key={splice.id}
                  position={[splice.lat, splice.lng]}
                  icon={createCustomIcon('#F97316', 'splice', 20)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">Manchon {splice.id}</p>
                      <p className="text-xs text-gray-600">
                        {splice.lat.toFixed(6)}, {splice.lng.toFixed(6)}
                      </p>
                      <button
                        onClick={() => removeSplice(splice.id)}
                        className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Indicateur de mode */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  mapMode === 'draw' ? 'bg-green-500' : 
                  mapMode === 'splice' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
                <span className="text-sm font-medium">
                  {mapMode === 'draw' ? 'Dessin' : 
                   mapMode === 'splice' ? 'Manchons' : 'Navigation'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={currentPath.length < 2 || !formData.name.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2 inline" />
            Enregistrer le Tronçon
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiberMapEditor;