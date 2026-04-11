import axios from 'axios';
async function test() {
  try {
    const res = await axios.post('http://localhost:5050/api/auth/login', { email: 'a@gmail.com', password: 'password' }); // assuming password is password or 123456
    console.log("Login Res:", res.status);
  } catch (e) {
    if (e.response && e.response.status === 401) {
       console.log("Try another password...");
    }
  }
}
test();
