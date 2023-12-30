const { createHmac } = require('crypto');
const uuid = require('uuid');

function getHash(input) {
    const hash = createHmac('sha256', process.env.SECRETKEY);
    hash.update(process.env.HASHPEPPER)
    hash.update(input);
    return hash.digest('hex');
}

function generateToken(uid) {
    const token = uuid.v4();
    const hash = createHmac('sha256', uid);
    hash.update(token);
    return hash.digest('hex');
}

module.exports = { getHash, generateToken }