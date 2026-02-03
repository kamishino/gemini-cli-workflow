# Portainer + CloudPanel Deployment Guide

Deploy KamiFlow Sync Backend using Portainer with CloudPanel reverse proxy.

**Configuration:**
- Domain: `sync.yourdomain.com`
- Port: `3030`
- GitHub: `https://github.com/kamishino/gemini-cli-workflow`

---

## Prerequisites

- Portainer installed and running
- CloudPanel installed and configured
- Domain DNS pointing to your server
- Docker and Docker Compose available

---

## Step 1: Generate API Key

On your server:

```bash
openssl rand -hex 32
```

Save this key - you'll need it for:
1. Portainer environment variables
2. KamiFlow CLI setup

Example output: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

---

## Step 2: Deploy via Portainer

### Option A: Using Portainer Stacks (Recommended)

1. **Login to Portainer** → Navigate to **Stacks**

2. **Create New Stack**:
   - Name: `kamiflow-sync-backend`
   - Build method: **Git Repository**

3. **Configure Git Repository**:
   ```
   Repository URL: https://github.com/kamishino/gemini-cli-workflow
   Repository reference: refs/heads/main
   Compose path: kamiflow-sync-backend/docker-compose.portainer.yml
   ```

4. **Environment Variables** (click "Add environment variable"):

5. **Paste this docker-compose.yml**:

```yaml
version: '3.8'

services:
  kamiflow-sync:
    image: node:18-alpine
    container_name: kamiflow-sync
    restart: unless-stopped
    working_dir: /app
    command: sh -c "
      apk add --no-cache python3 make g++ git wget &&
      echo 'Cleaning workspace...' &&
      rm -rf /app/* /app/.* 2>/dev/null || true &&
      echo 'Cloning repository...' &&
      git clone https://github.com/kamishino/gemini-cli-workflow.git /tmp/repo &&
      echo 'Moving files to /app...' &&
      cp -r /tmp/repo/* /app/ &&
      cd /app/kamiflow-sync-backend &&
      echo 'Installing dependencies...' &&
      npm install &&
      echo 'Starting server...' &&
      node src/server.js
    "
    ports:
      - "3030:3030"
    environment:
      - NODE_ENV=production
      - PORT=3030
      - API_KEY=${API_KEY}
      - DB_PATH=/data/kamiflow-sync.db
      - MAX_FILE_SIZE=10485760
      - RATE_LIMIT_WINDOW_MS=900000
      - RATE_LIMIT_MAX_REQUESTS=100
      - CORS_ORIGINS=*
      - LOG_LEVEL=info
    volumes:
      - kamiflow_data:/data
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3030/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 180s

volumes:
  kamiflow_data:
    driver: local
```

6. **Environment variables**:
   - Click "Add an environment variable"
   - Name: `API_KEY`
   - Value: `<your-generated-api-key>`

7. **Click "Deploy the stack"**

### Option B: Pre-built Image (Recommended for Production)

1. **Build image locally** (or use GitHub Actions):
   ```bash
   cd kamiflow-sync-backend
   docker build -t kamiflow-sync:latest -f Dockerfile.portainer .
   docker save kamiflow-sync:latest | gzip > kamiflow-sync.tar.gz
   ```

2. **Upload to Portainer**:
   - **Images** → **Import**
   - Upload `kamiflow-sync.tar.gz`

3. **Create Stack** with simplified config:
   ```yaml
   version: '3.8'
   
   services:
     kamiflow-sync:
       image: kamiflow-sync:latest
       container_name: kamiflow-sync
       restart: unless-stopped
       ports:
         - "3030:3030"
       environment:
         - NODE_ENV=production
         - PORT=3030
         - API_KEY=${API_KEY}
         - DB_PATH=/data/kamiflow-sync.db
         - MAX_FILE_SIZE=10485760
         - RATE_LIMIT_WINDOW_MS=900000
         - RATE_LIMIT_MAX_REQUESTS=100
         - CORS_ORIGINS=*
         - LOG_LEVEL=info
       volumes:
         - kamiflow_data:/data
   
   volumes:
     kamiflow_data:
       driver: local
   ```

---

## Step 3: Verify Container is Running

1. In Portainer, navigate to **Containers**

2. Check `kamiflow-sync` status should be **running** (green)

3. Click on the container → **Logs** tab

4. You should see:
   ```
   KamiFlow Sync Backend running on port 3030
   Environment: production
   ```

5. Test health endpoint:
   ```bash
   curl http://YOUR_SERVER_IP:3030/health
   ```

   Expected response:
   ```json
   {"status":"ok","version":"1.0.0","uptime":12.34}
   ```

---

## Step 4: Configure CloudPanel Reverse Proxy

### 4.1 Add Domain in CloudPanel

1. **Login to CloudPanel**

2. Navigate to **Domains** → **Add Domain**

3. Configure:
   ```
   Domain Name: sync.yourdomain.com
   Document Root: /home/cloudpanel/htdocs/sync.yourdomain.com
   ```

4. Click **Create**

### 4.2 Configure Reverse Proxy

1. In CloudPanel, go to your domain settings

2. Navigate to **Vhost** or **NGINX Settings**

3. Click **Edit** and add this configuration:

```nginx
location / {
    proxy_pass http://127.0.0.1:3030;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffer sizes
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
}
```

4. **Save** and **Reload NGINX**

### 4.3 Enable SSL Certificate

1. In CloudPanel domain settings, navigate to **SSL/TLS**

2. Click **Actions** → **New Let's Encrypt Certificate**

3. Select:
   - Certificate Type: **Let's Encrypt**
   - Include `www` subdomain: (optional)

4. Click **Create and Install**

5. Wait for certificate issuance (~30 seconds)

