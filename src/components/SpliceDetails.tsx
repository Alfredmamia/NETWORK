import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { spliceService } from '../services/spliceService';
import { OpticalSplice, FiberSpliceMapping, asianFiberColors, networkTypeConfig } from '../types/splice';
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
  Edit,
  Save,
  X
} from 'lucide-react';

interface SpliceDetailsProps {
  spliceId: string;
  onBack: () => void;
}

const SpliceDetails: React.FC<SpliceDetailsProps> = ({ spliceId, onBack }) => {
  const [splice, setSplice] = useState<OpticalSplice | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<FiberSpliceMapping | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpliceDetails();
  }, [spliceId]);

  const loadSpliceDetails = async () => {
    try {
      setLoading(true);
      const splices = await spliceService.getSplices();
      const currentSplice = splices.find(s => s.id === spliceId);
      setSplice(currentSplice || null);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiberMapping = async (inputFiber: number, outputFiber: number) => {
    if (!splice) return;
    
    try {
      const mapping: FiberSpliceMapping = {
        inputFiber,
        outputFiber,
        insertionLoss: 0.3 + Math.random() * 0.4,
        testDate: new Date(),
        continuityStatus: 'untested',
        technician: 'Utilisateur'
      };

      await spliceService.updateFiberMapping(splice.id, mapping);
      await loadSpliceDetails();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mapping:', error);
    }
  };

  const handleContinuityTest = async (inputFiber: number, outputFiber: number) => {
    if (!splice) return;
    
    try {
      await spliceService.performContinuityTest(splice.id, inputFiber, outputFiber);
      await loadSpliceDetails();
    } catch (error) {
      console.error('Erreur lors du test de continuité:', error);
    }
  };

  const getFiberColor = (fiberId: number) => {
    const colorIndex = ((fiberId - 1) % 12);
    return asianFiberColors[colorIndex];
  };

  const getMappingStatus = (inputFiber: number, outputFiber: number) => {
    if (!splice) return null;
    return splice.fiberMapping.find(m => m.inputFiber === inputFiber && m.outputFiber === outputFiber);
  };

  const getConnectionColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 border-green-300';
      case 'fault': return 'bg-red-100 border-red-300';
      case 'untested': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const FiberMappingModal = () => {
    const [inputFiber, setInputFiber] = useState(1);
    const [outputFiber, setOutputFiber] = useState(1);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleFiberMapping(inputFiber, outputFiber);
      setShowMappingModal(false);
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Nouveau Raccordement</h3>
            <button
              onClick={() => setShowMappingModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fibre d'entrée</label>
              <select
                value={inputFiber}
                onChange={(e) => setInputFiber(parseInt(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {splice?.inputCable.fibers.map((fiber) => {
                  const color = getFiberColor(fiber.id);
                  return (
                    <option key={fiber.id} value={fiber.id}>
                      Fibre {fiber.id} - {color.color} ({color.english})
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Fibre de sortie</label>
              <select
                value={outputFiber}
                onChange={(e) => setOutputFiber(parseInt(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {splice?.outputCable.fibers.map((fiber) => {
                  const color = getFiberColor(fiber.id);
                  return (
                    <option key={fiber.id} value={fiber.id}>
                      Fibre {fiber.id} - {color.color} ({color.english})
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Créer le raccordement
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!splice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Manchon introuvable</p>
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

  const utilizationRate = splice.fiberMapping.length / Math.min(splice.inputCable.capacity, splice.outputCable.capacity) * 100;

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
            <h1 className="text-2xl font-bold text-gray-900">{splice.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestion des raccordements fibre par fibre - {splice.inputCable.capacity}F → {splice.outputCable.capacity}F
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowMappingModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Raccordement
          </button>
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

      {/* Splice Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Informations Générales</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span>{splice.location.name}</span>
              </div>
              <div className="flex items-center text-sm">
                <Zap className="h-4 w-4 text-gray-400 mr-2" />
                <span className="capitalize">{splice.type}</span>
              </div>
              <div className="flex items-center text-sm">
                <Settings className="h-4 w-4 text-gray-400 mr-2" />
                <span>{networkTypeConfig[splice.networkType]?.label}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Utilisation</h3>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span>Connexions actives</span>
                <span className="font-medium">{splice.fiberMapping.length}/{Math.min(splice.inputCable.capacity, splice.outputCable.capacity)}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${utilizationRate}%`,
                    backgroundColor: networkTypeConfig[splice.networkType]?.color || '#10B981'
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">{utilizationRate.toFixed(1)}% d'utilisation</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Statut</h3>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                splice.status === 'active' ? 'bg-green-100 text-green-800' :
                splice.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                splice.status === 'fault' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {splice.status}
              </span>
              <p className="mt-1 text-xs text-gray-500">
                Installé le {splice.installDate.toLocaleDateString('fr-FR')}
              </p>
              <p className="text-xs text-gray-500">
                Technicien: {splice.technician}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cable Connections Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Cable */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Câble d'Entrée</h3>
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: splice.inputCable.color }}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">{splice.inputCable.cableName}</p>
            <p className="text-sm text-gray-600">Capacité: {splice.inputCable.capacity} fibres</p>
            <p className="text-sm text-gray-600">Type: {splice.inputCable.cableType}</p>
            <p className="text-sm text-gray-600">ID: {splice.inputCable.cableId}</p>
          </div>
        </div>

        {/* Output Cable */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Câble de Sortie</h3>
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: splice.outputCable.color }}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">{splice.outputCable.cableName}</p>
            <p className="text-sm text-gray-600">Capacité: {splice.outputCable.capacity} fibres</p>
            <p className="text-sm text-gray-600">Type: {splice.outputCable.cableType}</p>
            <p className="text-sm text-gray-600">ID: {splice.outputCable.cableId}</p>
          </div>
        </div>
      </div>

      {/* Fiber Mapping Matrix */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Matrice de Raccordement Fibre par Fibre</h3>
          <p className="mt-1 text-sm text-gray-500">
            Raccordements selon le code couleur asiatique (IEC 60304)
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Fibers */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Fibres d'Entrée ({splice.inputCable.capacity}F)</h4>
              <div className="space-y-2">
                {splice.inputCable.fibers.map((fiber) => {
                  const color = getFiberColor(fiber.id);
                  const mapping = splice.fiberMapping.find(m => m.inputFiber === fiber.id);
                  
                  return (
                    <div 
                      key={fiber.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                        mapping ? getConnectionColor(mapping.continuityStatus) : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Fibre {fiber.id} - {color.color}
                          </p>
                          <p className="text-xs text-gray-500">{color.english}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {mapping ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              → Fibre {mapping.outputFiber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {mapping.insertionLoss.toFixed(2)} dB
                            </p>
                            <button
                              onClick={() => handleContinuityTest(fiber.id, mapping.outputFiber)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Tester
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Non connecté</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Output Fibers */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Fibres de Sortie ({splice.outputCable.capacity}F)</h4>
              <div className="space-y-2">
                {splice.outputCable.fibers.map((fiber) => {
                  const color = getFiberColor(fiber.id);
                  const mapping = splice.fiberMapping.find(m => m.outputFiber === fiber.id);
                  
                  return (
                    <div 
                      key={fiber.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                        mapping ? getConnectionColor(mapping.continuityStatus) : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Fibre {fiber.id} - {color.color}
                          </p>
                          <p className="text-xs text-gray-500">{color.english}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {mapping ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Fibre {mapping.inputFiber} →
                            </p>
                            <p className="text-xs text-gray-500">
                              {mapping.insertionLoss.toFixed(2)} dB
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              mapping.continuityStatus === 'ok' ? 'bg-green-100 text-green-800' :
                              mapping.continuityStatus === 'fault' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {mapping.continuityStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Non connecté</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fiber Mapping Modal */}
      {showMappingModal && <FiberMappingModal />}
    </div>
  );
};

export default SpliceDetails;