import type { UserProfile } from "@shared/schema";
import { FIELD_CHART_MAPPING, type FieldName } from "@shared/transit-system";
import { nanoid } from "nanoid";

const PROFILE_STORAGE_KEY = "you-n-i-verse:user-profile";

export class UserProfileService {
  static getProfile(): UserProfile | null {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!stored) return null;
      
      const profile = JSON.parse(stored) as UserProfile;
      return profile;
    } catch (error) {
      console.error("Failed to load user profile:", error);
      return null;
    }
  }

  static saveProfile(profile: Partial<UserProfile>): UserProfile {
    const existing = this.getProfile();
    const now = new Date().toISOString();
    
    const updated: UserProfile = {
      id: existing?.id || nanoid(),
      birthData: profile.birthData || existing?.birthData || {
        date: "",
        time: "",
        location: "",
        latitude: 0,
        longitude: 0,
        timezone: "UTC",
      },
      fieldAssignments: profile.fieldAssignments || existing?.fieldAssignments || this.getDefaultFieldAssignments(),
      resonanceHistory: profile.resonanceHistory || existing?.resonanceHistory || this.getDefaultResonanceHistory(),
      preferences: {
        ...existing?.preferences,
        ...profile.preferences,
        autoActivatePrograms: profile.preferences?.autoActivatePrograms ?? existing?.preferences?.autoActivatePrograms ?? true,
        notificationsEnabled: profile.preferences?.notificationsEnabled ?? existing?.preferences?.notificationsEnabled ?? true,
        defaultView: profile.preferences?.defaultView ?? existing?.preferences?.defaultView ?? 'simple',
      },
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  static updateBirthData(birthData: UserProfile['birthData']): UserProfile {
    return this.saveProfile({ birthData });
  }

  static updateFieldAssignment(field: FieldName, assignment: UserProfile['fieldAssignments'][FieldName]): UserProfile {
    const profile = this.getProfile();
    const fieldAssignments = profile?.fieldAssignments || this.getDefaultFieldAssignments();
    
    return this.saveProfile({
      fieldAssignments: {
        ...fieldAssignments,
        [field]: assignment,
      },
    });
  }

  static updateResonance(field: FieldName, resonanceValue: number): UserProfile {
    const profile = this.getProfile();
    const resonanceHistory = profile?.resonanceHistory || this.getDefaultResonanceHistory();
    
    // Running average: new value weighted with existing
    const existing = resonanceHistory[field] || 0.5;
    const updated = existing * 0.8 + resonanceValue * 0.2; // 80/20 blend
    
    const result = this.saveProfile({
      resonanceHistory: {
        ...resonanceHistory,
        [field]: updated,
      },
    });
    
    // Emit custom event to notify components of profile update
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: result }));
    
    return result;
  }

  static updatePreferences(preferences: Partial<UserProfile['preferences']>): UserProfile {
    const profile = this.getProfile();
    return this.saveProfile({
      preferences: {
        ...profile?.preferences,
        ...preferences,
      } as UserProfile['preferences'],
    });
  }

  static deleteProfile(): void {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  }

  static hasProfile(): boolean {
    return !!this.getProfile();
  }

  static getDefaultFieldAssignments(): UserProfile['fieldAssignments'] {
    const fields: FieldName[] = [
      "Mind", "Ajna", "ThroatExpression", "SolarIdentity", "Will",
      "SacralLife", "Emotions", "Instinct", "Root"
    ];

    return fields.reduce((acc, field) => {
      acc[field] = {
        chartType: FIELD_CHART_MAPPING[field],
        sensitiveGates: [],
      };
      return acc;
    }, {} as UserProfile['fieldAssignments']);
  }

  static getDefaultResonanceHistory(): UserProfile['resonanceHistory'] {
    const fields: FieldName[] = [
      "Mind", "Ajna", "ThroatExpression", "SolarIdentity", "Will",
      "SacralLife", "Emotions", "Instinct", "Root"
    ];

    return fields.reduce((acc, field) => {
      acc[field] = 0.5; // Neutral starting point
      return acc;
    }, {} as UserProfile['resonanceHistory']);
  }

  static exportProfile(): string {
    const profile = this.getProfile();
    return JSON.stringify(profile, null, 2);
  }

  static importProfile(jsonString: string): UserProfile {
    try {
      const profile = JSON.parse(jsonString) as UserProfile;
      return this.saveProfile(profile);
    } catch (error) {
      throw new Error("Invalid profile JSON");
    }
  }
}
