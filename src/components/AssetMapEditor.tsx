import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { NetworkElement } from '../types/network';
import { cameroonRegions } from '../data/cameroon-regions';
import { Save, X, MapPin, Cable, Server, Settings, Zap, Building, Radio, Target, Navigation, Trash2, Plus, Database, Router, Antenna, Power as Tower } from 'lucide-react';

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

interface AssetMapEditorProps {
  onSave: (assetData: Omit<NetworkElement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  existingAssets?: NetworkElement[];
}

// Icônes personnalisées pour les différents éléments avec logos
const createCustomIcon = (color: string, iconType: string, size: number = 32) => {
  const getIconSymbol = (type: string) => {
    switch (type) {
      case 'cable': return '━';
      case 'dslam': return '▣';
      case 'junction_box': return '⬜';
      case 'distribution_point': return '◆';
      case 'client_equipment': return '📡';
      case 'pole_wood': return '🌳';
      case 'pole_concrete': return '🏗️';
      case 'pole_metal': return '⚡';
      case 'conduit': return '━';
      case 'chamber': return '⬛';
      case 'repeater': return '🔄';
      case 'router': return '📶';
      case 'switch': return '🔀';
      case 'antenna': return '📡';
      case 'bts': return '📡';
      case 'datacenter': return '🏢';
      default: return '●';
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
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      font-size: ${size * 0.4}px;
      color: white;
      font-weight: bold;
      position: relative;
    ">
      ${getIconSymbol(iconType)}
      <div style="
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: ${size * 0.3}px;
        height: ${size * 0.3}px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.2}px;
        color: ${color};
      ">
        ${iconType.includes('pole') ? '│' : '●'}
      </div>
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

const AssetMapEditor: React.FC<AssetMapEditorProps> = ({ 
  onSave, 
  onCancel, 
  existingAssets = []
}) => {
  const [mapMode, setMapMode] = useState<'select' | 'place'>('select');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('dslam');
  const [placedAssets, setPlacedAssets] = useState<Array<{ 
    lat: number; 
    lng: number; 
    type: string; 
    id: string;
    properties?: any;
  }>>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    department: '',
    commune: '',
    status: 'active' as const,
    networkLayer: 'access' as const,
    criticality: 'medium' as const
  });

  // Types d'actifs avec logos et couleurs
  const assetTypes = [
    // Backbone
    { 
      value: 'cable', 
      label: 'Câble Fibre', 
      icon: Cable, 
      color: '#DC2626',
      category: 'Backbone',
      logo: '━'
    },
    { 
      value: 'repeater', 
      label: 'Répéteur Optique', 
      icon: Zap, 
      color: '#DC2626',
      category: 'Backbone',
      logo: '🔄'
    },
    { 
      value: 'datacenter', 
      label: 'Datacenter', 
      icon: Building, 
      color: '#DC2626',
      category: 'Backbone',
      logo: '🏢'
    },
    
    // Métropolitain
    { 
      value: 'router', 
      label: 'Routeur', 
      icon: Router, 
      color: '#F97316',
      category: 'Métropolitain',
      logo: '📶'
    },
    { 
      value: 'switch', 
      label: 'Commutateur', 
      icon: Settings, 
      color: '#F97316',
      category: 'Métropolitain',
      logo: '🔀'
    },
    
    // Accès
    { 
      value: 'dslam', 
      label: 'DSLAM', 
      icon: Server, 
      color: '#10B981',
      category: 'Accès',
      logo: '▣'
    },
    { 
      value: 'bts', 
      label: 'Station BTS', 
      icon: Antenna, 
      color: '#10B981',
      category: 'Accès',
      logo: '📡'
    },
    { 
      value: 'junction_box', 
      label: 'Boîtier de Raccordement', 
      icon: Target, 
      color: '#10B981',
      category: 'Accès',
      logo: '⬜'
    },
    { 
      value: 'distribution_point', 
      label: 'Point de Distribution', 
      icon: MapPin, 
      color: '#10B981',
      category: 'Accès',
      logo: '◆'
    },
    
    // Infrastructure
    { 
      value: 'pole_wood', 
      label: 'Poteau Bois', 
      icon: Tower, 
      color: '#8B4513',
      category: 'Infrastructure',
      logo: '🌳'
    },
    { 
      value: 'pole_concrete', 
      label: 'Poteau Béton', 
      icon: Tower, 
      color: '#6B7280',
      category: 'Infrastructure',
      logo: '🏗️'
    },
    { 
      value: 'pole_metal', 
      label: 'Poteau Métallique', 
      icon: Tower, 
      color: '#374151',
      category: 'Infrastructure',
      logo: '⚡'
    },
    { 
      value: 'chamber', 
      label: 'Chambre de Tirage', 
      icon: Database, 
      color: '#6B7280',
      category: 'Infrastructure',
      logo: '⬛'
    },
    { 
      value: 'conduit', 
      label: 'Conduit', 
      icon: Cable, 
      color: '#6B7280',
      category: 'Infrastructure',
      logo: '━'
    },
    
    // Client
    { 
      value: 'client_equipment', 
      label: 'Équipement Client', 
      icon: Radio, 
      color: '#3B82F6',
      category: 'Client',
      logo: '📡'
    }
  ];

  const categories = ['Tous', 'Backbone', 'Métropolitain', 'Accès', 'Infrastructure', 'Client'];
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const filteredAssetTypes = selectedCategory === 'Tous' 
    ? assetTypes 
    : assetTypes.filter(type => type.category === selectedCategory);

  const getAssetColor = () => {
    const assetType = assetTypes.find(at => at.value === selectedAssetType);
    return assetType?.color || '#10B981';
  };

  const getAssetLogo = () => {
    const assetType = assetTypes.find(at => at.value === selectedAssetType);
    return assetType?.logo || '●';
  };

  // Composant pour gérer les clics sur la carte
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (mapMode === 'place') {
          const { lat, lng } = e.latlng;
          const assetId = `${selectedAssetType.toUpperCase()}-${Date.now()}`;
          
          setPlacedAssets(prev => [...prev, { 
            lat, 
            lng, 
            type: selectedAssetType, 
            id: assetId,
            properties: { 
              name: `${assetTypes.find(t => t.value === selectedAssetType)?.label} ${assetId}`,
              category: assetTypes.find(t => t.value === selectedAssetType)?.category
            }
          }]);
        }
      }
    });
    return null;
  };

  const handleSave = () => {
    if (placedAssets.length === 0) {
      alert('Veuillez placer au moins un élément sur la carte');
      return;
    }

    if (!formData.name.trim()) {
      alert('Veuillez saisir un nom pour l\'actif');
      return;
    }

    // Pour la démo, on sauvegarde le premier élément placé
    const firstAsset = placedAssets[0];
    const assetType = assetTypes.find(t => t.value === firstAsset.type);

    const assetData = {
      name: formData.name,
      type: firstAsset.type as any,
      location: { lat: firstAsset.lat, lng: firstAsset.lng },
      status: formData.status,
      region: formData.region,
      department: formData.department,
      commune: formData.commune,
      networkLayer: formData.networkLayer,
      criticality: formData.criticality,
      properties: {
        category: assetType?.category,
        color: assetType?.color,
        logo: assetType?.logo,
        placedAssets: placedAssets.length,
        ...firstAsset.properties
      }
    };

    onSave(assetData);
  };

  const clearAssets = () => {
    setPlacedAssets([]);
  };

  const removeAsset = (assetId: string) => {
    setPlacedAssets(prev => prev.filter(asset => asset.id !== assetId));
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
          <h3 className="text-lg font-medium text-gray-900">Éditeur Cartographique d'Inventaire</h3>
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
            {/* Informations de l'actif */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Informations de l'Actif</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Nom de l'actif</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    placeholder="ex: DSLAM Bonanjo Principal"
                  />
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

            {/* Sélection de catégorie */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Catégorie d'Équipement</h4>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2 py-1 text-xs rounded-md ${
                      selectedCategory === category
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Types d'actifs avec logos */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Types d'Équipements</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredAssetTypes.map((assetType) => (
                  <button
                    key={assetType.value}
                    onClick={() => setSelectedAssetType(assetType.value)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      selectedAssetType === assetType.value
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-white text-xs"
                      style={{ backgroundColor: assetType.color }}
                    >
                      {assetType.logo}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{assetType.label}</div>
                      <div className="text-xs opacity-75">{assetType.category}</div>
                    </div>
                  </button>
                ))}
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
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {mapMode === 'place' ? '🎯 Mode Placement Actif' : 'Placer sur la carte'}
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
                  onClick={clearAssets}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Effacer tout
                </button>
              </div>
            </div>

            {/* Actif sélectionné */}
            {selectedAssetType && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Actif Sélectionné</h4>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white"
                      style={{ backgroundColor: getAssetColor() }}
                    >
                      {getAssetLogo()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {assetTypes.find(t => t.value === selectedAssetType)?.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {assetTypes.find(t => t.value === selectedAssetType)?.category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des actifs placés */}
            {placedAssets.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Actifs Placés ({placedAssets.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {placedAssets.map((asset) => {
                    const assetType = assetTypes.find(t => t.value === asset.type);
                    return (
                      <div key={asset.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center mr-2 text-white text-xs"
                            style={{ backgroundColor: assetType?.color }}
                          >
                            {assetType?.logo}
                          </div>
                          <span className="text-xs">{asset.id}</span>
                        </div>
                        <button
                          onClick={() => removeAsset(asset.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Instructions</h4>
              <div className="text-xs text-gray-600 space-y-1">
                {mapMode === 'place' && (
                  <p>🖱️ Cliquez sur la carte pour placer l'équipement sélectionné</p>
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

              {/* Actifs existants */}
              {existingAssets.map((asset) => (
                <Marker
                  key={asset.id}
                  position={[asset.location.lat, asset.location.lng]}
                  icon={createCustomIcon('#6B7280', asset.type, 24)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-xs text-gray-600">Existant - {asset.type}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Actifs placés */}
              {placedAssets.map((asset) => {
                const assetType = assetTypes.find(t => t.value === asset.type);
                return (
                  <Marker
                    key={asset.id}
                    position={[asset.lat, asset.lng]}
                    icon={createCustomIcon(assetType?.color || '#10B981', asset.type, 32)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-medium">{assetType?.label} {asset.id}</p>
                        <p className="text-xs text-gray-600">
                          {asset.lat.toFixed(6)}, {asset.lng.toFixed(6)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Catégorie: {assetType?.category}</p>
                        <button
                          onClick={() => removeAsset(asset.id)}
                          className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Indicateur de mode */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  mapMode === 'place' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <span className="text-sm font-medium">
                  {mapMode === 'place' ? 'Placement' : 'Navigation'}
                </span>
              </div>
            </div>

            {/* Légende des catégories */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
              <h4 className="font-semibold text-sm mb-2">Catégories d'Équipements</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
                  <span>Backbone</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span>Métropolitain</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Accès</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                  <span>Infrastructure</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Client</span>
                </div>
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
            disabled={placedAssets.length === 0 || !formData.name.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2 inline" />
            Enregistrer l'Actif
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetMapEditor;