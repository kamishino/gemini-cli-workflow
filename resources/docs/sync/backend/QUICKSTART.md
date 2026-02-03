# Quick Start: Self-Hosted Deployment

Get your KamiFlow sync backend running in **5 minutes**.

---

## Prerequisites

- Linux server (Ubuntu 22.04/24.04 recommended)
- Docker & Docker Compose installed
- Optional: A domain name for HTTPS

---

## Step 1: Install Docker (if not installed)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## Step 2: Clone & Configure

```bash
# Clone repository
cd ~
git clone https://github.com/kamishino/gemini-cli-workflow.git
cd gemini-cli-workflow/packages/sync-backend

# Generate API key
API_KEY=$(openssl rand -hex 32)
echo "Your API Key: $API_KEY"
echo "⚠️  Save this key - you'll need it for the CLI setup!"

# Create .env file
cp .env.example .env

# Set the API key
sed -i "s/your-secret-api-key-here/$API_KEY/" .env

# Review configuration
cat .env
```

---

## Step 3: Configure Domain (Optional)

### Option A: With Domain (Recommended)

Edit `Caddyfile`:

```bash
nano Caddyfile
```

Replace `sync.yourdomain.com` with your actual domain:

```caddyfile
sync.yourdomain.com {
    reverse_proxy kamiflow-sync:3000
    ...
}
```

**DNS Setup:**
- Add an `A` record pointing to your server IP
- Wait 5-10 minutes for DNS propagation

### Option B: Localhost (Testing Only)

Edit `Caddyfile`:

```bash
nano Caddyfile
```

Comment out the domain block and use:

```caddyfile
:80 {
    reverse_proxy kamiflow-sync:3000
}
```

---

## Step 4: Deploy

```bash
# Create data directory
mkdir -p data logs

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

Expected output:
```
✓ Container kamiflow-sync   Started
✓ Container kamiflow-caddy  Started
```

---

## Step 5: Verify Deployment

```bash
# Health check
curl http://localhost/health

# Expected response:
# {"status":"ok","version":"1.0.0","uptime":123.45}
```

If using a domain:
```bash
curl https://sync.yourdomain.com/health
```

---

## Step 6: Configure KamiFlow CLI

On your local machine:

```bash
# Navigate to your KamiFlow project
cd ~/my-kamiflow-project

# Run sync setup
kami sync setup
```

When prompted:
1. Select: **"I already have a backend running"**
2. Enter backend URL:
   - With domain: `https://sync.yourdomain.com`
   - Without domain: `http://YOUR_SERVER_IP`
3. Paste the API key from Step 2
4. Choose sync mode: **Manual**

---

## Step 7: First Sync

```bash
# Check status
kami sync-db status

# Push your first backup
kami sync-db push
```

Expected output:
```
✅ Synced 97 file(s).
```

---

## Maintenance Commands

```bash
# View logs
docker compose logs -f kamiflow-sync

# Restart services
docker compose restart

# Stop services
docker compose down

# Update to latest version
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d

# Backup database
cp data/kamiflow-sync.db backup-$(date +%Y%m%d).db
```

---

## Firewall Configuration

If using UFW:

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## Troubleshooting

### Port 80/443 Already in Use

Check what's using the port:
```bash
sudo lsof -i :80
sudo lsof -i :443
```

If Apache/Nginx is running, stop it:
```bash
sudo systemctl stop apache2  # or nginx
sudo systemctl disable apache2
```

### Container Won't Start

Check logs:
```bash
docker compose logs kamiflow-sync
```

Common issues:
- API_KEY not set in `.env`
- Port conflicts
- Insufficient permissions on `./data` directory

### Can't Connect from CLI

1. Check if backend is accessible:
   ```bash
   curl -I http://YOUR_SERVER_IP/health
   ```

2. Verify API key matches:
   ```bash
   grep API_KEY .env
   ```

3. Check firewall rules:
   ```bash
   sudo ufw status
   ```

### Database Locked

If you see "database is locked" errors:
```bash
docker compose down
rm data/*.db-wal data/*.db-shm
docker compose up -d
```

---

## Security Hardening

1. **Change SSH port** (optional):
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Change Port 22 to Port 2222
   sudo systemctl restart sshd
   ```

2. **Disable password authentication**:
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   ```

3. **Set up fail2ban**:
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

4. **Enable automatic security updates**:
   ```bash
   sudo apt install unattended-upgrades -y
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

---

## Cost Optimization

### Minimal VPS Requirements

- **RAM**: 512MB (1GB recommended)
- **Storage**: 10GB SSD
- **Bandwidth**: 1TB/month
- **CPU**: 1 core

### Provider Recommendations

| Provider | Plan | Cost | Link |
|----------|------|------|------|
| Hetzner | CX11 | €4.15/mo | hetzner.com |
| Vultr | Basic | $6/mo | vultr.com |
| DigitalOcean | Droplet | $6/mo | digitalocean.com |
| Linode | Nanode | $5/mo | linode.com |

---

## Next Steps

✅ Backend is running  
✅ CLI is configured  
✅ First sync completed

**Now you can:**
- Run `kami sync-db push` after creating new tasks/ideas
- Run `kami sync-db pull` to download from other devices
- Set up automatic backups (cron job)
- Configure monitoring (optional)

---

## Support

- 📖 Full docs: [README.md](README.md)
- 🐛 Issues: https://github.com/kamishino/gemini-cli-workflow/issues
- 💬 Discussions: https://github.com/kamishino/gemini-cli-workflow/discussions
