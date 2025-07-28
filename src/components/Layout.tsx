import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Menu,
  X,
  Home,
  Network,
  HardDrive,
  Users,
  Wrench,
  FileText,
  MapPin,
  Settings,
  Globe,
  Bell,
  Search,
  User,
  Cable,
  Zap,
  Route,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onFiberSectionSelect?: (sectionId: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, onFiberSectionSelect }) => {
  const { language, setLanguage, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: t('nav.dashboard'), href: 'dashboard', icon: Home },
    { name: t('nav.network'), href: 'network', icon: Network },
    { name: t('nav.assets'), href: 'assets', icon: HardDrive },
    { name: t('nav.clients'), href: 'clients', icon: Users },
    { name: t('nav.maintenance'), href: 'maintenance', icon: Wrench },
    { name: t('nav.reports'), href: 'reports', icon: FileText },
    { name: t('nav.planning'), href: 'planning', icon: MapPin },
    { name: 'Conformité ART', href: 'art-compliance', icon: FileText },
    { name: 'Projets', href: 'projects', icon: MapPin },
    { name: 'Gestion Fibres', href: 'fiber-management', icon: Cable },
    { name: 'Gestionnaire Manchons', href: 'splice-management', icon: Zap },
    { name: 'Simulateur Raccordement', href: 'connection-simulator', icon: Route },
  ];

  return (
    <div className="h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div className="absolute right-0 top-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex flex-shrink-0 items-center px-4 py-4">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-green-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Network Way</h1>
            </div>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  onPageChange(item.href);
                  setSidebarOpen(false);
                }}
                className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium ${
                  currentPage === item.href
                    ? 'bg-green-100 text-green-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex flex-shrink-0 items-center px-4 py-4">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-green-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Network Way</h1>
            </div>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => onPageChange(item.href)}
                className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium ${
                  currentPage === item.href
                    ? 'bg-green-100 text-green-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 flex-1 md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder={t('common.search')}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'fr' ? 'FR' : 'EN'}</span>
              </button>
              <button className="text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <button className="text-gray-400 hover:text-gray-500">
                <Settings className="h-6 w-6" />
              </button>
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <User className="h-6 w-6" />
                <span className="text-sm font-medium">Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;