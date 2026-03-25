# Spin Wheel Suite

A Coinexx-inspired dark fintech "Spin the Wheel" application with a React + Tailwind frontend and an Express + MongoDB backend.

## What is included

- Direct-to-admin entry flow instead of a marketing-heavy homepage
- One-time-use spin links that are immediately claimed on first open
- Strict backend validation before spin
- Admin dashboard for offers, link generation, logs, and CSV export
- Smooth responsive wheel animation, sound toggle, confetti, and screenshot capture
- Deployment-ready structure for Netlify (frontend) + Render (backend)
- Local MongoDB setup documentation for development and self-hosted storage

## Project structure

- `frontend/` - Vite + React + Tailwind client
- `backend/` - Express + MongoDB API
- `package.json` - convenience scripts for local development

## Architecture summary

This project is built to run with:

- Frontend on Netlify or locally
- Backend on Render or locally
- MongoDB running locally on your own machine by default

Default database URI:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/spinwheel
```

## Important deployment note

A MongoDB instance running only on your own computer is bound to your machine unless you deliberately expose it to the internet. MongoDB's Windows documentation notes that MongoDB launches with `bindIp` set to `127.0.0.1` by default, which means it only accepts connections from the same machine [Source](https://www.mongodb.com/docs/v7.0/tutorial/install-mongodb-on-windows/).

That means:

- **Local development works perfectly** with a local MongoDB server.
- **Frontend on Netlify + backend on Render + database only on your laptop/PC is not a stable production architecture by default**.
- If your backend is deployed on Render and your database stays local, the backend cannot use `127.0.0.1` to reach your machine, because `127.0.0.1` on Render refers to Render's own server, not your computer.

If you still want to keep the database local while deploying the backend to Render, you would need to expose your MongoDB server publicly from your machine using firewall changes, router port forwarding, a public IP or dynamic DNS, and MongoDB network binding changes. That is possible in some self-hosted setups, but it is **not recommended for security or reliability**.

So this README documents **both**:

1. the correct local MongoDB setup for development, and
2. how Netlify and Render deployment works,
3. plus the limitations of trying to keep the database only on your local machine.

## Prerequisites

Before running the project, install:

- Node.js 18 or newer [Source](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
- npm
- MongoDB Community Server on Windows, macOS, or Linux
- Optional: MongoDB Compass
- Optional: mongosh

## Local development setup

### 1) Extract and open the project

Unzip the project and open the root folder in VS Code.

### 2) Install dependencies

From the root folder:

```bash
npm install
npm run install:all
```

### 3) Create environment files

Create these files:

- `backend/.env`
- `frontend/.env`

#### `backend/.env`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/spinwheel
JWT_SECRET=replace-with-a-long-random-string
CLIENT_BASE_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
ADMIN_NAME=Spin Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```

#### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=FinWheel
```

## How to create the database locally

### Option A: Install MongoDB as a Windows service

MongoDB's official Windows installation guide recommends using the MSI installer. During installation, you can choose to install MongoDB as a Windows service, and the service starts after installation [Source](https://www.mongodb.com/docs/v7.0/tutorial/install-mongodb-on-windows/).

Steps:

1. Download MongoDB Community Server MSI from MongoDB Download Center [Source](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose **Complete** installation
4. Keep **Install MongoD as a Service** enabled
5. Finish installation
6. Start the MongoDB service from Windows Services if needed

After that, MongoDB should be available locally on:

```txt
mongodb://127.0.0.1:27017
```

and this project will use:

```txt
mongodb://127.0.0.1:27017/spinwheel
```

### Option B: Run MongoDB manually from command line

MongoDB's documentation also explains how to run it manually from Command Prompt. It says to create the data directory and then run `mongod.exe` with `--dbpath` [Source](https://www.mongodb.com/docs/v7.0/tutorial/install-mongodb-on-windows/).

Example from official docs:

```bash
cd C:\
md "\data\db"
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="c:\data\db"
```

If it starts correctly, MongoDB shows:

```txt
[initandlisten] waiting for connections
```

That means your local MongoDB server is running and your backend can connect to it [Source](https://www.mongodb.com/docs/v7.0/tutorial/install-mongodb-on-windows/).

## How to verify the local database is running

You can verify using any of these methods:

### Method 1: Open MongoDB Compass

Connect to:

```txt
mongodb://127.0.0.1:27017
```

### Method 2: Use mongosh

```bash
mongosh
```

Then run:

```js
show dbs
use spinwheel
```

### Method 3: Start the app and check backend startup

When local MongoDB is running and your env is correct, this should work:

```bash
npm run dev
```

Expected backend output:

```txt
MongoDB connected
API running on http://localhost:5000
```

## How to run the app locally

From the root directory:

```bash
npm run dev
```

This starts:

- Frontend at `http://localhost:5173`
- Backend at `http://localhost:5000`

