import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Coins,
  Sparkles,
  Layers,
  Brain,
  Eye,
  Heart,
  Lightbulb,
  User,
  Globe,
  Infinity,
  Play,
  Download,
  Trash2,
  ChevronRight,
  Shuffle,
  Calendar,
  Dna
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UniverseViewer3D } from "@/components/UniverseViewer3D";
import { TopNav } from "@/components/TopNav";
import { AIService } from "@/lib/AIService";

interface SemanticLayer {
  id: number;
  name: string;
  function: string;
  icon: React.ReactNode;
  color: string;
  extractedData?: string;
}

interface Universe {
  id: string;
  name: string;
  prompt: string;
  createdAt: string;
  layers: SemanticLayer[];
  seed: string;
}

const SEMANTIC_LAYERS: SemanticLayer[] = [
  {
    id: 1,
    name: "Physical / Substrate",
    function: "Environment, sensory input, motion",
    icon: <Globe className="h-4 w-4" />,
    color: "text-red-500"
  },
  {
    id: 2,
    name: "Energetic / Affective",
    function: "Emotion, tone, feeling states",
    icon: <Heart className="h-4 w-4" />,
    color: "text-primary"
  },
  {
    id: 3,
    name: "Perceptual / Semantic",
    function: "Symbols, categories, relationships",
    icon: <Eye className="h-4 w-4" />,
    color: "text-muted-foreground"
  },
  {
    id: 4,
    name: "Cognitive / Reasoning",
    function: "Context, inference, logic",
    icon: <Brain className="h-4 w-4" />,
    color: "text-green-500"
  },
  {
    id: 5,
    name: "Reflective / Meta-Cognitive",
    function: "Self-observation, thought patterns",
    icon: <Lightbulb className="h-4 w-4" />,
    color: "text-blue-500"
  },
  {
    id: 6,
    name: "Transpersonal / Archetypal",
    function: "Mythic patterns, collective memory",
    icon: <User className="h-4 w-4" />,
    color: "text-primary"
  },
  {
    id: 7,
    name: "Void / Potential",
    function: "Pure possibility, latent creativity",
    icon: <Infinity className="h-4 w-4" />,
    color: "text-primary"
  }
];

