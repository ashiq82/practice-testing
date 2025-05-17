import React, { useState, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Grid,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '',
    location: '',
  });

  // Bug 1: No validation for email format
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [field]: event.target.value,
    });
  };

  // Bug 2: No actual API call to save profile
  const handleSave = () => {
    // Simulate API call
    console.log('Saving profile:', profile);
    // Bug 3: No success/error feedback
  };

  // Bug 4: No image upload functionality
  const handleImageUpload = () => {
    console.log('Image upload not implemented');
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Bug: Break the screen when special characters are added
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) {
      // Intentionally cause a render error
      const invalidObject: any = undefined;
      invalidObject.nonExistentProperty.anotherProperty = value;
    }
    setProfile(prev => ({ ...prev, location: value }));
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  mb: 2,
                }}
              />
              <Button
                variant="outlined"
                onClick={handleImageUpload}
                // Bug 5: No loading state for image upload
              >
                Change Photo
              </Button>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Username"
                value={profile.username}
                onChange={handleChange('username')}
                margin="normal"
                // Bug 6: No username validation
              />
              <TextField
                fullWidth
                label="Email"
                value={profile.email}
                onChange={handleChange('email')}
                margin="normal"
                // Bug 7: No email validation
              />
              <TextField
                fullWidth
                label="Bio"
                value={profile.bio}
                onChange={handleChange('bio')}
                margin="normal"
                multiline
                rows={4}
                // Bug 8: No character limit
              />
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={profile.location}
                  onChange={handleLocationChange}
                  // Bug: No warning about special characters
                  helperText="Enter your location"
                  // Bug: No input validation
                  // Bug: No error handling
                />
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  // Bug 9: No loading state for save
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserProfile; 