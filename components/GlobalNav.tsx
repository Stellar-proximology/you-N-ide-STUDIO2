import { Link, useLocation } from "wouter";
import { Home, Code2, Store, FolderTree, Play, Bot, Settings, Palette, Gamepad2, Layers, Brain, Network, Rocket, Sparkles, Presentation, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/grove-store", icon: Store, label: "Store" },
  { path: "/ide", icon: Code2, label: "IDE" },
  { path: "/zip-manager", icon: FolderTree, label: "ZIP Studio" },
  { path: "/game-creator", icon: Gamepad2, label: "Games" },
  { path: "/gan-trainer", icon: Palette, label: "GAN" },
  { path: "/presentation-planner", icon: Presentation, label: "Planner" },
  { path: "/continuity-glyph", icon: QrCode, label: "Glyphs" },
  { path: "/calibration-tank", icon: Brain, label: "Cal Tank" },
  { path: "/consciousness-calibrator", icon: Sparkles, label: "Charts" },
  { path: "/universe-creator", icon: Layers, label: "Universes" },
  { path: "/player", icon: Play, label: "Player" },
  { path: "/agents", icon: Bot, label: "Agents" },
  { path: "/mod-manager", icon: Rocket, label: "Mods" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function GlobalNav() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex items-center gap-2 mr-2">
          <Layers className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm hidden sm:inline">YOU-N-I-VERSE</span>
        </div>
        
        <div className="flex items-center gap-1 flex-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 whitespace-nowrap"
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-testid="button-toggle-theme"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </nav>
  );
}
