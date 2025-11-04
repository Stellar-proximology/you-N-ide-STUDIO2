import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Code,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutonomyProposal {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "implemented";
  createdAt: string;
  sourceSignal: string;
  category: string;
}

export function AutonomyControlCenter() {
  const { toast } = useToast();
  const [autonomyEnabled, setAutonomyEnabled] = useState(false);
  const [proposals, setProposals] = useState<AutonomyProposal[]>([]);
  const [birthData, setBirthData] = useState<{
    date?: string;
    time?: string;
    place?: string;
  }>({});

  useEffect(() => {
    loadAutonomyState();
    loadProposals();
    loadBirthData();
  }, []);

  const loadAutonomyState = () => {
    const stored = localStorage.getItem("autonomy_enabled");
    if (stored) {
      setAutonomyEnabled(JSON.parse(stored));
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

  const toggleAutonomy = (enabled: boolean) => {
    setAutonomyEnabled(enabled);
    localStorage.setItem("autonomy_enabled", JSON.stringify(enabled));
    
    toast({
      title: enabled ? "Autonomy Activated" : "Autonomy Deactivated",
      description: enabled 
        ? "The system can now propose self-development enhancements based on your cosmic signature"
        : "Self-development proposals are paused"
    });

    window.dispatchEvent(new CustomEvent("autonomy-state-changed", { detail: { enabled } }));
  };

  const approveProposal = (id: string) => {
    const updated = proposals.map(p => 
      p.id === id ? { ...p, status: "approved" as const } : p
    );
    setProposals(updated);
    localStorage.setItem("autonomy_proposals", JSON.stringify(updated));
    
    toast({
      title: "Proposal Approved",
      description: "This enhancement will be implemented in the next development cycle"
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

  const markImplemented = (id: string) => {
    const updated = proposals.map(p => 
      p.id === id ? { ...p, status: "implemented" as const } : p
    );
    setProposals(updated);
    localStorage.setItem("autonomy_proposals", JSON.stringify(updated));
    
    toast({
      title: "Enhancement Implemented",
      description: "This feature has been added to the system"
    });
  };

  const pendingCount = proposals.filter(p => p.status === "pending").length;
  const approvedCount = proposals.filter(p => p.status === "approved").length;
  const implementedCount = proposals.filter(p => p.status === "implemented").length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-primary">Autonomy Control Center</h1>
            </div>
            <p className="text-muted-foreground">
              Enable the system to propose and develop enhancements based on your cosmic signature
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge 
              variant={autonomyEnabled ? "default" : "secondary"}
              className={autonomyEnabled ? "bg-primary" : ""}
            >
              {autonomyEnabled ? (
                <><Zap className="h-3 w-3 mr-1" /> Active</>
              ) : (
                <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
              )}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Master Autonomy Control
            </CardTitle>
            <CardDescription>
              Allow the system to analyze your cosmic variables and propose personalized features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-1">
                <Label htmlFor="autonomy-switch" className="text-base font-semibold">
                  Enable Self-Development Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  The system will use your birthday, time, and place to generate proposals
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
                        The system will analyze your cosmic signature (birthday, time, place) and propose new features.
                        All proposals require your approval before implementation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <Label className="text-base">Cosmic Signature Data</Label>
              <p className="text-xs text-muted-foreground mb-2">
                This data is used to calibrate autonomous feature proposals
              </p>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-2 p-3 rounded bg-muted/30">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Birth Date</p>
                    <p className="text-sm font-mono">
                      {birthData.date || "Not set - use Oracle Mode to calibrate"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 rounded bg-muted/30">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Birth Time</p>
                    <p className="text-sm font-mono">
                      {birthData.time || "Available in future update"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 rounded bg-muted/30">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Birth Place</p>
                    <p className="text-sm font-mono">
                      {birthData.place || "Available in future update"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proposal Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Review</span>
                <Badge variant="secondary">{pendingCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Approved</span>
                <Badge variant="secondary">{approvedCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Implemented</span>
                <Badge className="bg-primary">{implementedCount}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Feature Proposal Queue
          </CardTitle>
          <CardDescription>
            Review and approve system-generated enhancement proposals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">No Proposals Yet</p>
              <p className="text-muted-foreground mb-4">
                {autonomyEnabled 
                  ? "The system is analyzing your cosmic signature. Proposals will appear here."
                  : "Enable autonomy mode to receive personalized feature proposals"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {proposals.map((proposal) => (
                  <Card key={proposal.id} className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{proposal.title}</h3>
                            <Badge 
                              variant={
                                proposal.status === "approved" ? "default" :
                                proposal.status === "implemented" ? "default" :
                                proposal.status === "rejected" ? "secondary" :
                                "outline"
                              }
                              className={proposal.status === "implemented" ? "bg-primary" : ""}
                            >
                              {proposal.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                              {proposal.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {proposal.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                              {proposal.status === "implemented" && <Sparkles className="h-3 w-3 mr-1" />}
                              {proposal.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{proposal.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Source: {proposal.sourceSignal}</span>
                            <span>Category: {proposal.category}</span>
                            <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {proposal.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              data-testid={`button-approve-${proposal.id}`}
                              onClick={() => approveProposal(proposal.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              data-testid={`button-reject-${proposal.id}`}
                              onClick={() => rejectProposal(proposal.id)}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        
                        {proposal.status === "approved" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-primary hover:bg-primary/90"
                            data-testid={`button-implement-${proposal.id}`}
                            onClick={() => markImplemented(proposal.id)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Mark Implemented
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
