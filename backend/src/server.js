import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDb } from './db.js';
import { config } from './config.js';
import { ensureAdminUser } from './utils/seedAdminUser.js';
import authRoutes from './routes/authRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: config.corsOrigin.split(',').map((item) => item.trim()),
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, environment: config.nodeEnv });
});

app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api', linkRoutes);

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  await connectDb();
  await ensureAdminUser();
  app.listen(config.port, () => {
    console.log(`API running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server');
  console.error(error.message || error);
  console.error('Tip: install and start local MongoDB, or change MONGODB_URI in backend/.env.');
  process.exit(1);
});
