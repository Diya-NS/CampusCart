const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 4000,
    ssl: { rejectUnauthorized: true },
    multipleStatements: true // Allow executing multiple statements from the schema file
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL Server:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL Server.');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema script...');
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing schema:', err);
            process.exit(1);
        }
        console.log('Database and tables initialized successfully!');
        console.log('Sample colleges have been seated.');
        connection.end();
        process.exit(0);
    });
});
