/**
 * Resonance Tracker
 * Visualizes field effectiveness and resonance history
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfileService } from "@/lib/userProfileService";
import type { UserProfile } from "@shared/schema";
import type { FieldName } from "@shared/transit-system";
import { Activity, TrendingUp, Star } from "lucide-react";

const FIELD_LABELS: Record<FieldName, string> = {
  Mind: "Mind",
  Ajna: "Ajna (Inner Vision)",
  ThroatExpression: "Throat Expression",
  SolarIdentity: "Solar Identity",
  Will: "Will",
  SacralLife: "Sacral Life Force",
  Emotions: "Emotions",
  Instinct: "Instinct",
  Root: "Root"
};

const FIELD_COLORS: Record<FieldName, string> = {
  Mind: "hsl(280, 70%, 60%)",
  Ajna: "hsl(260, 65%, 55%)",
  ThroatExpression: "hsl(200, 80%, 50%)",
  SolarIdentity: "hsl(45, 95%, 55%)",
  Will: "hsl(30, 85%, 55%)",
  SacralLife: "hsl(15, 80%, 50%)",
  Emotions: "hsl(120, 60%, 45%)",
  Instinct: "hsl(340, 75%, 55%)",
  Root: "hsl(0, 70%, 45%)"
};

export function ResonanceTracker() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'effectiveness'>('effectiveness');

  useEffect(() => {
    loadProfile();
    
    // Listen for profile updates from feedback
    const handleProfileUpdate = () => {
      loadProfile();
    };
    
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  const loadProfile = () => {
    const loaded = UserProfileService.getProfile();
    setProfile(loaded);
  };

  if (!profile) {
    return (
      <Card data-testid="card-resonance-empty">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Field Resonance
          </CardTitle>
          <CardDescription>
            Create a user profile to track your field effectiveness
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sortedFields = (Object.entries(profile.resonanceHistory) as [FieldName, number][])
    .sort((a, b) => {
      if (sortBy === 'name') {
        return FIELD_LABELS[a[0]].localeCompare(FIELD_LABELS[b[0]]);
      }
      return b[1] - a[1]; // effectiveness descending
    });

  const topFields = sortedFields.slice(0, 3);
  const averageResonance = sortedFields.reduce((sum, [, value]) => sum + value, 0) / sortedFields.length;

  return (
    <div className="space-y-4">
      <Card data-testid="card-resonance-overview">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <CardTitle>Field Resonance</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === 'name' ? 'effectiveness' : 'name')}
                data-testid="button-sort-fields"
              >
                {sortBy === 'name' ? 'Sort by Effectiveness' : 'Sort by Name'}
              </Button>
            </div>
          </div>
          <CardDescription>
            Track which consciousness fields resonate most with your work patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Average Resonance</div>
              <div className="text-2xl font-bold" data-testid="text-average-resonance">
                {(averageResonance * 100).toFixed(0)}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Top Field</div>
              <div className="text-2xl font-bold" data-testid="text-top-field">
                {FIELD_LABELS[topFields[0][0]]}
              </div>
            </div>
          </div>

          {/* Top 3 Fields */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-500" />
              <h3 className="font-semibold">Most Resonant Fields</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {topFields.map(([field, value]) => (
                <Badge 
                  key={field} 
                  variant="secondary"
                  className="gap-1"
                  data-testid={`badge-top-field-${field}`}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: FIELD_COLORS[field] }}
                  />
                  {FIELD_LABELS[field]} ({(value * 100).toFixed(0)}%)
                </Badge>
              ))}
            </div>
          </div>

          {/* All Fields */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <h3 className="font-semibold">Field Effectiveness</h3>
            </div>
            {sortedFields.map(([field, value]) => (
              <div key={field} className="space-y-1.5" data-testid={`field-progress-${field}`}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: FIELD_COLORS[field] }}
                    />
                    <span className="font-medium">{FIELD_LABELS[field]}</span>
                  </div>
                  <span className="text-muted-foreground" data-testid={`text-resonance-${field}`}>
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={value * 100} 
                  className="h-2"
                  data-testid={`progress-field-${field}`}
                />
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            Resonance scores are calculated based on your engagement with programs and activities. 
            Higher scores indicate fields that align well with your natural rhythms and work patterns.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
