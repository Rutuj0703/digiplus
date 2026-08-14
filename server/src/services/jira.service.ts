import dotenv from 'dotenv';
dotenv.config();

const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = process.env;

export const createJiraIssue = async (incident: any) => {
    if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
        return { issueKey: `MOCK-${incident.id.slice(0, 5)}`, issueUrl: `https://mock.jira/MOCK-${incident.id.slice(0,5)}`, status: 'IN PROGRESS' };
    }
    const url = `${JIRA_BASE_URL}/rest/api/3/issue`;
    const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
    
    // Minimal standard body
    const bodyData = {
        fields: {
            project: { key: JIRA_PROJECT_KEY },
            summary: incident.title,
            description: {
                type: 'doc',
                version: 1,
                content: [{ type: 'paragraph', content: [{ type: 'text', text: incident.description }] }]
            },
            issuetype: { name: 'Task' } // Assuming Task exists
        }
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Jira API Error: ${txt}`);
    }
    const data = await res.json();
    return {
        issueKey: data.key,
        issueUrl: `${JIRA_BASE_URL}/browse/${data.key}`,
        status: 'OPEN'
    };
};
