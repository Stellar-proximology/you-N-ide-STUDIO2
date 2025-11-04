import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const hasSeenPrompt = localStorage.getItem("pwa-prompt-dismissed");
      if (!hasSeenPrompt) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("[PWA] App is running in standalone mode");
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`[PWA] User ${outcome} the install prompt`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <Card className="fixed bottom-24 right-6 z-[50000] p-4 w-80 max-w-[90vw] shadow-lg border-purple-500/30 bg-card/95 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Install YOU–N–I–VERSE</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Install this app on your device for a better experience. Works offline and launches like a native app!
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInstall}
              className="flex-1"
              data-testid="button-install-pwa"
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              data-testid="button-dismiss-install"
            >
              Not Now
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-6 w-6"
          data-testid="button-close-install-prompt"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}
