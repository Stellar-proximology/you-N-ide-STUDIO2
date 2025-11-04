import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIBackendSelector } from "./AIBackendSelector";
import { ProfileBuilder } from "./ProfileBuilder";
import { ResonanceTracker } from "./ResonanceTracker";
import { SessionAnalytics } from "./SessionAnalytics";
import { TopNav } from "@/components/TopNav";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, Palette, Brain, Zap, XCircle, AlertTriangle, Sparkles, CheckCircle, Shield, ShieldOff, ShieldCheck } from "lucide-react";
import { ThemeManager, type ColorTheme, THEME_PRESETS } from "@/lib/themeManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const THEME_NAMES: Record<ColorTheme, string> = {
  teal: 'Teal & Amber',
  purple: 'Purple Lavender',
  blue: 'Ocean Blue',
  emerald: 'Emerald Green',
  rose: 'Rose Pink',
  amber: 'Golden Amber'
};

interface AutonomyProposal {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "implemented";
  createdAt: string;
  sourceSignal: string;
  category: string;
}

type AutonomyMode = 'off' | 'controlled' | 'adaptive';

interface AutonomySettings {
  mode: AutonomyMode;
  requireConfirmation: boolean;
  allowFileCreation: boolean;
  allowFileDeletion: boolean;
  allowDependencyChanges: boolean;
  allowConfigChanges: boolean;
  preserveUserCode: boolean;
}

const DEFAULT_AUTONOMY: AutonomySettings = {
  mode: 'controlled',
  requireConfirmation: true,
  allowFileCreation: false,
  allowFileDeletion: false,
  allowDependencyChanges: false,
  allowConfigChanges: false,
  preserveUserCode: true,
};

