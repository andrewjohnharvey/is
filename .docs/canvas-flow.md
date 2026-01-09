# Canvas Flow Prototype Guide

## Overview

The Canvas Flow prototype is an AI-powered benefits presentation builder designed for employee benefits consultants. It automates the creation of professional renewal presentations by analyzing uploaded documents, understanding context, and generating customized slide decks.

**Location:** `app/canvas-flow/`

**Purpose:** Demonstrate the end-to-end workflow of creating a benefits presentation using AI assistance, from document upload to final canvas editing.

## User Journey

The prototype follows a linear 6-phase flow:

```
1. Dashboard
   └─ Select canvas type

2. Wizard - Step 1: Upload Documents
   └─ Collect source files

3. Wizard - Step 2: Set Context
   └─ Define audience, priorities, and additional context

4. Wizard - Step 3: Review Plan
   ├─ Plan Generation (AI analyzes documents + context → creates initial plan)
   └─ Chat Refinement (user adjusts plan via conversational AI)

5. Processing Screen (Canvas Generation)
   ├─ Phase 1: Reading your documents
   ├─ Phase 2: Understanding plan designs
   ├─ Phase 3: Analyzing claims trends
   ├─ Phase 4: Calculating cost impacts
   ├─ Phase 5: Building presentation
   └─ Phase 6: Running compliance checks

6. Canvas Editor
   └─ Final slide-by-slide editing with AI assistance
```

---

## Screen Breakdown

### 1. Dashboard (`dashboard.tsx`)

**Purpose:** Entry point showing existing canvases and allowing users to create new ones.

**Key Features:**
- Display list of mock canvases with status badges (published, draft, processing, failed)
- "New Canvas" dropdown with 4 canvas types:
  - Renewal (full renewal analysis)
  - Pre-Renewal (early-stage assessment)
  - Benchmarking (market comparison)
  - Cost Analysis (claims trends deep dive)
- Search functionality (non-functional in prototype)
- Canvas cards showing metadata: title, type, effective date, doc count, last updated

**User Actions:**
- Click "New Canvas" → select canvas type → starts wizard
- View existing canvas details
- "Back to Client" button (non-functional)

---

### 2. Wizard - Step 1: Upload Documents (`step-upload-documents.tsx`)

**Purpose:** Collect source documents for analysis.

**Key Features:**
- Drag-and-drop file upload zone
- File type detection and categorization
- "Use Mock Documents" button for quick testing (adds 3 pre-configured PDFs)
- Document list with remove functionality
- Each document shows:
  - File name and size
  - Detected document type (e.g., "Renewal Proposal", "Unknown Document")
  - Relevant sections tags (e.g., "Claims Analysis Full", "Plan Design Full")

**Validation:**
- Requires at least 1 document to continue

**Mock Data:**
- `MOCK_UPLOADED_DOCUMENTS` contains 3 sample PDFs:
  - Final Premio Salaried Guide.pdf
  - Final Premio Hourly Guide.pdf
  - Stop Loss and Leveraged Trend 1.pdf

---

### 3. Wizard - Step 2: Set Context (`step-set-context.tsx`)

**Purpose:** Gather presentation context and user preferences.

**Required Fields:**
1. **Primary Audience** (single select):
   - C-Suite Executives
   - HR Leadership
   - Finance Team
   - Benefits Committee

2. **Top Priorities** (multi-select, max 3):
   - Cost Management
   - Coverage Quality
   - Employee Experience
   - Talent Competitiveness
   - Cost Predictability
   - Data Transparency

**Optional Fields:**
- Expected Increase % (number input)
- Budget Comparison (dropdown: significantly exceeds, slightly exceeds, on target, etc.)
- Market Benchmarks:
  - National Average %
  - Regional Average %
  - Industry Average %
- Strategy Ideas (textarea)
- Additional Context (textarea)
- Presentation Depth (slider: Comprehensive ↔ Focused)

**Metadata:**
- Client Name (pre-filled, read-only)
- Renewal Period (editable via dialog)

**Validation:**
- Must select at least 1 audience
- Must select at least 1 priority

---

### 4. Wizard - Step 3: Review Plan (`step-review-plan.tsx`)

**Purpose:** AI-generated presentation plan with conversational refinement.

