# KamiFlow Database Sync Guide

Complete documentation for KamiFlow's local-first workspace synchronization system.

---

## Overview

KamiFlow Database Sync (`sync-db`) keeps your private workspace data (`.kamiflow/archive`, `.kamiflow/ideas`, `.kamiflow/tasks`) synchronized across devices while keeping them off GitHub.

**Features:**
- 🔍 **Local Search** - Fast full-text search across all files
- 🔄 **Manual Sync** - Push/pull on demand
- 🤖 **Auto-Sync** - Background daemon watches for changes
- 🔀 **Conflict Resolution** - Smart 3-way merge for conflicts
- 🔒 **Secure** - API keys stored in OS keychain

---

## Phase 1: Local Search

### Setup

Search is automatically initialized when you run `kami init`.

### Commands

```bash
# Search all files
kami search "authentication"

# Filter by category
kami search "api" --category=ideas

# Limit results
kami search "bug" --limit=10

# Show index statistics
kami search --stats

# Rebuild entire index
kami search --rebuild
```

### How It Works

- SQLite database in `.kamiflow/.index/workspace.db`
- Indexes all `.md` files in archive, ideas, tasks
- Incremental updates (only changed files)
- LIKE-based search (simple, no FTS5 dependency)

---

## Phase 2: Manual Sync

### Initial Setup

```bash
kami sync setup
```

You'll be prompted to:
1. **Choose deployment**: Existing backend, Cloudflare, or self-hosted
2. **Enter backend URL**: e.g., `https://sync.yourdomain.com`
3. **Enter API key**: Your secure 64-character key
4. **Choose sync mode**: `manual` or `auto`

### Configuration

Settings stored in `.kamirc.json`:

```json
{
  "sync": {
    "enabled": true,
    "projectId": "a1b2c3d4...",
    "backend": "https://sync.yourdomain.com",
    "mode": "manual",
    "categories": ["archive", "ideas", "tasks"]
  }
}
```

### Sync Commands

```bash
# Check what needs syncing
kami sync-db status

# Upload local changes
kami sync-db push

# Download remote changes
kami sync pull

# Update API key
kami sync update-key

# Delete all remote data (destructive!)
kami sync-db delete-remote --confirm
```

### How It Works

1. **State Tracking**: `.kamiflow/.sync/state.json` tracks checksums
2. **Change Detection**: SHA256 checksums detect modifications
3. **Incremental Sync**: Only changed files are uploaded
4. **Conflict Detection**: Compares checksums before overwriting

---

## Phase 3: Auto-Sync & Conflicts

### Enable Auto-Sync

During `kami sync-db setup`, choose mode: **auto**

Or update `.kamirc.json`:

```json
{
  "sync": {
    "mode": "auto"
  }
}
```

### Daemon Commands

```bash
# Start background auto-sync
kami sync-db daemon-start

# Check daemon status
kami sync-db daemon-status

# View daemon logs
kami sync daemon-logs

# Stop daemon
kami sync daemon-stop
```

### How Auto-Sync Works

1. **File Watcher** monitors `.kamiflow/` directories
2. **Debouncing** waits 5 seconds after last change
3. **Auto-Push** uploads changed files to backend
4. **Daemon Logs** stored in `.kamiflow/.sync/daemon.log`

### Conflict Resolution

When both local and remote versions have changed:

```bash
# List conflicts
kami sync-db conflicts

# Resolve a conflict
kami sync-db resolve <conflict-id>
```

**Resolution Strategies:**

| Strategy | Description |
|----------|-------------|
| `keep-local` | Keep your local version |
| `keep-remote` | Keep the remote version |
| `merge` | Attempt automatic 3-way merge |
| `manual` | Edit manually (shows both versions) |

**How Conflicts Work:**

1. Detected during push/pull
2. Stored in `.kamiflow/.sync/conflicts/`
3. Original file left untouched until resolved
4. Conflict metadata includes both versions + checksums

---

## Architecture

```
┌─────────────────┐
│  KamiFlow CLI   │
├─────────────────┤
│  File Watcher   │ ← Monitors .kamiflow/
│  Sync Manager   │ ← Push/Pull logic
│  Conflict Res.  │ ← 3-way merge
└────────┬────────┘
         │ HTTPS (Bearer Token)
         ▼
┌─────────────────┐
│  Sync Backend   │
├─────────────────┤
│  Express API    │
│  SQLite DB      │
└─────────────────┘
```

---

## File Structure

```
.kamiflow/
├── .index/
│   └── workspace.db          # Search index
├── .sync/
│   ├── state.json            # Sync state tracking
│   ├── daemon.pid            # Daemon process ID
│   ├── daemon.log            # Auto-sync logs
│   └── conflicts/            # Conflict metadata
│       └── 1234-abc.json
├── archive/                  # Synced
├── ideas/                    # Synced
└── tasks/                    # Synced
```

All `.sync` and `.index` directories are gitignored.

---

## Usage Examples

### Scenario 1: Manual Sync Workflow

```bash
# Work on your project
kami idea "New feature"
kami task "Implement feature"

# Check what changed
kami sync-db status
# Output: 2 files pending

# Upload to cloud
kami sync-db push
# Output: Synced 2 files

# On another device
kami sync-db pull
# Output: Downloaded 2 files
```

