// test-deployment.js - Test deployment endpoints
import fetch from 'node-fetch';

const BASE_URL = process.env.DEPLOYMENT_URL || 'https://soulsync.solutions';

const testEndpoints = [
  '/',
  '/api',
  '/api/health',
  '/api/test'
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🔍 Testing: ${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log(`✅ Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
    } else {
      console.log(`❌ Error: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting deployment tests...');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n🎯 Test Summary:');
  console.log('- If you see 200 responses, your deployment is working!');
  console.log('- If you see 404 errors, check your Vercel dashboard for the correct URL');
  console.log('- If you see network errors, the deployment might not be live yet');
}

runTests().catch(console.error);
