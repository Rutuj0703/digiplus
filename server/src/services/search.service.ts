import { pool } from '../db';
import { generateEmbedding } from './ai.service';

const RRF_K = 60;

function computeRRF(vectorResults: any[], keywordResults: any[]) {
    const scores = new Map<string, any>();

    vectorResults.forEach((v, index) => {
        const rrfScore = 1 / (RRF_K + (index + 1));
        scores.set(v.id, { ...v, _score: rrfScore, source: 'vector' });
    });

    keywordResults.forEach((k, index) => {
        const id = k.id;
        const rrfScore = 1 / (RRF_K + (index + 1));
        if (scores.has(id)) {
            const existing = scores.get(id);
            existing._score += rrfScore;
            existing.source = 'hybrid';
        } else {
            scores.set(id, { ...k, _score: rrfScore, source: 'keyword' });
        }
    });

    return Array.from(scores.values()).sort((a, b: any) => b._score - a._score);
}

export const hybridSearch = async (query: string, categoryFilter?: string) => {
    const queryEmbedding = await generateEmbedding(query);
    const embeddingFormat = `[${queryEmbedding.join(',')}]`;

    let vIncQuery = `SELECT "id", "ticketNumber", "title", "description", "status", 'incident' as type FROM "Incident" `;
    if (categoryFilter) vIncQuery += `WHERE "categoryId" = $1 `;
    vIncQuery += `ORDER BY "embedding" <=> $${categoryFilter ? 2 : 1}::vector LIMIT 10`;

    const vIncParams = categoryFilter ? [categoryFilter, embeddingFormat] : [embeddingFormat];
    const vectorIncidents = (await pool.query(vIncQuery, vIncParams)).rows;

    let kIncQuery = `SELECT "id", "ticketNumber", "title", "description", "status", 'incident' as type FROM "Incident" WHERE "searchVector" @@ websearch_to_tsquery('english', $1) `;
    if (categoryFilter) kIncQuery += `AND "categoryId" = $2 `;
    kIncQuery += `ORDER BY ts_rank("searchVector", websearch_to_tsquery('english', $1)) DESC LIMIT 10`;

    const kIncParams = categoryFilter ? [query, categoryFilter] : [query];
    const keywordIncidents = (await pool.query(kIncQuery, kIncParams)).rows;

    const rrfIncidents = computeRRF(vectorIncidents, keywordIncidents);

    const vectorKB = (await pool.query(`SELECT "id", "title", "content", "category", 'knowledge' as type FROM "KnowledgeArticle" ORDER BY "embedding" <=> $1::vector LIMIT 5`, [embeddingFormat])).rows;

    const keywordKB = (await pool.query(`SELECT "id", "title", "content", "category", 'knowledge' as type FROM "KnowledgeArticle" WHERE "searchVector" @@ websearch_to_tsquery('english', $1) ORDER BY ts_rank("searchVector", websearch_to_tsquery('english', $1)) DESC LIMIT 5`, [query])).rows;

    const rrfKB = computeRRF(vectorKB, keywordKB);

    return { incidents: rrfIncidents, articles: rrfKB };
};
