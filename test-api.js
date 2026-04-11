import prisma from './src/config/db.js';
import { generateToken } from './src/utils/generateToken.js';
import axios from 'axios';

async function run() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (!admin) {
      console.log("No super admin found");
      process.exit(1);
    }
    const token = generateToken(admin);
    console.log("Token:", token.substring(0, 10));
    
    try {
      const res = await axios.get('http://localhost:5050/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Me status:', res.status);
    } catch(e) {
      console.log('Me failed:', e.response?.data);
    }

    try {
      const bRes = await axios.get('http://localhost:5050/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Bookings status:', bRes.status);
    } catch(e) {
      console.log('Bookings failed:', e.response?.data);
    }
  } catch(e) {
    console.error(e);
  }
}
run();
