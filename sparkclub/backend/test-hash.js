const bcrypt = require('bcryptjs');
const hash = '$2b$10$jL2v1sH7aUsNZFQontKPROroogToiAcEkeqiO8aGvI5tEUW.yMBI.';
bcrypt.compare('password123', hash).then(r => console.log('verify:', r));