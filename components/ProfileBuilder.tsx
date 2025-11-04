import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserProfileService } from "@/lib/userProfileService";
import { FIELD_CHART_MAPPING, type FieldName, type ChartType } from "@shared/transit-system";
import type { UserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Sparkles, Calendar, MapPin } from "lucide-react";

const FIELD_DESCRIPTIONS: Record<FieldName, string> = {
  Mind: "Mental awareness and inspiration",
  Ajna: "Conceptual processing and insight",
  ThroatExpression: "Communication and manifestation",
  SolarIdentity: "Identity and life direction",
  Will: "Willpower and commitment",
  SacralLife: "Life force and creative energy",
  Emotions: "Emotional awareness and depth",
  Instinct: "Intuition and survival instincts",
  Root: "Pressure, drive, and momentum",
};

export function ProfileBuilder() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Birth data form state
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const loaded = UserProfileService.getProfile();
    setProfile(loaded);
    
    if (loaded) {
      setBirthDate(loaded.birthData.date);
      setBirthTime(loaded.birthData.time);
      setLocation(loaded.birthData.location);
      setLatitude(loaded.birthData.latitude.toString());
      setLongitude(loaded.birthData.longitude.toString());
      setTimezone(loaded.birthData.timezone);
    }
  };

  const handleSaveBirthData = () => {
    try {
      const updated = UserProfileService.updateBirthData({
        date: birthDate,
        time: birthTime,
        location,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        timezone,
      });

      setProfile(updated);
      setIsEditing(false);
      
      toast({
        title: "Profile Saved",
        description: "Your birth data has been updated",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Please check your input and try again",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFieldAssignment = (field: FieldName, chartType: ChartType) => {
    const updated = UserProfileService.updateFieldAssignment(field, {
      chartType,
      sensitiveGates: profile?.fieldAssignments[field]?.sensitiveGates || [],
    });
    setProfile(updated);
  };

  const handleCreateProfile = () => {
    const newProfile = UserProfileService.saveProfile({});
    setProfile(newProfile);
    setIsEditing(true);
  };

  if (!profile) {
    return (
      <Card className="p-8 text-center">
        <User className="w-16 h-16 mx-auto mb-4 text-primary/40" />
        <h2 className="text-2xl font-bold mb-2">Create Your Consciousness Profile</h2>
        <p className="text-muted-foreground mb-6">
          Enable personalized Growth Program recommendations based on your unique cosmic signature
        </p>
        <Button onClick={handleCreateProfile} size="lg" data-testid="button-create-profile">
          <Sparkles className="w-4 h-4 mr-2" />
          Create Profile
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Consciousness Profile</h2>
              <p className="text-sm text-muted-foreground">
                {profile.birthData.location || "No birth data set"}
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              data-testid="button-edit-profile"
            >
              Edit
            </Button>
          )}
        </div>

        <Tabs defaultValue="birth-data" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="birth-data" data-testid="tab-birth-data">
              <Calendar className="w-4 h-4 mr-2" />
              Birth Data
            </TabsTrigger>
            <TabsTrigger value="field-config" data-testid="tab-field-config">
              <Sparkles className="w-4 h-4 mr-2" />
              Field Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="birth-data" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth-date">Birth Date</Label>
                <Input
                  id="birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-birth-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth-time">Birth Time</Label>
                <Input
                  id="birth-time"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-birth-time"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="w-4 h-4 inline mr-2" />
                Birth Location
              </Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={!isEditing}
                data-testid="input-location"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  placeholder="40.7128"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-latitude"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  placeholder="-74.0060"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-longitude"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                placeholder="America/New_York"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={!isEditing}
                data-testid="input-timezone"
              />
              <p className="text-xs text-muted-foreground">
                IANA timezone identifier (e.g., America/New_York, Europe/London)
              </p>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveBirthData}
                  className="flex-1"
                  data-testid="button-save-birth-data"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Birth Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    loadProfile();
                    setIsEditing(false);
                  }}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="field-config" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configure which chart type (Sidereal, Tropical, or Draconic) activates each consciousness field
            </p>

            <div className="space-y-3">
              {(Object.keys(FIELD_CHART_MAPPING) as FieldName[]).map((field) => (
                <Card key={field} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{field}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {FIELD_DESCRIPTIONS[field]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Default: {FIELD_CHART_MAPPING[field]}
                      </p>
                    </div>

                    <Select
                      value={profile.fieldAssignments[field]?.chartType || FIELD_CHART_MAPPING[field]}
                      onValueChange={(value) => handleUpdateFieldAssignment(field, value as ChartType)}
                      data-testid={`select-field-${field}`}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sidereal">Sidereal</SelectItem>
                        <SelectItem value="Tropical">Tropical</SelectItem>
                        <SelectItem value="Draconic">Draconic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resonance History</h3>
        <div className="grid grid-cols-3 gap-4">
          {(Object.entries(profile.resonanceHistory) as [FieldName, number][]).map(([field, value]) => (
            <div key={field} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{field}</span>
                <span className="text-muted-foreground">{Math.round(value * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Resonance history tracks how effective each field is for you based on program feedback
        </p>
      </Card>
    </div>
  );
}
