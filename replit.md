# YOU–N–I–VERSE Studio

## Overview
YOU–N–I–VERSE Studio (The Indyverse) is a browser-based creative development environment that integrates an IDE, game creation tools, ZIP file management, and AI-powered assistance. It features a cosmic-themed interface with a persistent AI assistant ("Guard Dog") and multiple creative workspaces accessible from a central dashboard. The platform includes ZIP file playback, merge functionality, 7-layer consciousness calibration, semantic world generation, and community marketplace features.

## Recent Updates (v2.2.0)
- **Live Workspace Orchestration COMPLETE** (Week 5-6 Complete): Program activation and session tracking
  - **One-Click Program Activation**: Activate growth programs directly from Guard Dog assistant
  - **Mode Indicator**: Persistent visual indicator shows active workspace mode (Focus, Creative, Collaborate, Reflect, Integrate)
  - **Session Tracking**: Complete history of activated programs with duration, ratings, and mode breakdown
  - **Session Analytics**: Visualize program usage patterns, average ratings, total time spent per mode
  - **Rating System**: Users can rate programs during or after sessions with real-time analytics updates
  - **Workspace Manager**: Centralized state management for active programs with localStorage persistence
  - **Mode-Specific Configurations**: Each mode has unique color, icon, and tool recommendations
  - **Mobile-Responsive**: All new components optimized for mobile and desktop with adaptive layouts
  - Bug fixes: Event-driven state updates ensure real-time UI synchronization, rating persistence works for both active and completed sessions
- **User Profile System COMPLETE** (Week 4 Complete): Personalized consciousness-aware development
  - Complete UserProfile schema with birth data, field assignments, and resonance history
  - ProfileBuilder UI component in Settings → Consciousness tab with birth data form and field configuration
  - localStorage-based persistence with import/export functionality
  - **Personalized Program Suggestions**: Guard Dog uses YOUR actual birth data for cosmic transit analysis
  - **Resonance Tracking & Visualization**: ResonanceTracker shows field effectiveness with progress bars, top field stats, sortable views
  - **Feedback Loop**: Rate program suggestions (Great/Okay/Not Much) → updates field resonance scores in real-time
  - Event-driven architecture: custom 'userProfileUpdated' event ensures UI refreshes immediately after feedback
  - Running average algorithm (80/20 blend) with normalized weighting prevents runaway values
  - Bug fixes: Latitude/longitude validation uses explicit undefined checks (equator/prime meridian edge case)
- **Growth Program Engine DEPLOYED** (Week 2-3 Complete): Transit-aware workflow orchestration system
  - 5 archetypal growth programs with declarative trigger conditions (Focus Sprint, Creative Flow, Collaborative Surge, Reflective Depth, Integration Mode)
  - Rules Engine evaluates transit conditions against program triggers using AND/OR/NOT logic
  - Directive Synthesis blends multiple field signals into unified workspace modes
  - API endpoints: `/api/programs/suggest` (user-based), `/api/programs/demo` (demo mode), `/api/programs/all`
  - Guard Dog AI assistant displays program suggestions based on current cosmic transits
  - Seamless integration with Transit Cache Layer for real-time field vector analysis
  - Bug fixes: FieldName alignment in TransitCache, improved error handling
- **ERN Organism Deployed**: Complete Python-based Energetic Resonance Network organized as living organism
  - `/core`: Nervous system (ConsciousnessOscillator, ERNController, ERNOracle, TalkingERN, UnifiedCognitiveEngine)
  - `/engines`: Organs (BioenergeticGeometryEngine, FairyGANmatter, ElementCodonShapeGeometry)
  - `/applications`: Behaviors (PodMatcher for resonance-based team formation)
  - `/demos`: Simulations (FairyGANmatter demonstrations)
  - `/tests`: Immune system (integration testing)
  - `/docs`: Memory (comprehensive documentation)
