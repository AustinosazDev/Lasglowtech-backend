# Production deployment (VPS)

## Server paths

- **SSH:** `root@185.113.249.113` (then `su - Austinosaz` to run the app as that user).
- **Backend app directory:** `~/backend/Lasglowblog` (i.e. `/home/Austinosaz/backend/Lasglowblog`).
- **API base URL (subdomain):** `https://api.pantherarestolounge.com` — set this as `REMOTE_SERVER_API` on the backend and as `VITE_API_URL` when building the frontend. See **Subdomain + SSL** below to create the subdomain and HTTPS.
- All commands below (env, npm, pm2) are run from that directory.

### Subdomain + SSL (api.pantherarestolounge.com)

#### Step 1: Create the subdomain – add a DNS A record

You need one **A record** so `api.pantherarestolounge.com` points to your VPS IP.

**Where is your domain managed?** (Where you set DNS for pantherarestolounge.com.)

- **TrueHost (or same place you bought the VPS):**  
  - Log in → **Domains** (or **DNS** / **Manage domain**).  
  - Open **pantherarestolounge.com** → **DNS Records** or **Manage DNS**.  
  - **Add record:**  
    - **Type:** A  
    - **Name / Host:** `api` (only the subdomain; some panels use `api.pantherarestolounge.com`)  
    - **Value / Points to / IPv4:** `185.113.249.113`  
    - **TTL:** 300 or 3600 (default is fine)  
  - Save.

- **Other registrar (GoDaddy, Namecheap, etc.):**  
  - Domain → **DNS** / **Manage DNS** / **Advanced DNS**.  
  - Add **A** record: **Host** = `api`, **Value** = `185.113.249.113`, save.

- **Cloudflare:**  
  - **DNS** → **Add record**: Type **A**, Name **api**, IPv4 **185.113.249.113**, Proxy status off (grey cloud) for now so SSL with Certbot works. Save.

**Check that it’s working** (after 5–30 min):  
- In a browser or terminal: `ping api.pantherarestolounge.com` — should show `185.113.249.113`.  
- Or: `nslookup api.pantherarestolounge.com` — should return that IP.

#### Step 2: Nginx (on the VPS as root): Install if needed, then add a server block that proxies to your Node app:
   ```bash
   sudo apt install -y nginx
   sudo nano /etc/nginx/sites-available/api.pantherarestolounge.com
   ```
   Paste the config from `server/nginx-api-subdomain.conf` (in this repo), then:
   ```bash
   sudo ln -sf /etc/nginx/sites-available/api.pantherarestolounge.com /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

#### Step 3: SSL with Let's Encrypt
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d api.pantherarestolounge.com
   ```
   Certbot will configure HTTPS and auto-renewal. Your API URL is then `https://api.pantherarestolounge.com` (no port needed).

### Deploy replaces all tracked files on the server

On each push to `main`, the workflow runs `git fetch` + `git reset --hard FETCH_HEAD` on the server. That **replaces all tracked files** with the contents of the repo, so the server always matches what you pushed. Files in `.gitignore` (e.g. `.env`, `node_modules`) are not touched. So you can push from your machine and the server will get the exact same code; no need to clean the server by hand.

## 1. Environment

On the VPS, create production env from the example (do **not** commit `.env.production`):

```bash
cp .env.production.example .env.production
nano .env.production   # or vim – fill in real values
```

**Important for VPS:**

- Set `NODE_ENV=production`.
- Use `DATABASE_HOST=127.0.0.1` if MySQL is on the same VPS; otherwise use the DB host and ensure the DB allows remote connections and your VPS IP is allowed.
- Set `REMOTE_CLIENT_APP` to your frontend URL (e.g. `https://lasglowtech.com.ng`). CORS in production only allows this origin.
- Use strong, unique values for `JWT_SECRET`, `ADMIN_PASSWORD`, and DB credentials.

## 2. MySQL on the VPS (tables + initial data)

Your schema and data are in `sql/hqmrvoda_lasglowtechserver.sql`. One-time setup on the VPS:

### Option A – Run the setup script (from repo root on VPS)

```bash
cd /home/Austinosaz/backend/Lasglowblog   # or wherever the repo is
chmod +x scripts/setup-mysql-vps.sh
```

Set the DB name, user, and password (then run with sudo if needed):

```bash
export MYSQL_DB_NAME=lasglowtechserver
export MYSQL_DB_USER=lasglowapp
export MYSQL_DB_PASSWORD='your_strong_mysql_password'
sudo -E ./scripts/setup-mysql-vps.sh
```

