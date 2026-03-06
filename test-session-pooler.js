const { Client } = require('pg');

async function testConnection() {
  console.log('Testing Session Pooler (Port 5432 on pooler host)...');
  const client = new Client({
    host: 'aws-1-ap-northeast-2.pooler.supabase.com',
    port: 5432,
    user: 'postgres.vrmwiazchcytylucnruz',
    password: 'Ashish@127376',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Session Pooler SUCCESS!');
    
    // Quick test query
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);

    await client.end();
  } catch (err) {
    console.error('❌ Session Pooler FAILED:', err.message);
  }
}

testConnection();
