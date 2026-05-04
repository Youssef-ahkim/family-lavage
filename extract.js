const fs = require('fs');
const data = fs.readFileSync('pb_data/data.db', 'utf8');

// Find all schema definitions containing "name":"some_field"
const matches = [...data.matchAll(/"name":"([^"]+)"/g)].map(m => m[1]);
console.log("Found fields:", [...new Set(matches)]);
