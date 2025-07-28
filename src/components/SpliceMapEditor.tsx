import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import { OpticalSplice, networkTypeConfig, spliceTypeConfig } from '../types/splice';
import { cameroonRegions } from '../data/cameroon-regions';
import {
  Save,
  X,
  MapPin,
  Zap,
  Settings,
  Navigation,
  Trash2,
  Plus,
  Cable,
  Layers,
  Satellite,
  Map as MapIcon,
  ZoomIn,
  ZoomOut,
  Move3D
} from 'lucide-react';

// Fonction pour encoder en base64 compatible avec Unicode
const safeBase64Encode = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (error) {
    return btoa(str.replace(/[^\x00-\x7F]/g, ""));
  }
};

interface SpliceMapEditorProps {
  onSave: (spliceData: any) => void;
  onCancel: () => void;
  existingSplices?: OpticalSplice[];
}

// Icônes personnalisées pour les manchons
const createCustomIcon = (color: string, iconType: string, size: number = 32) => {
  const getIconSymbol = (type: string) => {
    switch (type) {
      case 'aerial': return '🌤️';
      case 'underground': return '🕳️';
      case 'cabinet': return '🗄️';
      case 'manhole': return '🕳️';
      default: return '⚡';
    }
  };

  const iconHtml = `
    <div style="
      background: linear-gradient(135deg, ${color}, ${color}dd);
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      font-size: ${size * 0.4}px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
    ">
      ${getIconSymbol(iconType)}
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

const SpliceMapEditor: React.FC<SpliceMapEditorProps> = ({ 
  onSave, 
  onCancel, 
  existingSplices = []
}) => {
  const { t } = useLanguage();
  const [mapMode, setMapMode] = useState<'select' | 'place'>('select');
  const [selectedSpliceType, setSelectedSpliceType] = useState<string>('underground');
  const [selectedNetworkType, setSelectedNetworkType] = useState<string>('ftth_gpon');
  const [placedSplices, setPlacedSplices] = useState<Array<{ 
    lat: number; 
    lng: number; 
    type: string; 
    id: string;
    properties?: any;
  }>>([]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [mapZoom, setMapZoom] = useState(13);
  const [mapCenter, setMapCenter] = useState<[number, number]>([4.0511, 9.7679]);
  const [isPlacingElement, setIsPlacingElement] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    technician: '',
    inputCableName: '',
    inputCapacity: 24,
    outputCableName: '',
    outputCapacity: 24,
    materialReference: '',
    notes: '',
    region: '',
    department: '',
    commune: ''
  });

  const mapTypes = [
    { value: 'roadmap', label: 'Plan', icon: MapIcon },
    { value: 'satellite', label: 'Satellite', icon: Satellite },
    { value: 'hybrid', label: 'Hybride', icon: Layers },
    { value: 'terrain', label: 'Relief', icon: Move3D }
  ];

  const getSpliceColor = () => {
    return networkTypeConfig[selectedNetworkType as keyof typeof networkTypeConfig]?.color || '#F97316';
  };

  const getSpliceIcon = () => {
    return spliceTypeConfig[selectedSpliceType as keyof typeof spliceTypeConfig]?.icon || '⚡';
  };

  // Composant pour gérer les clics sur la carte
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (mapMode === 'place') {
          const { lat, lng } = e.latlng;
          const spliceId = `SPL-${Date.now()}`;
          
          setIsPlacingElement(true);
          setPlacedSplices(prev => [...prev, { 
            lat, 
            lng, 
            type: selectedSpliceType, 
            id: spliceId,
            properties: { 
              name: `${spliceTypeConfig[selectedSpliceType as keyof typeof spliceTypeConfig]?.label} ${spliceId}`,
              networkType: selectedNetworkType,
              timestamp: new Date().toISOString()
            }
          }]);
          
          setTimeout(() => setIsPlacingElement(false), 500);
        }
      },
      zoomend: (e) => {
        setMapZoom(e.target.getZoom());
      },
      moveend: (e) => {
        const center = e.target.getCenter();
        setMapCenter([center.lat, center.lng]);
      }
    });
    return null;
  };

  const handleSave = () => {
    if (placedSplices.length === 0) {
      alert('Veuillez placer au moins un manchon sur la carte');
      return;
    }

    if (!formData.name.trim()) {
      alert('Veuillez saisir un nom pour le manchon');
      return;
    }

    // Pour la démo, on sauvegarde le premier manchon placé
    const firstSplice = placedSplices[0];

    const inputCable = spliceService.generateCableConnection(
      `CBL-IN-${Date.now()}`,
      formData.inputCableName || `Câble Entrée ${firstSplice.id}`,
      formData.inputCapacity,
      selectedNetworkType
    );

    const outputCable = spliceService.generateCableConnection(
      `CBL-OUT-${Date.now()}`,
      formData.outputCableName || `Câble Sortie ${firstSplice.id}`,
      formData.outputCapacity,
      selectedNetworkType
    );

    const spliceData = {
      name: formData.name,
      location: {
        lat: firstSplice.lat,
        lng: firstSplice.lng,
        name: `${formData.name} - ${firstSplice.lat.toFixed(6)}, ${firstSplice.lng.toFixed(6)}`
      },
      type: selectedSpliceType,
      networkType: selectedNetworkType,
      status: 'planned',
      installDate: new Date(),
      technician: formData.technician || 'À assigner',
      inputCable,
      outputCable,
      materialReference: formData.materialReference,
      photos: [],
      notes: formData.notes,
      region: formData.region || 'Littoral',
      department: formData.department || 'Wouri',
      commune: formData.commune || 'Douala 1er'
    };

    onSave(spliceData);
  };

  const clearSplices = () => {
    setPlacedSplices([]);
  };

  const removeSplice = (spliceId: string) => {
    setPlacedSplices(prev => prev.filter(splice => splice.id !== spliceId));
  };

  const selectedRegion = cameroonRegions.find(r => r.name === formData.region);
  const availableDepartments = selectedRegion?.departments || [];
  const selectedDepartment = availableDepartments.find(d => d.name === formData.department);
  const availableCommunes = selectedDepartment?.communes || [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 h-5/6 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Éditeur Cartographique de Manchons Optiques</h3>
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
            {/* Informations du manchon */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Informations du Manchon</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Nom du manchon</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    placeholder="ex: Manchon Distribution Makepe Nord"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Type de réseau</label>
                  <select
                    value={selectedNetworkType}
                    onChange={(e) => setSelectedNetworkType(e.target.value)}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    {Object.entries(networkTypeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                  <div className="mt-1 flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2" 
                      style={{ backgroundColor: getSpliceColor() }}
                    />
                    <span className="text-xs text-gray-500">Couleur sur la carte</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Type de manchon</label>
                  <select
                    value={selectedSpliceType}
                    onChange={(e) => setSelectedSpliceType(e.target.value)}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    {Object.entries(spliceTypeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Région</label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        region: e.target.value,
                        department: '',
                        commune: ''
                      })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                    >
                      <option value="">Région</option>
                      {cameroonRegions.map((region) => (
                        <option key={region.code} value={region.name}>
                          {region.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Département</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        department: e.target.value,
                        commune: ''
                      })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                      disabled={!formData.region}
                    >
                      <option value="">Sélectionner un département</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept.code} value={dept.name}>
                          {dept.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Commune</label>
                    <select
                      value={formData.commune}
                      onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                      disabled={!formData.department}
                    >
                      <option value="">Sélectionner une commune</option>
                      {availableCommunes.map((commune) => (
                        <option key={commune.code} value={commune.name}>
                          {commune.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration des câbles */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Configuration des Câbles</h4>
              <div className="space-y-4">
                {/* Câble d'entrée */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Câble d'Entrée</h5>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.inputCableName}
                      onChange={(e) => setFormData({ ...formData, inputCableName: e.target.value })}
                      className="block w-full text-xs border border-gray-300 rounded-md px-2 py-1"
                      placeholder="Nom du câble d'entrée"
                    />
                    <select
                      value={formData.inputCapacity}
                      onChange={(e) => setFormData({ ...formData, inputCapacity: parseInt(e.target.value) })}
                      className="block w-full text-xs border border-gray-300 rounded-md px-2 py-1"
                    >
                      {[4, 6, 8, 12, 24, 48, 72, 96, 144, 288, 576].map((capacity) => (
                        <option key={capacity} value={capacity}>{capacity}F</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Câble de sortie */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Câble de Sortie</h5>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.outputCableName}
                      onChange={(e) => setFormData({ ...formData, outputCableName: e.target.value })}
                      className="block w-full text-xs border border-gray-300 rounded-md px-2 py-1"
                      placeholder="Nom du câble de sortie"
                    />
                    <select
                      value={formData.outputCapacity}
                      onChange={(e) => setFormData({ ...formData, outputCapacity: parseInt(e.target.value) })}
                      className="block w-full text-xs border border-gray-300 rounded-md px-2 py-1"
                    >
                      {[4, 6, 8, 12, 24, 48, 72, 96, 144, 288, 576].map((capacity) => (
                        <option key={capacity} value={capacity}>{capacity}F</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contrôles de carte Google Maps */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Contrôles de Carte</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Type de carte</label>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {mapTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setMapType(type.value as any)}
                        className={`flex items-center px-2 py-1 text-xs rounded ${
                          mapType === type.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <type.icon className="h-3 w-3 mr-1" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMapZoom(Math.min(mapZoom + 1, 20))}
                    className="flex-1 flex items-center justify-center px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <ZoomIn className="h-3 w-3 mr-1" />
                    Zoom +
                  </button>
                  <button
                    onClick={() => setMapZoom(Math.max(mapZoom - 1, 1))}
                    className="flex-1 flex items-center justify-center px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <ZoomOut className="h-3 w-3 mr-1" />
                    Zoom -
                  </button>
                </div>
              </div>
            </div>

            {/* Outils de placement */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Outils de Placement</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setMapMode('place')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    mapMode === 'place'
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {mapMode === 'place' ? '🎯 Mode Placement Actif' : 'Placer manchon'}
                </button>
                
                <button
                  onClick={() => setMapMode('select')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    mapMode === 'select'
                      ? 'bg-gray-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigation
                </button>
                
                <button
                  onClick={clearSplices}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Effacer tout
                </button>
              </div>
            </div>

            {/* Manchon sélectionné */}
            {selectedSpliceType && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Manchon Sélectionné</h4>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white"
                      style={{ backgroundColor: getSpliceColor() }}
                    >
                      {getSpliceIcon()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {spliceTypeConfig[selectedSpliceType as keyof typeof spliceTypeConfig]?.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {networkTypeConfig[selectedNetworkType as keyof typeof networkTypeConfig]?.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des manchons placés */}
            {placedSplices.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Manchons Placés ({placedSplices.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {placedSplices.map((splice) => (
                    <div key={splice.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center mr-2 text-white text-xs"
                          style={{ backgroundColor: getSpliceColor() }}
                        >
                          {getSpliceIcon()}
                        </div>
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
                {mapMode === 'place' && (
                  <p>🖱️ Cliquez sur la carte pour placer le manchon sélectionné</p>
                )}
                {mapMode === 'select' && (
                  <p>🧭 Mode navigation - déplacez-vous sur la carte</p>
                )}
              </div>
            </div>
          </div>

          {/* Carte avec fonctionnalités Google Maps */}
          <div className="flex-1 relative">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
              zoomControl={false}
              attributionControl={false}
            >
              {/* Couches de carte selon le type sélectionné */}
              {mapType === 'roadmap' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              )}
              
              {mapType === 'satellite' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
                  url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                />
              )}
              
              {mapType === 'hybrid' && (
                <>
                  <TileLayer
                    attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
                    url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                  />
                  <TileLayer
                    attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
                    url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
                    opacity={0.7}
                  />
                </>
              )}
              
              {mapType === 'terrain' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.google.com/maps">Google</a>'
                  url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
                />
              )}

              <MapClickHandler />

              {/* Manchons existants */}
              {existingSplices.map((splice) => (
                <Marker
                  key={splice.id}
                  position={[splice.location.lat, splice.location.lng]}
                  icon={createCustomIcon('#6B7280', splice.type, 24)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{splice.name}</p>
                      <p className="text-xs text-gray-600">Existant - {splice.type}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Manchons placés */}
              {placedSplices.map((splice) => (
                <Marker
                  key={splice.id}
                  position={[splice.lat, splice.lng]}
                  icon={createCustomIcon(getSpliceColor(), splice.type, 32)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{spliceTypeConfig[splice.type as keyof typeof spliceTypeConfig]?.label} {splice.id}</p>
                      <p className="text-xs text-gray-600">
                        {splice.lat.toFixed(6)}, {splice.lng.toFixed(6)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Réseau: {networkTypeConfig[selectedNetworkType as keyof typeof networkTypeConfig]?.label}
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

            {/* Contrôles de carte style Google Maps */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md">
              <div className="flex flex-col">
                <button
                  onClick={() => setMapZoom(Math.min(mapZoom + 1, 20))}
                  className="p-2 hover:bg-gray-100 border-b border-gray-200"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setMapZoom(Math.max(mapZoom - 1, 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Indicateur de mode */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  mapMode === 'place' ? 'bg-orange-500 animate-pulse' : 'bg-gray-500'
                }`} />
                <span className="text-sm font-medium">
                  {mapMode === 'place' ? '🎯 Placement Manchon' : '🧭 Navigation'}
                </span>
              </div>
            </div>

            {/* Légende */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
              <h4 className="font-semibold text-sm mb-2">Types de Manchons</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(spliceTypeConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: config.color }}
                    />
                    <span>{config.icon} {config.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations de carte */}
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-2 text-xs">
              <div>Zoom: {mapZoom}</div>
              <div>Type: {mapType}</div>
              <div>Centre: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</div>
            </div>

            {/* Indicateur de placement */}
            {isPlacingElement && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
                ✅ Manchon placé !
              </div>
            )}
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
            disabled={placedSplices.length === 0 || !formData.name.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2 inline" />
            Sauvegarder le Manchon
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpliceMapEditor;