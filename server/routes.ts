import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertSnapshotSchema, insertChatMessageSchema, insertModelProfileSchema, insertDesignerProfileSchema } from "@shared/schema";
import { generateTrivia, analyzeOutfit, generateCaption } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket setup for chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat') {
          // Save message to database
          const chatMessage = await storage.createChatMessage({
            userId: message.userId || null,
            username: message.username || 'Anonymous',
            contentType: message.contentType || 'text',
            content: message.content,
            payload: message.payload || null,
            roomId: message.roomId || 'main'
          });

          // Broadcast to all clients
          const broadcastMessage = JSON.stringify({
            type: 'chat',
            data: chatMessage
          });

          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastMessage);
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });
  });

  // API Routes

  // Snapshots
  app.get('/api/snapshots', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const snapshots = await storage.getSnapshots(limit);
      res.json(snapshots);
    } catch (error) {
      console.error('Error fetching snapshots:', error);
      res.status(500).json({ error: 'Failed to fetch snapshots' });
    }
  });

  app.post('/api/snapshots', async (req, res) => {
    try {
      const result = insertSnapshotSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Snapshot validation failed:", result.error);
        return res.status(400).json({ error: 'Invalid snapshot data', details: result.error });
      }

      const snapshot = await storage.createSnapshot(result.data);
      res.json(snapshot);
    } catch (error) {
      console.error('Error creating snapshot:', error);
      res.status(500).json({ error: 'Failed to create snapshot' });
    }
  });

  app.post('/api/snapshots/:id/share', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateSnapshotShareCount(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating share count:', error);
      res.status(500).json({ error: 'Failed to update share count' });
    }
  });

  // Models
  app.get('/api/models', async (req, res) => {
    try {
      const models = await storage.getModels();
      res.json(models);
    } catch (error) {
      console.error('Error fetching models:', error);
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  });

  app.post('/api/models', async (req, res) => {
    try {
      const result = insertModelProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid model data', details: result.error });
      }

      const model = await storage.createModel(result.data);
      res.json(model);
    } catch (error) {
      console.error('Error creating model:', error);
      res.status(500).json({ error: 'Failed to create model' });
    }
  });

  // Designers
  app.get('/api/designers', async (req, res) => {
    try {
      const designers = await storage.getDesigners();
      res.json(designers);
    } catch (error) {
      console.error('Error fetching designers:', error);
      res.status(500).json({ error: 'Failed to fetch designers' });
    }
  });

  app.post('/api/designers', async (req, res) => {
    try {
      const result = insertDesignerProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid designer data', details: result.error });
      }

      const designer = await storage.createDesigner(result.data);
      res.json(designer);
    } catch (error) {
      console.error('Error creating designer:', error);
      res.status(500).json({ error: 'Failed to create designer' });
    }
  });

  // Chat messages
  app.get('/api/chat/messages', async (req, res) => {
    try {
      const roomId = (req.query.roomId as string) || 'main';
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(roomId, limit);
      res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  });

  // AI Trivia generation
  app.post('/api/trivia/generate', async (req, res) => {
    try {
      const { modelName, designerName, context } = req.body;
      
      if (!modelName && !designerName) {
        return res.status(400).json({ error: 'Model name or designer name required' });
      }

      const trivia = await generateTrivia(modelName, designerName, context);
      res.json({ trivia });
    } catch (error) {
      console.error('Error generating trivia:', error);
      res.status(500).json({ error: 'Failed to generate trivia' });
    }
  });

  // Virtual try-on (FAL API integration placeholder)
  app.post('/api/try-on', async (req, res) => {
    try {
      const { imageUrl, outfitUrl } = req.body;
      
      if (!imageUrl || !outfitUrl) {
        return res.status(400).json({ error: 'Image URL and outfit URL required' });
      }

      // TODO: Integrate with FAL API for virtual try-on
      // For now, return a placeholder response
      const result = {
        success: true,
        resultUrl: imageUrl, // Placeholder - should be actual FAL API result
        processingTime: 2.5
      };

      res.json(result);
    } catch (error) {
      console.error('Error with virtual try-on:', error);
      res.status(500).json({ error: 'Virtual try-on failed' });
    }
  });

  // Social sharing endpoints
  app.post('/api/share/generate-hashtags', async (req, res) => {
    try {
      const { modelName, designerName, eventName } = req.body;
      
      const hashtags = [];
      if (modelName) hashtags.push(`#${modelName.replace(/\s+/g, '')}`);
      if (designerName) hashtags.push(`#${designerName.replace(/\s+/g, '')}`);
      if (eventName) hashtags.push(`#${eventName.replace(/\s+/g, '')}`);
      
      hashtags.push('#RunwayFashion', '#FashionStream', '#AIFashion');
      
      res.json({ hashtags });
    } catch (error) {
      console.error('Error generating hashtags:', error);
      res.status(500).json({ error: 'Failed to generate hashtags' });
    }
  });

  // AI Analysis endpoints
  app.post('/api/ai/analyze-frame', async (req, res) => {
    try {
      const { imageUrl } = req.body;
      
      // For demo purposes, we'll simulate the analysis
      // In production, you would convert the image URL to base64 and analyze
      const analysis = {
        description: "Elegant evening gown with intricate beadwork and flowing silhouette",
        style: "Haute Couture",
        colors: ["Deep Navy", "Silver", "Gold"],
        materials: ["Silk", "Beads", "Tulle"],
        modelName: "Sophia Chen",
        designerName: "Versace",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        modelId: 1, // Simulated ID
        designerId: 1 // Simulated ID
      };
      
      // Generate trivia based on the analysis
      const trivia = await generateTrivia(analysis.modelName, analysis.designerName, analysis.description);
      
      res.json({ analysis, trivia });
    } catch (error) {
      console.error('Error analyzing frame:', error);
      res.status(500).json({ error: 'Failed to analyze frame' });
    }
  });

  app.post('/api/ai/generate-caption', async (req, res) => {
    try {
      const { imageUrl, modelName, designerName } = req.body;
      
      const caption = await generateCaption(imageUrl, modelName, designerName);
      
      res.json({ caption });
    } catch (error) {
      console.error('Error generating caption:', error);
      res.status(500).json({ error: 'Failed to generate caption' });
    }
  });

  // Clip Generation Endpoint
  app.post('/api/clip/generate', async (req, res) => {
    try {
      const { streamTime, duration, modelName, designerName } = req.body;
      console.log(`Generating clip for ${streamTime} - ${duration} featuring ${modelName} by ${designerName}`);
      
      // Simulate clip generation by returning a placeholder URL
      const clipUrl = `https://example.com/clips/fashion_clip_${Date.now()}.mp4`;
      res.json({ clipUrl });
    } catch (error) {
      console.error('Error generating clip:', error);
      res.status(500).json({ error: 'Failed to generate clip' });
    }
  });

  // Virtual Try-On endpoints
  app.post('/api/virtual-tryon/generate', async (req, res) => {
    try {
      const { userImageUrl, garmentImageUrl } = req.body;
      
      // Simulate virtual try-on processing
      // In production, this would integrate with FAL API
      const tryOnResult = {
        resultImageUrl: `https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop&overlay=tryon`,
        processingTime: 2.3,
        confidence: 0.92
      };
      
      res.json(tryOnResult);
    } catch (error) {
      console.error('Error generating virtual try-on:', error);
      res.status(500).json({ error: 'Failed to generate virtual try-on' });
    }
  });

  // Stream session management
  app.get('/api/stream/current', async (req, res) => {
    try {
      const stream = await storage.getCurrentStream();
      res.json(stream);
    } catch (error) {
      console.error('Error fetching current stream:', error);
      res.status(500).json({ error: 'Failed to fetch current stream' });
    }
  });

  app.post('/api/stream/viewer-count', async (req, res) => {
    try {
      const { streamId, count } = req.body;
      await storage.updateStreamViewerCount(streamId, count);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating viewer count:', error);
      res.status(500).json({ error: 'Failed to update viewer count' });
    }
  });

  return httpServer;
}
