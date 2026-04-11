import axios from 'axios';
async function test() {
   try {
      const loginRes = await axios.post('http://localhost:5050/api/auth/login', {email: "kanhaiya@gmail.com", password: "password"});
      console.log('Login:', loginRes.status);
      const token = loginRes.data.token;
      
      const bRes = await axios.get('http://localhost:5050/api/bookings', {headers: {Authorization: `Bearer ${token}`}});
      console.log('Bookings:', bRes.status);
   } catch (e) {
      console.log("Error:", e.response?.status, e.response?.data);
   }
}
test();
