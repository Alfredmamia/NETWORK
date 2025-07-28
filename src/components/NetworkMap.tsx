import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import InteractiveMap from './InteractiveMap';
import NetworkElementForm from './NetworkElementForm';
import { NetworkElement } from '../types/network';
import { cameroonRegions } from '../data/cameroon-regions';
import { networkService } from '../services/networkService';
import {
  Plus,
  Cable,
  Server,
  MapPin,
  Zap,
  Filter,
  Layers,
  Settings,
  Eye,
  EyeOff,
  Navigation,
  Maximize,
  Edit,
  Save,
  X,
  Target,
  Building,
  Radio,
  Trash2,
  HardHat,
  Wrench,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Icon } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

// Icônes personnalisées pour les différents éléments
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
    iconUrl: `data:image/svg+xml;base64,${btoa(`
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

const NetworkMap: React.FC = () => {
  const { t } = useLanguage();
  const [selectedLayers, setSelectedLayers] = useState<string[]>(['all']);
  const [showFilters, setShowFilters] = useState(false);
  const [showOverviewMap, setShowOverviewMap] = useState(true);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [selectedElement, setSelectedElement] = useState<NetworkElement | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [mapCenter, setMapCenter] = useState<[number, number]>([4.0511, 9.7679]);
  const [mapZoom, setMapZoom] = useState(10);
  const [showElementForm, setShowElementForm] = useState(false);
  
  // États pour l'éditeur cartographique
  const [mapMode, setMapMode] = useState<'select' | 'place'>('select');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('dslam');
  const [placedAssets, setPlacedAssets] = useState<Array<{ 
    lat: number; 
    lng: number; 
    type: string; 
    id: string;
    properties?: any;
  }>>([]);
  const [isPlacingElement, setIsPlacingElement] = useState(false);
  
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
      icon: Navigation, 
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
      icon: Radio, 
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
      icon: HardHat, 
      color: '#8B4513',
      category: 'Infrastructure',
      logo: '🌳'
    },
    { 
      value: 'pole_concrete', 
      label: 'Poteau Béton', 
      icon: HardHat, 
      color: '#6B7280',
      category: 'Infrastructure',
      logo: '🏗️'
    },
    { 
      value: 'pole_metal', 
      label: 'Poteau Métallique', 
      icon: HardHat, 
      color: '#374151',
      category: 'Infrastructure',
      logo: '⚡'
    },
    { 
      value: 'chamber', 
      label: 'Chambre de Tirage', 
      icon: Settings, 
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
  const layerOptions = [
    { value: 'all', label: 'Tous les éléments', icon: Layers },
    { value: 'cables', label: 'Câbles', icon: Cable },
    { value: 'dslam', label: 'DSLAM', icon: Server },
    { value: 'junction_box', label: 'Boîtiers', icon: Settings },
    { value: 'pole', label: 'Poteaux', icon: Zap },
    { value: 'client_equipment', label: 'Points clients', icon: MapPin },
  ];

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
          
          setIsPlacingElement(true);
          setPlacedAssets(prev => [...prev, { 
            lat, 
            lng, 
            type: selectedAssetType, 
            id: assetId,
            properties: { 
              name: `${assetTypes.find(t => t.value === selectedAssetType)?.label} ${assetId}`,
              category: assetTypes.find(t => t.value === selectedAssetType)?.category,
              timestamp: new Date().toISOString()
            }
          }]);
          
          // Feedback visuel
          setTimeout(() => setIsPlacingElement(false), 500);
        }
      }
    });
    return null;
  };
  const handleLayerToggle = (layerValue: string) => {
    if (layerValue === 'all') {
      setSelectedLayers(['all']);
    } else {
      const newLayers = selectedLayers.includes('all') 
        ? [layerValue]
        : selectedLayers.includes(layerValue)
          ? selectedLayers.filter(l => l !== layerValue)
          : [...selectedLayers.filter(l => l !== 'all'), layerValue];
      
      setSelectedLayers(newLayers.length === 0 ? ['all'] : newLayers);
    }
  };

  const handleRegionChange = (regionName: string) => {
    setSelectedRegion(regionName);
    
    if (regionName !== 'all') {
      const region = cameroonRegions.find(r => r.name === regionName);
      if (region) {
        setMapCenter([region.coordinates.lat, region.coordinates.lng]);
        setMapZoom(11);
      }
    } else {
      setMapCenter([4.0511, 9.7679]); // Centre du Cameroun
      setMapZoom(7);
    }
  };

  const handleElementSelect = (element: NetworkElement) => {
    setSelectedElement(element);
  };

  const handleAddElement = async (elementData: Omit<NetworkElement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await networkService.addNetworkElement(elementData);
      setShowElementForm(false);
      // Recharger les éléments si nécessaire
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élément:', error);
    }
  };

  const handleMapSave = async () => {
    if (placedAssets.length === 0) {
      alert('Veuillez placer au moins un élément sur la carte');
      return;
    }

    if (!formData.name.trim()) {
      alert('Veuillez saisir un nom pour l\'élément');
      return;
    }

    try {
      // Sauvegarder tous les éléments placés
      for (const asset of placedAssets) {
        const assetType = assetTypes.find(t => t.value === asset.type);
        
        const elementData = {
          name: `${formData.name} - ${asset.id}`,
          type: asset.type as any,
          location: { lat: asset.lat, lng: asset.lng },
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
            ...asset.properties
          }
        };

        await networkService.addNetworkElement(elementData);
      }
      
      alert(`${placedAssets.length} élément(s) ajouté(s) avec succès !`);
      setShowMapEditor(false);
      setPlacedAssets([]);
      setFormData({
        name: '',
        region: '',
        department: '',
        commune: '',
        status: 'active',
        networkLayer: 'access',
        criticality: 'medium'
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout des éléments:', error);
      alert('Erreur lors de l\'ajout des éléments');
    }
  };

  const clearAssets = () => {
    setPlacedAssets([]);
  };

  const removeAsset = (assetId: string) => {
    setPlacedAssets(prev => prev.filter(asset => asset.id !== assetId));
  };

  const selectedFormRegion = cameroonRegions.find(r => r.name === formData.region);
  const availableDepartments = selectedFormRegion?.departments || [];
  const selectedDepartment = availableDepartments.find(d => d.name === formData.department);
  const availableCommunes = selectedDepartment?.communes || [];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('network.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visualisation et gestion de votre infrastructure réseau
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowOverviewMap(!showOverviewMap)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {showOverviewMap ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showOverviewMap ? 'Masquer' : 'Afficher'} Vue d'ensemble
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </button>
          <button
            onClick={() => setShowMapEditor(!showMapEditor)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showMapEditor ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {showMapEditor ? 'Fermer' : 'Ouvrir'} Éditeur Cartographique
          </button>
          <button
            onClick={() => setShowElementForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('network.addElement')}
          </button>
        </div>
      </div>

      {/* Region Selector */}
      {showOverviewMap && (
        <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Région:</span>
          <select
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="block w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
          >
            <option value="all">Toutes les régions</option>
            {cameroonRegions.map((region) => (
              <option key={region.code} value={region.name}>
                {region.nameFr}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleRegionChange('all')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Vue d'ensemble
          </button>
        </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && showOverviewMap && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Couches visibles</h4>
              <div className="space-y-2">
                {layerOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedLayers.includes(option.value) || selectedLayers.includes('all')}
                      onChange={() => handleLayerToggle(option.value)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex items-center">
                      <option.icon className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Filtres par statut</h4>
              <div className="space-y-2">
                {[
                  { value: 'active', label: 'Actif', color: 'bg-green-500' },
                  { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-500' },
                  { value: 'fault', label: 'Panne', color: 'bg-red-500' },
                  { value: 'inactive', label: 'Inactif', color: 'bg-gray-500' }
                ].map((status) => (
                  <label key={status.value} className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${status.color}`}></div>
                      <span className="text-sm text-gray-700">{status.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Éditeur Cartographique Intégré */}
      {showMapEditor && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex h-[600px]">
            {/* Panneau de contrôle */}
            <div className="w-80 bg-gray-50 p-4 overflow-y-auto border-r border-gray-200">
              {/* Informations de l'élément */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Informations de l'Élément</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Nom de l'élément</label>
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

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={handleMapSave}
                  disabled={placedAssets.length === 0 || !formData.name.trim()}
                  className="flex-1 flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </button>
              </div>
            </div>

            {/* Carte */}
            <div className="flex-1 relative">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                className="rounded-r-lg"
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
                    mapMode === 'place' ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm font-medium">
                    {mapMode === 'place' ? '🎯 Mode Placement' : '🧭 Navigation'}
                  </span>
                </div>
                {mapMode === 'place' && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    Cliquez sur la carte pour placer
                  </div>
                )}
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
              
              {/* Indicateur de placement */}
              {isPlacingElement && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
                  ✅ Élément placé !
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Main Content Grid */}
      {showOverviewMap && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-96 lg:h-[600px]">
              <InteractiveMap
                selectedLayers={selectedLayers}
                onElementSelect={handleElementSelect}
                center={mapCenter}
                zoom={mapZoom}
              />
            </div>
          </div>
        </div>

        {/* Element Details Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            {selectedElement ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Détails</h3>
                  <button
                    onClick={() => setSelectedElement(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedElement.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{selectedElement.type}</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      selectedElement.status === 'active' ? 'bg-green-500' :
                      selectedElement.status === 'maintenance' ? 'bg-yellow-500' :
                      selectedElement.status === 'fault' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm capitalize">{selectedElement.status}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Région:</span>
                      <span className="ml-1">{selectedElement.region}</span>
                    </div>
                    <div>
                      <span className="font-medium">Commune:</span>
                      <span className="ml-1">{selectedElement.commune}</span>
                    </div>
                    <div>
                      <span className="font-medium">Coordonnées:</span>
                      <span className="ml-1 text-xs">
                        {selectedElement.location.lat.toFixed(6)}, {selectedElement.location.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                  
                  {selectedElement.properties && Object.keys(selectedElement.properties).length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Propriétés</h5>
                      <div className="space-y-1 text-sm">
                        {Object.entries(selectedElement.properties).slice(0, 5).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="ml-1">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-200">
                    <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Sélectionnez un élément sur la carte pour voir ses détails</p>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Cable className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Câbles Totaux</p>
              <p className="text-2xl font-semibold text-gray-900">127</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Server className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Équipements</p>
              <p className="text-2xl font-semibold text-gray-900">45</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Points Clients</p>
              <p className="text-2xl font-semibold text-gray-900">2,847</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Couverture</p>
              <p className="text-2xl font-semibold text-gray-900">78%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Network Element Form Modal */}
      {showElementForm && (
        <NetworkElementForm
          onSubmit={handleAddElement}
          onCancel={() => setShowElementForm(false)}
        />
      )}
    </div>
  );
};

export default NetworkMap;