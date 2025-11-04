import { type LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  type: "game" | "tool" | "agent" | "core";
  entry: string;
  permissions: string[];
  author: string;
  signature?: string;
  icon?: string;
  description: string;
  riskScore?: number;
  approvedBy?: string;
  approvedAt?: string;
}

export interface AppModuleData {
  id: string;
  name: string;
  description: string;
  path: string;
  iconName: string;
  variant?: "primary" | "default";
  type: "core" | "game" | "tool" | "agent";
  author?: string;
  version?: string;
  manifest?: AppManifest;
}

export interface AppModule extends Omit<AppModuleData, 'iconName'> {
  icon: LucideIcon | string;
}

export class AppRegistry {
  private static STORAGE_KEY = 'indyverse-app-registry';
  private static APPROVALS_KEY = 'indyverse-approvals';

  static resolveIcon(iconName: string): LucideIcon | string {
    const icon = (LucideIcons as any)[iconName];
    return icon || iconName;
  }

  static getInstalledApps(): AppModule[] {
    try {
      const registry = localStorage.getItem(this.STORAGE_KEY);
      const data: AppModuleData[] = registry ? JSON.parse(registry) : [];
      
      return data.map(app => ({
        ...app,
        icon: this.resolveIcon(app.iconName)
      }));
    } catch (e) {
      console.error('Failed to load app registry:', e);
      return [];
    }
  }

  static installApp(appData: AppModuleData, skipValidation = false): boolean {
    try {
      if (!skipValidation && appData.manifest) {
        const validation = this.validateManifest(appData.manifest);
        if (!validation.valid) {
          console.error('Invalid manifest:', validation.errors);
          return false;
        }

        const riskScore = this.calculateRiskScore(appData.manifest);
        appData.manifest.riskScore = riskScore;

        if (riskScore > 0.7) {
          console.warn(`High risk app (${riskScore}):`, appData.name);
          return false;
        }
      }

      const apps = localStorage.getItem(this.STORAGE_KEY);
      const data: AppModuleData[] = apps ? JSON.parse(apps) : [];
      
      const existingIndex = data.findIndex(a => a.id === appData.id);
      if (existingIndex >= 0) {
        data[existingIndex] = appData;
      } else {
        data.push(appData);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

      if (appData.manifest) {
        this.recordApproval(appData.manifest, 'auto');
      }

      return true;
    } catch (e) {
      console.error('Failed to install app:', e);
      return false;
    }
  }

  static uninstallApp(appId: string): boolean {
    try {
      const registry = localStorage.getItem(this.STORAGE_KEY);
      const data: AppModuleData[] = registry ? JSON.parse(registry) : [];
      const filtered = data.filter(a => a.id !== appId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Failed to uninstall app:', e);
      return false;
    }
  }

  static validateManifest(manifest: Partial<AppManifest>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!manifest.id || typeof manifest.id !== 'string') {
      errors.push('Missing or invalid id');
    }
    if (!manifest.name || typeof manifest.name !== 'string') {
      errors.push('Missing or invalid name');
    }
    if (!manifest.version || typeof manifest.version !== 'string') {
      errors.push('Missing or invalid version');
    }
    if (!manifest.type || !['game', 'tool', 'agent', 'core'].includes(manifest.type)) {
      errors.push('Missing or invalid type');
    }
    if (!manifest.entry || typeof manifest.entry !== 'string') {
      errors.push('Missing or invalid entry point');
    }
    if (!Array.isArray(manifest.permissions)) {
      errors.push('Missing or invalid permissions array');
    }
    if (!manifest.author || typeof manifest.author !== 'string') {
      errors.push('Missing or invalid author');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static calculateRiskScore(manifest: AppManifest): number {
    let score = 0;

    if (!manifest.signature) score += 0.3;
    
    if (manifest.author === 'community') score += 0.2;
    else if (manifest.author === 'verified') score -= 0.1;

    const dangerousPermissions = ['eval', 'fetch', 'websocket', 'filesystem'];
    const requestedDangerous = manifest.permissions.filter(p => 
      dangerousPermissions.includes(p.toLowerCase())
    );
    score += requestedDangerous.length * 0.15;

    if (manifest.permissions.includes('storage')) score += 0.05;

    return Math.min(1, Math.max(0, score));
  }

  static recordApproval(manifest: AppManifest, approvedBy: string): void {
    try {
      const approvals = this.getApprovals();
      approvals.push({
        appId: manifest.id,
        appName: manifest.name,
        version: manifest.version,
        approvedBy,
        approvedAt: new Date().toISOString(),
        riskScore: manifest.riskScore || 0
      });
      localStorage.setItem(this.APPROVALS_KEY, JSON.stringify(approvals));
    } catch (e) {
      console.error('Failed to record approval:', e);
    }
  }

  static getApprovals(): Array<{
    appId: string;
    appName: string;
    version: string;
    approvedBy: string;
    approvedAt: string;
    riskScore: number;
  }> {
    try {
      const approvals = localStorage.getItem(this.APPROVALS_KEY);
      return approvals ? JSON.parse(approvals) : [];
    } catch (e) {
      console.error('Failed to load approvals:', e);
      return [];
    }
  }

  static getTrustedAuthors(): string[] {
    const approvals = this.getApprovals();
    const authors = new Set(
      approvals
        .filter(a => a.riskScore < 0.3)
        .map(a => a.appId.split('/')[0])
    );
    return Array.from(authors);
  }
}
