import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import { Client } from '../types';
import { cameroonRegions } from '../data/cameroon-regions';
import { 
  Save, 
  X, 
  Building, 
  Building2, 
  Navigation, 
  Plus, 
  Home,
  Factory,
  School,
  Hospital,
  ShoppingCart,
  Coffee
} from 'lucide-react';

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

interface ClientMapEditorProps {
  onSave: (clientData: Omit<Client, 'id' | 'installationDate'>) => void;
  onCancel: () => void;
  existingClients?: Client[];
}

// Icônes personnalisées pour les différents types de clients
const createCustomIcon = (color: string, iconType: string, size: number = 32) => {
  const getIconSymbol = (type: string) => {
    switch (type) {
      case 'residential': return '🏠';
      case 'business': return '🏢';
      case 'enterprise': return '🏭';
      case 'government': return '🏛️';
      case 'education': return '🏫';
      case 'healthcare': return '🏥';
      case 'retail': return '🛒';
      case 'hospitality': return '☕';
      default: return '👤';
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

const ClientMapEditor: React.FC<ClientMapEditorProps> = ({ 
  onSave, 
  onCancel, 
  existingClients = []
}) => {
  const [mapMode, setMapMode] = useState<'select' | 'place'>('select');
  const [selectedClientType, setSelectedClientType] = useState<string>('residential');
  const [placedClients, setPlacedClients] = useState<Array<{ 
    lat: number; 
    lng: number; 
    type: string; 
    id: string;
    properties?: any;
  }>>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contractType: 'residential' as const,
    status: 'active' as const,
    bandwidth: 50,
    region: '',
    commune: '',
    businessType: '',
    priority: 'normal' as const
  });

  // Types de clients avec logos et couleurs
  const clientTypes = [
    // Résidentiel
    { 
      value: 'residential', 
      label: 'Résidentiel', 
      icon: Home, 
      color: '#10B981',
      category: 'Résidentiel',
      logo: '🏠'
    },
    
    // Entreprises
    { 
      value: 'business', 
      label: 'Petite Entreprise', 
      icon: Building, 
      color: '#3B82F6',
      category: 'Entreprise',
      logo: '🏢'
    },
    { 
      value: 'enterprise', 
      label: 'Grande Entreprise', 
      icon: Building2, 
      color: '#8B5CF6',
      category: 'Entreprise',
      logo: '🏭'
    },
    
    // Secteur Public
    { 
      value: 'government', 
      label: 'Administration', 
      icon: Building2, 
      color: '#DC2626',
      category: 'Public',
      logo: '🏛️'
    },
    { 
      value: 'education', 
      label: 'Éducation', 
      icon: School, 
      color: '#F59E0B',
      category: 'Public',
      logo: '🏫'
    },
    { 
      value: 'healthcare', 
      label: 'Santé', 
      icon: Hospital, 
      color: '#EF4444',
      category: 'Public',
      logo: '🏥'
    },
    
    // Commercial
    { 
      value: 'retail', 
      label: 'Commerce', 
      icon: ShoppingCart, 
      color: '#06B6D4',
      category: 'Commercial',
      logo: '🛒'
    },
    { 
      value: 'hospitality', 
      label: 'Hôtellerie', 
      icon: Coffee, 
      color: '#84CC16',
      category: 'Commercial',
      logo: '☕'
    }
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

  const contractTypes = [
    { value: 'residential', label: 'Résidentiel', color: '#10B981' },
    { value: 'business', label: 'Entreprise', color: '#3B82F6' },
    { value: 'enterprise', label: 'Grande Entreprise', color: '#8B5CF6' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Actif', color: '#10B981' },
    { value: 'suspended', label: 'Suspendu', color: '#F59E0B' },
    { value: 'pending', label: 'En attente', color: '#6B7280' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Basse', color: '#6B7280' },
    { value: 'normal', label: 'Normale', color: '#10B981' },
    { value: 'high', label: 'Haute', color: '#F59E0B' },
    { value: 'critical', label: 'Critique', color: '#EF4444' }
  ];

  const categories = ['Tous', 'Résidentiel', 'Entreprise', 'Public', 'Commercial'];
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const filteredClientTypes = selectedCategory === 'Tous' 
    ? clientTypes 
    : clientTypes.filter(type => type.category === selectedCategory);

  const getClientColor = () => {
    const clientType = clientTypes.find(ct => ct.value === selectedClientType);
    return clientType?.color || '#10B981';
  };

  const getClientLogo = () => {
    const clientType = clientTypes.find(ct => ct.value === selectedClientType);
    return clientType?.logo || '👤';
  };

  // Composant pour gérer les clics sur la carte
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (mapMode === 'place') {
          const { lat, lng } = e.latlng;
          const clientId = `CL-${Date.now()}`;
          
          setPlacedClients(prev => [...prev, { 
            lat, 
            lng, 
            type: selectedClientType, 
            id: clientId,
            properties: { 
              name: `${clientTypes.find(t => t.value === selectedClientType)?.label} ${clientId}`,
              category: clientTypes.find(t => t.value === selectedClientType)?.category,
              bandwidth: formData.bandwidth,
              contractType: formData.contractType
            }
          }]);
        }
      }
    });
    return null;
  };

  const handleSave = () => {
    if (placedClients.length === 0) {
      alert('Veuillez placer au moins un client sur la carte');
      return;
    }

    if (!formData.name.trim()) {
      alert('Veuillez saisir un nom pour le client');
      return;
    }

    // Pour la démo, on sauvegarde le premier client placé
    const firstClient = placedClients[0];
    const clientType = clientTypes.find(t => t.value === firstClient.type);

    const clientData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      location: { lat: firstClient.lat, lng: firstClient.lng },
      contractType: formData.contractType,
      status: formData.status,
      bandwidth: formData.bandwidth,
      region: formData.region,
      commune: formData.commune
    };

    onSave(clientData);
  };

  const clearClients = () => {
    setPlacedClients([]);
  };

  const removeClient = (clientId: string) => {
    setPlacedClients(prev => prev.filter(client => client.id !== clientId));
  };

  const selectedRegion = cameroonRegions.find(r => r.name === formData.region);
  const availableDepartments = selectedRegion?.departments || [];
  const selectedDepartment = availableDepartments.find(d => d.name === formData.commune);
  const availableCommunes = selectedDepartment?.communes || [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 h-5/6 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Éditeur Cartographique de Clients</h3>
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    placeholder="ex: Jean Mballa"
                  />
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Région</label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        region: e.target.value,
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
                    <label className="block text-xs font-medium text-gray-700">Commune</label>
                    <select
                      value={formData.commune}
                      onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                      disabled={!formData.region}
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
              <h4 className="text-sm font-medium text-gray-900 mb-3">Catégorie de Client</h4>
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

            {/* Types de clients avec logos */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Types de Clients</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredClientTypes.map((clientType) => (
                  <button
                    key={clientType.value}
                    onClick={() => setSelectedClientType(clientType.value)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      selectedClientType === clientType.value
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-white text-xs"
                      style={{ backgroundColor: clientType.color }}
                    >
                      {clientType.logo}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{clientType.label}</div>
                      <div className="text-xs opacity-75">{clientType.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Configuration du service */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Configuration du Service</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Type de contrat</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value as any })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    {contractTypes.map((contract) => (
                      <option key={contract.value} value={contract.value}>
                        {contract.label}
                      </option>
                    ))}
                  </select>
                </div>

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
                    <label className="block text-xs font-medium text-gray-700">Statut</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Priorité</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="mt-1 block w-full text-xs border border-gray-300 rounded-md px-1 py-1"
                    >
                      {priorityOptions.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
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
                  onClick={clearClients}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Effacer tout
                </button>
              </div>
            </div>

            {/* Client sélectionné */}
            {selectedClientType && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Client Sélectionné</h4>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white"
                      style={{ backgroundColor: getClientColor() }}
                    >
                      {getClientLogo()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {clientTypes.find(t => t.value === selectedClientType)?.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {clientTypes.find(t => t.value === selectedClientType)?.category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des clients placés */}
            {placedClients.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Clients Placés ({placedClients.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {placedClients.map((client) => {
                    const clientType = clientTypes.find(t => t.value === client.type);
                    return (
                      <div key={client.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center">
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center mr-2 text-white text-xs"
                            style={{ backgroundColor: clientType?.color }}
                          >
                            {clientType?.logo}
                          </div>
                          <span className="text-xs">{client.id}</span>
                        </div>
                        <button
                          onClick={() => removeClient(client.id)}
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
                  <p>🖱️ Cliquez sur la carte pour placer le client sélectionné</p>
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

              {/* Clients existants */}
              {existingClients.map((client) => (
                <Marker
                  key={client.id}
                  position={[client.location.lat, client.location.lng]}
                  icon={createCustomIcon('#6B7280', client.contractType, 24)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-gray-600">Existant - {client.contractType}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Clients placés */}
              {placedClients.map((client) => {
                const clientType = clientTypes.find(t => t.value === client.type);
                return (
                  <Marker
                    key={client.id}
                    position={[client.lat, client.lng]}
                    icon={createCustomIcon(clientType?.color || '#10B981', client.type, 32)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-medium">{clientType?.label} {client.id}</p>
                        <p className="text-xs text-gray-600">
                          {client.lat.toFixed(6)}, {client.lng.toFixed(6)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Bande passante: {client.properties?.bandwidth} Mbps
                        </p>
                        <button
                          onClick={() => removeClient(client.id)}
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
              <h4 className="font-semibold text-sm mb-2">Types de Clients</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Résidentiel</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Entreprise</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span>Grande Entreprise</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Public</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
                  <span>Commercial</span>
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
            disabled={placedClients.length === 0 || !formData.name.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2 inline" />
            Enregistrer le Client
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientMapEditor;