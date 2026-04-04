import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ArrowBack, Print, Male, Female } from '@mui/icons-material';
import { formatDateForDisplay, calculateAge } from '../utils/dateUtils';

const YearlyReport = ({ onNavigate }) => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.getProfiles();

      if (result.success && result.data) {
        // Ensure Photos is parsed as array for each profile
        const profilesWithParsedPhotos = result.data.map(profile => {
          const parsedProfile = { ...profile };
          // Parse Photos if it's a string
          if (parsedProfile.Photos) {
            if (typeof parsedProfile.Photos === 'string') {
              try {
                parsedProfile.Photos = JSON.parse(parsedProfile.Photos);
              } catch (e) {
                parsedProfile.Photos = [];
              }
            } else if (!Array.isArray(parsedProfile.Photos)) {
              parsedProfile.Photos = [];
            }
          } else {
            parsedProfile.Photos = [];
          }
          return parsedProfile;
        });

        // Sort alphabetically by name
        const sorted = profilesWithParsedPhotos.sort((a, b) => {
          const an = parseInt(String(a.ProfileID || '').replace(/^SV/i, ''), 10) || 0;
          const bn = parseInt(String(b.ProfileID || '').replace(/^SV/i, ''), 10) || 0;
          return an - bn;
        });
        setProfiles(sorted);
        applyGenderFilter(sorted, genderFilter);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyGenderFilter = (profilesToFilter, filter) => {
    if (filter === 'all') {
      setFilteredProfiles(profilesToFilter);
    } else {
      const filtered = profilesToFilter.filter(profile => {
        const isMale = profile.Gender === 'ஆண்' || profile.Gender === 'Male' || profile.Gender === 'male';
        return filter === 'male' ? isMale : !isMale;
      });
      setFilteredProfiles(filtered);
    }
  };

  const handleGenderFilterChange = (event) => {
    const newFilter = event.target.value;
    setGenderFilter(newFilter);
    applyGenderFilter(profiles, newFilter);
  };

  useEffect(() => {
    if (profiles.length > 0) {
      applyGenderFilter(profiles, genderFilter);
    }
  }, [genderFilter, profiles]);

  const renderHoroscopeChart = (horoscope) => {
    if (!horoscope || Object.keys(horoscope).length === 0) {
      return '<div style="text-align: center; color: #999; font-size: 10px;">ஜாதகம் இல்லை</div>';
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
      'லக்னம்': 'ல'
    };

    const getGrahaAbbrev = (grahaName) => GRAHAS[grahaName] || grahaName;

    // Parse grahas if needed
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

    let html = '<div style="display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); gap: 0; width: 100%; margin: 4px auto 0;">';

    // Helper function to render a house
    const renderHouse = (houseIndex) => {
      const houseGrahas = Array.isArray(grahas[houseIndex]) ? grahas[houseIndex] : [];
      return `
        <div style="padding: 2px; min-height: 25px; border: 1px solid #778089; display: flex; flex-direction: column; font-size: 7px;">
          <div style="color: #778089; margin-bottom: 2px;">${houseIndex + 1}</div>
          <div style="display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; flex: 1; align-items: center;">
            ${houseGrahas.length > 0 ? houseGrahas.map(graha =>
        `<b>${getGrahaAbbrev(graha)}</b>`
      ).join('') : '<span style="color: #999; font-size: 7px;">-</span>'}
          </div>
        </div>
      `;
    };

    // Render in visual order: Row 1
    html += renderHouse(11); // House 12
    html += renderHouse(0);  // House 1
    html += renderHouse(1);  // House 2
    html += renderHouse(2);  // House 3

    // Row 2
    html += renderHouse(10); // House 11
    // Center cell (merged, spans 2x2)
    html += `
      <div style="grid-column: 2 / 4; grid-row: 2 / 4; padding: 4px; min-height: 50px; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 2px; text-align: center; font-size: 7px;">
        <div style="font-weight: bold; margin-bottom: 2px;">பிறந்த தேதி</div>
        <div>${horoscope.birthDate || '-'}</div>
        <div style="font-weight: bold; margin-top: 4px; margin-bottom: 2px;">நட்சத்திரம்</div>
        <div>${horoscope.natchathiram || '-'}   ${horoscope.patham ? ` | பாதம்: ${horoscope.patham}` : ''}
</div>
        <div style="font-weight: bold; margin-top: 4px; margin-bottom: 2px;">திசை</div>
        <div>${horoscope.disai || '-'}</div>
        <div style="font-weight: bold; margin-top: 4px; margin-bottom: 2px;">இருப்பு</div>
        <div>${horoscope.iruppu || '-'}</div>
      </div>
    `;
    html += renderHouse(3);  // House 4

    // Row 3 (center already rendered)
    html += renderHouse(9);  // House 10
    // (center cell already rendered)
    html += renderHouse(4);  // House 5

    // Row 4
    html += renderHouse(8);  // House 9
    html += renderHouse(7);  // House 8
    html += renderHouse(6);  // House 7
    html += renderHouse(5);  // House 6

    html += '</div>';
    return html;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    const chunkArray = (array, size) => {
      const chunked = [];
      for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
      }
      return chunked;
    };

    const profileChunks = chunkArray(filteredProfiles, 6);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Yearly Report - ${currentYear}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap');
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Noto Sans Tamil', sans-serif;
              padding: 20px;
            }
            @media print {
              @page {
                size: A4;
                margin: 0.5in;
              }
              .page-break {
                page-break-after: always;
              }
              .title-page {
                page-break-after: always;
              }
            }
            .title-page {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              text-align: center;
              padding: 40px;
              background: linear-gradient(to bottom, #f5f5f5, #ffffff);
            }
            .title-page h1 {
              font-size: 48px;
              margin-bottom: 30px;
              color: #1976d2;
              font-weight: bold;
            }
            .title-page h2 {
              font-size: 36px;
              margin-bottom: 50px;
              color: #333;
              font-weight: normal;
            }
            .title-page .subtitle {
              font-size: 24px;
              margin-bottom: 100px;
              color: #666;
            }
            .title-page .year {
              font-size: 32px;
              color: #1976d2;
              font-weight: bold;
              margin-top: 50px;
            }
            .title-page .stats {
              font-size: 18px;
              color: #666;
              margin-top: 80px;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
              padding-bottom: 8px;
              border-bottom: 1px solid #000;
            }
            .header h1 {
              font-size: 10px;
              margin-bottom: 2px;
            }
            .header h2 {
              font-size: 10px;
              font-weight: normal;
            }
            .page-container {
              display: flex;
              flex-direction: column;
              height: 10.5in;
              box-sizing: border-box;
            }
            .page-container.page-break {
              page-break-after: always;
            }
            .profile-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(2, 1fr);
              gap: 4px;
              flex: 1;
              min-height: 0;
            }
            .profile-card {
              border: 1px solid #ccc;
              padding: 6px;
              page-break-inside: avoid;
              display: flex;
              flex-direction: column;
              min-height: 0;
              overflow: hidden;
            }
            .profile-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 6px;
            }
            .profile-photo {
              width: 50px;
              height: 50px;
              object-fit: cover;
              border-radius: 4px;
              flex-shrink: 0;
            }
            .profile-name {
              font-weight: bold;
              font-size: 11px;
              line-height: 1.2;
            }
            .profile-details {
              font-size: 9px;
              margin-bottom: 4px;
              flex: 0 0 auto;
              line-height: 1.2;
            }
            .profile-details div {
              margin-bottom: 2px;
            }
            .horoscope-mini {
              margin-top: auto;
              font-size: 8px;
              padding-top: 6px;
            }
            .no-photo {
              width: 50px;
              height: 50px;
              background: #f0f0f0;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 4px;
              font-size: 30px;
              color: #999;
              flex-shrink: 0;
            }
          </style>
        </head>
        <body>
          <!-- Title Page -->
          <div class="title-page">
            <h1>தமிழ்நாடு சைவ வேளாளர் சங்கம்</h1>
            <h2>தஞ்சாவூர்</h2>
            <div class="subtitle">வருடாந்திர பட்டியல்</div>
            <div class="year">${currentYear}</div>
            <div class="stats">
              ${genderFilter === 'all'
        ? `மொத்த சுயவிவரங்கள்: ${filteredProfiles.length}`
        : genderFilter === 'male'
          ? `ஆண் சுயவிவரங்கள்: ${filteredProfiles.length}`
          : `பெண் சுயவிவரங்கள்: ${filteredProfiles.length}`}
            </div>
          </div>
          
          <!-- Content Pages -->
          ${profileChunks.map((chunk, chunkIndex) => `
            <div class="page-container ${chunkIndex < profileChunks.length - 1 ? 'page-break' : ''}">
              <div class="header">
                <h1>தமிழ்நாடு சைவ வேளாளர் சங்கம், தஞ்சாவூர்</h1>
                <h2>வருடாந்திர பட்டியல் - ${currentYear}</h2>
              </div>
              <div class="profile-grid">
                ${chunk.map((profile, index) => {
            const age = calculateAge(profile.DateOfBirth);
            const hasPhoto = profile.Photos && Array.isArray(profile.Photos) && profile.Photos.length > 0;
            const isMale = profile.Gender === 'ஆண்' || profile.Gender === 'Male' || profile.Gender === 'male';
            const photoHtml = hasPhoto
              ? `<img src="${profile.Photos[0].data}" alt="${profile.Name}" class="profile-photo" />`
              : `<div class="no-photo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="${isMale ? '#2196f3' : '#e91e63'}" style="width: 40px; height: 40px;">
                      ${isMale
                ? '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>'
                : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>'}
                    </svg>
                  </div>`;

            // Parse horoscope if it's a string
            let horoscope = profile.Horoscope;
            if (horoscope && typeof horoscope === 'string') {
              try {
                horoscope = JSON.parse(horoscope);
              } catch (e) {
                horoscope = {};
              }
            }

            return `
                <div class="profile-card">
                  <div class="profile-header">
                    ${photoHtml}
                    <div>
                      <div class="profile-name">${profile.Name}</div>
                      <div style="font-size: 9px;">ID: ${profile.ProfileID}</div>
                    </div>
                  </div>
                  <div class="profile-details">
                    <div><span style="color: #666;">வயது:</span> <strong>${age} ஆண்டுகள்</strong></div>
                    <div><span style="color: #666;">பாலினம்:</span> <strong>${profile.Gender}</strong></div>
                    <div><span style="color: #666;">பிறந்த தேதி:</span> <strong>${formatDateForDisplay(profile.DateOfBirth)}</strong></div>
                    ${profile.FatherName ? `<div><span style="color: #666;">தந்தை:</span> <strong>${profile.FatherName}</strong></div>` : ''}
                    ${profile.MotherName ? `<div><span style="color: #666;">தாய்:</span> <strong>${profile.MotherName}</strong></div>` : ''}
                    ${profile.Height && profile.Height !== '0' && Number(profile.Height) !== 0 ? `<div><span style="color: #666;">உயரம்:</span> <strong>${profile.Height} செ.மீ</strong></div>` : ''}
                    ${profile.SkinComplexion ? `<div><span style="color: #666;">தோல் நிறம்:</span> <strong>${profile.SkinComplexion}</strong></div>` : ''}
                    ${((profile.Widower === true || profile.Widower === 1) || (profile.Divorcee === true || profile.Divorcee === 1)) ? `
                      <div><span style="color: #666;">நிலை:</span> <strong>
                        ${profile.Widower === true || profile.Widower === 1 ? 'விதவை/விதவர்' : ''}
                        ${(profile.Widower === true || profile.Widower === 1) && (profile.Divorcee === true || profile.Divorcee === 1) ? ' | ' : ''}
                        ${profile.Divorcee === true || profile.Divorcee === 1 ? 'விவாகரத்து பெற்றவர்' : ''}
                      </strong></div>
                    ` : ''}
                    ${profile.ContactNumber ? `<div><span style="color: #666;">தொடர்பு எண்:</span> <strong>${profile.ContactNumber}</strong></div>` : ''}

                    ${profile.EducationDetails ? `<div><span style="color: #666;">கல்வி:</span> <strong>${profile.EducationDetails}</strong></div>` : ''}
                    ${profile.OccupationDetails ? `<div><span style="color: #666;">தொழில்:</span> <strong>${profile.OccupationDetails}</strong></div>` : ''}
                    ${profile.Salary
                ? `<div>
       <span style="color: #666;">சம்பளம்:</span> 
       <strong>₹${Number(profile.Salary).toLocaleString('en-IN')}</strong>
     </div>`
                : ''
              }
                    ${profile.Address ? `<div><span style="color: #666;">முகவரி:</span> <strong>${profile.Address}</strong></div>` : ''}
                  </div>
                  <div class="horoscope-mini">
                    ${renderHoroscopeChart(horoscope)}
                  </div>
                </div>
              `;
          }).join('')}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" className="tamil-heading">
            வருடாந்திர பட்டியல் - {currentYear}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>பாலினம்</InputLabel>
              <Select
                value={genderFilter}
                onChange={handleGenderFilterChange}
                label="பாலினம்"
              >
                <MenuItem value="all">அனைத்தும்</MenuItem>
                <MenuItem value="male">ஆண்</MenuItem>
                <MenuItem value="female">பெண்</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrint}
              className="tamil-text"
            >
              அச்சிடு
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

        {loading ? (
          <Typography>ஏற்றுகிறது...</Typography>
        ) : (
          <Box>
            <Typography variant="h6" className="tamil-text" gutterBottom>
              மொத்த சுயவிவரங்கள்: {filteredProfiles.length} {genderFilter !== 'all' && `(${profiles.length} மொத்தம்)`}
            </Typography>
            <Grid container spacing={2}>
              {filteredProfiles.map((profile) => {
                const age = calculateAge(profile.DateOfBirth);
                return (
                  <Grid item xs={12} sm={6} md={4} key={profile.ProfileID}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        {profile.Photos && Array.isArray(profile.Photos) && profile.Photos.length > 0 ? (
                          <Box
                            component="img"
                            src={profile.Photos[0].data}
                            alt={profile.Name}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              bgcolor: 'grey.200',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 1,
                            }}
                          >
                            {(profile.Gender === 'ஆண்' || profile.Gender === 'Male' || profile.Gender === 'male') ? (
                              <Male sx={{ fontSize: 50, color: '#2196f3' }} />
                            ) : (
                              <Female sx={{ fontSize: 50, color: '#e91e63' }} />
                            )}
                          </Box>
                        )}
                        <Box>
                          <Typography variant="h6" className="tamil-text">
                            {profile.Name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ID: {profile.ProfileID}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2">
                        <Box component="span" sx={{ color: 'text.secondary' }}>வயது:</Box> <strong>{age} ஆண்டுகள்</strong> | <Box component="span" sx={{ color: 'text.secondary' }}>பாலினம்:</Box> <strong>{profile.Gender}</strong>
                      </Typography>
                      {profile.FatherName && (
                        <Typography variant="body2">
                          <Box component="span" sx={{ color: 'text.secondary' }}>தந்தை:</Box> <strong>{profile.FatherName}</strong>
                        </Typography>
                      )}
                      {profile.MotherName && (
                        <Typography variant="body2">
                          <Box component="span" sx={{ color: 'text.secondary' }}>தாய்:</Box> <strong>{profile.MotherName}</strong>
                        </Typography>
                      )}
                      {profile.Height && profile.Height !== '0' && Number(profile.Height) !== 0 && (
                        <Typography variant="body2">
                          <Box component="span" sx={{ color: 'text.secondary' }}>உயரம்:</Box> <strong>{profile.Height} செ.மீ</strong>
                        </Typography>
                      )}
                      {profile.SkinComplexion && (
                        <Typography variant="body2">
                          <Box component="span" sx={{ color: 'text.secondary' }}>தோல் நிறம்:</Box> <strong>{profile.SkinComplexion}</strong>
                        </Typography>
                      )}
                      {((profile.Widower === true || profile.Widower === 1) || (profile.Divorcee === true || profile.Divorcee === 1)) && (
                        <Typography variant="body2">
                          <Box component="span" sx={{ color: 'text.secondary' }}>நிலை:</Box> <strong>
                            {[
                              (profile.Widower === true || profile.Widower === 1) ? 'விதவை/விதவர்' : '',
                              (profile.Divorcee === true || profile.Divorcee === 1) ? 'விவாகரத்து பெற்றவர்' : ''
                            ].filter(Boolean).join(' | ')}
                          </strong>
                        </Typography>
                      )}
                      {profile.EducationDetails && (
                        <Typography variant="body2">
                          <Box component="span" sx={{ color: 'text.secondary' }}>கல்வி:</Box> <strong>{profile.EducationDetails}</strong>
                        </Typography>
                      )}
                      {profile.OccupationDetails && (
                        <Typography variant="body2">
                          <Box component="span" sx={{ color: 'text.secondary' }}>தொழில்:</Box> <strong>{profile.OccupationDetails}</strong>
                        </Typography>
                      )}
                      {profile.Salary && (
                        <Typography variant="body2">
                          <Box component="span" sx={{ color: 'text.secondary' }}>சம்பளம்:</Box> <strong>₹{profile.Salary}</strong>
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default YearlyReport;

