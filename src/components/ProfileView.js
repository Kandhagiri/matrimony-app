import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Button,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Edit,
  Print,
  Delete,
  ArrowBack,
  Close,
  PowerSettingsNew,
  PowerOff,
} from '@mui/icons-material';
import HoroscopeDisplay from './HoroscopeDisplay';
import ProfileStatusDialog from './ProfileStatusDialog';
import { formatDateForDisplay, calculateAge } from '../utils/dateUtils';

const ProfileView = ({ profileId, onNavigate, onShowSnackbar, previousPage = 'main' }) => {
  const [profile, setProfile] = useState(null);
  const [imageDialog, setImageDialog] = useState({ open: false, image: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const result = await window.electronAPI.getProfileById(profileId);
      if (result.success && result.data) {
        // Ensure Photos is always an array
        const profile = { ...result.data };
        if (profile.Photos) {
          if (typeof profile.Photos === 'string') {
            try {
              profile.Photos = JSON.parse(profile.Photos);
            } catch (e) {
              profile.Photos = [];
            }
          } else if (!Array.isArray(profile.Photos)) {
            profile.Photos = [];
          }
        } else {
          profile.Photos = [];
        }

        // Ensure Horoscope is always an object
        if (profile.Horoscope) {
          if (typeof profile.Horoscope === 'string') {
            try {
              profile.Horoscope = JSON.parse(profile.Horoscope);
            } catch (e) {
              profile.Horoscope = {};
            }
          } else if (typeof profile.Horoscope !== 'object') {
            profile.Horoscope = {};
          }
        } else {
          profile.Horoscope = {};
        }

        setProfile(profile);
      } else {
        onShowSnackbar(result.error || 'பிழை: சுயவிவரத்தை ஏற்ற முடியவில்லை', 'error');
        setProfile(null);
      }
    } catch (error) {
      onShowSnackbar('பிழை: ' + error.message, 'error');
      setProfile(null);
    }
  };

  const renderHoroscopeChartForPrint = (horoscope) => {
    if (!horoscope || Object.keys(horoscope).length === 0) {
      return '<div style="text-align: center; color: #999; padding: 20px;">ஜாதகம் இல்லை</div>';
    }

    const GRAHAS = {
      'சூரியன்': 'சூ',
      'சந்திரன்': 'ச',
      'செவ்வாய்': 'செ',
      'புதன்': 'பு',
      'குரு': 'கு',
      'சுக்கிரன்': 'சுக',
      'சனி': 'சனி',
      'ராகு': 'ரா',
      'கேது': 'கே',
    };

    const getGrahaAbbrev = (grahaName) => GRAHAS[grahaName] || grahaName;

    let grahas = [];
    if (horoscope.grahas) {
      if (Array.isArray(horoscope.grahas)) {
        grahas = horoscope.grahas;
      } else if (typeof horoscope.grahas === 'string') {
        try {
          grahas = JSON.parse(horoscope.grahas);
        } catch (e) {
          grahas = [];
        }
      }
    }

    let html = '<div style="display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); gap: 0; width: 100%; max-width: 400px; margin: 10px auto;">';

    const renderHouse = (houseIndex) => {
      const houseGrahas = Array.isArray(grahas[houseIndex]) ? grahas[houseIndex] : [];
      return `
        <div style="padding: 4px; min-height: 40px; border: 1px solid #778089; display: flex; flex-direction: column; font-size: 9px;">
          <div style="color: #778089; margin-bottom: 2px; font-size: 8px;">${houseIndex + 1}</div>
          <div style="display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; flex: 1; align-items: center;">
            ${houseGrahas.length > 0 ? houseGrahas.map(graha =>
        `<span style="background: #1976d2; color: white; padding: 2px 5px; border-radius: 2px; font-size: 8px;">${getGrahaAbbrev(graha)}</span>`
      ).join('') : '<span style="color: #999; font-size: 8px;">-</span>'}
          </div>
        </div>
      `;
    };

    html += renderHouse(11);
    html += renderHouse(0);
    html += renderHouse(1);
    html += renderHouse(2);

    html += renderHouse(10);
    html += `
      <div style="grid-column: 2 / 4; grid-row: 2 / 4; padding: 8px; min-height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 2px; text-align: center; font-size: 10px;">
        <div style="font-weight: bold; margin-bottom: 4px;">பிறந்த தேதி</div>
        <div>${horoscope.birthDate || '-'}</div>
        <div style="font-weight: bold; margin-top: 6px; margin-bottom: 4px;">நட்சத்திரம்</div>
        <div>${horoscope.natchathiram || '-'}</div>
        <div style="font-weight: bold; margin-top: 6px; margin-bottom: 4px;">திசை</div>
        <div>${horoscope.disai || '-'}</div>
        <div style="font-weight: bold; margin-top: 6px; margin-bottom: 4px;">இருப்பு</div>
        <div>${horoscope.iruppu || '-'}</div>
      </div>
    `;
    html += renderHouse(3);

    html += renderHouse(9);
    html += renderHouse(4);

    html += renderHouse(8);
    html += renderHouse(7);
    html += renderHouse(6);
    html += renderHouse(5);

    html += '</div>';
    return html;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const age = profile ? calculateAge(profile.DateOfBirth) : 0;

    // Parse photos
    let photos = [];
    if (profile && profile.Photos) {
      if (Array.isArray(profile.Photos)) {
        photos = profile.Photos;
      } else if (typeof profile.Photos === 'string') {
        try {
          photos = JSON.parse(profile.Photos);
        } catch (e) {
          photos = [];
        }
      }
    }

    // Parse horoscope
    let horoscope = profile?.Horoscope || {};
    if (horoscope && typeof horoscope === 'string') {
      try {
        horoscope = JSON.parse(horoscope);
      } catch (e) {
        horoscope = {};
      }
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Profile - ${profile?.ProfileID || ''}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Noto Sans Tamil', sans-serif;
              padding: 20px;
            }
            @media print {
              @page { margin: 1cm; }
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #000;
            }
            .header h1 {
              font-size: 24px;
              margin-bottom: 5px;
            }
            .header h2 {
              font-size: 18px;
              font-weight: normal;
            }
            .container {
              display: flex;
              gap: 20px;
              margin-bottom: 20px;
            }
            .left-column {
              width: 35%;
              min-width: 250px;
            }
            .right-column {
              width: 65%;
              flex: 1;
            }
            .card {
              border: 1px solid #ddd;
              border-radius: 4px;
              padding: 15px;
              margin-bottom: 15px;
              background: #fff;
            }
            .card-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              padding-bottom: 8px;
              border-bottom: 1px solid #ddd;
            }
            .field {
              margin-bottom: 10px;
            }
            .field-label {
              font-size: 11px;
              color: #666;
              display: block;
              margin-bottom: 2px;
            }
            .field-value {
              font-size: 13px;
              font-weight: 600;
            }
            .profile-photo {
              width: 100%;
              max-width: 250px;
              height: auto;
              border-radius: 8px;
              margin-bottom: 15px;
            }
            .photos-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin-top: 10px;
            }
            .photo-item {
              width: 100%;
              height: 120px;
              object-fit: cover;
              border-radius: 4px;
            }
            .two-column {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>தமிழ்நாடு சைவ வேளாளர் சங்கம், தஞ்சாவூர்</h1>
            <h2>${profile?.Name || ''} - Profile ID: ${profile?.ProfileID || ''}</h2>
          </div>
          
          ${profile ? `
            <div class="container">
              <!-- Left Column -->
              <div class="left-column">
                <div class="card">
                  ${photos.length > 0 ? `
                    <img src="${photos[0].data}" alt="${profile.Name}" class="profile-photo" />
                  ` : `
                    <div style="width: 100%; max-width: 250px; height: 250px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                      <span style="color: #999;">புகைப்படம் இல்லை</span>
                    </div>
                  `}
                  
                  <div class="card-title">அடிப்படை தகவல்கள்</div>
                  <div class="field">
                    <span class="field-label">வயது</span>
                    <span class="field-value">${age} ஆண்டுகள்</span>
                  </div>
                  <div class="field">
                    <span class="field-label">பிறந்த தேதி</span>
                    <span class="field-value">${formatDateForDisplay(profile.DateOfBirth)}</span>
                  </div>
                  <div class="field">
                    <span class="field-label">பாலினம்</span>
                    <span class="field-value">${profile.Gender}</span>
                  </div>
                  ${profile.SkinComplexion ? `
                    <div class="field">
                      <span class="field-label">தோல் நிறம்</span>
                      <span class="field-value">${profile.SkinComplexion}</span>
                    </div>
                  ` : ''}
                  ${profile.Height && profile.Height !== '0' && Number(profile.Height) !== 0 ? `
                    <div class="field">
                      <span class="field-label">உயரம்</span>
                      <span class="field-value">${profile.Height} செ.மீ</span>
                    </div>
                  ` : ''}
                  ${((profile.Widower === true || profile.Widower === 1) || (profile.Divorcee === true || profile.Divorcee === 1)) ? `
                    <div class="field">
                      <span class="field-label">நிலை</span>
                      <span class="field-value">
                        ${profile.Widower === true || profile.Widower === 1 ? 'விதவை/விதவர்' : ''}
                        ${(profile.Widower === true || profile.Widower === 1) && (profile.Divorcee === true || profile.Divorcee === 1) ? ' | ' : ''}
                        ${profile.Divorcee === true || profile.Divorcee === 1 ? 'விவாகரத்து பெற்றவர்' : ''}
                      </span>
                    </div>
                  ` : ''}
                </div>
              </div>
              
              <!-- Right Column -->
              <div class="right-column">
                <!-- Family Information -->
                <div class="card">
                  <div class="card-title">குடும்ப தகவல்கள்</div>
                  <div class="two-column">
                    <div class="field">
                      <span class="field-label">தந்தை பெயர்</span>
                      <span class="field-value">${profile.FatherName || '-'}</span>
                    </div>
                    ${profile.MotherName ? `
                      <div class="field">
                        <span class="field-label">தாய் பெயர்</span>
                        <span class="field-value">${profile.MotherName}</span>
                      </div>
                    ` : ''}
                    ${profile.ContactNumber ? `
                      <div class="field">
                        <span class="field-label">தொடர்பு எண்</span>
                        <span class="field-value">${profile.ContactNumber}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <!-- Education & Career -->
                ${(profile.Education || profile.Occupation || profile.Salary || profile.Address || profile.EducationDetails || profile.OccupationDetails) ? `
                  <div class="card">
                    <div class="card-title">கல்வி மற்றும் தொழில்</div>
                    <div class="two-column">
                      ${profile.Education ? `
                        <div class="field">
                          <span class="field-label">கல்வி</span>
                          <span class="field-value">${profile.Education}</span>
                        </div>
                      ` : ''}
                      ${profile.EducationDetails ? `
                        <div class="field">
                          <span class="field-label">கல்வி விவரங்கள்</span>
                          <span class="field-value">${profile.EducationDetails}</span>
                        </div>
                      ` : ''}
                      ${profile.Occupation ? `
                        <div class="field">
                          <span class="field-label">தொழில்</span>
                          <span class="field-value">${profile.Occupation}</span>
                        </div>
                      ` : ''}
                      ${profile.OccupationDetails ? `
                        <div class="field">
                          <span class="field-label">தொழில் விவரங்கள்</span>
                          <span class="field-value">${profile.OccupationDetails}</span>
                        </div>
                      ` : ''}
                      ${profile.Salary ? `
                        <div class="field">
                          <span class="field-label">மாத சம்பளம்</span>
                          <span class="field-value">₹${profile.Salary}</span>
                        </div>
                      ` : ''}
                    </div>
                    ${profile.Address ? `
                      <div class="field">
                        <span class="field-label">முகவரி</span>
                        <span class="field-value">${profile.Address}</span>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

                <!-- Photos -->
                ${photos.length > 0 ? `
                  <div class="card">
                    <div class="card-title">புகைப்படங்கள் (${photos.length})</div>
                    <div class="photos-grid">
                      ${photos.map((photo, idx) => `
                        <img src="${photo.data}" alt="Photo ${idx + 1}" class="photo-item" />
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                <!-- Horoscope -->
                ${horoscope && Object.keys(horoscope).length > 0 ? `
                  <div class="card">
                    <div class="card-title">ஜாதகம்</div>
                    ${renderHoroscopeChartForPrint(horoscope)}
                    ${horoscope.rasi ? `
                      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px;">
                          <div><span style="color: #666;">ராசி:</span> <strong>${horoscope.rasi || '-'}</strong></div>
                          <div><span style="color: #666;">நட்சத்திரம்:</span> <strong>${horoscope.natchathiram || '-'}</strong></div>
                          ${horoscope.patham ? `<div><span style="color: #666;">பாதம்:</span> <strong>${horoscope.patham}</strong></div>` : ''}
                          ${horoscope.birthTime ? `<div><span style="color: #666;">பிறந்த நேரம்:</span> <strong>${horoscope.birthTime}</strong></div>` : ''}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDelete = async () => {
    try {
      const result = await window.electronAPI.deleteProfile(profileId);
      if (result.success) {
        onShowSnackbar('சுயவிவரம் நீக்கப்பட்டது', 'success');
        onNavigate('main');
      } else {
        onShowSnackbar(result.error || 'பிழை: சுயவிவரத்தை நீக்க முடியவில்லை', 'error');
      }
    } catch (error) {
      onShowSnackbar('பிழை: ' + error.message, 'error');
    }
    setDeleteDialog(false);
  };

  const handleStatusChange = async (reason, marriedThroughService) => {
    try {
      let result;
      if (profile.IsActive === 1 || profile.IsActive === true) {
        result = await window.electronAPI.deactivateProfile(profileId, reason, marriedThroughService);
      } else {
        result = await window.electronAPI.activateProfile(profileId);
      }
      if (result.success) {
        onShowSnackbar(
          profile.IsActive === 1 || profile.IsActive === true
            ? 'சுயவிவரம் செயல்நீக்கப்பட்டது'
            : 'சுயவிவரம் செயல்படுத்தப்பட்டது',
          'success'
        );
        loadProfile();
      } else {
        onShowSnackbar(result.error || 'பிழை', 'error');
      }
    } catch (error) {
      onShowSnackbar('பிழை: ' + error.message, 'error');
    }
  };

  if (!profile) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const age = calculateAge(profile.DateOfBirth);

  // Parse photos for display
  let photos = [];
  if (Array.isArray(profile.Photos)) {
    photos = profile.Photos;
  } else if (typeof profile.Photos === 'string') {
    try {
      photos = JSON.parse(profile.Photos);
    } catch (e) {
      photos = [];
    }
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h4" className="tamil-heading">
                {profile.Name}
              </Typography>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: profile.IsActive === 1 || profile.IsActive === true ? 'success.main' : 'grey.500',
                  ml: 1,
                }}
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              Profile ID: {profile.ProfileID}
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => onNavigate(previousPage || 'main')}
            className="tamil-text"
            variant="outlined"
          >
            பின்
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Profile Photo & Basic Info */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 2 }}>
              {/* Profile Photo */}
              {photos.length > 0 ? (
                <Box
                  component="img"
                  src={photos[0].data}
                  alt={profile.Name}
                  sx={{
                    width: '100%',
                    maxWidth: 300,
                    height: 'auto',
                    borderRadius: 2,
                    mb: 2,
                    cursor: 'pointer',
                  }}
                  onClick={() => setImageDialog({ open: true, image: photos[0].data })}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 300,
                    height: 300,
                    bgcolor: 'grey.200',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    புகைப்படம் இல்லை
                  </Typography>
                </Box>
              )}

              {/* Basic Info Card */}
              <Typography variant="h6" className="tamil-text" gutterBottom sx={{ fontWeight: 'bold' }}>
                அடிப்படை தகவல்கள்
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">வயது</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{age} ஆண்டுகள்</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">பிறந்த தேதி</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{formatDateForDisplay(profile.DateOfBirth)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">பாலினம்</Typography>
                  <Chip label={profile.Gender} color="primary" size="small" sx={{ mt: 0.5 }} />
                </Box>
                {profile.SkinComplexion && (
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block">தோல் நிறம்</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{profile.SkinComplexion}</Typography>
                  </Box>
                )}
                {profile.Height && profile.Height !== '0' && Number(profile.Height) !== 0 && (
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block">உயரம்</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{profile.Height} செ.மீ</Typography>
                  </Box>
                )}
                {((profile.Widower === true || profile.Widower === 1) ||
                  (profile.Divorcee === true || profile.Divorcee === 1)) && (
                    <Box>
                      <Typography variant="caption" color="textSecondary" display="block">நிலை</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        {profile.Widower === true || profile.Widower === 1 ? (
                          <Chip label="விதவை/விதவர்" size="small" color="primary" />
                        ) : null}
                        {profile.Divorcee === true || profile.Divorcee === 1 ? (
                          <Chip label="விவாகரத்து பெற்றவர்" size="small" color="primary" />
                        ) : null}
                      </Box>
                    </Box>
                  )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Main Content */}
          <Grid item xs={12} md={8}>
            {/* Family Information */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" className="tamil-text" gutterBottom sx={{ fontWeight: 'bold' }}>
                குடும்ப தகவல்கள்
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary" display="block">தந்தை பெயர்</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{profile.FatherName}</Typography>
                </Grid>
                {profile.MotherName && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary" display="block">தாய் பெயர்</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{profile.MotherName}</Typography>
                  </Grid>
                )}
                {profile.ContactNumber && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary" display="block">தொடர்பு எண்</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{profile.ContactNumber}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Education & Career */}
            {(profile.Education || profile.Occupation || profile.Salary || profile.Address || profile.EducationDetails || profile.OccupationDetails) && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" className="tamil-text" gutterBottom sx={{ fontWeight: 'bold' }}>
                  கல்வி மற்றும் தொழில்
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {profile.Education && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary" display="block">கல்வி</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{profile.Education}</Typography>
                    </Grid>
                  )}
                  {profile.EducationDetails && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary" display="block">கல்வி விவரங்கள்</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{profile.EducationDetails}</Typography>
                    </Grid>
                  )}
                  {profile.Occupation && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary" display="block">தொழில்</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{profile.Occupation}</Typography>
                    </Grid>
                  )}
                  {profile.OccupationDetails && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary" display="block">தொழில் விவரங்கள்</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{profile.OccupationDetails}</Typography>
                    </Grid>
                  )}
                  {profile.Salary && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary" display="block">மாத சம்பளம்</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>₹{profile.Salary}</Typography>
                    </Grid>
                  )}
                  {profile.Address && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary" display="block">முகவரி</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{profile.Address}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" className="tamil-text" gutterBottom sx={{ fontWeight: 'bold' }}>
                  புகைப்படங்கள் ({photos.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {photos.map((photo, idx) => (
                    <Grid item xs={6} sm={4} md={3} key={photo.id || idx}>
                      <Box
                        component="img"
                        src={photo.data}
                        alt={photo.name || `Photo ${idx + 1}`}
                        sx={{
                          width: '100%',
                          height: 150,
                          objectFit: 'cover',
                          cursor: 'pointer',
                          borderRadius: 1,
                          '&:hover': {
                            opacity: 0.8,
                            transform: 'scale(1.02)',
                            transition: 'all 0.2s',
                          },
                        }}
                        onClick={() => setImageDialog({ open: true, image: photo.data })}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Horoscope */}
            {profile.Horoscope && Object.keys(profile.Horoscope).length > 0 && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" className="tamil-text" gutterBottom sx={{ fontWeight: 'bold' }}>
                  ஜாதகம்
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <HoroscopeDisplay horoscope={profile.Horoscope} />
              </Paper>
            )}

            {/* Action Buttons */}
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => onNavigate('edit', profile)}
                  className="tamil-text"
                >
                  சுயவிவரத்தை திருத்தவும்
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={handlePrint}
                  className="tamil-text"
                >
                  அச்சிடு
                </Button>
                <Button
                  variant="outlined"
                  startIcon={profile.IsActive === 1 || profile.IsActive === true ? <PowerOff /> : <PowerSettingsNew />}
                  onClick={() => setStatusDialog(true)}
                  className="tamil-text"
                  color={profile.IsActive === 1 || profile.IsActive === true ? 'warning' : 'success'}
                >
                  {profile.IsActive === 1 || profile.IsActive === true ? 'செயல்நீக்கு' : 'செயல்படுத்து'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setDeleteDialog(true)}
                  className="tamil-text"
                >
                  சுயவிவரத்தை நீக்கு
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Image Dialog */}
      <Dialog
        open={imageDialog.open}
        onClose={() => setImageDialog({ open: false, image: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setImageDialog({ open: false, image: null })}
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
          {imageDialog.image && (
            <Box
              component="img"
              src={imageDialog.image}
              alt="Profile"
              sx={{ width: '100%', height: 'auto', display: 'block' }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogContent>
          <Typography className="tamil-text">
            இந்த சுயவிவரத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} className="tamil-text">
            ரத்துசெய்
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" className="tamil-text">
            நீக்கு
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Dialog */}
      <ProfileStatusDialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        onConfirm={handleStatusChange}
        isActive={profile.IsActive === 1 || profile.IsActive === true}
        existingReason={profile.DeactivationReason || ''}
      />
    </Container>
  );
};

export default ProfileView;

