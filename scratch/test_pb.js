const PocketBase = require('pocketbase/cjs');

async function test() {
  const pb = new PocketBase('http://127.0.0.1:8090/');
  
  try {
    const res = await pb.collection('bookings').getList(1, 50, { sort: '-created' });
    console.log("Total items:", res.totalItems);
    res.items.forEach(item => {
      console.log(`ID: ${item.id}, Created: "${item.created}"`);
    });
  } catch(e) { console.log("Fail:", e.message); }
}

test();
