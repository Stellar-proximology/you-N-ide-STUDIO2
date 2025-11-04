import { useState, useEffect } from "react";
import { Bot, ChevronDown, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AIService } from "@/lib/AIService";

interface AIBackend {
  id: string;
  name: string;
  displayName: string;
  requiresKey: boolean;
  keyLabel?: string;
  keyPlaceholder?: string;
  endpoint?: string;
}

const AI_BACKENDS: AIBackend[] = [
  {
    id: "claude",
    name: "Claude",
    displayName: "Claude (Anthropic)",
    requiresKey: true,
    keyLabel: "Anthropic API Key",
    keyPlaceholder: "sk-ant-...",
    endpoint: "https://api.anthropic.com/v1/messages"
  },
  {
    id: "gpt",
    name: "GPT",
    displayName: "GPT (OpenAI)",
    requiresKey: true,
    keyLabel: "OpenAI API Key",
    keyPlaceholder: "sk-...",
    endpoint: "https://api.openai.com/v1/chat/completions"
  },
  {
    id: "codellama",
    name: "CodeLlama",
    displayName: "CodeLlama",
    requiresKey: false,
    endpoint: "http://localhost:11434/api/generate"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    displayName: "DeepSeek",
    requiresKey: true,
    keyLabel: "DeepSeek API Key",
    keyPlaceholder: "sk-...",
    endpoint: "https://api.deepseek.com/v1/chat/completions"
  },
  {
    id: "grok",
    name: "Grok",
    displayName: "Grok (xAI)",
    requiresKey: true,
    keyLabel: "Grok API Key",
    keyPlaceholder: "xai-...",
    endpoint: "https://api.x.ai/v1/chat/completions"
  },
  {
    id: "huggingface",
    name: "HuggingFace",
    displayName: "MiniMax M2 (Free)",
    requiresKey: true,
    keyLabel: "MiniMax API Key (Get at platform.minimax.io)",
    keyPlaceholder: "Enter your MiniMax API key",
    endpoint: "https://api.minimax.io/v1/chat/completions"
  }
];

export function AIBackendSelector() {
  const { toast } = useToast();
  const [selectedBackend, setSelectedBackend] = useState<AIBackend>(AI_BACKENDS[0]);
  const [apiKey, setApiKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    const savedBackendId = localStorage.getItem("ai_backend");
    const savedOllamaUrl = localStorage.getItem("ollama_url");
    
    let backendToLoad = AI_BACKENDS[0];
    if (savedBackendId) {
      const backend = AI_BACKENDS.find(b => b.id === savedBackendId);
      if (backend) {
        backendToLoad = backend;
        setSelectedBackend(backend);
      }
    }
    
    const savedKey = localStorage.getItem(`ai_key_${backendToLoad.id}`);
    if (savedKey) {
      setApiKey(savedKey);
      setIsConfigured(true);
    }
    
    if (savedOllamaUrl) {
      setOllamaUrl(savedOllamaUrl);
    }
  }, []);

  const handleBackendChange = (backend: AIBackend) => {
    setSelectedBackend(backend);
    localStorage.setItem("ai_backend", backend.id);
    
    const savedKey = localStorage.getItem(`ai_key_${backend.id}`);
    if (savedKey) {
      setApiKey(savedKey);
      setIsConfigured(true);
    } else {
      setApiKey("");
      setIsConfigured(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key first",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await AIService.testConnection(selectedBackend.id, apiKey);
      
      if (result.error) {
        setTestResult("error");
        toast({
          title: "Connection Failed",
          description: result.error,
          variant: "destructive"
        });
      } else {
        setTestResult("success");
        toast({
          title: "Connection Successful",
          description: `${selectedBackend.name} API key is valid and working!`
        });
      }
    } catch (error) {
      setTestResult("error");
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveKey = () => {
    if (selectedBackend.requiresKey && apiKey.trim()) {
      localStorage.setItem(`ai_key_${selectedBackend.id}`, apiKey);
      setIsConfigured(true);
      toast({
        title: "API Key Saved",
        description: `${selectedBackend.name} is now configured and ready to use.`
      });
    } else if (!selectedBackend.requiresKey) {
      setIsConfigured(true);
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
    }
  };

  const handleSaveOllamaUrl = () => {
    if (ollamaUrl) {
      localStorage.setItem("ollama_url", ollamaUrl);
      toast({
        title: "Ollama URL Saved",
        description: `Ollama server set to: ${ollamaUrl}`
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="text-base font-medium">AI Assistant Backend</h3>
      </div>

      <div className="space-y-2">
        <Label>Select AI Model</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              data-testid="button-select-backend"
              variant="outline" 
              className="w-full justify-between hover:border-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                {selectedBackend.displayName}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            <DropdownMenuLabel>Choose AI Backend</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {AI_BACKENDS.map((backend) => (
              <DropdownMenuItem
                key={backend.id}
                data-testid={`option-backend-${backend.id}`}
                onClick={() => handleBackendChange(backend)}
                className={selectedBackend.id === backend.id ? "bg-primary/10" : ""}
              >
                <span className="flex items-center gap-2">
                  {backend.displayName}
                  {!backend.requiresKey && (
                    <span className="text-xs text-muted-foreground">(Local)</span>
                  )}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedBackend.requiresKey && (
        <div className="space-y-2">
          <Label htmlFor="api-key">{selectedBackend.keyLabel}</Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              data-testid="input-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder={selectedBackend.keyPlaceholder}
              className="font-mono text-sm"
            />
            <Button 
              data-testid="button-test-connection"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              variant="outline"
              className="shrink-0"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Testing
                </>
              ) : testResult === "success" ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Valid
                </>
              ) : testResult === "error" ? (
                <>
                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                  Test
                </>
              ) : (
                "Test"
              )}
            </Button>
            <Button 
              data-testid="button-save-api-key"
              onClick={handleSaveKey}
              className="bg-primary hover:bg-primary/90 shrink-0"
            >
              Save
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {testResult === "success" && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Connection successful
              </p>
            )}
            {testResult === "error" && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Connection failed - check your key
              </p>
            )}
            {!testResult && (
              <p className="text-xs text-muted-foreground">
                {isConfigured ? "✓ API key configured" : "Enter your API key to enable"}
              </p>
            )}
          </div>
        </div>
      )}

      {!selectedBackend.requiresKey && (
        <div className="space-y-3">
          <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-3">
              <strong>{selectedBackend.name}</strong> runs locally via Ollama.
              Make sure Ollama is running on your machine.
            </p>
            <div className="space-y-2">
              <Label htmlFor="ollama-url" className="text-xs">Ollama Server URL</Label>
              <div className="flex gap-2">
                <Input
                  id="ollama-url"
                  data-testid="input-ollama-url"
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="font-mono text-xs"
                />
                <Button 
                  data-testid="button-save-ollama-url"
                  onClick={handleSaveOllamaUrl}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Change if Ollama is running on a different machine or port
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t">
        <div className={`h-2 w-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span className="text-xs text-muted-foreground" data-testid="text-backend-status">
          {isConfigured ? `${selectedBackend.name} ready` : "Configuration required"}
        </span>
      </div>

      {/* Debug info */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <div>Selected: {selectedBackend.id}</div>
        <div>Has Key: {apiKey ? 'Yes' : 'No'}</div>
        <div>Configured: {isConfigured ? 'Yes' : 'No'}</div>
        <div>Saved Backend: {localStorage.getItem("ai_backend") || "none"}</div>
        <div>Saved Key: {localStorage.getItem(`ai_key_${selectedBackend.id}`) ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}
