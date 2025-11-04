import { useState } from "react";
import { Play, Plus, Trash2, MoveUp, MoveDown, Sparkles, Download, Eye, Save, FileCode, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Scene {
  id: string;
  title: string;
  description: string;
  code?: string;
  narration?: string;
  duration: number;
  consciousnessTag?: {
    gate?: number;
    field?: string;
    resonance?: string;
  };
}

interface PresentationGlyph {
  id: string;
  code: string;
  scenes: Scene[];
  created: Date;
  symbol: string;
}

export default function PresentationPlanner() {
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: "1",
      title: "Introduction",
      description: "Welcome to the presentation",
      narration: "Welcome to this interactive code presentation",
      duration: 5
    }
  ]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>("1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<"manual" | "auto" | "rehearsal">("manual");
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [currentGlyph, setCurrentGlyph] = useState<PresentationGlyph | null>(null);
  const { toast } = useToast();

  const selectedScene = scenes.find(s => s.id === selectedSceneId);

  const addScene = () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      title: "New Scene",
      description: "Scene description",
      duration: 5
    };
    setScenes([...scenes, newScene]);
    setSelectedSceneId(newScene.id);
  };

  const deleteScene = (id: string) => {
    if (scenes.length === 1) {
      toast({ title: "Cannot delete the last scene" });
      return;
    }
    setScenes(scenes.filter(s => s.id !== id));
    if (selectedSceneId === id) {
      setSelectedSceneId(scenes[0].id);
    }
  };

  const moveScene = (id: string, direction: "up" | "down") => {
    const index = scenes.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === scenes.length - 1) return;

    const newScenes = [...scenes];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newScenes[index], newScenes[targetIndex]] = [newScenes[targetIndex], newScenes[index]];
    setScenes(newScenes);
  };

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const generateNarration = async () => {
    if (!selectedScene) return;
    toast({ title: "Generating AI narration..." });
    
    // Simulate AI generation
    setTimeout(() => {
      const narration = `In this scene, we explore ${selectedScene.title}. ${selectedScene.description}. This demonstrates the key concepts and provides insight into the implementation.`;
      updateScene(selectedScene.id, { narration });
      toast({ title: "Narration generated!" });
    }, 1500);
  };

  const playPresentation = () => {
    setIsPlaying(true);
    setCurrentSceneIndex(0);
    toast({ title: "Playing presentation..." });
  };

  const exportPresentation = () => {
    const data = JSON.stringify(scenes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.json';
    a.click();
    toast({ title: "Presentation exported!" });
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

  const generateGlyphSymbol = () => {
    const symbols = ["◉", "◎", "◈", "◇", "◆", "◊", "○", "●", "◐", "◑", "◒", "◓", "⬡", "⬢", "⬣", "⬤", "⬥", "⬦"];
    return symbols[Math.floor(Math.random() * symbols.length)];
  };

  const saveAsGlyph = () => {
    const glyph: PresentationGlyph = {
      id: Date.now().toString(),
      code: generateGlyphCode(),
      scenes: scenes,
      created: new Date(),
      symbol: generateGlyphSymbol()
    };
    
    setCurrentGlyph(glyph);
    
    // Save to localStorage
    const savedGlyphs = JSON.parse(localStorage.getItem('presentation-glyphs') || '[]');
    savedGlyphs.push(glyph);
    localStorage.setItem('presentation-glyphs', JSON.stringify(savedGlyphs));
    
    toast({ 
      title: "Glyph Generated!",
      description: `Code: ${glyph.code} ${glyph.symbol}`
    });
  };

  const exportToNotebook = () => {
    // Auto-save as glyph before export
    const exportGlyph = currentGlyph || {
      id: Date.now().toString(),
      code: generateGlyphCode(),
      scenes: scenes,
      created: new Date(),
      symbol: generateGlyphSymbol()
    };

    if (!currentGlyph) {
      setCurrentGlyph(exportGlyph);
    }

    // Generate Jupyter notebook with app features as concepts + glyph metadata
    const notebook = {
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: [
            `# ${scenes.length > 0 ? scenes[0].title : "Presentation"} - Interactive Notebook\n`,
            `\n`,
            `This notebook was generated from YOU-N-I-VERSE Presentation Planner.\n`,
            `Each scene is a concept that can be executed interactively.\n`,
            `\n`,
            `**Glyph Code:** \`${exportGlyph.code}\` ${exportGlyph.symbol}\n`,
            `**Created:** ${new Date(exportGlyph.created).toLocaleString()}\n`
          ]
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {
            tags: ["glyph-metadata"],
            collapsed: true
          },
          outputs: [],
          source: [
            "# GLYPH METADATA - DO NOT EDIT\n",
            "# This cell contains session continuity data\n",
            `GLYPH_DATA = ${JSON.stringify(exportGlyph, null, 2)}\n`,
            "print(f'✅ Glyph {GLYPH_DATA[\"code\"]} loaded')\n"
          ]
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            "# Setup and imports\n",
            "import json\n",
            "import sys\n",
            "from IPython.display import display, HTML, Markdown\n",
            "print('✅ Notebook initialized')\n"
          ]
        },
        ...scenes.map((scene, index) => ([
          {
            cell_type: "markdown",
            metadata: {},
            source: [
              `## Scene ${index + 1}: ${scene.title}\n`,
              `\n`,
              `${scene.description}\n`,
              scene.narration ? `\n> **Narration:** ${scene.narration}\n` : "",
              scene.consciousnessTag ? `\n**Consciousness Tag:** Gate ${scene.consciousnessTag.gate || "?"} | Field: ${scene.consciousnessTag.field || "Unknown"} | Resonance: ${scene.consciousnessTag.resonance || "Neutral"}\n` : ""
            ]
          },
          {
            cell_type: "code",
            execution_count: null,
            metadata: {},
            outputs: [],
            source: scene.code ? scene.code.split('\n').map(line => line + '\n') : ["# No code for this scene\npass\n"]
          }
        ])).flat()
      ],
      metadata: {
        kernelspec: {
          display_name: "Python 3",
          language: "python",
          name: "python3"
        },
        language_info: {
          name: "python",
          version: "3.10.0"
        }
      },
      nbformat: 4,
      nbformat_minor: 5
    };

    const data = JSON.stringify(notebook, null, 2);
    const blob = new Blob([data], { type: 'application/x-ipynb+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation_notebook.ipynb';
    a.click();
    toast({ 
      title: "Notebook exported!",
      description: "Open in Jupyter, Google Colab, or any notebook environment"
    });
  };

  const generateOverview = () => {
    const overview = scenes.map((scene, i) => 
      `${i + 1}. ${scene.title} (${scene.duration}s)\n   ${scene.description}`
    ).join('\n\n');
    return overview;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-title">Presentation Planner</h1>
            <p className="text-sm text-muted-foreground">Turn your code into interactive stories</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportPresentation} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={saveAsGlyph} data-testid="button-save-glyph">
              <Save className="h-4 w-4 mr-2" />
              Save as Glyph {currentGlyph && `(${currentGlyph.symbol})`}
            </Button>
            <Button variant="outline" onClick={exportToNotebook} data-testid="button-export-notebook">
              <FileCode className="h-4 w-4 mr-2" />
              Export Notebook
            </Button>
            <Button onClick={playPresentation} data-testid="button-play">
              <Play className="h-4 w-4 mr-2" />
              Play Presentation
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Scene List */}
        <div className="w-80 border-r bg-card">
          <div className="p-4 border-b">
            <Button className="w-full" onClick={addScene} data-testid="button-add-scene">
              <Plus className="h-4 w-4 mr-2" />
              Add Scene
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-4 space-y-2">
              {scenes.map((scene, index) => (
                <Card
                  key={scene.id}
                  className={`cursor-pointer transition-colors ${
                    selectedSceneId === scene.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedSceneId(scene.id)}
                  data-testid={`card-scene-${scene.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">Scene {index + 1}</div>
                        <div className="font-semibold">{scene.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">{scene.duration}s</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); moveScene(scene.id, "up"); }}
                          data-testid={`button-move-up-${scene.id}`}
                        >
                          <MoveUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); moveScene(scene.id, "down"); }}
                          data-testid={`button-move-down-${scene.id}`}
                        >
                          <MoveDown className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); deleteScene(scene.id); }}
                          data-testid={`button-delete-${scene.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Scene Editor */}
        <div className="flex-1 overflow-auto">
          {selectedScene && (
            <div className="p-6 space-y-6">
              {/* Step-by-Step Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Step-by-Step Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {generateOverview()}
                    </pre>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p><strong>Total Duration:</strong> {scenes.reduce((sum, s) => sum + s.duration, 0)} seconds</p>
                    <p><strong>Total Scenes:</strong> {scenes.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scene Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={selectedScene.title}
                      onChange={(e) => updateScene(selectedScene.id, { title: e.target.value })}
                      placeholder="Scene title"
                      data-testid="input-scene-title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      value={selectedScene.description}
                      onChange={(e) => updateScene(selectedScene.id, { description: e.target.value })}
                      placeholder="Describe what happens in this scene"
                      rows={3}
                      data-testid="input-scene-description"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration (seconds)</label>
                    <Input
                      type="number"
                      value={selectedScene.duration}
                      onChange={(e) => updateScene(selectedScene.id, { duration: parseInt(e.target.value) || 5 })}
                      min={1}
                      max={60}
                      data-testid="input-scene-duration"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Code Snippet (Optional)</label>
                    <Textarea
                      value={selectedScene.code || ''}
                      onChange={(e) => updateScene(selectedScene.id, { code: e.target.value })}
                      placeholder="// Add code to display in this scene"
                      rows={6}
                      className="font-mono text-sm"
                      data-testid="input-scene-code"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>AI Narration</CardTitle>
                  <Button onClick={generateNarration} size="sm" data-testid="button-generate-narration">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={selectedScene.narration || ''}
                    onChange={(e) => updateScene(selectedScene.id, { narration: e.target.value })}
                    placeholder="AI-generated narration will appear here, or write your own..."
                    rows={4}
                    data-testid="input-scene-narration"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consciousness Tagging (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Tag this scene with consciousness metadata for deeper resonance tracking
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Gate (1-64)</label>
                      <Input
                        type="number"
                        value={selectedScene.consciousnessTag?.gate || ''}
                        onChange={(e) => updateScene(selectedScene.id, { 
                          consciousnessTag: { 
                            ...selectedScene.consciousnessTag, 
                            gate: parseInt(e.target.value) || undefined 
                          }
                        })}
                        placeholder="47"
                        min={1}
                        max={64}
                        data-testid="input-consciousness-gate"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Field</label>
                      <Input
                        value={selectedScene.consciousnessTag?.field || ''}
                        onChange={(e) => updateScene(selectedScene.id, { 
                          consciousnessTag: { 
                            ...selectedScene.consciousnessTag, 
                            field: e.target.value 
                          }
                        })}
                        placeholder="Mind, Body, Heart..."
                        data-testid="input-consciousness-field"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Resonance</label>
                      <Input
                        value={selectedScene.consciousnessTag?.resonance || ''}
                        onChange={(e) => updateScene(selectedScene.id, { 
                          consciousnessTag: { 
                            ...selectedScene.consciousnessTag, 
                            resonance: e.target.value 
                          }
                        })}
                        placeholder="High, Low, Neutral..."
                        data-testid="input-consciousness-resonance"
                      />
                    </div>
                  </div>
                  {selectedScene.consciousnessTag?.gate && (
                    <div className="p-3 bg-primary/10 rounded border border-primary/20 text-sm">
                      ✨ Scene resonating at Gate {selectedScene.consciousnessTag.gate}
                      {selectedScene.consciousnessTag.field && ` in ${selectedScene.consciousnessTag.field} field`}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-6 bg-muted/50">
                    <h3 className="text-xl font-bold mb-2">{selectedScene.title}</h3>
                    <p className="text-muted-foreground mb-4">{selectedScene.description}</p>
                    {selectedScene.code && (
                      <pre className="bg-background p-4 rounded border text-sm overflow-x-auto">
                        <code>{selectedScene.code}</code>
                      </pre>
                    )}
                    {selectedScene.narration && (
                      <div className="mt-4 p-4 bg-primary/10 rounded border border-primary/20">
                        <div className="flex items-start gap-2">
                          <Eye className="h-4 w-4 mt-1 text-primary" />
                          <p className="text-sm italic">{selectedScene.narration}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Presentation Player Modal */}
      {isPlaying && (
        <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
          <div className="max-w-4xl w-full p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Scene {currentSceneIndex + 1} of {scenes.length}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={playbackMode === "manual" ? "default" : "outline"}
                    onClick={() => setPlaybackMode("manual")}
                  >
                    Manual
                  </Button>
                  <Button 
                    size="sm" 
                    variant={playbackMode === "auto" ? "default" : "outline"}
                    onClick={() => {
                      setPlaybackMode("auto");
                      setIsAutoPlaying(true);
                    }}
                  >
                    Auto-Play
                  </Button>
                  <Button 
                    size="sm" 
                    variant={playbackMode === "rehearsal" ? "default" : "outline"}
                    onClick={() => setPlaybackMode("rehearsal")}
                  >
                    Rehearsal
                  </Button>
                </div>
              </div>
              <Button variant="outline" onClick={() => { setIsPlaying(false); setIsAutoPlaying(false); }} data-testid="button-stop-presentation">
                Stop Presentation
              </Button>
            </div>
            {scenes[currentSceneIndex] && (
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-4">{scenes[currentSceneIndex].title}</h2>
                  <p className="text-xl text-muted-foreground mb-6">{scenes[currentSceneIndex].description}</p>
                  {scenes[currentSceneIndex].code && (
                    <pre className="bg-muted p-6 rounded-lg text-sm mb-6 overflow-x-auto">
                      <code>{scenes[currentSceneIndex].code}</code>
                    </pre>
                  )}
                  {scenes[currentSceneIndex].narration && (
                    <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-lg italic">{scenes[currentSceneIndex].narration}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
                disabled={currentSceneIndex === 0}
                data-testid="button-prev-scene"
              >
                Previous
              </Button>
              <Button
                onClick={() => {
                  if (currentSceneIndex < scenes.length - 1) {
                    setCurrentSceneIndex(currentSceneIndex + 1);
                  } else {
                    setIsPlaying(false);
                  }
                }}
                data-testid="button-next-scene"
              >
                {currentSceneIndex < scenes.length - 1 ? 'Next' : 'Finish'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
