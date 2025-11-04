import { useState } from "react";
import { QrCode, Download, Upload, Share2, Sparkles, Clock, Users, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Glyph {
  id: string;
  code: string;
  name: string;
  created: Date;
  symbol: string;
  data: any;
  shared: boolean;
}

export default function ContinuityGlyph() {
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);
  const [glyphCode, setGlyphCode] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [generatedGlyph, setGeneratedGlyph] = useState<Glyph | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateGlyphSymbol = () => {
    const symbols = ["◉", "◎", "◈", "◇", "◆", "◊", "○", "●", "◐", "◑", "◒", "◓", "⬡", "⬢", "⬣", "⬤", "⬥", "⬦"];
    return symbols[Math.floor(Math.random() * symbols.length)];
  };

  const generateGlyphCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 3 || i === 7) code += '-';
    }
    return code;
  };

  const generateGlyph = () => {
    if (!workspaceName.trim()) {
      toast({ title: "Please enter a workspace name" });
      return;
    }

    const newGlyph: Glyph = {
      id: Date.now().toString(),
      code: generateGlyphCode(),
      name: workspaceName,
      created: new Date(),
      symbol: generateGlyphSymbol(),
      data: {
        files: [],
        settings: {},
        timestamp: Date.now()
      },
      shared: false
    };

    setGlyphs([newGlyph, ...glyphs]);
    setGeneratedGlyph(newGlyph);
    setWorkspaceName("");
    toast({ 
      title: "Glyph Generated!",
      description: `Your workspace "${newGlyph.name}" has been saved as glyph ${newGlyph.code}`
    });
  };

  const loadGlyph = () => {
    if (!glyphCode.trim()) {
      toast({ title: "Please enter a glyph code" });
      return;
    }

    const glyph = glyphs.find(g => g.code === glyphCode.toUpperCase());
    if (glyph) {
      toast({
        title: "Glyph Loaded!",
        description: `Workspace "${glyph.name}" has been restored`
      });
      setGlyphCode("");
    } else {
      toast({
        title: "Glyph not found",
        description: "The code you entered doesn't match any saved glyphs",
        variant: "destructive"
      });
    }
  };

  const shareGlyph = (glyph: Glyph) => {
    const updatedGlyphs = glyphs.map(g => 
      g.id === glyph.id ? { ...g, shared: true } : g
    );
    setGlyphs(updatedGlyphs);
    toast({
      title: "Glyph Shared!",
      description: "Your glyph code can now be used by collaborators"
    });
  };

  const copyGlyphCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Code copied to clipboard!" });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-title">Continuity Glyph System</h1>
          <p className="text-muted-foreground">
            Portable session states - preserve your creative continuity anywhere
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Generate Glyph */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Glyph
              </CardTitle>
              <CardDescription>
                Save your current workspace state as a portable glyph
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Workspace Name</label>
                <Input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="My Creative Project"
                  data-testid="input-workspace-name"
                />
              </div>
              <Button className="w-full" onClick={generateGlyph} data-testid="button-generate-glyph">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Glyph
              </Button>

              {generatedGlyph && (
                <div className="p-6 border rounded-lg bg-muted/50 space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="text-6xl">{generatedGlyph.symbol}</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-sm text-muted-foreground">Your Glyph Code</div>
                    <div className="font-mono text-2xl font-bold tracking-wider">
                      {generatedGlyph.code}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyGlyphCode(generatedGlyph.code)}
                      data-testid="button-copy-code"
                    >
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Load Glyph */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Enter Glyph
              </CardTitle>
              <CardDescription>
                Restore a workspace from any device using a glyph code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Glyph Code</label>
                <Input
                  value={glyphCode}
                  onChange={(e) => setGlyphCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX"
                  className="font-mono tracking-wider"
                  data-testid="input-glyph-code"
                />
              </div>
              <Button className="w-full" onClick={loadGlyph} data-testid="button-load-glyph">
                <Upload className="h-4 w-4 mr-2" />
                Load Glyph
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                Enter a glyph code to instantly restore that workspace state
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Glyphs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Glyphs
            </CardTitle>
            <CardDescription>
              All your saved workspace states
            </CardDescription>
          </CardHeader>
          <CardContent>
            {glyphs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No glyphs yet. Generate your first glyph to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {glyphs.map((glyph) => (
                  <Card key={glyph.id} className="border-muted" data-testid={`card-glyph-${glyph.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{glyph.symbol}</div>
                          <div>
                            <div className="font-semibold">{glyph.name}</div>
                            <div className="text-sm font-mono text-muted-foreground">
                              {glyph.code}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Created {glyph.created.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {glyph.shared && (
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyGlyphCode(glyph.code)}
                            data-testid={`button-copy-${glyph.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {!glyph.shared && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => shareGlyph(glyph)}
                              data-testid={`button-share-${glyph.id}`}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              setGlyphCode(glyph.code);
                              loadGlyph();
                            }}
                            data-testid={`button-restore-${glyph.id}`}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Restore
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Info */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Instant Continuity</div>
                  <div className="text-sm text-muted-foreground">
                    Resume your work from any device with a single code
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Share2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Collaboration</div>
                  <div className="text-sm text-muted-foreground">
                    Share glyphs with team members for instant sync
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Symbolic Identity</div>
                  <div className="text-sm text-muted-foreground">
                    Each glyph has a unique geometric symbol
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
