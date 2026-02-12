# Deployment Checklist for Portainer + CloudPanel

**Domain**: sync.yourdomain.com  
**Port**: 3030  
**GitHub**: https://github.com/kamishino/gemini-cli-workflow

---

## ✅ Pre-Deployment

- [ ] Portainer is installed and accessible
- [ ] CloudPanel is installed and configured
- [ ] Domain DNS A record points to server IP
- [ ] Port 3030 is available (not used by other services)

---

## 🔑 Step 1: Generate API Key

```bash
openssl rand -hex 32
```

**Save this key securely!** You'll need it for:

1. Portainer environment variable
2. KamiFlow CLI setup

---

## 🐳 Step 2: Deploy in Portainer

### Quick Deploy (Web Editor Method):

1. **Portainer** → **Stacks** → **Add stack**

2. **Name**: `sync-backend`

3. **Paste this in Web editor**:

```yaml
version: "3.8"

services:
  kamiflow-sync:
    image: node:18-alpine
    container_name: kamiflow-sync
    restart: unless-stopped
    working_dir: /app
    command: sh -c "apk add --no-cache python3 make g++ git && cd /tmp && git clone https://github.com/kamishino/gemini-cli-workflow.git && cd gemini-cli-workflow/packages/sync-backend && npm install && node src/server.js"
    ports:
      - "3030:3030"
    environment:
      - NODE_ENV=production
      - PORT=3030
      - API_KEY=${API_KEY}
      - DB_PATH=/data/kamiflow-sync.db
    volumes:
      - kamiflow_data:/data
      - kamiflow_logs:/app/logs

volumes:
  kamiflow_data:
  kamiflow_logs:
```

4. **Environment variables** → Add:
   - Name: `API_KEY`
   - Value: `<your-generated-key>`

5. **Deploy the stack**

6. **Verify**: Container status should be **running** (green)

---

## 🌐 Step 3: Configure CloudPanel

### Add Domain:

1. **CloudPanel** → **Domains** → **Add Domain**
   - Domain: `sync.yourdomain.com`
   - Click **Create**

### Configure Reverse Proxy:

1. Go to domain → **Vhost** or **NGINX Settings**

2. **Add this location block**:

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
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

3. **Save** → **Reload NGINX**

### Enable SSL:

1. Domain settings → **SSL/TLS**
2. **New Let's Encrypt Certificate**
3. Wait for certificate issuance

---

## ✅ Step 4: Test Deployment

```bash
# Health check
curl https://sync.yourdomain.com/health

# Expected: {"status":"ok","version":"1.0.0"}
```

---

## 💻 Step 5: Setup KamiFlow CLI

On your local machine:

```bash
kami sync setup
```

**Enter:**

- Deployment: "I already have a backend running"
- Backend URL: `https://sync.yourdomain.com`
- API Key: `<your-api-key>`
- Mode: `manual`

**Test:**

```bash
kami sync-db push
```

---

## 🎯 Verification Checklist

- [ ] Container running in Portainer (green status)
- [ ] Health endpoint responds: `curl https://sync.yourdomain.com/health`
- [ ] SSL certificate installed (https works)
- [ ] CLI can connect and sync
- [ ] No errors in Portainer logs

---

## 🔧 Common Issues

### Container Won't Start

- Check Portainer logs
- Verify API_KEY is set
- Ensure port 3030 is not used

### Can't Access Domain

```bash
# Test NGINX config
sudo nginx -t

# Check DNS
nslookup sync.yourdomain.com

# Test direct access
curl http://SERVER_IP:3030/health
```

### SSL Issues

- Verify DNS is pointing to correct IP
- Wait 5-10 minutes for DNS propagation
- Check CloudPanel → SSL/TLS → Renew

---

## 📊 Post-Deployment

### Monitor Container:

- **Portainer** → **Containers** → **kamiflow-sync** → **Stats**

### View Logs:

- **Portainer** → **Containers** → **kamiflow-sync** → **Logs**

### Backup:

- **Portainer** → **Volumes** → **kamiflow_data** → Download `.db` file

---

## 🆘 Support

- Guide: `PORTAINER-SETUP.md`
- Issues: https://github.com/kamishino/gemini-cli-workflow/issues