**Layout:** Two-column design
- **Left Column:** Plan display with section cards
- **Right Column:** Chat interface for refinements

**Behavior:**
1. **Auto-generation:** Plan generates automatically on mount (1.5-2.5 second delay)
2. **Initial Plan:** Shows `MOCK_INITIAL_PLAN` with 5 sections:
   - Executive Summary
   - Cost Analysis
   - Plan Design Comparison
   - Claims Trends
   - Recommendations

**Plan Display Features:**
- Canvas title and purpose
- Expandable section cards showing:
  - Section number, title, and confidence score (%)
  - Purpose description
  - Suggested visualizations (badges)
  - Key narrative points (expandable)
  - Insights/warnings/recommendations (expandable callouts)
  - Remove button per section
- "Additional Ideas" card with suggested sections
- "Regenerate Plan" button (re-runs AI generation)

**Chat Interface:**
The AI assistant responds to natural language requests:
- **Add sections:** "add a section about benchmarking" → creates new section
- **Remove sections:** "remove the claims trends section" → removes matched section
- **Predefined responses:**
  - "benchmark" → adds Benchmarking Analysis section
  - "employee impact" → adds Employee Impact Analysis section
- Uses keyword matching (`findSectionByKeywords`, `extractTopicFromMessage`)
- Shows typing indicator while AI responds (800-1500ms delay)

**Validation:**
- Must have at least 1 section to continue

---

### 5. Processing Screen (`processing-screen.tsx`)

**Purpose:** Animated loading state while "building" the presentation.

**Behavior:**
- Progresses through 6 phases sequentially:
  1. Reading your documents
  2. Understanding plan designs
  3. Analyzing claims trends
  4. Calculating cost impacts
  5. Building presentation
  6. Running compliance checks
- Each phase shows current step label + tip text
- Progress bar fills from 0-100% (updates every 150ms, +2% each tick)
- Auto-transitions to Canvas Editor when complete (500ms delay after 100%)

**Duration:** ~7.5 seconds total

---

### 6. Canvas Editor (`canvas-editor.tsx`)

**Purpose:** Final slide-by-slide editor with AI assistance.

**Layout:** Three-column design
- **Left Column (48px):** Slide thumbnails
  - Shows 8 mock slides (Cover, Executive Summary, Cost Overview, etc.)
  - Click to select slide
  - "Add Slide" button at bottom
- **Center Column:** Main editor
  - Large slide preview (16:9 aspect ratio)
  - Renders actual slide content with mock data
  - AI prompt input at bottom for slide-specific edits
- **Right Column (64px):** Insights panel
  - **Alerts:** ACA affordability warnings, large claimant notices
  - **Sources:** List of source documents used

**Slide Types:**
1. **Cover** - Title slide with client name, effective date
2. **Summary** - Executive summary with 3 metric cards
3. **Cost** - Bar chart showing year-over-year cost trends
4. **Analysis** - Medical/Dental/Vision plan breakdowns
5. **Trends** - Claims trends line chart
6. **Benchmark** - Market comparison with bars
7. **Recommendations** - Priority action items

**Header Actions:**
- Exit button (returns to Dashboard)
- Export dropdown (non-functional)
- Publish button (non-functional)

**AI Prompt Input:**
- Accepts natural language requests for slide edits
- Examples provided: "Add a comparison chart", "Simplify the language", "Include stop-loss terms"
- Currently non-functional (prototype UI only)

---

## Technical Architecture

### State Management (`prototype-state.ts`)

**Primary Hook:** `usePrototypeState()`

**State Structure:**
```typescript
{
  screen: "dashboard" | "wizard" | "processing" | "editor"
  wizardStep: "upload-documents" | "set-context" | "review-plan"
  canvasType: CanvasType | null
  documents: UploadedDocument[]
  context: ContextState
  processingProgress: number
  processingPhaseIndex: number
  plan: CanvasPlan | null
  chatMessages: ChatMessage[]
  isPlanGenerating: boolean
  isAiResponding: boolean
}
```

