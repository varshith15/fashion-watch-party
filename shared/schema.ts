import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const snapshots = pgTable("snapshots", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  modelId: integer("model_id"),
  designerId: integer("designer_id"),
  tags: text("tags").array(),
  shareCount: integer("share_count").default(0),
  streamTime: text("stream_time"),
  metadata: jsonb("metadata"),
});

export const modelProfiles = pgTable("model_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  agency: text("agency"),
  experience: text("experience"),
  stats: text("stats"),
  profileImageUrl: text("profile_image_url"),
  faceEmbedding: text("face_embedding"),
  runwayHistory: jsonb("runway_history"),
});

export const designerProfiles = pgTable("designer_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  hashtags: text("hashtags").array(),
  collections: jsonb("collections"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  username: text("username").notNull(),
  contentType: text("content_type").notNull().default("text"), // text, snapshot, try-on
  content: text("content").notNull(),
  payload: jsonb("payload"), // for snapshot/try-on data
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  roomId: text("room_id").notNull().default("main"),
});

export const streamSessions = pgTable("stream_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  isLive: boolean("is_live").default(true),
  viewerCount: integer("viewer_count").default(0),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  metadata: jsonb("metadata"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSnapshotSchema = createInsertSchema(snapshots).omit({
  id: true,
  timestamp: true,
  shareCount: true,
});

export const insertModelProfileSchema = createInsertSchema(modelProfiles).omit({
  id: true,
});

export const insertDesignerProfileSchema = createInsertSchema(designerProfiles).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertStreamSessionSchema = createInsertSchema(streamSessions).omit({
  id: true,
  startTime: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Snapshot = typeof snapshots.$inferSelect;
export type InsertSnapshot = z.infer<typeof insertSnapshotSchema>;

export type ModelProfile = typeof modelProfiles.$inferSelect;
export type InsertModelProfile = z.infer<typeof insertModelProfileSchema>;

export type DesignerProfile = typeof designerProfiles.$inferSelect;
export type InsertDesignerProfile = z.infer<typeof insertDesignerProfileSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type StreamSession = typeof streamSessions.$inferSelect;
export type InsertStreamSession = z.infer<typeof insertStreamSessionSchema>;
