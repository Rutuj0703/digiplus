const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://resolveai:password@127.0.0.1:5432/resolveai_db?schema=public'
});

async function main() {
  await client.connect();
  console.log('Connected to DB');

  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log('Extension vector enabled');

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Agent" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "team" TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "Category" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "description" TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "Incident" (
          "id" TEXT PRIMARY KEY,
          "ticketNumber" TEXT UNIQUE NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "status" TEXT NOT NULL,
          "priority" TEXT,
          "categoryId" TEXT,
          "assignedAgentId" TEXT,
          "reporter" TEXT NOT NULL,
          "searchVector" tsvector,
          "embedding" vector(768),
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "resolvedAt" TIMESTAMP,
          "resolution" TEXT,
          FOREIGN KEY ("assignedAgentId") REFERENCES "Agent"("id") ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS "Comment" (
          "id" TEXT PRIMARY KEY,
          "incidentId" TEXT NOT NULL,
          "author" TEXT NOT NULL,
          "body" TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "KnowledgeArticle" (
          "id" TEXT PRIMARY KEY,
          "title" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "tags" TEXT[],
          "searchVector" tsvector,
          "embedding" vector(768),
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "AIAnalysis" (
          "id" TEXT PRIMARY KEY,
          "incidentId" TEXT UNIQUE NOT NULL,
          "summary" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "priority" TEXT NOT NULL,
          "probableCause" TEXT NOT NULL,
          "troubleshootingSteps" TEXT[],
          "recommendedResolution" TEXT NOT NULL,
          "confidence" DOUBLE PRECISION NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "JiraIssue" (
          "id" TEXT PRIMARY KEY,
          "incidentId" TEXT UNIQUE NOT NULL,
          "issueKey" TEXT NOT NULL,
          "issueUrl" TEXT NOT NULL,
          "summary" TEXT NOT NULL,
          "status" TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "GitHubLink" (
          "id" TEXT PRIMARY KEY,
          "incidentId" TEXT NOT NULL,
          "owner" TEXT NOT NULL,
          "repository" TEXT NOT NULL,
          "issueNumber" INTEGER,
          "pullRequestNumber" INTEGER,
          "pullRequestUrl" TEXT,
          "status" TEXT NOT NULL,
          "latestCommitSha" TEXT,
          "ciStatus" TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "CategoryPrediction" (
          "id" TEXT PRIMARY KEY,
          "incidentId" TEXT NOT NULL,
          "predictedCategory" TEXT NOT NULL,
          "confidence" DOUBLE PRECISION NOT NULL,
          "model" TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS "idx_incident_status" ON "Incident"("status");
      CREATE INDEX IF NOT EXISTS "idx_incident_priority" ON "Incident"("priority");
      CREATE INDEX IF NOT EXISTS "idx_incident_category" ON "Incident"("categoryId");
      CREATE INDEX IF NOT EXISTS "idx_incident_created" ON "Incident"("createdAt");
    `);

    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error executing query', err);
  } finally {
    await client.end();
  }
}

main();
