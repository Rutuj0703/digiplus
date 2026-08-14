import { Router } from 'express';
import { pool } from '../db';
import { categorizeTicket, analyzeTicket } from '../services/ai.service';
import { createJiraIssue } from '../services/jira.service';
import { getGitHubActionsStatus, getGitHubPullRequest } from '../services/github.service';
import { hybridSearch } from '../services/search.service';

const router = Router();

// List incidents
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;
        const incidents = (await pool.query('SELECT * FROM "Incident" ORDER BY "createdAt" DESC OFFSET $1 LIMIT $2', [offset, limit])).rows;
        res.json(incidents);
    } catch (e) {
        res.status(500).json({ error: 'Failed to retrieve incidents' });
    }
});

// Single incident
router.get('/:id', async (req, res) => {
    try {
        const incidentRes = await pool.query('SELECT * FROM "Incident" WHERE id = $1', [req.params.id]);
        if (incidentRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        const incident = incidentRes.rows[0];
        const ai = await pool.query('SELECT * FROM "AIAnalysis" WHERE "incidentId" = $1', [incident.id]);
        const jira = await pool.query('SELECT * FROM "JiraIssue" WHERE "incidentId" = $1', [incident.id]);
        const gh = await pool.query('SELECT * FROM "GitHubLink" WHERE "incidentId" = $1', [incident.id]);
        const pred = await pool.query('SELECT * FROM "CategoryPrediction" WHERE "incidentId" = $1', [incident.id]);

        res.json({
            ...incident,
            AIAnalysis: ai.rows[0] || null,
            JiraIssue: jira.rows[0] || null,
            GitHubLink: gh.rows || [],
            CategoryPrediction: pred.rows || []
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to retrieve incident' });
    }
});

// Create incident + Auto categorization
router.post('/', async (req, res) => {
    try {
        const { title, description, reporter } = req.body;
        const ticketNumber = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
        
        let predictedPriority = 'MEDIUM';
        let predictedCategory = 'Unknown';
        let predictionConfidence = 0.0;
        
        try {
            const aiCat = await categorizeTicket(title, description);
            predictedPriority = aiCat.priority;
            predictedCategory = aiCat.category;
            predictionConfidence = aiCat.confidence;
        } catch (catError) {
            console.error('Categorization failed but proceeding:', catError);
        }

        const incidentData = (await pool.query(
            `INSERT INTO "Incident" (id, "ticketNumber", title, description, status, priority, "categoryId", reporter) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [ticketNumber, ticketNumber, title, description, 'OPEN', predictedPriority, predictedCategory, reporter || 'Self Service']
        )).rows[0];

        if (predictedCategory !== 'Unknown') {
            await pool.query(
                `INSERT INTO "CategoryPrediction" (id, "incidentId", "predictedCategory", confidence, model) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [Math.random().toString(), incidentData.id, predictedCategory, predictionConfidence, 'gpt-4o-mini']
            );
        }

        res.status(201).json(incidentData);
    } catch (e) {
        res.status(500).json({ error: 'Failed to create incident' });
    }
});

// Trigger Analysis (RAG)
router.post('/:id/analyze', async (req, res) => {
    try {
        const incidentRes = await pool.query('SELECT * FROM "Incident" WHERE id = $1', [req.params.id]);
        if (incidentRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const incident = incidentRes.rows[0];

        const searchResults = await hybridSearch(`${incident.title} ${incident.description}`, incident.categoryId || undefined);

        const analysis = await analyzeTicket(incident, searchResults.articles, searchResults.incidents);

        const existingAi = await pool.query('SELECT * FROM "AIAnalysis" WHERE "incidentId" = $1', [incident.id]);
        let savedAnalysis;
        if (existingAi.rows.length > 0) {
            savedAnalysis = (await pool.query(`
                UPDATE "AIAnalysis" SET summary=$1, category=$2, priority=$3, "probableCause"=$4, "troubleshootingSteps"=$5, "recommendedResolution"=$6, confidence=$7
                WHERE "incidentId"=$8 RETURNING *
            `, [analysis.summary, analysis.category, analysis.priority, analysis.probableCause, analysis.troubleshootingSteps, analysis.recommendedResolution, analysis.confidence, incident.id])).rows[0];
        } else {
            savedAnalysis = (await pool.query(`
                INSERT INTO "AIAnalysis" (id, "incidentId", summary, category, priority, "probableCause", "troubleshootingSteps", "recommendedResolution", confidence)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
            `, [Math.random().toString(), incident.id, analysis.summary, analysis.category, analysis.priority, analysis.probableCause, analysis.troubleshootingSteps, analysis.recommendedResolution, analysis.confidence])).rows[0];
        }

        res.json({ analysis: savedAnalysis, sources: searchResults });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ success: false, message: "AI analysis could not be completed. The incident has been saved." });
    }
});

// Trigger Jira Issue
router.post('/:id/jira', async (req, res) => {
    try {
        const incidentRes = await pool.query('SELECT * FROM "Incident" WHERE id = $1', [req.params.id]);
        if (incidentRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const incident = incidentRes.rows[0];

        const existing = await pool.query('SELECT * FROM "JiraIssue" WHERE "incidentId" = $1', [incident.id]);
        if (existing.rows.length > 0) return res.json(existing.rows[0]);

        const jiraRes = await createJiraIssue(incident);

        const savedJira = (await pool.query(`
            INSERT INTO "JiraIssue" (id, "incidentId", "issueKey", "issueUrl", summary, status)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `, [Math.random().toString(), incident.id, jiraRes.issueKey, jiraRes.issueUrl, incident.title, jiraRes.status])).rows[0];

        res.json(savedJira);
    } catch (e) {
        res.status(500).json({ error: 'Failed to link Jira' });
    }
});

export default router;
