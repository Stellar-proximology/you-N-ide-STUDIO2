/**
 * AI Service Router
 * Handles API calls to different AI backends based on user selection
 * DO NOT MODIFY STRUCTURE - Only add new backends or update endpoints
 */

interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AIResponse {
  content: string;
  error?: string;
}

export class AIService {
  private static getSelectedBackend(): string {
    return localStorage.getItem("ai_backend") || "claude";
  }

  private static getApiKey(backend: string): string | null {
    return localStorage.getItem(`ai_key_${backend}`);
  }

  /**
   * Test API key validation
   */
  static async testConnection(backend: string, apiKey: string): Promise<AIResponse> {
    const testMessages: AIMessage[] = [
      { role: "user", content: "Hello" }
    ];

    try {
      switch (backend) {
        case "claude":
          return await this.callClaudeWithKey(testMessages, apiKey);
        case "gpt":
          return await this.callGPTWithKey(testMessages, apiKey);
        case "deepseek":
          return await this.callDeepSeekWithKey(testMessages, apiKey);
        case "grok":
          return await this.callGrokWithKey(testMessages, apiKey);
        case "huggingface":
          return await this.callHuggingFaceWithKey(testMessages, apiKey);
        case "codellama":
          return { content: "Local model - no key validation needed" };
        default:
          return { content: "", error: `Unknown backend: ${backend}` };
      }
    } catch (error) {
      console.error("Connection test error:", error);
      return {
        content: "",
        error: error instanceof Error ? error.message : "Connection test failed"
      };
    }
  }

  /**
   * Send a message to the selected AI backend
   */
  static async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    const backend = this.getSelectedBackend();
    
    try {
      switch (backend) {
        case "claude":
          return await this.callClaude(messages);
        case "gpt":
          return await this.callGPT(messages);
        case "codellama":
          return await this.callCodeLlama(messages);
        case "deepseek":
          return await this.callDeepSeek(messages);
        case "grok":
          return await this.callGrok(messages);
        case "huggingface":
          return await this.callHuggingFace(messages);
        default:
          return { content: "", error: `Unknown backend: ${backend}` };
      }
    } catch (error) {
      console.error("AI Service Error:", error);
      return {
        content: "",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  /**
   * Claude (Anthropic) API
   */
  private static async callClaude(messages: AIMessage[]): Promise<AIResponse> {
    const apiKey = this.getApiKey("claude");
    if (!apiKey) {
      return { content: "", error: "Claude API key not configured" };
    }
    return this.callClaudeWithKey(messages, apiKey);
  }

  private static async callClaudeWithKey(messages: AIMessage[], apiKey: string): Promise<AIResponse> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: messages.map(m => ({
          role: m.role === "system" ? "user" : m.role,
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      throw new Error(`Claude API error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error("Invalid response format from Claude API");
    }
    return { content: data.content[0].text };
  }

  /**
   * GPT (OpenAI) API
   */
  private static async callGPT(messages: AIMessage[]): Promise<AIResponse> {
    const apiKey = this.getApiKey("gpt");
    if (!apiKey) {
      return { content: "", error: "OpenAI API key not configured" };
    }
    return this.callGPTWithKey(messages, apiKey);
  }

  private static async callGPTWithKey(messages: AIMessage[], apiKey: string): Promise<AIResponse> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      throw new Error(`OpenAI API error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error("Invalid response format from OpenAI API");
    }
    return { content: data.choices[0].message.content };
  }

  /**
   * CodeLlama (Ollama Local) API
   */
  private static async callCodeLlama(messages: AIMessage[]): Promise<AIResponse> {
    const ollamaUrl = localStorage.getItem("ollama_url") || "http://localhost:11434";
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join("\n\n");

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "codellama",
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama not available at ${ollamaUrl}. Is Ollama running?`);
    }

    const data = await response.json();
    return { content: data.response };
  }

  /**
   * DeepSeek API
   */
  private static async callDeepSeek(messages: AIMessage[]): Promise<AIResponse> {
    const apiKey = this.getApiKey("deepseek");
    if (!apiKey) {
      return { content: "", error: "DeepSeek API key not configured" };
    }
    return this.callDeepSeekWithKey(messages, apiKey);
  }

  private static async callDeepSeekWithKey(messages: AIMessage[], apiKey: string): Promise<AIResponse> {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      throw new Error(`DeepSeek API error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error("Invalid response format from DeepSeek API");
    }
    return { content: data.choices[0].message.content };
  }

  /**
   * Grok (xAI) API
   */
  private static async callGrok(messages: AIMessage[]): Promise<AIResponse> {
    const apiKey = this.getApiKey("grok");
    if (!apiKey) {
      return { content: "", error: "Grok API key not configured" };
    }
    return this.callGrokWithKey(messages, apiKey);
  }

  private static async callGrokWithKey(messages: AIMessage[], apiKey: string): Promise<AIResponse> {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: messages,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      throw new Error(`Grok API error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error("Invalid response format from Grok API");
    }
    return { content: data.choices[0].message.content };
  }

  /**
   * MiniMax M2 API (OpenAI-compatible)
   * Official MiniMax API - Free until November 7, 2025
   */
  private static async callHuggingFace(messages: AIMessage[]): Promise<AIResponse> {
    const apiKey = this.getApiKey("huggingface");
    if (!apiKey) {
      return { content: "", error: "MiniMax API key not configured. Get one at https://platform.minimax.io" };
    }
    return this.callHuggingFaceWithKey(messages, apiKey);
  }

  private static async callHuggingFaceWithKey(messages: AIMessage[], apiKey: string): Promise<AIResponse> {
    const response = await fetch("https://api.minimax.io/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "MiniMax-M2",
        messages: messages,
        max_tokens: 4096,
        temperature: 1.0,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || errorData.detail || response.statusText;
      throw new Error(`MiniMax API error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error("Invalid response format from MiniMax API");
    }
    return { content: data.choices[0].message.content };
  }
}
