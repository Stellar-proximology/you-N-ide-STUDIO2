/**
 * Session Analytics
 * Display program usage history and statistics
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceManager } from "@/lib/workspaceManager";
import type { WorkspaceState, ProgramSession } from "@shared/workspace-modes";
import { MODE_CONFIGS } from "@shared/workspace-modes";
import { Clock, TrendingUp, Star, BarChart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function SessionAnalytics() {
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>(WorkspaceManager.getState());
  const [sortBy, setSortBy] = useState<'recent' | 'duration' | 'rating'>('recent');
  const { toast } = useToast();

  useEffect(() => {
    const handleStateChange = (event: Event) => {
      const customEvent = event as CustomEvent<WorkspaceState>;
      setWorkspaceState(customEvent.detail);
    };

    window.addEventListener('workspaceStateChanged', handleStateChange);
    
    return () => {
      window.removeEventListener('workspaceStateChanged', handleStateChange);
    };
  }, []);

  const clearHistory = () => {
    WorkspaceManager.clearHistory();
    toast({
      title: "History Cleared",
      description: "All program sessions have been removed"
    });
  };

  const stats = WorkspaceManager.getSessionStats();
  const sessions = [...workspaceState.programHistory].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    }
    if (sortBy === 'duration') {
      return b.duration - a.duration;
    }
    if (sortBy === 'rating') {
      return (b.userRating || 0) - (a.userRating || 0);
    }
    return 0;
  });

  if (workspaceState.programHistory.length === 0) {
    return (
      <Card data-testid="card-analytics-empty">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Session Analytics
          </CardTitle>
          <CardDescription>
            Track your program usage and workspace patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No sessions yet</p>
            <p className="text-xs mt-1">Activate a program to start tracking</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card data-testid="card-analytics-stats">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              <CardTitle>Session Analytics</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="gap-1"
              data-testid="button-clear-history"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          </div>
          <CardDescription>
            Your program usage patterns and statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-xs sm:text-sm text-muted-foreground">Total Sessions</div>
              <div className="text-xl sm:text-2xl font-bold" data-testid="text-total-sessions">
                {stats.totalSessions}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs sm:text-sm text-muted-foreground">Total Time</div>
              <div className="text-xl sm:text-2xl font-bold" data-testid="text-total-duration">
                {formatDuration(stats.totalDuration)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs sm:text-sm text-muted-foreground">Avg Rating</div>
              <div className="text-xl sm:text-2xl font-bold" data-testid="text-avg-rating">
                {stats.averageRating > 0 ? (stats.averageRating * 100).toFixed(0) + '%' : 'N/A'}
              </div>
            </div>
          </div>

          {/* Mode Breakdown */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Mode Usage
            </h3>
            <div className="space-y-2">
              {(Object.entries(stats.modeBreakdown) as [string, number][])
                .filter(([_, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([mode, count]) => {
                  const modeConfig = MODE_CONFIGS[mode as keyof typeof MODE_CONFIGS];
                  const percentage = (count / stats.totalSessions) * 100;
                  return (
                    <div key={mode} className="space-y-1" data-testid={`mode-usage-${mode}`}>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: modeConfig?.color || '#888' }}
                          />
                          <span className="font-medium capitalize">{mode}</span>
                        </div>
                        <span className="text-muted-foreground">{count} sessions ({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session History */}
      <Card data-testid="card-session-history">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Session History
            </CardTitle>
            <div className="flex gap-1 sm:gap-2">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
                data-testid="button-sort-recent"
                className="text-xs sm:text-sm"
              >
                Recent
              </Button>
              <Button
                variant={sortBy === 'duration' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('duration')}
                data-testid="button-sort-duration"
                className="text-xs sm:text-sm"
              >
                Duration
              </Button>
              <Button
                variant={sortBy === 'rating' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('rating')}
                data-testid="button-sort-rating"
                className="text-xs sm:text-sm"
              >
                Rating
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => {
              const modeConfig = MODE_CONFIGS[session.mode];
              return (
                <div
                  key={session.programId}
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                  data-testid={`session-${session.programId}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${modeConfig.color}20`, color: modeConfig.color }}
                    >
                      <Badge variant="secondary" className="text-xs">
                        {session.mode.slice(0, 3).toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{session.programName}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.startTime).toLocaleDateString()} • {formatDuration(session.duration)}
                        {session.userRating !== null && (
                          <span className="ml-2">
                            <Star className="h-3 w-3 inline fill-yellow-500 text-yellow-500" />
                            {' '}{(session.userRating * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
