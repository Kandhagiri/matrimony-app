import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Grid,
    Checkbox,
    FormControlLabel,
    Alert,
} from '@mui/material';
import { ArrowBack, Print } from '@mui/icons-material';

const AddressPrint = ({ onNavigate }) => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [onlyActive, setOnlyActive] = useState(true);

    useEffect(() => {
        loadProfiles();
    }, [onlyActive]);

    const loadProfiles = async () => {
        setLoading(true);
        setError('');
        try {
            // Use searchProfiles to get all profiles, optionally filtering by active status
            const criteria = onlyActive ? { isActive: true } : {};
            console.log('Fetching profiles with criteria:', criteria);

            const result = await window.electronAPI.searchProfiles(criteria);
            console.log('Search result:', result);

            if (result.success) {
                // Filter profiles that have at least a name and address
                const rawProfiles = result.profiles || result.data || [];
                console.log('Raw profiles count:', rawProfiles.length);

                const validProfiles = rawProfiles.filter(p => {
                    const hasFatherName = p.FatherName && p.FatherName.trim() !== '';
                    const hasAddress = p.Address && p.Address.trim() !== '';
                    // Log dropped profiles for debugging
                    if (!hasFatherName || !hasAddress) {
                        // console.log(`Dropping profile ${p.ProfileID}: Name=${p.Name}, Father=${p.FatherName}, Address=${p.Address}`);
                    }
                    return hasFatherName && hasAddress;
                });

                console.log('Valid profiles count:', validProfiles.length);
                setProfiles(validProfiles);
            } else {
                console.error('Search failed:', result.error);
                setError('சுயவிவரங்களை ஏற்ற முடியவில்லை: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error loading profiles:', err);
            setError('பிழை: details loading failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Address Print</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap');
            body {
              font-family: 'Noto Sans Tamil', sans-serif;
              padding: 20px;
              margin: 0;
            }
            .grid-container {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .address-card {
              border: 1px dashed #999;
              padding: 15px;
              font-size: 14px;
              break-inside: avoid;
            }
            .father-name {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 8px;
            }
            .address-text {
              white-space: pre-wrap;
              line-height: 1.4;
            }
            @media print {
              @page { margin: 0.5cm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="grid-container">
            ${profiles.map(p => `
              <div class="address-card">
                <div class="father-name">${p.FatherName || ''} (த/பெ)</div>
                <div class="address-text">${p.Address || ''}</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);

        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 3, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" className="tamil-heading">
                        முகவரி அச்சிடுதல்
                    </Typography>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => onNavigate('main')}
                        className="tamil-text"
                    >
                        முதன்மை பட்டி
                    </Button>
                </Box>

                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={onlyActive}
                                onChange={(e) => setOnlyActive(e.target.checked)}
                            />
                        }
                        label="செயலில் உள்ளவை மட்டும் (Active Only)"
                        className="tamil-text"
                    />

                    <Button
                        variant="contained"
                        startIcon={<Print />}
                        onClick={handlePrint}
                        disabled={loading || profiles.length === 0}
                        className="tamil-text"
                    >
                        அச்சிடு ({profiles.length})
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary' }}>
                    முன்னோட்டம் (முதல் 6 பதிவுகள்):
                </Typography>

                <Grid container spacing={2}>
                    {profiles.slice(0, 6).map((profile) => (
                        <Grid item xs={12} sm={6} md={4} key={profile.ProfileID}>
                            <Paper variant="outlined" sx={{ p: 2, borderStyle: 'dashed' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {profile.FatherName} (த/பெ)
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {profile.Address}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {profiles.length > 6 && (
                    <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                        ... மற்றும் {profiles.length - 6} முகவரிகள்
                    </Typography>
                )}
            </Paper>
        </Container>
    );
};

export default AddressPrint;
