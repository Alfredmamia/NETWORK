import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ClientMapEditor from './ClientMapEditor';
import {
  Plus,
  Search,
  Filter,
  Download,
  Users,
  Building,
  Building2,
  MapPin,
  Phone,
  Mail,
  Wifi,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';

const Clients: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showMapEditor, setShowMapEditor] = useState(false);

  const clientStats = [
    { name: 'Total Clients', value: '2,847', icon: Users, color: 'bg-blue-500' },
    { name: 'Résidentiel', value: '2,234', icon: Users, color: 'bg-green-500' },
    { name: 'Entreprise', value: '487', icon: Building, color: 'bg-purple-500' },
    { name: 'Grande Entreprise', value: '126', icon: Building2, color: 'bg-orange-500' },
  ];

  const clients = [
    {
      id: '1',
      name: 'Jean Mballa',
      email: 'jean.mballa@email.com',
      phone: '+237 677 123 456',
      address: 'Quartier Makepe, Douala',
      contractType: 'residential',
      status: 'active',
      bandwidth: 50,
      region: 'Littoral',
      commune: 'Douala 5ème',
      monthlyFee: 25000,
    },
    {
      id: '2',
      name: 'Société CAMTECH SARL',
      email: 'contact@camtech.cm',
      phone: '+237 233 456 789',
      address: 'Avenue Kennedy, Yaoundé',
      contractType: 'business',
      status: 'active',
      bandwidth: 200,
      region: 'Centre',
      commune: 'Yaoundé 1er',
      monthlyFee: 150000,
    },
    {
      id: '3',
      name: 'Marie Fotso',
      email: 'marie.fotso@gmail.com',
      phone: '+237 698 765 432',
      address: 'Quartier Tsinga, Yaoundé',
      contractType: 'residential',
      status: 'suspended',
      bandwidth: 25,
      region: 'Centre',
      commune: 'Yaoundé 3ème',
      monthlyFee: 15000,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContractTypeIcon = (type: string) => {
    switch (type) {
      case 'residential':
        return Users;
      case 'business':
        return Building;
      case 'enterprise':
        return Building2;
      default:
        return Users;
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = clients
    .filter(client => client.status === 'active')
    .reduce((sum, client) => sum + client.monthlyFee, 0);

  const handleMapSave = (clientData: any) => {
    console.log('Client saved:', clientData);
    setShowMapEditor(false);
    // Ici on ajouterait le client à la base de données
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('clients.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion complète de votre base clients et abonnés
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </button>
          <button
            onClick={() => setShowMapEditor(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Éditeur Cartographique
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            {t('clients.addClient')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {clientStats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stat.color} rounded-md flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Revenus Mensuels Actifs</p>
            <p className="text-3xl font-bold text-white">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XAF',
                minimumFractionDigits: 0,
              }).format(totalRevenue)}
            </p>
          </div>
          <div className="text-blue-100">
            <Wifi className="h-12 w-12" />
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
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="pending">En attente</option>
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredClients.map((client) => {
            const IconComponent = getContractTypeIcon(client.contractType);
            return (
              <li key={client.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{client.name}</p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Mail className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {client.email}
                          <span className="mx-2">•</span>
                          <Phone className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {client.phone}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {client.address}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {client.bandwidth} Mbps
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'XAF',
                            minimumFractionDigits: 0,
                          }).format(client.monthlyFee)}/mois
                        </p>
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
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Client Map Editor */}
      {showMapEditor && (
        <ClientMapEditor
          onSave={handleMapSave}
          onCancel={() => setShowMapEditor(false)}
          existingClients={[]}
        />
      )}
    </div>
  );
};

export default Clients;