import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import './App.css';
import { initializePramukhIME } from './utils/tamilTransliteration';
import logger from './utils/logger';
import MainMenu from './components/MainMenu';
import NewRecordForm from './components/NewRecordForm';
import EditProfile from './components/EditProfile';
import ProfileView from './components/ProfileView';
import SearchPage from './components/SearchPage';
import YearlyReport from './components/YearlyReport';
import BackupRestore from './components/BackupRestore';
import AddressPrint from './components/AddressPrint';

const theme = createTheme({
  typography: {
    fontFamily: '"Noto Sans Tamil", sans-serif',
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('main');
  const [previousPage, setPreviousPage] = useState('main');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // PramukhIME is now loaded directly in index.html, so just wait for it to be available and initialize
    let retryCount = 0;
    const maxRetries = 50; // Maximum 5 seconds of retries (50 * 100ms)

    const initPramukhIME = () => {
      if (typeof window !== 'undefined' &&
        window.pramukhIME &&
        typeof window.pramukhIME.setLanguage === 'function' &&
        (window.pramukhIMEReady === true || window.pramukhIMEReady === undefined)) {
        logger.info('PramukhIME found and ready, initializing...');
        setTimeout(() => {
          initializePramukhIME();
        }, 100);
      } else if (retryCount < maxRetries) {
        retryCount++;
        // Retry after a short delay if not available yet
        setTimeout(initPramukhIME, 100);
      } else {
        logger.warn('PramukhIME not available after max retries. It may not be loaded properly.');
      }
    };

    // Start initialization after component mounts with a small delay to ensure scripts are loaded
    setTimeout(initPramukhIME, 200);
  }, []);

  const handleShowSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const navigate = (page, profile = null) => {
    // Track previous page before navigating
    if (currentPage !== page) {
      setPreviousPage(currentPage);
    }
    setCurrentPage(page);
    setSelectedProfile(profile);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'main':
        return <MainMenu onNavigate={navigate} />;
      case 'new':
        return (
          <NewRecordForm
            onNavigate={navigate}
            onShowSnackbar={handleShowSnackbar}
          />
        );
      case 'edit':
        return (
          <EditProfile
            profile={selectedProfile}
            onNavigate={navigate}
            onShowSnackbar={handleShowSnackbar}
          />
        );
      case 'view':
        return (
          <ProfileView
            profileId={selectedProfile?.ProfileID || selectedProfile}
            onNavigate={navigate}
            onShowSnackbar={handleShowSnackbar}
            previousPage={previousPage}
          />
        );
      case 'search':
        return <SearchPage onNavigate={navigate} />;
      case 'report':
        return <YearlyReport onNavigate={navigate} />;
      case 'backup':
        return (
          <BackupRestore
            onShowSnackbar={handleShowSnackbar}
            onNavigate={navigate}
          />
        );
      case 'address':
        return <AddressPrint onNavigate={navigate} />;
      default:
        return <MainMenu onNavigate={navigate} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        {renderPage()}
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;

