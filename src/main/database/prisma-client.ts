import { PrismaClient } from '@prisma/client';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

let prisma: PrismaClient | null = null;
let dbPath = '';

export function getDatabasePath(): string {
  if (dbPath) return dbPath;

  const isDev = !app.isPackaged;
  if (isDev) {
    dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  } else {
    const userDataPath = app.getPath('userData');
    dbPath = path.join(userDataPath, 'database.sqlite');
  }
  return dbPath;
}

export function getPrismaClient(): PrismaClient {
  if (prisma) return prisma;

  const dbFilePath = getDatabasePath();
  const dbUrl = `file:${dbFilePath}`;
  
  // Set DATABASE_URL env var for Prisma Client to consume
  process.env.DATABASE_URL = dbUrl;
  console.log('Database URL configured:', dbUrl);

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: app.isPackaged ? ['error'] : ['query', 'info', 'warn', 'error'],
  });

  return prisma;
}

export async function initializeDatabase(): Promise<void> {
  const dbFilePath = getDatabasePath();
  const dbUrl = `file:${dbFilePath}`;
  const isDev = !app.isPackaged;

  console.log(`Initializing database at: ${dbFilePath}`);

  // Create directory if it doesn't exist
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const client = getPrismaClient();

  if (isDev) {
    // In development, migrations are run via CLI, but let's run them to be safe
    try {
      console.log('Running prisma db push / migrate in development...');
      execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to push database schema in development:', error);
    }
  } else {
    // In production, we can run migrations or copy a seeded database template.
    // If the database doesn't exist, we can also run migrations using node.
    // Since prisma binaries are bundled, we can programmatically run migrations
    // or run raw schema queries. A clean way is to run 'prisma migrate deploy' if possible,
    // or write raw schema SQL. Since electron-builder unpacks the schema, we can run it.
    const dbExists = fs.existsSync(dbFilePath);
    if (!dbExists) {
      console.log('Database does not exist, creating new database...');
      // We can run migration using the unpacked prisma CLI or run it through Node.
      try {
        // Find unpacked resources path
        const resourcesPath = process.resourcesPath;
        const schemaPath = path.join(resourcesPath, 'app.asar.unpacked', 'prisma', 'schema.prisma');
        
        if (fs.existsSync(schemaPath)) {
          console.log('Unpacked schema found, running migrations...');
          const prismaBinPath = path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', 'prisma', 'build', 'index.js');
          if (fs.existsSync(prismaBinPath)) {
            execSync(`node "${prismaBinPath}" migrate deploy --schema="${schemaPath}"`, {
              env: { ...process.env, DATABASE_URL: dbUrl },
              stdio: 'inherit',
            });
            console.log('Migrations executed successfully.');
          }
        }
      } catch (err) {
        console.error('Migration failed, attempting fallback db push:', err);
        // Fallback or copy empty db template if present
      }
    }
  }

  // Verify connection by querying the users table
  try {
    await client.$connect();
    const userCount = await client.user.count();
    console.log(`Database connected successfully. Existing user count: ${userCount}`);
  } catch (error) {
    console.error('Failed to connect to database during initialization:', error);
    throw error;
  }
}
