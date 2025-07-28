import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import MaintenanceMapEditor from './MaintenanceMapEditor';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Edit,
  Eye,
} from 'lucide-react';

const Maintenance: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showMapEditor, setShowMapEditor] = useState(false);

  const ticketStats = [
    { name: 'Tickets Ouverts', value: '23', icon: AlertTriangle, color: 'bg-red-500' },
    { name: 'En Cours', value: '15', icon: Clock, color: 'bg-yellow-500' },
    { name: 'Résolus', value: '187', icon: CheckCircle, color: 'bg-green-500' },
    { name: 'Fermés', value: '1,234', icon: XCircle, color: 'bg-gray-500' },
  ];

  const tickets = [
    {
      id: 'TK-2023-001',
      title: 'Panne fibre optique - Secteur Bonanjo',
      description: 'Interruption complète du service dans le quartier Bonanjo suite à une coupure de câble',
      priority: 'critical',
      status: 'in_progress',
      assignedTo: 'Équipe Technique A',
      address: 'Quartier Bonanjo, Douala',
      affectedClients: 234,
      createdAt: '2023-06-15T08:30:00Z',
      updatedAt: '2023-06-15T14:20:00Z',
    },
    {
      id: 'TK-2023-002',
      title: 'Maintenance préventive DSLAM Yaoundé',
      description: 'Maintenance programmée du DSLAM principal de Yaoundé Centre',
      priority: 'medium',
      status: 'open',
      assignedTo: 'Jean Mballa',
      address: 'Avenue Kennedy, Yaoundé',
      affectedClients: 89,
      createdAt: '2023-06-14T16:45:00Z',
      updatedAt: '2023-06-14T16:45:00Z',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleMapSave = (ticketData: any) => {
    console.log('Ticket saved:', ticketData);
    setShowMapEditor(false);
    // Ici on ajouterait le ticket à la base de données
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('maintenance.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion des tickets de maintenance et suivi des interventions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMapEditor(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Éditeur Cartographique
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            {t('maintenance.addTicket')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {ticketStats.map((stat) => (
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
                placeholder="Rechercher un ticket..."
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
              <option value="open">Ouvert</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredTickets.map((ticket) => (
            <li key={ticket.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {ticket.assignedTo}
                        <span className="mx-2">•</span>
                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {ticket.address}
                        <span className="mx-2">•</span>
                        <span className="font-medium">{ticket.affectedClients} clients affectés</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">#{ticket.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Maintenance Map Editor */}
      {showMapEditor && (
        <MaintenanceMapEditor
          onSave={handleMapSave}
          onCancel={() => setShowMapEditor(false)}
          existingTickets={[]}
        />
      )}
    </div>
  );
};

export default Maintenance;