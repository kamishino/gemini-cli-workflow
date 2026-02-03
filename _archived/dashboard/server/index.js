import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock data store (in production, this would connect to KamiFlow CLI)
let mockData = {
  stats: {
    totalTasks: 12,
    completedTasks: 8,
    activeTasks: 4,
    recentActivity: [
      { message: 'Task completed: User Authentication', timestamp: '2 hours ago' },
      { message: 'Plugin installed: GitHub Integration', timestamp: '5 hours ago' },
      { message: 'Configuration updated', timestamp: '1 day ago' }
    ]
  },
  config: {
    language: 'english',
    strategy: 'BALANCED',
    maxRetries: 3,
    gatedAutomation: true,
    executionMode: 'Implementer'
  },
  tasks: [
    {
      id: '042',
      title: 'User Authentication System',
      description: 'Implement OAuth2 authentication',
      status: 'completed',
      created: '2024-01-25'
    },
    {
      id: '043',
      title: 'API Rate Limiting',
      description: 'Add rate limiting middleware',
      status: 'active',
      created: '2024-01-28'
    },
    {
      id: '044',
      title: 'Database Migration',
      description: 'Migrate to PostgreSQL',
      status: 'active',
      created: '2024-01-29'
    }
  ],
  plugins: [],
  metrics: {
    cacheHitRate: 85,
    avgResponseTime: 42,
    performance: [
      { time: '00:00', responseTime: 45 },
      { time: '04:00', responseTime: 38 },
      { time: '08:00', responseTime: 52 },
      { time: '12:00', responseTime: 41 },
      { time: '16:00', responseTime: 39 },
      { time: '20:00', responseTime: 44 }
    ]
  }
};

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json(mockData.stats);
});

// Config endpoints
app.get('/api/config', (req, res) => {
  res.json(mockData.config);
});

app.post('/api/config', (req, res) => {
  mockData.config = { ...mockData.config, ...req.body };
  res.json({ success: true, config: mockData.config });
});

// Tasks endpoints
app.get('/api/tasks', (req, res) => {
  res.json(mockData.tasks);
});

app.get('/api/tasks/:id', (req, res) => {
  const task = mockData.tasks.find(t => t.id === req.params.id);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: String(mockData.tasks.length + 1).padStart(3, '0'),
    ...req.body,
    created: new Date().toISOString().split('T')[0]
  };
  mockData.tasks.push(newTask);
  res.status(201).json(newTask);
});

// Plugins endpoints
app.get('/api/plugins', (req, res) => {
  res.json(mockData.plugins);
});

app.post('/api/plugins/:name/install', (req, res) => {
  const plugin = {
    name: req.params.name,
    version: '1.0.0',
    description: 'Plugin description',
    enabled: true
  };
  mockData.plugins.push(plugin);
  res.json({ success: true, plugin });
});

app.delete('/api/plugins/:name', (req, res) => {
  mockData.plugins = mockData.plugins.filter(p => p.name !== req.params.name);
  res.json({ success: true });
});

app.patch('/api/plugins/:name/toggle', (req, res) => {
  const plugin = mockData.plugins.find(p => p.name === req.params.name);
  if (plugin) {
    plugin.enabled = !plugin.enabled;
    res.json({ success: true, plugin });
  } else {
    res.status(404).json({ error: 'Plugin not found' });
  }
});

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.json(mockData.metrics);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 KamiFlow Dashboard API running on http://localhost:${PORT}`);
});