export function SemanticUniverseCreator() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [universeName, setUniverseName] = useState("");
  const [tokens, setTokens] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [selectedUniverse, setSelectedUniverse] = useState<Universe | null>(null);
  const [playingUniverse, setPlayingUniverse] = useState<Universe | null>(null);
  const [birthday, setBirthday] = useState("");
  const [oracleMode, setOracleMode] = useState(false);
  const [autonomyEnabled, setAutonomyEnabled] = useState(false);

  useEffect(() => {
    loadUniverses();
    loadTokens();
    loadAutonomyState();
    
    const handleAutonomyChange = (e: CustomEvent) => {
      setAutonomyEnabled(e.detail.enabled);
    };
    
    window.addEventListener("autonomy-state-changed" as any, handleAutonomyChange as any);
    return () => {
      window.removeEventListener("autonomy-state-changed" as any, handleAutonomyChange as any);
    };
  }, []);

  const loadAutonomyState = () => {
    const stored = localStorage.getItem("autonomy_enabled");
    if (stored) {
      setAutonomyEnabled(JSON.parse(stored));
    }
  };

  const loadUniverses = () => {
    const stored = localStorage.getItem("semantic_universes");
    if (stored) {
      setUniverses(JSON.parse(stored));
    }
  };

  const loadTokens = () => {
    const stored = localStorage.getItem("universe_tokens");
    if (stored) {
      const data = JSON.parse(stored);
      const now = new Date();
      const lastReset = new Date(data.lastReset);
      
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        setTokens(5);
        localStorage.setItem("universe_tokens", JSON.stringify({ tokens: 5, lastReset: now.toISOString() }));
      } else {
        setTokens(data.tokens);
      }
    } else {
      localStorage.setItem("universe_tokens", JSON.stringify({ tokens: 5, lastReset: new Date().toISOString() }));
    }
  };

  const generateRandomPrompt = () => {
    const environments = [
      "vast desert planet where ancient crystalline towers rise from crimson sands",
      "floating archipelago suspended in perpetual twilight above an endless ocean",
      "frozen tundra where aurora spirits dance through ice cathedrals",
      "jungle realm where bioluminescent trees whisper forgotten languages",
      "volcanic highlands where rivers of molten glass flow through obsidian valleys",
      "cloud cities drifting through storms of pure consciousness",
      "subterranean network of caves filled with singing crystals",
      "coral reef dimension where thoughts manifest as colored light",
      "meadow of quantum flowers that bloom in all possible states simultaneously",
      "mountain range carved from living metal that hums with ancient frequencies"
    ];

    const temporalities = [
      "Time flows differently here, stretching and compressing like living fabric",
      "Past, present, and future exist simultaneously in spiraling loops",
      "Each moment contains infinite eternities waiting to unfold",
      "Time moves backward during the day and forward at night",
      "Memories of things yet to happen echo through the present",
      "Temporal currents shift with the rhythm of unseen tides"
    ];

    const inhabitants = [
      "The inhabitants are beings of pure light who dance between dimensions",
      "Crystalline entities communicate through harmonic resonance",
      "Shadow beings weave dreams from the fabric of space itself",
      "Liquid consciousness pools in valleys, forming sentient lakes",
      "Geometric life forms construct reality through sacred patterns",
      "Ethereal creatures phase between states of matter and energy"
    ];

    const mysteries = [
      "Ancient songs drift through the air, teaching secrets to those who listen",
      "Doorways open to other worlds when specific thoughts align",
      "The boundaries between self and cosmos dissolve here",
      "Every action creates ripples that echo across multiple realities",
      "Hidden patterns reveal themselves to wandering minds",
      "The universe itself is aware and dreams through its inhabitants"
    ];

    const env = environments[Math.floor(Math.random() * environments.length)];
    const temp = temporalities[Math.floor(Math.random() * temporalities.length)];
    const inhab = inhabitants[Math.floor(Math.random() * inhabitants.length)];
    const myst = mysteries[Math.floor(Math.random() * mysteries.length)];

    return `A ${env}. ${temp}. ${inhab}. ${myst}.`;
  };

  const generateRandomUniverse = () => {
    const randomPrompt = generateRandomPrompt();
    const randomNames = [
      "Cosmic Nexus", "Stellar Dream", "Void Whispers", "Quantum Garden",
      "Eternal Spiral", "Prismatic Realm", "Aurora Dimension", "Crystal Echoes",
      "Luminous Abyss", "Harmonic Sphere", "Infinite Cascade", "Temporal Weave"
    ];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    
    setPrompt(randomPrompt);
    setUniverseName(randomName);
    
    toast({
      title: "Random Universe Generated",
      description: "Review and customize, then click Create Universe"
    });
  };

  const generateOracleUniverse = () => {
    if (!birthday) {
      toast({
        title: "Birthday Required",
        description: "Enter your birth date to calibrate your cosmic signature",
        variant: "destructive"
      });
      return;
    }

    const date = new Date(birthday);
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    
    const geneticSeed = (year * 10000 + month * 100 + day) % 9999;
    
    const elements = ["Fire", "Water", "Earth", "Air", "Aether", "Void", "Light", "Shadow"];
    const element = elements[geneticSeed % elements.length];
    
    const cosmicArchetypes = [
      "crystalline consciousness", "liquid dreamscapes", "volcanic creation",
      "ethereal winds", "quantum entanglement", "fractal infinity", 
      "stellar radiance", "umbral mysteries"
    ];
    const archetype = cosmicArchetypes[geneticSeed % cosmicArchetypes.length];
    
    const environments = [
      "floating islands suspended in prismatic mist",
      "ancient temples carved from living starlight",
      "bioluminescent forests that sing in harmonic frequencies",
      "crystalline caves where time pools in liquid form",
      "nebular gardens where thoughts bloom as flowers",
      "obsidian deserts under twin moons",
      "coral cities beneath oceans of pure potential",
      "mountain peaks piercing the membrane between realities"
    ];
    const environment = environments[(dayOfYear + geneticSeed) % environments.length];
    
    const phenomena = [
      "Gravity shifts with emotional states, allowing beings to float during moments of joy",
      "Memories crystallize into tangible objects that can be held and examined",
      "The sky displays visions of parallel versions of this world",
      "Sound becomes visible as colored waves that shape the landscape",
      "Dreams of the inhabitants manifest as temporary pocket dimensions",
      "The ground hums with ancient frequencies that resonate with consciousness"
    ];
    const phenomenon = phenomena[(month * day) % phenomena.length];
    
    const beings = [
      "Beings of pure resonance who communicate through harmonic vibrations",
      "Shapeshifters who cycle through elemental states with the cosmic tides",
      "Luminous entities whose thoughts create ripples in spacetime",
      "Ancient watchers who exist simultaneously across multiple timelines",
      "Consciousness nodes that share a collective awareness",
      "Fractal beings that contain infinite smaller versions of themselves"
    ];
    const being = beings[(year % 1000) % beings.length];
    
    const cosmicPurpose = [
      "This realm serves as a nexus point where souls calibrate between incarnations",
      "The universe itself is learning to dream through its inhabitants",
      "Reality here is an experiment in consciousness evolution",
      "This world exists to preserve and transmute archetypal patterns",
      "The fabric of space remembers all that has ever occurred here",
      "Existence here teaches the art of dissolving boundaries"
    ];
    const purpose = cosmicPurpose[geneticSeed % cosmicPurpose.length];
    
    const oraclePrompt = `Your cosmic signature reveals a realm of ${archetype} aligned with the ${element} principle. ${environment} stretch across this dimension. ${phenomenon}. ${being} inhabit this space. ${purpose}. Your genetic variables have calibrated this universe specifically to your soul's frequency (${dayOfYear}-${geneticSeed}).`;
    
    setPrompt(oraclePrompt);
    setUniverseName(`${element} Genesis: Day ${dayOfYear}`);
    
    localStorage.setItem("autonomy_birth_data", JSON.stringify({
      date: birthday,
      time: null,
      place: null
    }));
    
    toast({
      title: "Oracle Calibration Complete",
      description: `Your cosmic DNA has been decoded. Genetic signature: ${geneticSeed}`
    });
  };

  const parseSemanticLayers = async (text: string): Promise<SemanticLayer[]> => {
    const words = text.toLowerCase().split(/\s+/);
    const layers = SEMANTIC_LAYERS.map(layer => ({ ...layer }));

    const nouns = words.filter(w => w.length > 3 && /^[a-z]+$/.test(w));
    layers[0].extractedData = `Physical elements: ${nouns.slice(0, 6).join(", ")}`;

    const adjectives = words.filter(w => ["dark", "bright", "vast", "tiny", "ancient", "new", "beautiful", "harsh", "luminous", "ethereal", "crystalline", "cosmic"].some(adj => w.includes(adj)));
    layers[1].extractedData = `Emotional tone: ${adjectives.length > 0 ? adjectives.join(", ") : "neutral, balanced"}`;

    const relations = words.filter(w => ["in", "on", "through", "between", "around", "above", "below", "within", "beyond"].includes(w));
    layers[2].extractedData = `Spatial relationships: ${relations.length > 0 ? relations.join(", ") : "simple, direct"}`;

    const verbs = words.filter(w => ["is", "was", "become", "create", "destroy", "transform", "flow", "dance", "echo", "resonate"].some(v => w.includes(v)));
    layers[3].extractedData = `Actions & dynamics: ${verbs.length > 0 ? verbs.join(", ") : "static, contemplative"}`;

    const perspective = text.includes("I") || text.includes("my") ? "first-person (personal)" : text.includes("you") || text.includes("your") ? "second-person (invitational)" : "third-person (observational)";
    layers[4].extractedData = `Narrative perspective: ${perspective}`;

    try {
      const aiResponse = await AIService.sendMessage([
        {
          role: "system",
          content: "You are a semantic analyzer that identifies archetypal patterns in creative text. Respond in 1-2 sentences maximum."
        },
        {
          role: "user",
          content: `Identify the dominant archetypal patterns in this universe description: "${text}"`
        }
      ]);

      if (aiResponse.content && !aiResponse.error) {
        layers[5].extractedData = `Archetypal resonance: ${aiResponse.content.slice(0, 120)}...`;
      } else {
        layers[5].extractedData = "Archetypal resonance: cosmic, mythic, transformative";
      }
    } catch (error) {
      layers[5].extractedData = "Archetypal resonance: cosmic, mythic, transformative";
    }

    layers[6].extractedData = "Quantum seed: " + Math.random().toString(36).substring(7).toUpperCase();

    return layers;
  };

  const generateUniverse = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Enter a description to create your universe",
        variant: "destructive"
      });
      return;
    }

    if (tokens <= 0) {
      toast({
        title: "No Tokens Remaining",
        description: "You'll receive 5 new tokens next month",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentLayer(0);

    const layers = await parseSemanticLayers(prompt);

    for (let i = 0; i < 7; i++) {
      setCurrentLayer(i);
      setGenerationProgress((i + 1) * 14.28);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const newUniverse: Universe = {
      id: Date.now().toString(),
      name: universeName || `Universe ${universes.length + 1}`,
      prompt,
      createdAt: new Date().toISOString(),
      layers,
      seed: Math.random().toString(36).substring(7)
    };

    const updatedUniverses = [newUniverse, ...universes];
    setUniverses(updatedUniverses);
    localStorage.setItem("semantic_universes", JSON.stringify(updatedUniverses));

    const newTokenCount = tokens - 1;
    setTokens(newTokenCount);
    const tokenData = JSON.parse(localStorage.getItem("universe_tokens") || "{}");
    tokenData.tokens = newTokenCount;
    localStorage.setItem("universe_tokens", JSON.stringify(tokenData));

    setIsGenerating(false);
    setGenerationProgress(100);
    setSelectedUniverse(newUniverse);

    toast({
      title: "Universe Created!",
      description: `${newUniverse.name} has been brought into existence. ${newTokenCount} tokens remaining.`
    });

    setTimeout(() => {
      setPrompt("");
      setUniverseName("");
      setGenerationProgress(0);
      setCurrentLayer(0);
    }, 2000);
  };

  const deleteUniverse = (id: string) => {
    const updated = universes.filter(u => u.id !== id);
    setUniverses(updated);
    localStorage.setItem("semantic_universes", JSON.stringify(updated));
    if (selectedUniverse?.id === id) {
      setSelectedUniverse(null);
    }
    toast({
      title: "Universe Deleted",
      description: "The universe has been removed from existence"
    });
  };

  const exportUniverse = (universe: Universe) => {
    const data = JSON.stringify(universe, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${universe.name.replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Universe Exported",
      description: "Universe data downloaded as JSON"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Layers className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">Semantic Universe Creator</h1>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">Transform text into playable worlds through the seven-layer semantic framework</p>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {autonomyEnabled && (
                <Card className="bg-primary/10 border-primary/30">
                  <CardContent className="p-3 sm:p-4 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-xs sm:text-sm font-semibold text-primary">Autonomy Active</p>
                  </CardContent>
                </Card>
              )}
              
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                  <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Tokens Remaining</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{tokens}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        <Tabs defaultValue="create" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" data-testid="tab-create" className="text-sm sm:text-base">
              <span className="hidden sm:inline">Create Universe</span>
              <span className="sm:hidden">Create</span>
            </TabsTrigger>
            <TabsTrigger value="library" data-testid="tab-library" className="text-sm sm:text-base">
              <span className="hidden sm:inline">Universe Library ({universes.length})</span>
              <span className="sm:hidden">Library ({universes.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Speak Your World Into Being
                  </CardTitle>
                  <CardDescription className="text-sm">Describe the universe you wish to create in a few sentences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Button
                      variant={!oracleMode ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setOracleMode(false)}
                      data-testid="button-custom-mode"
                      className="flex-1"
                    >
                      <Sparkles className="h-3 w-3 mr-2" />
                      Custom
                    </Button>
                    <Button
                      variant={oracleMode ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setOracleMode(true)}
                      data-testid="button-oracle-mode"
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Dna className="h-3 w-3 mr-2" />
                      Oracle Mode
                    </Button>
                  </div>

                  {oracleMode && (
                    <Card className="bg-primary/5 border-primary/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary mt-0.5" />
                          <p className="text-muted-foreground">
                            Enter your birth date to calibrate a universe based on your unique cosmic signature and genetic variables.
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="birthday">Birth Date</Label>
                          <Input
                            id="birthday"
                            type="date"
                            data-testid="input-birthday"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          data-testid="button-calibrate-oracle"
                          onClick={generateOracleUniverse}
                          disabled={!birthday}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Dna className="h-3 w-3 mr-2" />
                          Calibrate Cosmic DNA
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  <div>
                    <Label htmlFor="universe-name">Universe Name</Label>
                    <Input
                      id="universe-name"
                      data-testid="input-universe-name"
                      placeholder="My Cosmic Realm"
                      value={universeName}
                      onChange={(e) => setUniverseName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="universe-prompt">Creation Prompt</Label>
                    <Textarea
                      id="universe-prompt"
                      data-testid="textarea-universe-prompt"
                      placeholder="A vast desert planet where ancient crystalline towers rise from crimson sands. Time flows differently here, and whispers echo through dimensions. The inhabitants are beings of pure light who dance between worlds..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {prompt.split(/\s+/).filter(w => w.length > 0).length} words
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {!oracleMode && (
                      <Button
                        data-testid="button-random-universe"
                        onClick={generateRandomUniverse}
                        disabled={isGenerating}
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        <Shuffle className="h-4 w-4 mr-2" />
                        Random
                      </Button>
                    )}
                    <Button
                      data-testid="button-generate-universe"
                      onClick={generateUniverse}
                      disabled={isGenerating || tokens <= 0}
                      className="flex-1"
                      size="lg"
                    >
                      {isGenerating ? (
                        <><span className="hidden sm:inline">Generating Universe...</span><span className="sm:hidden">Generating...</span></>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Create Universe (1 Token)</span>
                          <span className="sm:hidden">Create (1 Token)</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {isGenerating && (
                    <div className="space-y-2">
                      <Progress value={generationProgress} className="h-2" />
                      <p className="text-sm text-center text-muted-foreground">
                        Processing Layer {currentLayer + 1} of 7: {SEMANTIC_LAYERS[currentLayer]?.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">The Seven-Layer Semantic Body</CardTitle>
                  <CardDescription className="text-sm">Each universe is generated through these consciousness layers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] sm:h-[500px] pr-2 sm:pr-4">
                    <div className="space-y-3">
                      {SEMANTIC_LAYERS.map((layer, index) => (
                        <Card
                          key={layer.id}
                          className={`${
                            isGenerating && currentLayer === index
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`${layer.color} mt-1`}>
                                {layer.icon}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-sm">
                                    Layer {layer.id}: {layer.name}
                                  </p>
                                  {isGenerating && currentLayer === index && (
                                    <Badge variant="secondary" className="text-xs">
                                      Processing
                                    </Badge>
                                  )}
                                  {isGenerating && currentLayer > index && (
                                    <ChevronRight className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{layer.function}</p>
                                {layer.extractedData && (
                                  <p className="text-xs text-primary mt-2">{layer.extractedData}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-4 sm:space-y-6">
          {universes.length === 0 ? (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <Globe className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-base sm:text-lg font-semibold mb-2">No Universes Created Yet</p>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Use the Create Universe tab to speak your first world into existence
                </p>
                <Button variant="outline" onClick={() => document.querySelector('[value="create"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
                  Start Creating
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {universes.map((universe) => (
                <Card key={universe.id} className="hover-elevate">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{universe.name}</span>
                      <Badge variant="secondary">{universe.seed}</Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Created {new Date(universe.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm line-clamp-3">{universe.prompt}</p>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="default"
                        data-testid={`button-play-${universe.id}`}
                        onClick={() => setPlayingUniverse(universe)}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Play 3D
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`button-view-${universe.id}`}
                        onClick={() => setSelectedUniverse(universe)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`button-export-${universe.id}`}
                        onClick={() => exportUniverse(universe)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`button-delete-${universe.id}`}
                        onClick={() => deleteUniverse(universe.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedUniverse && (
            <Card className="bg-primary/5 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedUniverse.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUniverse(null)}>
                    Close
                  </Button>
                </CardTitle>
                <CardDescription>Semantic Analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Original Prompt</Label>
                  <p className="text-sm mt-1">{selectedUniverse.prompt}</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Layer Breakdown</Label>
                  {selectedUniverse.layers.map((layer) => (
                    <div key={layer.id} className="flex items-start gap-2 text-sm p-2 rounded bg-background/50">
                      <div className={layer.color}>{layer.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-xs">{layer.name}</p>
                        {layer.extractedData && <p className="text-xs text-muted-foreground">{layer.extractedData}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {playingUniverse && (
        <UniverseViewer3D 
          universe={playingUniverse} 
          onClose={() => setPlayingUniverse(null)}
        />
      )}
      </div>
    </div>
  );
}
