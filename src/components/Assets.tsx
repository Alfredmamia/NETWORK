import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Cable,
  Server,
  Zap,
  Box,
  MapPin,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import AssetMapEditor from './AssetMapEditor';

const Assets: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMapEditor, setShowMapEditor] = useState(false);

  const assetCategories = [
    { value: 'all', label: 'Tous les actifs', count: 342 },
    { value: 'cables', label: 'Câbles', count: 127 },
    { value: 'equipment', label: 'Équipements', count: 89 },
    { value: 'infrastructure', label: 'Infrastructure', count: 126 },
  ];

  const assets = [
    {
      id: '1',
      name: 'Câble Fibre 48F - Bonanjo',
      type: 'cable',
      category: 'cables',
      status: 'active',
      location: 'Douala, Bonanjo',
      installDate: '2023-03-15',
      value: 2500000,
      properties: {
        length: '2.5 km',
        fiberCount: 48,
        type: 'Single Mode',
        capacity: '100%',
      },
    },
    {
      id: '2',
      name: 'DSLAM Huawei MA5608T',
      type: 'equipment',
      category: 'equipment',
      status: 'active',
      location: 'Yaoundé, Centre',
      installDate: '2023-01-20',
      value: 15000000,
      properties: {
        model: 'MA5608T',
        ports: 48,
        capacity: '750/1000',
        firmware: 'V800R017C10',
      },
    },
    {
      id: '3',
      name: 'Poteau Béton 12m',
      type: 'infrastructure',
      category: 'infrastructure',
      status: 'active',
      location: 'Bafoussam, Centre',
      installDate: '2022-11-10',
      value: 150000,
      properties: {
        height: '12m',
        material: 'Béton armé',
        load: '500kg',
        condition: 'Excellent',
      },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cable':
        return Cable;
      case 'equipment':
        return Server;
      case 'infrastructure':
        return Zap;
      default:
        return Box;
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('assets.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion complète de votre inventaire d'actifs réseau
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            {t('common.import')}
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            {t('assets.addAsset')}
          </button>
          <button
            onClick={() => setShowMapEditor(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Éditeur Cartographique
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {assetCategories.map((category) => (
          <div key={category.value} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <Box className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{category.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{category.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Value */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">{t('assets.totalValue')}</p>
            <p className="text-3xl font-bold text-white">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XAF',
                minimumFractionDigits: 0,
              }).format(totalValue)}
            </p>
          </div>
          <div className="text-green-100">
            <Server className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Rechercher un actif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {assetCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredAssets.map((asset) => {
            const IconComponent = getTypeIcon(asset.type);
            return (
              <li key={asset.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                            {asset.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {asset.location}
                          <span className="mx-2">•</span>
                          Installé le {new Date(asset.installDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'XAF',
                            minimumFractionDigits: 0,
                          }).format(asset.value)}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">{asset.type}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {Object.entries(asset.properties).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500 capitalize">{key}:</span>
                          <span className="ml-1 text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Asset Map Editor */}
      {showMapEditor && (
        <AssetMapEditor
          onSave={(assetData) => {
            console.log('Asset saved:', assetData);
            setShowMapEditor(false);
          }}
          onCancel={() => setShowMapEditor(false)}
          existingAssets={[]}
        />
      )}
    </div>
  );
};

export default Assets;