Health check:

```txt
http://localhost:5000/api/health
```

## Default admin login

On first successful backend startup, the server seeds the admin user automatically using values from `backend/.env`.

Example:

- Email: `admin@example.com`
- Password: `ChangeMe123!`

You can change them in `backend/.env` before starting the backend.

## How the one-time link protection works

1. Admin generates a unique token linked to a snapshot of selected offers.
2. When the public link opens, the frontend collects a browser fingerprint and requests a claim from the backend.
3. The backend atomically moves the token from `unused` to `claimed`, binds it to the fingerprint, and returns a short-lived in-memory access grant.
4. The access grant is intentionally kept only in React memory, not in localStorage or sessionStorage.
5. On refresh, incognito, or another device/browser, the claim cannot be reused because the token is no longer `unused` and the grant is gone.
6. On spin, the backend validates the claim again and immediately marks the token as `used` with the winning result.

## Common local errors and fixes

### Error: `connect ECONNREFUSED 127.0.0.1:27017`

Meaning: MongoDB is not running locally.

Fix:

- install MongoDB Community Server
- or start the MongoDB Windows service
- or manually run `mongod.exe`

### Error: `Failed to fetch` on login

Meaning: frontend is running, but backend is down or crashed.

Fix:

- verify MongoDB is running
- verify backend terminal says `MongoDB connected`
- verify `backend/.env` exists
- verify `frontend/.env` points to `http://localhost:5000/api`

### Error: wrong admin credentials

Meaning: your `.env` credentials do not match what you are typing.

Fix:

- check `ADMIN_EMAIL`
- check `ADMIN_PASSWORD`
- restart the backend after changes

## How to deploy the frontend to Netlify

Netlify's Vite docs say that Netlify detects Vite projects and typically uses `npm run build` with publish directory `dist` [Source](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/).

Recommended Netlify settings:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`

Set this environment variable on Netlify:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

The project already includes:

- `frontend/public/_redirects`
- `frontend/netlify.toml`

for SPA routing.

## How to deploy the backend to Render

Render's Node/Express quickstart says a Node web service can be deployed with standard build/start commands such as `npm install` and `npm start` for your own app [Source](https://render.com/docs/deploy-node-express-app).

Recommended Render settings:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

Set environment variables in Render:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your-database-uri
JWT_SECRET=replace-with-a-long-random-string
CLIENT_BASE_URL=https://your-netlify-site.netlify.app
CORS_ORIGIN=https://your-netlify-site.netlify.app
ADMIN_NAME=Spin Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```

## Can Render use your local MongoDB directly?

Not with the default local setup.

Why:

- your local MongoDB uses `127.0.0.1` by default [Source](https://www.mongodb.com/docs/v7.0/tutorial/install-mongodb-on-windows/)
- `127.0.0.1` means "this same machine"
- so if backend runs on Render, `127.0.0.1` means the Render server itself, not your laptop or PC

If you insist on keeping the DB local while backend is on Render, you would need a self-hosted networking setup, such as:

- changing MongoDB bind IP
- opening firewall rules
- port-forwarding from your router
- exposing your machine with a public IP or dynamic DNS
- making sure your internet connection is stable 24/7

This setup is **not recommended** for production use.

## Recommended practical deployment choices

### Choice 1: Fully local development

- Frontend local
- Backend local
- MongoDB local

Best for testing.

### Choice 2: Frontend on Netlify, backend local, database local

Possible for temporary testing if your local backend is exposed with a tunnel like ngrok or Cloudflare Tunnel.

### Choice 3: Frontend on Netlify, backend on Render, database local

Possible only with advanced self-hosting/network exposure. Not recommended.

### Choice 4: Frontend on Netlify, backend on Render, database hosted remotely

Best real deployment architecture.

## Testing checklist

- Start local MongoDB
- Run `npm run dev`
- Open admin login
- Create offers
- Generate one-time links
- Open a link and spin once
- Refresh that page and verify invalidation
- Check logs and result in admin dashboard
- Export CSV logs

## Files relevant to configuration

### Root

- `package.json`
- `README.md`

### Frontend

- `frontend/.env`
- `frontend/netlify.toml`
- `frontend/public/_redirects`

### Backend

- `backend/.env`
- `backend/render.yaml`
- `backend/src/config.js`
- `backend/src/db.js`
- `backend/src/server.js`

## Final note

This codebase is now configured for **local MongoDB by default** so you can create the database locally and run the project on your own machine immediately. The README also explains the limitations of trying to keep the database only on your local machine while moving the backend to Render.
