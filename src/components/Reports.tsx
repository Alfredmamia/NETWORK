import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Plus,
  Download,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Filter,
  Eye,
  Share,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState('all');

  const reportTypes = [
    { value: 'performance', label: 'Performance Réseau', icon: TrendingUp, color: 'bg-blue-500' },
    { value: 'regulatory', label: 'Conformité ART', icon: FileText, color: 'bg-green-500' },
    { value: 'maintenance', label: 'Maintenance', icon: BarChart3, color: 'bg-yellow-500' },
    { value: 'financial', label: 'Financier', icon: PieChart, color: 'bg-purple-500' },
  ];

  const recentReports = [
    {
      id: '1',
      title: 'Rapport Performance Mensuel - Mai 2023',
      type: 'performance',
      generatedAt: '2023-06-01T09:00:00Z',
      period: { start: '2023-05-01', end: '2023-05-31' },
      size: '2.4 MB',
      status: 'completed',
    },
    {
      id: '2',
      title: 'Conformité ART - Q1 2023',
      type: 'regulatory',
      generatedAt: '2023-04-15T14:30:00Z',
      period: { start: '2023-01-01', end: '2023-03-31' },
      size: '1.8 MB',
      status: 'completed',
    },
  ];

  const performanceData = [
    { name: 'Jan', uptime: 99.2, incidents: 3, clients: 2234 },
    { name: 'Fév', uptime: 99.5, incidents: 2, clients: 2456 },
    { name: 'Mar', uptime: 99.1, incidents: 4, clients: 2567 },
    { name: 'Avr', uptime: 99.7, incidents: 1, clients: 2689 },
    { name: 'Mai', uptime: 99.8, incidents: 2, clients: 2847 },
  ];

  const getReportTypeIcon = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType ? reportType.icon : FileText;
  };

  const getReportTypeColor = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType ? reportType.color : 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Génération et consultation des rapports d'activité et de conformité
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            {t('reports.generate')}
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <div key={type.value} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${type.color} rounded-md flex items-center justify-center`}>
                  <type.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{type.label}</p>
                <p className="text-xs text-gray-500">Générer un rapport</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Réseau</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="uptime" fill="#10B981" name="Disponibilité (%)" />
                <Bar dataKey="incidents" fill="#EF4444" name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Métriques Clés - Mai 2023</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">99.8%</p>
              <p className="text-sm text-gray-500">Disponibilité Réseau</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">2,847</p>
              <p className="text-sm text-gray-500">Clients Actifs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">23</p>
              <p className="text-sm text-gray-500">Tickets Ouverts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">78%</p>
              <p className="text-sm text-gray-500">Couverture Territoire</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Rapports Récents</h3>
            <div className="flex items-center space-x-3">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Tous les types</option>
                <option value="performance">Performance</option>
                <option value="regulatory">Réglementaire</option>
                <option value="maintenance">Maintenance</option>
                <option value="financial">Financier</option>
              </select>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </button>
            </div>
          </div>
        </div>
        <ul className="divide-y divide-gray-200">
          {recentReports.map((report) => {
            const IconComponent = getReportTypeIcon(report.type);
            return (
              <li key={report.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 ${getReportTypeColor(report.type)} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{report.title}</p>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          Généré le {formatDate(report.generatedAt)}
                          <span className="mx-2">•</span>
                          <span>Période: {new Date(report.period.start).toLocaleDateString('fr-FR')} - {new Date(report.period.end).toLocaleDateString('fr-FR')}</span>
                          <span className="mx-2">•</span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {report.status}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Share className="h-4 w-4" />
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

      {/* ART Compliance Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Conformité ART</h3>
            <p className="text-green-100 text-sm">
              Dernière soumission: 15 avril 2023 • Prochaine échéance: 15 juillet 2023
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="text-green-100">
                <span className="text-2xl font-bold text-white">98.5%</span>
                <p className="text-sm">Taux de conformité</p>
              </div>
              <div className="text-green-100">
                <span className="text-2xl font-bold text-white">2</span>
                <p className="text-sm">Points d'amélioration</p>
              </div>
            </div>
          </div>
          <div className="text-green-100">
            <FileText className="h-16 w-16" />
          </div>
        </div>
        <div className="mt-4">
          <button className="inline-flex items-center px-4 py-2 border border-green-400 rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-400 hover:bg-opacity-25">
            <Download className="h-4 w-4 mr-2" />
            Télécharger le rapport ART
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;