const fs = require('fs');

async function check() {
  try {
    const fetch = require('node-fetch');
  } catch (e) {
    // If we can't use node-fetch, we can just fetch via native if node 18+
  }
  
  try {
    const res = await fetch('http://127.0.0.1:8090/api/collections/users/records?perPage=1', {
       headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    console.log("Users:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error("Fetch error:", e.message);
  }
}
check();
