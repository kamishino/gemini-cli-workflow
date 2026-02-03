# KamiFlow Sync Documentation

Complete documentation for KamiFlow's workspace synchronization system.

---

## 📚 Documentation Structure

### User Guide
- **[GUIDE.md](./GUIDE.md)** - Complete user guide covering:
  - Local search and indexing
  - Manual sync (push/pull)
  - Auto-sync daemon
  - Conflict resolution
  - Troubleshooting

### Backend Deployment
- **[backend/README.md](./backend/README.md)** - Backend overview and setup
- **[backend/QUICKSTART.md](./backend/QUICKSTART.md)** - Quick deployment guide
- **[backend/PORTAINER-SETUP.md](./backend/PORTAINER-SETUP.md)** - Portainer deployment
- **[backend/DEPLOY-CHECKLIST.md](./backend/DEPLOY-CHECKLIST.md)** - Deployment checklist

---

## 🚀 Quick Start

### 1. Read the User Guide
Start with [GUIDE.md](./GUIDE.md) to understand the sync system.

### 2. Deploy Backend (Optional)
If you want cloud sync, follow the backend deployment guides:
- Self-hosted: [backend/README.md](./backend/README.md)
- Portainer: [backend/PORTAINER-SETUP.md](./backend/PORTAINER-SETUP.md)

### 3. Configure CLI
```bash
kami sync-db setup
```

---

## 📖 What is KamiFlow Sync?

KamiFlow Sync is a **local-first synchronization system** that:
- ✅ Keeps `.kamiflow/` private data off GitHub
- ✅ Provides fast local search across all files
- ✅ Syncs to cloud backend for multi-device access
- ✅ Handles conflicts intelligently with 3-way merge
- ✅ Supports auto-sync daemon for real-time updates

---

## 🔗 Related Documentation

- [Configuration Guide](../CONFIGURATION.md)
- [Troubleshooting](../TROUBLESHOOTING.md)
- [API Reference](../API.md)
