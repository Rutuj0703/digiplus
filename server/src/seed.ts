import { PrismaClient } from './generated/prisma';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const dataDir = path.resolve('../data');

  const readJson = (name: string) => {
    const p = path.join(dataDir, `${name}.json`);
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  };

  const agentsData = readJson('agents');
  for (const row of agentsData) {
    if (!row.id) continue;
    await prisma.agent.upsert({
      where: { id: row.id.toString() },
      update: {},
      create: {
        id: row.id.toString(),
        name: row.name || 'Unknown',
        team: row.team || 'Unknown',
      },
    });
  }
  console.log(`Agents seeded: ${agentsData.length}`);

  const catsData = readJson('categories');
  for (const row of catsData) {
    const id = row.id?.toString() || row.categoryId || row.name || Math.random().toString();
    await prisma.category.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: row.name || 'General',
        description: row.description || '',
      },
    });
  }
  console.log(`Categories seeded: ${catsData.length}`);

  const ticketsData = readJson('tickets');
  for (const row of ticketsData) {
    const ticketNumber = row.ticketNumber || row.ticket_id || `INC-${row.id}`;
    const p = row.priority || 'MEDIUM';
    const status = row.status || 'OPEN';

    if (!row.id) continue;
    await prisma.incident.upsert({
      where: { ticketNumber },
      update: {},
      create: {
        id: row.id?.toString() || ticketNumber,
        ticketNumber,
        title: row.title || 'Untitled Ticket',
        description: row.description || '',
        status,
        priority: p,
        categoryId: row.categoryId?.toString(),
        reporter: row.reporter || row.user_name || 'System',
        createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      },
    });
  }
  console.log(`Tickets seeded: ${ticketsData.length}`);

  const commentsData = readJson('comments');
  for (const row of commentsData) {
    const id = row.id?.toString() || Math.random().toString();
    if (!row.incidentId) continue;
    try {
      await prisma.comment.create({
        data: {
          id,
          incidentId: row.incidentId.toString(),
          author: row.author || row.agent_name || 'System',
          body: row.body || row.comment || '',
          createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
        },
      });
    } catch (e) {
      // safe ignore constraints
    }
  }
  console.log(`Comments seeded: ${commentsData.length}`);

  console.log('Database seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
