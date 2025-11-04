import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Terminal as TerminalIcon, Zap } from "lucide-react";

interface TerminalLine {
  type: "input" | "output" | "error";
  content: string;
  timestamp: Date;
}

interface TerminalProps {
  onClose?: () => void;
}

const QUICK_COMMANDS = [
  { label: "Help", cmd: "help", icon: "❓" },
  { label: "Clear", cmd: "clear", icon: "🧹" },
  { label: "List", cmd: "ls -la", icon: "📋" },
  { label: "History", cmd: "history", icon: "📜" },
  { label: "Date", cmd: "date", icon: "📅" },
  { label: "Disk", cmd: "df -h", icon: "💾" },
];

export function Terminal({ onClose }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: "output",
      content: "YOU–N–I–VERSE Terminal v1.0.0",
      timestamp: new Date()
    },
    {
      type: "output",
      content: "Type commands below. Try: help, clear, echo <message>",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCommandRef, setShowCommandRef] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Add input to history
    setLines(prev => [...prev, {
      type: "input",
      content: `$ ${trimmedCmd}`,
      timestamp: new Date()
    }]);

    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Handle built-in commands
    const parts = trimmedCmd.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        setLines(prev => [...prev, {
          type: "output",
          content: [
            "YOU–N–I–VERSE Terminal - Available Commands:",
            "",
            "Navigation & Info:",
            "  pwd           - Print working directory",
            "  ls [-la]      - List files (use -la for all files, long format)",
            "  cd <dir>      - Change directory (simulated)",
            "",
            "File Operations:",
            "  cat <file>    - Display file contents (simulated)",
            "  mkdir <dir>   - Create directory (simulated)",
            "  rm <file>     - Remove file (simulated)",
            "  cp <src> <dst> - Copy file (simulated)",
            "  mv <src> <dst> - Move/rename file (simulated)",
            "",
            "Text Processing:",
            "  echo <text>   - Print text to terminal",
            "  grep <pattern> - Search for pattern (simulated)",
            "",
            "System Info:",
            "  date          - Show current date/time",
            "  whoami        - Show current user",
            "  uname         - Show system info",
            "  df [-h]       - Show disk space",
            "  ps            - Show processes (simulated)",
            "",
            "Utilities:",
            "  clear         - Clear terminal",
            "  history       - Show command history",
            "  alias         - Show/create aliases (coming soon)",
            "",
            "Note: Some commands are simulated for browser environment.",
            "Use the file explorer for actual file operations."
          ].join("\n"),
          timestamp: new Date()
        }]);
        break;

      case "clear":
        setLines([]);
        break;

      case "echo":
        setLines(prev => [...prev, {
          type: "output",
          content: args.join(" "),
          timestamp: new Date()
        }]);
        break;

      case "date":
        setLines(prev => [...prev, {
          type: "output",
          content: new Date().toString(),
          timestamp: new Date()
        }]);
        break;

      case "pwd":
        setLines(prev => [...prev, {
          type: "output",
          content: "/workspace/youniverse-studio",
          timestamp: new Date()
        }]);
        break;

      case "ls":
        const flags = args.join(" ");
        const showAll = flags.includes("-a") || flags.includes("-la");
        const longFormat = flags.includes("-l") || flags.includes("-la");
        
        let output = "index.html  styles.css  script.js  README.md";
        if (showAll) {
          output = ".  ..  .git  .env  " + output;
        }
        if (longFormat) {
          output = [
            "total 24",
            "drwxr-xr-x  5 user  staff   160 Oct 25 11:30 .",
            "drwxr-xr-x  8 user  staff   256 Oct 24 09:15 ..",
            "-rw-r--r--  1 user  staff  1024 Oct 25 11:20 index.html",
            "-rw-r--r--  1 user  staff   512 Oct 25 10:15 styles.css",
            "-rw-r--r--  1 user  staff  2048 Oct 25 11:25 script.js",
            "-rw-r--r--  1 user  staff   256 Oct 24 14:30 README.md"
          ].join("\n");
        }
        
        setLines(prev => [...prev, {
          type: "output",
          content: output,
          timestamp: new Date()
        }]);
        break;

      case "cd":
        const dir = args[0] || "~";
        setLines(prev => [...prev, {
          type: "output",
          content: `Changed directory to: ${dir}`,
          timestamp: new Date()
        }]);
        break;

      case "cat":
        if (!args[0]) {
          setLines(prev => [...prev, {
            type: "error",
            content: "cat: missing file operand",
            timestamp: new Date()
          }]);
        } else {
          setLines(prev => [...prev, {
            type: "output",
            content: `Contents of ${args[0]}:\n(Use the file explorer to view actual file contents)`,
            timestamp: new Date()
          }]);
        }
        break;

      case "mkdir":
        if (!args[0]) {
          setLines(prev => [...prev, {
            type: "error",
            content: "mkdir: missing operand",
            timestamp: new Date()
          }]);
        } else {
          setLines(prev => [...prev, {
            type: "output",
            content: `Directory created: ${args[0]}\n(Use the file explorer for actual operations)`,
            timestamp: new Date()
          }]);
        }
        break;

      case "rm":
        if (!args[0]) {
          setLines(prev => [...prev, {
            type: "error",
            content: "rm: missing operand",
            timestamp: new Date()
          }]);
        } else {
          setLines(prev => [...prev, {
            type: "output",
            content: `Would remove: ${args.join(" ")}\n(Use the file explorer for actual operations)`,
            timestamp: new Date()
          }]);
        }
        break;

      case "cp":
      case "mv":
        if (args.length < 2) {
          setLines(prev => [...prev, {
            type: "error",
            content: `${command}: missing file operand`,
            timestamp: new Date()
          }]);
        } else {
          setLines(prev => [...prev, {
            type: "output",
            content: `Would ${command === "cp" ? "copy" : "move"}: ${args[0]} → ${args[1]}\n(Use the file explorer for actual operations)`,
            timestamp: new Date()
          }]);
        }
        break;

      case "grep":
        if (!args[0]) {
          setLines(prev => [...prev, {
            type: "error",
            content: "grep: missing search pattern",
            timestamp: new Date()
          }]);
        } else {
          setLines(prev => [...prev, {
            type: "output",
            content: `Searching for pattern: "${args[0]}"\n(Browser-based search - results simulated)`,
            timestamp: new Date()
          }]);
        }
        break;

      case "whoami":
        setLines(prev => [...prev, {
          type: "output",
          content: "youniverse-developer",
          timestamp: new Date()
        }]);
        break;

      case "uname":
        const unameFlags = args.join("");
        let unameOutput = "YOU–N–I–VERSE";
        if (unameFlags.includes("a")) {
          unameOutput = "YOU–N–I–VERSE 1.0.0 Browser x86_64 WebKit";
        } else if (unameFlags.includes("r")) {
          unameOutput = "1.0.0";
        }
        setLines(prev => [...prev, {
          type: "output",
          content: unameOutput,
          timestamp: new Date()
        }]);
        break;

      case "df":
        const dfFlags = args.join("");
        const humanReadable = dfFlags.includes("h");
        setLines(prev => [...prev, {
          type: "output",
          content: humanReadable
            ? "Filesystem      Size  Used Avail Use% Mounted on\n/dev/disk1     500G  320G  180G  64% /"
            : "Filesystem     1K-blocks      Used Available Use% Mounted on\n/dev/disk1     524288000 335544320 188743680  64% /",
          timestamp: new Date()
        }]);
        break;

      case "ps":
        setLines(prev => [...prev, {
          type: "output",
          content: [
            "  PID TTY          TIME CMD",
            " 1234 pts/0    00:00:01 bash",
            " 5678 pts/0    00:00:00 node",
            " 9012 pts/0    00:00:00 ps"
          ].join("\n"),
          timestamp: new Date()
        }]);
        break;

      case "history":
        if (commandHistory.length === 0) {
          setLines(prev => [...prev, {
            type: "output",
            content: "No command history yet",
            timestamp: new Date()
          }]);
        } else {
          const historyOutput = commandHistory
            .map((cmd, idx) => `  ${idx + 1}  ${cmd}`)
            .join("\n");
          setLines(prev => [...prev, {
            type: "output",
            content: historyOutput,
            timestamp: new Date()
          }]);
        }
        break;

      case "ping":
        const pingTarget = args[0] || "localhost";
        setLines(prev => [...prev, {
          type: "output",
          content: `PING ${pingTarget} (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.123 ms\n(Simulated - network commands limited in browser)`,
          timestamp: new Date()
        }]);
        break;

      case "curl":
      case "wget":
        setLines(prev => [...prev, {
          type: "output",
          content: `${command}: Network operations are limited in browser environment.\nUse the browser's fetch API or external tools for HTTP requests.`,
          timestamp: new Date()
        }]);
        break;

      case "tar":
      case "zip":
      case "unzip":
        setLines(prev => [...prev, {
          type: "output",
          content: `${command}: Archive operations available through the IDE's download/upload features.\nUse Export menu for creating archives.`,
          timestamp: new Date()
        }]);
        break;

      case "apt":
      case "yum":
      case "dnf":
      case "brew":
        setLines(prev => [...prev, {
          type: "output",
          content: `${command}: Package managers not available in browser environment.\nThis is a browser-based IDE - packages are pre-configured.`,
          timestamp: new Date()
        }]);
        break;

      default:
        setLines(prev => [...prev, {
          type: "error",
          content: `bash: ${command}: command not found\nType 'help' for available commands`,
          timestamp: new Date()
        }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const runQuickCommand = (cmd: string) => {
    setInput(cmd);
    executeCommand(cmd);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-black/95 text-green-400 rounded-lg overflow-hidden border border-green-500/20">
      <div className="flex items-center justify-between px-3 py-2 bg-green-500/10 border-b border-green-500/20">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4" />
          <span className="text-sm font-mono font-semibold">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommandRef(!showCommandRef)}
            className="h-6 text-xs hover:bg-green-500/20 text-green-400"
            data-testid="button-toggle-command-ref"
          >
            📖 Commands
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 hover:bg-green-500/20"
              data-testid="button-close-terminal"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {showCommandRef ? (
        <div className="px-3 py-2 bg-green-500/5 border-b border-green-500/20 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <div className="text-green-400 font-semibold mb-1">📁 Navigation</div>
              <div className="text-green-300/70 space-y-0.5">
                <div><span className="text-green-400">pwd</span> - print working directory</div>
                <div><span className="text-green-400">ls [-la]</span> - list files</div>
                <div><span className="text-green-400">cd &lt;dir&gt;</span> - change directory</div>
              </div>
            </div>
            <div>
              <div className="text-green-400 font-semibold mb-1">📄 Files</div>
              <div className="text-green-300/70 space-y-0.5">
                <div><span className="text-green-400">cat &lt;file&gt;</span> - show file</div>
                <div><span className="text-green-400">mkdir &lt;dir&gt;</span> - create directory</div>
                <div><span className="text-green-400">rm &lt;file&gt;</span> - remove file</div>
                <div><span className="text-green-400">cp &lt;src&gt; &lt;dst&gt;</span> - copy</div>
                <div><span className="text-green-400">mv &lt;src&gt; &lt;dst&gt;</span> - move</div>
              </div>
            </div>
            <div>
              <div className="text-green-400 font-semibold mb-1">🔍 Text</div>
              <div className="text-green-300/70 space-y-0.5">
                <div><span className="text-green-400">echo &lt;text&gt;</span> - print text</div>
                <div><span className="text-green-400">grep &lt;pattern&gt;</span> - search</div>
              </div>
            </div>
            <div>
              <div className="text-green-400 font-semibold mb-1">💻 System</div>
              <div className="text-green-300/70 space-y-0.5">
                <div><span className="text-green-400">date</span> - current date/time</div>
                <div><span className="text-green-400">whoami</span> - current user</div>
                <div><span className="text-green-400">uname</span> - system info</div>
                <div><span className="text-green-400">df [-h]</span> - disk space</div>
                <div><span className="text-green-400">ps</span> - processes</div>
              </div>
            </div>
            <div>
              <div className="text-green-400 font-semibold mb-1">🛠️ Utils</div>
              <div className="text-green-300/70 space-y-0.5">
                <div><span className="text-green-400">clear</span> - clear screen</div>
                <div><span className="text-green-400">history</span> - command history</div>
                <div><span className="text-green-400">help</span> - show full help</div>
              </div>
            </div>
            <div>
              <div className="text-green-400 font-semibold mb-1">🌐 Network</div>
              <div className="text-green-300/70 space-y-0.5">
                <div><span className="text-green-400">ping &lt;host&gt;</span> - test connectivity</div>
                <div><span className="text-green-400">curl</span> - HTTP requests</div>
                <div><span className="text-green-400">wget</span> - download files</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3 py-2 bg-green-500/5 border-b border-green-500/20 flex gap-2 flex-wrap">
          <div className="flex items-center gap-1 mr-2">
            <Zap className="h-3 w-3 text-green-400/60" />
            <span className="text-xs text-green-400/60">Quick:</span>
          </div>
          {QUICK_COMMANDS.map((quick) => (
            <Badge
              key={quick.cmd}
              variant="outline"
              className="cursor-pointer hover:bg-green-500/20 border-green-500/30 text-green-400 touch-manipulation text-xs"
              onClick={() => runQuickCommand(quick.cmd)}
              data-testid={`button-quick-${quick.cmd}`}
            >
              <span className="mr-1">{quick.icon}</span>
              {quick.label}
            </Badge>
          ))}
        </div>
      )}

      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="font-mono text-sm space-y-1">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`whitespace-pre-wrap ${
                line.type === "input"
                  ? "text-green-400 font-semibold"
                  : line.type === "error"
                  ? "text-red-400"
                  : "text-green-300/80"
              }`}
            >
              {line.content}
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-3 border-t border-green-500/20">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono text-sm font-semibold">$</span>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
            className="flex-1 bg-transparent border-none text-green-400 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-green-500/40"
            autoFocus
            data-testid="input-terminal-command"
          />
        </div>
      </form>
    </div>
  );
}
