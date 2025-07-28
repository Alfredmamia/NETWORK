import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { NetworkProject, NetworkElement, FIBER_TYPES, NETWORK_COLORS } from '../types/network';
import { networkService } from '../services/networkService';
import ProjectMapEditor from './ProjectMapEditor';
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Eye,
  Trash2,
  FileText,
  Download,
  Upload,
  Layers,
  Settings,
} from 'lucide-react';

const Projects: React.FC = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<NetworkProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<NetworkProject | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectList = await networkService.getProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return AlertCircle;
      case 'approved':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      case 'completed':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const totalEstimatedCost = projects.reduce((sum, project) => sum + project.estimatedCost, 0);

  const handleMapSave = async (projectData: Omit<NetworkProject, 'id'>) => {
    try {
      await networkService.createProject(projectData);
      await loadProjects();
      setShowMapEditor(false);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
    }
  };

  const CreateProjectModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      type: 'extension',
      region: '',
      estimatedClients: 0,
      budget: 0,
      startDate: '',
      endDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const newProject: Omit<NetworkProject, 'id'> = {
          ...formData,
          status: 'planning',
          estimatedCost: formData.budget * 0.9, // Estimation à 90% du budget
          progress: 0,
          coverage: {
            region: formData.region,
            departments: [],
            communes: [],
            estimatedClients: formData.estimatedClients,
            area: 0,
            coordinates: [],
          },
          team: {
            manager: 'À assigner',
            technicians: [],
          },
          plannedElements: [],
          existingElements: [],
        };

        await networkService.createProject(newProject);
        await loadProjects();
        setShowCreateModal(false);
      } catch (error) {
        console.error('Erreur lors de la création du projet:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Nouveau Projet</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du projet</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="extension">Extension</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="upgrade">Mise à niveau</option>
                  <option value="new_installation">Nouvelle installation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Région</label>
                <input
                  type="text"
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Clients estimés</label>
                <input
                  type="number"
                  required
                  value={formData.estimatedClients}
                  onChange={(e) => setFormData({ ...formData, estimatedClients: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget (FCFA)</label>
                <input
                  type="number"
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de début</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Créer le projet
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets Réseau</h1>
          <p className="mt-1 text-sm text-gray-500">
            Planification et suivi des projets d'extension et de maintenance réseau
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Projet
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
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Projets Actifs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {projects.filter(p => p.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En Planification</p>
              <p className="text-2xl font-semibold text-gray-900">
                {projects.filter(p => p.status === 'planning').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Terminés</p>
              <p className="text-2xl font-semibold text-gray-900">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Budget Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(totalBudget).replace('XAF', '').trim()}M
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Vue d'ensemble Budgétaire</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-purple-100 text-sm">Budget Total Alloué</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalBudget)}</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm">Coût Estimé Total</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalEstimatedCost)}</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-purple-100 text-sm">
                Économies potentielles: {formatCurrency(totalBudget - totalEstimatedCost)}
              </p>
            </div>
          </div>
          <div className="text-purple-100">
            <DollarSign className="h-16 w-16" />
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
                placeholder="Rechercher un projet..."
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
              <option value="planning">En planification</option>
              <option value="approved">Approuvé</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => {
          const StatusIcon = getStatusIcon(project.status);
          
          return (
            <div key={project.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <StatusIcon className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">#{project.id}</p>
                      <p className="text-sm text-gray-500">{project.progress}% terminé</p>
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

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progression</span>
                    <span className="text-gray-900 font-medium">{project.progress}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Project Details Grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Timeline & Budget */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">Planning & Budget</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Début:</span>
                        <span className="ml-1 text-gray-900">{formatDate(project.startDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Fin:</span>
                        <span className="ml-1 text-gray-900">{formatDate(project.endDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Budget:</span>
                        <span className="ml-1 text-gray-900">{formatCurrency(project.budget)}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Estimé:</span>
                        <span className="ml-1 text-gray-900">{formatCurrency(project.estimatedCost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Coverage */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">Couverture</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Région:</span>
                        <span className="ml-1 text-gray-900">{project.coverage.region}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Communes:</span>
                        <span className="ml-1 text-gray-900">{project.coverage.communes.join(', ') || 'À définir'}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Clients estimés:</span>
                        <span className="ml-1 text-gray-900">{project.coverage.estimatedClients}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Surface:</span>
                        <span className="ml-1 text-gray-900">{project.coverage.area} km²</span>
                      </div>
                    </div>
                  </div>

                  {/* Team */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">Équipe</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Manager:</span>
                        <span className="ml-1 text-gray-900">{project.team.manager}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Techniciens:</span>
                        <span className="ml-1 text-gray-900">{project.team.technicians.length || 'À assigner'}</span>
                      </div>
                      {project.team.contractors && project.team.contractors.length > 0 && (
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Contractants:</span>
                          <span className="ml-1 text-gray-900">{project.team.contractors.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && <CreateProjectModal />}
      
      {/* Map Editor */}
      {showMapEditor && (
        <ProjectMapEditor
          onSave={handleMapSave}
          onCancel={() => setShowMapEditor(false)}
          existingProjects={projects}
        />
      )}
    </div>
  );
};

export default Projects;