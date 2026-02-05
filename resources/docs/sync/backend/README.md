# KamiFlow Sync Backend

Self-hosted synchronization backend for KamiFlow private workspace data (`.kamiflow/archive`, `.kamiflow/ideas`, `.kamiflow/tasks`).

## Features

- 🔒 **Secure**: Bearer token authentication
- 🐳 **Easy Deploy**: Docker Compose with Caddy reverse proxy
- 🚀 **Fast**: SQLite with WAL mode
- 📦 **Lightweight**: ~50MB Docker image
- 🔄 **Reliable**: Automatic HTTPS with Let's Encrypt

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- A domain name (optional, but recommended for HTTPS)
- Server with at least 512MB RAM

### 1. Clone Repository

```bash
git clone https://github.com/kamishino/gemini-cli-workflow.git
cd gemini-cli-workflow/packages/sync-backend
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your API key:

```bash
# Generate a secure API key
openssl rand -hex 32

# Add to .env
API_KEY=your_generated_api_key_here
```

### 3. Configure Domain (Optional)

If using a domain, edit `Caddyfile`:

```caddyfile
# Replace with your domain
sync.yourdomain.com {
    reverse_proxy kamiflow-sync:3000
    ...
}
```

**For localhost testing**, comment out the domain block and use:

```caddyfile
:80 {
    reverse_proxy kamiflow-sync:3000
}
```

### 4. Start Services

```bash
docker-compose up -d
```

Check logs:

```bash
docker-compose logs -f
```

### 5. Verify Deployment

```bash
# Health check
curl http://localhost/health

# Or with domain
curl https://sync.yourdomain.com/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 123.45
}
```

---

## Client Setup

On your KamiFlow CLI:

```bash
kami sync setup
```

Select "I already have a backend running" and enter:

- **Backend URL**: `https://sync.yourdomain.com` (or `http://localhost`)
- **API Key**: The key from your `.env` file

Then sync your data:

```bash
kami sync-db push
```

---

## Architecture

```
┌─────────────┐
│ KamiFlow CLI│
└──────┬──────┘
       │ HTTPS (Bearer Token)
       ▼
┌─────────────┐
│   Caddy     │ ← Automatic HTTPS
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│ Express API │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   SQLite    │
└─────────────┘
```

### Tech Stack

- **API**: Express.js (Node.js 18)
- **Database**: SQLite with better-sqlite3
- **Reverse Proxy**: Caddy 2 (automatic HTTPS)
- **Deployment**: Docker Compose

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check (no auth) |
| `POST` | `/v1/projects/:id/sync` | Upload files |
| `GET` | `/v1/projects/:id/files` | Download files |
| `GET` | `/v1/projects/:id/status` | Get sync status |
| `DELETE` | `/v1/projects/:id` | Delete project data |

All `/v1/*` endpoints require `Authorization: Bearer <API_KEY>` header.

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `API_KEY` | *required* | Bearer token for authentication |
| `DB_PATH` | `/data/kamiflow-sync.db` | SQLite database path |
| `MAX_FILE_SIZE` | `10485760` | Max file size (10MB) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `CORS_ORIGINS` | `*` | CORS allowed origins |

### Docker Volumes

- `./data:/data` - Database persistence
- `./logs:/app/logs` - Application logs
- `caddy_data` - Caddy certificates and data

---

## Backup & Restore

### Backup

```bash
# Stop services
docker-compose down

# Backup database
cp data/kamiflow-sync.db kamiflow-sync-backup-$(date +%Y%m%d).db

# Restart
docker-compose up -d
```

### Restore

```bash
docker-compose down
cp kamiflow-sync-backup-20260203.db data/kamiflow-sync.db
docker-compose up -d
```

---

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Sync backend only
docker-compose logs -f kamiflow-sync

# Caddy only
docker-compose logs -f caddy
```

### Database Size

```bash
du -h data/kamiflow-sync.db
```

### Resource Usage

```bash
docker stats kamiflow-sync
```

---

## Troubleshooting

### Port Already in Use

If port 80/443 is occupied:

```bash
# Check what's using the port
sudo lsof -i :80

# Change ports in docker-compose.yml
ports:
  - "8080:80"
  - "8443:443"
```

### Certificate Errors

Caddy needs ports 80/443 open for Let's Encrypt challenges:

```bash
# Check firewall
sudo ufw status

# Allow ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Connection Refused

Check if backend is running:

```bash
docker-compose ps
docker-compose logs kamiflow-sync
```

### API Key Not Working

Ensure no extra spaces in `.env`:

```bash
# Wrong
API_KEY= abc123

# Correct
API_KEY=abc123
```

---

## Upgrading

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Uninstall

```bash
# Stop and remove containers
docker-compose down -v

# Remove data (warning: deletes all synced files)
rm -rf data/ logs/
```

---

## Security Recommendations

1. **Use strong API keys**: `openssl rand -hex 32`
2. **Enable HTTPS**: Always use a domain with Let's Encrypt
3. **Firewall**: Only expose ports 80/443
4. **Regular backups**: Automate database backups
5. **Update regularly**: Keep Docker images updated

---

## Cost Estimate

- **VPS Hosting**: $5-10/month (512MB RAM, 10GB storage)
- **Domain**: $10-15/year (optional)
- **Total**: ~$6-12/month

**Recommended VPS Providers:**
- DigitalOcean: Droplet ($6/month)
- Linode: Nanode ($5/month)
- Vultr: Cloud Compute ($6/month)
- Hetzner: CX11 (€4/month)

---

## Support

- **Issues**: https://github.com/kamishino/gemini-cli-workflow/issues
- **Discussions**: https://github.com/kamishino/gemini-cli-workflow/discussions
- **CLI Docs**: https://github.com/kamishino/gemini-cli-workflow

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

