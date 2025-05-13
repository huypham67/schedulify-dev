const crypto = require('crypto');
const env = require('../config/environment');

// Encryption key and algorithm
const ENCRYPTION_KEY = env.ENCRYPTION_KEY || 'your-256-bit-key'; // Must be 256 bits (32 bytes)
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const ALGORITHM = 'aes-256-cbc';

// Encrypt data
exports.encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt data
exports.decrypt = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Hash data (one-way)
exports.hash = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

// Generate a random string/token
exports.generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};