### Scenario 2: Auto-Sync Workflow

```bash
# Start daemon once
kami sync-db daemon-start

# Work normally - changes sync automatically
kami idea "Quick thought"
# ... 5 seconds later, auto-synced!

# Check status anytime
kami sync-db daemon-status
# Output: Running, watching archive, ideas, tasks

# Stop when done
kami sync daemon-stop
```

### Scenario 3: Conflict Resolution

```bash
# After pulling, if conflict detected
kami sync-db conflicts
# Output:
# 1. ideas/my-idea.md
#    ID: 1707123456-a1b2c3d4

# Resolve it
kami sync-db resolve 1707123456-a1b2c3d4
# Choose: Keep local / Keep remote / Merge

# Verify resolution
kami sync-db status
# Output: 0 conflicts
```

---

## Security Best Practices

### API Key Storage

- **Never** commit API keys to Git
- **Never** store in `.env` files tracked by Git
- **Always** use OS keychain when available
- Fallback: Encrypted file (`.kamiflow/.sync/.credentials`)

### Backup Recommendations

```bash
# Local backup
cp -r .kamiflow/archive .backup/archive-$(date +%Y%m%d)

# Remote backup (via sync)
kami sync-db push

# Database backup
cp .kamiflow/.sync/state.json .backup/
```

### API Key Rotation

```bash
# Generate new key
openssl rand -hex 32

# Update CLI
kami sync update-key

# Update backend .env
# Restart backend
```

---

## Troubleshooting

### Search Not Working

```bash
# Rebuild index
kami search --rebuild

# Check index stats
kami search --stats
```

### Sync Fails with "Not Configured"

```bash
# Re-run setup
kami sync setup
```

### Daemon Won't Start

```bash
# Check if already running
kami sync-db daemon-status

# Check logs
kami sync daemon-logs

# Kill stale process
rm .kamiflow/.sync/daemon.pid
```

### Conflicts Won't Resolve

```bash
# List conflicts
kami sync-db conflicts

# Force resolution
kami sync-db resolve <id> --strategy keep-local
```

### Backend Connection Issues

```bash
# Test connection
curl https://sync.yourdomain.com/health

# Check API key
kami sync-db status

# Update backend URL
# Edit .kamirc.json manually or re-run setup
kami sync-db setup
```

---

## Performance Tips

### Large Workspaces

- Index stats show total files and size
- Sync is incremental (only changes)
- Daemon batches changes (5-second window)

### Network Usage

- Average file size: ~5-50KB
- Compression: Content is base64-encoded
- Rate limiting: 100 requests per 15 minutes (backend default)

### Storage

- Local index: ~1MB per 1000 files
- Remote storage: ~50MB per 1000 files
- Conflict metadata: ~10KB per conflict

---

## Migration & Maintenance

### Moving to New Device

```bash
# On new device
git clone <your-project>
cd <project>
kami init

# Setup sync
kami sync-db setup
# Enter same backend URL and API key

# Download existing data
kami sync-db pull
```

### Clearing Local State

```bash
# Remove sync state (keeps files)
rm -rf .kamiflow/.sync/

# Re-setup
kami sync-db setup
```

### Backend Migration

1. Export from old backend (if available)
2. Setup new backend
3. Update `.kamirc.json` with new URL
4. Run `kami sync-db update-key`
5. Push all files: `kami sync-db push`

---

## API Reference

### Sync Configuration Schema

```typescript
{
  sync: {
    enabled: boolean;
    projectId: string;           // Auto-generated
    backend: string;             // Backend URL
    mode: "manual" | "auto";     // Sync mode
    categories: string[];        // Folders to sync
  },
  index: {
    dbPath: string;              // Database path
    autoRebuild: boolean;        // Auto-rebuild on init
  }
}
```

### Conflict Metadata Schema

```typescript
{
  id: string;                    // Conflict ID
  filePath: string;              // Relative path
  timestamp: number;             // When detected
  status: "unresolved" | "resolved";
  local: {
    content: string;
    checksum: string;
  },
  remote: {
    content: string;
    checksum: string;
  },
  base?: {                       // Base version (for 3-way merge)
    content: string;
    checksum: string;
  }
}
```

---

## FAQ

**Q: Does sync work offline?**
A: Yes, all operations work offline except push/pull.

**Q: Can I sync selective files?**
A: Configure `categories` in `.kamirc.json` to control which folders sync.

**Q: What happens if backend is down?**
A: Operations queue locally. Next sync will catch up.

**Q: Is data encrypted?**
A: Transport: Yes (HTTPS). At rest: Depends on backend setup.

**Q: Can multiple users share a backend?**
A: Yes, each project gets a unique `projectId`.

**Q: How do I delete all remote data?**
A: `kami sync-db delete-remote --confirm`

---

## Support

- **Issues**: https://github.com/kamishino/gemini-cli-workflow/issues
- **Backend Setup**: See `kamiflow-sync-backend/PORTAINER-SETUP.md`
- **Discussions**: https://github.com/kamishino/gemini-cli-workflow/discussions

---

## Version History

- **v1.0** - Phase 1: Local search
- **v1.1** - Phase 2: Manual sync
- **v1.2** - Phase 3: Auto-sync + conflicts

---

**Happy syncing! 🔄**

