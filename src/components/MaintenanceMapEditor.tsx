import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import { MaintenanceTicket } from '../types';
import { cameroonRegions } from '../data/cameroon-regions';
import { Save, X, MapPin, AlertTriangle, Clock, Zap, Navigation, Trash2, Plus, Settings, Wrench, PenTool as Tool, HardHat, Truck, Radio, Wifi, Cable, Server } from 'lucide-react';

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

interface MaintenanceMapEditorProps {
  onSave: (ticketData: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt' | 'workLog'>) => void;
  onCancel: () => void;
  existingTickets?: MaintenanceTicket[];
}

// Icônes personnalisées pour les différents types de maintenance
const createCustomIcon = (color: string, iconType: string, size: number = 32) => {
  const getIconSymbol = (type: string) => {
    switch (type) {
      case 'preventive': return '🔧';
      case 'corrective': return '⚠️';
      case 'emergency': return '🚨';
      case 'installation': return '🔨';
      case 'inspection': return '🔍';
      case 'upgrade': return '⬆️';
      case 'repair': return '🛠️';
      case 'replacement': return '🔄';
      default: return '⚙️';
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

const MaintenanceMapEditor: React.FC<MaintenanceMapEditorProps> = ({ 
  onSave, 
  onCancel, 
  existingTickets = []
}) => {
  const { t } = useLanguage();
  const [mapMode, setMapMode] = useState<'select' | 'place'>('select');
  const [selectedMaintenanceType, setSelectedMaintenanceType] = useState<string>('preventive');
  const [placedTickets, setPlacedTickets] = useState<Array<{ 
    lat: number; 
    lng: number; 
    type: string; 
    id: string;
    properties?: any;
  }>>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    type: 'preventive' as const,
    assignedTo: '',
    address: '',
    region: '',
    department: '',
    commune: '',
    affectedClients: 0,
    estimatedResolutionTime: 2,
    equipmentType: '',
    interventionType: ''
  });

  // Types de maintenance avec logos et couleurs
  const maintenanceTypes = [
    // Maintenance préventive
    { 
      value: 'preventive', 
      label: 'Maintenance Préventive', 
      icon: Settings, 
      color: '#10B981',
      category: 'Préventive',
      logo: '🔧'
    },
    { 
      value: 'inspection', 
      label: 'Inspection Périodique', 
      icon: Tool, 
      color: '#06B6D4',
      category: 'Préventive',
      logo: '🔍'
    },
    
    // Maintenance corrective
    { 
      value: 'corrective', 
      label: 'Maintenance Corrective', 
      icon: Wrench, 
      color: '#F59E0B',
      category: 'Corrective',
      logo: '⚠️'
    },
    { 
      value: 'repair', 
      label: 'Réparation', 
      icon: Tool, 
      color: '#EF4444',
      category: 'Corrective',
      logo: '🛠️'
    },
    { 
      value: 'replacement', 
      label: 'Remplacement', 
      icon: Settings, 
      color: '#8B5CF6',
      category: 'Corrective',
      logo: '🔄'
    },
    
    // Urgence
    { 
      value: 'emergency', 
      label: 'Intervention d\'Urgence', 
      icon: AlertTriangle, 
      color: '#DC2626',
      category: 'Urgence',
      logo: '🚨'
    },
    
    // Installation
    { 
      value: 'installation', 
      label: 'Installation', 
      icon: HardHat, 
      color: '#3B82F6',
      category: 'Installation',
      logo: '🔨'
    },
    { 
      value: 'upgrade', 
      label: 'Mise à Niveau', 
      icon: Zap, 
      color: '#84CC16',
      category: 'Installation',
      logo: '⬆️'
    }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Basse', color: '#6B7280' },
    { value: 'medium', label: 'Moyenne', color: '#F59E0B' },
    { value: 'high', label: 'Haute', color: '#EF4444' },
    { value: 'critical', label: 'Critique', color: '#DC2626' }
  ];

  const equipmentTypes = [
    { value: 'cable', label: 'Câble Fibre', icon: Cable },
    { value: 'dslam', label: 'DSLAM', icon: Server },
    { value: 'router', label: 'Routeur', icon: Wifi },
    { value: 'switch', label: 'Commutateur', icon: Settings },
    { value: 'antenna', label: 'Antenne', icon: Radio },
    { value: 'pole', label: 'Poteau', icon: Zap },
    { value: 'chamber', label: 'Chambre', icon: Settings },
    { value: 'junction_box', label: 'Boîtier', icon: Settings }
  ];

  const interventionTypes = [
    { value: 'on_site', label: 'Sur Site', icon: Truck },
    { value: 'remote', label: 'À Distance', icon: Radio },
    { value: 'mixed', label: 'Mixte', icon: Settings }
  ];

  const technicians = [
    'Jean Mballa',
    'Marie Fotso',
    'Paul Nkomo',
    'André Biya',
    'Équipe Technique A',
    'Équipe Technique B',
    'Équipe Intervention Rapide'
  ];

  const categories = ['Tous', 'Préventive', 'Corrective', 'Urgence', 'Installation'];
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const filteredMaintenanceTypes = selectedCategory === 'Tous' 
    ? maintenanceTypes 
    : maintenanceTypes.filter(type => type.category === selectedCategory);

  const getMaintenanceColor = () => {
    const maintenanceType = maintenanceTypes.find(mt => mt.value === selectedMaintenanceType);
    return maintenanceType?.color || '#F59E0B';
  };

  const getMaintenanceLogo = () => {
    const maintenanceType = maintenanceTypes.find(mt => mt.value === selectedMaintenanceType);
    return maintenanceType?.logo || '⚙️';
  };

  // Composant pour gérer les clics sur la carte
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (mapMode === 'place') {
          const { lat, lng } = e.latlng;
          const ticketId = `TK-${Date.now()}`;
          
          setPlacedTickets(prev => [...prev, { 
            lat, 
            lng, 
            type: selectedMaintenanceType, 
            id: ticketId,
            properties: { 
              title: `${maintenanceTypes.find(t => t.value === selectedMaintenanceType)?.label} ${ticketId}`,
              category: maintenanceTypes.find(t => t.value === selectedMaintenanceType)?.category,
              priority: formData.priority,
              equipmentType: formData.equipmentType
            }
          }]);
        }
      }
    });
    return null;
  };

  const handleSave = () => {
    if (placedTickets.length === 0) {
      alert('Veuillez placer au moins un ticket sur la carte');
      return;
    }

    if (!formData.title.trim()) {
      alert('Veuillez saisir un titre pour le ticket');
      return;
    }

    // Pour la démo, on sauvegarde le premier ticket placé
    const firstTicket = placedTickets[0];
    const maintenanceType = maintenanceTypes.find(t => t.value === firstTicket.type);

    const ticketData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'open' as const,
      type: formData.type,
      assignedTo: formData.assignedTo,
      location: {
        lat: firstTicket.lat,
        lng: firstTicket.lng,
        address: formData.address,
        region: formData.region,
        department: formData.department,
        commune: formData.commune
      },
      affectedElements: [],
      affectedClients: formData.affectedClients,
      estimatedResolutionTime: formData.estimatedResolutionTime
    };

    onSave(ticketData);
  };

  const clearTickets = () => {
    setPlacedTickets([]);
  };

  const removeTicket = (ticketId: string) => {
    setPlacedTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
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
          <h3 className="text-lg font-medium text-gray-900">Éditeur Cartographique de Maintenance</h3>
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
            {/* Informations du ticket */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Informations du Ticket</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Titre du ticket</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    placeholder="ex: Panne fibre optique - Secteur Bonanjo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    rows={2}
                    placeholder="Description détaillée du problème"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    placeholder="Adresse précise de l'intervention"
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
              <h4 className="text-sm font-medium text-gray-900 mb-3">Catégorie de Maintenance</h4>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2 py-1 text-xs rounded-md ${
                      selectedCategory === category
                        ? 'bg-orange-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Types de maintenance avec logos */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Types de Maintenance</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredMaintenanceTypes.map((maintenanceType) => (
                  <button
                    key={maintenanceType.value}
                    onClick={() => setSelectedMaintenanceType(maintenanceType.value)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      selectedMaintenanceType === maintenanceType.value
                        ? 'bg-orange-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-white text-xs"
                      style={{ backgroundColor: maintenanceType.color }}
                    >
                      {maintenanceType.logo}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{maintenanceType.label}</div>
                      <div className="text-xs opacity-75">{maintenanceType.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Configuration de l'intervention */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Configuration de l'Intervention</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Priorité</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Technicien assigné</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="">Sélectionner un technicien</option>
                    {technicians.map((tech) => (
                      <option key={tech} value={tech}>
                        {tech}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Équipement</label>
                    <select
                      value={formData.equipmentType}
                      onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                    >
                      <option value="">Type équipement</option>
                      {equipmentTypes.map((equipment) => (
                        <option key={equipment.value} value={equipment.value}>
                          {equipment.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Type intervention</label>
                    <select
                      value={formData.interventionType}
                      onChange={(e) => setFormData({ ...formData, interventionType: e.target.value })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                    >
                      <option value="">Type intervention</option>
                      {interventionTypes.map((intervention) => (
                        <option key={intervention.value} value={intervention.value}>
                          {intervention.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Clients affectés</label>
                    <input
                      type="number"
                      value={formData.affectedClients}
                      onChange={(e) => setFormData({ ...formData, affectedClients: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Temps estimé (h)</label>
                    <input
                      type="number"
                      value={formData.estimatedResolutionTime}
                      onChange={(e) => setFormData({ ...formData, estimatedResolutionTime: parseInt(e.target.value) || 2 })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                      min="0.5"
                      step="0.5"
                    />
                  </div>
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
                  onClick={clearTickets}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Effacer tout
                </button>
              </div>
            </div>

            {/* Maintenance sélectionnée */}
            {selectedMaintenanceType && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Maintenance Sélectionnée</h4>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white"
                      style={{ backgroundColor: getMaintenanceColor() }}
                    >
                      {getMaintenanceLogo()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {maintenanceTypes.find(t => t.value === selectedMaintenanceType)?.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {maintenanceTypes.find(t => t.value === selectedMaintenanceType)?.category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des tickets placés */}
            {placedTickets.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Tickets Placés ({placedTickets.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {placedTickets.map((ticket) => {
                    const maintenanceType = maintenanceTypes.find(t => t.value === ticket.type);
                    return (
                      <div key={ticket.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center mr-2 text-white text-xs"
                            style={{ backgroundColor: maintenanceType?.color }}
                          >
                            {maintenanceType?.logo}
                          </div>
                          <span className="text-xs">{ticket.id}</span>
                        </div>
                        <button
                          onClick={() => removeTicket(ticket.id)}
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
                  <p>🖱️ Cliquez sur la carte pour placer le ticket de maintenance</p>
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

              {/* Tickets existants */}
              {existingTickets.map((ticket) => (
                <Marker
                  key={ticket.id}
                  position={[ticket.location.lat, ticket.location.lng]}
                  icon={createCustomIcon('#6B7280', ticket.type, 24)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-xs text-gray-600">Existant - {ticket.type}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Tickets placés */}
              {placedTickets.map((ticket) => {
                const maintenanceType = maintenanceTypes.find(t => t.value === ticket.type);
                return (
                  <Marker
                    key={ticket.id}
                    position={[ticket.lat, ticket.lng]}
                    icon={createCustomIcon(maintenanceType?.color || '#F59E0B', ticket.type, 32)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-medium">{maintenanceType?.label} {ticket.id}</p>
                        <p className="text-xs text-gray-600">
                          {ticket.lat.toFixed(6)}, {ticket.lng.toFixed(6)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Priorité: {ticket.properties?.priority}
                        </p>
                        <button
                          onClick={() => removeTicket(ticket.id)}
                          className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Zone d'impact pour les tickets critiques */}
              {placedTickets
                .filter(ticket => ticket.properties?.priority === 'critical')
                .map((ticket) => (
                  <Circle
                    key={`impact-${ticket.id}`}
                    center={[ticket.lat, ticket.lng]}
                    radius={500} // 500m de rayon d'impact
                    color="#DC2626"
                    fillColor="#DC2626"
                    fillOpacity={0.1}
                    weight={2}
                    dashArray="5, 5"
                  />
                ))}
            </MapContainer>

            {/* Indicateur de mode */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  mapMode === 'place' ? 'bg-orange-500' : 'bg-gray-500'
                }`} />
                <span className="text-sm font-medium">
                  {mapMode === 'place' ? 'Placement' : 'Navigation'}
                </span>
              </div>
            </div>

            {/* Légende des catégories */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
              <h4 className="font-semibold text-sm mb-2">Types de Maintenance</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Préventive</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Corrective</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Urgence</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Installation</span>
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
            disabled={placedTickets.length === 0 || !formData.title.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2 inline" />
            Enregistrer le Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMapEditor;