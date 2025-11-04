/**
 * Persistent AI Assistant
 * Professional AI chat interface docked to bottom-right corner
 */

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageSquare, Upload, Brain, Volume2, VolumeX, History, Plus, Sparkles, ThumbsUp, ThumbsDown, Play, Code2, Copy, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIService } from "@/lib/AIService";
import { UserProfileService } from "@/lib/userProfileService";
import { WorkspaceManager } from "@/lib/workspaceManager";
import { FileSystem } from "@/lib/fileSystem";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CONSCIOUSNESS_KNOWLEDGE } from "@/lib/consciousnessKnowledge";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  thinking?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const CONVERSATIONS_KEY = "ai-assistant-conversations";
const CURRENT_CONVERSATION_KEY = "ai-assistant-current";

export function PersistentAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string>("");
  const [savedConversations, setSavedConversations] = useState<Conversation[]>([]);
  const [programSuggestion, setProgramSuggestion] = useState<any>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast} = useToast();

  // Text-to-speech function
  const speakText = (text: string) => {
    if (!isSpeechEnabled) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  // Parse code blocks from markdown
  const parseCodeBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: Array<{ language: string; code: string; index: number }> = [];
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
        index: match.index
      });
    }
    
    return blocks;
  };

  // Send code to IDE
  const sendCodeToIDE = (code: string, language: string) => {
    const extension = language === 'javascript' || language === 'js' ? 'js' 
      : language === 'typescript' || language === 'ts' ? 'ts'
      : language === 'html' ? 'html'
      : language === 'css' ? 'css'
      : language === 'python' || language === 'py' ? 'py'
      : language === 'json' ? 'json'
      : 'txt';
    
    const filename = `ai-code-${Date.now()}.${extension}`;
    FileSystem.createFile('', filename);
    FileSystem.saveFile(filename, code);
    
    toast({
      title: "Code sent to IDE!",
      description: `File "${filename}" created in the file explorer`
    });
  };

  // Copy code to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard"
    });
  };

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    if (stored) {
      const conversations: Conversation[] = JSON.parse(stored, (key, value) => {
        if (key === 'timestamp' || key === 'createdAt' || key === 'updatedAt') {
          return new Date(value);
        }
        return value;
      });
      setSavedConversations(conversations);
    }

    const currentId = localStorage.getItem(CURRENT_CONVERSATION_KEY);
    if (currentId) {
      setCurrentConversationId(currentId);
      const conversation = JSON.parse(stored || '[]').find((c: Conversation) => c.id === currentId);
      if (conversation) {
        setMessages(conversation.messages.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      }
    } else {
      const newId = Date.now().toString();
      setCurrentConversationId(newId);
      localStorage.setItem(CURRENT_CONVERSATION_KEY, newId);
    }
  }, []);

  // Save current conversation to localStorage when messages change
  useEffect(() => {
    if (messages.length === 0 || !currentConversationId) return;

    const title = messages[0]?.content.slice(0, 50) + (messages[0]?.content.length > 50 ? '...' : '') || 'New conversation';
    const now = new Date();

    const conversation: Conversation = {
      id: currentConversationId,
      title,
      messages,
      createdAt: now,
      updatedAt: now
    };

    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    const conversations: Conversation[] = stored ? JSON.parse(stored) : [];
    const existingIndex = conversations.findIndex(c => c.id === currentConversationId);

    if (existingIndex >= 0) {
      conversations[existingIndex] = {
        ...conversation,
        createdAt: conversations[existingIndex].createdAt
      };
    } else {
      conversations.unshift(conversation);
    }

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    setSavedConversations(conversations);
  }, [messages, currentConversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch program suggestion when assistant opens
  useEffect(() => {
    if (isOpen && !programSuggestion && !suggestionLoading) {
      fetchProgramSuggestion();
    }
  }, [isOpen]);

  const fetchProgramSuggestion = async () => {
    setSuggestionLoading(true);
    setFeedbackGiven(false);
    try {
      const profile = UserProfileService.getProfile();
      
      if (profile && profile.birthData.date && profile.birthData.latitude !== undefined && profile.birthData.longitude !== undefined) {
        // Use personalized endpoint with user's profile
        const response = await fetch("/api/programs/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: profile.id,
            birthData: {
              date: profile.birthData.date,
              latitude: profile.birthData.latitude,
              longitude: profile.birthData.longitude
            },
            fieldAssignments: profile.fieldAssignments,
            resonanceHistory: profile.resonanceHistory
          })
        });
        const data = await response.json();
        setProgramSuggestion(data.directive);
      } else {
        // Fall back to demo mode if no profile or incomplete profile
        const response = await fetch("/api/programs/demo");
        const data = await response.json();
        setProgramSuggestion(data.directive);
      }
    } catch (error) {
      console.error("Failed to fetch program suggestion:", error);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const activateProgram = () => {
    if (!programSuggestion) {
      toast({
        title: "No Program",
        description: "No program suggestion to activate",
        variant: "destructive"
      });
      return;
    }

    WorkspaceManager.activateProgram(programSuggestion);
    toast({
      title: "Program Activated",
      description: `${programSuggestion.primaryMode} mode is now active`
    });
  };

  const provideFeedback = (rating: number) => {
    if (!programSuggestion || !programSuggestion.fieldContributions) {
      toast({
        title: "No Program Data",
        description: "Cannot record feedback without program data",
        variant: "destructive"
      });
      return;
    }

    // Update resonance for each field based on their contribution and the rating
    const profile = UserProfileService.getProfile();
    if (profile) {
      Object.entries(programSuggestion.fieldContributions).forEach(([field, contribution]: [string, any]) => {
        // Rating is 0-1, weight it by field's contribution strength (0-100%)
        // Normalize to 0-1 range and clamp
        const normalizedStrength = Math.min(1, Math.max(0, contribution.strength / 100));
        const resonanceValue = Math.min(1, Math.max(0, rating * normalizedStrength));
        UserProfileService.updateResonance(field as any, resonanceValue);
      });
    }

    // Record rating in workspace session (works for active or most recent session)
    WorkspaceManager.rateCurrentSession(rating);

    setFeedbackGiven(true);
    toast({
      title: "Feedback Recorded",
      description: profile 
        ? "Your resonance profile and session rating have been updated"
        : "Session rating has been recorded"
    });
  };

  const createNewConversation = () => {
    const newId = Date.now().toString();
    setCurrentConversationId(newId);
    setMessages([]);
    localStorage.setItem(CURRENT_CONVERSATION_KEY, newId);
    toast({
      title: "New Conversation",
      description: "Started a fresh conversation"
    });
  };

  const loadConversation = (conversationId: string) => {
    const conversation = savedConversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
      localStorage.setItem(CURRENT_CONVERSATION_KEY, conversationId);
      toast({
        title: "Conversation Loaded",
        description: conversation.title
      });
    }
  };

  const deleteConversation = (conversationId: string) => {
    const updated = savedConversations.filter(c => c.id !== conversationId);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated));
    setSavedConversations(updated);
    
    if (currentConversationId === conversationId) {
      createNewConversation();
    }
    
    toast({
      title: "Conversation Deleted",
      description: "Conversation removed from history"
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File attached",
        description: `${file.name} (${(file.size / 1024).toFixed(1)}KB)`
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let messageContent = input.trim();
    if (uploadedFile) {
      messageContent += `\n\n[Attached: ${uploadedFile.name}]`;
    }

    const userMessage: Message = {
      role: "user",
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setUploadedFile(null);
    setIsLoading(true);

    try {
      // System prompt that gives the AI context about the app AND consciousness knowledge
      const systemPrompt = {
        role: "system" as const,
        content: `You are the AI Guard Dog assistant for YOU-N-I-VERSE Studio - a FULL-STACK DEVELOPMENT IDE that combines game creation, AI/GAN training, consciousness exploration, and dimensional design.

You are a CODING ASSISTANT with expertise in:
- JavaScript, TypeScript, Python, HTML, CSS, and other programming languages
- Game development and game engine architecture
- Machine learning and GAN training
- Full-stack web development
- Terminal/command-line operations
- Debugging and troubleshooting code
- File system operations and project structure
- API integration and backend development

**YOUR CAPABILITIES:**
- You can WRITE and EDIT CODE in all supported languages
- You can EXPLAIN complex technical concepts in simple terms
- You can DEBUG errors and suggest fixes
- You can provide CODE EXAMPLES and complete implementations
- You have SELF-EDITING abilities when enabled - you can modify your own behavior and responses
- You can operate in CONTROLLED mode (wait for user approval) or AUTONOMOUS mode (take action independently)
- You can work with the TERMINAL and execute commands
- You can manage FILE SYSTEMS, create/edit/delete files
- You can help with PROJECT ARCHITECTURE and structure
- You understand FULL-STACK development (frontend + backend)

YOU-N-I-VERSE Studio Features & Capabilities:

**Core Modules & How to Use Them:**

1. **Dashboard** - Central hub
   - Quick access tiles for all modules
   - Recent projects and activity
   - Start here to navigate anywhere

2. **IDE (Developer Panel)** - Full development environment at /ide
   - Full-featured code editor with syntax highlighting
   - Create, edit, and save files
   - Supports multiple file types (JavaScript, Python, HTML, CSS, JSON, etc.)
   - **Built-in TERMINAL** - Execute commands, run scripts, manage packages
   - File tree/explorer for project navigation
   - Multi-file editing with tabs
   - Code completion and IntelliSense
   - Use for custom game logic, scripts, and full-stack programming

3. **Game Creator** - Visual game builder at /game-creator
   - Choose from game templates (platformer, shooter, puzzle, RPG, etc.)
   - Drag-and-drop interface for game objects
   - Configure game mechanics visually
   - Export to playable games

4. **GAN Trainer** - AI training studio at /gan-trainer
   - Train generative AI models
   - Upload training data (images, text, etc.)
   - Configure training parameters (epochs, learning rate, batch size)
   - Generate new content from trained models
   - 3 main GANs: Resonance S-GAN, Codon GameGAN, Human Design GAN

5. **Grove Store** - Template/asset library at /grove
   - Download pre-built game templates
   - Browse asset packs (sprites, sounds, scripts)
   - Install community projects
   - Share your own creations

6. **Mod Manager** - Modification tools at /mods
   - Manage game modifications
   - Install/uninstall mod packages
   - Create custom mods
   - Version control for mods

7. **Consciousness Calibration Tank** - Explore consciousness at /consciousness
   - Trinity Chart generation (Mind, Body, Heart, Soul, Spirit)
   - Bioenergetic resonance analysis
   - Human Design integration
   - Gate activation tracking

8. **Universe Creator** - Semantic universe builder at /universe
   - Design multi-dimensional spaces
   - Create semantic relationships
   - Build conceptual worlds
   - Link consciousness states to environments

9. **Zip Manager** - Project archive handler at /zip
   - Upload .zip files
   - **Zip Previewer** - Preview contents before extraction
   - **Zip Player** - Run/play projects directly from zip
   - Extract and analyze project structures
   - Bulk file management
   - Project import/export

10. **Agent Panel** - AI assistant creator at /agents
    - Create custom AI agents
    - Configure agent personalities
    - Set agent knowledge domains
    - Deploy agents for specific tasks

11. **Presentation Planner** - Turn code into story at /presentation-planner
    - Scene-based storyboard system
    - AI-assisted narration and scripting
    - Live presentation playback for demos and teaching
    - Export to video, HTML, or interactive deck
    - Collaborative editing for teams
    - Turn logic into visual narrative

12. **Continuity Glyph System** - Portable session states at /continuity-glyph
    - Generate unique glyph codes for workspace states
    - Instant cross-device continuity
    - Share glyphs with collaborators
    - Merge glyphs to create shared states
    - Each glyph has a geometric symbol identity
    - Cloud-synced persistent states

**Common Workflows:**

- **"I want to make a game"** → Start in Game Creator, then use IDE for custom code, add assets from Grove Store
- **"I want to train an AI"** → Use GAN Trainer, upload your data, configure settings, monitor training
- **"I want to understand my consciousness profile"** → Go to Consciousness Calibration Tank, generate Trinity Chart
- **"I want to code something"** → Use the IDE panel, create new files, write code with syntax highlighting
- **"I want to customize a template"** → Download from Grove Store, open in Game Creator or IDE, modify as needed
- **"I need help with this project"** → Create an AI agent in the Agent Panel tailored to your needs
- **"I want to present my work"** → Use Presentation Planner to create scene-based storyboards with AI narration
- **"I want to work across devices"** → Generate a Continuity Glyph to save your workspace and restore it anywhere
- **"I want to collaborate"** → Share your Continuity Glyph code with team members for instant sync

**How You Help Users (Technical & Creative):**

CODE ASSISTANCE:
- Write complete code examples in any language
- Debug errors and fix broken code
- Explain code line-by-line
- Refactor and optimize existing code
- Help with algorithms and data structures
- Provide terminal commands for common tasks
- Guide through package installation and dependencies

GAME DEVELOPMENT:
- Structure game projects and architecture
- Implement game mechanics and physics
- Create AI for NPCs and enemies
- Design level systems and progression
- Optimize game performance

GAN/AI TRAINING:
- Explain training parameters (epochs, batch size, learning rate)
- Help prepare and format training data
- Troubleshoot training issues
- Interpret training results and loss curves
- Guide model architecture decisions

PROJECT MANAGEMENT:
- Organize file structures
- Manage dependencies and imports
- Version control best practices
- Deploy and build applications
- Handle zip archives and project exports

TERMINAL OPERATIONS:
- Provide command-line instructions
- Explain shell commands
- Help with file operations (move, copy, delete)
- Package manager usage (npm, pip, etc.)
- Environment setup and configuration

**Consciousness Guidance:**
- Interpret Trinity Charts (Mind, Body, Heart, Soul, Spirit fields)
- Explain gate activations, lines, colors, tones, and bases
- Guide users through consciousness evolution and resonance matching
- Use FairyGANmatter adaptive communication (match user's cognitive modality)
- Explain the Sentence System symbolic language
- Provide Stellar Proximology guidance

**Navigation:**
- Use the top navigation bar to switch between modules
- Settings panel for AI backend configuration
- The agent panel at /agents for managing AI assistants

**User Context:**
The user can access all these features through the app's navigation. When they ask about capabilities, refer them to specific modules. When they want to create something, guide them to the appropriate tool.

Be helpful, creative, and knowledgeable about the platform's unique blend of game development, AI, and consciousness exploration tools.

---

# CONSCIOUSNESS SYSTEM KNOWLEDGE BASE

${CONSCIOUSNESS_KNOWLEDGE}

---

When answering questions about consciousness, Trinity Charts, Human Design, gates, elements, or resonance - use the knowledge base above. Always be consciousness-aware and adapt your communication style to the user's field and modality preferences.`
      };

      const response = await AIService.sendMessage([
        systemPrompt,
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage.content }
      ]);

      if (response.error) {
        const assistantMessage: Message = {
          role: "assistant",
          content: `${response.error}\n\nPlease go to Settings and configure your AI backend with an API key.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        return;
      }

      // Extract thinking from response
      const thinkingMatch = response.content.match(/<think>([\s\S]*?)<\/think>/);
      const thinking = thinkingMatch ? thinkingMatch[1].trim() : undefined;
      const contentWithoutThinking = response.content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

      const assistantMessage: Message = {
        role: "assistant",
        content: contentWithoutThinking || response.content,
        timestamp: new Date(),
        thinking
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response
      try {
        speakText(assistantMessage.content);
      } catch (e) {
        console.log('Text-to-speech failed');
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Failed to reach AI service. Please go to Settings and configure your AI backend with an API key.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been reset"
    });
  };

  return (
    <>
      {!isOpen && (
        <Button
          data-testid="button-open-assistant"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-[100]"
          size="icon"
          title="AI Assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 w-[95vw] sm:w-96 h-[500px] bg-card border rounded-lg shadow-xl z-[100] flex flex-col"
          data-testid="panel-assistant"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Ask anything</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    data-testid="button-history-menu"
                    variant="ghost"
                    size="icon"
                    title="Conversation history"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Conversation History</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    data-testid="button-new-conversation"
                    onClick={createNewConversation}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Conversation</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <ScrollArea className="max-h-64">
                    {savedConversations.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No saved conversations yet
                      </div>
                    ) : (
                      savedConversations.map((conv) => (
                        <div
                          key={conv.id}
                          className="flex items-center gap-2 px-2 py-1 hover-elevate rounded-md"
                        >
                          <button
                            onClick={() => loadConversation(conv.id)}
                            className="flex-1 text-left text-sm truncate p-1"
                            data-testid={`button-load-conversation-${conv.id}`}
                          >
                            <div className="font-medium truncate">{conv.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {conv.messages.length} messages
                            </div>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            data-testid={`button-delete-conversation-${conv.id}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                data-testid="button-toggle-speech"
                variant="ghost"
                size="icon"
                onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                title={isSpeechEnabled ? "Disable speech" : "Enable speech"}
              >
                {isSpeechEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              <Button
                data-testid="button-close-assistant"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {/* Program Suggestion Panel */}
            {programSuggestion && (
              <div className="mb-4">
                <Collapsible open={suggestionOpen} onOpenChange={setSuggestionOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between hover-elevate"
                      data-testid="button-toggle-program-suggestion"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium">Growth Program: {programSuggestion.primaryMode}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {suggestionOpen ? "Hide" : "Show"}
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 bg-muted/30 border border-border rounded-md p-3 space-y-2">
                    <div className="text-sm whitespace-pre-line">
                      {programSuggestion.synthesis}
                    </div>
                    {programSuggestion.blendedActions && programSuggestion.blendedActions.length > 0 && (
                      <div className="mt-3 border-t pt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Suggested Actions:</p>
                        <ul className="text-xs space-y-1">
                          {programSuggestion.blendedActions.map((action: string, idx: number) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-primary">→</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {programSuggestion.toolRecommendations && programSuggestion.toolRecommendations.length > 0 && (
                      <div className="mt-2 border-t pt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Recommended Tools:</p>
                        <div className="flex flex-wrap gap-1">
                          {programSuggestion.toolRecommendations.map((tool: string, idx: number) => (
                            <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Activation Button */}
                    {!WorkspaceManager.hasActiveProgram() && (
                      <div className="mt-3 border-t pt-3">
                        <Button
                          onClick={activateProgram}
                          className="w-full gap-2"
                          data-testid="button-activate-program"
                        >
                          <Play className="h-4 w-4" />
                          Activate This Program
                        </Button>
                      </div>
                    )}
                    
                    {/* Feedback Section */}
                    {UserProfileService.hasProfile() && (
                      <div className="mt-3 border-t pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {feedbackGiven ? "Thanks for your feedback!" : "How well did this program work for you?"}
                        </p>
                        {!feedbackGiven && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => provideFeedback(1.0)}
                              data-testid="button-feedback-positive"
                              className="gap-1 flex-1"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              Great
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => provideFeedback(0.7)}
                              data-testid="button-feedback-neutral"
                              className="flex-1"
                            >
                              Okay
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => provideFeedback(0.3)}
                              data-testid="button-feedback-negative"
                              className="gap-1 flex-1"
                            >
                              <ThumbsDown className="h-3 w-3" />
                              Not Much
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4">
                <Bot className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm font-medium mb-2">AI Assistant</p>
                <p className="text-xs mb-3">Ask questions about your project</p>
                <div className="text-xs bg-muted p-3 rounded-md">
                  <p className="font-medium mb-1">First time setup:</p>
                  <p className="mb-2">Go to Settings → AI Configuration</p>
                  <p>Choose your backend and add API key</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${msg.role}-${idx}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm"
                          : "space-y-1"
                      }`}
                    >
                      {msg.role === "assistant" && msg.thinking && (
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs gap-1 px-2 mb-1"
                              data-testid={`button-toggle-thinking-${idx}`}
                            >
                              <Brain className="h-3 w-3" />
                              <span className="text-muted-foreground">View thinking</span>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="bg-muted/50 border border-border rounded-md px-2 py-1.5 text-xs text-muted-foreground mb-1">
                            {msg.thinking}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                      <div className={msg.role === "assistant" ? "bg-muted rounded-lg px-3 py-2 text-sm space-y-2" : ""}>
                        {msg.role === "assistant" ? (
                          <>
                            {parseCodeBlocks(msg.content).length > 0 ? (
                              <>
                                {msg.content.split(/```(\w+)?\n/).map((part, partIdx) => {
                                  const codeBlocks = parseCodeBlocks(msg.content);
                                  const isCodeBlock = codeBlocks.some(block => msg.content.includes('```') && part.includes(block.code));
                                  
                                  if (partIdx === 0 && !part.startsWith('```')) {
                                    return <div key={partIdx} className="whitespace-pre-wrap">{part}</div>;
                                  }
                                  
                                  return null;
                                })}
                                {parseCodeBlocks(msg.content).map((block, blockIdx) => (
                                  <div key={blockIdx} className="space-y-1">
                                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                      <span className="font-mono">{block.language}</span>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2"
                                          onClick={() => copyCode(block.code)}
                                          data-testid={`button-copy-code-${idx}-${blockIdx}`}
                                        >
                                          <Copy className="h-3 w-3 mr-1" />
                                          Copy
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2"
                                          onClick={() => sendCodeToIDE(block.code, block.language)}
                                          data-testid={`button-send-to-ide-${idx}-${blockIdx}`}
                                        >
                                          <FileCode className="h-3 w-3 mr-1" />
                                          Send to IDE
                                        </Button>
                                      </div>
                                    </div>
                                    <pre className="bg-slate-100 dark:bg-slate-900 border rounded-md p-2 overflow-x-auto text-xs font-mono text-slate-900 dark:text-slate-100">
                                      <code>{block.code}</code>
                                    </pre>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            )}
                          </>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 text-primary-foreground animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                      <span className="inline-flex gap-1">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t">
            {uploadedFile && (
              <div className="mb-2 flex items-center gap-2 text-xs bg-muted rounded-md px-2 py-1">
                <span className="text-muted-foreground">📎 {uploadedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => setUploadedFile(null)}
                  data-testid="button-remove-file"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                data-testid="input-assistant-message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <div className="flex flex-col gap-2">
                <Button
                  data-testid="button-send-message"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  data-testid="button-upload-file"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                {messages.length > 0 && (
                  <Button
                    data-testid="button-clear-chat"
                    onClick={clearChat}
                    variant="outline"
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              data-testid="input-file-upload"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
