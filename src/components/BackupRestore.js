import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { ArrowBack, Backup, Restore, Delete, Refresh } from '@mui/icons-material';

const BackupRestore = ({ onShowSnackbar, onNavigate }) => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, backupPath: null });

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const result = await window.electronAPI.listBackups();
      if (result.success) {
        // IPC handler returns { success: true, backups: [...] }
        const backupList = result.backups || result.data || [];
        setBackups(Array.isArray(backupList) ? backupList : []);
      } else {
        setBackups([]);
        if (result && !result.success) {
          onShowSnackbar(result.error || 'காப்புப்பிரதிகள் ஏற்ற முடியவில்லை', 'error');
        }
      }
    } catch (error) {
      console.error('Error loading backups:', error);
      setBackups([]);
      onShowSnackbar('பிழை: ' + (error.message || 'காப்புப்பிரதிகள் ஏற்ற முடியவில்லை'), 'error');
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.exportData();
      if (result.success) {
        const filename = result.filename || result.data?.filename || 'காப்புப்பிரதி';
        onShowSnackbar(
          `காப்புப்பிரதி வெற்றிகரமாக உருவாக்கப்பட்டது: ${filename}`,
          'success'
        );
        loadBackups();
      } else {
        onShowSnackbar(result.error || 'காப்புப்பிரதி உருவாக்க முடியவில்லை', 'error');
      }
    } catch (error) {
      onShowSnackbar('பிழை: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const result = await window.electronAPI.selectBackupFile();
      if (result.success && result.filePath) {
        // IPC handler returns { success: true, filePath: '...' }
        setConfirmDialog({
          open: true,
          action: 'restore',
          backupPath: result.filePath,
        });
      } else if (result.success && result.filePaths && result.filePaths.length > 0) {
        // Fallback for array format
        setConfirmDialog({
          open: true,
          action: 'restore',
          backupPath: result.filePaths[0],
        });
      } else if (result.success && result.data) {
        // Another fallback
        setConfirmDialog({
          open: true,
          action: 'restore',
          backupPath: result.data,
        });
      } else if (!result.canceled) {
        onShowSnackbar('காப்புப்பிரதி கோப்பு தேர்ந்தெடுக்கப்படவில்லை', 'warning');
      }
    } catch (error) {
      onShowSnackbar('பிழை: ' + error.message, 'error');
    }
  };

  const handleConfirmRestore = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.importData(confirmDialog.backupPath);
      if (result.success) {
        onShowSnackbar(
          'காப்புப்பிரதி மீட்டமைக்கப்பட்டது. தயவுசெய்து பயன்பாட்டை மீண்டும் திறக்கவும்.',
          'success'
        );
        setConfirmDialog({ open: false, action: null, backupPath: null });
      } else {
        onShowSnackbar(result.error || 'காப்புப்பிரதி மீட்டமைக்க முடியவில்லை', 'error');
      }
    } catch (error) {
      onShowSnackbar('பிழை: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!window.confirm(`இந்த காப்புப்பிரதியை நீக்க விரும்புகிறீர்களா? ${filename}`)) {
      return;
    }

    try {
      const result = await window.electronAPI.deleteBackup(filename);
      if (result.success) {
        onShowSnackbar('காப்புப்பிரதி நீக்கப்பட்டது', 'success');
        loadBackups();
      } else {
        onShowSnackbar(result.error || 'காப்புப்பிரதி நீக்க முடியவில்லை', 'error');
      }
    } catch (error) {
      onShowSnackbar('பிழை: ' + error.message, 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ta-IN') + ' ' + date.toLocaleTimeString('ta-IN');
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" className="tamil-heading">
            காப்புப்பிரதி / மீட்டமை
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<Refresh />}
              onClick={loadBackups}
              className="tamil-text"
            >
              புதுப்பி
            </Button>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => onNavigate('main')}
              className="tamil-text"
            >
              முதன்மை பட்டி
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Backup />}
              onClick={handleCreateBackup}
              disabled={loading}
              fullWidth
              size="large"
              className="tamil-text"
              sx={{ py: 2 }}
            >
              காப்புப்பிரதி உருவாக்கு
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Restore />}
              onClick={handleRestoreBackup}
              disabled={loading}
              fullWidth
              size="large"
              className="tamil-text"
              sx={{ py: 2 }}
            >
              காப்புப்பிரதியை மீட்டமை
            </Button>
          </Grid>
        </Grid>

        <Typography variant="h6" className="tamil-text" gutterBottom>
          காப்புப்பிரதி பட்டியல்
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="tamil-text">கோப்பு பெயர்</TableCell>
                <TableCell className="tamil-text">அளவு</TableCell>
                <TableCell className="tamil-text">உருவாக்கப்பட்ட தேதி</TableCell>
                <TableCell className="tamil-text">செயல்கள்</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!backups || backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography className="tamil-text">
                      காப்புப்பிரதிகள் இல்லை
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup) => (
                  <TableRow key={backup.filename || backup.name || Math.random()}>
                    <TableCell>{backup.filename || backup.name || '-'}</TableCell>
                    <TableCell>{formatFileSize(backup.size || 0)}</TableCell>
                    <TableCell>{backup.created ? formatDate(backup.created) : '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteBackup(backup.filename || backup.name)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Confirm Restore Dialog */}
      <Dialog
        open={confirmDialog.open && confirmDialog.action === 'restore'}
        onClose={() => setConfirmDialog({ open: false, action: null, backupPath: null })}
      >
        <DialogTitle className="tamil-text">எச்சரிக்கை</DialogTitle>
        <DialogContent>
          <Typography className="tamil-text">
            இது தற்போதைய அனைத்து தரவையும் மாற்றும். நீங்கள் தொடர விரும்புகிறீர்களா?
            <br />
            <strong>குறிப்பு:</strong> பயன்பாட்டை கைமுறையாக மீண்டும் திறக்க வேண்டும்.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, action: null, backupPath: null })}
            className="tamil-text"
          >
            ரத்துசெய்
          </Button>
          <Button
            onClick={handleConfirmRestore}
            variant="contained"
            color="secondary"
            className="tamil-text"
          >
            மீட்டமை
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BackupRestore;



