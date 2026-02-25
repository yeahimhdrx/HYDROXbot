require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Testing PostgreSQL connection...\n');

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file!');
    process.exit(1);
}

// Hide password in output
const urlParts = process.env.DATABASE_URL.split('@');
const maskedUrl = urlParts[0].replace(/:[^:]*@/, ':****@') + '@' + urlParts[1];
console.log('📡 Connecting to:', maskedUrl);
console.log('');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
    try {
        console.log('⏳ Attempting connection...');
        const client = await pool.connect();
        
        console.log('✅ Connection successful!\n');
        
        // Test query
        const result = await client.query('SELECT version()');
        console.log('📊 PostgreSQL version:');
        console.log(result.rows[0].version);
        console.log('');
        
        // Check if tables exist
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        if (tables.rows.length > 0) {
            console.log('📋 Existing tables:');
            tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
        } else {
            console.log('📋 No tables found (this is normal for a new database)');
        }
        
        client.release();
        await pool.end();
        
        console.log('\n🎉 Connection test passed! You can now run migration.');
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error.message);
        console.error('');
        
        if (error.code === 'ENOTFOUND') {
            console.error('💡 Possible solutions:');
            console.error('   1. Check if your Supabase project is active (not paused)');
            console.error('   2. Get a fresh connection string from Supabase dashboard');
            console.error('   3. Verify the hostname in your DATABASE_URL is correct');
            console.error('   4. Check your internet connection');
        } else if (error.message.includes('password')) {
            console.error('💡 Possible solutions:');
            console.error('   1. Check if you replaced [YOUR-PASSWORD] with actual password');
            console.error('   2. Verify the password is correct');
            console.error('   3. Try resetting your database password in Supabase');
        } else {
            console.error('💡 Check your DATABASE_URL format in .env file');
        }
        
        await pool.end();
        process.exit(1);
    }
}

testConnection();
