import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Upload, FileArchive, File, Folder, Trash2, History, AlertCircle, Wrench, Code2, Download, ChevronDown } from "lucide-react";
import JSZip from "jszip";
import { useToast } from "@/hooks/use-toast";
import { UserCreations, type UserCreation } from "@/lib/userCreations";
import { FileSystem } from "@/lib/fileSystem";
import { Card } from "@/components/ui/card";
import { autoFixZip, ZipAutoFix } from "@/lib/zipAutoFix";
import { Badge } from "@/components/ui/badge";
import { ZipAnalyzer, type EntryPoint, type CodeIssue } from "@/lib/zipAnalyzer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ZipEntry {
  name: string;
  isFolder: boolean;
  content?: string;
}

export function PlayerPanel() {
  const [zipContents, setZipContents] = useState<ZipEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<ZipEntry | null>(null);
  const [zipName, setZipName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'current' | 'creations'>('current');
  const [userCreations, setUserCreations] = useState<UserCreation[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [executableContent, setExecutableContent] = useState<string>("");
  const [entryPoint, setEntryPoint] = useState<EntryPoint | null>(null);
  const [codeIssues, setCodeIssues] = useState<CodeIssue[]>([]);
  const [showIssues, setShowIssues] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [zipProblems, setZipProblems] = useState<{ fixes: string[]; warnings: string[]; errors: string[] } | null>(null);
  const [canAutoFix, setCanAutoFix] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setUserCreations(UserCreations.getAll());
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast({
        title: "Invalid file",
        description: "Please upload a .zip file",
        variant: "destructive"
      });
      return;
    }

    try {
      // First, validate the ZIP and check for problems
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      const fixer = new ZipAutoFix();
      const validation = await fixer.validateZip(contents);
      
      // Check if there are any issues
      const hasIssues = validation.errors.length > 0 || validation.warnings.length > 0;
      
      if (hasIssues) {
        // Store the file and show problems
        setPendingFile(file);
        setZipProblems({
          fixes: [],
          warnings: validation.warnings,
          errors: validation.errors
        });
        
        // Determine if auto-fix can help
        const canFix = validation.errors.length === 0 || 
                       validation.errors.some(err => 
                         err.includes('empty') || 
                         err.includes('entry point') ||
                         err.includes('system file')
                       );
        setCanAutoFix(canFix);
        return;
      }
      
      // No issues, proceed normally
      await processZipFile(contents, file.name);

    } catch (error: any) {
      toast({
        title: "Error loading ZIP",
        description: error.message || "Failed to load ZIP file",
        variant: "destructive"
      });
    }
  };

  const processZipFile = async (contents: JSZip, fileName: string) => {
    try {
      const entries: ZipEntry[] = [];

      for (const [path, zipEntry] of Object.entries(contents.files)) {
        if (zipEntry.dir) {
          entries.push({ name: path, isFolder: true });
        } else {
          const content = await zipEntry.async('text');
          entries.push({ name: path, isFolder: false, content });
        }
      }

      setZipContents(entries);
      setZipName(fileName);
      setIsPlaying(false);
      setZipProblems(null);
      setCanAutoFix(false);
      setPendingFile(null);
      
      // Detect entry point intelligently
      const detectedEntry = ZipAnalyzer.detectEntryPoint(entries);
      setEntryPoint(detectedEntry);
      
      // Analyze code for issues
      const issues = ZipAnalyzer.analyzeCode(entries);
      setCodeIssues(issues);
      
      // Generate executable content
      if (detectedEntry) {
        const executable = ZipAnalyzer.generateExecutableHTML(entries, detectedEntry);
        setExecutableContent(executable);
      } else {
        setExecutableContent("");
      }
      
      // Save to user creations
      UserCreations.add({
        name: fileName,
        type: 'zip',
        fileCount: entries.length,
        description: `Uploaded ${new Date().toLocaleDateString()}`
      });
      setUserCreations(UserCreations.getAll());
      
      const issueWarning = issues.length > 0 ? ` (${issues.length} issues detected)` : '';
      toast({
        title: "Success!",
        description: `Loaded ${entries.length} items from ${fileName}${issueWarning}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read zip file",
        variant: "destructive"
      });
      console.error('Zip reading error:', error);
    }
  };

  const handleAutoFix = async () => {
    if (!pendingFile) return;

    try {
      toast({
        title: "Fixing ZIP...",
        description: "Applying automatic fixes to your project"
      });

      const { zip: fixedZip, result } = await autoFixZip(pendingFile);

      if (result.success) {
        // Show what was fixed
        if (result.fixes.length > 0) {
          toast({
            title: "Auto-Fix Complete!",
            description: `Applied ${result.fixes.length} fixes to your ZIP file`
          });
        }

        // Process the fixed ZIP
        await processZipFile(fixedZip, pendingFile.name);
      } else {
        toast({
          title: "Auto-Fix Failed",
          description: "Could not automatically fix all issues. Please see the agent for help.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Auto-Fix Error",
        description: error.message || "Failed to fix ZIP file",
        variant: "destructive"
      });
    }
  };

  const handleDismissProblems = () => {
    setZipProblems(null);
    setCanAutoFix(false);
    setPendingFile(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileClick = (entry: ZipEntry) => {
    if (!entry.isFolder) {
      setSelectedFile(entry);
      
      // Check if this is the detected entry point file
      // Compare by extracting basename from both paths to handle directory prefixes
      const entryBasename = entry.name.split('/').pop() || entry.name;
      const entryPointBasename = entryPoint?.file.split('/').pop();
      
      const isDetectedEntryPoint = entryPointBasename && entryBasename === entryPointBasename;
      
      if (isDetectedEntryPoint && executableContent) {
        if (confirm(`Are you sure you want to play ${entry.name}?`)) {
          handlePlayProject();
        }
      }
    }
  };

  const handleDeleteCreation = (id: string) => {
    if (confirm('Delete this creation from your library?')) {
      UserCreations.remove(id);
      setUserCreations(UserCreations.getAll());
      toast({
        title: "Deleted",
        description: "Creation removed from library"
      });
    }
  };

  const handlePlayCreation = (creation: UserCreation) => {
    toast({
      title: "Loading Creation",
      description: `Loading ${creation.name}...`
    });
    setActiveTab('current');
    // Note: In a full implementation, we'd reload the zip file from storage
  };

  const handleDownloadCreation = async (creation: UserCreation) => {
    try {
      // Create a simple zip with the creation data
      const zip = new JSZip();
      
      // Add glyph manifest
      if (creation.glyph) {
        zip.file('glyph-manifest.json', JSON.stringify(creation.glyph, null, 2));
      }
      
      // Generate zip blob
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Use the UserCreations download method with glyph tagging
      UserCreations.downloadWithGlyph(creation, blob);
      
      toast({
        title: "Download Started",
        description: `${creation.name} tagged with glyph ${creation.glyph?.glyph_id || 'signature'}`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not prepare download",
        variant: "destructive"
      });
    }
  };

  const handleEditCreation = (creation: UserCreation) => {
    if (zipContents.length === 0) {
      toast({
        title: "Cannot edit",
        description: "No project currently loaded. Upload the ZIP file again first.",
        variant: "destructive"
      });
      return;
    }
    
    // Load current ZIP contents into IDE
    handleEditCurrentProject();
  };

  const handleEditCurrentProject = () => {
    if (zipContents.length === 0) {
      toast({
        title: "Cannot edit",
        description: "Upload a ZIP file first",
        variant: "destructive"
      });
      return;
    }

    try {
      FileSystem.loadFromZipEntries(zipContents);
      toast({
        title: "Success!",
        description: `Loaded ${zipContents.length} files into IDE`,
      });
      
      // Navigate to IDE after a brief delay
      setTimeout(() => {
        window.location.href = '/ide';
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load files into IDE",
        variant: "destructive"
      });
      console.error('Failed to load ZIP into IDE:', error);
    }
  };

  const handlePlayProject = () => {
    if (!executableContent || !entryPoint) {
      toast({
        title: "Cannot play project",
        description: "No entry point detected. Upload a project with index.html, main.js, or similar.",
        variant: "destructive"
      });
      return;
    }
    setIsPlaying(true);
    setShowIssues(false);
  };

  const handleStopPlaying = () => {
    setIsPlaying(false);
  };

  const handleDownloadAs = (format: 'exe' | 'apk' | 'pwa') => {
    toast({
      title: `${format.toUpperCase()} Export`,
      description: `Exporting as ${format.toUpperCase()} - Coming in the next update!`,
    });
    // TODO: Implement EXE, APK, PWA export
  };

  return (
    <div className="min-h-screen bg-background">

      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Creative Bundle Player</h1>
            <p className="text-muted-foreground">
              Upload and explore zipped creative universes
            </p>
          </div>
          <Button
            data-testid="button-help"
            variant="outline"
            size="icon"
            onClick={() => setShowHelp(!showHelp)}
            className="border-primary/30 hover:bg-primary/10"
          >
            <AlertCircle className="h-5 w-5 text-primary" />
          </Button>
        </div>

        {zipProblems && (
          <Alert className="mb-6 bg-destructive/10 border-destructive/30">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive">ZIP Problems Detected</AlertTitle>
            <AlertDescription className="mt-3 space-y-3 text-sm">
              {zipProblems.errors.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">Errors:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {zipProblems.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {zipProblems.warnings.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">Warnings:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {zipProblems.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                {canAutoFix ? (
                  <Button
                    onClick={handleAutoFix}
                    className="bg-primary hover:bg-primary/90 touch-manipulation"
                    data-testid="button-autofix-zip"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Fix Automatically
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      toast({
                        title: "Need Help?",
                        description: "Open the AI Guard Dog assistant (bottom right) for help fixing these issues"
                      });
                    }}
                    variant="outline"
                    data-testid="button-see-agent"
                    className="touch-manipulation"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Ask Guard Dog
                  </Button>
                )}
                <Button
                  onClick={handleDismissProblems}
                  variant="outline"
                  data-testid="button-dismiss-problems"
                  className="touch-manipulation"
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {showHelp && (
          <Alert className="mb-6 bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">How to Use the Creative Bundle Player</AlertTitle>
            <AlertDescription className="mt-3 space-y-3 text-sm">
              <div>
                <p className="font-semibold mb-1">📦 Uploading Projects</p>
                <p className="text-muted-foreground">Click "Upload Zip Bundle" and select a .zip file containing your project. The player will automatically detect the entry point (index.html, main.js, etc.).</p>
              </div>
              <div>
                <p className="font-semibold mb-1">▶️ Playing Projects</p>
                <p className="text-muted-foreground">Once uploaded, click the "Play" button to run your project in the preview window. The system supports HTML/CSS/JavaScript projects.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">🔍 Code Analysis</p>
                <p className="text-muted-foreground">The player automatically scans your code for issues. Click "Issues" to view detected problems and get suggestions for fixes.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">💾 User Creations</p>
                <p className="text-muted-foreground">All uploaded projects are saved to your library. Switch to the "User Creations" tab to Play, Edit, or Delete saved projects.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">🐛 Debug Mode</p>
                <p className="text-muted-foreground">If a project doesn't display correctly, click "Debug: View generated HTML" to see the exact code being executed.</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 mb-6">
          <Button
            data-testid="button-tab-current"
            variant={activeTab === 'current' ? 'default' : 'outline'}
            onClick={() => setActiveTab('current')}
            className={activeTab === 'current' ? 'bg-primary hover:bg-primary/90' : ''}
          >
            <Play className="h-4 w-4 mr-2" />
            Current Project
          </Button>
          <Button
            data-testid="button-tab-creations"
            variant={activeTab === 'creations' ? 'default' : 'outline'}
            onClick={() => setActiveTab('creations')}
            className={activeTab === 'creations' ? 'bg-primary hover:bg-primary/90' : ''}
          >
            <History className="h-4 w-4 mr-2" />
            User Creations ({userCreations.length})
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileUpload}
          className="hidden"
          data-testid="input-zip-file"
        />

        {activeTab === 'creations' ? (
          <div>
            {userCreations.length === 0 ? (
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-12 text-center bg-card">
                <History className="h-16 w-16 mx-auto mb-4 text-primary/40" />
                <h3 className="text-lg font-semibold mb-2">No creations yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload zip files to build your creation library
                </p>
                <Button
                  onClick={() => setActiveTab('current')}
                  variant="outline"
                >
                  Upload Your First Creation
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCreations.map((creation) => (
                  <Card key={creation.id} className="p-6 hover:border-primary/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileArchive className="h-5 w-5 text-primary" />
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {creation.type}
                        </span>
                      </div>
                      <Button
                        data-testid={`button-delete-${creation.id}`}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteCreation(creation.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <h3 className="font-semibold mb-1 truncate">{creation.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{creation.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>{creation.fileCount} files</span>
                      <span>{new Date(creation.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1 text-xs justify-center">
                      <Button
                        data-testid={`button-play-${creation.id}`}
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() => handlePlayCreation(creation)}
                      >
                        <Play className="h-3 w-3" />
                        <span>|</span>
                        <span>Play</span>
                      </Button>
                      <Button
                        data-testid={`button-download-${creation.id}`}
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() => handleDownloadCreation(creation)}
                      >
                        <Download className="h-3 w-3" />
                        <span>|</span>
                        <span>Download</span>
                      </Button>
                      <Button
                        data-testid={`button-edit-${creation.id}`}
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() => handleEditCreation(creation)}
                      >
                        <File className="h-3 w-3" />
                        <span>|</span>
                        <span>Edit</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : zipContents.length === 0 ? (
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-12 text-center bg-card">
            <FileArchive className="h-16 w-16 mx-auto mb-4 text-primary/40" />
            <h3 className="text-lg font-semibold mb-2">Drop a .zip file to play</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Or click below to browse your files
            </p>
            <Button
              data-testid="button-upload-zip"
              className="bg-primary hover:bg-primary/90"
              onClick={handleUploadClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Zip Bundle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border rounded-lg bg-card p-4">
              <div className="mb-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <FileArchive className="h-4 w-4 text-primary" />
                  {zipName}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {executableContent && (
                    <Button
                      data-testid="button-play-project"
                      variant={isPlaying ? "outline" : "default"}
                      size="sm"
                      onClick={isPlaying ? handleStopPlaying : handlePlayProject}
                      className={!isPlaying ? "bg-primary hover:bg-primary/90" : ""}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isPlaying ? "Stop" : "Play"}
                    </Button>
                  )}
                  {codeIssues.length > 0 && (
                    <Button
                      data-testid="button-show-issues"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowIssues(!showIssues)}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Issues ({codeIssues.length})
                    </Button>
                  )}
                  <Button
                    data-testid="button-edit-in-ide"
                    variant="outline"
                    size="sm"
                    onClick={handleEditCurrentProject}
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    Edit in IDE
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid="button-download-as"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download As
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleDownloadAs('pwa')}>
                        <Download className="h-3 w-3 mr-2" />
                        PWA (Progressive Web App)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadAs('apk')}>
                        <Download className="h-3 w-3 mr-2" />
                        APK (Android App)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadAs('exe')}>
                        <Download className="h-3 w-3 mr-2" />
                        EXE (Windows App)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUploadClick}
                  >
                    Load New
                  </Button>
                </div>
              </div>

              {entryPoint && (
                <div className="mb-4 p-3 bg-primary/10 rounded border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Play className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Entry Point Detected</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{entryPoint.file}</p>
                      <p className="text-xs text-muted-foreground mt-1">{entryPoint.reason}</p>
                      <Badge className="mt-2 bg-primary/20 text-primary text-xs">
                        {entryPoint.type} • {Math.round(entryPoint.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {showIssues && codeIssues.length > 0 && (
                <div className="mb-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Code Issues Detected</AlertTitle>
                    <AlertDescription>
                      <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto">
                        {codeIssues.map((issue, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-background rounded border text-xs"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={issue.severity === 'error' ? 'destructive' : 'outline'}
                                className="text-xs"
                              >
                                {issue.severity}
                              </Badge>
                              <span className="font-mono text-muted-foreground">{issue.file}</span>
                            </div>
                            <p className="font-medium">{issue.message}</p>
                            {issue.suggestion && (
                              <p className="text-muted-foreground mt-1">{issue.suggestion}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        data-testid="button-open-guard-dog"
                        onClick={() => {
                          toast({
                            title: "AI Guard Dog Ready",
                            description: "Open the AI Assistant to get help fixing these issues"
                          });
                        }}
                      >
                        <Wrench className="h-3 w-3 mr-2" />
                        Ask Guard Dog for Help
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {zipContents.map((entry, idx) => (
                  <div
                    key={idx}
                    data-testid={`zip-entry-${idx}`}
                    onClick={() => handleFileClick(entry)}
                    className={`flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer text-sm ${
                      selectedFile?.name === entry.name ? 'bg-primary/10 border border-primary/30' : ''
                    }`}
                  >
                    {entry.isFolder ? (
                      <Folder className="h-4 w-4 text-primary/60" />
                    ) : (
                      <File className="h-4 w-4 text-primary" />
                    )}
                    <span className="font-mono text-xs truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg bg-card p-4">
              <h3 className="font-semibold mb-4">
                {isPlaying ? "Running Project" : "Preview"}
              </h3>
              {isPlaying ? (
                <div className="space-y-2">
                  {!executableContent ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Cannot Run Project</AlertTitle>
                      <AlertDescription>
                        No executable content generated. The zip may be missing an entry point file.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="bg-white rounded overflow-hidden border-2 border-primary/20">
                        <iframe
                          data-testid="iframe-project-player"
                          srcDoc={executableContent}
                          className="w-full h-[500px] border-0"
                          sandbox="allow-scripts allow-same-origin allow-forms"
                          title="Project Preview"
                        />
                      </div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Debug: View generated HTML
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
                          {executableContent}
                        </pre>
                      </details>
                      <div className="mt-4 p-4 border rounded-lg bg-primary/5 border-primary/20">
                        <h4 className="text-sm font-semibold mb-1 text-primary">What is a Creative Bundle?</h4>
                        <p className="text-xs text-muted-foreground">
                          Creative bundles are .zip files containing complete projects, games, or interactive experiences.
                          The YOU–N–I–Versal Player extracts and displays their contents in a safe environment.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : selectedFile ? (
                <div>
                  <div className="mb-2 text-sm text-muted-foreground font-mono">
                    {selectedFile.name}
                  </div>
                  <pre className="bg-muted p-4 rounded text-xs overflow-x-auto max-h-[500px] overflow-y-auto">
                    {selectedFile.content || 'No content'}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <File className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">
                      {executableContent 
                        ? "Click Play to run the project" 
                        : "Select a file to preview"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 p-6 border rounded-lg bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2 text-primary">What is a Creative Bundle?</h3>
          <p className="text-sm text-muted-foreground">
            Creative bundles are .zip files containing complete projects, games, or interactive experiences.
            The YOU–N–I–Versal Player extracts and displays their contents in a safe environment.
          </p>
        </div>
      </div>
    </div>
  );
}
