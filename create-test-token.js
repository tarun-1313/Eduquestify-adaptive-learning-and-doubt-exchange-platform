import jwt from 'jsonwebtoken';

// Create a test token for user ID 1
const payload = {
  userId: 1,
  username: 'testuser',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
};

const secret = 'e458c22f2066d31e354d038af3841922ce05dfe71c52be92412b7196dfa9d22a';

const token = jwt.sign(payload, secret);
console.log('Test Token:', token);

// Verify the token
const decoded = jwt.verify(token, secret);
console.log('Decoded:', decoded);