import React from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Chip } from '@mui/material';

const GRAHAS = [
  { name: 'சூரியன்', abbrev: 'சூ' },
  { name: 'சந்திரன்', abbrev: 'ச' },
  { name: 'செவ்வாய்', abbrev: 'செ' },
  { name: 'புதன்', abbrev: 'பு' },
  { name: 'குரு', abbrev: 'கு' },
  { name: 'சுக்கிரன்', abbrev: 'சுக' },
  { name: 'சனி', abbrev: 'சனி' },
  { name: 'ராகு', abbrev: 'ரா' },
  { name: 'கேது', abbrev: 'கே' },
];

const HoroscopeDisplay = ({ horoscope = {} }) => {
  const getGrahaAbbrev = (grahaName) => {
    const graha = GRAHAS.find(g => g.name === grahaName);
    return graha ? graha.abbrev : grahaName;
  };

  if (!horoscope || Object.keys(horoscope).length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          ஜாதகத் தகவல் இல்லை
        </Typography>
      </Paper>
    );
  }

  // Ensure grahas is an array
  const grahas = horoscope.grahas || [];

  return (
    <Box>
      {/* Basic Information Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>ராசி</TableCell>
              <TableCell sx={{ width: '25%' }}>{horoscope.rasi || '-'}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>நட்சத்திரம்</TableCell>
              <TableCell sx={{ width: '25%' }}>{horoscope.natchathiram || '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>பாதம்</TableCell>
              <TableCell>{horoscope.patham || '-'}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>பிறந்த நேரம்</TableCell>
              <TableCell>{horoscope.birthTime || '-'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>திசை</TableCell>
              <TableCell>{horoscope.disai || '-'}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>இருப்பு</TableCell>
              <TableCell>{horoscope.iruppu || '-'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Horoscope Chart */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        ஜாதக வரைபடம்
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: 0,
            maxWidth: 600,
            width: '100%',
          }}
        >
          {/* Row 1: Houses 12, 1, 2, 3 */}
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 12
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[11]) && grahas[11].length > 0) ? (
                grahas[11].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 1
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[0]) && grahas[0].length > 0) ? (
                grahas[0].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 2
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[1]) && grahas[1].length > 0) ? (
                grahas[1].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 3
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[2]) && grahas[2].length > 0) ? (
                grahas[2].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>

          {/* Row 2: House 11, Center (merged), House 4 */}
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 11
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[10]) && grahas[10].length > 0) ? (
                grahas[10].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>
          <Paper
            sx={{
              p: 2,
              gridColumn: '2 / 4',
              gridRow: '2 / 4',
              minHeight: 242,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff3cd',
              border: '2px solid #ffc107',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem', display: 'block', mb: 0.25 }}>
                  பிறந்த தேதி
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {horoscope.birthDate || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem', display: 'block', mb: 0.25 }}>
                  நட்சத்திரம்
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {horoscope.natchathiram || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem', display: 'block', mb: 0.25 }}>
                  திசை
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {horoscope.disai || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem', display: 'block', mb: 0.25 }}>
                  இருப்பு
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {horoscope.iruppu || '-'}
                </Typography>
              </Box>
            </Box>
          </Paper>
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 4
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[3]) && grahas[3].length > 0) ? (
                grahas[3].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>

          {/* Row 3: House 10, (center already rendered), House 5 */}
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 10
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[9]) && grahas[9].length > 0) ? (
                grahas[9].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>
          {/* Center is already rendered above */}
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 5
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[4]) && grahas[4].length > 0) ? (
                grahas[4].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>

          {/* Row 4: Houses 9, 8, 7, 6 */}
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 9
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[8]) && grahas[8].length > 0) ? (
                grahas[8].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 8
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[7]) && grahas[7].length > 0) ? (
                grahas[7].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 7
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[6]) && grahas[6].length > 0) ? (
                grahas[6].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>
          <Paper sx={{ p: 1.5, minHeight: 120, border: '2px solid', borderColor: '#1976d2', borderRadius: 1, backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold', color: '#1976d2', fontSize: '0.7rem' }}>
              வீடு 6
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(Array.isArray(grahas[5]) && grahas[5].length > 0) ? (
                grahas[5].map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>-</Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HoroscopeDisplay;
