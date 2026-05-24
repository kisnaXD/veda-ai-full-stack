# VedaAI Assessment Creator

AI-powered question paper generator. Teachers fill a short form (subject, grade, question mix, optional source material), an LLM drafts a structured paper, and they can download a print-ready PDF.

**Stack:** Next.js 14 + Tailwind + Zustand + Socket.IO client / Express + Mongoose + BullMQ + Socket.IO + Puppeteer / MongoDB + Redis / OpenAI-compatible LLM.

**Repo layout:**

```text
apps/
  web/        Next.js 14 frontend (App Router)
  api/        Express backend + BullMQ worker + Socket.IO + Puppeteer
packages/
  shared/     Zod schemas, TS types, websocket event constants
Dockerfile.api  Production container for the API + worker
docker-compose.yml  Local Mongo + Redis for dev
```

---

## Part A - Run locally

### Prerequisites

- Node.js 20+
- Docker Desktop (for Mongo + Redis)
- An OpenAI-compatible API key (OpenAI, Groq, OpenRouter, etc.) - *optional*, see below

### Steps

```bash
git clone https://github.com/<your-username>/veda-ai-full-stack.git
cd veda-ai-full-stack

npm install
npm run infra:up

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Open `apps/api/.env` and set your LLM key:

```env
LLM_API_KEY=<your-key>
```

For **Groq** (free), also set:

```env
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile
```

If you leave `LLM_API_KEY` empty, the backend serves a structured mock paper so the full flow still works without any key.

```bash
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:4000

---

## Part B - Deploy to production

You'll deploy the **frontend to Vercel** and the **backend (API + worker + WebSocket) to AWS EC2** behind an nginx + Let's Encrypt reverse proxy. Mongo and Redis are managed services (free tier).

Total cost: **$0** if you stay within the free tiers of all services (~750 hours/month of `t3.small` on the AWS free tier covers a single instance).

### B.0 Push the repo to GitHub

If you haven't already:

```bash
git init -b main
git remote add origin https://github.com/<your-username>/veda-ai-full-stack.git
git add -A
git commit -m "Initial commit"
git push -u origin main
```

### B.1 Frontend on Vercel

1. Sign in at https://vercel.com and click **Add New → Project**.
2. Import the GitHub repo.
3. On the configuration screen:
   - **Framework Preset**: `Next.js` (auto-detected).
   - **Root Directory**: click *Edit* → `apps/web`.
   - **Install Command**: override to `npm install --workspaces --include-workspace-root`.
   - **Build Command**: leave default (`next build`).
4. Add **Environment Variables** (use placeholders for now):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://placeholder.nip.io` |
   | `NEXT_PUBLIC_WS_URL`  | `https://placeholder.nip.io` |

5. Click **Deploy**.
6. Note the production URL (e.g. `https://<project>.vercel.app`) - you'll need it for `CORS_ORIGIN`.

> The site loads but can't talk to a backend until B.4 is done.

### B.2 MongoDB Atlas (free tier)

1. https://www.mongodb.com/cloud/atlas/register → sign up.
2. Build a database → **M0 FREE** → cloud provider `AWS`, region nearest to your future EC2.
3. **Security → Database Access → Add New Database User**:
   - Auth method: Password.
   - Built-in role: *Read and write to any database*.
   - Click **Autogenerate Secure Password**, copy it.
