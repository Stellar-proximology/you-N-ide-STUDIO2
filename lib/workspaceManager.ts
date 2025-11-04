/**
 * Workspace Manager
 * Manages active programs, workspace modes, and session tracking
 */

import type { WorkspaceState, ActiveProgram, ProgramSession, WorkspaceMode } from "@shared/workspace-modes";
import { programToMode } from "@shared/workspace-modes";
import { UserProfileService } from "./userProfileService";
import type { FieldName } from "@shared/transit-system";

const WORKSPACE_STATE_KEY = "you-n-i-verse:workspace-state";

export class WorkspaceManager {
  static getState(): WorkspaceState {
    try {
      const stored = localStorage.getItem(WORKSPACE_STATE_KEY);
      if (!stored) return this.getDefaultState();
      
      const state = JSON.parse(stored) as WorkspaceState;
      return state;
    } catch (error) {
      console.error("Failed to load workspace state:", error);
      return this.getDefaultState();
    }
  }

  static saveState(state: Partial<WorkspaceState>): WorkspaceState {
    const current = this.getState();
    const updated: WorkspaceState = {
      ...current,
      ...state,
    };

    localStorage.setItem(WORKSPACE_STATE_KEY, JSON.stringify(updated));
    
    // Emit event for UI updates
    window.dispatchEvent(new CustomEvent('workspaceStateChanged', { detail: updated }));
    
    return updated;
  }

  static activateProgram(directive: any): WorkspaceState {
    // End current session if active
    if (this.hasActiveProgram()) {
      this.deactivateProgram();
    }

    const mode = programToMode(directive.primaryMode);
    
    const activeProgram: ActiveProgram = {
      programId: Date.now().toString(),
      programName: directive.primaryMode,
      mode,
      activatedAt: new Date().toISOString(),
      toolRecommendations: directive.toolRecommendations || [],
      fieldContributions: directive.fieldContributions || {},
      directive: directive.synthesis
    };

    return this.saveState({ activeProgram });
  }

  static deactivateProgram(): WorkspaceState {
    const state = this.getState();
    
    if (state.activeProgram) {
      // Calculate session duration
      const startTime = new Date(state.activeProgram.activatedAt);
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Get cached rating if exists
      const cachedRating = (state.activeProgram as any).cachedRating;

      // Create session record
      const session: ProgramSession = {
        programId: state.activeProgram.programId,
        programName: state.activeProgram.programName,
        mode: state.activeProgram.mode,
        startTime: state.activeProgram.activatedAt,
        endTime: endTime.toISOString(),
        duration,
        userRating: cachedRating !== undefined ? cachedRating : null,
        fieldResonances: {}
      };

      // Add to history
      const programHistory = [session, ...state.programHistory].slice(0, 50); // Keep last 50

      return this.saveState({
        activeProgram: null,
        programHistory
      });
    }

    return state;
  }

  static rateCurrentSession(rating: number): void {
    const state = this.getState();
    
    if (state.activeProgram) {
      // Cache rating on active program for when session ends
      const updatedProgram = {
        ...state.activeProgram,
        cachedRating: rating
      } as ActiveProgram & { cachedRating?: number };
      
      this.saveState({ activeProgram: updatedProgram });

      // Also update the most recent session with rating if it exists
      if (state.programHistory.length > 0) {
        const latestSession = state.programHistory[0];
        if (latestSession.programId === state.activeProgram.programId) {
          latestSession.userRating = rating;
          this.saveState({ programHistory: state.programHistory });
        }
      }
    } else {
      // No active program - update the most recent session
      if (state.programHistory.length > 0) {
        const latestSession = state.programHistory[0];
        latestSession.userRating = rating;
        this.saveState({ programHistory: state.programHistory });
      }
    }
  }

  static hasActiveProgram(): boolean {
    const state = this.getState();
    return state.activeProgram !== null;
  }

  static getActiveMode(): WorkspaceMode {
    const state = this.getState();
    return state.activeProgram?.mode || "neutral";
  }

  static updatePreferences(preferences: Partial<WorkspaceState['preferences']>): WorkspaceState {
    const state = this.getState();
    return this.saveState({
      preferences: {
        ...state.preferences,
        ...preferences
      }
    });
  }

  static getSessionStats(): {
    totalSessions: number;
    totalDuration: number;
    averageRating: number;
    modeBreakdown: Record<WorkspaceMode, number>;
  } {
    const state = this.getState();
    const sessions = state.programHistory;

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    
    const ratedSessions = sessions.filter(s => s.userRating !== null);
    const averageRating = ratedSessions.length > 0
      ? ratedSessions.reduce((sum, s) => sum + (s.userRating || 0), 0) / ratedSessions.length
      : 0;

    const modeBreakdown: Record<WorkspaceMode, number> = {
      focus: 0,
      creative: 0,
      collaborate: 0,
      reflect: 0,
      integrate: 0,
      neutral: 0
    };

    sessions.forEach(s => {
      modeBreakdown[s.mode]++;
    });

    return {
      totalSessions,
      totalDuration,
      averageRating,
      modeBreakdown
    };
  }

  static getDefaultState(): WorkspaceState {
    return {
      activeProgram: null,
      programHistory: [],
      preferences: {
        autoTransition: true,
        showModeIndicator: true,
        notificationsEnabled: true
      }
    };
  }

  static clearHistory(): WorkspaceState {
    return this.saveState({
      programHistory: []
    });
  }
}
