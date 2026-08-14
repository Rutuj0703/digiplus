import { PrismaClient } from './generated/prisma';
import { generateEmbedding } from './services/ai.service';
import { pool } from './db';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log("Generating embeddings for a sample of data...");
    
    // Compute searchVector for all incidents and articles
    await pool.query(`UPDATE "Incident" SET "searchVector" = to_tsvector('english', title || ' ' || coalesce(description, ''))`);
    await pool.query(`UPDATE "KnowledgeArticle" SET "searchVector" = to_tsvector('english', title || ' ' || coalesce(content, ''))`);
    console.log("Updated tsvector search columns.");

    // Test Gemini generation embedding
    try {
        const dummy = await generateEmbedding("test");
        if (dummy.length !== 768) throw new Error("Invalid dummy length");
    } catch(e) {
        console.error("Gemini failed:", e);
        return;
    }

    const { rows: incidents } = await pool.query('SELECT * FROM "Incident" WHERE embedding IS NULL LIMIT 20');
    if (incidents.length === 0) console.log("No new incidents need embeddings.");
    let count = 0;
    for (const inc of incidents) {
        const text = `${inc.title}\n${inc.description}`;
        try {
            const vec = await generateEmbedding(text);
            await pool.query('UPDATE "Incident" SET embedding = $1 WHERE id = $2', [JSON.stringify(vec), inc.id]);
            count++;
        } catch (e: any) {
             console.log("Error generating embedding:", e.message);
        }
    }
    console.log(`Generated embeddings for ${count} incidents.`);

    const { rows: articles } = await pool.query('SELECT * FROM "KnowledgeArticle" WHERE embedding IS NULL');
    let aCount = 0;
    for (const art of articles) {
        const text = `${art.title}\n${art.content}`;
        try {
            const vec = await generateEmbedding(text);
            await pool.query('UPDATE "KnowledgeArticle" SET embedding = $1 WHERE id = $2', [JSON.stringify(vec), art.id]);
            aCount++;
        } catch(e: any) {
             console.log("Error generating embedding:", e.message);
        }
    }
    console.log(`Generated embeddings for ${aCount} articles.`);
}

main().catch(console.error).finally(async () => { await prisma.$disconnect(); await pool.end(); });
