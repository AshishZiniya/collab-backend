const { Client } = require('pg');

async function testConnection() {
  const connectionString = 'postgresql://postgres.vrmwiazchcytylucnruz:Ashish%40127376@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require';
  
  console.log('Connecting to Transaction Pooler URL...');
  const client1 = new Client({ connectionString });
  
  try {
    await client1.connect();
    console.log('✅ URL Connection SUCCESS!');
    await client1.end();
  } catch (err) {
    console.error('❌ URL Connection FAILED:', err.message);
  }

  console.log('\nConnecting with Explicit Config parameters (Transaction Pooler)...');
  const client2 = new Client({
    host: 'aws-1-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.vrmwiazchcytylucnruz',
    password: 'Ashish@127376',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client2.connect();
    console.log('✅ Explicit Config SUCCESS!');
    await client2.end();
  } catch (err) {
    console.error('❌ Explicit Config FAILED:', err.message);
  }
}

testConnection();
