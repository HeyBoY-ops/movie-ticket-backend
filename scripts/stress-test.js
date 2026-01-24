// Run this with: node scripts/stress-test.js
const axios = require('axios'); // You might need to install axios temporarily: npm i axios

const API_URL = 'http://localhost:5050/api/bookings/hold'; // Adjust to your route
const USER_IDS = ['user_1', 'user_2', 'user_3', 'user_4', 'user_5']; // Mock different users
const SHOW_ID = 'show_123';
const SEAT_ID = 'A1';

async function attack() {
  console.log(`🚀 LAUNCHING ATTACK ON SEAT ${SEAT_ID}...`);

  // Create 20 simultaneous requests
  const requests = Array.from({ length: 20 }).map((_, index) => {
    return axios.post(API_URL, {
      userId: USER_IDS[index % USER_IDS.length], // Rotate users
      showId: SHOW_ID,
      seatNumbers: [SEAT_ID]
    }).then(res => ({
      status: res.status,
      data: res.data,
      who: `Request ${index + 1}`
    })).catch(err => ({
      status: err.response?.status || 500,
      data: err.response?.data,
      who: `Request ${index + 1}`
    }));
  });

  // Fire them all at once
  const results = await Promise.all(requests);

  // Analyze Results
  const successes = results.filter(r => r.status === 200 || r.status === 201);
  const conflicts = results.filter(r => r.status === 409);
  const errors = results.filter(r => r.status !== 200 && r.status !== 409 && r.status !== 201);

  console.log('--- REPORT ---');
  console.log(`✅ Successful Bookings: ${successes.length} (Should be EXACTLY 1)`);
  console.log(`🛡️ Blocked Conflicts:   ${conflicts.length}`);
  console.log(`❌ Other Errors:        ${errors.length}`);

  if (successes.length === 1) {
    console.log('🏆 SYSTEM SECURE: Concurrency handled perfectly.');
  } else if (successes.length > 1) {
    console.log('💀 CRITICAL FAILURE: Double booking occurred!');
  } else {
    console.log('⚠️ ISSUE: No bookings went through?');
  }
}

attack();