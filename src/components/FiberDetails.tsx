import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { fiberService } from '../services/fiberService';
import { FiberSection, Fiber, Splice, asianFiberColors, serviceTypeConfig, ServiceType } from '../types/fiber';
import {
  ArrowLeft,
  Cable,
  MapPin,
  Settings,
  TestTube,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Download,
  Upload,
  Eye,
  Edit
} from 'lucide-react';

interface FiberDetailsProps {
  sectionId: string;
  onBack: () => void;
}

const FiberDetails: React.FC<FiberDetailsProps> = ({ sectionId, onBack }) => {
  const { t } = useLanguage();
  const [section, setSection] = useState<FiberSection | null>(null);
  const [splices, setSplices] = useState<Splice[]>([]);
  const [selectedFiber, setSelectedFiber] = useState<Fiber | null>(null);
  const [showSpliceModal, setShowSpliceModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSectionDetails();
  }, [sectionId]);

  const loadSectionDetails = async () => {
    try {
      setLoading(true);
      const sections = await fiberService.getFiberSections();
      const currentSection = sections.find(s => s.id === sectionId);
      setSection(currentSection || null);
      
      if (currentSection) {
        const sectionSplices = await fiberService.getSplices(sectionId);
        setSplices(sectionSplices);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiberUpdate = async (fiberId: number, updates: Partial<Fiber>) => {
    if (!section) return;
    
    try {
      await fiberService.updateFiber(section.id, fiberId, updates);
      await loadSectionDetails();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la fibre:', error);
    }
  };

  const getServiceColor = (service: ServiceType) => {
    return serviceTypeConfig[service]?.color || '#6B7280';
  };

  const getServiceBgColor = (service: ServiceType) => {
    return serviceTypeConfig[service]?.bgColor || '#F3F4F6';
  };

  const getServiceLabel = (service: ServiceType) => {
    return serviceTypeConfig[service]?.label || service;
  };

  const FiberRow: React.FC<{ fiber: Fiber }> = ({ fiber }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
      assignedService: fiber.assignedService,
      status: fiber.status,
      notes: fiber.notes,
      isProjected: fiber.isProjected
    });

    const handleSave = async () => {
      await handleFiberUpdate(fiber.id, editData);
      setIsEditing(false);
    };

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {fiber.id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div 
              className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3"
              style={{ backgroundColor: fiber.colorHex }}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{fiber.color}</p>
              <p className="text-xs text-gray-500">{fiber.colorEnglish}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {fiber.tubeNumber || '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {isEditing ? (
            <select
              value={editData.assignedService}
              onChange={(e) => setEditData({ ...editData, assignedService: e.target.value as ServiceType })}
              className="block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              {Object.entries(serviceTypeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          ) : (
            <span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ 
                color: getServiceColor(fiber.assignedService),
                backgroundColor: getServiceBgColor(fiber.assignedService)
              }}
            >
              {getServiceLabel(fiber.assignedService)}
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {isEditing ? (
            <select
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
              className="block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="free">Libre</option>
              <option value="active">Actif</option>
              <option value="reserved">Réservé</option>
              <option value="fault">En panne</option>
              <option value="test">Test</option>
            </select>
          ) : (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              fiber.status === 'active' ? 'bg-green-100 text-green-800' :
              fiber.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
              fiber.status === 'fault' ? 'bg-red-100 text-red-800' :
              fiber.status === 'test' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {fiber.status}
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {fiber.isProjected ? (
              <div className="flex items-center text-orange-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-xs">Projetée</span>
              </div>
            ) : (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">Existante</span>
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {isEditing ? (
            <input
              type="text"
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              className="block w-full text-sm border border-gray-300 rounded-md px-2 py-1"
              placeholder="Notes..."
            />
          ) : (
            fiber.notes || '-'
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="text-green-600 hover:text-green-900"
              >
                Sauver
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tronçon introuvable</p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </button>
      </div>
    );
  }

  const utilizationRate = section.fibers.filter(f => f.assignedService !== 'free').length / section.capacity * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{section.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestion détaillée des {section.capacity} fibres optiques
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <TestTube className="h-4 w-4 mr-2" />
            Tests OTDR
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Rapport
          </button>
        </div>
      </div>

      {/* Section Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Informations Générales</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span>{section.startPoint.name} → {section.endPoint.name}</span>
              </div>
              <div className="flex items-center text-sm">
                <Cable className="h-4 w-4 text-gray-400 mr-2" />
                <span>{(section.length / 1000).toFixed(2)} km • {section.capacity} fibres</span>
              </div>
              <div className="flex items-center text-sm">
                <Settings className="h-4 w-4 text-gray-400 mr-2" />
                <span className="capitalize">{section.installationType}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Utilisation</h3>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span>Fibres utilisées</span>
                <span className="font-medium">{section.fibers.filter(f => f.assignedService !== 'free').length}/{section.capacity}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${utilizationRate}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">{utilizationRate.toFixed(1)}% d'utilisation</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Statut</h3>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                section.status === 'existing' ? 'bg-green-100 text-green-800' :
                section.status === 'projected' ? 'bg-blue-100 text-blue-800' :
                section.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {section.status}
              </span>
              <p className="mt-1 text-xs text-gray-500">
                Installé le {section.installationDate.toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fiber Management Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Gestion des Brins par Couleur</h3>
          <p className="mt-1 text-sm text-gray-500">
            Code couleur asiatique (IEC 60304) - Cliquez sur une ligne pour modifier
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Brin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Couleur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tube/Groupe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Affecté
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observations
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {section.fibers.map((fiber) => (
                <FiberRow key={fiber.id} fiber={fiber} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Splices Section */}
      {splices.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Manchons de Raccordement</h3>
            <button
              onClick={() => setShowSpliceModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Nouveau Manchon
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {splices.map((splice) => (
              <div key={splice.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{splice.id}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    splice.type === 'underground' ? 'bg-blue-100 text-blue-800' :
                    splice.type === 'aerial' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {splice.type}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><MapPin className="h-3 w-3 inline mr-1" />{splice.location.name}</p>
                  <p>Installé le {splice.installDate.toLocaleDateString('fr-FR')}</p>
                  <p>Technicien: {splice.technician}</p>
                  <p>{splice.fiberMapping.length} fibres raccordées</p>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                    <Eye className="h-4 w-4 inline mr-1" />
                    Voir continuité
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiberDetails;