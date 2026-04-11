import axios from 'axios';
import prisma from './src/config/db.js';

async function test() {
  try {
    const pwd = await import('bcryptjs').then(m => m.hash('testpass', 10));
    await prisma.user.upsert({
      where: { email: 'admin_test@gmail.com' },
      update: { password: pwd, role: 'ADMIN' },
      create: { name: 'Admin Test', email: 'admin_test@gmail.com', password: pwd, role: 'ADMIN' }
    });

    const loginRes = await axios.post('http://localhost:5050/api/auth/login', {
      email: 'admin_test@gmail.com',
      password: 'testpass'
    });
    const token = loginRes.data.token;
    console.log("Logged in:", token.substring(0, 5));

    try {
      const meRes = await axios.get('http://localhost:5050/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("ME:", meRes.status);
    } catch(e) {
      console.error("ME failed:", e.response?.status, e.response?.data);
    }

    try {
      const bRes = await axios.get('http://localhost:5050/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Bookings:", bRes.status);
    } catch(e) {
      console.error("Bookings failed:", e.response?.status, e.response?.data);
    }
    
    process.exit(0);

  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
