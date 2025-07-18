
const { Client } = require('pg');
require('dotenv').config();

async function testDatabase() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Database connected successfully');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query executed successfully:', result.rows[0]);
    
    // Test if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Tables in database:', tables.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

testDatabase();
