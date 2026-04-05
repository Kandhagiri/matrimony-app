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

        const chunkArray = (array, size) => {
            const chunked = [];
            for (let i = 0; i < array.length; i += size) {
                chunked.push(array.slice(i, i + size));
            }
            return chunked;
        };

        const profileChunks = chunkArray(profiles, 18); // 6 rows * 3 cols = 18 items per page

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Address Print</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap');
            body {
              font-family: 'Noto Sans Tamil', sans-serif;
              padding: 0;
              margin: 0;
              background: #f5f5f5;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print {
              @page {
                size: A4;
                margin: 0 !important;
              }
              body {
                background: white;
                margin: 0;
                padding: 0;
              }
              .page-break {
                page-break-after: always;
              }
            }
            .page-container {
              width: 210mm;
              min-height: 296mm;
              padding: 0.5in;
              box-sizing: border-box;
              margin: 0 auto;
              background: white;
            }
            .grid-container {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              width: 100%;
              align-content: flex-start;
            }
            .address-card {
              border: 1px dashed #999;
              padding: 10px;
              font-size: 13px;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
              /* 3 cols. 2 gaps of 15px = 30px total */
              flex: 0 0 calc((100% - 30px) / 3);
              width: calc((100% - 30px) / 3);
              max-width: calc((100% - 30px) / 3);
              min-width: 0;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .father-name {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .address-text {
              white-space: pre-wrap;
              word-wrap: break-word;
              overflow-wrap: break-word;
              line-height: 1.3;
            }
          </style>
        </head>
        <body>
          ${profileChunks.map((chunk, index) => `
            <div class="page-container ${index < profileChunks.length - 1 ? 'page-break' : ''}">
              <div class="grid-container">
                ${chunk.map(p => `
                  <div class="address-card">
                    <div class="father-name">${p.FatherName || ''}      </div>
                    <div class="address-text">${(p.Address || '').replace(/,\s*/g, ', ')}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
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
