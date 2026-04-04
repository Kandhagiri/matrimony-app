import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';

const ProfileStatusDialog = ({ open, onClose, onConfirm, isActive, existingReason = '' }) => {
  const [reason, setReason] = useState(existingReason);
  const [marriedThroughService, setMarriedThroughService] = useState(false);

  const handleConfirm = () => {
    if (!isActive && !reason.trim()) {
      alert('தயவுசெய்து காரணத்தை உள்ளிடவும்');
      return;
    }
    onConfirm(reason, marriedThroughService);
    setReason('');
    setMarriedThroughService(false);
    onClose();
  };

  const handleCancel = () => {
    setReason('');
    setMarriedThroughService(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle className="tamil-text">
        {isActive ? 'சுயவிவரத்தை செயல்நீக்கு' : 'சுயவிவரத்தை செயல்படுத்து'}
      </DialogTitle>
      <DialogContent>
        {isActive ? (
          <>
            <Typography variant="body2" sx={{ mb: 2 }}>
              சுயவிவரத்தை செயல்நீக்குவதற்கான காரணத்தை உள்ளிடவும்:
            </Typography>
            <TextField
              label="காரணம்"
              multiline
              rows={4}
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="tamil-text"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={marriedThroughService}
                  onChange={(e) => setMarriedThroughService(e.target.checked)}
                />
              }
              label="இந்த சேவையின் மூலம் திருமணம் செய்து கொண்டார்"
              className="tamil-text"
            />
          </>
        ) : (
          <Typography variant="body2">
            இந்த சுயவிவரத்தை மீண்டும் செயல்படுத்த விரும்புகிறீர்களா?
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} className="tamil-text">
          ரத்துசெய்
        </Button>
        <Button onClick={handleConfirm} variant="contained" className="tamil-text">
          {isActive ? 'செயல்நீக்கு' : 'செயல்படுத்து'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileStatusDialog;



