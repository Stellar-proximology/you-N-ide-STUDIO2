import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalNav } from "@/components/GlobalNav";
import { Dashboard } from "@/components/Dashboard";
import { DeveloperPanel } from "@/components/DeveloperPanel";
import { GameCreator } from "@/components/GameCreator";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AgentPanel } from "@/components/AgentPanel";
import { PlayerPanel } from "@/components/PlayerPanel";
import { GroveStore } from "@/components/GroveStore";
import { GANTrainer } from "@/components/GANTrainer";
import { ModManager } from "@/components/ModManager";
import { ConsciousnessCalibrationTank } from "@/components/ConsciousnessCalibrationTank";
import ConsciousnessCalibrator from "@/components/ConsciousnessCalibrator";
import { SemanticUniverseCreator } from "@/components/SemanticUniverseCreator";
import { PersistentAssistant } from "@/components/PersistentAssistant";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ModeIndicator } from "@/components/ModeIndicator";
import ZipManager from "@/pages/ZipManager";
import PresentationPlanner from "@/pages/PresentationPlanner";
import ContinuityGlyph from "@/pages/ContinuityGlyph";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <GlobalNav />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/grove-store" component={GroveStore} />
        <Route path="/ide" component={DeveloperPanel} />
        <Route path="/game-creator" component={GameCreator} />
        <Route path="/gan-trainer" component={GANTrainer} />
        <Route path="/mod-manager" component={ModManager} />
        <Route path="/calibration-tank" component={ConsciousnessCalibrationTank} />
        <Route path="/consciousness-calibrator" component={ConsciousnessCalibrator} />
        <Route path="/universe-creator" component={SemanticUniverseCreator} />
        <Route path="/settings" component={SettingsPanel} />
        <Route path="/zip-manager" component={ZipManager} />
        <Route path="/player" component={PlayerPanel} />
        <Route path="/agents" component={AgentPanel} />
        <Route path="/presentation-planner" component={PresentationPlanner} />
        <Route path="/continuity-glyph" component={ContinuityGlyph} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <PersistentAssistant />
          <ModeIndicator />
          <InstallPrompt />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
