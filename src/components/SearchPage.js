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
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActions,
} from '@mui/material';
import { Search, ArrowBack, Male, Female } from '@mui/icons-material';
import { formatDateForDisplay, calculateAge } from '../utils/dateUtils';
import { disablePramukhIME } from '../utils/tamilTransliteration';

const GENDERS = ['ஆண்', 'பெண்', 'மற்றவை'];
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

const SearchPage = ({ onNavigate }) => {
  const [criteria, setCriteria] = useState({
    profileId: '',
    name: '',
    gender: '',
    minAge: '',
    maxAge: '',
    minSalary: '',
    maxSalary: '',
    isActive: undefined,
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    performSearch();
  }, [criteria]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchCriteria = {
        ...criteria,
        minAge: criteria.minAge ? parseInt(criteria.minAge) : undefined,
        maxAge: criteria.maxAge ? parseInt(criteria.maxAge) : undefined,
        minSalary: criteria.minSalary ? parseFloat(criteria.minSalary) : undefined,
        maxSalary: criteria.maxSalary ? parseFloat(criteria.maxSalary) : undefined,
      };

      const result = await window.electronAPI.searchProfiles(searchCriteria);
      if (result.success) {
        setResults(result.profiles || result.data || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCriteria({ ...criteria, [field]: value });
  };

  const handleClear = () => {
    setCriteria({
      profileId: '',
      name: '',
      gender: '',
      minAge: '',
      maxAge: '',
      minSalary: '',
      maxSalary: '',
      isActive: undefined,
    });
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" className="tamil-heading">
            தேடல்
          </Typography>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => onNavigate('main')}
            className="tamil-text"
          >
            முதன்மை பட்டி
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="சுயவிவர ID"
              value={criteria.profileId}
              onChange={(e) => handleInputChange('profileId', e.target.value)}
              fullWidth
              onFocus={(e) => disablePramukhIME(e.target)}
              onBlur={() => {}}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="பெயர்"
              value={criteria.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>பாலினம்</InputLabel>
              <Select
                value={criteria.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                label="பாலினம்"
              >
                <MenuItem value="">அனைத்தும்</MenuItem>
                {GENDERS.map((gender) => (
                  <MenuItem key={gender} value={gender}>
                    {gender}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="குறைந்தபட்ச வயது"
              type="number"
              value={criteria.minAge}
              onChange={(e) => handleInputChange('minAge', e.target.value)}
              fullWidth
              onFocus={(e) => disablePramukhIME(e.target)}
              onBlur={() => {}}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="அதிகபட்ச வயது"
              type="number"
              value={criteria.maxAge}
              onChange={(e) => handleInputChange('maxAge', e.target.value)}
              fullWidth
              onFocus={(e) => disablePramukhIME(e.target)}
              onBlur={() => {}}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="குறைந்தபட்ச சம்பளம்"
              type="number"
              value={criteria.minSalary}
              onChange={(e) => handleInputChange('minSalary', e.target.value)}
              fullWidth
              onFocus={(e) => disablePramukhIME(e.target)}
              onBlur={() => {}}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="அதிகபட்ச சம்பளம்"
              type="number"
              value={criteria.maxSalary}
              onChange={(e) => handleInputChange('maxSalary', e.target.value)}
              fullWidth
              onFocus={(e) => disablePramukhIME(e.target)}
              onBlur={() => {}}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>நிலை</InputLabel>
              <Select
                value={criteria.isActive === undefined ? '' : criteria.isActive ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('isActive', value === '' ? undefined : value === 'active');
                }}
                label="நிலை"
              >
                <MenuItem value="">அனைத்தும்</MenuItem>
                <MenuItem value="active">செயலில்</MenuItem>
                <MenuItem value="inactive">செயல்நீக்கம்</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleClear}
                className="tamil-text"
              >
                அழி
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="h6" className="tamil-text" gutterBottom>
          முடிவுகள்: {(results || []).length}
        </Typography>

        {loading ? (
          <Typography>தேடுகிறது...</Typography>
        ) : (
          <Grid container spacing={2}>
            {(results || []).map((profile) => {
              const age = calculateAge(profile.DateOfBirth);
              
              // Parse photos safely
              let photos = [];
              if (profile.Photos) {
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
              
              // Determine if male or female for icon
              const isMale = profile.Gender === 'ஆண்' || profile.Gender === 'Male' || profile.Gender === 'male';
              
              return (
                <Grid item xs={12} sm={6} md={4} key={profile.ProfileID}>
                  <Card>
                    {photos.length > 0 ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={photos[0].data}
                        alt={profile.Name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'grey.100',
                        }}
                      >
                        {isMale ? (
                          <Male sx={{ fontSize: 80, color: 'primary.main' }} />
                        ) : (
                          <Female sx={{ fontSize: 80, color: 'secondary.main' }} />
                        )}
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="h6" className="tamil-text">
                        {profile.Name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        ID: {profile.ProfileID}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        வயது: {age} ஆண்டுகள்
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        பாலினம்: {profile.Gender}
                      </Typography>
                      {profile.Education && (
                        <Typography variant="body2" color="textSecondary">
                          கல்வி: {profile.Education}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => onNavigate('view', profile.ProfileID)}
                        className="tamil-text"
                      >
                        பார்க்க
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default SearchPage;