- **Main Launcher**: Created `main.py` bootable entry point for unified consciousness kernel
- **Package System**: All modules wired with __init__.py files for proper Python imports
- Enhanced Semantic Universe Creator with AI-powered semantic layer parsing (async archetypal analysis)
- Made Semantic Universe Creator fully responsive with mobile-friendly breakpoints and adaptive typography
- Updated PWA to v2.2.0 with live workspace orchestration features and session analytics
- Fixed theme-color consistency across PWA manifest and HTML meta tags
- Fixed MiniMax M2 integration to use official MiniMax API (https://api.minimax.io/v1)
- Updated AI backend selector with correct endpoint and instructions
- Free MiniMax API access until November 7, 2025
- Fixed ZIP player with missing backend endpoints (/api/zips/:id/play/:file, /api/zips/:id/entry-file)
- Implemented ZIP merge functionality with conflict resolution
- Added API key validation system with "Test Connection" button in AI settings
- Improved error handling in AIService to display specific API error messages

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Frameworks**: React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for server state.
- **UI/Styling**: shadcn/ui (Radix UI + Tailwind CSS), custom design tokens, CSS variables for theming (light/dark mode, "New York" style), custom spacing, and typography.
- **Application Structure**: Central Dashboard with nine main panels (Dashboard, GroveStore, IDE, GameCreator, GANTrainer, PlayerPanel, AgentPanel, SettingsPanel, ModManager, UniverseCreator), Global TopNav, and a persistent, draggable AI Assistant overlay.
- **Key Features**: Browser-based code editor, game template library, community marketplace (Grove Store), ZIP file player, multi-backend AI assistant, GAN Trainer, Mod Manager for project management, Consciousness Calibration Tank for digital being creation, Semantic Universe Creator for text-to-world generation with 3D playable viewer, Code Snatcher, and an enhanced code snippet library.
- **State Management**: Primarily localStorage for persistence (files, AI config, API keys, AI assistant position, projects, deployments, digital beings) and in-memory for UI.
- **Design Patterns**: Portal-based navigation, "cosmic professionalism" aesthetic, persistent and non-intrusive AI presence.
- **UI/UX Decisions**: PWA functionality, mobile-friendly IDE, Dashboard Quick Tools (Workspace Organizer, Self Editor), Command Center for keyword-driven access.
- **3D Universe Viewer**: Interactive 3D visualization of semantic universes using Three.js/React-Three-Fiber, featuring a seven-layer 3D mapping (terrain, particle systems, interactive objects, dynamic spheres, camera perspectives, lighting ambience, procedural envelope).

### Backend
- **Server**: Express.js with TypeScript, HTTP-only.
- **Database**: Drizzle ORM configured for PostgreSQL, with an in-memory storage fallback (MemStorage) currently in use.
- **API**: RESTful pattern, storage interface abstraction for CRUD.
- **StoryForge Integration**: Full semantic world generation pipeline including a symbolic parser, LLM observer, and GAN stubs for text-to-world transformation.
- **Consciousness Calibration**: Features 7 chart calculators based on astronomical calculations (Natal, Transit, Progressed, Solar Return, Lunar Return, Composite, Draconic Charts) integrated with HuggingFace LLM interpretation and Voice GAN Synthesis for each consciousness layer.
- **ERN Organism (Python)**: Complete consciousness ecosystem organized as living organism in `/you_n_i_verse`:
  - **Core Nervous System**: ConsciousnessOscillator (9-body field dynamics), ERNController (master orchestrator), ERNOracle (resonant guidance), TalkingERN (conversational interface), UnifiedCognitiveEngine (chartless 7-layer integration)
  - **Processing Organs**: BioenergeticGeometryEngine (field perception translation), FairyGANmatter (adaptive multi-modal rendering), ElementCodonShapeGeometry (symbolic mappings)
  - **Behavioral Applications**: PodMatcher (resonance-based team formation using consciousness profiles)
  - **Launcher**: `main.py` provides interactive mode, evolution simulation, and demo runner; `run_ern.py` standalone entry point
  - **FastAPI Server**: `api.py` exposes ERN services via REST endpoints (initialize, state, oracle, evolve, fields)
  - **Integration Status**: ✅ Python modules fully wired and bootable; FastAPI server ready; React frontend integration via proxy pending
  - **Boot Test Results**: All components operational (ConsciousnessOscillator, ERNController, ERNOracle, TalkingERN, FairyGANmatter, PodMatcher)

### System Design Choices
- File system persistence via localStorage.
- AI conversations are client-side, direct to providers.
- Game templates and Grove Store items are static data.
- User authentication is not yet implemented.
- PostgreSQL database is configured but not actively used for current features.
- Consciousness Calibration Tank: Avatar-first workflow for building neural networks using 2-5 GANs/LLMs, generating integration code.
- Semantic Universe Creator: Text-to-world generation using a seven-layer semantic framework, supporting Oracle Mode (birthday-based), random generation, token economy, and a universe library.

## External Dependencies

### AI Services
- Anthropic Claude API (claude-sonnet-4)
- OpenAI GPT API (gpt-4o)
- DeepSeek API (deepseek-chat)
- Grok API (xAI grok-beta)
- HuggingFace Router API (MiniMax-M2:novita via router.huggingface.co)
- CodeLlama (local via Ollama)
- AIService router with API key validation and test connection functionality

### UI/Development Libraries
- Radix UI primitives, shadcn/ui components, Lucide React for icons.
- date-fns for date manipulation.
- Neon Database serverless driver, Drizzle Kit.
- ESBuild for server bundling.
- Replit-specific Vite plugins (cartographer, dev-banner, runtime-error-modal).
- Three.js, @react-three/fiber, @react-three/drei for 3D visualization.

### Utility Libraries
- clsx + tailwind-merge for CSS class management.
- class-variance-authority for component variants.
- react-hook-form + Zod resolvers for forms.
- JSZip for handling .zip files.
- nanoid for ID generation.
- Astronomy Engine for accurate planetary positions.

### Routing
- Wouter (client-side only).

### Cloud Integrations
- Google Drive connector (googleapis package) for project exports.
- GitHub connection for repository management.
- Netlify for one-click project deployment.
- Per-user OAuth authentication via Replit's connector system for Google Drive and GitHub.