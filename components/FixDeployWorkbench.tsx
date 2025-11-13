import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileSystem, type FileNode } from "@/lib/fileSystem";
import { AIService } from "@/lib/AIService";
import {
  AlertCircle,
  Cloud,
  Github,
  PlugZap,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2,
  Wrench,
} from "lucide-react";

type AIMessage = { role: "user" | "assistant" | "system"; content: string };

type IntegrationStatus = {
  googleDrive?: {
    connected: boolean;
    message?: string;
    account?: string;
  };
};

interface FixDeployWorkbenchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFile: FileNode | null;
  currentCode: string;
  onApplyCode: (code: string) => void;
  onFileModified?: (filePath: string) => void;
}

export function FixDeployWorkbench({
  open,
  onOpenChange,
  currentFile,
  currentCode,
  onApplyCode,
  onFileModified,
}: FixDeployWorkbenchProps) {
  const { toast } = useToast();
  const [fixPrompt, setFixPrompt] = useState("");
  const [fixResponse, setFixResponse] = useState("");
  const [applyMode, setApplyMode] = useState<"replace" | "append">("replace");
  const [isRequestingFix, setIsRequestingFix] = useState(false);

  const [repoName, setRepoName] = useState("");
  const [netlifyApiKey, setNetlifyApiKey] = useState("");
  const [netlifySiteName, setNetlifySiteName] = useState("");
  const [vercelToken, setVercelToken] = useState("");
  const [vercelProjectName, setVercelProjectName] = useState("");
  const [googleProjectName, setGoogleProjectName] = useState("YOU-N-I-VERSE Studio Export");

  const [isPushingToGitHub, setIsPushingToGitHub] = useState(false);
  const [isDeployingToNetlify, setIsDeployingToNetlify] = useState(false);
  const [isDeployingToVercel, setIsDeployingToVercel] = useState(false);
  const [isExportingToDrive, setIsExportingToDrive] = useState(false);

  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [isCheckingIntegrations, setIsCheckingIntegrations] = useState(false);
  const [aiConnection, setAiConnection] = useState({ backend: "claude", hasKey: false });

  useEffect(() => {
    if (!open) return;
    refreshIntegrationStatus();
    refreshAiConnection();
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedNetlifyKey = localStorage.getItem("netlify_api_key");
    const savedVercelToken = localStorage.getItem("vercel_token");
    if (savedNetlifyKey) setNetlifyApiKey(savedNetlifyKey);
    if (savedVercelToken) setVercelToken(savedVercelToken);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (netlifyApiKey) {
      localStorage.setItem("netlify_api_key", netlifyApiKey);
    }
  }, [netlifyApiKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (vercelToken) {
      localStorage.setItem("vercel_token", vercelToken);
    }
  }, [vercelToken]);

  async function refreshIntegrationStatus() {
    setIsCheckingIntegrations(true);
    try {
      const response = await fetch("/api/integrations/status");
      if (!response.ok) {
        throw new Error("Could not load integration status");
      }
      const data = await response.json();
      setIntegrationStatus(data);
    } catch (error: any) {
      setIntegrationStatus({
        googleDrive: {
          connected: false,
          message: error.message || "Unable to reach integration service",
        },
      });
    } finally {
      setIsCheckingIntegrations(false);
    }
  }

  function refreshAiConnection() {
    if (typeof window === "undefined") return;
    const backend = localStorage.getItem("ai_backend") || "claude";
    const hasKey = Boolean(localStorage.getItem(`ai_key_${backend}`));
    setAiConnection({ backend, hasKey });
  }

  async function handleRequestFix() {
    if (!fixPrompt.trim()) {
      toast({
        title: "Describe what needs fixing",
        description: "Add details about the bug or update you want",
        variant: "destructive",
      });
      return;
    }

    setIsRequestingFix(true);
    setFixResponse("");

    const messages: AIMessage[] = [
      {
        role: "system",
        content:
          "You are the YOU-N-I-VERSE fix lab. Respond with concrete code edits that can be pasted directly into the file the user is editing.",
      },
      {
        role: "user",
        content: `Issue: ${fixPrompt}\n\nCurrent file: ${currentFile?.path ?? "No file selected"}\n\n${currentCode}`,
      },
    ];

    try {
      const result = await AIService.sendMessage(messages);
      if (result.error) {
        throw new Error(result.error);
      }
      setFixResponse(result.content);
      toast({
        title: "Fix suggestion ready",
        description: "Review the generated patch before applying",
      });
    } catch (error: any) {
      toast({
        title: "Could not fetch fix",
        description: error.message || "AI backend is unreachable",
        variant: "destructive",
      });
    } finally {
      setIsRequestingFix(false);
    }
  }

  function handleApplyFix() {
    if (!currentFile) {
      toast({
        title: "Open a file first",
        description: "Select a file in the editor so the fix knows where to go",
        variant: "destructive",
      });
      return;
    }
    if (!fixResponse.trim()) {
      toast({
        title: "No fix to apply",
        description: "Ask the AI for a fix before applying",
        variant: "destructive",
      });
      return;
    }

    const extracted = extractCodeFromResponse(fixResponse);
    const newContent = applyMode === "replace"
      ? extracted
      : `${currentCode.trimEnd()}\n\n${extracted}`;

    FileSystem.saveFile(currentFile.path, newContent);
    onApplyCode(newContent);
    onFileModified?.(currentFile.path);

    toast({
      title: "File updated",
      description: `${currentFile.name} now includes the AI fix`,
    });
  }

  async function handlePushToGitHub() {
    const projectFiles = flattenFiles();
    if (!repoName.trim()) {
      toast({
        title: "Repository name required",
        description: "Name the GitHub repo you want to push to",
        variant: "destructive",
      });
      return;
    }

    if (!projectFiles.length) {
      toast({
        title: "Nothing to push",
        description: "Create files or open an existing project first",
        variant: "destructive",
      });
      return;
    }

    setIsPushingToGitHub(true);
    try {
      const response = await fetch("/api/push/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoName: repoName.trim(),
          files: projectFiles,
          description: "Updated via Fix & Deploy Workbench",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "GitHub push failed");
      }
      toast({
        title: "Pushed to GitHub",
        description: `${repoName.trim()} is live`,
      });
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "GitHub push failed",
        description: error.message || "Unable to push files",
        variant: "destructive",
      });
    } finally {
      setIsPushingToGitHub(false);
    }
  }

  async function handleDeployToNetlify() {
    const projectFiles = flattenFiles();
    if (!netlifyApiKey.trim()) {
      toast({
        title: "Netlify API key needed",
        description: "Paste your personal access token",
        variant: "destructive",
      });
      return;
    }
    if (!projectFiles.length) {
      toast({
        title: "Nothing to deploy",
        description: "Add some files before deploying",
        variant: "destructive",
      });
      return;
    }

    setIsDeployingToNetlify(true);
    try {
      const response = await fetch("/api/deploy/netlify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: netlifyApiKey.trim(),
          files: projectFiles,
          siteName: netlifySiteName.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Netlify deployment failed");
      }
      toast({
        title: "Netlify deployment ready",
        description: data.url,
      });
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Netlify deployment failed",
        description: error.message || "Unable to deploy",
        variant: "destructive",
      });
    } finally {
      setIsDeployingToNetlify(false);
    }
  }

  async function handleDeployToVercel() {
    const projectFiles = flattenFiles();
    if (!vercelToken.trim()) {
      toast({
        title: "Vercel token needed",
        description: "Generate a personal token in Vercel settings",
        variant: "destructive",
      });
      return;
    }
    if (!projectFiles.length) {
      toast({
        title: "Nothing to deploy",
        description: "Add some files before deploying",
        variant: "destructive",
      });
      return;
    }

    setIsDeployingToVercel(true);
    try {
      const response = await fetch("/api/deploy/vercel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: vercelToken.trim(),
          files: projectFiles,
          projectName: vercelProjectName.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Vercel deployment failed");
      }
      toast({
        title: "Vercel deployment ready",
        description: data.url,
      });
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Vercel deployment failed",
        description: error.message || "Unable to deploy",
        variant: "destructive",
      });
    } finally {
      setIsDeployingToVercel(false);
    }
  }

  async function handleExportToGoogleDrive() {
    const projectFiles = flattenFiles();
    if (!googleProjectName.trim()) {
      toast({
        title: "Name required",
        description: "Give this Drive export a folder name",
        variant: "destructive",
      });
      return;
    }
    if (!projectFiles.length) {
      toast({
        title: "Nothing to export",
        description: "Add files before exporting",
        variant: "destructive",
      });
      return;
    }

    setIsExportingToDrive(true);
    try {
      const response = await fetch("/api/export/google-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: googleProjectName.trim(),
          files: projectFiles,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Export failed");
      }
      toast({
        title: "Uploaded to Google Drive",
        description: `${data.fileCount} files in ${data.folderName}`,
      });
      if (data.folderUrl) {
        window.open(data.folderUrl, "_blank");
      }
      refreshIntegrationStatus();
    } catch (error: any) {
      toast({
        title: "Google Drive export failed",
        description: error.message || "Unable to export",
        variant: "destructive",
      });
    } finally {
      setIsExportingToDrive(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Fix & Deploy Workbench
          </DialogTitle>
          <DialogDescription>
            Request AI fixes, export work to Google Drive, and push builds to GitHub, Netlify, and Vercel without leaving the IDE.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="fix" className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="fix">Auto Fix</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="fix" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Describe the problem
                  </CardTitle>
                  <CardDescription>
                    Tell the AI what went wrong or what you want changed in {currentFile?.name ?? "your file"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="e.g., Fix the dark mode toggle not saving its state"
                    value={fixPrompt}
                    onChange={(event) => setFixPrompt(event.target.value)}
                    className="min-h-[160px]"
                  />
                  <Button onClick={handleRequestFix} disabled={isRequestingFix || !aiConnection.hasKey} className="w-full gap-2">
                    {isRequestingFix ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    {isRequestingFix ? "Summoning fix..." : "Ask AI for fix"}
                  </Button>
                  {!aiConnection.hasKey && (
                    <p className="text-xs text-muted-foreground text-center">
                      Connect GPT/Claude keys in Settings → AI Configuration to unlock auto-fixes.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Review & apply
                  </CardTitle>
                  <CardDescription>Preview the generated changes before committing them</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 flex-1 overflow-hidden">
                  <ScrollArea className="h-[180px] border rounded-md p-3 bg-muted/30">
                    {fixResponse ? (
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {fixResponse}
                      </pre>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        AI suggestions will appear here. Ask for a fix to get started.
                      </p>
                    )}
                  </ScrollArea>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Apply mode</Label>
                    <Select value={applyMode} onValueChange={(value) => setApplyMode(value as "replace" | "append")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="replace">Replace file with AI response</SelectItem>
                        <SelectItem value="append">Append AI suggestion to bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleApplyFix} disabled={!fixResponse} className="gap-2">
                    <UploadCloud className="h-4 w-4" />
                    Apply to {currentFile?.name ?? "file"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deploy" className="mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-primary" />
                    GitHub Push
                  </CardTitle>
                  <CardDescription>Ship edits to a repo directly from the IDE</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Repository name</Label>
                    <Input
                      placeholder="awesome-app"
                      value={repoName}
                      onChange={(event) => setRepoName(event.target.value)}
                    />
                  </div>
                  <Button onClick={handlePushToGitHub} disabled={isPushingToGitHub} className="w-full gap-2">
                    {isPushingToGitHub ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Cloud className="h-4 w-4" />
                    )}
                    {isPushingToGitHub ? "Pushing..." : "Push to GitHub"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlugZap className="h-4 w-4 text-primary" />
                    Netlify Deploy
                  </CardTitle>
                  <CardDescription>Deploy static builds via Netlify API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      placeholder="netlify token"
                      value={netlifyApiKey}
                      onChange={(event) => setNetlifyApiKey(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Site name (optional)</Label>
                    <Input
                      placeholder="you-n-i-verse"
                      value={netlifySiteName}
                      onChange={(event) => setNetlifySiteName(event.target.value)}
                    />
                  </div>
                  <Button onClick={handleDeployToNetlify} disabled={isDeployingToNetlify} className="w-full gap-2">
                    {isDeployingToNetlify ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    {isDeployingToNetlify ? "Deploying..." : "Deploy to Netlify"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-primary" />
                    Vercel Deploy
                  </CardTitle>
                  <CardDescription>Instant preview + production builds on Vercel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Personal token</Label>
                    <Input
                      type="password"
                      placeholder="vercel token"
                      value={vercelToken}
                      onChange={(event) => setVercelToken(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Project name</Label>
                    <Input
                      placeholder="studio-preview"
                      value={vercelProjectName}
                      onChange={(event) => setVercelProjectName(event.target.value)}
                    />
                  </div>
                  <Button onClick={handleDeployToVercel} disabled={isDeployingToVercel} className="w-full gap-2">
                    {isDeployingToVercel ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    {isDeployingToVercel ? "Deploying..." : "Deploy to Vercel"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-primary" />
                  Google Drive Export
                </CardTitle>
                <CardDescription>Snapshot the entire workspace into Drive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Folder name</Label>
                    <Input
                      value={googleProjectName}
                      onChange={(event) => setGoogleProjectName(event.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleExportToGoogleDrive} disabled={isExportingToDrive} className="w-full gap-2">
                      {isExportingToDrive ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <UploadCloud className="h-4 w-4" />
                      )}
                      {isExportingToDrive ? "Exporting..." : "Export to Drive"}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use Replit connectors to link your Google account, then run an export to verify the connection.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="mt-4">
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Integration Status
                    </CardTitle>
                    <CardDescription>Verify Google + GPT connectivity</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={refreshIntegrationStatus} disabled={isCheckingIntegrations} className="gap-2">
                    <RefreshCcw className={`h-4 w-4 ${isCheckingIntegrations ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Google Drive</p>
                        <p className="text-xs text-muted-foreground">Exports & backups</p>
                      </div>
                      <Badge variant={integrationStatus?.googleDrive?.connected ? "default" : "secondary"}>
                        {integrationStatus?.googleDrive?.connected ? "Connected" : "Not connected"}
                      </Badge>
                    </div>
                    {integrationStatus?.googleDrive?.connected ? (
                      <p className="text-xs text-muted-foreground">
                        Linked account {integrationStatus.googleDrive.account || "(hidden)"}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {integrationStatus?.googleDrive?.message || "Use Replit connectors → Google Drive"}
                      </p>
                    )}
                    <Button variant="outline" size="sm" onClick={handleExportToGoogleDrive} disabled={isExportingToDrive} className="mt-2">
                      Quick export test
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">AI Backend ({aiConnection.backend})</p>
                        <p className="text-xs text-muted-foreground">GPT / Claude / etc</p>
                      </div>
                      <Badge variant={aiConnection.hasKey ? "default" : "secondary"}>
                        {aiConnection.hasKey ? "Ready" : "Missing key"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure API keys in Settings → AI Configuration. The Fix Lab will use the active backend.
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <a href="/settings" target="_blank" rel="noreferrer">
                        Open AI settings
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Tips
                  </CardTitle>
                  <CardDescription>Make sure each provider has API access before triggering automations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• GitHub, Netlify, and Vercel actions require personal tokens pasted above.</p>
                  <p>• Google Drive export uses the Replit connector on the server—authorize it once per repl.</p>
                  <p>• GPT auto-fixes use whichever backend + API key is active inside Settings.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function flattenFiles(): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
  const allFiles = FileSystem.getAllFiles();

  function traverse(nodes: FileNode[], prefix = "") {
    nodes.forEach((node) => {
      if (node.type === "file") {
        files.push({
          path: `${prefix}${node.name}`,
          content: node.content || "",
        });
      } else if (node.type === "folder" && node.children) {
        traverse(node.children, `${prefix}${node.name}/`);
      }
    });
  }

  traverse(allFiles);
  return files;
}

function extractCodeFromResponse(response: string) {
  const fenceMatch = response.match(/```[\s\S]*?```/);
  if (fenceMatch) {
    return fenceMatch[0]
      .replace(/```[a-zA-Z]*\n?/, "")
      .replace(/```$/, "")
      .trim();
  }
  return response.trim();
}
