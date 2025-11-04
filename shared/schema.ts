import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Token ledger - tracks monthly token allowances
export const tokenLedger = pgTable("token_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  month: text("month").notNull(), // Format: "YYYY-MM"
  tokensRemaining: integer("tokens_remaining").notNull().default(5),
  tokensUsed: integer("tokens_used").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTokenLedgerSchema = createInsertSchema(tokenLedger).omit({
  id: true,
  createdAt: true,
});

export type InsertTokenLedger = z.infer<typeof insertTokenLedgerSchema>;
export type TokenLedger = typeof tokenLedger.$inferSelect;

// Ideon Seeds - player input and parsed semantic structure
export const ideonSeeds = pgTable("ideon_seeds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rawText: text("raw_text").notNull(),
  
  // Semantic layers (5 conscious layers)
  movement: jsonb("movement"), // Individuality - "I Define" - Activity, Uniqueness
  evolution: jsonb("evolution"), // Mind - "I Remember" - Character, Role
  being: jsonb("being"), // Body - "I Am" - Biology, Genetics
  design: jsonb("design"), // Ego - "I Design" - Growth, Self
  space: jsonb("space"), // Personality - "I Think" - Type, Presence
  
  // Meta layers (latent)
  transpersonal: jsonb("transpersonal"), // Archetypal patterns
  void: jsonb("void"), // Pure potential, noise vectors
  
  // Symbolic parsing
  symbolicStructure: jsonb("symbolic_structure"), // Parsed punctuation operators
  
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertIdeonSeedSchema = createInsertSchema(ideonSeeds).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertIdeonSeed = z.infer<typeof insertIdeonSeedSchema>;
export type IdeonSeed = typeof ideonSeeds.$inferSelect;

// World Manifestations - generated outputs from GANs
export const worldManifestations = pgTable("world_manifestations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideonSeedId: varchar("ideon_seed_id").notNull().references(() => ideonSeeds.id),
  
  // Generated narrative/description
  narrative: text("narrative"),
  
  // World attributes derived from semantic layers
  worldAttributes: jsonb("world_attributes"), // Physical rules, tone, mood, etc.
  
  // GAN outputs
  semanticGanResult: jsonb("semantic_gan_result"), // Image URLs, style vectors
  videoGanResult: jsonb("video_gan_result"), // Animation URLs, temporal data
  
  // Discriminator feedback (the "felt sense")
  coherenceScore: integer("coherence_score"), // 0-100
  resonanceScore: integer("resonance_score"), // 0-100
  beautyScore: integer("beauty_score"), // 0-100
  
  // Reflection data
  reflectionNotes: text("reflection_notes"), // What the observer understood
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWorldManifestationSchema = createInsertSchema(worldManifestations).omit({
  id: true,
  createdAt: true,
});

export type InsertWorldManifestation = z.infer<typeof insertWorldManifestationSchema>;
export type WorldManifestation = typeof worldManifestations.$inferSelect;

// ZIP Archive Types (in-memory storage)
export interface ZipFileEntry {
  path: string;
  name: string;
  isDirectory: boolean;
  size: number;
  type?: string;
}

export interface ZipFileStructure {
  entries: ZipFileEntry[];
  totalSize: number;
  fileCount: number;
  directoryCount: number;
}

export interface AIAnalysis {
  description: string;
  projectType: string;
  technologies: string[];
  framework?: string;
  confidence: number;
}

export interface StoredZip {
  id: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  size: number;
  objectPath: string;
  structure: ZipFileStructure;
  analysis: AIAnalysis;
}

export interface ExternalSource {
  type: 'github' | 'dropbox' | 'drive';
  name: string;
  url?: string;
  path?: string;
}

export interface StitchConflict {
  path: string;
  sources: string[];
}

export interface MergedZipRequest {
  zipIds: string[];
  conflictResolutions: Record<string, 'first' | 'last' | 'rename'>;
}

export const zipUploadSchema = z.object({
  filename: z.string(),
  objectPath: z.string(),
  size: z.number(),
});

export const zipAnalysisSchema = z.object({
  zipId: z.string(),
});

export const mergeZipsSchema = z.object({
  zipIds: z.array(z.string()),
  conflictResolutions: z.record(z.enum(['first', 'last', 'rename'])),
});

export type ZipUpload = z.infer<typeof zipUploadSchema>;
export type ZipAnalysis = z.infer<typeof zipAnalysisSchema>;
export type MergeZips = z.infer<typeof mergeZipsSchema>;

// User Profile for Growth Program Engine
import type { FieldName, ChartType } from "./transit-system";

export interface UserProfile {
  id: string;
  birthData: {
    date: string;           // ISO date string
    time: string;           // "HH:MM" format
    location: string;       // City name for display
    latitude: number;
    longitude: number;
    timezone: string;       // IANA timezone (e.g., "America/New_York")
  };
  fieldAssignments: {
    [K in FieldName]: {
      chartType: ChartType;
      sensitiveGates: number[];  // Gates 1-64 user is responsive to
    };
  };
  resonanceHistory: {
    [K in FieldName]: number;    // 0.0-1.0: Running average of engagement
  };
  preferences: {
    autoActivatePrograms: boolean;
    notificationsEnabled: boolean;
    defaultView: 'simple' | 'advanced';
  };
  createdAt: string;
  updatedAt: string;
}

export const userProfileSchema = z.object({
  id: z.string(),
  birthData: z.object({
    date: z.string(),
    time: z.string(),
    location: z.string(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    timezone: z.string(),
  }),
  fieldAssignments: z.record(z.object({
    chartType: z.enum(["Sidereal", "Tropical", "Draconic"]),
    sensitiveGates: z.array(z.number().min(1).max(64)),
  })),
  resonanceHistory: z.record(z.number().min(0).max(1)),
  preferences: z.object({
    autoActivatePrograms: z.boolean(),
    notificationsEnabled: z.boolean(),
    defaultView: z.enum(['simple', 'advanced']),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type InsertUserProfile = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;
