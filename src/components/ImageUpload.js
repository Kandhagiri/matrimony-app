import React, { useState } from 'react';
import { Box, Button, Grid, Paper, IconButton, Dialog, DialogContent } from '@mui/material';
import { CloudUpload, Delete, Close } from '@mui/icons-material';
import { Typography } from '@mui/material';

const ImageUpload = ({ photos = [], onChange, maxImages = 3 }) => {
  const [previewDialog, setPreviewDialog] = useState({ open: false, image: null });

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (photos.length + files.length > maxImages) {
      alert(`அதிகபட்சம் ${maxImages} புகைப்படங்கள் மட்டுமே பதிவேற்ற முடியும்`);
      return;
    }

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newPhoto = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            data: reader.result,
            name: file.name,
            size: file.size,
          };

          onChange([...photos, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    event.target.value = '';
  };

  const handleRemove = (id) => {
    onChange(photos.filter((photo) => photo.id !== id));
  };

  const handlePreview = (photo) => {
    setPreviewDialog({ open: true, image: photo.data });
  };

  const handleClosePreview = () => {
    setPreviewDialog({ open: false, image: null });
  };

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        multiple
        type="file"
        onChange={handleFileSelect}
        disabled={photos.length >= maxImages}
      />
      <label htmlFor="image-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUpload />}
          disabled={photos.length >= maxImages}
          fullWidth
          sx={{ mb: 2 }}
          className="tamil-text"
        >
          {photos.length >= maxImages
            ? `அதிகபட்சம் ${maxImages} புகைப்படங்கள் (${photos.length}/${maxImages})`
            : `புகைப்படம் பதிவேற்று (${photos.length}/${maxImages})`}
        </Button>
      </label>

      <Grid container spacing={2}>
        {photos.map((photo) => (
          <Grid item xs={4} key={photo.id}>
            <Paper
              elevation={2}
              sx={{
                position: 'relative',
                paddingTop: '100%',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => handlePreview(photo)}
            >
              <Box
                component="img"
                src={photo.data}
                alt={photo.name}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(photo.id);
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={previewDialog.open}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleClosePreview}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Close />
          </IconButton>
          {previewDialog.image && (
            <Box
              component="img"
              src={previewDialog.image}
              alt="Preview"
              sx={{ width: '100%', height: 'auto', display: 'block' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ImageUpload;