---

## Step 5: Test Deployment

### External Access

```bash
curl https://sync.yourdomain.com/health
```

Expected response:
```json
{"status":"ok","version":"1.0.0","uptime":123.45}
```

### Test with Authentication

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://sync.yourdomain.com/v1/projects/test/status
```

---

## Step 6: Configure KamiFlow CLI

On your local machine:

```bash
# Navigate to your KamiFlow project
cd ~/my-project

# Run sync setup
kami sync setup
```

**Enter when prompted:**
1. **Deployment option**: "I already have a backend running"
2. **Backend URL**: `https://sync.yourdomain.com`
3. **API Key**: `<your-api-key-from-step-1>`
4. **Sync mode**: `manual`

**Test sync:**

```bash
kami sync status
kami sync push
```

---

## Management via Portainer

### View Logs

1. **Portainer** → **Containers** → **kamiflow-sync**
2. Click **Logs** tab
3. Enable **Auto-refresh logs**

### Restart Container

1. **Portainer** → **Containers** → **kamiflow-sync**
2. Click **Restart**

### Update to Latest Version

1. **Portainer** → **Stacks** → **kamiflow-sync-backend**
2. Click **Editor**
3. Click **Pull and redeploy**
4. Confirm update

### View Resource Usage

1. **Portainer** → **Containers** → **kamiflow-sync**
2. Click **Stats** tab
3. Monitor CPU, Memory, Network usage

---

## Backup & Restore

### Manual Backup via Portainer

1. **Portainer** → **Volumes** → **kamiflow_data**

2. Click **Browse**

3. Download `kamiflow-sync.db` file

### Restore from Backup

1. Stop container:
   - **Portainer** → **Containers** → **kamiflow-sync** → **Stop**

2. Upload backup:
   - **Portainer** → **Volumes** → **kamiflow_data** → **Upload**
   - Select your `.db` file

3. Start container:
   - **Portainer** → **Containers** → **kamiflow-sync** → **Start**

### Automated Backups (via CloudPanel)

Add a cron job in CloudPanel:

```bash
# Daily backup at 2 AM
0 2 * * * docker run --rm -v kamiflow_data:/data -v /home/backups:/backup alpine tar czf /backup/kamiflow-$(date +\%Y\%m\%d).tar.gz -C /data .
```

---

## Troubleshooting

### Container Won't Start

**Check logs in Portainer:**
1. **Containers** → **kamiflow-sync** → **Logs**

Common issues:
- `API_KEY` not set in environment variables
- Port 3030 already in use
- Volume mount permissions

### Can't Access via Domain

**Check reverse proxy:**
```bash
# SSH into server
sudo nginx -t
sudo systemctl status nginx
```

**Check DNS:**
```bash
nslookup sync.yourdomain.com
```

**Check CloudPanel logs:**
```bash
tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

1. In CloudPanel → **Domains** → **sync.yourdomain.com**
2. Navigate to **SSL/TLS**
3. Click **Renew Certificate**

### API Key Not Working

Verify environment variable in Portainer:
1. **Containers** → **kamiflow-sync** → **Inspect**
2. Scroll to **Env** section
3. Confirm `API_KEY` is set correctly

Update if needed:
1. **Stacks** → **kamiflow-sync-backend** → **Editor**
2. Update `API_KEY` in environment variables
3. Click **Update the stack**

---

## Monitoring

### Health Check Endpoint

```bash
curl https://sync.yourdomain.com/health
```

### Container Health via Portainer

1. **Dashboard** → View **Stack Health**
2. Green = Healthy, Red = Unhealthy

### Resource Monitoring

1. **Portainer** → **Containers** → **kamiflow-sync** → **Stats**
2. Monitor:
   - CPU usage (should be <10% idle)
   - Memory usage (should be <200MB)
   - Network I/O

---

## Security Recommendations

### 1. Firewall (via CloudPanel)

Ensure only necessary ports are open:
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- Block direct access to 3030 from external IPs

### 2. API Key Rotation

1. Generate new key: `openssl rand -hex 32`
2. Update in Portainer environment variables
3. Update in KamiFlow CLI: `kami sync update-key`

### 3. Regular Updates

Enable auto-updates in Portainer:
1. **Stacks** → **kamiflow-sync-backend** → **Settings**
2. Enable **Automatic updates**
3. Set schedule (e.g., weekly)

---

## Performance Tuning

### For High Traffic

Update environment variables in Portainer:

```yaml
environment:
  - RATE_LIMIT_MAX_REQUESTS=500
  - MAX_FILE_SIZE=52428800  # 50MB
```

### Database Optimization

Access container shell via Portainer:
1. **Containers** → **kamiflow-sync** → **Console**
2. Run:
   ```bash
   sqlite3 /data/kamiflow-sync.db "VACUUM;"
   ```

---

## Cost Estimate

- **VPS/Server**: Already have (CloudPanel setup)
- **Domain**: Already have (yourdomain.com)
- **Additional Cost**: $0/month ✨

---

## Support

- **Issues**: https://github.com/kamishino/gemini-cli-workflow/issues
- **Portainer Docs**: https://docs.portainer.io
- **CloudPanel Docs**: https://www.cloudpanel.io/docs

---

## Quick Reference

| Task | Command/Location |
|------|------------------|
| View logs | Portainer → Containers → kamiflow-sync → Logs |
| Restart | Portainer → Containers → kamiflow-sync → Restart |
| Update | Portainer → Stacks → Pull and redeploy |
| Backup | Portainer → Volumes → kamiflow_data → Download |
| SSL Renew | CloudPanel → Domains → SSL/TLS → Renew |
| Health Check | `curl https://sync.yourdomain.com/health` |
