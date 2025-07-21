import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const fastify = Fastify({ logger: true });

// --- DB Setup (run SQL files to initialize the schema) ---
const db = new Database('data.db');

// Read and execute SQL files
const sqlFiles = [
    '001.do.test-table.sql',
    '002.do.create-user-table.sql',
    '003.do.friend-list.sql'
];

sqlFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file); // safer than __dirname with ES modules
    const sql = fs.readFileSync(filePath, 'utf8');
    db.exec(sql);
});

console.log('Database initialized');

// --- Example route ---
fastify.get('/', async (request, reply) => {
    return { message: 'Backend is working!' };
});

// --- Start server ---
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log('Server is running on http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
