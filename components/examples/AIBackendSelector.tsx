import { AIBackendSelector } from '../AIBackendSelector';

export default function AIBackendSelectorExample() {
  return (
    <div className="min-h-screen bg-background p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">AI Backend Selector Demo</h2>
      <p className="text-muted-foreground mb-8">
        Choose your AI model and configure API keys.
      </p>
      <AIBackendSelector />
    </div>
  );
}
