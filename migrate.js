const db = require('./database/db');

async function migrate() {
    try {
        await db.query(`ALTER TABLE users 
            ADD COLUMN designation ENUM('student', 'teacher', 'staff') DEFAULT 'student',
            ADD COLUMN department VARCHAR(100),
            ADD COLUMN semester VARCHAR(20),
            ADD COLUMN room_no VARCHAR(100),
            ADD COLUMN phone VARCHAR(20),
            ADD COLUMN upi_id VARCHAR(100);`);
        console.log('Altered users table');
    } catch(e) { console.log('users table error', e.message); }
    
    try {
        await db.query(`ALTER TABLE orders ADD COLUMN delivery_instructions TEXT;`);
        console.log('Altered orders table');
    } catch(e) { console.log('orders table error', e.message); }
    process.exit(0);
}

migrate();
