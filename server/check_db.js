const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://resolveai:password@127.0.0.1:5432/resolveai_db?schema=public'
});

async function check() {
  try {
    await client.connect();
    const res = await client.query('SELECT COUNT(*) FROM "Incident"');
    console.log(`Incident count: ${res.rows[0].count}`);
    const rs2 = await client.query('SELECT COUNT(embedding) FROM "Incident" WHERE embedding IS NOT NULL');
    console.log(`Incident embedding count: ${rs2.rows[0].count}`);
  } catch (e) {
    console.error("DB error:", e.message);
  } finally {
    await client.end();
  }
}
check();
