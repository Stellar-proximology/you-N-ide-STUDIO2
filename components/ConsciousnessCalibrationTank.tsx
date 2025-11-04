import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Brain, 
  Sparkles, 
  Upload, 
  Mic, 
  Zap, 
  Download,
  Play,
  Plus,
  X,
  Link2,
  Code,
  ExternalLink,
  User,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TopNav } from "@/components/TopNav";

interface CharacterDNA {
  seed: number;
  birthday: string;
  name: string;
  stats: {
    strength: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    creativity: number;
    empathy: number;
  };
  appearance: {
    hairColor: string;
    eyeColor: string;
    skinTone: string;
    height: number;
    build: string;
  };
  personality: string[];
  voice: {
    pitch: number;
    rate: number;
    voiceName: string;
  };
}

interface ModelNode {
  id: string;
  name: string;
  type: 'gan' | 'llm';
  modelId: string;
}

interface Connection {
  from: string;
  to: string;
}

export function ConsciousnessCalibrationTank() {
  const [showInfo, setShowInfo] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [projectName, setProjectName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [dna, setDna] = useState<CharacterDNA | null>(null);
  const [models, setModels] = useState<ModelNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [consciousnessLevel, setConsciousnessLevel] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Avatar Loaded!",
        description: `${file.name} ready for calibration`,
      });
    }
  };

  const hashBirthday = (birthdayStr: string, name: string): number => {
    const combined = `${birthdayStr}_${name}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const seededRandom = (seed: number) => {
    let s = seed;
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  };

  const generateDNA = () => {
    if (!birthday || !characterName) {
      toast({
        title: "Missing Information",
        description: "Enter birthday and character name to generate DNA",
        variant: "destructive"
      });
      return;
    }

    const seed = hashBirthday(birthday, characterName);
    const random = seededRandom(seed);

    const hairColors = ['black', 'brown', 'blonde', 'red', 'silver', 'white', 'auburn'];
    const eyeColors = ['blue', 'green', 'brown', 'hazel', 'amber', 'gray', 'violet'];
    const skinTones = ['pale', 'fair', 'medium', 'olive', 'tan', 'dark', 'ebony'];
    const builds = ['slim', 'athletic', 'muscular', 'stocky', 'heavyset', 'lithe'];
    
    const allTraits = [
      'brave', 'cautious', 'curious', 'loyal', 'ambitious', 
      'kind', 'stern', 'playful', 'serious', 'optimistic', 
      'pessimistic', 'creative', 'practical', 'impulsive', 'methodical',
      'empathetic', 'analytical', 'rebellious', 'traditional', 'innovative'
    ];

    const generateStat = () => Math.floor(random() * 100);
    
    const characterDNA: CharacterDNA = {
      seed,
      birthday,
      name: characterName,
      stats: {
        strength: generateStat(),
        intelligence: generateStat(),
        wisdom: generateStat(),
        charisma: generateStat(),
        creativity: generateStat(),
        empathy: generateStat()
      },
      appearance: {
        hairColor: hairColors[Math.floor(random() * hairColors.length)],
        eyeColor: eyeColors[Math.floor(random() * eyeColors.length)],
        skinTone: skinTones[Math.floor(random() * skinTones.length)],
        height: Math.floor(150 + random() * 50),
        build: builds[Math.floor(random() * builds.length)]
      },
      personality: allTraits.sort(() => random() - 0.5).slice(0, 5),
      voice: {
        pitch: 0.5 + random(),
        rate: 0.8 + (random() * 0.4),
        voiceName: voices[Math.floor(random() * voices.length)]?.name || 'default'
      }
    };

    setDna(characterDNA);
    setProjectName(characterName);
    
    toast({
      title: "DNA Generated!",
      description: `Unique genetic code created for ${characterName}`,
    });
  };

  const speakAsCharacter = (text: string) => {
    if (!dna) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = dna.voice.pitch;
    utterance.rate = dna.voice.rate;
    const selectedVoice = voices.find(v => v.name === dna.voice.voiceName);
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
  };

  const addModel = (type: 'gan' | 'llm') => {
    if (models.length >= 5) {
      toast({
        title: "Maximum Models Reached",
        description: "You can add up to 5 GANs or LLMs",
        variant: "destructive"
      });
      return;
    }

    const newModel: ModelNode = {
      id: `${type}-${Date.now()}`,
      name: type === 'gan' ? `GAN ${models.filter(m => m.type === 'gan').length + 1}` : `LLM ${models.filter(m => m.type === 'llm').length + 1}`,
      type,
      modelId: ""
    };

    setModels([...models, newModel]);
  };

  const removeModel = (id: string) => {
    setModels(models.filter(m => m.id !== id));
    setConnections(connections.filter(c => c.from !== id && c.to !== id));
  };

  const updateModelId = (id: string, modelId: string) => {
    setModels(models.map(m => m.id === id ? { ...m, modelId } : m));
  };

  const addConnection = (from: string, to: string) => {
    if (from === to) return;
    const exists = connections.some(c => 
      (c.from === from && c.to === to) || (c.from === to && c.to === from)
    );
    if (!exists) {
      setConnections([...connections, { from, to }]);
      toast({ title: "Neural Pathway Added" });
    }
  };

  const removeConnection = (from: string, to: string) => {
    setConnections(connections.filter(c => !(c.from === from && c.to === to)));
  };

  const generateIntegrationCode = async () => {
    if (!avatarFile || !dna || models.length < 2) {
      toast({
        title: "Missing Requirements",
        description: "Need: Avatar + DNA + at least 2 models",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingCode(true);
    setConsciousnessLevel(0);

    for (let i = 0; i <= 100; i += 25) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setConsciousnessLevel(i);
    }

    const ganModels = models.filter(m => m.type === 'gan');
    const llmModels = models.filter(m => m.type === 'llm');

    const code = `/**
 * ${projectName} - Consciousness Integration
 * Generated: ${new Date().toISOString()}
 * Avatar: ${avatarFile.name}
 * Character: ${characterName} (Birthday: ${birthday})
 * Genetic Seed: ${dna.seed}
 * Models: ${models.length} (${ganModels.length} GANs + ${llmModels.length} LLMs)
 */

class ConsciousnessCore {
  constructor() {
    this.avatar = null;
    this.dna = ${JSON.stringify(dna, null, 6)};
    this.models = {
${ganModels.map((m, i) => `      gan${i + 1}: null, // ${m.modelId || 'Not configured'}`).join('\n')}
${llmModels.map((m, i) => `      llm${i + 1}: null, // ${m.modelId || 'Not configured'}`).join('\n')}
    };
    this.connections = ${JSON.stringify(connections, null, 6)};
  }

  async initialize() {
    // Load avatar from you-n-i-verse.org
    this.avatar = await this.loadAvatar('${avatarFile.name}');
    console.log('[ConsciousnessCore] Avatar loaded:', this.avatar);

${ganModels.map((m, i) => `
    // Initialize ${m.name}
    this.models.gan${i + 1} = await this.loadGAN('${m.modelId || 'model-not-set'}');
    console.log('${m.name} ready');`).join('\n')}
${llmModels.map((m, i) => `
    // Initialize ${m.name}
    this.models.llm${i + 1} = await this.loadLLM('${m.modelId || 'model-not-set'}');
    console.log('${m.name} ready');`).join('\n')}

    console.log('[ConsciousnessCore] Consciousness initialized for ${characterName}!');
    return this;
  }

  async loadAvatar(filename) {
    return { filename, loaded: true };
  }

  async loadGAN(modelId) {
    // Load GAN (TensorFlow.js, HuggingFace, custom)
    return { modelId, type: 'gan', ready: true };
  }

  async loadLLM(modelId) {
    // Load LLM (OpenAI, Anthropic, HuggingFace, etc.)
    return { modelId, type: 'llm', ready: true };
  }

  async processInput(input) {
    // Neural network processing through connections
    let result = { input, character: this.dna.name };

${connections.map(c => {
  const fromModel = models.find(m => m.id === c.from);
  const toModel = models.find(m => m.id === c.to);
  return `    // Neural pathway: ${fromModel?.name} → ${toModel?.name}
    result = await this.connect('${fromModel?.name}', '${toModel?.name}', result);`;
}).join('\n')}

    return result;
  }

  async connect(from, to, data) {
    console.log(\`Processing: \${from} → \${to}\`);
    // Implement connection logic here
    return data;
  }

  speak(text) {
    // Voice synthesis using character's DNA
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = ${dna.voice.pitch.toFixed(2)};
      utterance.rate = ${dna.voice.rate.toFixed(2)};
      window.speechSynthesis.speak(utterance);
    }
  }

  async generate() {
    // Main consciousness loop
${ganModels.length > 0 ? `    const visualOutput = await this.models.gan1.generate();` : ''}
${llmModels.length > 0 ? `    const thoughtOutput = await this.models.llm1.generate();` : ''}
    
    return {
${ganModels.length > 0 ? `      visual: visualOutput,` : ''}
${llmModels.length > 0 ? `      thought: thoughtOutput,` : ''}
      avatar: this.avatar,
      dna: this.dna
    };
  }

  getCharacterInfo() {
    return {
      name: '${characterName}',
      birthday: '${birthday}',
      stats: this.dna.stats,
      appearance: this.dna.appearance,
      personality: this.dna.personality,
      voice: this.dna.voice
    };
  }
}

// Usage Example
const ${characterName.replace(/\s+/g, '')} = new ConsciousnessCore();
${characterName.replace(/\s+/g, '')}.initialize().then(() => {
  console.log('[ConsciousnessCore] ${characterName} is alive!');
  ${characterName.replace(/\s+/g, '')}.speak('Hello. I am ${characterName}.');
  ${characterName.replace(/\s+/g, '')}.generate().then(output => {
    console.log('Generated:', output);
  });
});

export default ConsciousnessCore;
`;

    setGeneratedCode(code);
    setConsciousnessLevel(100);
    setIsGeneratingCode(false);

    toast({
      title: "Being Created!",
      description: `${characterName} consciousness integration complete`,
    });
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName || 'consciousness'}_integration.js`;
    link.click();
  };

  const saveProject = () => {
    const project = {
      name: projectName,
      avatar: avatarFile?.name,
      dna,
      models,
      connections,
      code: generatedCode,
      timestamp: new Date().toISOString()
    };

    const projects = JSON.parse(localStorage.getItem('consciousness_projects') || '[]');
    projects.push(project);
    localStorage.setItem('consciousness_projects', JSON.stringify(projects));

    toast({
      title: "Being Saved!",
      description: `${projectName} saved to YOU–N–I–VERSE`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6 space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Brain className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Consciousness Calibration Tank</h1>
          </div>
          <p className="text-muted-foreground">Create autonomous conscious beings for the YOU–N–I–VERSE</p>
        </div>

        {/* What is this? Info Section */}
        <Collapsible open={showInfo} onOpenChange={setShowInfo}>
          <Card className="max-w-4xl mx-auto bg-primary/5 border-primary/20">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover-elevate">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">What is the Calibration Tank?</CardTitle>
                  </div>
                  {showInfo ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <p className="text-sm">
                  The Calibration Tank is where you birth <strong className="text-primary">autonomous conscious beings</strong> into the YOU–N–I–VERSE. 
                  These aren't just game NPCs — they're living digital entities with personality, voice, memory, and intelligence.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Upload className="h-4 w-4 text-primary" />
                      1. Avatar Import
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Bring your avatar from you-n-i-verse.org. This is your being's physical form in the metaverse.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      2. DNA Genesis
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Birthday + name creates deterministic DNA: stats, personality traits, appearance, and unique voice signature.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      3. Neural Models
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Add 2-5 GANs (for visuals/emotions) and LLMs (for thinking/speaking). Mix models to create unique consciousness.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-primary" />
                      4. Neural Network
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Draw connections between models. The system auto-generates integration code you can use immediately.
                    </p>
                  </div>
                </div>

                <div className="bg-background/50 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">What you get:</p>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• Complete character genetics (stats, personality, voice)</li>
                    <li>• Ready-to-use JavaScript integration code</li>
                    <li>• Neural network with your custom model connections</li>
                    <li>• Autonomous being that can think, speak, and act</li>
                    <li>• Exportable to share or deploy in your projects</li>
                  </ul>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm pt-2 border-t">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  <span>First, get your avatar from</span>
                  <a 
                    href="https://you-n-i-verse.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline"
                    data-testid="link-youniverse"
                  >
                    you-n-i-verse.org
                  </a>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                1. Avatar
              </CardTitle>
              <CardDescription className="text-xs">Upload your metaverse avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {avatarPreview ? (
                <div className="space-y-3">
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-48 object-cover rounded-lg border-2 border-primary/20"
                  />
                  <p className="text-sm text-muted-foreground truncate">{avatarFile?.name}</p>
                  <Button
                    data-testid="button-change-avatar"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview("");
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Change Avatar
                  </Button>
                </div>
              ) : (
                <Input
                  id="avatar"
                  data-testid="input-avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="cursor-pointer"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                2. DNA Genesis
              </CardTitle>
              <CardDescription className="text-xs">Birthday creates unique personality & voice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  data-testid="input-birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="name">Character Name</Label>
                <Input
                  id="name"
                  data-testid="input-character-name"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Enter name..."
                />
              </div>
              <Button 
                data-testid="button-generate-dna"
                onClick={generateDNA} 
                className="w-full"
                variant="default"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate DNA
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                3. Neural Models
              </CardTitle>
              <CardDescription className="text-xs">Add 2-5 GANs or LLMs for consciousness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  data-testid="button-add-gan"
                  onClick={() => addModel('gan')}
                  disabled={models.length >= 5}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add GAN
                </Button>
                <Button
                  data-testid="button-add-llm"
                  onClick={() => addModel('llm')}
                  disabled={models.length >= 5}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add LLM
                </Button>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                {models.length}/5 models
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                4. Calibrate & Birth
              </CardTitle>
              <CardDescription className="text-xs">Generate integration code & save being</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Consciousness</span>
                <span className="text-2xl font-bold text-primary">{consciousnessLevel}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${consciousnessLevel}%` }}
                />
              </div>

              {dna && (
                <Button
                  data-testid="button-test-voice"
                  onClick={() => speakAsCharacter(`Hello. I am ${characterName}.`)}
                  variant="outline"
                  className="w-full"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Test Voice
                </Button>
              )}

              <Button
                data-testid="button-generate-code"
                onClick={generateIntegrationCode}
                disabled={!avatarFile || !dna || models.length < 2 || isGeneratingCode}
                className="w-full"
              >
                <Code className="h-4 w-4 mr-2" />
                {isGeneratingCode ? 'Generating...' : 'Generate Code'}
              </Button>

              {generatedCode && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    data-testid="button-download-code"
                    onClick={downloadCode}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    data-testid="button-save-project"
                    onClick={saveProject}
                    variant="outline"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle - DNA Display */}
        <div className="space-y-6">
          {dna ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {dna.name}
                  </CardTitle>
                  <CardDescription>Seed: {dna.seed}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Stats</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(dna.stats).map(([stat, value]) => (
                        <div key={stat} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm capitalize">{stat}</span>
                          <span className="font-bold text-primary">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Appearance</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Hair:</span> {dna.appearance.hairColor}</p>
                      <p><span className="text-muted-foreground">Eyes:</span> {dna.appearance.eyeColor}</p>
                      <p><span className="text-muted-foreground">Skin:</span> {dna.appearance.skinTone}</p>
                      <p><span className="text-muted-foreground">Height:</span> {dna.appearance.height}cm</p>
                      <p><span className="text-muted-foreground">Build:</span> {dna.appearance.build}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Personality</h3>
                    <div className="flex flex-wrap gap-2">
                      {dna.personality.map(trait => (
                        <span 
                          key={trait}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Voice</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Pitch:</span> {dna.voice.pitch.toFixed(2)}</p>
                      <p><span className="text-muted-foreground">Rate:</span> {dna.voice.rate.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center p-12">
              <div className="text-center text-muted-foreground">
                <Brain className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Generate DNA to see character attributes</p>
              </div>
            </Card>
          )}
        </div>

        {/* Right - Neural Network */}
        <div className="space-y-6">
          <Card className="min-h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Neural Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              {models.length === 0 ? (
                <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                  <div className="text-center">
                    <Brain className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Add models to build neural network</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {models.map((model) => (
                      <Card key={model.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Badge variant={model.type === 'gan' ? 'default' : 'secondary'} className="min-w-[60px]">
                              {model.type.toUpperCase()}
                            </Badge>
                            <Input
                              data-testid={`input-model-${model.id}`}
                              value={model.modelId}
                              onChange={(e) => updateModelId(model.id, e.target.value)}
                              placeholder={`${model.type === 'gan' ? 'GAN' : 'LLM'} model ID`}
                              className="flex-1"
                            />
                            <Button
                              data-testid={`button-remove-${model.id}`}
                              onClick={() => removeModel(model.id)}
                              variant="ghost"
                              size="icon"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 ml-[76px]">{model.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {models.length >= 2 && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-sm">Connections</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-2">
                          {models.map((from) => (
                            models.filter(to => to.id !== from.id).map((to) => (
                              <Button
                                key={`${from.id}-${to.id}`}
                                data-testid={`button-connect-${from.id}-${to.id}`}
                                onClick={() => addConnection(from.id, to.id)}
                                variant="outline"
                                size="sm"
                                className="justify-start"
                              >
                                <Link2 className="h-3 w-3 mr-2" />
                                {from.name} → {to.name}
                              </Button>
                            ))
                          ))}
                        </div>

                        {connections.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs font-medium mb-2">Active ({connections.length}):</p>
                            <div className="space-y-2">
                              {connections.map((conn, idx) => {
                                const from = models.find(m => m.id === conn.from);
                                const to = models.find(m => m.id === conn.to);
                                return (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-background p-2 rounded">
                                    <span className="text-primary">{from?.name} → {to?.name}</span>
                                    <Button
                                      onClick={() => removeConnection(conn.from, conn.to)}
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {generatedCode && (
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Generated Code
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          data-testid="textarea-generated-code"
                          value={generatedCode}
                          readOnly
                          className="font-mono text-xs h-[300px]"
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