**Key Methods:**
- `startWizard(canvasType)` - Initialize wizard with canvas type
- `goToNextStep()` / `goToPreviousStep()` - Navigate wizard
- `addDocuments()` / `removeDocument()` - Manage uploads
- `updateContext()` / `togglePriority()` - Update context fields
- `generatePlan()` - Trigger plan generation
- `addChatMessage()` - Send chat message with AI response simulation
- `updatePlanSection()` / `removePlanSection()` / `addPlanSection()` - Edit plan
- `startProcessing()` - Transition to processing screen
- `showEditor()` - Transition to canvas editor
- `reset()` - Return to dashboard with fresh state

### Data Structures

**UploadedDocument:**
```typescript
{
  id: string
  name: string
  type: string // MIME type
  size: number
  detectedType: string // "Renewal Proposal", "Unknown Document", etc.
  relevantSections: string[] // Which parts of canvas this doc is relevant to
}
```

**ContextState:**
```typescript
{
  clientName: string
  renewalPeriod: string
  expectedIncreasePercent: number | null
  budgetComparison: BudgetComparisonType | null
  nationalAveragePercent: number | null
  regionalAveragePercent: number | null
  industryAveragePercent: number | null
  audience: AudienceType | null
  priorities: PriorityType[]
  presentationDepth: number // 0-100 slider
  strategyIdeas: string
  additionalContext: string
}
```

**CanvasPlan:**
```typescript
{
  canvasTitle: string
  canvasPurpose: string
  sections: PlanSection[]
  additionalIdeas: { title: string; description: string }[]
}
```

**PlanSection:**
```typescript
{
  id: string
  title: string
  purpose: string
  confidence: number // 0-100
  suggestedVisualizations: string[]
  narrativePoints: string[]
  callouts: PlanCallout[] // insights, warnings, recommendations
}
```

### Mock Data (`mock-data.ts`)

All data is currently mocked:
- `MOCK_CLIENT` - Acme Corporation (250 employees, Technology, San Francisco)
- `MOCK_UPLOADED_DOCUMENTS` - 3 sample PDF documents
- `MOCK_CANVASES` - 3 existing canvases for dashboard
- `MOCK_INITIAL_PLAN` - 5-section default plan
- `MOCK_SLIDES` - 8 slides for canvas editor
- `MOCK_ALERTS` - 2 compliance alerts
- `MOCK_SOURCES` - 4 source documents
- `PROCESSING_PHASES` - 6 processing steps

### Component Organization

```
app/canvas-flow/
├── page.tsx              # Root component with screen router
├── layout.tsx            # Full-screen overlay layout
└── _components/
    ├── dashboard.tsx
    ├── prototype-wizard.tsx        # Wizard container
    ├── step-upload-documents.tsx
    ├── step-set-context.tsx
    ├── step-review-plan.tsx
    ├── processing-screen.tsx
    ├── canvas-editor.tsx
    ├── step-indicator.tsx          # Progress stepper UI
    ├── prototype-state.ts          # State management hook
    └── mock-data.ts                # All mock data + types
```

---

## What's Mock vs Real

### Currently Mock (No Backend):
- All document uploads (no file processing)
- AI plan generation (deterministic, no LLM)
- AI chat responses (pattern matching, no LLM)
- Document type detection
- Slide content generation
- Canvas editor AI prompts
- Export/Publish functionality
- Search functionality
- Dashboard canvas actions (View, Edit, Delete)

### Real Implementations:
- UI interactions (clicks, inputs, navigation)
- Form validation
- State management
- Screen transitions
- Progress animations
- Responsive layout
- Chat message history

---

## Key Implementation Details

### Plan Generation Logic
Located in `prototype-state.ts` → `generatePlan()`:
1. Sets `isPlanGenerating: true`
2. Waits 1.5-2.5 seconds (simulated AI delay)
3. Loads `MOCK_INITIAL_PLAN` into state
4. Creates welcome chat message
5. Sets `isPlanGenerating: false`

### Chat Message Processing
Located in `prototype-state.ts` → `addChatMessage()`:
1. Adds user message to chat history
2. Sets `isAiResponding: true`
3. Pattern matches user input:
   - "add" + "section" → calls `addPlanSection()`
   - "remove" + "delete" → calls `removePlanSection()`
   - "benchmark" → adds Benchmarking Analysis section
   - "employee impact" → adds Employee Impact Analysis section
4. Generates contextual response text
5. Waits 800-1500ms (simulated typing delay)
6. Adds AI response to chat history
7. Sets `isAiResponding: false`

