import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, Activity, Wifi, AlertTriangle, TrendingUp, Cable, Server, Globe, HardDrive, Wrench, FileText, MapPin, Settings, Bell, Search, User, Zap, CheckCircle, Clock, DollarSign, BarChart3, PieChart, Navigation, Filter, Download, Upload, RefreshCw, AlertCircle, Info, CheckCircle2, Map, Database, UserCheck, Calendar, PenTool as Tool, TrendingDown, Eye, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts';

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [viewMode, setViewMode] = useState('overview');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Données simulées pour le tableau de bord
  const networkStatus = {
    backbone: { operational: 98.5, status: 'excellent' },
    metropolitan: { operational: 96.2, status: 'good' },
    access: { operational: 94.8, status: 'good' },
    clients: { available: 97.3, status: 'excellent' }
  };

  const kpiData = [
    { 
      name: 'Longueur Totale Fibres', 
      value: '2,847 km', 
      evolution: '+2.3%', 
      trend: 'up',
      period: 'ce mois'
    },
    { 
      name: 'Clients Actifs', 
      value: '12,456', 
      evolution: '+234', 
      trend: 'up',
      period: 'cette semaine'
    },
    { 
      name: 'Taux de Disponibilité', 
      value: '99.2%', 
      evolution: '+0.3%', 
      trend: 'up',
      period: 'vs mois dernier'
    },
    { 
      name: 'Pannes Ouvertes', 
      value: '23', 
      evolution: '-5', 
      trend: 'down',
      period: 'vs hier'
    },
    { 
      name: 'Revenus Mensuels', 
      value: '2.4M FCFA', 
      evolution: '+12%', 
      trend: 'up',
      period: 'vs N-1'
    },
    { 
      name: 'MTTR Moyen', 
      value: '3.2h', 
      evolution: '-15min', 
      trend: 'down',
      period: 'vs objectif'
    }
  ];

  const quickAccessCards = [
    {
      title: 'Cartographie Interactive',
      description: 'Visualiser et gérer la topologie réseau',
      icon: Globe,
      indicator: 'Dernière mise à jour: 14:30',
      color: 'bg-blue-500',
      action: 'network'
    },
    {
      title: 'Inventaire des Actifs',
      description: 'Gérer équipements et infrastructures',
      icon: Database,
      indicator: '2,847 équipements actifs',
      color: 'bg-green-500',
      action: 'assets'
    },
    {
      title: 'Gestion Clients',
      description: 'Suivi clients et abonnements',
      icon: UserCheck,
      indicator: '12,456 clients actifs',
      color: 'bg-purple-500',
      action: 'clients'
    },
    {
      title: 'Planification Réseau',
      description: 'Simulations et extensions réseau',
      icon: Calendar,
      indicator: '3 projets en cours',
      color: 'bg-orange-500',
      action: 'planning'
    },
    {
      title: 'Maintenance',
      description: 'Tickets et interventions terrain',
      icon: Tool,
      indicator: '23 tickets ouverts',
      color: 'bg-red-500',
      action: 'maintenance'
    },
    {
      title: 'Rapports & Analytics',
      description: 'Rapports ART et performance',
      icon: BarChart3,
      indicator: 'Rapport mensuel généré',
      color: 'bg-indigo-500',
      action: 'reports'
    }
  ];

  const trafficData = [
    { time: '00:00', traffic: 45 },
    { time: '04:00', traffic: 32 },
    { time: '08:00', traffic: 78 },
    { time: '12:00', traffic: 92 },
    { time: '16:00', traffic: 85 },
    { time: '20:00', traffic: 67 },
    { time: '24:00', traffic: 54 }
  ];

  const clientDistribution = [
    { name: 'FTTH', value: 65, color: '#10B981' },
    { name: 'ADSL', value: 25, color: '#3B82F6' },
    { name: 'P2P', value: 10, color: '#8B5CF6' }
  ];

  const regionalPerformance = [
    { region: 'Littoral', latency: 12, throughput: 95, clients: 4567 },
    { region: 'Centre', latency: 15, throughput: 92, clients: 3890 },
    { region: 'Ouest', latency: 18, throughput: 88, clients: 2134 },
    { region: 'Nord-Ouest', latency: 22, throughput: 85, clients: 1567 }
  ];

  const notifications = [
    {
      id: 1,
      type: 'critical',
      title: 'Panne backbone Douala-Yaoundé',
      message: 'Interruption de service détectée sur la liaison principale',
      time: '14:23',
      icon: AlertTriangle
    },
    {
      id: 2,
      type: 'warning',
      title: 'Maintenance programmée NRO Bonanjo',
      message: 'Intervention prévue demain de 02:00 à 06:00',
      time: '13:45',
      icon: Settings
    },
    {
      id: 3,
      type: 'info',
      title: 'Nouveau client FTTH raccordé',
      message: 'Installation terminée - Quartier Makepe',
      time: '12:30',
      icon: Info
    },
    {
      id: 4,
      type: 'success',
      title: 'Réparation terminée BTS Akwa',
      message: 'Service restauré - Tous clients reconnectés',
      time: '11:15',
      icon: CheckCircle2
    }
  ];

  const regions = [
    'Toutes les régions', 'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 
    'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
  ];

  const cities = [
    'Toutes les villes', 'Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 
    'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Buea'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'info': return 'border-l-blue-500 bg-blue-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche et filtres */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('dashboard.title')} - Network Way
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Recherche globale..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              {regions.map((region) => (
                <option key={region} value={region.toLowerCase().replace(/\s+/g, '-')}>
                  {region}
                </option>
              ))}
            </select>
            
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              {cities.map((city) => (
                <option key={city} value={city.toLowerCase().replace(/\s+/g, '-')}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 1: Vue d'Ensemble Réseau */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Vue d'Ensemble Réseau</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white">
            <Cable className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Réseau Backbone</p>
              <p className="text-2xl font-bold">{networkStatus.backbone.operational}%</p>
              <p className="text-xs opacity-75">opérationnel</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white">
            <Server className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Boucles Métropolitaines</p>
              <p className="text-2xl font-bold">{networkStatus.metropolitan.operational}%</p>
              <p className="text-xs opacity-75">opérationnel</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
            <Wifi className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Réseaux d'Accès</p>
              <p className="text-2xl font-bold">{networkStatus.access.operational}%</p>
              <p className="text-xs opacity-75">opérationnel</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
            <Users className="h-8 w-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Services Clients</p>
              <p className="text-2xl font-bold">{networkStatus.clients.available}%</p>
              <p className="text-xs opacity-75">disponibles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Accès Rapide aux Modules */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accès Rapide aux Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickAccessCards.map((card) => (
            <div key={card.title} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mr-4`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{card.indicator}</span>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Accéder →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Carte Interactive Miniature */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Aperçu Géographique Cameroun</h2>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full">Backbone</button>
            <button className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Métropolitain</button>
            <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">FTTH/GPON</button>
            <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">ADSL</button>
          </div>
        </div>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Map className="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Carte interactive du réseau camerounais</p>
            <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Voir la carte complète
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: KPI et Métriques */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Indicateurs Clés de Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiData.map((kpi) => (
            <div key={kpi.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{kpi.name}</h3>
                {getTrendIcon(kpi.trend)}
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {kpi.evolution}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{kpi.period}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Graphiques Temps Réel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trafic 24h */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trafic des dernières 24h</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="traffic" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution des clients */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Clients par Service</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Tooltip />
                <RechartsPieChart
                  data={clientDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {clientDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {clientDistribution.map((item) => (
              <div key={item.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 6: Performance Régionale */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Réseau par Région</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Région
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latence (ms)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Débit (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  État
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {regionalPerformance.map((region) => (
                <tr key={region.region}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {region.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {region.latency}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${region.throughput}%` }}
                        />
                      </div>
                      {region.throughput}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {region.clients.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Opérationnel
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 7: Notifications et Alertes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Notifications et Alertes</h2>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">
              Urgence
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              Rapport
            </button>
            <button className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
              Export
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className={`border-l-4 p-4 ${getNotificationColor(notification.type)}`}>
              <div className="flex items-start">
                <notification.icon className="h-5 w-5 mt-0.5 mr-3" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions Rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser (F5)
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Map className="h-4 w-4 mr-2" />
            Cartographie (Ctrl+M)
          </button>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            <Database className="h-4 w-4 mr-2" />
            Inventaire (Ctrl+I)
          </button>
          <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
            <Users className="h-4 w-4 mr-2" />
            Clients (Ctrl+C)
          </button>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <FileText className="h-4 w-4 mr-2" />
            Rapports (Ctrl+R)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;