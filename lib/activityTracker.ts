export interface AppActivity {
  appId: string;
  appName: string;
  appType: string;
  lastVisited: string;
  visitCount: number;
  createdAt?: string;
}

export class ActivityTracker {
  private static ACTIVITY_KEY = 'indyverse-activity';
  private static MAX_RECENT = 10;

  static recordVisit(appId: string, appName: string, appType: string): void {
    try {
      const activities = this.getActivities();
      const existing = activities.find(a => a.appId === appId);

      if (existing) {
        existing.lastVisited = new Date().toISOString();
        existing.visitCount++;
      } else {
        activities.push({
          appId,
          appName,
          appType,
          lastVisited: new Date().toISOString(),
          visitCount: 1
        });
      }

      activities.sort((a, b) => 
        new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime()
      );

      const trimmed = activities.slice(0, this.MAX_RECENT);
      localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to record activity:', e);
    }
  }

  static recordCreation(appId: string, appName: string, appType: string): void {
    try {
      const activities = this.getActivities();
      const existing = activities.find(a => a.appId === appId);

      if (existing) {
        existing.createdAt = existing.createdAt || new Date().toISOString();
      } else {
        activities.push({
          appId,
          appName,
          appType,
          lastVisited: new Date().toISOString(),
          visitCount: 1,
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to record creation:', e);
    }
  }

  static getRecentlyVisited(limit: number = 5): AppActivity[] {
    const activities = this.getActivities();
    return activities
      .sort((a, b) => 
        new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime()
      )
      .slice(0, limit);
  }

  static getRecentlyCreated(limit: number = 5): AppActivity[] {
    const activities = this.getActivities();
    return activities
      .filter(a => a.createdAt)
      .sort((a, b) => 
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      )
      .slice(0, limit);
  }

  static getRecommendations(limit: number = 6): AppActivity[] {
    const activities = this.getActivities();
    
    // Only show recommendations if user has some activity
    if (activities.length === 0) {
      return [];
    }
    
    const typeCounts = activities.reduce((acc, activity) => {
      acc[activity.appType] = (acc[activity.appType] || 0) + activity.visitCount;
      return acc;
    }, {} as Record<string, number>);

    const preferredType = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    const allApps = [
      { id: 'ide', name: 'Launch IDE', type: 'core' },
      { id: 'grove-store', name: 'Grove Store', type: 'core' },
      { id: 'player', name: 'YOU–N–I–Versal Player', type: 'core' },
      { id: 'agents', name: 'Agent Creator', type: 'core' },
      { id: 'settings', name: 'Settings', type: 'core' }
    ];

    const unvisited = allApps.filter(
      app => !activities.some(a => a.appId === app.id)
    );

    const typeMatched = unvisited.filter(app => app.type === preferredType);
    const others = unvisited.filter(app => app.type !== preferredType);

    return [...typeMatched, ...others]
      .slice(0, limit)
      .map(app => ({
        appId: app.id,
        appName: app.name,
        appType: app.type,
        lastVisited: '',
        visitCount: 0
      }));
  }

  private static getActivities(): AppActivity[] {
    try {
      const data = localStorage.getItem(this.ACTIVITY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load activities:', e);
      return [];
    }
  }
}
