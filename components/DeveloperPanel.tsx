import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FolderTree, Code2, Globe, Play, Save, Plus, Trash2, X, Menu, Sparkles, Download, Cloud, Github, Upload, MoreVertical, Store, Terminal as TerminalIcon, FileText, FolderOpen, Copy, Scissors, ClipboardPaste, Search, RotateCcw, RotateCw, Maximize, Moon, Sun, Bot, Brain, Gamepad2, Rocket } from "lucide-react";
import { GlyphGenerator, detectDimension } from "@/lib/glyphGenerator";
import JSZip from "jszip";
import { FileSystem, type FileNode } from "@/lib/fileSystem";
import { useToast } from "@/hooks/use-toast";
import { Terminal } from "@/components/Terminal";
import { SelfEditor } from "@/components/SelfEditor";
import { WorkspaceOrganizer } from "@/components/WorkspaceOrganizer";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from "@/components/ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeveloperPanel() {
  const [, setLocation] = useLocation();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [currentFile, setCurrentFile] = useState<FileNode | null>(null);
  const [code, setCode] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [codeSnatcherOpen, setCodeSnatcherOpen] = useState(false);
  const [snatchUrl, setSnatchUrl] = useState("");
  const [isSnatchingCode, setIsSnatchingCode] = useState(false);
  const [isExportingToDrive, setIsExportingToDrive] = useState(false);
  const [isPushingToGitHub, setIsPushingToGitHub] = useState(false);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [importRepoUrl, setImportRepoUrl] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSelfEditor, setShowSelfEditor] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const { toast} = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    const allFiles = FileSystem.getAllFiles();
    setFiles(allFiles);
    
    if (!currentFile && allFiles.length > 0) {
      const firstFile = findFirstFile(allFiles);
      if (firstFile) {
        openFile(firstFile);
      }
    }
  };

  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') return node;
      if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const openFile = (file: FileNode) => {
    if (file.type === 'file') {
      setCurrentFile(file);
      setCode(file.content || '');
      setShowFilePanel(false);
    }
  };

  const handleFileModified = (filePath: string) => {
    loadFiles();
    
    if (currentFile && currentFile.path === filePath) {
      const updatedFile = FileSystem.findFile(filePath);
      if (updatedFile) {
        setCurrentFile(updatedFile);
        setCode(updatedFile.content || '');
      }
    }
  };

  const handleSave = () => {
    if (currentFile) {
      FileSystem.saveFile(currentFile.path, code);
      toast({
        title: "Saved",
        description: `${currentFile.name} saved successfully`
      });
      loadFiles();
    }
  };

  const handleRun = () => {
    const htmlFile = FileSystem.findFile('index.html');
    if (!htmlFile || !htmlFile.content) {
      toast({
        title: "No HTML file",
        description: "Create an index.html file to preview",
        variant: "destructive"
      });
      return;
    }

    let html = htmlFile.content;
    
    html = html.replace(/<link\s+rel="stylesheet"\s+href="([^"]+)">/g, (match, href) => {
      const cssFile = FileSystem.findFile(href);
      if (cssFile && cssFile.content) {
        return `<style>${cssFile.content}</style>`;
      }
      return match;
    });
    
    html = html.replace(/<script\s+src="([^"]+)"><\/script>/g, (match, src) => {
      const jsFile = FileSystem.findFile(src);
      if (jsFile && jsFile.content) {
        return `<script>${jsFile.content}</script>`;
      }
      return match;
    });
    
    setPreviewContent(html);
    toast({
      title: "Running",
      description: "Code executed in preview pane"
    });
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    
    FileSystem.createFile('', newFileName);
    setNewFileName('');
    setShowNewFileInput(false);
    loadFiles();
    toast({
      title: "Created",
      description: `${newFileName} created`
    });
  };

  const handleDeleteFile = (file: FileNode) => {
    if (confirm(`Delete ${file.name}?`)) {
      FileSystem.deleteFile(file.path);
      if (currentFile?.path === file.path) {
        setCurrentFile(null);
        setCode('');
      }
      loadFiles();
      toast({
        title: "Deleted",
        description: `${file.name} deleted`
      });
    }
  };

  const insertSnippet = (snippet: string) => {
    if (!currentFile) {
      toast({
        title: "No file selected",
        description: "Open a file first to insert code",
        variant: "destructive"
      });
      return;
    }
    
    setCode((prevCode) => prevCode + '\n' + snippet);
    toast({
      title: "Snippet inserted!",
      description: "Code snippet added to file"
    });
  };

  const handleSnatchCode = async () => {
    if (!snatchUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Enter a website URL to snatch code from",
        variant: "destructive"
      });
      return;
    }

    setIsSnatchingCode(true);

    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(snatchUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch website');
      }

      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const extractStructure = (element: Element, depth = 0): string => {
        if (depth > 5) return '';
        
        const tag = element.tagName.toLowerCase();
        const classes = element.className ? ` class="${element.className}"` : '';
        const id = element.id ? ` id="${element.id}"` : '';
        
        const skipTags = ['script', 'noscript', 'style', 'meta', 'link'];
        if (skipTags.includes(tag)) return '';
        
        let result = '';
        const indent = '  '.repeat(depth);
        
        if (tag === 'img') {
          const src = element.getAttribute('src') || '';
          const alt = element.getAttribute('alt') || '';
          result = `${indent}<img src="${src}" alt="${alt}"${classes}${id}>\n`;
        } else if (tag === 'input') {
          const type = element.getAttribute('type') || 'text';
          const placeholder = element.getAttribute('placeholder') || '';
          result = `${indent}<input type="${type}" placeholder="${placeholder}"${classes}${id}>\n`;
        } else if (tag === 'a') {
          const href = element.getAttribute('href') || '#';
          const text = element.textContent?.trim().slice(0, 50) || 'Link';
          result = `${indent}<a href="${href}"${classes}${id}>${text}</a>\n`;
        } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button'].includes(tag)) {
          const text = element.textContent?.trim().slice(0, 100) || '';
          if (text) {
            result = `${indent}<${tag}${classes}${id}>${text}</${tag}>\n`;
          }
        } else {
          const children = Array.from(element.children);
          if (children.length > 0) {
            result = `${indent}<${tag}${classes}${id}>\n`;
            children.forEach(child => {
              result += extractStructure(child, depth + 1);
            });
            result += `${indent}</${tag}>\n`;
          }
        }
        
        return result;
      };
      
      const body = doc.body;
      let wireframe = '<!-- Extracted wireframe from: ' + snatchUrl + ' -->\n\n';
      wireframe += extractStructure(body);
      
      wireframe = wireframe.replace(/\n{3,}/g, '\n\n');
      
      const fileName = 'snatched-' + new Date().getTime() + '.html';
      FileSystem.createFile('', fileName);
      FileSystem.saveFile(fileName, wireframe);
      loadFiles();
      
      const newFile = FileSystem.findFile(fileName);
      if (newFile) {
        openFile(newFile);
      }
      
      setCodeSnatcherOpen(false);
      setSnatchUrl('');
      
      toast({
        title: "Code Snatched! 🎣",
        description: `Extracted wireframe saved to ${fileName}`
      });
      
    } catch (error) {
      console.error('Code snatcher error:', error);
      toast({
        title: "Snatch Failed",
        description: "Couldn't fetch website. Try a different URL or check CORS settings.",
        variant: "destructive"
      });
    } finally {
      setIsSnatchingCode(false);
    }
  };

  const handleExportToGoogleDrive = async () => {
    setIsExportingToDrive(true);

    try {
      const allFiles = FileSystem.getAllFiles();
      const flatFiles: Array<{ path: string; content: string }> = [];

      const flatten = (nodes: FileNode[], prefix = '') => {
        nodes.forEach(node => {
          if (node.type === 'file') {
            flatFiles.push({
              path: prefix + node.name,
              content: node.content || '' // Include empty files
            });
          } else if (node.type === 'folder' && node.children) {
            flatten(node.children, prefix + node.name + '/');
          }
        });
      };

      flatten(allFiles);

      if (flatFiles.length === 0) {
        toast({
          title: "No files to export",
          description: "Create some files first!",
          variant: "destructive"
        });
        return;
      }

      const projectName = 'IndyverseProject-' + Date.now();

      const response = await fetch('/api/export/google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, files: flatFiles })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.notConnected) {
          toast({
            title: "Google Drive Not Connected",
            description: "Please connect your Google Drive in Settings first",
            variant: "destructive"
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      toast({
        title: "Exported to Google Drive! ☁️",
        description: `${data.fileCount} files uploaded to "${data.folderName}"`
      });

      window.open(data.folderUrl, '_blank');

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Could not export to Google Drive",
        variant: "destructive"
      });
    } finally {
      setIsExportingToDrive(false);
    }
  };

  const handleDownloadProject = async () => {
    try {
      const zip = new JSZip();
      const allFiles = FileSystem.getAllFiles();

      // Generate glyph for this project
      const glyphGenerator = new GlyphGenerator({
        name: "IDE Project",
        dimension: "Design",
        state: 'active',
        repo: 'YOU-N-I-VERSE Studio',
        path: '/ide',
        coherence: 0.95
      });
      const glyph = glyphGenerator.generate();

      // Add glyph manifest
      zip.file('glyph-manifest.json', JSON.stringify(glyph.json, null, 2));

      // Add all files recursively
      const addFilesToZip = (nodes: FileNode[], currentPath = '') => {
        nodes.forEach(node => {
          const path = currentPath ? `${currentPath}/${node.name}` : node.name;
          if (node.type === 'file' && node.content !== undefined) {
            zip.file(path, node.content);
          } else if (node.type === 'folder' && node.children) {
            addFilesToZip(node.children, path);
          }
        });
      };

      addFilesToZip(allFiles);

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ide-project-${glyph.json.glyph_id}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast({
        title: "Download Started",
        description: `Project tagged with glyph ${glyph.json.glyph_id}`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not prepare download",
        variant: "destructive"
      });
    }
  };

  const handleSendToStore = () => {
    toast({
      title: "Coming Soon",
      description: "Send to Grove Store feature is under development"
    });
  };

  const handleImportFromGitHub = async () => {
    setIsImporting(true);
    try {
      const response = await fetch('/api/import/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: importRepoUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Import Failed",
          description: data.message || "Could not import from GitHub",
          variant: "destructive"
        });
        return;
      }

      const zipData = Uint8Array.from(atob(data.zipData), c => c.charCodeAt(0));
      const zip = await JSZip.loadAsync(zipData);
      
      let fileCount = 0;
      const repoFolder = `github-${data.owner}-${data.repoName}`;
      
      for (const [path, file] of Object.entries(zip.files)) {
        if (!file.dir) {
          const content = await file.async('string');
          const pathParts = path.split('/');
          pathParts.shift();
          
          if (pathParts.length > 0) {
            const relativePath = pathParts.join('/');
            const fullPath = `${repoFolder}/${relativePath}`;
            FileSystem.saveFile(fullPath, content);
            fileCount++;
          }
        }
      }

      setImportDialogOpen(false);
      setImportRepoUrl('');

      toast({
        title: "Imported from GitHub!",
        description: `${fileCount} files from ${data.repoName} loaded into IDE`
      });

      loadFiles();
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Could not import from GitHub",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handlePushToGitHub = async () => {
    if (!repoName.trim()) {
      toast({
        title: "Repository Name Required",
        description: "Enter a name for your GitHub repository",
        variant: "destructive"
      });
      return;
    }

    setIsPushingToGitHub(true);

    try {
      const allFiles = FileSystem.getAllFiles();
      const flatFiles: Array<{ path: string; content: string }> = [];

      const flatten = (nodes: FileNode[], prefix = '') => {
        nodes.forEach(node => {
          if (node.type === 'file') {
            flatFiles.push({
              path: prefix + node.name,
              content: node.content || '' // Include empty files
            });
          } else if (node.type === 'folder' && node.children) {
            flatten(node.children, prefix + node.name + '/');
          }
        });
      };

      flatten(allFiles);

      if (flatFiles.length === 0) {
        toast({
          title: "No files to push",
          description: "Create some files first!",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/push/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: repoName.trim(),
          files: flatFiles,
          description: 'Created from YOU–N–I–VERSE Studio'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.notConnected) {
          toast({
            title: "GitHub Not Connected",
            description: "Please connect your GitHub account in the integration setup",
            variant: "destructive"
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setGithubDialogOpen(false);
      setRepoName('');

      toast({
        title: "Pushed to GitHub! 🚀",
        description: `Repository "${data.repoName}" updated successfully`
      });

      window.open(data.url, '_blank');

    } catch (error: any) {
      console.error('GitHub push error:', error);
      toast({
        title: "Push Failed",
        description: error.message || "Could not push to GitHub",
        variant: "destructive"
      });
    } finally {
      setIsPushingToGitHub(false);
    }
  };

  const codeSnippets = {
    html: [
      { name: "HTML5 Boilerplate", code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
</body>
</html>` },
      { name: "PWA Manifest", code: `<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#9b87f5">
<link rel="apple-touch-icon" href="icon-192.png">` },
      { name: "Button", code: `<button class="btn">Click Me</button>` },
      { name: "Form", code: `<form>
  <input type="text" placeholder="Enter text">
  <button type="submit">Submit</button>
</form>` },
      { name: "Card", code: `<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here.</p>
</div>` }
    ],
    css: [
      { name: "Flexbox Center", code: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}` },
      { name: "Button Styles", code: `.btn {
  padding: 0.75rem 1.5rem;
  background: #9b87f5;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #8b77e5;
}` },
      { name: "Card Styles", code: `.card {
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}` },
      { name: "Mobile First", code: `/* Mobile styles (default) */
.container {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}` }
    ],
    javascript: [
      { name: "Event Listener", code: `document.querySelector('.btn').addEventListener('click', function() {
  console.log('Button clicked!');
});` },
      { name: "Fetch API", code: `fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));` },
      { name: "Local Storage", code: `// Save data
localStorage.setItem('key', JSON.stringify({ data: 'value' }));

// Load data
const data = JSON.parse(localStorage.getItem('key'));

// Remove data
localStorage.removeItem('key');` },
      { name: "Canvas Setup", code: `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Your drawing code here
  requestAnimationFrame(draw);
}

draw();` }
    ],
    pwa: [
      { name: "PWA Manifest.json", code: `{
  "name": "My App",
  "short_name": "App",
  "description": "My awesome app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#9b87f5",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}` },
      { name: "Service Worker", code: `// Register service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker registered:', reg))
    .catch(err => console.error('Service Worker error:', err));
}` },
      { name: "APK Export Setup", code: `// Instructions to convert your web app to APK:
// 1. Add manifest.json (use PWA Manifest snippet)
// 2. Add service worker for offline support
// 3. Use tools like:
//    - PWABuilder.com (easiest - just paste your URL)
//    - Apache Cordova
//    - Capacitor by Ionic
// 4. Test as PWA first: chrome://flags enable "Desktop PWAs"

// Add to home screen prompt:
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show your install button
  document.getElementById('installBtn').style.display = 'block';
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install outcome:', outcome);
    deferredPrompt = null;
  }
});` },
      { name: "Install Button HTML", code: `<button id="installBtn" style="display: none;">
  Install App
</button>` }
    ],
    utilities: [
      { name: "Debounce Function", code: `// Delay function execution until user stops typing
function debounce(func, delay = 300) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Usage:
const searchInput = document.querySelector('#search');
searchInput.addEventListener('input', debounce((e) => {
  console.log('Searching for:', e.target.value);
}, 300));` },
      { name: "Throttle Function", code: `// Limit function execution rate
function throttle(func, limit = 100) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage: Limit scroll events
window.addEventListener('scroll', throttle(() => {
  console.log('Scrolled!');
}, 100));` },
      { name: "Copy to Clipboard", code: `async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Copied to clipboard!');
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

// Usage:
document.querySelector('.copy-btn').addEventListener('click', () => {
  copyToClipboard('Text to copy');
});` },
      { name: "Dark Mode Toggle", code: `// Dark mode with localStorage persistence
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Load saved theme on page load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

// Usage:
document.querySelector('#theme-toggle').addEventListener('click', toggleDarkMode);` },
      { name: "UUID Generator", code: `// Generate unique IDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Usage:
const uniqueId = generateUUID();
console.log(uniqueId); // e.g., "a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p"` }
    ],
    forms: [
      { name: "Email Validation", code: `function isValidEmail(email) {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

// Usage:
const emailInput = document.querySelector('#email');
emailInput.addEventListener('blur', (e) => {
  if (!isValidEmail(e.target.value)) {
    alert('Please enter a valid email');
  }
});` },
      { name: "Password Strength", code: `function getPasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\\d/.test(password)) strength++;
  if (/[^a-zA-Z\\d]/.test(password)) strength++;
  
  const levels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return { score: strength, level: levels[strength] || 'Weak' };
}

// Usage:
const result = getPasswordStrength('MyP@ssw0rd!');
console.log(result); // { score: 5, level: 'Very Strong' }` },
      { name: "File Upload Preview", code: `function previewImage(input, previewElement) {
  const file = input.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewElement.src = e.target.result;
      previewElement.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

// Usage:
document.querySelector('#file-input').addEventListener('change', (e) => {
  const preview = document.querySelector('#preview-img');
  previewImage(e.target, preview);
});` },
      { name: "Form Data to JSON", code: `function formToJSON(formElement) {
  const formData = new FormData(formElement);
  const json = {};
  for (let [key, value] of formData.entries()) {
    json[key] = value;
  }
  return json;
}

// Usage:
document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = formToJSON(e.target);
  console.log(data);
});` }
    ],
    api: [
      { name: "Async Error Handler", code: `async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Usage:
apiRequest('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(err => alert('Failed to load data'));` },
      { name: "Retry Logic", code: `async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Usage:
fetchWithRetry('https://api.example.com/data', {}, 3)
  .then(data => console.log(data))
  .catch(err => console.error('Failed after 3 retries'));` },
      { name: "WebSocket Setup", code: `class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectInterval = 5000;
  }

  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => console.log('WebSocket connected');
    this.ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting...');
      setTimeout(() => this.connect(), this.reconnectInterval);
    };
    this.ws.onmessage = (event) => this.handleMessage(JSON.parse(event.data));
    this.ws.onerror = (error) => console.error('WebSocket error:', error);
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  handleMessage(data) {
    console.log('Received:', data);
  }
}

// Usage:
const client = new WebSocketClient('wss://example.com/socket');
client.connect();` },
      { name: "POST with JSON", code: `async function postJSON(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  return await response.json();
}

// Usage:
postJSON('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
})
.then(result => console.log('Created:', result))
.catch(error => console.error('Error:', error));` }
    ],
    ui: [
      { name: "Toast Notification", code: `function showToast(message, duration = 3000, type = 'info') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: \${type === 'error' ? '#ef4444' : '#9b87f5'};
    color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  \`;
  
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Usage:
showToast('Success!', 3000, 'success');
showToast('Error occurred', 3000, 'error');` },
      { name: "Modal Dialog", code: `function createModal(content, onClose) {
  const overlay = document.createElement('div');
  overlay.style.cssText = \`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  \`;
  
  const modal = document.createElement('div');
  modal.style.cssText = \`
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    max-width: 500px;
    width: 90%;
  \`;
  modal.innerHTML = content;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.onclick = () => {
    overlay.remove();
    if (onClose) onClose();
  };
  
  modal.appendChild(closeBtn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
}

// Usage:
createModal('<h2>Welcome!</h2><p>This is a modal.</p>');` },
      { name: "Smooth Scroll", code: `function smoothScrollTo(elementId, offset = 0) {
  const element = document.getElementById(elementId);
  if (element) {
    const targetPosition = element.offsetTop - offset;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

// Usage:
document.querySelector('.scroll-btn').addEventListener('click', () => {
  smoothScrollTo('section-2', 80);
});` },
      { name: "Lazy Load Images", code: `// Lazy load images when they enter viewport
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Usage:
// HTML: <img data-src="image.jpg" alt="Lazy loaded">
lazyLoadImages();` },
      { name: "Infinite Scroll", code: `function setupInfiniteScroll(loadMoreCallback) {
  let loading = false;
  
  window.addEventListener('scroll', () => {
    if (loading) return;
    
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 100) {
      loading = true;
      loadMoreCallback().then(() => {
        loading = false;
      });
    }
  });
}

// Usage:
setupInfiniteScroll(async () => {
  console.log('Loading more items...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Add your items here
});` }
    ],
    game: [
      { name: "Game Loop", code: `class Game {
  constructor() {
    this.running = false;
    this.lastTime = 0;
    this.deltaTime = 0;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  loop = (currentTime) => {
    if (!this.running) return;
    
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    this.update(this.deltaTime);
    this.render();
    
    requestAnimationFrame(this.loop);
  }

  update(dt) {
    // Game logic here
  }

  render() {
    // Drawing code here
  }

  stop() {
    this.running = false;
  }
}

const game = new Game();
game.start();` },
      { name: "Collision Detection", code: `function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

// Circle collision
function checkCircleCollision(circle1, circle2) {
  const dx = circle1.x - circle2.x;
  const dy = circle1.y - circle2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < circle1.radius + circle2.radius;
}

// Usage:
const player = { x: 10, y: 10, width: 32, height: 32 };
const enemy = { x: 50, y: 50, width: 32, height: 32 };
if (checkCollision(player, enemy)) {
  console.log('Hit!');
}` },
      { name: "Keyboard Input", code: `class InputHandler {
  constructor() {
    this.keys = {};
    window.addEventListener('keydown', (e) => this.keys[e.key] = true);
    window.addEventListener('keyup', (e) => this.keys[e.key] = false);
  }

  isPressed(key) {
    return !!this.keys[key];
  }

  reset() {
    this.keys = {};
  }
}

// Usage:
const input = new InputHandler();

function update() {
  if (input.isPressed('ArrowLeft')) {
    player.x -= 5;
  }
  if (input.isPressed('ArrowRight')) {
    player.x += 5;
  }
  if (input.isPressed(' ')) {
    player.jump();
  }
}` },
      { name: "Sprite Animation", code: `class SpriteAnimator {
  constructor(spriteSheet, frameWidth, frameHeight) {
    this.image = new Image();
    this.image.src = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.currentFrame = 0;
    this.frameCount = 0;
    this.frameDelay = 10;
    this.frameCounter = 0;
  }

  update() {
    this.frameCounter++;
    if (this.frameCounter >= this.frameDelay) {
      this.frameCounter = 0;
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    }
  }

  draw(ctx, x, y) {
    ctx.drawImage(
      this.image,
      this.currentFrame * this.frameWidth, 0,
      this.frameWidth, this.frameHeight,
      x, y,
      this.frameWidth, this.frameHeight
    );
  }
}

// Usage:
const sprite = new SpriteAnimator('player.png', 32, 32);
sprite.frameCount = 4;` },
      { name: "Physics Engine", code: `class PhysicsBody {
  constructor(x, y, mass = 1) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.mass = mass;
    this.gravity = 0.5;
    this.friction = 0.9;
  }

  applyForce(fx, fy) {
    this.vx += fx / this.mass;
    this.vy += fy / this.mass;
  }

  update() {
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
  }

  bounce(dampening = 0.7) {
    this.vy *= -dampening;
  }
}

// Usage:
const ball = new PhysicsBody(100, 0, 1);
ball.applyForce(10, 0); // Push right` }
    ],
    auth: [
      { name: "Login Form Handler", code: `async function handleLogin(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const { token, user } = await response.json();
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Usage:
const result = await handleLogin('user@example.com', 'password123');
if (result.success) {
  window.location.href = '/dashboard';
}` },
      { name: "JWT Token Manager", code: `class TokenManager {
  static setToken(token) {
    localStorage.setItem('jwt_token', token);
  }

  static getToken() {
    return localStorage.getItem('jwt_token');
  }

  static removeToken() {
    localStorage.removeItem('jwt_token');
  }

  static isExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  static getAuthHeader() {
    const token = this.getToken();
    return token ? { 'Authorization': \`Bearer \${token}\` } : {};
  }
}

// Usage:
const headers = {
  ...TokenManager.getAuthHeader(),
  'Content-Type': 'application/json'
};` },
      { name: "Session Manager", code: `class SessionManager {
  static login(user, token) {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('loginTime', Date.now().toString());
  }

  static logout() {
    sessionStorage.clear();
    window.location.href = '/login';
  }

  static getUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated() {
    return !!sessionStorage.getItem('token');
  }

  static getSessionDuration() {
    const loginTime = sessionStorage.getItem('loginTime');
    if (!loginTime) return 0;
    return Date.now() - parseInt(loginTime);
  }
}

// Usage:
if (!SessionManager.isAuthenticated()) {
  window.location.href = '/login';
}` },
      { name: "Protected Route", code: `function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('authToken');

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return children;
}

// Usage in routing:
// <ProtectedRoute>
//   <Dashboard />
// </ProtectedRoute>` }
    ],
    animations: [
      { name: "Fade In Animation", code: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

/* JavaScript version */
function fadeIn(element, duration = 500) {
  element.style.opacity = 0;
  element.style.display = 'block';
  
  let start = null;
  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    element.style.opacity = Math.min(progress / duration, 1);
    
    if (progress < duration) {
      requestAnimationFrame(animate);
    }
  }
  requestAnimationFrame(animate);
}` },
      { name: "Slide In Animation", code: `@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in-left {
  animation: slideInLeft 0.5s ease-out;
}

/* Alternative directions */
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slideInUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}` },
      { name: "Bounce Animation", code: `@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}

.bounce {
  animation: bounce 2s infinite;
}

/* Usage */
.notification {
  animation: bounce 1s ease;
}` },
      { name: "Scroll Reveal", code: `function setupScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  reveals.forEach(el => observer.observe(el));
}

/* CSS */
.reveal {
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.6s ease;
}

.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

// Usage:
setupScrollReveal();` },
      { name: "Loading Spinner", code: `@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(155, 135, 245, 0.2);
  border-top-color: #9b87f5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* HTML */
<div class="spinner"></div>` }
    ],
    data: [
      { name: "Sort Array", code: `// Sort by property
function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
}

// Usage:
const users = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 }
];
const sorted = sortBy(users, 'age', 'desc');` },
      { name: "Filter & Map", code: `// Filter and transform data
function filterAndMap(array, filterFn, mapFn) {
  return array
    .filter(filterFn)
    .map(mapFn);
}

// Usage:
const products = [
  { name: 'Laptop', price: 1000, inStock: true },
  { name: 'Mouse', price: 25, inStock: false },
  { name: 'Keyboard', price: 75, inStock: true }
];

const availableNames = filterAndMap(
  products,
  p => p.inStock,
  p => p.name
);
// Result: ['Laptop', 'Keyboard']` },
      { name: "Group By", code: `function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

// Usage:
const items = [
  { category: 'fruit', name: 'apple' },
  { category: 'fruit', name: 'banana' },
  { category: 'veggie', name: 'carrot' }
];

const grouped = groupBy(items, 'category');
// { fruit: [...], veggie: [...] }` },
      { name: "Pagination", code: `function paginate(array, page = 1, perPage = 10) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  
  return {
    data: array.slice(start, end),
    page,
    perPage,
    total: array.length,
    totalPages: Math.ceil(array.length / perPage),
    hasNext: end < array.length,
    hasPrev: page > 1
  };
}

// Usage:
const result = paginate(items, 2, 20);
console.log(result.data); // Items 21-40` },
      { name: "Deep Clone", code: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (obj instanceof Object) {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

// Usage:
const original = { user: { name: 'John', settings: { theme: 'dark' } } };
const copy = deepClone(original);` }
    ],
    mobile: [
      { name: "Geolocation", code: `function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}

// Usage:
const location = await getCurrentLocation();
console.log(location.latitude, location.longitude);` },
      { name: "Device Detection", code: `const DeviceDetector = {
  isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent);
  },
  
  isTablet() {
    return /iPad|Android/i.test(navigator.userAgent) && 
           window.innerWidth >= 768;
  },
  
  isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  },
  
  isAndroid() {
    return /Android/i.test(navigator.userAgent);
  },
  
  getOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }
};