4. **Security → Network Access → Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`). Tighten after EC2 is up.
5. **Database → Connect → Drivers → Node.js**. Copy the URI, replace `<db_password>`, and append the database name `vedaai`:

   ```text
   mongodb+srv://<user>:<password>@<host>/vedaai?retryWrites=true&w=majority
   ```

   Save this as your `MONGO_URI`.

### B.3 Upstash Redis (free tier)

1. https://console.upstash.com → **Create Database**.
2. Name: `vedaai-redis`. Type: `Regional`. Region: same as EC2.
3. **TLS**: enabled. **Eviction**: disabled (BullMQ requires `noeviction`).
4. Click **Create**.
5. In the database details, switch the connect example to the **TCP** / `ioredis` view. Copy the full `rediss://...` URL.

   Save as `REDIS_URL`. (Note: double-`s` in `rediss://` means TLS - don't strip it.)

### B.4 Backend on AWS EC2

#### Launch the instance

1. AWS Console → **EC2 → Launch instance**:
   - Name: `vedaai-backend`.
   - AMI: **Ubuntu Server 24.04 LTS** (64-bit x86).
   - Instance type: `t3.small` (2 GB RAM minimum - Puppeteer OOMs on `t2.micro`).
   - Key pair: create `veda-key`, type `RSA`, format `.pem`. Save the file to `~/.ssh/veda-key.pem`.
   - Security group: create new `vedaai-sg` with inbound rules:
     - SSH (22) - **My IP**.
     - HTTP (80) - `0.0.0.0/0` (needed for Let's Encrypt HTTP-01 challenge).
     - HTTPS (443) - `0.0.0.0/0`.
   - Storage: 20 GiB `gp3`.
2. Allocate an **Elastic IP** and associate it with this instance so the IP doesn't change on reboot. Note the IP (e.g. `13.234.56.78`).

#### Fix `.pem` permissions on Windows

Without this, OpenSSH refuses the key.

```powershell
cd "$HOME\.ssh"
icacls .\veda-key.pem /inheritance:r
icacls .\veda-key.pem /grant:r "$($env:USERNAME):(R)"
```

#### SSH in

```powershell
ssh -i "$HOME\.ssh\veda-key.pem" ubuntu@<EC2_IP>
```

Everything below runs on EC2.

#### Install Docker, nginx, Certbot, git

```bash
sudo apt update && sudo apt -y upgrade
sudo apt install -y curl git nginx certbot python3-certbot-nginx
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
exit
```

Reconnect so the docker group takes effect:

```powershell
ssh -i "$HOME\.ssh\veda-key.pem" ubuntu@<EC2_IP>
```

Verify:

```bash
docker --version
docker run --rm hello-world
nginx -v
```

#### Clone the repo and create the production `.env`

```bash
cd ~
git clone https://github.com/<your-username>/veda-ai-full-stack.git
cd veda-ai-full-stack

cat > apps/api/.env <<'EOF'
NODE_ENV=production
API_PORT=4000
CORS_ORIGIN=https://*.vercel.app

MONGO_URI=<your-mongo-uri-from-B.2>
REDIS_URL=<your-redis-url-from-B.3>

LLM_PROVIDER=groq
LLM_API_KEY=<your-llm-key>
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile
EOF
```

`CORS_ORIGIN` supports comma-separated origins and `*` wildcards - `https://*.vercel.app` allows all Vercel deploys (production + previews). For tighter security, narrow it to `https://<your-project>.vercel.app,https://<your-project>-*.vercel.app`.

#### Build and run the container

```bash
docker build -f Dockerfile.api -t vedaai-api .

docker run -d \
  --name vedaai-api \
  --restart unless-stopped \
  --env-file apps/api/.env \
  -p 127.0.0.1:4000:4000 \
  vedaai-api

docker logs --tail 30 vedaai-api
```

Watch for all four lines:

```text
[mongo] connected
[redis] connected → rediss://...
[worker:gen] ready
[api] http://localhost:4000
```

Sanity check on the box:

```bash
curl http://127.0.0.1:4000/healthz
# {"ok":true,"ts":...}
```

#### Pick a hostname for HTTPS

Two options for getting a real DNS name pointing to your EC2 IP without buying a domain:

- **nip.io** - instant, no signup. Format: `<EC2_IP>.nip.io` (dots, not dashes). May be Let's Encrypt rate-limited at times.
- **DuckDNS** - free signup at https://www.duckdns.org, pick any subdomain like `vedaai-api.duckdns.org`, paste your EC2 IP into its "current ip" field. Reliably has its own Let's Encrypt quota.

The rest of this guide uses `<HOSTNAME>` - substitute whichever you pick.

#### Configure nginx as a reverse proxy

```bash
sudo nano /etc/nginx/sites-available/vedaai
```

Paste, replacing `<HOSTNAME>`:

```nginx
server {
    listen 80;
    server_name <HOSTNAME>;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_buffering off;
    }
}
```

Enable, validate, reload:

```bash
sudo ln -sf /etc/nginx/sites-available/vedaai /etc/nginx/sites-enabled/vedaai
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Verify HTTP works:

```bash
curl http://<HOSTNAME>/healthz
# {"ok":true,"ts":...}
```

#### Provision HTTPS with Let's Encrypt

```bash
sudo certbot --nginx -d <HOSTNAME> --non-interactive --agree-tos -m <your-email> --redirect
```

Certbot will get the cert, edit your nginx config to add `listen 443 ssl`, and install a systemd timer for auto-renewal. Verify from your laptop:

```bash
curl https://<HOSTNAME>/healthz
```

### B.5 Point Vercel at the live backend

1. Vercel → your project → **Settings → Environment Variables**.
2. Edit both placeholders:
   - `NEXT_PUBLIC_API_URL` → `https://<HOSTNAME>`
   - `NEXT_PUBLIC_WS_URL`  → `https://<HOSTNAME>`
3. **Deployments → ⋯ → Redeploy** (uncheck "Use existing Build Cache").

Once that deploy lands the site is fully functional end-to-end.

### B.6 (Recommended) Lock down Mongo

Back on Atlas → **Security → Network Access**, replace `0.0.0.0/0` with your EC2 elastic IP (`<EC2_IP>/32`).

---

## Day-to-day operations

When you push new commits, on EC2:

```bash
cd ~/veda-ai-full-stack
git pull
docker build -f Dockerfile.api -t vedaai-api .
docker stop vedaai-api && docker rm vedaai-api
docker run -d --name vedaai-api --restart unless-stopped \
  --env-file apps/api/.env -p 127.0.0.1:4000:4000 vedaai-api
docker logs --tail 30 vedaai-api
```

Vercel auto-deploys on every push.

Useful one-liners:

```bash
docker logs -f vedaai-api                   # tail app logs
docker exec vedaai-api env | grep <KEY>     # check live env var
sudo nginx -t                               # validate nginx config
sudo systemctl reload nginx                 # apply nginx changes
sudo journalctl -u nginx -f                 # tail nginx logs
sudo certbot renew --dry-run                # test cert renewal
docker stats vedaai-api                     # cpu / memory
df -h /                                     # disk usage
```

---

## Troubleshooting

### Vercel build fails with `Module not found: '@vedaai/shared'`

The workspace install command wasn't overridden. Fix: project **Settings → General → Build & Output Settings**, set **Install Command** to `npm install --workspaces --include-workspace-root`.

### Vercel build fails with `Error: useSearchParams() should be wrapped in a suspense boundary`

Already handled in the codebase (`apps/web/src/components/Sidebar.tsx` wraps its `useSearchParams` user in `<Suspense>`). If you add new client components using `useSearchParams`, do the same.

### `docker build` fails with `no space left on device`

Run `docker system prune -af --volumes`, then rebuild. If still tight, grow the EBS volume to 30 GiB from the AWS console, then on EC2 run `sudo growpart /dev/nvme0n1 1 && sudo resize2fs /dev/nvme0n1p1`.

### Container starts but logs show `ECONNREFUSED 127.0.0.1:6379`

`REDIS_URL` isn't being read. `docker restart` doesn't re-read `--env-file`. Recreate: `docker stop vedaai-api && docker rm vedaai-api && docker run ...` again.

### `MongooseServerSelectionError: Could not connect to any servers`

Atlas IP whitelist is blocking EC2. Add `0.0.0.0/0` (or your EC2's public IP from `curl https://ifconfig.me`) under Network Access. Wait 30s for it to become Active.

### `too many certificates already issued for "nip.io"`

Let's Encrypt rate limit on the popular suffix. Switch to DuckDNS (Section B.4 "Pick a hostname").

### Browser shows `Access-Control-Allow-Origin: http://localhost:3000`

`CORS_ORIGIN` wasn't updated in the EC2 `.env`, or you `docker restart`ed instead of recreating. Update `apps/api/.env`, then `docker stop && rm && run` and hard-refresh the browser (preflights are cached up to 5h).

### CORS preflight returns 500

Browser's `Origin` header doesn't match any pattern in `CORS_ORIGIN`. Trailing slashes are a common cause - strip them. Verify with:

```bash
docker exec vedaai-api env | grep CORS_ORIGIN
curl -i -X OPTIONS https://<HOSTNAME>/api/assignments \
  -H "Origin: https://<your-vercel-url>" \
  -H "Access-Control-Request-Method: GET"
```

---

## Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start frontend + backend concurrently (local) |
| `npm run build` | Build all three workspaces |
| `npm run infra:up` | Start local Mongo + Redis containers |
| `npm run infra:down` | Stop them |
| `npm run infra:logs` | Tail Mongo + Redis logs |
