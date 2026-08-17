const axios = require('axios');

async function test() {
  const apiKey = 'AIzaSyD8vTz8vsJHatYxhofmfV6Odkr7Icc77FA';
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    console.log("Available models:");
    res.data.models.forEach(m => console.log(m.name));
  } catch (e) {
    console.error("Failed:", e.response?.data || e.message);
  }
}

test();