// Usage:
if (DeviceDetector.isMobile()) {
  console.log('Mobile device detected');
}` },
      { name: "Touch Events", code: `class TouchHandler {
  constructor(element) {
    this.element = element;
    this.startX = 0;
    this.startY = 0;
    
    element.addEventListener('touchstart', this.handleStart.bind(this));
    element.addEventListener('touchmove', this.handleMove.bind(this));
    element.addEventListener('touchend', this.handleEnd.bind(this));
  }
  
  handleStart(e) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
  }
  
  handleMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    this.onSwipe(deltaX, deltaY);
  }
  
  handleEnd(e) {
    this.onSwipeEnd();
  }
  
  onSwipe(deltaX, deltaY) {
    // Override this
  }
  
  onSwipeEnd() {
    // Override this
  }
}

// Usage:
const handler = new TouchHandler(document.getElementById('swipeable'));` },
      { name: "Vibration API", code: `function vibrate(pattern) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
    return true;
  }
  return false;
}

// Usage examples:
vibrate(200);           // Single vibration for 200ms
vibrate([100, 50, 100]); // Pattern: vibrate-pause-vibrate
vibrate(0);             // Stop vibration

// Haptic feedback patterns
const patterns = {
  success: [50, 100, 50],
  error: [100, 50, 100, 50, 100],
  tap: 10,
  longPress: [50, 100, 150]
};

