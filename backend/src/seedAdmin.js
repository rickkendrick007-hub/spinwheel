import { connectDb } from './db.js';
import { ensureAdminUser } from './utils/seedAdminUser.js';

async function run() {
  await connectDb();
  await ensureAdminUser();
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