### Processing Animation
Located in `page.tsx` → `useEffect()`:
1. Runs when `state.screen === "processing"`
2. Interval updates progress every 150ms (+2%)
3. Calculates current phase based on progress percentage
4. At 100%, clears interval and calls `showEditor()` after 500ms delay

### Full-Screen Layout
The `layout.tsx` applies `fixed inset-0 z-50` to create a full-screen overlay that covers the root layout's TopNav. This gives the wizard a dedicated, distraction-free environment.

---

## Development Notes

### To Extend the Prototype:

1. **Add Real File Upload:**
   - Replace `addDocuments()` with actual file upload logic
   - Implement document parsing/OCR
   - Store files in database/S3

2. **Integrate LLM for Plan Generation:**
   - Replace `generatePlan()` mock delay with API call
   - Send document content + context to LLM
   - Parse LLM response into `CanvasPlan` structure

3. **Add Real Chat:**
   - Replace pattern matching in `addChatMessage()` with LLM API
   - Maintain conversation history
   - Allow LLM to modify plan structure

4. **Implement Canvas Editor AI:**
   - Wire up AI prompt input to LLM API
   - Generate/modify slide content based on prompts
   - Update slide state in real-time

5. **Add Backend Persistence:**
   - Save canvas state to database
   - Implement autosave
   - Add version history
   - Enable multi-user collaboration

6. **Export Functionality:**
   - Generate PowerPoint/PDF from canvas state
   - Apply templates and branding
   - Download or email to client

### Testing the Prototype:

1. Start at `/canvas-flow`
2. Click "New Canvas" → "Renewal"
3. Click "Use Mock Documents" button
4. Click "Continue"
5. Select "C-Suite Executives" audience
6. Select 1-3 priorities
7. Click "Review Plan"
8. Wait for plan generation (~2 seconds)
9. Try chat commands:
   - "add a section about benchmarking"
   - "remove the claims trends section"
10. Click "Generate Canvas"
11. Watch processing animation (~7.5 seconds)
12. Explore canvas editor:
    - Click different slides in left panel
    - View slide previews
    - See alerts and sources in right panel
13. Click "Exit" to return to dashboard

---

## Design Patterns

### Progressive Disclosure
- Step 1: Just documents
- Step 2: Context (required + optional fields separated)
- Step 3: AI-generated plan (expandable sections)
- Step 4: Full editor (3-column layout)

### AI Assistance Levels
1. **Passive:** Upload documents (user provides all input)
2. **Suggestive:** Set context (system guides with options)
3. **Generative:** Review plan (AI creates, user refines)
4. **Collaborative:** Canvas editor (ongoing AI assistance)

### Error Prevention
- Disabled continue buttons until validation passes
- Max 3 priorities enforced in UI
- Clear required field indicators
- Expandable sections hide complexity until needed

### Feedback Mechanisms
- Loading states during AI operations
- Progress indicators (wizard steps, processing phases)
- Confidence scores on plan sections
- Alerts panel highlighting potential issues
- Chat confirmation messages ("Done! I've added...")

---

## Future Considerations

### Real-World Requirements:
- Document parsing (PDF, Excel, Word)
- OCR for scanned documents
- Data extraction (claims data, plan details, census info)
- Template management (branded slide designs)
- Compliance checking (ACA affordability, ERISA, HIPAA)
- Multi-canvas projects
- Team collaboration
- Client portal for sharing
- Mobile-responsive design
- Accessibility (WCAG AA compliance)

### Performance Optimizations:
- Lazy load slide components
- Virtual scrolling for large document lists
- Debounced chat input
- Cached LLM responses
- Progressive image loading in slides

### Security Considerations:
- File upload validation (size, type)
- Document encryption at rest
- Access control per canvas
- Audit logs
- PII/PHI handling compliance

---

## Summary

The Canvas Flow prototype demonstrates a complete AI-assisted workflow for benefits consultants to create professional renewal presentations. It combines structured data collection (wizard steps) with flexible AI refinement (chat interface) to balance user control with automation efficiency.

The prototype is fully functional as a client-side demo with realistic UI interactions, transitions, and mock data. All screens are implemented and connected through a centralized state management system, making it straightforward to replace mock implementations with real backend integrations.
