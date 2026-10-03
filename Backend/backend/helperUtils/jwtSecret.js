const crypto = require('crypto');

function generateJWTSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

const jwtSecret = generateJWTSecret(64);
console.log('Your JWT_SECRET:', jwtSecret);

const jwt = require('jsonwebtoken');

const secretKey = jwtSecret
const payload = {
  role: 'admin-creation',
};

const options = {
  expiresIn: '1h',
};

const adminCreationToken = jwt.sign(payload, secretKey, options);

console.log('Generated Token:', adminCreationToken);
