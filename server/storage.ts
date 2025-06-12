import { 
  users, snapshots, modelProfiles, designerProfiles, chatMessages, streamSessions,
  type User, type InsertUser, type Snapshot, type InsertSnapshot,
  type ModelProfile, type InsertModelProfile, type DesignerProfile, type InsertDesignerProfile,
  type ChatMessage, type InsertChatMessage, type StreamSession, type InsertStreamSession
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Snapshots
  getSnapshots(limit?: number): Promise<Snapshot[]>;
  getSnapshot(id: number): Promise<Snapshot | undefined>;
  createSnapshot(snapshot: InsertSnapshot): Promise<Snapshot>;
  updateSnapshotShareCount(id: number): Promise<void>;

  // Models
  getModels(): Promise<ModelProfile[]>;
  getModel(id: number): Promise<ModelProfile | undefined>;
  createModel(model: InsertModelProfile): Promise<ModelProfile>;
  getModelByName(name: string): Promise<ModelProfile | undefined>;

  // Designers
  getDesigners(): Promise<DesignerProfile[]>;
  getDesigner(id: number): Promise<DesignerProfile | undefined>;
  createDesigner(designer: InsertDesignerProfile): Promise<DesignerProfile>;
  getDesignerByName(name: string): Promise<DesignerProfile | undefined>;

  // Chat
  getChatMessages(roomId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Stream Sessions
  getCurrentStream(): Promise<StreamSession | undefined>;
  createStreamSession(session: InsertStreamSession): Promise<StreamSession>;
  updateStreamViewerCount(id: number, count: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getSnapshots(limit: number = 20): Promise<Snapshot[]> {
    return await db
      .select()
      .from(snapshots)
      .orderBy(desc(snapshots.timestamp))
      .limit(limit);
  }

  async getSnapshot(id: number): Promise<Snapshot | undefined> {
    const [snapshot] = await db.select().from(snapshots).where(eq(snapshots.id, id));
    return snapshot || undefined;
  }

  async createSnapshot(insertSnapshot: InsertSnapshot): Promise<Snapshot> {
    const [snapshot] = await db
      .insert(snapshots)
      .values(insertSnapshot)
      .returning();
    return snapshot;
  }

  async updateSnapshotShareCount(id: number): Promise<void> {
    await db
      .update(snapshots)
      .set({ shareCount: sql`COALESCE(${snapshots.shareCount}, 0) + 1` })
      .where(eq(snapshots.id, id));
  }

  async getModels(): Promise<ModelProfile[]> {
    return await db.select().from(modelProfiles);
  }

  async getModel(id: number): Promise<ModelProfile | undefined> {
    const [model] = await db.select().from(modelProfiles).where(eq(modelProfiles.id, id));
    return model || undefined;
  }

  async createModel(insertModel: InsertModelProfile): Promise<ModelProfile> {
    const [model] = await db
      .insert(modelProfiles)
      .values(insertModel)
      .returning();
    return model;
  }

  async getModelByName(name: string): Promise<ModelProfile | undefined> {
    const [model] = await db.select().from(modelProfiles).where(eq(modelProfiles.name, name));
    return model || undefined;
  }

  async getDesigners(): Promise<DesignerProfile[]> {
    return await db.select().from(designerProfiles);
  }

  async getDesigner(id: number): Promise<DesignerProfile | undefined> {
    const [designer] = await db.select().from(designerProfiles).where(eq(designerProfiles.id, id));
    return designer || undefined;
  }

  async createDesigner(insertDesigner: InsertDesignerProfile): Promise<DesignerProfile> {
    const [designer] = await db
      .insert(designerProfiles)
      .values(insertDesigner)
      .returning();
    return designer;
  }

  async getDesignerByName(name: string): Promise<DesignerProfile | undefined> {
    const [designer] = await db.select().from(designerProfiles).where(eq(designerProfiles.name, name));
    return designer || undefined;
  }

  async getChatMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getCurrentStream(): Promise<StreamSession | undefined> {
    const [stream] = await db
      .select()
      .from(streamSessions)
      .where(eq(streamSessions.isLive, true))
      .orderBy(desc(streamSessions.startTime))
      .limit(1);
    return stream || undefined;
  }

  async createStreamSession(insertSession: InsertStreamSession): Promise<StreamSession> {
    const [session] = await db
      .insert(streamSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateStreamViewerCount(id: number, count: number): Promise<void> {
    await db
      .update(streamSessions)
      .set({ viewerCount: count })
      .where(eq(streamSessions.id, id));
  }
}

export const storage = new DatabaseStorage();
