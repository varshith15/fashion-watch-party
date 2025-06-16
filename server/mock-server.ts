import express from 'express';
import cors from 'cors';
import designersData from '../client/src/data/designers.json';

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
const mockSnapshots = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=600&fit=crop",
    timestamp: new Date().toISOString(),
    modelId: 1,
    designerId: 1,
    tags: ["evening", "couture"],
    shareCount: 12,
    streamTime: "2:30",
    metadata: { model: "Sophia Chen", designer: "Versace" }
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    modelId: 2,
    designerId: 2,
    tags: ["casual", "street"],
    shareCount: 8,
    streamTime: "1:45",
    metadata: { model: "Emma Rodriguez", designer: "Gucci" }
  }
];

const mockModels = [
  {
    id: 1,
    name: "Sophia Chen",
    agency: "Elite Model Management",
    experience: "5 years",
    stats: "Milan Fashion Week veteran • 127 shows",
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Emma Rodriguez",
    agency: "IMG Models",
    experience: "3 years",
    stats: "Rising star • 89 shows",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b332e234?w=100&h=100&fit=crop&crop=face"
  }
];

const mockChatMessages = [
  {
    id: 1,
    username: "FashionLover",
    contentType: "text",
    content: "This collection is absolutely stunning! 🔥",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    roomId: "main"
  },
  {
    id: 2,
    username: "StyleCritic",
    contentType: "text", 
    content: "The attention to detail in that beadwork is incredible",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    roomId: "main"
  }
];

// API Routes
app.get('/api/snapshots', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  res.json(mockSnapshots.slice(0, limit));
});

app.post('/api/snapshots', (req, res) => {
  const newSnapshot = {
    id: mockSnapshots.length + 1,
    ...req.body,
    timestamp: new Date().toISOString()
  };
  mockSnapshots.unshift(newSnapshot);
  res.json(newSnapshot);
});

app.post('/api/snapshots/:id/share', (req, res) => {
  const id = parseInt(req.params.id);
  const snapshot = mockSnapshots.find(s => s.id === id);
  if (snapshot) {
    snapshot.shareCount++;
  }
  res.json({ success: true });
});

app.get('/api/models', (req, res) => {
  res.json(mockModels);
});

app.post('/api/models', (req, res) => {
  const newModel = { id: mockModels.length + 1, ...req.body };
  mockModels.push(newModel);
  res.json(newModel);
});

app.get('/api/designers', (req, res) => {
  res.json(designersData);
});

app.post('/api/designers', (req, res) => {
  const newDesigner = { id: designersData.length + 1, ...req.body };
  res.json(newDesigner);
});

app.get('/api/chat/messages', (req, res) => {
  res.json(mockChatMessages);
});

app.post('/api/trivia/generate', (req, res) => {
  const trivia = [
    "This Versace piece features hand-embroidered Italian lace, taking over 200 hours to complete.",
    "The silhouette pays homage to 1960s couture with modern architectural elements.",
    "Each bead is individually placed using a technique passed down through generations.",
    "This collection draws inspiration from Mediterranean coastlines and ancient Greek architecture."
  ];
  
  res.json({ 
    trivia: trivia[Math.floor(Math.random() * trivia.length)]
  });
});

app.post('/api/ai/analyze-frame', (req, res) => {
  const analysis = {
    description: "Elegant evening gown with intricate beadwork and flowing silhouette",
    style: "Haute Couture",
    colors: ["Deep Navy", "Silver", "Gold"],
    materials: ["Silk", "Beads", "Tulle"],
    modelName: mockModels[Math.floor(Math.random() * mockModels.length)].name,
    designerName: designersData[Math.floor(Math.random() * designersData.length)].name,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    modelId: 1,
    designerId: 1
  };
  
  const trivia = "This stunning piece showcases the perfect blend of traditional craftsmanship and modern design innovation.";
  
  res.json({ analysis, trivia });
});

app.post('/api/ai/generate-caption', (req, res) => {
  res.json({ 
    caption: "Stunning runway moment captured! ✨ Fashion meets artistry in this incredible design."
  });
});

app.post('/api/share/generate-hashtags', (req, res) => {
  res.json({ 
    hashtags: ['#RunwayFashion', '#FashionStream', '#AIFashion', '#MilanFashionWeek', '#SS2024']
  });
});

app.post('/api/virtual-tryon/generate', (req, res) => {
  res.json({
    resultImageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop&overlay=tryon",
    processingTime: 2.3,
    confidence: 0.92
  });
});

app.get('/api/stream/current', (req, res) => {
  res.json({
    id: 1,
    title: "Milan Fashion Week 2024 - Live",
    description: "Spring/Summer 2024 Collections",
    isLive: true,
    viewerCount: 1247,
    startTime: new Date().toISOString()
  });
});

app.post('/api/stream/viewer-count', (req, res) => {
  res.json({ success: true });
});

// Catch all other routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
}); 