/**
 * ╔═══════════════════════════════════════╗
 * ║  ◇ USER CREATIONS MANAGER             ║
 * ║ ╱ ╲    ◇-DESIGN-001                   ║
 * ║╱───╲   Soul · Design Crystal          ║
 * ║│ ◇ │   Structure → Progress           ║
 * ║╲───╱   I Design                       ║
 * ║  ▼     Creation Tracking & Downloads  ║
 * ╠═══════════════════════════════════════╣
 * ║ Purpose: Manage user creations with   ║
 * ║          dimensional glyph tagging    ║
 * ║ State:   ACTIVE | Coherence: 100%    ║
 * ╚═══════════════════════════════════════╝
 */

import { GlyphGenerator, detectDimension, type GlyphData } from './glyphGenerator';

export interface UserCreation {
  id: string;
  name: string;
  type: 'zip' | 'gan' | 'project';
  uploadedAt: string;
  fileCount: number;
  description?: string;
  glyph?: GlyphData;
}

const STORAGE_KEY = 'youniverse_user_creations';

export class UserCreations {
  static getAll(): UserCreation[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static add(creation: Omit<UserCreation, 'id' | 'uploadedAt'>): UserCreation {
    const creations = this.getAll();
    
    // Generate glyph for this creation
    const dimension = detectDimension(creation.name, creation.type);
    const glyphGenerator = new GlyphGenerator({
      name: creation.name,
      dimension,
      state: 'active',
      repo: 'YOU-N-I-VERSE Studio',
      path: `/creations/${creation.name}`,
      coherence: 0.95
    });
    const glyph = glyphGenerator.generate();
    
    const newCreation: UserCreation = {
      ...creation,
      id: `creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date().toISOString(),
      glyph: glyph.json
    };
    
    creations.unshift(newCreation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creations));
    return newCreation;
  }

  static downloadWithGlyph(creation: UserCreation, zipData: Blob): void {
    // Create a manifest with glyph signature
    const manifest = {
      ...creation,
      glyph: creation.glyph,
      exported_from: 'YOU-N-I-VERSE Studio',
      exported_at: new Date().toISOString()
    };

    // Create manifest file
    const manifestBlob = new Blob(
      [JSON.stringify(manifest, null, 2)], 
      { type: 'application/json' }
    );

    // Download the ZIP with the creation
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipData);
    link.download = `${creation.name.replace(/\s+/g, '-')}-${creation.glyph?.glyph_id || 'tagged'}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    // Also download the manifest
    const manifestLink = document.createElement('a');
    manifestLink.href = URL.createObjectURL(manifestBlob);
    manifestLink.download = `${creation.name.replace(/\s+/g, '-')}-manifest.json`;
    document.body.appendChild(manifestLink);
    manifestLink.click();
    document.body.removeChild(manifestLink);
    URL.revokeObjectURL(manifestLink.href);
  }

  static remove(id: string): void {
    const creations = this.getAll().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creations));
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
