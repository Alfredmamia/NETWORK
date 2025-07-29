import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMapEvents } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import { NetworkProject, NetworkElement, NETWORK_COLORS } from '../types/network';
import { cameroonRegions } from '../data/cameroon-regions';
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
  Zap,
  Users,
  DollarSign,
  Calendar,
  Target,
  Building,
  Radio
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

interface ProjectMapEditorProps {
  onSave: (projectData: Omit<NetworkProject, 'id'>) => void;
  onCancel: () => void;
  existingProjects?: NetworkProject[];
  existingElements?: NetworkElement[];
}

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
      font-size: ${size * 0.4}px;
      color: white;
      font-weight: bold;
    ">
      ${iconType === 'cable' ? '━' : 
        iconType === 'dslam' ? '▣' : 
        iconType === 'client' ? '●' : 
        iconType === 'pole' ? '│' : 
        iconType === 'coverage' ? '◯' : '●'}
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

const ProjectMapEditor: React.FC<ProjectMapEditorProps> = ({ 
  onSave, 
  onCancel, 
  existingProjects = [],
  existingElements = []
}) => {
  const { t } = useLanguage();
  const [mapMode, setMapMode] = useState<'select' | 'cable' | 'equipment' | 'coverage' | 'client'>('select');
  const [selectedProjectType, setSelectedProjectType] = useState<string>('extension');
  const [currentPath, setCurrentPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [plannedElements, setPlannedElements] = useState<Array<{ 
    lat: number; 
    lng: number; 
    type: string; 
    id: string;
    properties?: any;
  }>>([]);
  const [coverageArea, setCoverageArea] = useState<Array<{ lat: number; lng: number }>>([]);
  const [clientPoints, setClientPoints] = useState<Array<{ 
    lat: number; 
    lng: number; 
    id: string;
    type: 'residential' | 'business' | 'enterprise';
  }>>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'extension' as const,
    budget: 0,
    estimatedCost: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    region: '',
    departments: [] as string[],
    communes: [] as string[],
    estimatedClients: 0,
    manager: '',
    technicians: [] as string[]
  });

  const projectTypes = [
    { value: 'extension', label: 'Extension Réseau', color: '#10B981', icon: Cable },
    { value: 'maintenance', label: 'Maintenance', color: '#F59E0B', icon: Settings },
    { value: 'upgrade', label: 'Mise à Niveau', color: '#3B82F6', icon: Zap },
    { value: 'new_installation', label: 'Nouvelle Installation', color: '#8B5CF6', icon: Building }
  ];

  const elementTypes = [
    { value: 'cable', label: 'Câble Fibre', icon: Cable, color: '#10B981' },
    { value: 'dslam', label: 'DSLAM', icon: Settings, color: '#3B82F6' },
    { value: 'pole_wood', label: 'Poteau Bois', icon: Navigation, color: '#8B4513' },
    { value: 'pole_concrete', label: 'Poteau Béton', icon: Navigation, color: '#6B7280' },
    { value: 'pole_metal', label: 'Poteau Métallique', icon: Navigation, color: '#374151' },
    { value: 'junction_box', label: 'Boîtier', icon: Target, color: '#F59E0B' },
    { value: 'client_equipment', label: 'Équipement Client', icon: Radio, color: '#8B5CF6' }
  ];

  const clientTypes = [
    { value: 'residential', label: 'Résidentiel', color: '#10B981' },
    { value: 'business', label: 'Entreprise', color: '#3B82F6' },
    { value: 'enterprise', label: 'Grande Entreprise', color: '#8B5CF6' }
  ];

  const getProjectColor = () => {
    const projectType = projectTypes.find(pt => pt.value === selectedProjectType);
    return projectType?.color || '#10B981';
  };

  // Composant pour gérer les clics sur la carte
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        
        if (mapMode === 'cable') {
          setCurrentPath(prev => [...prev, { lat, lng }]);
        } else if (mapMode === 'equipment') {
          const elementId = `EQ-${Date.now()}`;
          setPlannedElements(prev => [...prev, { 
            lat, 
            lng, 
            type: 'dslam', 
            id: elementId,
            properties: { name: `Équipement ${elementId}` }
          }]);
        } else if (mapMode === 'coverage') {
          setCoverageArea(prev => [...prev, { lat, lng }]);
        } else if (mapMode === 'client') {
          const clientId = `CL-${Date.now()}`;
          setClientPoints(prev => [...prev, { 
            lat, 
            lng, 
            id: clientId,
            type: 'residential'
          }]);
        }
      }
    });
    return null;
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Veuillez saisir un nom pour le projet');
      return;
    }

    if (!formData.region) {
      alert('Veuillez sélectionner une région');
      return;
    }

    // Calculer la surface de couverture approximative
    let coverageAreaKm2 = 0;
    if (coverageArea.length >= 3) {
      // Calcul simplifié de l'aire d'un polygone
      coverageAreaKm2 = calculatePolygonArea(coverageArea);
    }

    // Calculer les coordonnées du projet (centre de la zone de couverture ou premier point du tracé)
    let projectCoordinates: Array<{ lat: number; lng: number }> = [];
    if (coverageArea.length > 0) {
      projectCoordinates = [...coverageArea];
    } else if (currentPath.length > 0) {
      projectCoordinates = [...currentPath];
    }

    const projectData: Omit<NetworkProject, 'id'> = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      status: 'planning',
      budget: formData.budget,
      estimatedCost: formData.estimatedCost || formData.budget * 0.9,
      startDate: formData.startDate,
      endDate: formData.endDate,
      progress: 0,
      coverage: {
        region: formData.region,
        departments: formData.departments,
        communes: formData.communes,
        estimatedClients: formData.estimatedClients || clientPoints.length,
        area: coverageAreaKm2,
        coordinates: projectCoordinates
      },
      team: {
        manager: formData.manager || 'À assigner',
        technicians: formData.technicians,
        contractors: []
      },
      plannedElements: plannedElements.map(el => ({
        id: el.id,
        type: el.type as any,
        name: el.properties?.name || `${el.type} ${el.id}`,
        location: { lat: el.lat, lng: el.lng },
        status: 'planned' as any,
        properties: el.properties || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        region: formData.region,
        department: formData.departments[0] || '',
        commune: formData.communes[0] || '',
        networkLayer: 'access' as any,
        criticality: 'medium' as any
      })),
      existingElements: []
    };

    onSave(projectData);
  };

  const calculatePolygonArea = (coordinates: Array<{ lat: number; lng: number }>): number => {
    // Calcul simplifié de l'aire d'un polygone en km²
    if (coordinates.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i].lat * coordinates[j].lng;
      area -= coordinates[j].lat * coordinates[i].lng;
    }
    area = Math.abs(area) / 2;
    
    // Conversion approximative en km² (très simplifiée)
    return area * 12400; // Facteur de conversion approximatif
  };

  const clearAll = () => {
    setCurrentPath([]);
    setPlannedElements([]);
    setCoverageArea([]);
    setClientPoints([]);
  };

  const removeElement = (elementId: string) => {
    setPlannedElements(prev => prev.filter(el => el.id !== elementId));
  };

  const removeClient = (clientId: string) => {
    setClientPoints(prev => prev.filter(cl => cl.id !== clientId));
  };

  const selectedRegion = cameroonRegions.find(r => r.name === formData.region);
  const availableDepartments = selectedRegion?.departments || [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 h-5/6 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Éditeur Cartographique de Projets Réseau</h3>
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
            {/* Informations du projet */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Informations du Projet</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Nom du projet</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    placeholder="ex: Extension Makepe Phase 2"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    rows={2}
                    placeholder="Description détaillée du projet"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700">Type de projet</label>
                  <select
                    value={selectedProjectType}
                    onChange={(e) => {
                      setSelectedProjectType(e.target.value);
                      setFormData({ ...formData, type: e.target.value as any });
                    }}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    {projectTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2" 
                      style={{ backgroundColor: getProjectColor() }}
                    />
                    <span className="text-xs text-gray-500">Couleur sur la carte</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Budget (FCFA)</label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Clients estimés</label>
                    <input
                      type="number"
                      value={formData.estimatedClients}
                      onChange={(e) => setFormData({ ...formData, estimatedClients: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">Région</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      region: e.target.value,
                      departments: [],
                      communes: []
                    })}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="">Sélectionner une région</option>
                    {cameroonRegions.map((region) => (
                      <option key={region.code} value={region.name}>
                        {region.nameFr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Outils de planification */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Outils de Planification</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setMapMode('cable')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    mapMode === 'cable' 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Cable className="h-4 w-4 mr-2" />
                  {mapMode === 'cable' ? '🎯 Mode Câbles Actif' : 'Tracer les câbles'}
                </button>
                
                <button
                  onClick={() => setMapMode('equipment')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    mapMode === 'equipment' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {mapMode === 'equipment' ? '🎯 Mode Équipements Actif' : 'Placer équipements'}
                </button>
                
                <button
                  onClick={() => setMapMode('coverage')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    mapMode === 'coverage' 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Target className="h-4 w-4 mr-2" />
                  {mapMode === 'coverage' ? '🎯 Mode Couverture Actif' : 'Définir zone couverture'}
                </button>
                
                <button
                  onClick={() => setMapMode('client')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    mapMode === 'client' 
                      ? 'bg-orange-600 text-white shadow-lg' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {mapMode === 'client' ? '🎯 Mode Clients Actif' : 'Marquer clients'}
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

            {/* Statistiques du projet */}
            {(currentPath.length > 0 || plannedElements.length > 0 || clientPoints.length > 0) && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Statistiques du Projet</h4>
                <div className="space-y-2 text-xs">
                  {currentPath.length > 0 && (
                    <div className="flex justify-between">
                      <span>Longueur câbles:</span>
                      <span className="font-medium">
                        {(() => {
                          let totalLength = 0;
                          for (let i = 1; i < currentPath.length; i++) {
                            const prev = currentPath[i - 1];
                            const curr = currentPath[i];
                            const distance = Math.sqrt(
                              Math.pow(curr.lat - prev.lat, 2) + Math.pow(curr.lng - prev.lng, 2)
                            ) * 111000; // Conversion approximative en mètres
                            totalLength += distance;
                          }
                          return `${(totalLength / 1000).toFixed(2)} km`;
                        })()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Équipements:</span>
                    <span className="font-medium">{plannedElements.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points clients:</span>
                    <span className="font-medium">{clientPoints.length}</span>
                  </div>
                  {coverageArea.length >= 3 && (
                    <div className="flex justify-between">
                      <span>Zone couverture:</span>
                      <span className="font-medium">{calculatePolygonArea(coverageArea).toFixed(2)} km²</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Liste des équipements */}
            {plannedElements.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Équipements Planifiés</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {plannedElements.map((element) => (
                    <div key={element.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-xs">{element.id}</span>
                      </div>
                      <button
                        onClick={() => removeElement(element.id)}
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
                {mapMode === 'cable' && (
                  <p>🖱️ Cliquez sur la carte pour tracer les câbles du projet</p>
                )}
                {mapMode === 'equipment' && (
                  <p>⚙️ Cliquez pour placer les équipements (DSLAM, boîtiers, etc.)</p>
                )}
                {mapMode === 'coverage' && (
                  <p>🎯 Cliquez pour définir la zone de couverture du projet</p>
                )}
                {mapMode === 'client' && (
                  <p>👥 Cliquez pour marquer les emplacements clients</p>
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

              <MapClickHandler />

              {/* Projets existants */}
              {existingProjects.map((project) => (
                <React.Fragment key={project.id}>
                  {project.coverage.coordinates.length > 2 && (
                    <Polygon
                      positions={project.coverage.coordinates.map(p => [p.lat, p.lng])}
                      color="#3B82F6"
                      fillColor="#3B82F6"
                      fillOpacity={0.1}
                      weight={2}
                      dashArray="5, 5"
                    />
                  )}
                </React.Fragment>
              ))}

              {/* Éléments existants */}
              {existingElements.map((element) => (
                <Marker
                  key={element.id}
                  position={[element.location.lat, element.location.lng]}
                  icon={createCustomIcon('#6B7280', element.type, 16)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{element.name}</p>
                      <p className="text-xs text-gray-600">Existant - {element.type}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Tracé des câbles */}
              {currentPath.length > 1 && (
                <Polyline
                  positions={currentPath.map(p => [p.lat, p.lng])}
                  color={getProjectColor()}
                  weight={4}
                  opacity={0.8}
                />
              )}

              {/* Points du tracé */}
              {currentPath.map((point, index) => (
                <Marker
                  key={`path-${index}`}
                  position={[point.lat, point.lng]}
                  icon={createCustomIcon(
                    getProjectColor(),
                    'cable',
                    16
                  )}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">Point câble {index + 1}</p>
                      <p className="text-xs text-gray-600">
                        {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Équipements planifiés */}
              {plannedElements.map((element) => (
                <Marker
                  key={element.id}
                  position={[element.lat, element.lng]}
                  icon={createCustomIcon('#3B82F6', element.type, 20)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{element.type} {element.id}</p>
                      <p className="text-xs text-gray-600">
                        {element.lat.toFixed(6)}, {element.lng.toFixed(6)}
                      </p>
                      <button
                        onClick={() => removeElement(element.id)}
                        className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Zone de couverture */}
              {coverageArea.length >= 3 && (
                <Polygon
                  positions={coverageArea.map(p => [p.lat, p.lng])}
                  color={getProjectColor()}
                  fillColor={getProjectColor()}
                  fillOpacity={0.2}
                  weight={3}
                />
              )}

              {/* Points clients */}
              {clientPoints.map((client) => (
                <Marker
                  key={client.id}
                  position={[client.lat, client.lng]}
                  icon={createCustomIcon('#10B981', 'client', 12)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">Client {client.id}</p>
                      <p className="text-xs text-gray-600">Type: {client.type}</p>
                      <button
                        onClick={() => removeClient(client.id)}
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
                  mapMode === 'cable' ? 'bg-green-500' : 
                  mapMode === 'equipment' ? 'bg-blue-500' : 
                  mapMode === 'coverage' ? 'bg-purple-500' :
                  mapMode === 'client' ? 'bg-orange-500' : 'bg-gray-500'
                }`} />
                <span className="text-sm font-medium">
                  {mapMode === 'cable' ? 'Câbles' : 
                   mapMode === 'equipment' ? 'Équipements' : 
                   mapMode === 'coverage' ? 'Couverture' :
                   mapMode === 'client' ? 'Clients' : 'Navigation'}
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
            disabled={!formData.name.trim() || !formData.region}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2 inline" />
            Enregistrer le Projet
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectMapEditor;