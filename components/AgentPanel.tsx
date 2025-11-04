import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Plus, Settings, Trash2, Power, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  personality: string;
  status: "active" | "inactive";
  createdAt: string;
  backend: "claude" | "gpt4" | "deepseek" | "grok" | "codellama";
}

const AGENT_STORAGE_KEY = "youniverse_agents";

export function AgentPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    personality: "helpful",
    backend: "claude" as Agent["backend"],
  });

  // Load agents from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(AGENT_STORAGE_KEY);
    if (stored) {
      try {
        setAgents(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load agents:", e);
      }
    }
  }, []);

  // Save agents to localStorage
  useEffect(() => {
    localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agents));
  }, [agents]);

  const handleCreateAgent = () => {
    if (!formData.name.trim() || !formData.role.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in at least the name and role",
        variant: "destructive",
      });
      return;
    }

    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: formData.name,
      role: formData.role,
      description: formData.description,
      personality: formData.personality,
      status: "active",
      createdAt: new Date().toISOString(),
      backend: formData.backend,
    };

    setAgents([...agents, newAgent]);
    setShowCreateDialog(false);
    resetForm();

    toast({
      title: "Agent created!",
      description: `${newAgent.name} is now active`,
    });
  };

  const handleUpdateAgent = () => {
    if (!editingAgent || !formData.name.trim() || !formData.role.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in at least the name and role",
        variant: "destructive",
      });
      return;
    }

    setAgents(
      agents.map((agent) =>
        agent.id === editingAgent.id
          ? {
              ...agent,
              name: formData.name,
              role: formData.role,
              description: formData.description,
              personality: formData.personality,
              backend: formData.backend,
            }
          : agent
      )
    );

    setEditingAgent(null);
    resetForm();

    toast({
      title: "Agent updated!",
      description: `${formData.name} has been updated`,
    });
  };

  const handleToggleStatus = (id: string) => {
    setAgents(
      agents.map((agent) =>
        agent.id === id
          ? { ...agent, status: agent.status === "active" ? "inactive" : "active" }
          : agent
      )
    );

    const agent = agents.find((a) => a.id === id);
    toast({
      title: agent?.status === "active" ? "Agent deactivated" : "Agent activated",
      description: `${agent?.name} is now ${agent?.status === "active" ? "inactive" : "active"}`,
    });
  };

  const handleDeleteAgent = (id: string) => {
    const agent = agents.find((a) => a.id === id);
    setAgents(agents.filter((a) => a.id !== id));

    toast({
      title: "Agent deleted",
      description: `${agent?.name} has been removed`,
    });
  };

  const openEditDialog = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      role: agent.role,
      description: agent.description,
      personality: agent.personality,
      backend: agent.backend,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      description: "",
      personality: "helpful",
      backend: "claude",
    });
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setEditingAgent(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-background">

      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">AI Agents</h1>
            <p className="text-muted-foreground">
              Build and manage your AI consciousness companions
            </p>
          </div>
          <Button
            className="touch-manipulation"
            onClick={() => setShowCreateDialog(true)}
            data-testid="button-create-agent"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Agent
          </Button>
        </div>

        {agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEdit={() => openEditDialog(agent)}
                onToggle={() => handleToggleStatus(agent.id)}
                onDelete={() => handleDeleteAgent(agent.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 p-8 border-2 border-dashed border-primary/30 rounded-lg text-center bg-card">
            <Bot className="h-16 w-16 mx-auto mb-4 text-primary/40" />
            <h3 className="text-lg font-semibold mb-2">Create Your First Agent</h3>
            <p className="text-sm text-muted-foreground mb-6">
              AI agents can help with coding, creative tasks, debugging, and more
            </p>
            <Button
              className="touch-manipulation"
              onClick={() => setShowCreateDialog(true)}
              data-testid="button-create-first-agent"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Agent
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || editingAgent !== null} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {editingAgent ? "Edit Agent" : "Create New Agent"}
            </DialogTitle>
            <DialogDescription>
              {editingAgent
                ? "Update your AI agent's configuration"
                : "Configure your new AI consciousness companion"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Code Assistant"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-agent-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                placeholder="e.g., Development Helper"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                data-testid="input-agent-role"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this agent do?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[80px]"
                data-testid="input-agent-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality">Personality</Label>
              <Select
                value={formData.personality}
                onValueChange={(value) => setFormData({ ...formData, personality: value })}
              >
                <SelectTrigger id="personality" data-testid="select-personality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helpful">Helpful & Professional</SelectItem>
                  <SelectItem value="creative">Creative & Playful</SelectItem>
                  <SelectItem value="technical">Technical & Precise</SelectItem>
                  <SelectItem value="friendly">Friendly & Casual</SelectItem>
                  <SelectItem value="wise">Wise & Philosophical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backend">AI Backend</Label>
              <Select
                value={formData.backend}
                onValueChange={(value) => setFormData({ ...formData, backend: value as Agent["backend"] })}
              >
                <SelectTrigger id="backend" data-testid="select-backend">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                  <SelectItem value="gpt4">GPT-4 (OpenAI)</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="grok">Grok (xAI)</SelectItem>
                  <SelectItem value="codellama">CodeLlama (Local)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              data-testid="button-cancel"
              className="touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              onClick={editingAgent ? handleUpdateAgent : handleCreateAgent}
              className="touch-manipulation"
              data-testid="button-save-agent"
            >
              {editingAgent ? "Update" : "Create"} Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgentCard({
  agent,
  onEdit,
  onToggle,
  onDelete,
}: {
  agent: Agent;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-6 hover-elevate transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              agent.status === "active" ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <Badge variant="outline" className="text-xs">
            {agent.backend}
          </Badge>
        </div>
      </div>

      <h3 className="font-semibold mb-1" data-testid={`text-agent-name-${agent.id}`}>
        {agent.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-2">{agent.role}</p>
      {agent.description && (
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
          {agent.description}
        </p>
      )}

      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1 touch-manipulation"
          data-testid={`button-edit-agent-${agent.id}`}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className={`touch-manipulation min-w-[2.5rem] ${
            agent.status === "active" ? "bg-green-500/10" : ""
          }`}
          data-testid={`button-toggle-agent-${agent.id}`}
        >
          <Power className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="touch-manipulation min-w-[2.5rem]"
          data-testid={`button-delete-agent-${agent.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
