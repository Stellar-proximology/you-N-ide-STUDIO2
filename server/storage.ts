import type { IdeonSeed, WorldManifestation, StoredZip } from "../shared/schema";

// In-memory storage implementation
class MemStorage {
  private ideonSeeds: Map<string, IdeonSeed> = new Map();
  private worldManifestations: Map<string, WorldManifestation> = new Map();
  private zips: Map<string, StoredZip> = new Map();
  private zipContents: Map<string, Map<string, Buffer>> = new Map(); // zipId -> filePath -> content

  // Ideon Seeds
  async getIdeonSeedsByUser(userId: string): Promise<IdeonSeed[]> {
    return Array.from(this.ideonSeeds.values())
      .filter(seed => seed.userId === userId);
  }

  async getIdeonSeed(id: string): Promise<IdeonSeed | null> {
    return this.ideonSeeds.get(id) || null;
  }

  async createIdeonSeed(seed: Omit<IdeonSeed, 'id' | 'createdAt'>): Promise<IdeonSeed> {
    const id = crypto.randomUUID();
    const newSeed: IdeonSeed = {
      ...seed,
      id,
      createdAt: new Date(),
    };
    this.ideonSeeds.set(id, newSeed);
    return newSeed;
  }

  async updateIdeonSeed(id: string, updates: Partial<IdeonSeed>): Promise<IdeonSeed | null> {
    const existing = this.ideonSeeds.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.ideonSeeds.set(id, updated);
    return updated;
  }

  // World Manifestations
  async getWorldManifestationByIdeonId(ideonId: string): Promise<WorldManifestation | null> {
    return Array.from(this.worldManifestations.values())
      .find(world => world.ideonSeedId === ideonId) || null;
  }

  async createWorldManifestation(world: Omit<WorldManifestation, 'id' | 'createdAt'>): Promise<WorldManifestation> {
    const id = crypto.randomUUID();
    const newWorld: WorldManifestation = {
      ...world,
      id,
      createdAt: new Date(),
    };
    this.worldManifestations.set(id, newWorld);
    return newWorld;
  }

  // ZIP Files
  async getAllZips(): Promise<StoredZip[]> {
    return Array.from(this.zips.values());
  }

  async getZip(id: string): Promise<StoredZip | null> {
    return this.zips.get(id) || null;
  }

  async createZip(zip: Omit<StoredZip, 'id'>): Promise<StoredZip> {
    const id = crypto.randomUUID();
    const newZip: StoredZip = {
      ...zip,
      id,
    };
    this.zips.set(id, newZip);

    // Initialize empty content map for this zip
    this.zipContents.set(id, new Map());

    return newZip;
  }

  async deleteZip(id: string): Promise<boolean> {
    const deleted = this.zips.delete(id);
    this.zipContents.delete(id);
    return deleted;
  }

  async getZipFileContent(zipId: string, filePath: string): Promise<Buffer | null> {
    const zipContent = this.zipContents.get(zipId);
    if (!zipContent) return null;
    return zipContent.get(filePath) || null;
  }

  async setZipFileContent(zipId: string, filePath: string, content: Buffer): Promise<void> {
    let zipContent = this.zipContents.get(zipId);
    if (!zipContent) {
      zipContent = new Map();
      this.zipContents.set(zipId, zipContent);
    }
    zipContent.set(filePath, content);
  }

  async mergeZips(
    zipIds: string[],
    conflictResolutions: Record<string, 'first' | 'last' | 'rename'>
  ): Promise<StoredZip> {
    const zipsToMerge = zipIds.map(id => this.zips.get(id)).filter(Boolean) as StoredZip[];

    if (zipsToMerge.length === 0) {
      throw new Error("No valid zips found to merge");
    }

    // Create merged zip structure
    const mergedEntries = new Map<string, any>();
    const mergedContents = new Map<string, Buffer>();
    let totalSize = 0;
    let fileCount = 0;
    let directoryCount = 0;

    for (const zip of zipsToMerge) {
      const zipContent = this.zipContents.get(zip.id);

      for (const entry of zip.structure.entries) {
        const resolution = conflictResolutions[entry.path];

        if (!mergedEntries.has(entry.path) || resolution === 'last') {
          mergedEntries.set(entry.path, entry);

          if (!entry.isDirectory && zipContent) {
            const content = zipContent.get(entry.path);
            if (content) {
              mergedContents.set(entry.path, content);
            }
          }
        } else if (resolution === 'rename') {
          const renamedPath = `${entry.path}_${zip.id.slice(0, 8)}`;
          mergedEntries.set(renamedPath, { ...entry, path: renamedPath, name: `${entry.name}_${zip.id.slice(0, 8)}` });

          if (!entry.isDirectory && zipContent) {
            const content = zipContent.get(entry.path);
            if (content) {
              mergedContents.set(renamedPath, content);
            }
          }
        }
      }
    }

    // Calculate merged stats
    for (const entry of mergedEntries.values()) {
      if (entry.isDirectory) {
        directoryCount++;
      } else {
        fileCount++;
        totalSize += entry.size;
      }
    }

    const mergedZip = await this.createZip({
      filename: `merged_${Date.now()}.zip`,
      originalName: `Merged from ${zipIds.length} archives`,
      uploadDate: new Date().toISOString(),
      size: totalSize,
      objectPath: `merged/${Date.now()}`,
      structure: {
        entries: Array.from(mergedEntries.values()),
        totalSize,
        fileCount,
        directoryCount,
      },
      analysis: {
        description: `Merged archive from ${zipIds.length} sources`,
        projectType: "merged",
        technologies: [],
        confidence: 1.0,
      },
    });

    // Store merged contents
    const zipContentMap = this.zipContents.get(mergedZip.id);
    if (zipContentMap) {
      for (const [path, content] of mergedContents) {
        zipContentMap.set(path, content);
      }
    }

    return mergedZip;
  }
}

// Export singleton instance
export const storage = new MemStorage();
