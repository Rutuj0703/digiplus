const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://resolveai:password@127.0.0.1:5432/resolveai_db?schema=public'
});

async function alter() {
  try {
    await client.connect();
    await client.query('ALTER TABLE "Incident" DROP COLUMN embedding;');
    await client.query('ALTER TABLE "Incident" ADD COLUMN embedding vector(768);');
    await client.query('ALTER TABLE "KnowledgeArticle" DROP COLUMN embedding;');
    await client.query('ALTER TABLE "KnowledgeArticle" ADD COLUMN embedding vector(768);');
    console.log("Vector columns altered to 768");
  } catch (e) {
    console.error("DB error:", e.message);
  } finally {
    await client.end();
  }
}
alter();
