import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { uploadProjectToGoogleDrive, uploadFileToGoogleDrive, getUncachableGoogleDriveClient } from "./lib/googleDriveService";
import { createOrUpdateGitHubRepo } from "./lib/githubService";
import { importGitHubRepo } from "./lib/githubImportService";
import { deployToNetlify } from "./lib/netlifyService";
import { deployToVercel } from "./lib/vercelService";
import { orchestrateWorldGeneration, checkTokenAvailability, consumeToken } from "./services/world-orchestrator";
import { ConsciousnessCalibrator, ChartInterpreter, type BirthData } from "./services/chart-calculators";
import { generateLayeredConsciousnessVoice } from "./services/gan-integrations";
import { transitCache } from "./services/TransitCache";
import { growthProgramEngine } from "./services/GrowthProgramEngine";
import { getAllPrograms } from "../shared/growth-programs";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // ========== StoryForge World Generation API ==========
  
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "YOU-N-I-VERSE Studio API" });
  });

  app.get("/api/integrations/status", async (_req, res) => {
    const status = {
      googleDrive: {
        connected: false,
        message: "",
        account: "",
      },
    };

    try {
      const drive = await getUncachableGoogleDriveClient();
      const about = await drive.about.get({ fields: "user(displayName,emailAddress)" });
      status.googleDrive.connected = true;
      status.googleDrive.account = about.data.user?.emailAddress || about.data.user?.displayName || "linked";
    } catch (error: any) {
      status.googleDrive.connected = false;
      status.googleDrive.message = error.message || "Google Drive not connected";
    }

    res.json(status);
  });

  // ========== Transit & Growth Program API ==========
  
  // Get current transit summary (human-readable)
  app.get("/api/transits/summary", (_req, res) => {
    try {
      const summary = transitCache.getTransitSummary();
      res.json({ summary });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get transit summary" 
      });
    }
  });

  // Get raw transit data (all three projections)
  app.get("/api/transits/current", (_req, res) => {
    try {
      const transits = transitCache.getCurrentTransits();
      if (!transits) {
        return res.status(503).json({ error: "Transit data not yet available" });
      }
      res.json(transits);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get transits" 
      });
    }
  });

  // Get field vectors for a user (requires user chart signature)
  app.post("/api/transits/field-vectors", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string(),
        birthData: z.object({
          date: z.string().transform(str => new Date(str)),
          latitude: z.number(),
          longitude: z.number()
        }),
        fieldAssignments: z.record(z.object({
          chartType: z.enum(["Sidereal", "Tropical", "Draconic"]),
          sensitiveGates: z.array(z.number())
        })).optional(),
        resonanceHistory: z.record(z.number()).optional()
      });

      const userChart = schema.parse(req.body);
      
      // Apply defaults if not provided
      const fullChart = {
        ...userChart,
        fieldAssignments: userChart.fieldAssignments || {},
        resonanceHistory: userChart.resonanceHistory || {}
      };

      const fieldVectors = transitCache.getFieldVectors(fullChart as any);
      res.json({ fieldVectors });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to compute field vectors" 
      });
    }
  });

  // ========== Growth Program Engine API ==========

  // Get all available programs (metadata only)
  app.get("/api/programs/all", (_req, res) => {
    try {
      const programs = getAllPrograms();
      res.json({ programs });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get programs" 
      });
    }
  });

  // Get program suggestion in DEMO mode (no user data required)
  app.get("/api/programs/demo", (_req, res) => {
    try {
      const transits = transitCache.getCurrentTransits();
      if (!transits) {
        return res.status(503).json({ error: "Transit data not yet available" });
      }

      console.log("[DEBUG] Transits fetched successfully");

      // Create demo user profile with default resonance
      const demoFieldVectors = transitCache.getFieldVectors({
        userId: "demo",
        birthData: {
          date: new Date("1990-01-01"), // Default birth date
          latitude: 0,
          longitude: 0
        },
        fieldAssignments: {
          Mind: { chartType: "Sidereal" as const, sensitiveGates: [] },
          Ajna: { chartType: "Sidereal" as const, sensitiveGates: [] },
          ThroatExpression: { chartType: "Tropical" as const, sensitiveGates: [] },
          SolarIdentity: { chartType: "Draconic" as const, sensitiveGates: [] },
          Will: { chartType: "Tropical" as const, sensitiveGates: [] },
          SacralLife: { chartType: "Tropical" as const, sensitiveGates: [] },
          Emotions: { chartType: "Draconic" as const, sensitiveGates: [] },
          Instinct: { chartType: "Sidereal" as const, sensitiveGates: [] },
          Root: { chartType: "Tropical" as const, sensitiveGates: [] }
        },
        resonanceHistory: {
          Mind: 0.5,
          Ajna: 0.5,
          ThroatExpression: 0.5,
          SolarIdentity: 0.5,
          Will: 0.5,
          SacralLife: 0.5,
          Emotions: 0.5,
          Instinct: 0.5,
          Root: 0.5
        }
      });

      console.log("[DEBUG] Field vectors computed:", demoFieldVectors.length);

      const directive = growthProgramEngine.getWorkspaceDirective(
        demoFieldVectors,
        transits.projections
      );

      console.log("[DEBUG] Directive generated successfully");

      res.json({ directive, note: "Demo mode - using default user profile" });
    } catch (error) {
      console.error("[ERROR] Demo endpoint failed:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get demo suggestion",
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // Get workspace directive recommendation
  app.post("/api/programs/suggest", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string(),
        birthData: z.object({
          date: z.string().transform(str => new Date(str)),
          latitude: z.number(),
          longitude: z.number()
        }),
        fieldAssignments: z.record(z.object({
          chartType: z.enum(["Sidereal", "Tropical", "Draconic"]),
          sensitiveGates: z.array(z.number())
        })).optional(),
        resonanceHistory: z.record(z.number()).optional()
      });

      const userChart = schema.parse(req.body);
      
      // Apply defaults
      const fullChart = {
        ...userChart,
        fieldAssignments: userChart.fieldAssignments || {},
        resonanceHistory: userChart.resonanceHistory || {}
      };

      // Get current transits
      const transits = transitCache.getCurrentTransits();
      if (!transits) {
        return res.status(503).json({ error: "Transit data not yet available" });
      }

      // Get field vectors
      const fieldVectors = transitCache.getFieldVectors(fullChart as any);

      // Get workspace directive
      const directive = growthProgramEngine.getWorkspaceDirective(
        fieldVectors,
        transits.projections
      );

      res.json({ directive });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get program suggestion" 
      });
    }
  });

  // Get detailed program activations (for debugging/advanced UI)
  app.post("/api/programs/activations", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string(),
        birthData: z.object({
          date: z.string().transform(str => new Date(str)),
          latitude: z.number(),
          longitude: z.number()
        }),
        fieldAssignments: z.record(z.object({
          chartType: z.enum(["Sidereal", "Tropical", "Draconic"]),
          sensitiveGates: z.array(z.number())
        })).optional(),
        resonanceHistory: z.record(z.number()).optional()
      });

      const userChart = schema.parse(req.body);
      
      const fullChart = {
        ...userChart,
        fieldAssignments: userChart.fieldAssignments || {},
        resonanceHistory: userChart.resonanceHistory || {}
      };

      const transits = transitCache.getCurrentTransits();
      if (!transits) {
        return res.status(503).json({ error: "Transit data not yet available" });
      }

      const fieldVectors = transitCache.getFieldVectors(fullChart as any);

      const activations = growthProgramEngine.getProgramActivations(
        fieldVectors,
        transits.projections
      );

      res.json({ activations });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get program activations" 
      });
    }
  });

  // Token status - check available tokens for current month
  app.get("/api/tokens/status", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      
      const tokenStatus = await checkTokenAvailability(userId);
      res.json(tokenStatus);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to check token status" 
      });
    }
  });

  // Create new ideon (generate world from text)
  app.post("/api/ideons", async (req, res) => {
    try {
      const createSchema = z.object({
        userId: z.string(),
        rawText: z.string().min(1),
      });
      
      const { userId, rawText } = createSchema.parse(req.body);
      
      // Check token availability
      const { available } = await checkTokenAvailability(userId);
      if (!available) {
        return res.status(403).json({ 
          error: "No tokens available for this month. You receive 5 tokens per month." 
        });
      }
      
      // Consume a token
      const consumed = await consumeToken(userId);
      if (!consumed) {
        return res.status(403).json({ 
          error: "Failed to consume token. Please try again." 
        });
      }
      
      // Orchestrate world generation
      const result = await orchestrateWorldGeneration(userId, rawText);
      
      res.json({
        success: true,
        ideonSeed: result.ideonSeed,
        worldManifestation: result.worldManifestation,
        processingTime: result.processingTime,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate world" 
      });
    }
  });

  // Get all ideons for a user
  app.get("/api/ideons", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      
      const ideons = await storage.getIdeonSeedsByUser(userId);
      res.json(ideons);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch ideons" 
      });
    }
  });

  // Get specific ideon by ID
  app.get("/api/ideons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const ideon = await storage.getIdeonSeed(id);
      
      if (!ideon) {
        return res.status(404).json({ error: "Ideon not found" });
      }
      
      res.json(ideon);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch ideon" 
      });
    }
  });

  // Get world manifestation by ideon ID
  app.get("/api/worlds/:ideonId", async (req, res) => {
    try {
      const { ideonId } = req.params;
      const world = await storage.getWorldManifestationByIdeonId(ideonId);
      
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }
      
      res.json(world);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch world" 
      });
    }
  });

  // ========== Deployment & Export API ==========
  
  // Google Drive export endpoint
  app.post("/api/export/google-drive", async (req, res) => {
    try {
      const { projectName, files } = req.body;

      if (!projectName || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const result = await uploadProjectToGoogleDrive(projectName, files);

      res.json({
        success: true,
        folderUrl: result.folder.webViewLink,
        folderName: result.folder.name,
        fileCount: result.files.length,
      });
    } catch (error: any) {
      console.error("Google Drive export error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to export to Google Drive",
        notConnected: error.message?.includes('not connected')
      });
    }
  });

  // GitHub push endpoint
  app.post("/api/push/github", async (req, res) => {
    try {
      const { repoName, files, description } = req.body;

      if (!repoName || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const result = await createOrUpdateGitHubRepo(repoName, files, description);

      res.json({
        success: true,
        url: result.url,
        username: result.username,
        repoName: result.repoName,
      });
    } catch (error: any) {
      console.error("GitHub push error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to push to GitHub",
        notConnected: error.message?.includes('not connected')
      });
    }
  });

  // GitHub import endpoint
  app.post("/api/import/github", async (req, res) => {
    try {
      const { repoUrl } = req.body;

      if (!repoUrl) {
        return res.status(400).json({ error: "Repository URL is required" });
      }

      const result = await importGitHubRepo(repoUrl);

      res.json({
        success: true,
        repoName: result.repoName,
        owner: result.owner,
        zipData: result.zipData.toString('base64'),
      });
    } catch (error: any) {
      console.error("GitHub import error:", error);
      res.status(500).json({ 
        message: error.message || "Failed to import from GitHub"
      });
    }
  });

  // Netlify deployment endpoint
  app.post("/api/deploy/netlify", async (req, res) => {
    try {
      const { apiKey, files, siteName } = req.body;

      if (!apiKey || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const result = await deployToNetlify(apiKey, files, siteName);

      res.json({
        success: true,
        url: result.url,
        deployId: result.deployId,
        siteId: result.siteId,
      });
    } catch (error: any) {
      console.error("Netlify deployment error:", error);
      res.status(500).json({
        error: error.message || "Failed to deploy to Netlify"
      });
    }
  });

  app.post("/api/deploy/vercel", async (req, res) => {
    try {
      const { token, files, projectName } = req.body;

      if (!token || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Invalid request body" });
      }

      const result = await deployToVercel(token, files, projectName);

      res.json({
        success: true,
        url: result.url,
        deploymentId: result.deploymentId,
        inspectUrl: result.inspectUrl,
      });
    } catch (error: any) {
      console.error("Vercel deployment error:", error);
      res.status(500).json({
        error: error.message || "Failed to deploy to Vercel"
      });
    }
  });

  // ========== ZIP Archive Management API ==========
  
  // Get all ZIPs
  app.get("/api/zips", async (_req, res) => {
    try {
      const zips = await storage.getAllZips();
      res.json(zips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ZIP archives" });
    }
  });

  // Get single ZIP
  app.get("/api/zips/:id", async (req, res) => {
    try {
      const zip = await storage.getZip(req.params.id);
      if (!zip) {
        return res.status(404).json({ error: "ZIP not found" });
      }
      res.json(zip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ZIP" });
    }
  });

  // Create ZIP record (simplified - without actual object storage)
  app.post("/api/zips", async (req, res) => {
    try {
      const { filename, objectPath, size } = req.body;
      
      const zip = await storage.createZip({
        filename,
        originalName: filename,
        uploadDate: new Date().toISOString(),
        size,
        objectPath,
        structure: {
          entries: [],
          totalSize: size,
          fileCount: 0,
          directoryCount: 0,
        },
        analysis: {
          description: "Archive uploaded",
          projectType: "unknown",
          technologies: [],
          confidence: 0.5,
        },
      });

      res.json({ id: zip.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create ZIP record" });
    }
  });

  // Delete ZIP
  app.delete("/api/zips/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteZip(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "ZIP not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ZIP" });
    }
  });

  // Get entry file for ZIP (auto-detect index.html or main HTML file)
  app.get("/api/zips/:id/entry-file", async (req, res) => {
    try {
      const zip = await storage.getZip(req.params.id);
      if (!zip) {
        return res.status(404).json({ error: "ZIP not found" });
      }

      // Find entry file - prioritize index.html, then any HTML file
      const htmlFiles = zip.structure.entries
        .filter(e => e.type === 'file' && (e.name.endsWith('.html') || e.name.endsWith('.htm')))
        .map(e => e.path);

      const entryFile = htmlFiles.find(f => f.includes('index.html')) || htmlFiles[0] || null;

      res.json({ entryFile });
    } catch (error) {
      res.status(500).json({ error: "Failed to detect entry file" });
    }
  });

  // Serve files from ZIP for playback
  app.get("/api/zips/:id/play/:filePath(*)", async (req, res) => {
    try {
      const zip = await storage.getZip(req.params.id);
      if (!zip) {
        return res.status(404).json({ error: "ZIP not found" });
      }

      const filePath = req.params.filePath;
      const entry = zip.structure.entries.find(e => e.path === filePath);
      
      if (!entry || entry.type !== 'file') {
        return res.status(404).send('File not found in archive');
      }

      // Since we're using in-memory storage, get the file content
      const content = await storage.getZipFileContent(zip.id, filePath);
      
      // Set content type based on file extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      const contentTypes: Record<string, string> = {
        'html': 'text/html',
        'htm': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'txt': 'text/plain',
      };

      res.setHeader('Content-Type', contentTypes[ext || ''] || 'application/octet-stream');
      res.send(content);
    } catch (error) {
      res.status(500).send('Failed to serve file');
    }
  });

  // Merge/stitch multiple ZIPs
  app.post("/api/zips/merge", async (req, res) => {
    try {
      const { zipIds, conflictResolutions } = req.body;

      if (!zipIds || !Array.isArray(zipIds) || zipIds.length < 2) {
        return res.status(400).json({ error: "At least 2 ZIP IDs required" });
      }

      const result = await storage.mergeZips(zipIds, conflictResolutions || {});
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to merge ZIPs" });
    }
  });

  // ========== Consciousness Calibration API ==========
  
  // Calculate all 7 charts and get ERN calibration data
  app.post("/api/consciousness/calibrate", async (req, res) => {
    try {
      const calibrateSchema = z.object({
        datetime: z.string().transform(str => new Date(str)),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        timezone: z.string(),
        withVoice: z.boolean().optional().default(false),
        withLLMInterpretation: z.boolean().optional().default(false),
      });
      
      const birthData: BirthData = calibrateSchema.parse(req.body);
      
      // Calculate all 7 charts
      const allSeeds = ConsciousnessCalibrator.calibrateAll(birthData);
      
      // Merge into unified oscillator seeds
      const mergedSeeds = ConsciousnessCalibrator.mergeSeeds(allSeeds);
      
      let interpretation = null;
      let voiceReadings = null;
      
      // Optional: Generate LLM interpretation
      if (req.body.withLLMInterpretation) {
        try {
          interpretation = await ChartInterpreter.interpretCharts(allSeeds, birthData);
          
          // Optional: Generate voice readings
          if (req.body.withVoice && interpretation?.layerInsights) {
            voiceReadings = await generateLayeredConsciousnessVoice(interpretation.layerInsights);
          }
        } catch (error) {
          console.error('Interpretation error:', error);
          // Continue without interpretation if it fails
        }
      }
      
      res.json({
        success: true,
        charts: allSeeds,
        oscillatorSeeds: mergedSeeds,
        interpretation,
        voiceReadings,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid birth data", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to calibrate consciousness" 
      });
    }
  });
  
  // Quick natal chart calculation (single layer)
  app.post("/api/consciousness/natal", async (req, res) => {
    try {
      const birthDataSchema = z.object({
        datetime: z.string().transform(str => new Date(str)),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        timezone: z.string(),
      });
      
      const birthData: BirthData = birthDataSchema.parse(req.body);
      
      // Import the calculator
      const { NatalChartCalculator } = await import("./services/chart-calculators");
      const natalChart = NatalChartCalculator.calculate(birthData);
      
      res.json({
        success: true,
        chart: natalChart,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid birth data", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to calculate natal chart" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
