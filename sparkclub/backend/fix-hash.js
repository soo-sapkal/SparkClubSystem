const bcrypt = require('bcryptjs');
const fs = require('fs');

async function main() {
  const h = await bcrypt.hash('password123', 10);
  console.log('Generated hash:', h);

  const verify = await bcrypt.compare('password123', h);
  console.log('Same-session verify:', verify);

  let schema = fs.readFileSync('db/schema.sql', 'utf8');
  const oldLine = /(\(11, NULL, 'Super Admin', 'admin@sparkclub\.edu',\s*)'[^']+'(, 'super_admin')/;
  schema = schema.replace(oldLine, `$1'${h}'$2`);
  fs.writeFileSync('db/schema.sql', schema);

  const newSchema = fs.readFileSync('db/schema.sql', 'utf8');
  const match = newSchema.match(/admin@sparkclub\.edu',\s*'([^']+)'/);
  console.log('Hash in schema:', match ? match[1] : 'NOT FOUND');

  const verifyFromFile = await bcrypt.compare('password123', match[1]);
  console.log('From-file verify:', verifyFromFile);
}

main();