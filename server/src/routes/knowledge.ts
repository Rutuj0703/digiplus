import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const articles = (await pool.query('SELECT "id", "title", "content", "category", "createdAt" FROM "KnowledgeArticle" ORDER BY "createdAt" DESC LIMIT 50')).rows;
        res.json(articles);
    } catch (e) {
        res.status(500).json({ error: 'Failed to retrieve knowledge articles' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const article = (await pool.query('SELECT * FROM "KnowledgeArticle" WHERE id = $1', [req.params.id])).rows;
        if (article.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(article[0]);
    } catch (e) {
        res.status(500).json({ error: 'Failed to retrieve knowledge article' });
    }
});

export default router;
