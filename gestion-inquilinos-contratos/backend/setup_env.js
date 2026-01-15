const fs = require('fs');
const content = 'DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"\nPORT=3000\n';
fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env created successfully');
