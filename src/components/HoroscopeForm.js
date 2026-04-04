import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
} from '@mui/material';
import { disablePramukhIME } from '../utils/tamilTransliteration';

const RASIS = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
];

const NATCHATHIRAMS = [
  'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிஷம்', 'திருவாதிரை',
  'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்',
  'அத்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை',
  'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்',
  'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'
];

const DISAIS = [
  'சூரியன்', 'சந்திரன்', 'செவ்வாய்', 'புதன்', 'குரு', 'சுக்கிரன்', 'சனி', 'ராகு', 'கேது'
];

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
  { name: 'லக்னம்', abbrev: 'ல' },
];

const HoroscopeForm = ({ horoscope = {}, onChange, dateOfBirth }) => {
  const [localHoroscope, setLocalHoroscope] = useState({
    rasi: '',
    natchathiram: '',
    patham: '',
    birthDate: dateOfBirth || '',
    birthTime: '',
    disai: '',
    iruppu: '',
    grahas: Array(12).fill(null).map(() => []),
    ...horoscope,
  });

  const [grahaDialog, setGrahaDialog] = useState({ open: false, houseIndex: null });
  const [selectedGrahas, setSelectedGrahas] = useState([]);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (dateOfBirth && dateOfBirth !== localHoroscope.birthDate) {
      const updated = { ...localHoroscope, birthDate: dateOfBirth };
      setLocalHoroscope(updated);
      if (onChangeRef.current) {
        setTimeout(() => {
          onChangeRef.current(updated);
        }, 0);
      }
    }
  }, [dateOfBirth]);

  const handleChange = (field, value) => {
    const updated = { ...localHoroscope, [field]: value };
    setLocalHoroscope(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const handleHouseClick = (houseIndex) => {
    if (houseIndex === -1) return; // Merged cell
    setSelectedGrahas([...localHoroscope.grahas[houseIndex] || []]);
    setGrahaDialog({ open: true, houseIndex });
  };

  const handleGrahaToggle = (grahaName) => {
    if (selectedGrahas.includes(grahaName)) {
      setSelectedGrahas(selectedGrahas.filter(g => g !== grahaName));
    } else {
      setSelectedGrahas([...selectedGrahas, grahaName]);
    }
  };

  const handleGrahaSave = () => {
    const updatedGrahas = [...localHoroscope.grahas];
    updatedGrahas[grahaDialog.houseIndex] = selectedGrahas;
    handleChange('grahas', updatedGrahas);
    setGrahaDialog({ open: false, houseIndex: null });
  };

  const getGrahaAbbrev = (grahaName) => {
    const graha = GRAHAS.find(g => g.name === grahaName);
    return graha ? graha.abbrev : grahaName;
  };

  return (
    <Box>
      {/* Basic Information Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>ராசி</TableCell>
              <TableCell sx={{ width: '25%' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>ராசி</InputLabel>
                  <Select
                    value={localHoroscope.rasi}
                    onChange={(e) => handleChange('rasi', e.target.value)}
                    label="ராசி"
                  >
                    {RASIS.map((rasi) => (
                      <MenuItem key={rasi} value={rasi}>
                        {rasi}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>நட்சத்திரம்</TableCell>
              <TableCell sx={{ width: '25%' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>நட்சத்திரம்</InputLabel>
                  <Select
                    value={localHoroscope.natchathiram}
                    onChange={(e) => handleChange('natchathiram', e.target.value)}
                    label="நட்சத்திரம்"
                  >
                    {NATCHATHIRAMS.map((natch) => (
                      <MenuItem key={natch} value={natch}>
                        {natch}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>பாதம்</TableCell>
              <TableCell>
                <FormControl fullWidth size="small">
                  <InputLabel>பாதம்</InputLabel>
                  <Select
                    value={localHoroscope.patham}
                    onChange={(e) => handleChange('patham', e.target.value)}
                    label="பாதம்"
                  >
                    <MenuItem value="">
                      <em>தேர்வு செய்யவும்</em>
                    </MenuItem>
                    {[1, 2, 3, 4].map((p) => (
                      <MenuItem key={p} value={p.toString()}>
                        {p}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              {/*  <TableCell sx={{ fontWeight: 'bold' }}>பிறந்த நேரம்</TableCell>
              <TableCell>
                <TextField
                  type="time"
                  value={localHoroscope.birthTime}
                  onChange={(e) => handleChange('birthTime', e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  onFocus={(e) => disablePramukhIME(e.target)}
                />
              </TableCell> */}
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>திசை</TableCell>
              <TableCell>
                <FormControl fullWidth size="small">
                  <InputLabel>திசை</InputLabel>
                  <Select
                    value={localHoroscope.disai}
                    onChange={(e) => handleChange('disai', e.target.value)}
                    label="திசை"
                  >
                    {DISAIS.map((disai) => (
                      <MenuItem key={disai} value={disai}>
                        {disai}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>இருப்பு</TableCell>
              <TableCell>
                <TextField
                  value={localHoroscope.iruppu}
                  onChange={(e) => handleChange('iruppu', e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="1-10-25"
                  onFocus={(e) => disablePramukhIME(e.target)}
                  helperText="ஆங்கிலத்தில் மட்டும் உள்ளிடவும்"
                />
              </TableCell>
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
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': {
                backgroundColor: '#e3f2fd',
                borderColor: '#1565c0',
                transform: 'scale(1.02)',
                transition: 'all 0.2s',
              },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(11)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              12
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[11] || []).length > 0 ? (
                (localHoroscope.grahas[11] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
              )}
            </Box>
          </Paper>
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#1565c0', transform: 'scale(1.02)', transition: 'all 0.2s' },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(0)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              1
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[0] || []).length > 0 ? (
                (localHoroscope.grahas[0] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
              )}
            </Box>
          </Paper>
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#1565c0', transform: 'scale(1.02)', transition: 'all 0.2s' },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(1)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              2
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[1] || []).length > 0 ? (
                (localHoroscope.grahas[1] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
              )}
            </Box>
          </Paper>
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#1565c0', transform: 'scale(1.02)', transition: 'all 0.2s' },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(2)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              3
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[2] || []).length > 0 ? (
                (localHoroscope.grahas[2] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Row 2: House 11, Center (merged), House 4 */}
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#1565c0', transform: 'scale(1.02)', transition: 'all 0.2s' },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(10)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              11
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[10] || []).length > 0 ? (
                (localHoroscope.grahas[10] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
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
                  {localHoroscope.birthDate || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem', display: 'block', mb: 0.25 }}>
                  நட்சத்திரம்
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {localHoroscope.natchathiram || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem', display: 'block', mb: 0.25 }}>
                  திசை
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {localHoroscope.disai || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem', display: 'block', mb: 0.25 }}>
                  இருப்பு
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  {localHoroscope.iruppu || '-'}
                </Typography>
              </Box>
            </Box>
          </Paper>
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#1565c0', transform: 'scale(1.02)', transition: 'all 0.2s' },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(3)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              4
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[3] || []).length > 0 ? (
                (localHoroscope.grahas[3] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Row 3: House 10, (center already rendered), House 5 */}
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#1565c0', transform: 'scale(1.02)', transition: 'all 0.2s' },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(9)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              10
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[9] || []).length > 0 ? (
                (localHoroscope.grahas[9] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
              )}
            </Box>
          </Paper>
          {/* Center is already rendered above */}
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#1565c0', transform: 'scale(1.02)', transition: 'all 0.2s' },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(4)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              5
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[4] || []).length > 0 ? (
                (localHoroscope.grahas[4] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Row 4: Houses 9, 8, 7, 6 */}
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#1565c0', transform: 'scale(1.02)', transition: 'all 0.2s' },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(8)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              9
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[8] || []).length > 0 ? (
                (localHoroscope.grahas[8] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
              )}
            </Box>
          </Paper>
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#1565c0', transform: 'scale(1.02)', transition: 'all 0.2s' },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(7)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              8
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[7] || []).length > 0 ? (
                (localHoroscope.grahas[7] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
              )}
            </Box>
          </Paper>
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#1565c0', transform: 'scale(1.02)', transition: 'all 0.2s' },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(6)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              7
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[6] || []).length > 0 ? (
                (localHoroscope.grahas[6] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
              )}
            </Box>
          </Paper>
          <Paper
            sx={{
              p: 1.5,
              minHeight: 120,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: '#778089',
              borderRadius: 1,
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#e3f2fd', borderColor: '#1565c0', transform: 'scale(1.02)', transition: 'all 0.2s' },
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={() => handleHouseClick(5)}
          >
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#778089', fontSize: '0.7rem' }}>
              6
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              {(localHoroscope.grahas[5] || []).length > 0 ? (
                (localHoroscope.grahas[5] || []).map((graha) => (
                  <Chip key={graha} label={getGrahaAbbrev(graha)} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 24, '& .MuiChip-label': { padding: '0 6px' } }} />
                ))
              ) : (
                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  கிளிக் செய்யவும்
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      <Dialog open={grahaDialog.open} onClose={() => setGrahaDialog({ open: false, houseIndex: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {grahaDialog.houseIndex !== null ? grahaDialog.houseIndex + 1 : ''} - கிரகங்களைத் தேர்ந்தெடுக்கவும்
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {GRAHAS.map((graha) => (
              <Grid item xs={6} sm={4} key={graha.name}>
                <Chip
                  label={graha.name}
                  onClick={() => handleGrahaToggle(graha.name)}
                  color={selectedGrahas.includes(graha.name) ? 'primary' : 'default'}
                  sx={{ width: '100%', cursor: 'pointer' }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGrahaDialog({ open: false, houseIndex: null })}>
            ரத்துசெய்
          </Button>
          <Button onClick={handleGrahaSave} variant="contained">
            சேமி
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HoroscopeForm;
