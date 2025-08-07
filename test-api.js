#!/usr/bin/env node

/**
 * SoulSync API Test Script
 * Run this script to test your deployed API endpoints
 */

import fetch from 'node-fetch';

// Replace with your actual Vercel deployment URL
const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-app.vercel.app';

console.log('🧪 Testing SoulSync API Endpoints\n');
console.log(`Base URL: ${BASE_URL}\n`);

// Test functions
async function testHealthCheck() {
  console.log('1. Testing Health Check...');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'OK') {
      console.log('   ✅ Health check passed');
      console.log(`   📊 Environment: ${data.environment}`);
      console.log(`   🕒 Timestamp: ${data.timestamp}`);
    } else {
      console.log('   ❌ Health check failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Data:`, data);
    }
  } catch (error) {
    console.log('   ❌ Health check error:', error.message);
  }
  console.log('');
}

async function testRegistration() {
  console.log('2. Testing User Registration...');
  try {
    const testUser = {
      name: 'API Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123',
      age: 25,
      bio: 'This is a test user created via API',
      location: 'Test City',
      interests: ['Technology', 'Music', 'Travel'],
      photos: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'
      ]
    };

    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ Registration successful');
      console.log(`   👤 User ID: ${data.data.user.id}`);
      console.log(`   📧 Email: ${data.data.user.email}`);
      return data.data.tokens;
    } else {
      console.log('   ❌ Registration failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.message}`);
      if (data.errors) {
        data.errors.forEach(err => console.log(`   - ${err.field}: ${err.message}`));
      }
    }
  } catch (error) {
    console.log('   ❌ Registration error:', error.message);
  }
  console.log('');
  return null;
}

async function testLogin(email, password) {
  console.log('3. Testing User Login...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ Login successful');
      console.log(`   👤 User: ${data.data.user.name}`);
      console.log(`   📧 Email: ${data.data.user.email}`);
      return data.data.tokens;
    } else {
      console.log('   ❌ Login failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.message}`);
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
  }
  console.log('');
  return null;
}

async function testProtectedEndpoint(tokens) {
  if (!tokens?.accessToken) {
    console.log('4. Testing Protected Endpoint...');
    console.log('   ⚠️  Skipping - No access token available');
    console.log('');
    return;
  }

  console.log('4. Testing Protected Endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('   ✅ Protected endpoint accessible');
      console.log(`   👤 User: ${data.data.name}`);
      console.log(`   📧 Email: ${data.data.email}`);
    } else {
      console.log('   ❌ Protected endpoint failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.message}`);
    }
  } catch (error) {
    console.log('   ❌ Protected endpoint error:', error.message);
  }
  console.log('');
}

async function testFileUpload(tokens) {
  if (!tokens?.accessToken) {
    console.log('5. Testing File Upload...');
    console.log('   ⚠️  Skipping - No access token available');
    console.log('');
    return;
  }

  console.log('5. Testing File Upload...');
  console.log('   ⚠️  File upload test requires manual testing');
  console.log('   📝 Please test file upload through the web interface');
  console.log('');
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests...\n');

  // Test 1: Health check
  await testHealthCheck();

  // Test 2: Registration
  const registrationTokens = await testRegistration();

  // Test 3: Login (if registration worked)
  let loginTokens = null;
  if (registrationTokens) {
    loginTokens = await testLogin('test@example.com', 'TestPassword123');
  }

  // Test 4: Protected endpoint
  await testProtectedEndpoint(registrationTokens || loginTokens);

  // Test 5: File upload
  await testFileUpload(registrationTokens || loginTokens);

  console.log('🎯 API Testing Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Test the web interface manually');
  console.log('2. Verify file uploads work');
  console.log('3. Test error handling scenarios');
  console.log('4. Check mobile responsiveness');
  console.log('5. Monitor performance metrics');
}

// Run tests
runTests().catch(console.error);