export function SettingsPanel() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [colorTheme, setColorTheme] = useState<ColorTheme>(ThemeManager.getCurrentTheme());
  
  const [autonomyEnabled, setAutonomyEnabled] = useState(false);
  const [autonomySettings, setAutonomySettings] = useState<AutonomySettings>(DEFAULT_AUTONOMY);
  const [proposals, setProposals] = useState<AutonomyProposal[]>([]);
  const [birthData, setBirthData] = useState<{
    date?: string;
    time?: string;
    place?: string;
  }>({});

  const handleColorThemeChange = (newTheme: ColorTheme) => {
    setColorTheme(newTheme);
    ThemeManager.setTheme(newTheme);
  };

  useEffect(() => {
    ThemeManager.initializeTheme();
    loadAutonomyState();
    loadAutonomySettings();
    loadProposals();
    loadBirthData();
  }, []);

  const loadAutonomyState = () => {
    const stored = localStorage.getItem("autonomy_enabled");
    if (stored) {
      setAutonomyEnabled(JSON.parse(stored));
    }
  };

  const loadAutonomySettings = () => {
    const stored = localStorage.getItem("youniverse_autonomy_settings");
    if (stored) {
      try {
        setAutonomySettings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load autonomy settings:', e);
      }
    }
  };

  const loadProposals = () => {
    const stored = localStorage.getItem("autonomy_proposals");
    if (stored) {
      setProposals(JSON.parse(stored));
    }
  };

  const loadBirthData = () => {
    const stored = localStorage.getItem("autonomy_birth_data");
    if (stored) {
      setBirthData(JSON.parse(stored));
    }
  };

  const updateAutonomySetting = <K extends keyof AutonomySettings>(
    key: K,
    value: AutonomySettings[K]
  ) => {
    const updated = { ...autonomySettings, [key]: value };
    setAutonomySettings(updated);
    localStorage.setItem("youniverse_autonomy_settings", JSON.stringify(updated));
    
    if (key === 'mode') {
      toast({
        title: "Autonomy Mode Updated",
        description: `AI autonomy mode set to ${value}`
      });
    }
  };

  const toggleAutonomy = (enabled: boolean) => {
    setAutonomyEnabled(enabled);
    localStorage.setItem("autonomy_enabled", JSON.stringify(enabled));
    
    toast({
      title: enabled ? "Autonomy Activated" : "Autonomy Deactivated",
      description: enabled 
        ? "The system can now propose self-development enhancements"
        : "Self-development proposals are paused"
    });

    window.dispatchEvent(new CustomEvent("autonomy-state-changed", { detail: { enabled } }));
  };

  const updateBirthData = (field: string, value: string) => {
    const updated = { ...birthData, [field]: value };
    setBirthData(updated);
    localStorage.setItem("autonomy_birth_data", JSON.stringify(updated));
  };

  const approveProposal = (id: string) => {
    const updated = proposals.map(p => 
      p.id === id ? { ...p, status: "approved" as const } : p
    );
    setProposals(updated);
    localStorage.setItem("autonomy_proposals", JSON.stringify(updated));
    
    toast({
      title: "Proposal Approved",
      description: "This enhancement will be implemented"
    });
  };

  const rejectProposal = (id: string) => {
    const updated = proposals.map(p => 
      p.id === id ? { ...p, status: "rejected" as const } : p
    );
    setProposals(updated);
    localStorage.setItem("autonomy_proposals", JSON.stringify(updated));
    
    toast({
      title: "Proposal Rejected",
      description: "This enhancement will not be implemented"
    });
  };

  const pendingCount = proposals.filter(p => p.status === "pending").length;
  const approvedCount = proposals.filter(p => p.status === "approved").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuration</h1>
          <p className="text-muted-foreground">Manage your AI backends, autonomy, and studio preferences</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai">AI Config</TabsTrigger>
            <TabsTrigger value="autonomy" data-testid="tab-autonomy">
              Autonomy
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="consciousness" data-testid="tab-consciousness">
              <Sparkles className="h-4 w-4 mr-1" />
              ERN
            </TabsTrigger>
            <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Color Palette
                </CardTitle>
                <CardDescription>Choose your preferred color scheme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(Object.keys(THEME_PRESETS) as ColorTheme[]).map((themeKey) => (
                    <button
                      key={themeKey}
                      data-testid={`button-theme-${themeKey}`}
                      onClick={() => handleColorThemeChange(themeKey)}
                      className={`p-4 rounded-lg border-2 transition-all hover-elevate ${
                        colorTheme === themeKey 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="h-8 w-8 rounded-full border-2 border-white/20 shadow-md"
                          style={{ backgroundColor: `hsl(${THEME_PRESETS[themeKey].primary})` }}
                        />
                        <div 
                          className="h-6 w-6 rounded-full border-2 border-white/20 shadow-sm"
                          style={{ backgroundColor: `hsl(${THEME_PRESETS[themeKey].accent})` }}
                        />
                      </div>
                      <p className="text-sm font-medium text-left">{THEME_NAMES[themeKey]}</p>
                      {colorTheme === themeKey && (
                        <p className="text-xs text-primary mt-1">Active</p>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Theme Preferences</CardTitle>
                <CardDescription>Customize your workspace appearance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {theme === "dark" ? (
                      <Moon className="h-4 w-4 text-primary" />
                    ) : (
                      <Sun className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm font-medium">
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </span>
                  </div>
                  <Button 
                    data-testid="button-toggle-theme"
                    variant="outline" 
                    size="sm" 
                    onClick={toggleTheme}
                    className="gap-2"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4" />
                        Switch to Light
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        Switch to Dark
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">AI Configuration</h2>
              <AIBackendSelector />
            </div>
          </TabsContent>

          <TabsContent value="autonomy" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Autonomy Control Center
                    </CardTitle>
                    <CardDescription>
                      Enable the system to propose self-development enhancements
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={autonomyEnabled ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {autonomyEnabled ? (
                      <><Zap className="h-3 w-3" /> Active</>
                    ) : (
                      <><XCircle className="h-3 w-3" /> Inactive</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <Label htmlFor="autonomy-switch" className="text-base font-semibold">
                      Enable Self-Development Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      System will use your cosmic signature to generate proposals
                    </p>
                  </div>
                  <Switch
                    id="autonomy-switch"
                    data-testid="switch-autonomy"
                    checked={autonomyEnabled}
                    onCheckedChange={toggleAutonomy}
                  />
                </div>

                {autonomyEnabled && (
                  <Card className="bg-primary/5 border-primary/30">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />
                        <div className="space-y-2">
                          <p className="font-semibold">Autonomy Active</p>
                          <p className="text-muted-foreground text-xs">
                            The system will analyze your cosmic signature and propose features.
                            All proposals require your approval before implementation.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Autonomy Mode Selection */}
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label className="text-base font-semibold">AI Autonomy Mode</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Control how much freedom the AI has when working on your code
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      data-testid="button-mode-off"
                      variant={autonomySettings.mode === 'off' ? 'default' : 'outline'}
                      onClick={() => updateAutonomySetting('mode', 'off')}
                      className="justify-start h-auto py-3"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <ShieldOff className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Off</div>
                          <div className="text-xs text-muted-foreground font-normal">
                            AI available for help - won't edit your code automatically
                          </div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      data-testid="button-mode-controlled"
                      variant={autonomySettings.mode === 'controlled' ? 'default' : 'outline'}
                      onClick={() => updateAutonomySetting('mode', 'controlled')}
                      className="justify-start h-auto py-3"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Controlled</div>
                          <div className="text-xs text-muted-foreground font-normal">
                            AI can only do exactly what you request - no extras
                          </div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button
                      data-testid="button-mode-adaptive"
                      variant={autonomySettings.mode === 'adaptive' ? 'default' : 'outline'}
                      onClick={() => updateAutonomySetting('mode', 'adaptive')}
                      className="justify-start h-auto py-3"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <ShieldCheck className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">Adaptive</div>
                          <div className="text-xs text-muted-foreground font-normal">
                            AI can suggest and make improvements within guardrails
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>

                  {/* Current Status Badge */}
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <span className="text-sm text-muted-foreground">Current Mode:</span>
                    <Badge variant="default" className="capitalize">
                      {autonomySettings.mode}
                    </Badge>
                  </div>

                  {/* Guardrail Settings - Only show when Adaptive mode is active */}
                  {autonomySettings.mode === 'adaptive' && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Guardrails & Permissions</h3>
                        <p className="text-xs text-muted-foreground">
                          Configure what the AI is allowed to do in Adaptive mode
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex-1">
                            <Label htmlFor="confirm" className="text-sm font-medium cursor-pointer">
                              Require Confirmation
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Ask before making any changes
                            </p>
                          </div>
                          <Switch
                            id="confirm"
                            data-testid="switch-require-confirmation"
                            checked={autonomySettings.requireConfirmation}
                            onCheckedChange={(checked) => updateAutonomySetting('requireConfirmation', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex-1">
                            <Label htmlFor="create-files" className="text-sm font-medium cursor-pointer">
                              Allow File Creation
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              AI can create new files as needed
                            </p>
                          </div>
                          <Switch
                            id="create-files"
                            data-testid="switch-allow-file-creation"
                            checked={autonomySettings.allowFileCreation}
                            onCheckedChange={(checked) => updateAutonomySetting('allowFileCreation', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex-1">
                            <Label htmlFor="delete-files" className="text-sm font-medium cursor-pointer">
                              Allow File Deletion
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              AI can delete files (use with caution)
                            </p>
                          </div>
                          <Switch
                            id="delete-files"
                            data-testid="switch-allow-file-deletion"
                            checked={autonomySettings.allowFileDeletion}
                            onCheckedChange={(checked) => updateAutonomySetting('allowFileDeletion', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex-1">
                            <Label htmlFor="dependencies" className="text-sm font-medium cursor-pointer">
                              Allow Dependency Changes
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              AI can install or update packages
                            </p>
                          </div>
                          <Switch
                            id="dependencies"
                            data-testid="switch-allow-dependency-changes"
                            checked={autonomySettings.allowDependencyChanges}
                            onCheckedChange={(checked) => updateAutonomySetting('allowDependencyChanges', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex-1">
                            <Label htmlFor="config" className="text-sm font-medium cursor-pointer">
                              Allow Config Changes
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              AI can modify configuration files
                            </p>
                          </div>
                          <Switch
                            id="config"
                            data-testid="switch-allow-config-changes"
                            checked={autonomySettings.allowConfigChanges}
                            onCheckedChange={(checked) => updateAutonomySetting('allowConfigChanges', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex-1">
                            <Label htmlFor="preserve" className="text-sm font-medium cursor-pointer">
                              Preserve User Code
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Never delete or overwrite your code
                            </p>
                          </div>
                          <Switch
                            id="preserve"
                            data-testid="switch-preserve-user-code"
                            checked={autonomySettings.preserveUserCode}
                            onCheckedChange={(checked) => updateAutonomySetting('preserveUserCode', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info for Controlled Mode */}
                  {autonomySettings.mode === 'controlled' && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-md">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        In Controlled mode, the AI will only perform the exact tasks you request. 
                        It won't add features, optimize code, or make suggestions beyond your instructions.
                      </p>
                    </div>
                  )}

                  {/* Info for Off Mode */}
                  {autonomySettings.mode === 'off' && (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-md">
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        AI is available to answer questions and provide guidance, but won't automatically edit your code. You have full manual control.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base">Cosmic Signature Data</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    This data is used to calibrate autonomous feature proposals
                  </p>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birth-date">Birth Date</Label>
                      <Input
                        id="birth-date"
                        data-testid="input-birth-date"
                        type="date"
                        value={birthData.date || ""}
                        onChange={(e) => updateBirthData("date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth-time">Birth Time (optional)</Label>
                      <Input
                        id="birth-time"
                        data-testid="input-birth-time"
                        type="time"
                        value={birthData.time || ""}
                        onChange={(e) => updateBirthData("time", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth-place">Birth Place (optional)</Label>
                      <Input
                        id="birth-place"
                        data-testid="input-birth-place"
                        placeholder="City, Country"
                        value={birthData.place || ""}
                        onChange={(e) => updateBirthData("place", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {proposals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Autonomy Proposals
                  </CardTitle>
                  <CardDescription>
                    Review and manage system-generated enhancement proposals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {proposals.map((proposal) => (
                        <Card key={proposal.id} className={
                          proposal.status === "pending" ? "border-primary/50" :
                          proposal.status === "approved" ? "border-green-500/50" :
                          proposal.status === "implemented" ? "border-blue-500/50" :
                          "border-muted"
                        }>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold">{proposal.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {proposal.description}
                                  </p>
                                </div>
                                <Badge variant={
                                  proposal.status === "pending" ? "default" :
                                  proposal.status === "approved" ? "default" :
                                  proposal.status === "implemented" ? "default" :
                                  "secondary"
                                }>
                                  {proposal.status}
                                </Badge>
                              </div>
                              
                              {proposal.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => approveProposal(proposal.id)}
                                    data-testid={`button-approve-${proposal.id}`}
                                    className="gap-1"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => rejectProposal(proposal.id)}
                                    data-testid={`button-reject-${proposal.id}`}
                                    className="gap-1"
                                  >
                                    <XCircle className="h-3 w-3" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="consciousness" className="space-y-6">
            <ProfileBuilder />
            <ResonanceTracker />
            <SessionAnalytics />
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    YOU–N–I–VERSE Studio • The Indyverse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Creative IDE with integrated AI consciousness
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="text-primary">Special Thanks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This project was made possible with the incredible assistance of <span className="text-foreground font-medium">ChatGPT</span>, <span className="text-foreground font-medium">Claude</span>, and the amazing <span className="text-foreground font-medium">Replit</span> platform. Thank you for empowering creators to build the future!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
