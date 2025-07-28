import { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import NetworkMap from './components/NetworkMap';
import Assets from './components/Assets';
import Clients from './components/Clients';
import Maintenance from './components/Maintenance';
import Reports from './components/Reports';
import Planning from './components/Planning';
import ARTCompliance from './components/ARTCompliance';
import Projects from './components/Projects';
import FiberManagement from './components/FiberManagement';
import FiberDetails from './components/FiberDetails';
import NetworkEditor from './components/NetworkEditor';
import ConnectionSimulator from './components/ConnectionSimulator';
import SpliceManagement from './components/SpliceManagement';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedFiberSection, setSelectedFiberSection] = useState<string | null>(null);

  // Vérifier si on est sur la page éditeur réseau
  const isNetworkEditor = window.location.pathname === '/network-editor';

  // Si on est sur l'éditeur réseau, afficher seulement l'éditeur
  if (isNetworkEditor) {
    return (
      <LanguageProvider>
        <NetworkEditor />
      </LanguageProvider>
    );
  }

  const renderPage = () => {
    // Gestion des sous-pages de fibres
    if (currentPage === 'fiber-management') {
      if (selectedFiberSection) {
        return (
          <FiberDetails 
            sectionId={selectedFiberSection} 
            onBack={() => setSelectedFiberSection(null)} 
          />
        );
      }
      return <FiberManagement />;
    }
    
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'network':
        return <NetworkMap />;
      case 'assets':
        return <Assets />;
      case 'clients':
        return <Clients />;
      case 'maintenance':
        return <Maintenance />;
      case 'reports':
        return <Reports />;
      case 'planning':
        return <Planning />;
      case 'art-compliance':
        return <ARTCompliance />;
      case 'projects':
        return <Projects />;
      case 'fiber-management':
        return <FiberManagement />;
      case 'splice-management':
        return <SpliceManagement />;
      case 'connection-simulator':
        return <ConnectionSimulator />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <Layout 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          onFiberSectionSelect={setSelectedFiberSection}
        >
          {renderPage()}
        </Layout>
      </div>
    </LanguageProvider>
  );
}

export default App;