The script installs MySQL if missing, creates the database and user, and imports `sql/hqmrvoda_lasglowtechserver.sql`. At the end it prints the values to put in `.env.production`.

### Option B – Manual steps

1. **Install MySQL** (Debian/Ubuntu):

   ```bash
   sudo apt update && sudo apt install -y mysql-server
   sudo systemctl start mysql && sudo systemctl enable mysql
   sudo mysql_secure_installation   # set root password, remove test DB, etc.
   ```

2. **Create database and user:**

   ```bash
   sudo mysql -u root -p
   ```

   In the MySQL shell:

   ```sql
   CREATE DATABASE lasglowtechserver CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   CREATE USER 'lasglowapp'@'localhost' IDENTIFIED BY 'your_strong_password';
   GRANT ALL PRIVILEGES ON lasglowtechserver.* TO 'lasglowapp'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Import the dump** (from the repo directory):

   ```bash
   cd /home/Austinosaz/backend/Lasglowblog
   mysql -u root -p lasglowtechserver < sql/hqmrvoda_lasglowtechserver.sql
   ```

4. In `.env.production` set:

   ```env
   DATABASE_HOST=127.0.0.1
   DATABASE_USER=lasglowapp
   DATABASE_PASSWORD=your_strong_password
   DATABASE=lasglowtechserver
   DATABASE_PORT=3306
   ```

**Old cPanel image URLs in the dump:** `sql/hqmrvoda_lasglowtechserver.sql` contains some image URLs pointing at `https://lasglowserver.phoenixstech.com`. After importing, if your API is on a different domain, you can update them on the server, e.g. `UPDATE catalogues SET image_url = REPLACE(image_url, 'https://lasglowserver.phoenixstech.com', 'https://your-new-api.com');` (run similar REPLACE for other tables that store full image URLs).

**Will all SQL in `server/sql/` be applied?** Yes. The setup script (Option A) does two things: (1) imports the main dump `sql/hqmrvoda_lasglowtechserver.sql` (all tables and data from that file), then (2) runs every other `.sql` file in `sql/` (e.g. `add_certificate_settings.sql`, `create_added_tables_once.sql`, seeds, etc.). So all contents of `server/sql/` are applied by the script. When the Node app starts it also runs `ensureTables()` (bootstrap), which ensures any remaining tables/columns exist. No extra manual SQL steps are required.

## 3. Install dependencies

```bash
npm ci --omit=dev
```

Or, if you need dev tools on the server:

```bash
npm install
```

## 4. Run with PM2

From the server project directory:

```bash
# Start in production mode (loads .env.production)
pm2 start ecosystem.config.cjs --env production

# Save process list so it restarts on reboot
pm2 save
pm2 startup
```

Useful commands:

- `pm2 status` – list processes  
- `pm2 logs api` – view logs  
- `pm2 restart api --env production` – restart after code or env changes  

## 5. Auto deploy (GitHub Actions)

On push to `main`, the workflow SSHs into the VPS and runs: `git pull origin main`, `npm ci --omit=dev`, then `pm2 restart api` (or start if not running) and `pm2 save`. No FTP—deploy is SSH-only. Set GitHub secrets: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` (optional: `SSH_PORT`). One-time on server: clone the repo into `~/backend/Lasglowblog`; for private repos, add a deploy key so `git pull` works.

## 6. API URL the frontend uses

The **backend** must know its own public URL (for CORS and any links it builds). In `.env.production` set:

```env
REMOTE_SERVER_API=https://api.pantherarestolounge.com
```

Use the real URL where the API is reachable on your VPS (e.g. `https://api.lasglowtech.com.ng` or your server’s domain). No trailing slash. The old cPanel URL (`https://lasglowserver.phoenixstech.com`) is no longer used.

The **frontend** (Lasglowtech-website) uses **`VITE_API_URL`** at build time. Set it to the same API URL as `REMOTE_SERVER_API` when building for production, e.g.:

```bash
VITE_API_URL=https://api.pantherarestolounge.com npm run build
```

Or add to the frontend’s `.env.production` (create it in the frontend repo): `VITE_API_URL=https://api.pantherarestolounge.com`. Then both API calls and upload image URLs will use that base. Local dev uses `http://localhost:5000` when `VITE_API_URL` is not set.

## 7. Health check

- `GET /api/health` should return `200 OK`. Use this for uptime checks or load balancers.

## 8. Optional: multiple CORS origins

If you need more than one allowed origin in production (e.g. `https://app.example.com` and `https://www.example.com`), you can extend `config/index.js` to read a comma-separated env var (e.g. `ALLOWED_ORIGINS`) and use it in `allowedDomains` when `NODE_ENV === 'production'`.
