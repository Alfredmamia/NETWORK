import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import AssetMapEditor from './AssetMapEditor';
import { NetworkElement } from '../types/network';
import { networkService } from '../services/networkService';
import {
  ArrowLeft,
  Home,
  Save,
  X
} from 'lucide-react';

const NetworkEditor: React.FC = () => {
  const { t } = useLanguage();
  const [showEditor, setShowEditor] = useState(true);

  const handleSave = async (elementData: Omit<NetworkElement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await networkService.addNetworkElement(elementData);
      alert('Élément ajouté avec succès !');
      setShowEditor(false);
      // Optionnel : fermer la fenêtre après sauvegarde
      // window.close();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élément:', error);
      alert('Erreur lors de l\'ajout de l\'élément');
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    // Optionnel : fermer la fenêtre
    // window.close();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la page éditeur */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleGoHome}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Éditeur Cartographique - Gestion du Réseau</h1>
                <p className="text-sm text-gray-500">Placement et gestion des éléments réseau sur carte interactive</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGoHome}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Retour au tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal - Éditeur pleine page */}
      <div className="h-screen">
        {showEditor ? (
          <AssetMapEditor
            onSave={handleSave}
            onCancel={handleCancel}
            existingAssets={[]}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Éditeur Fermé</h2>
              <p className="text-gray-600 mb-6">L'éditeur cartographique a été fermé.</p>
              <button
                onClick={handleGoHome}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Home className="h-5 w-5 mr-2" />
                Retour au tableau de bord
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkEditor;