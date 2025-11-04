import { PersistentAssistant } from '../PersistentAssistant';

export default function PersistentAssistantExample() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h2 className="text-2xl font-bold mb-4">Persistent AI Assistant Demo</h2>
      <p className="text-muted-foreground mb-4">
        Click the lavender button in the bottom-right corner to open the AI Guard.
      </p>
      <PersistentAssistant />
    </div>
  );
}
