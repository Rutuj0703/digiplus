import dotenv from 'dotenv';
dotenv.config();

const { GITHUB_TOKEN } = process.env;

export const getGitHubPullRequest = async (owner: string, repo: string, prNumber: number) => {
    if (!GITHUB_TOKEN) {
        throw new Error('GitHub Integration Unavailable');
    }
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
    const res = await fetch(url, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error('GitHub API Error');
    const data = await res.json();
    return {
        status: data.state.toUpperCase(),
        latestCommitSha: data.head?.sha,
        pullRequestUrl: data.html_url
    };
};

export const getGitHubActionsStatus = async (owner: string, repo: string, ref: string) => {
    if (!GITHUB_TOKEN) {
        throw new Error('GitHub Integration Unavailable');
    }
    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${ref}/check-runs`;
    const res = await fetch(url, { headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' } });
    if (!res.ok) return 'UNKNOWN';
    const data = await res.json();
    if (data.check_runs?.length > 0) {
        return data.check_runs[0].conclusion?.toUpperCase() || data.check_runs[0].status?.toUpperCase();
    }
    return 'UNKNOWN';
};
