import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import { NetworkElement } from '../types/network';
import { cameroonRegions } from '../data/cameroon-regions';
import { networkService } from '../services/networkService';
import {
  Save,
  X,
  Route,
  Zap,
  Settings,
  Target,
  Navigation,
  Trash2,
  Users,
  Building,
  Home,
  Factory,
  School,
  Hospital,
  ShoppingCart,
  Coffee,
  Layers,
  Satellite,
  Map as MapIcon,
  ZoomIn,
  ZoomOut,
  Move3D
} from 'lucide-react';

interface ConnectionMapEditorProps {
  onSave: (connectionData: any) => void;
  onCancel: () => void;
  existingConnections?: any[];
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

// Icônes personnalisées avec fonctionnalités Google Maps
const createCustomIcon = (color: string, iconType: string, size: number = 32) => {
  const getIconSymbol = (type: string) => {
    switch (type) {
      case 'central_office': return '🏢';
      case 'optical_splice': return '⚡';
      case 'junction_box': return '📦';
      case 'client_residential': return '🏠';
      case 'client_business': return '🏢';
      case 'client_enterprise': return '🏭';
      case 'pole_wood': return '🌳';
      case 'pole_concrete': return '🏗️';
      case 'pole_metal': return '⚡';
      case 'cable': return '━';
      case 'path_point': return '●';
      default: return '📍';
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

const ConnectionMapEditor: React.FC<ConnectionMapEditorProps> = ({ 
  onSave, 
  onCancel
}) => {
  const [mapMode, setMapMode] = useState<'select' | 'place_client' | 'trace_path'>('select');
  const [selectedStartPoint, setSelectedStartPoint] = useState<any>(null);
  const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tracePath, setTracePath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [availableStartPoints, setAvailableStartPoints] = useState<NetworkElement[]>([]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [mapZoom, setMapZoom] = useState(13);
  const [mapCenter, setMapCenter] = useState<[number, number]>([4.0511, 9.7679]);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientType: 'residential' as const,
    email: '',
    phone: '',
    address: '',
    bandwidth: 50,
    contractType: 'residential' as const,
    region: '',
    department: '',
    commune: '',
    installationType: 'aerial' as const,
    fiberCount: 1,
    priority: 'normal' as const
  });

  useEffect(() => {
    loadStartPoints();
  }, []);

  const loadStartPoints = async () => {
    try {
      // Charger les points de départ disponibles
      const elements = await networkService.getNetworkElements({
        type: 'dslam'
      });
      
      // Ajouter des points de démo
      const demoPoints = [
        {
          id: 'CO-DOUALA-01',
          type: 'central_office' as const,
          name: 'Central Office Bonanjo',
          location: { lat: 4.0511, lng: 9.7679 },
          status: 'active' as const,
          region: 'Littoral',
          department: 'Wouri',
          commune: 'Douala 1er',
          networkLayer: 'backbone' as const,
          criticality: 'critical' as const,
          properties: { capacity: 10000, type: 'central_office' },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'SPL-MAKEPE-01',
          type: 'optical_splice' as const,
          name: 'Manchon Optique Makepe',
          location: { lat: 4.0661, lng: 9.7529 },
          status: 'active' as const,
          region: 'Littoral',
          department: 'Wouri',
          commune: 'Douala 5ème',
          networkLayer: 'access' as const,
          criticality: 'high' as const,
          properties: { capacity: 144, spliceType: 'fusion' },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'JB-AKWA-01',
          type: 'junction_box' as const,
          name: 'Boîtier Raccordement Akwa',
          location: { lat: 4.0411, lng: 9.7779 },
          status: 'active' as const,
          region: 'Littoral',
          department: 'Wouri',
          commune: 'Douala 1er',
          networkLayer: 'access' as const,
          criticality: 'medium' as const,
          properties: { capacity: 48, boxType: 'outdoor' },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      setAvailableStartPoints([...elements, ...demoPoints]);
    } catch (error) {
      console.error('Erreur lors du chargement des points de départ:', error);
    }
  };

  const clientTypes = [
    { value: 'residential', label: 'Résidentiel', icon: Home, color: '#10B981' },
    { value: 'business', label: 'Petite Entreprise', icon: Building, color: '#3B82F6' },
    { value: 'enterprise', label: 'Grande Entreprise', icon: Factory, color: '#8B5CF6' },
    { value: 'government', label: 'Administration', icon: Building, color: '#DC2626' },
    { value: 'education', label: 'Éducation', icon: School, color: '#F59E0B' },
    { value: 'healthcare', label: 'Santé', icon: Hospital, color: '#EF4444' },
    { value: 'retail', label: 'Commerce', icon: ShoppingCart, color: '#06B6D4' },
    { value: 'hospitality', label: 'Hôtellerie', icon: Coffee, color: '#84CC16' }
  ];

  const bandwidthOptions = [
    { value: 10, label: '10 Mbps', price: 15000 },
    { value: 25, label: '25 Mbps', price: 25000 },
    { value: 50, label: '50 Mbps', price: 35000 },
    { value: 100, label: '100 Mbps', price: 50000 },
    { value: 200, label: '200 Mbps', price: 75000 },
    { value: 500, label: '500 Mbps', price: 125000 },
    { value: 1000, label: '1 Gbps', price: 200000 }
  ];

  const installationTypes = [
    { value: 'aerial', label: 'Aérien', color: '#10B981', cost: 700 },
    { value: 'underground', label: 'Souterrain', color: '#3B82F6', cost: 1200 },
    { value: 'mixed', label: 'Mixte', color: '#8B5CF6', cost: 950 }
  ];

  const mapTypes = [
    { value: 'roadmap', label: 'Plan', icon: MapIcon },
    { value: 'satellite', label: 'Satellite', icon: Satellite },
    { value: 'hybrid', label: 'Hybride', icon: Layers },
    { value: 'terrain', label: 'Relief', icon: Move3D }
  ];

  // Composant pour gérer les clics sur la carte avec fonctionnalités Google Maps
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        
        if (mapMode === 'place_client') {
          setClientLocation({ lat, lng });
        } else if (mapMode === 'trace_path' && selectedStartPoint && clientLocation) {
          setTracePath(prev => [...prev, { lat, lng }]);
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

  const calculatePath = () => {
    if (!selectedStartPoint || !clientLocation) return;

    // Calcul automatique du chemin optimal
    const path = [
      selectedStartPoint.location,
      ...tracePath,
      clientLocation
    ];

    // Calcul de la distance totale
    let totalDistance = 0;
    for (let i = 1; i < path.length; i++) {
      const distance = calculateDistance(path[i - 1], path[i]);
      totalDistance += distance;
    }

    // Calcul du coût estimé
    const installationType = installationTypes.find(t => t.value === formData.installationType);
    const costPerMeter = installationType?.cost || 700;
    const estimatedCost = totalDistance * costPerMeter;

    return {
      path,
      distance: totalDistance,
      estimatedCost
    };
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

  const handleSave = () => {
    if (!selectedStartPoint || !clientLocation) {
      alert('Veuillez sélectionner un point de départ et placer le client');
      return;
    }

    if (!formData.clientName.trim()) {
      alert('Veuillez saisir le nom du client');
      return;
    }

    const pathCalculation = calculatePath();
    if (!pathCalculation) return;

    // Créer les éléments last mile nécessaires
    const lastMileElements: NetworkElement[] = [];
    
    // Ajouter des poteaux si installation aérienne
    if (formData.installationType === 'aerial') {
      tracePath.forEach((point, index) => {
        lastMileElements.push({
          id: `POLE-${Date.now()}-${index}`,
          type: 'pole',
          name: `Poteau ${index + 1} - ${formData.clientName}`,
          location: point,
          status: 'planned',
          region: formData.region,
          department: formData.department,
          commune: formData.commune,
          networkLayer: 'access',
          criticality: 'medium',
          properties: {
            poleType: 'concrete',
            height: 12,
            material: 'concrete'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }

    // Ajouter le câble de raccordement
    lastMileElements.push({
      id: `CABLE-${Date.now()}`,
      type: 'cable',
      name: `Câble Raccordement ${formData.clientName}`,
      location: clientLocation,
      status: 'planned',
      region: formData.region,
      department: formData.department,
      commune: formData.commune,
      networkLayer: 'client',
      criticality: 'medium',
      properties: {
        length: pathCalculation.distance,
        fiberCount: formData.fiberCount,
        cableType: 'single_mode',
        installation: formData.installationType,
        capacity: 100,
        networkType: 'ftth_gpon'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const connectionData = {
      clientId: `CL-${Date.now()}`,
      clientName: formData.clientName,
      clientLocation,
      startPoint: {
        id: selectedStartPoint.id,
        name: selectedStartPoint.name,
        type: selectedStartPoint.type,
        location: selectedStartPoint.location
      },
      path: pathCalculation.path,
      distance: pathCalculation.distance,
      estimatedCost: pathCalculation.estimatedCost,
      fiberCount: formData.fiberCount,
      installationType: formData.installationType,
      status: 'simulated',
      lastMileElements
    };

    onSave(connectionData);
  };

  const clearAll = () => {
    setSelectedStartPoint(null);
    setClientLocation(null);
    setTracePath([]);
  };

  const selectedFormRegion = cameroonRegions.find(r => r.name === formData.region);
  const availableDepartments = selectedFormRegion?.departments || [];
  const selectedDepartment = availableDepartments.find(d => d.name === formData.department);
  const availableCommunes = selectedDepartment?.communes || [];

  const pathCalculation = calculatePath();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 h-5/6 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Simulateur de Raccordement Last Mile</h3>
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
            {/* Informations du client */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Informations du Client</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Nom du client</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    placeholder="ex: Jean Mballa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Type de client</label>
                  <select
                    value={formData.clientType}
                    onChange={(e) => setFormData({ ...formData, clientType: e.target.value as any })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    {clientTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    placeholder="Quartier, Ville"
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
                      <option value="">Sélectionner une région</option>
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

            {/* Sélection du point de départ */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Point de Départ</h4>
              <div className="space-y-2">
                {availableStartPoints.map((point) => {
                  const isSelected = selectedStartPoint?.id === point.id;
                  const IconComponent = point.type === 'central_office' ? Settings :
                                      point.type === 'optical_splice' ? Zap : Target;
                  
                  return (
                    <button
                      key={point.id}
                      onClick={() => setSelectedStartPoint(point)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{point.name}</div>
                        <div className="text-xs opacity-75">{point.type}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Configuration du service */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Configuration du Service</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Bande passante</label>
                  <select
                    value={formData.bandwidth}
                    onChange={(e) => setFormData({ ...formData, bandwidth: parseInt(e.target.value) })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    {bandwidthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.price.toLocaleString()} FCFA/mois
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Type d'installation</label>
                    <select
                      value={formData.installationType}
                      onChange={(e) => setFormData({ ...formData, installationType: e.target.value as any })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                    >
                      {installationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Nombre de fibres</label>
                    <select
                      value={formData.fiberCount}
                      onChange={(e) => setFormData({ ...formData, fiberCount: parseInt(e.target.value) })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                    >
                      <option value={1}>1 fibre</option>
                      <option value={2}>2 fibres</option>
                      <option value={4}>4 fibres</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Outils de simulation avec fonctionnalités Google Maps */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Outils de Simulation</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setMapMode('place_client')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    mapMode === 'place_client'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {mapMode === 'place_client' ? '🎯 Mode Placement Client Actif' : 'Placer le client'}
                </button>
                
                <button
                  onClick={() => setMapMode('trace_path')}
                  disabled={!selectedStartPoint || !clientLocation}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    mapMode === 'trace_path'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                  }`}
                >
                  <Route className="h-4 w-4 mr-2" />
                  {mapMode === 'trace_path' ? '🎯 Mode Tracé Actif' : 'Tracer l\'itinéraire'}
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
                  onClick={clearAll}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Effacer tout
                </button>
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

            {/* Calculs en temps réel */}
            {pathCalculation && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Calculs Automatiques</h4>
                <div className="bg-white p-3 rounded border space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Distance:</span>
                    <span className="font-medium">{(pathCalculation.distance / 1000).toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Coût estimé:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XAF',
                        minimumFractionDigits: 0,
                      }).format(pathCalculation.estimatedCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Points de tracé:</span>
                    <span className="font-medium">{pathCalculation.path.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Type installation:</span>
                    <span className="font-medium capitalize">{formData.installationType}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Instructions</h4>
              <div className="text-xs text-gray-600 space-y-1">
                {mapMode === 'place_client' && (
                  <p>🖱️ Cliquez sur la carte pour placer le client</p>
                )}
                {mapMode === 'trace_path' && (
                  <p>🛤️ Cliquez pour tracer l'itinéraire de raccordement</p>
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

              {/* Points de départ disponibles */}
              {availableStartPoints.map((point) => (
                <Marker
                  key={point.id}
                  position={[point.location.lat, point.location.lng]}
                  icon={createCustomIcon(
                    selectedStartPoint?.id === point.id ? '#10B981' : '#6B7280',
                    point.type,
                    selectedStartPoint?.id === point.id ? 36 : 28
                  )}
                  eventHandlers={{
                    click: () => setSelectedStartPoint(point)
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{point.name}</p>
                      <p className="text-xs text-gray-600 capitalize">{point.type.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {point.location.lat.toFixed(6)}, {point.location.lng.toFixed(6)}
                      </p>
                      <button
                        onClick={() => setSelectedStartPoint(point)}
                        className="mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Sélectionner
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Client placé */}
              {clientLocation && (
                <Marker
                  position={[clientLocation.lat, clientLocation.lng]}
                  icon={createCustomIcon('#3B82F6', `client_${formData.clientType}`, 32)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{formData.clientName || 'Nouveau Client'}</p>
                      <p className="text-xs text-gray-600 capitalize">{formData.clientType}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {clientLocation.lat.toFixed(6)}, {clientLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Points du tracé */}
              {tracePath.map((point, index) => (
                <Marker
                  key={`trace-${index}`}
                  position={[point.lat, point.lng]}
                  icon={createCustomIcon('#F59E0B', 'path_point', 16)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">Point {index + 1}</p>
                      <p className="text-xs text-gray-600">
                        {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Tracé du chemin */}
              {selectedStartPoint && clientLocation && (
                <Polyline
                  positions={[
                    selectedStartPoint.location,
                    ...tracePath,
                    clientLocation
                  ].map(p => [p.lat, p.lng])}
                  color="#10B981"
                  weight={4}
                  opacity={0.8}
                  dashArray={tracePath.length === 0 ? "10, 10" : undefined}
                />
              )}
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
                  mapMode === 'place_client' ? 'bg-blue-500 animate-pulse' : 
                  mapMode === 'trace_path' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`} />
                <span className="text-sm font-medium">
                  {mapMode === 'place_client' ? '🎯 Placement Client' : 
                   mapMode === 'trace_path' ? '🛤️ Tracé Itinéraire' : '🧭 Navigation'}
                </span>
              </div>
            </div>

            {/* Légende */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
              <h4 className="font-semibold text-sm mb-2">Légende</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                  <span>Points de départ disponibles</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Point de départ sélectionné</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Client à raccorder</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span>Points de tracé</span>
                </div>
              </div>
            </div>

            {/* Informations de carte */}
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-2 text-xs">
              <div>Zoom: {mapZoom}</div>
              <div>Type: {mapType}</div>
              <div>Centre: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</div>
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
            disabled={!selectedStartPoint || !clientLocation || !formData.clientName.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2 inline" />
            Sauvegarder la Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionMapEditor;