import { Container, Grid, Button, Typography, Box, Paper } from '@mui/material';
import { Add, Search, Assessment, Backup, Print } from '@mui/icons-material';

const MainMenu = ({ onNavigate }) => {
  const menuItems = [
    {
      id: 'new',
      label: 'புதிய பதிவு',
      icon: <Add fontSize="large" />,
      color: '#1976d2',
      onClick: () => onNavigate('new'),
    },
    {
      id: 'search',
      label: 'தேடல்',
      icon: <Search fontSize="large" />,
      color: '#2e7d32',
      onClick: () => onNavigate('search'),
    },
    {
      id: 'report',
      label: 'வருடாந்திர பட்டியல்',
      icon: <Assessment fontSize="large" />,
      color: '#ed6c02',
      onClick: () => onNavigate('report'),
    },
    {
      id: 'backup',
      label: 'காப்புப்பிரதி/மீட்டமை',
      icon: <Backup fontSize="large" />,
      color: '#9c27b0',
      onClick: () => onNavigate('backup'),
    },
    {
      id: 'address',
      label: 'முகவரி அச்சிடு',
      icon: <Print fontSize="large" />,
      color: '#d32f2f',
      onClick: () => onNavigate('address'),
    },
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h3" className="tamil-heading-title" gutterBottom>
          தமிழ்நாடு சைவ வேளாளர் சங்கம்
        </Typography>
        <Typography variant="h5" className="tamil-text" gutterBottom>
          திருமண மேலாண்மை மென்பொருள்
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} key={item.id}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
              onClick={item.onClick}
            >
              <Box sx={{ color: item.color, mb: 2 }}>
                {item.icon}
              </Box>
              <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  backgroundColor: item.color,
                  fontSize: '18px',
                  py: 2,
                  '&:hover': {
                    backgroundColor: item.color,
                    opacity: 0.9,
                  },
                }}
                className="tamil-text"
              >
                {item.label}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MainMenu;



