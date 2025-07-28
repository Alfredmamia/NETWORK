import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { artReportService } from '../services/artReportService';
import { ARTReport } from '../types/network';
import {
  FileText,
  Download,
  Send,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Globe,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ARTCompliance: React.FC = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState<ARTReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ARTReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
    artReportService.initializeDemoData();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const reportList = await artReportService.getReports();
      setReports(reportList);
      if (reportList.length > 0) {
        setSelectedReport(reportList[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewReport = async () => {
    try {
      setGenerating(true);
      const currentDate = new Date();
      const quarter = Math.ceil((currentDate.getMonth() + 1) / 3);
      const year = currentDate.getFullYear();
      
      const newReport = await artReportService.generateQuarterlyReport(quarter, year);
      setReports([newReport, ...reports]);
      setSelectedReport(newReport);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
    } finally {
      setGenerating(false);
    }
  };

  const submitReport = async (reportId: string) => {
    try {
      const updatedReport = await artReportService.submitReport(reportId);
      if (updatedReport) {
        setReports(reports.map(r => r.id === reportId ? updatedReport : r));
        setSelectedReport(updatedReport);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du rapport:', error);
    }
  };

  const exportToPDF = async (reportId: string) => {
    try {
      const pdfBlob = await artReportService.exportReportToPDF(reportId);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-art-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return AlertCircle;
      case 'submitted': return Send;
      case 'approved': return CheckCircle;
      default: return FileText;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">{t('art.compliance')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Génération et soumission des rapports de conformité ART
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={generateNewReport}
            disabled={generating}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {generating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            {t('art.generateReport')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Rapports ART</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {reports.map((report) => {
                const StatusIcon = getStatusIcon(report.status);
                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${
                      selectedReport?.id === report.id ? 'bg-green-50 border-r-4 border-green-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <StatusIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Q{report.period.quarter} {report.period.year}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(report.generatedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Report Details */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Rapport ART Q{selectedReport.period.quarter} {selectedReport.period.year}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Période: {new Date(selectedReport.period.start).toLocaleDateString('fr-FR')} - {new Date(selectedReport.period.end).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => exportToPDF(selectedReport.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </button>
                    {selectedReport.status === 'draft' && (
                      <button
                        onClick={() => submitReport(selectedReport.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Soumettre
                      </button>
                    )}
                  </div>
                </div>

                {/* Compliance Score */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Score de Conformité</p>
                      <p className="text-3xl font-bold">{selectedReport.complianceScore.toFixed(1)}%</p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-200" />
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">{t('art.networkAvailability')}</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {selectedReport.metrics.networkAvailability.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">{t('art.averageLatency')}</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {selectedReport.metrics.averageLatency.toFixed(1)}ms
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">{t('art.incidentCount')}</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {selectedReport.metrics.incidentCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regional Performance */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance par Région</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedReport.regionalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="coverage" fill="#10B981" name="Couverture (%)" />
                      <Bar dataKey="clients" fill="#3B82F6" name="Clients" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Regional Data Table */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Données Régionales Détaillées</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Région
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Couverture
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clients
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenus
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Incidents
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedReport.regionalData.map((region) => (
                        <tr key={region.region}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {region.region}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {region.coverage.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {region.clients.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'XAF',
                              minimumFractionDigits: 0,
                            }).format(region.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {region.incidents}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recommandations</h3>
                <ul className="space-y-2">
                  {selectedReport.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Sélectionnez un rapport pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARTCompliance;