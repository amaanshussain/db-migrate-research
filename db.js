const mysql = require('mysql2/promise');

async function createConnection() {
    return await mysql.createConnection({
        user: process.env.DBUSER,
        password: process.env.DBPASSWORD,
        database: process.env.DBDATABASE
    });
}

async function executeQuery(sql, values) {
    const connection = await createConnection();
    const data = await connection.query(sql, values).then(data => data[0]);
    return data;
}

module.exports = { executeQuery }