import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore, Save, ArrowBack } from '@mui/icons-material';
import TamilTextField from './TamilTextField';
import TranslatableTextField from './TranslatableTextField';
import ImageUpload from './ImageUpload';
import HoroscopeForm from './HoroscopeForm';
import { formatDateForStorage, formatDateForDisplay, formatDateInput, isValidDate } from '../utils/dateUtils';
import { sanitizeProfileData } from '../utils/dataSanitization';
import { disablePramukhIME } from '../utils/tamilTransliteration';

const GENDERS = ['ஆண்', 'பெண்', 'மற்றவை'];
const SKIN_COMPLEXIONS = [
  'வெளிறிய நிறம் (Fair)',
  'மாநிறம் (Wheatish)',
  'கருமையான நிறம் (Dark)',
];
const EDUCATION_OPTIONS = [
  '10th Pass',
  '12th Pass',
  'Diploma',
  'Graduate',
  'Post Graduate',
  'Doctorate',
  'Other',
];
const OCCUPATION_OPTIONS = [
  'Government Employee',
  'Private Employee',
  'Business',
  'Professional',
  'Student',
  'Homemaker',
  'Other',
];

const EditProfile = ({ profile, onNavigate, onShowSnackbar }) => {
  const [formData, setFormData] = useState(null);
  const [showHoroscope, setShowHoroscope] = useState(false);
  const [dateInputValue, setDateInputValue] = useState('');

  useEffect(() => {
    if (profile) {
      const displayDate = formatDateForDisplay(profile.DateOfBirth);
      setDateInputValue(displayDate);
      setFormData({
        ...profile,
        DateOfBirth: displayDate,
        Widower: profile.Widower === true || profile.Widower === 1,
        Divorcee: profile.Divorcee === true || profile.Divorcee === 1,
        Photos: profile.Photos || [],
        Horoscope: profile.Horoscope || {},
      });
      setShowHoroscope(profile.Horoscope && Object.keys(profile.Horoscope).length > 0);
    }
  }, [profile]);

  if (!formData) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const handleInputChange = (field, value) => {
    if (field === 'DateOfBirth') {
      const formatted = formatDateInput(value);
      setDateInputValue(formatted);
      setFormData({ ...formData, [field]: formatted });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleDateBlur = () => {
    if (dateInputValue && !isValidDate(dateInputValue)) {
      onShowSnackbar('தவறான தேதி வடிவம். dd/mm/yyyy வடிவத்தைப் பயன்படுத்தவும்', 'error');
      return;
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.Name || formData.Name.trim() === '') {
      onShowSnackbar('பெயர் தேவையானது', 'error');
      return;
    }
    if (!formData.DateOfBirth || formData.DateOfBirth.trim() === '') {
      onShowSnackbar('பிறந்த தேதி தேவையானது', 'error');
      return;
    }
    if (!isValidDate(formData.DateOfBirth)) {
      onShowSnackbar('தவறான தேதி வடிவம். dd/mm/yyyy வடிவத்தைப் பயன்படுத்தவும்', 'error');
      return;
    }
    if (!formData.Gender || formData.Gender.trim() === '') {
      onShowSnackbar('பாலினம் தேவையானது', 'error');
      return;
    }
    if (!formData.FatherName || formData.FatherName.trim() === '') {
      onShowSnackbar('தந்தை பெயர் தேவையானது', 'error');
      return;
    }

    // Convert date to storage format
    const dataToSave = {
      ...formData,
      DateOfBirth: formatDateForStorage(formData.DateOfBirth),
    };

    // Clean up Height
    if (dataToSave.Height === '' || dataToSave.Height === '0' || Number(dataToSave.Height) === 0) {
      dataToSave.Height = '';
    }

    // Sanitize data
    const sanitizedData = sanitizeProfileData(dataToSave);

    try {
      const result = await window.electronAPI.updateProfile(profile.ProfileID, sanitizedData);
      if (result.success) {
        onShowSnackbar('சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது', 'success');
        onNavigate('view', profile.ProfileID);
      } else {
        onShowSnackbar(result.error || 'பிழை: சுயவிவரத்தை புதுப்பிக்க முடியவில்லை', 'error');
      }
    } catch (error) {
      onShowSnackbar('பிழை: ' + error.message, 'error');
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" className="tamil-heading">
            சுயவிவரத்தை திருத்தவும்
          </Typography>
          {/* <Button
            startIcon={<ArrowBack />}
            onClick={() => onNavigate('view', profile.ProfileID)}
            className="tamil-text"
            variant="outlined"
          >
            பின்
          </Button> */}
        </Box>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" className="tamil-text">
                  அடிப்படை தகவல்கள்
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TamilTextField
                      label="பெயர் *"
                      value={formData.Name}
                      onChange={(e) => handleInputChange('Name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="பிறந்த தேதி *"
                      value={dateInputValue}
                      onChange={(e) => handleInputChange('DateOfBirth', e.target.value)}
                      placeholder="dd/mm/yyyy"
                      fullWidth
                      required
                      onBlur={handleDateBlur}
                      onFocus={(e) => disablePramukhIME(e.target)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>பாலினம் *</InputLabel>
                      <Select
                        value={formData.Gender}
                        onChange={(e) => handleInputChange('Gender', e.target.value)}
                        label="பாலினம் *"
                      >
                        {GENDERS.map((gender) => (
                          <MenuItem key={gender} value={gender}>
                            {gender}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>தோல் நிறம்</InputLabel>
                      <Select
                        value={formData.SkinComplexion}
                        onChange={(e) => handleInputChange('SkinComplexion', e.target.value)}
                        label="தோல் நிறம்"
                      >
                        {SKIN_COMPLEXIONS.map((comp) => (
                          <MenuItem key={comp} value={comp}>
                            {comp}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="உயரம் (செ.மீ)"
                      type="number"
                      value={formData.Height}
                      onChange={(e) => handleInputChange('Height', e.target.value)}
                      fullWidth
                      onFocus={(e) => disablePramukhIME(e.target)}
                      onBlur={() => { }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.Widower}
                          onChange={(e) => handleInputChange('Widower', e.target.checked)}
                        />
                      }
                      label="விதவை/விதவர்"
                      className="tamil-text"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.Divorcee}
                          onChange={(e) => handleInputChange('Divorcee', e.target.checked)}
                        />
                      }
                      label="விவாகரத்து பெற்றவர்"
                      className="tamil-text"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TamilTextField
                      label="தந்தை பெயர் *"
                      value={formData.FatherName}
                      onChange={(e) => handleInputChange('FatherName', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TamilTextField
                      label="தாய் பெயர்"
                      value={formData.MotherName}
                      onChange={(e) => handleInputChange('MotherName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="தொடர்பு எண்"
                      value={formData.ContactNumber}
                      onChange={(e) => handleInputChange('ContactNumber', e.target.value)}
                      fullWidth
                      onFocus={(e) => disablePramukhIME(e.target)}
                      onBlur={() => { }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Education & Career */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" className="tamil-text">
                  கல்வி மற்றும் தொழில்
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>கல்வி</InputLabel>
                      <Select
                        value={formData.Education}
                        onChange={(e) => handleInputChange('Education', e.target.value)}
                        label="கல்வி"
                      >
                        {EDUCATION_OPTIONS.map((edu) => (
                          <MenuItem key={edu} value={edu}>
                            {edu}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TranslatableTextField
                      label="கல்வி விவரங்கள்"
                      value={formData.EducationDetails}
                      onChange={(e) => handleInputChange('EducationDetails', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>தொழில்</InputLabel>
                      <Select
                        value={formData.Occupation}
                        onChange={(e) => handleInputChange('Occupation', e.target.value)}
                        label="தொழில்"
                      >
                        {OCCUPATION_OPTIONS.map((occ) => (
                          <MenuItem key={occ} value={occ}>
                            {occ}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TamilTextField
                      label="தொழில் விவரங்கள்"
                      value={formData.OccupationDetails}
                      onChange={(e) => handleInputChange('OccupationDetails', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="மாத சம்பளம்"
                      type="number"
                      value={formData.Salary}
                      onChange={(e) => handleInputChange('Salary', e.target.value)}
                      fullWidth
                      onFocus={(e) => disablePramukhIME(e.target)}
                      onBlur={() => { }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TamilTextField
                      label="முகவரி"
                      value={formData.Address}
                      onChange={(e) => handleInputChange('Address', e.target.value)}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Photos */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" className="tamil-text">
                  புகைப்படங்கள்
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ImageUpload
                  photos={formData.Photos}
                  onChange={(photos) => handleInputChange('Photos', photos)}
                  maxImages={3}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Horoscope */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" className="tamil-text">
                  ஜாதகம்
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showHoroscope}
                      onChange={(e) => setShowHoroscope(e.target.checked)}
                    />
                  }
                  label="ஜாதகத் தகவலை சேர்க்கவும்"
                  className="tamil-text"
                  sx={{ mb: 2 }}
                />
                {showHoroscope && (
                  <HoroscopeForm
                    horoscope={formData.Horoscope}
                    onChange={(horoscope) => handleInputChange('Horoscope', horoscope)}
                    dateOfBirth={formatDateForStorage(formData.DateOfBirth)}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => onNavigate('view', profile.ProfileID)}
                className="tamil-text"
              >
                ரத்துசெய்
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                className="tamil-text"
              >
                சேமி
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default EditProfile;



