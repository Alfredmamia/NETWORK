import React, { useState } from 'react';
import { NetworkElement, FIBER_TYPES, POLE_TYPES, CHAMBER_TYPES, NETWORK_COLORS } from '../types/network';
import { cameroonRegions } from '../data/cameroon-regions';
import { Upload, Download, FileText, X } from 'lucide-react';

interface NetworkElementFormProps {
  onSubmit: (element: Omit<NetworkElement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<NetworkElement>;
}

const NetworkElementForm: React.FC<NetworkElementFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'cable',
    location: {
      lat: initialData?.location?.lat || 0,
      lng: initialData?.location?.lng || 0,
    },
    status: initialData?.status || 'active',
    region: initialData?.region || '',
    department: initialData?.department || '',
    commune: initialData?.commune || '',
    networkLayer: initialData?.networkLayer || 'access',
    criticality: initialData?.criticality || 'medium',
    properties: initialData?.properties || {},
  });

  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImport, setShowImport] = useState(false);

  const elementTypes = [
    // Backbone
    { value: 'cable', label: 'Câble Fibre', layer: 'backbone' },
    { value: 'repeater', label: 'Répéteur Optique', layer: 'backbone' },
    { value: 'wdm_multiplexer', label: 'Multiplexeur WDM', layer: 'backbone' },
    { value: 'otn_equipment', label: 'Équipement OTN', layer: 'backbone' },
    { value: 'pop', label: 'Point de Présence', layer: 'backbone' },
    { value: 'cti', label: 'Centre de Transit International', layer: 'backbone' },
    { value: 'ixp', label: 'Point d\'Échange Internet', layer: 'backbone' },
    { value: 'datacenter', label: 'Datacenter', layer: 'backbone' },
    
    // Métropolitain
    { value: 'adm', label: 'Add-Drop Multiplexer', layer: 'metropolitan' },
    { value: 'router', label: 'Routeur', layer: 'metropolitan' },
    { value: 'switch', label: 'Commutateur', layer: 'metropolitan' },
    { value: 'mpls_equipment', label: 'Équipement MPLS', layer: 'metropolitan' },
    
    // Accès
    { value: 'dslam', label: 'DSLAM', layer: 'access' },
    { value: 'bts', label: 'Station de Base BTS', layer: 'access' },
    { value: 'antenna', label: 'Antenne', layer: 'access' },
    { value: 'bbu', label: 'Baseband Unit', layer: 'access' },
    { value: 'splitter', label: 'Diviseur Optique', layer: 'access' },
    { value: 'fat', label: 'Point de Branchement Optique', layer: 'access' },
    { value: 'mdu', label: 'Boîtier de Raccordement Immeuble', layer: 'access' },
    
    // Infrastructure
    { value: 'pole', label: 'Poteau', layer: 'access' },
    { value: 'chamber', label: 'Chambre de Tirage', layer: 'access' },
    { value: 'conduit', label: 'Conduit', layer: 'access' },
    
    // Client
    { value: 'cpe', label: 'Équipement Client', layer: 'client' },
    { value: 'atb', label: 'Prise Terminale Optique', layer: 'client' },
    { value: 'modem', label: 'Modem', layer: 'client' },
  ];

  const networkLayers = [
    { value: 'backbone', label: 'Backbone (Interurbain)', color: '#DC2626' },
    { value: 'metropolitan', label: 'Métropolitain', color: '#F97316' },
    { value: 'access', label: 'Accès', color: '#10B981' },
    { value: 'client', label: 'Client', color: '#3B82F6' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      properties: {
        ...formData.properties,
        // Propriétés spécifiques selon le type
        ...(formData.type === 'cable' && {
          fiberCount: formData.properties.fiberCount || 24,
          cableType: formData.properties.cableType || 'single_mode',
          installation: formData.properties.installation || 'aerial',
          networkType: getNetworkTypeFromLayer(formData.networkLayer),
        }),
        ...(formData.type === 'pole' && {
          poleType: formData.properties.poleType || 'concrete',
          material: formData.properties.poleType || 'concrete',
        }),
        ...(formData.type === 'chamber' && {
          chamberType: formData.properties.chamberType || 'L1T',
          material: 'concrete',
        }),
      },
    });
  };

  const getNetworkTypeFromLayer = (layer: string) => {
    switch (layer) {
      case 'backbone': return 'backbone_national';
      case 'metropolitan': return 'metropolitan';
      case 'access': return 'ftth_gpon';
      case 'client': return 'ftth_gpon';
      default: return 'ftth_gpon';
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    
    // Traitement du fichier (Excel/CSV)
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // Ici on traiterait le contenu du fichier
        // Pour la démo, on simule l'import
        console.log('Fichier importé:', file.name);
        alert(`Fichier ${file.name} importé avec succès!`);
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        alert('Erreur lors de l\'import du fichier');
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `Nom,Type,Latitude,Longitude,Région,Département,Commune,Statut
Exemple Câble,cable,4.0511,9.7679,Littoral,Wouri,Douala 1er,active
Exemple DSLAM,dslam,4.0611,9.7579,Littoral,Wouri,Douala 2ème,active`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_elements_reseau.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedRegion = cameroonRegions.find(r => r.name === formData.region);
  const availableDepartments = selectedRegion?.departments || [];
  const selectedDepartment = availableDepartments.find(d => d.name === formData.department);
  const availableCommunes = selectedDepartment?.communes || [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-gray-900">
            {initialData ? 'Modifier l\'Élément' : 'Ajouter un Élément Réseau'}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowImport(!showImport)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </button>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Import Section */}
        {showImport && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-3">Import de Fichier</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-700">
                  Fichier Excel/CSV avec coordonnées GPS
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileImport}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {importFile && (
                <div className="flex items-center text-sm text-green-600">
                  <FileText className="h-4 w-4 mr-2" />
                  {importFile.name} - Prêt à traiter
                </div>
              )}
              <p className="text-xs text-blue-600">
                Format supporté: Nom, Type, Latitude, Longitude, Région, Département, Commune, Statut
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom de l'élément</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type d'élément</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                {elementTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.layer})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Couche réseau et criticité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Couche réseau</label>
              <select
                value={formData.networkLayer}
                onChange={(e) => setFormData({ ...formData, networkLayer: e.target.value as any })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                {networkLayers.map((layer) => (
                  <option key={layer.value} value={layer.value}>
                    {layer.label}
                  </option>
                ))}
              </select>
              <div className="mt-1 flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2" 
                  style={{ backgroundColor: networkLayers.find(l => l.value === formData.networkLayer)?.color }}
                />
                <span className="text-xs text-gray-500">Couleur sur la carte</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Criticité</label>
              <select
                value={formData.criticality}
                onChange={(e) => setFormData({ ...formData, criticality: e.target.value as any })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
                <option value="critical">Critique</option>
              </select>
            </div>
          </div>

          {/* Localisation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.location.lat}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, lat: parseFloat(e.target.value) }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.location.lng}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, lng: parseFloat(e.target.value) }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Localisation administrative */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Région</label>
              <select
                required
                value={formData.region}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  region: e.target.value,
                  department: '',
                  commune: ''
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
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
              <label className="block text-sm font-medium text-gray-700">Département</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  department: e.target.value,
                  commune: ''
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
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
              <label className="block text-sm font-medium text-gray-700">Commune</label>
              <select
                required
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
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

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="maintenance">Maintenance</option>
              <option value="fault">Panne</option>
              <option value="planned">Planifié</option>
            </select>
          </div>

          {/* Propriétés spécifiques selon le type */}
          {formData.type === 'cable' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900">Propriétés du Câble</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre de fibres</label>
                  <select
                    value={formData.properties.fiberCount || 24}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      properties: { ...formData.properties, fiberCount: parseInt(e.target.value) }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {FIBER_TYPES.map((count) => (
                      <option key={count} value={count}>{count} fibres</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type de fibre</label>
                  <select
                    value={formData.properties.cableType || 'single_mode'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      properties: { ...formData.properties, cableType: e.target.value }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="single_mode">Single Mode</option>
                    <option value="multi_mode">Multi Mode</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Installation</label>
                  <select
                    value={formData.properties.installation || 'aerial'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      properties: { ...formData.properties, installation: e.target.value }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="aerial">Aérien</option>
                    <option value="underground">Souterrain</option>
                    <option value="submarine">Sous-marin</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {formData.type === 'pole' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900">Propriétés du Poteau</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type de poteau</label>
                  <select
                    value={formData.properties.poleType || 'concrete'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      properties: { ...formData.properties, poleType: e.target.value }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="wood">Bois</option>
                    <option value="metal">Métallique</option>
                    <option value="concrete">Béton</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hauteur (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.properties.height || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      properties: { ...formData.properties, height: parseFloat(e.target.value) }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'chamber' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900">Propriétés de la Chambre</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type de chambre</label>
                  <select
                    value={formData.properties.chamberType || 'L1T'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      properties: { ...formData.properties, chamberType: e.target.value }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {CHAMBER_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profondeur (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.properties.depth || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      properties: { ...formData.properties, depth: parseFloat(e.target.value) }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {initialData ? 'Modifier' : 'Ajouter'} l'élément
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NetworkElementForm;