vibrate(patterns.success);` }
    ],
    notifications: [
      { name: "Push Notification", code: `async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

function showNotification(title, options = {}) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: options.body || '',
      icon: options.icon || '/icon.png',
      badge: options.badge || '/badge.png',
      vibrate: options.vibrate || [200, 100, 200],
      data: options.data || {},
      ...options
    });
  }
}

// Usage:
await requestNotificationPermission();
showNotification('New Message', {
  body: 'You have a new message!',
  icon: '/message-icon.png'
});` },
      { name: "Service Worker Notifications", code: `// In service worker (sw.js)
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon.png',
      badge: '/badge.png',
      tag: data.tag,
      data: data
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});` },
      { name: "In-App Badge", code: `function updateBadgeCount(count) {
  // Browser notification badge
  if ('setAppBadge' in navigator) {
    if (count > 0) {
      navigator.setAppBadge(count);
    } else {
      navigator.clearAppBadge();
    }
  }
  
  // UI badge
  const badge = document.getElementById('notification-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Usage:
updateBadgeCount(5); // Show "5"
updateBadgeCount(0); // Clear badge` }
    ],
    payments: [
      { name: "Stripe Checkout", code: `// Initialize Stripe
const stripe = Stripe('pk_test_YOUR_KEY');

async function createCheckoutSession(items) {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  
  const session = await response.json();
  
  // Redirect to Stripe Checkout
  const result = await stripe.redirectToCheckout({
    sessionId: session.id
  });
  
  if (result.error) {
    alert(result.error.message);
  }
}

// Usage:
document.querySelector('#checkout-btn').addEventListener('click', () => {
  createCheckoutSession([
    { price: 'price_xxx', quantity: 1 }
  ]);
});` },
      { name: "Payment Form", code: `async function handlePayment(paymentDetails) {
  try {
    const response = await fetch('/api/process-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: paymentDetails.amount,
        currency: 'usd',
        paymentMethod: paymentDetails.paymentMethod,
        description: paymentDetails.description
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return { success: true, transactionId: result.transactionId };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Payment failed:', error);
    return { success: false, error: error.message };
  }
}

// Usage:
const result = await handlePayment({
  amount: 2999, // $29.99
  paymentMethod: 'pm_card_visa',
  description: 'Premium subscription'
});` }
    ]
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* VS Code-style Menu Bar */}
      <div className="border-b bg-background/95 overflow-x-auto">
        <Menubar className="border-0 rounded-none h-9 px-2 flex-nowrap min-w-max">
          {/* File Menu */}
          <MenubarMenu>
            <MenubarTrigger className="text-sm cursor-pointer">File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => setShowNewFileInput(true)}>
                <FileText className="h-4 w-4 mr-2" />
                New File
                <MenubarShortcut>Ctrl+N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleSave} disabled={!currentFile}>
                <Save className="h-4 w-4 mr-2" />
                Save
                <MenubarShortcut>Ctrl+S</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleDownloadProject}>
                <Download className="h-4 w-4 mr-2" />
                Download Project
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* Edit Menu */}
          <MenubarMenu>
            <MenubarTrigger className="text-sm cursor-pointer">Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled>
                <RotateCcw className="h-4 w-4 mr-2" />
                Undo
                <MenubarShortcut>Ctrl+Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>
                <RotateCw className="h-4 w-4 mr-2" />
                Redo
                <MenubarShortcut>Ctrl+Y</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>
                <Scissors className="h-4 w-4 mr-2" />
                Cut
                <MenubarShortcut>Ctrl+X</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>
                <Copy className="h-4 w-4 mr-2" />
                Copy
                <MenubarShortcut>Ctrl+C</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>
                <ClipboardPaste className="h-4 w-4 mr-2" />
                Paste
                <MenubarShortcut>Ctrl+V</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>
                <Search className="h-4 w-4 mr-2" />
                Find
                <MenubarShortcut>Ctrl+F</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* View Menu */}
          <MenubarMenu>
            <MenubarTrigger className="text-sm cursor-pointer">View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => setShowFilePanel(!showFilePanel)}>
                <FolderTree className="h-4 w-4 mr-2" />
                Toggle Sidebar
              </MenubarItem>
              <MenubarItem onClick={() => setShowTerminal(!showTerminal)}>
                <TerminalIcon className="h-4 w-4 mr-2" />
                Terminal
                <MenubarShortcut>Ctrl+`</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => setShowSelfEditor(!showSelfEditor)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Self-Editor
              </MenubarItem>
              <MenubarItem onClick={() => setShowWorkspace(!showWorkspace)}>
                <FolderTree className="h-4 w-4 mr-2" />
                Workspace Organizer
              </MenubarItem>
              <MenubarItem onClick={() => setShowPreview(!showPreview)} className="lg:hidden">
                <Globe className="h-4 w-4 mr-2" />
                Toggle Preview
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>
                <Maximize className="h-4 w-4 mr-2" />
                Fullscreen
                <MenubarShortcut>F11</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* Run Menu */}
          <MenubarMenu>
            <MenubarTrigger className="text-sm cursor-pointer">Run</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleRun}>
                <Play className="h-4 w-4 mr-2" />
                Run Code
                <MenubarShortcut>F5</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => setShowPreview(!showPreview)} className="lg:hidden">
                <Globe className="h-4 w-4 mr-2" />
                Toggle Preview
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* Code Snippets Menu */}
          <MenubarMenu>
            <MenubarTrigger className="text-sm cursor-pointer">Snippets</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>HTML</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.html.map((snippet, idx) => (
                    <MenubarItem key={`html-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>CSS</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.css.map((snippet, idx) => (
                    <MenubarItem key={`css-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>JavaScript</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.javascript.map((snippet, idx) => (
                    <MenubarItem key={`js-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>PWA/APK</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.pwa.map((snippet, idx) => (
                    <MenubarItem key={`pwa-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSeparator />

              <MenubarSub>
                <MenubarSubTrigger>Utilities</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.utilities.map((snippet, idx) => (
                    <MenubarItem key={`util-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>Forms</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.forms.map((snippet, idx) => (
                    <MenubarItem key={`form-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>API Calls</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.api.map((snippet, idx) => (
                    <MenubarItem key={`api-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>UI Components</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.ui.map((snippet, idx) => (
                    <MenubarItem key={`ui-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSeparator />

              <MenubarSub>
                <MenubarSubTrigger>Game Functions</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.game.map((snippet, idx) => (
                    <MenubarItem key={`game-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>Authentication</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.auth.map((snippet, idx) => (
                    <MenubarItem key={`auth-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>Animations</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.animations.map((snippet, idx) => (
                    <MenubarItem key={`anim-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>Data Operations</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.data.map((snippet, idx) => (
                    <MenubarItem key={`data-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>Mobile Features</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.mobile.map((snippet, idx) => (
                    <MenubarItem key={`mobile-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>Notifications</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.notifications.map((snippet, idx) => (
                    <MenubarItem key={`notif-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>

              <MenubarSub>
                <MenubarSubTrigger>Payments</MenubarSubTrigger>
                <MenubarSubContent>
                  {codeSnippets.payments.map((snippet, idx) => (
                    <MenubarItem key={`payment-${idx}`} onClick={() => insertSnippet(snippet.code)}>
                      {snippet.name}
                    </MenubarItem>
                  ))}
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>

          {/* Tools & Deploy Menu */}
          <MenubarMenu>
            <MenubarTrigger className="text-sm cursor-pointer">Tools</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => setCodeSnatcherOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Code Snatcher
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => setGithubDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Push to GitHub
                  </MenubarItem>
                  <MenubarItem onClick={() => setImportDialogOpen(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Import from GitHub
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarItem onClick={handleExportToGoogleDrive} disabled={isExportingToDrive}>
                <Cloud className="h-4 w-4 mr-2" />
                {isExportingToDrive ? 'Exporting...' : 'Export to Google Drive'}
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Launch Apps
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => setLocation('/agents')}>
                    <Bot className="h-4 w-4 mr-2" />
                    AI Agent Creator
                  </MenubarItem>
                  <MenubarItem onClick={() => setLocation('/gan-trainer')}>
                    <Brain className="h-4 w-4 mr-2" />
                    GAN Trainer
                  </MenubarItem>
                  <MenubarItem onClick={() => setLocation('/game-creator')}>
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Game Templates
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => setLocation('/mod-manager')}>
                    <Rocket className="h-4 w-4 mr-2" />
                    Mod Manager & Deploy
                  </MenubarItem>
                  <MenubarItem onClick={() => setLocation('/player')}>
                    <Play className="h-4 w-4 mr-2" />
                    ZIP Player
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => setLocation('/grove-store')}>
                    <Store className="h-4 w-4 mr-2" />
                    Grove Store
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem onClick={handleSendToStore}>
                <Store className="h-4 w-4 mr-2" />
                Send to Grove Store
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* Help Menu */}
          <MenubarMenu>
            <MenubarTrigger className="text-sm cursor-pointer">Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled>
                <FileText className="h-4 w-4 mr-2" />
                Documentation
              </MenubarItem>
              <MenubarItem disabled>
                Keyboard Shortcuts
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>
                About Indyverse
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <div className="border-b p-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            data-testid="button-toggle-files"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setShowFilePanel(!showFilePanel)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Code2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold hidden sm:block">Code Editor</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            data-testid="button-toggle-terminal"
            variant="outline"
            size="sm"
            onClick={() => setShowTerminal(!showTerminal)}
            className={showTerminal ? "bg-green-500/10 border-green-500/50" : ""}
            title="Terminal"
          >
            <TerminalIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Terminal</span>
          </Button>
          <Button
            data-testid="button-toggle-self-editor"
            variant="outline"
            size="sm"
            onClick={() => setShowSelfEditor(!showSelfEditor)}
            className={showSelfEditor ? "bg-purple-500/10 border-purple-500/50" : ""}
            title="Self-Editor & Code Injection"
          >
            <Sparkles className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Self-Editor</span>
          </Button>
          <Button
            data-testid="button-toggle-workspace"
            variant="outline"
            size="sm"
            onClick={() => setShowWorkspace(!showWorkspace)}
            className={showWorkspace ? "bg-blue-500/10 border-blue-500/50" : ""}
            title="Workspace Organizer"
          >
            <FolderTree className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Workspace</span>
          </Button>
          <Button
            data-testid="button-toggle-preview"
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Globe className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
        </div>
      </div>

      <ResizablePanelGroup 
        direction="vertical" 
        className={`flex-1 overflow-hidden ${showTerminal ? 'flex-1' : 'flex-1'}`}
      >
        <ResizablePanel defaultSize={70} minSize={30}>
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {showFilePanel && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setShowFilePanel(false)}
              />
            )}
            
            <ResizablePanel 
              defaultSize={20} 
              minSize={15} 
              maxSize={40}
              className={`
                fixed lg:relative lg:block
                h-full bg-background
                z-50 lg:z-auto
                transition-transform duration-300
                ${showFilePanel ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}
            >
              <aside className="h-full border-r p-4 space-y-2 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm">Files</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      data-testid="button-new-file"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowNewFileInput(!showNewFileInput)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      data-testid="button-close-files"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 lg:hidden"
                      onClick={() => setShowFilePanel(false)}
                      title="Close File Panel"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {showNewFileInput && (
                  <div className="flex gap-1 mb-2">
                    <Input
                      data-testid="input-new-filename"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="filename.js"
                      className="h-7 text-xs"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
                    />
                    <Button
                      data-testid="button-create-file"
                      size="sm"
                      className="h-7"
                      onClick={handleCreateFile}
                    >
                      Add
                    </Button>
                  </div>
                )}
                
                {files.map((file, idx) => (
                  <FileTreeNode
                    key={idx}
                    file={file}
                    currentPath={currentFile?.path}
                    onOpen={openFile}
                    onDelete={handleDeleteFile}
                  />
                ))}
              </aside>
            </ResizablePanel>

            <ResizableHandle withHandle className="hidden lg:flex" />

            <ResizablePanel defaultSize={50} minSize={30}>
              <div className={`h-full flex flex-col ${showPreview && 'hidden sm:flex'}`}>
                <div className="border-b p-2 flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-3 w-3" />
                    <span className="truncate">{currentFile?.name || 'No file selected'}</span>
                  </div>
                  {currentFile && (
                    <Button
                      data-testid="button-close-editor"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setCurrentFile(null);
                        setCode('');
                      }}
                      title="Close File"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  data-testid="textarea-code-editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 font-mono text-sm resize-none border-0 focus-visible:ring-0 rounded-none"
                  placeholder="Start coding..."
                  disabled={!currentFile}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="hidden lg:flex" />

            <ResizablePanel 
              defaultSize={30} 
              minSize={20} 
              maxSize={50}
              className={`${showPreview ? 'block sm:block' : 'hidden lg:block'}`}
            >
              <aside className="h-full border-l flex flex-col">
                <div className="border-b p-2 flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="font-medium">Preview</span>
                  </div>
                  <Button
                    data-testid="button-close-preview"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowPreview(false)}
                    title="Close Preview"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 bg-white overflow-auto">
                  {previewContent ? (
                    <iframe
                      data-testid="iframe-preview"
                      srcDoc={previewContent}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      title="Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full p-8 text-center bg-muted/20">
                      <div className="text-muted-foreground">
                        <Globe className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-sm">Preview will appear here</p>
                        <p className="text-xs mt-2">Click "Run" to execute code</p>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        {(showTerminal || showSelfEditor || showWorkspace) && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={15} maxSize={60}>
              {showTerminal && (
                <div className="h-full border-t flex-shrink-0">
                  <Terminal onClose={() => setShowTerminal(false)} />
                </div>
              )}
              {showSelfEditor && (
                <div className="h-full border-t flex-shrink-0 bg-background flex flex-col">
                  <div className="border-b p-2 flex items-center justify-between gap-2 bg-background">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Self-Editor & Code Injection</span>
                    </div>
                    <Button
                      data-testid="button-close-self-editor"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowSelfEditor(false)}
                      title="Close Self-Editor"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <SelfEditor onFileModified={handleFileModified} />
                  </div>
                </div>
              )}
              {showWorkspace && (
                <div className="h-full border-t flex-shrink-0 bg-background flex flex-col">
                  <div className="border-b p-2 flex items-center justify-between gap-2 bg-background">
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">Workspace Organizer</span>
                    </div>
                    <Button
                      data-testid="button-close-workspace"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowWorkspace(false)}
                      title="Close Workspace Organizer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <WorkspaceOrganizer />
                  </div>
                </div>
              )}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Bottom Toolbar - Quick Actions */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-card/95 backdrop-blur border rounded-full px-4 py-2 shadow-lg">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-quick-snippets"
              title="Code Snippets"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 mb-2">
            <DropdownMenuLabel>Quick Snippets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>HTML</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {codeSnippets.html.slice(0, 3).map((snippet, idx) => (
                  <DropdownMenuItem key={idx} onClick={() => insertSnippet(snippet.code)}>
                    {snippet.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>CSS</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {codeSnippets.css.slice(0, 3).map((snippet, idx) => (
                  <DropdownMenuItem key={idx} onClick={() => insertSnippet(snippet.code)}>
                    {snippet.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>JavaScript</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {codeSnippets.javascript.slice(0, 3).map((snippet, idx) => (
                  <DropdownMenuItem key={idx} onClick={() => insertSnippet(snippet.code)}>
                    {snippet.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCodeSnatcherOpen(true)}
          data-testid="button-quick-snatch"
          title="Code Snatcher"
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setGithubDialogOpen(true)}
          data-testid="button-quick-github"
          title="Push to GitHub"
        >
          <Github className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportToGoogleDrive}
          disabled={isExportingToDrive}
          data-testid="button-quick-drive"
          title="Export to Drive"
        >
          <Cloud className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function FileTreeNode({
  file,
  currentPath,
  onOpen,
  onDelete,
  indent = 0
}: {
  file: FileNode;
  currentPath?: string;
  onOpen: (file: FileNode) => void;
  onDelete: (file: FileNode) => void;
  indent?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isActive = currentPath === file.path;

  return (
    <div>
      <div
        className={`text-sm py-1 px-2 rounded hover:bg-accent cursor-pointer flex items-center justify-between group ${
          isActive ? 'bg-primary/10 border border-primary/30' : ''
        }`}
        style={{ marginLeft: `${indent * 12}px` }}
      >
        <div
          className="flex items-center gap-1 flex-1"
          onClick={() => {
            if (file.type === 'folder') {
              setIsOpen(!isOpen);
            } else {
              onOpen(file);
            }
          }}
        >
          <span className="font-mono text-xs">
            {file.type === 'folder' ? (isOpen ? '📂' : '📁') : '📄'} {file.name}
          </span>
        </div>
        {file.type === 'file' && (
          <Button
            data-testid={`button-delete-file-${file.name}`}
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-5 sm:w-5 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file);
            }}
          >
            <Trash2 className="h-4 w-4 sm:h-3 sm:w-3 text-destructive" />
          </Button>
        )}
      </div>
      {file.type === 'folder' && isOpen && file.children && (
        <div>
          {file.children.map((child, idx) => (
            <FileTreeNode
              key={idx}
              file={child}
              currentPath={currentPath}
              onOpen={onOpen}
              onDelete={onDelete}
              indent={indent + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
