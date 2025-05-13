const axios = require('axios');

// API base URL
const API_URL = 'http://localhost:5000/api';

// Register user function
async function registerUser() {
  try {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    console.log('Registering new user...');
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    console.log('Registration response:', response.data);
    
    if (response.data.success) {
      console.log('\nUser registration successful!');
      console.log('Check your email for verification link or use the script create-test-user.js to make the user verified.');
    } else {
      console.log('\nRegistration failed:', response.data.message);
    }
  } catch (error) {
    console.error('\nError during registration:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Is the server running?');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
  }
}

registerUser(); 