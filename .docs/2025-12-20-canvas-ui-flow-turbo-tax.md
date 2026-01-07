# Canvas UI Flow - TurboTax-Style Wizard

## Overview

A **guided, step-by-step wizard** that hand-holds users through the canvas creation process. Inspired by TurboTax's approach: one question at a time, contextual help, smart defaults, and a conversational tone.

This feature operates within a client context - the user has already selected a client before reaching this flow.

### Core Principles

| Principle | Implementation |
|-----------|----------------|
| **One task per screen** | Each step focuses on a single decision or action |
| **Progress visibility** | Persistent sidebar showing all steps and completion status |
| **Contextual help** | "Why we need this" tooltips and examples on every screen |
| **Smart defaults** | Pre-fill from client data, suggest based on canvas type |
| **Skip optional steps** | Clear "Skip" buttons for non-essential items |
| **Review before commit** | Summary screen before generation |
| **Save as you go** | Auto-save progress, resume later |

---

## Wizard Layout Template

Every wizard screen (Screens 2-7) uses this consistent layout:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WIZARD SIDEBAR            │  MAIN CONTENT AREA                             │
│  ─────────────────         │                                                │
│                            │  ┌──────────────────────────────────────────┐  │
│  [x] 1. Welcome            │  │  Step N of 6                             │  │
│  [x] 2. Current Plans      │  │                                          │  │
│  [>] 3. Financial Data     │  │  Step Title                              │  │
│  [ ] 4. Renewal Package    │  │  Step description text goes here        │  │
│  [ ] 5. Census Data        │  │                                          │  │
│  [ ] 6. Review             │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │                                  │    │  │
│                            │  │  │    [Step-specific content]       │    │  │
│                            │  │  │                                  │    │  │
│  ─────────────────         │  │  └──────────────────────────────────┘    │  │
│  Progress: 50%             │  │                                          │  │
│  [========--------]        │  └──────────────────────────────────────────┘  │
│                            │                                                │
│                            │          [< Back]         [Continue >]        │
│                            │                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Sidebar States

| Icon | Meaning |
|------|---------|
| [x] | Completed step (clickable to edit) |
| [>] | Current step |
| [ ] | Pending step |
| [-] | Skipped optional step |

---

## Screen 1: Dashboard

The canvas list for the current client. Canvas type is selected via dropdown when creating new.

```
+================================================================================+
|  < Back to Client                                                              |
|                                                                                |
|  ACME CORPORATION                                                              |
|  Technology - San Francisco - 250 employees                                    |
+================================================================================+
|                                                                                |
|  CANVASES                                                    [+ New Canvas v]  |
|                                                                                |
|  Search canvases...                                         Sort: Recent v     |
|                                                                                |
|  +--------------------------------------------------------------------------+  |
|  |  2025 Benefits Renewal                                   * Published     |  |
|  |  Renewal Presentation                                                    |  |
|  |  Jan 1, 2025  |  4 docs  |  Updated 2 hours ago                          |  |
|  |                                                                          |  |
|  |  [View]   [Edit]   [Export v]   [...]                                    |  |
|  +--------------------------------------------------------------------------+  |
|                                                                                |
|  +--------------------------------------------------------------------------+  |
|  |  Q1 2025 Analysis                                        o Draft         |  |
|  |  Pre-Renewal Analysis                                                    |  |
|  |  Mar 1, 2025  |  2 docs  |  Updated yesterday                            |  |
|  |                                                                          |  |
|  |  [Resume]   [Delete]   [...]                                             |  |
|  +--------------------------------------------------------------------------+  |
|                                                                                |
|  +--------------------------------------------------------------------------+  |
|  |  Annual Benefits Review                                  * Processing    |  |
|  |  Benchmarking Report                                                     |  |
|  |  Feb 15, 2025  |  6 docs  |  Started 5 min ago                           |  |
|  |                                                                          |  |
|  |  [============--------] 60% - Building presentation...                   |  |
|  +--------------------------------------------------------------------------+  |
|                                                                                |
+================================================================================+
```

### New Canvas Dropdown (expanded state)

```
                                                               [+ New Canvas v]
                                                               +----------------+
                                                               | Renewal        |
                                                               | Pre-Renewal    |
                                                               | Benchmarking   |
                                                               | Cost Analysis  |
                                                               +----------------+
```

### Canvas Types (Dropdown Options)

| Type | Description |
|------|-------------|
| Renewal | Full renewal analysis with cost comparison and options |
| Pre-Renewal | Early-stage assessment before carrier proposals |
| Benchmarking | Compare against industry and market data |
| Cost Analysis | Deep dive into claims trends and cost drivers |

### Canvas Status Badges

| Badge | Meaning |
|-------|---------|
| * Published | Canvas is finalized and exported |
| o Draft | Work in progress, can be resumed |
| * Processing | Currently generating |
| ! Failed | Generation failed, can retry |

---

## Screen 2: Welcome

First wizard step after selecting canvas type. Sets expectations.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WIZARD SIDEBAR            │  MAIN CONTENT AREA                             │
│  ─────────────────         │                                                │
│                            │  ┌──────────────────────────────────────────┐  │
│  [>] 1. Welcome            │  │                                          │  │
│  [ ] 2. Current Plans      │  │  Let's Create Your Canvas                │  │
│  [ ] 3. Financial Data     │  │                                          │  │
│  [ ] 4. Renewal Package    │  │  We'll guide you through a few simple    │  │
│  [ ] 5. Census Data        │  │  steps to build a professional benefits  │  │
│  [ ] 6. Review             │  │  presentation for Acme Corporation.      │  │
│                            │  │                                          │  │
│                            │  │  ─────────────────────────────────────   │  │
│  ─────────────────         │  │                                          │  │
│  Progress: 0%              │  │  What you'll get:                        │  │
│  [----------------]        │  │                                          │  │
│                            │  │  [x] Executive summary with key findings │  │
│                            │  │  [x] Claims analysis and trend insights  │  │
│                            │  │  [x] Cost comparison and projections     │  │
│                            │  │  [x] Renewal options and recommendations │  │
│                            │  │                                          │  │
│                            │  │  ─────────────────────────────────────   │  │
│                            │  │                                          │  │
│                            │  │  Estimated time: 5-10 minutes            │  │
│                            │  │  Your progress is saved automatically    │  │
│                            │  │                                          │  │
│                            │  └──────────────────────────────────────────┘  │
│                            │                                                │
│                            │                       [Get Started >]          │
│                            │                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 3: Current Plans

Upload current plan documents (SPDs, benefit summaries).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WIZARD SIDEBAR            │  MAIN CONTENT AREA                             │
│  ─────────────────         │                                                │
│                            │  ┌──────────────────────────────────────────┐  │
│  [x] 1. Welcome            │  │  Step 2 of 6                             │  │
│  [>] 2. Current Plans      │  │                                          │  │
│  [ ] 3. Financial Data     │  │  Current Plan Documents                  │  │
│  [ ] 4. Renewal Package    │  │  Upload SPDs, benefit summaries, or      │  │
│  [ ] 5. Census Data        │  │  comparison grids for current coverage   │  │
│  [ ] 6. Review             │  │                                          │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │                                  │    │  │
│  ─────────────────         │  │  │   Drop files here or click       │    │  │
│  Progress: 17%             │  │  │   to upload                      │    │  │
│  [===--------------]       │  │  │                                  │    │  │
│                            │  │  │   PDF, DOCX, XLSX, CSV, PNG, JPG │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  │  YOUR DOCUMENTS            [+ Library]   │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │ SPD_Medical_2024.pdf             │    │  │
│                            │  │  │   [x] Auto-detected as SPD    [x]│    │  │
│                            │  │  ├──────────────────────────────────┤    │  │
│                            │  │  │ Benefit_Grid.xlsx                │    │  │
│                            │  │  │   [x] Auto-detected as Summary[x]│    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  │  TIP: Include all plan types: Medical,   │  │
│                            │  │  Dental, Vision, Life, Disability        │  │
│                            │  │                                          │  │
│                            │  │  ─────────────────────────────────────   │  │
│                            │  │                                          │  │
│                            │  │  ADDITIONAL CONTEXT              (?)     │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │                                  │    │  │
│                            │  │  │  Add any notes or context about  │    │  │
│                            │  │  │  the current plans that would    │    │  │
│                            │  │  │  help with analysis...           │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  └──────────────────────────────────────────┘  │
│                            │                                                │
│                            │          [< Back]         [Continue >]        │
│                            │                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 4: Financial Data

Upload claims experience, premium rates, and stop-loss info.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WIZARD SIDEBAR            │  MAIN CONTENT AREA                             │
│  ─────────────────         │                                                │
│                            │  ┌──────────────────────────────────────────┐  │
│  [x] 1. Welcome            │  │  Step 3 of 6                             │  │
│  [x] 2. Current Plans      │  │                                          │  │
│  [>] 3. Financial Data     │  │  Financial Data                          │  │
│  [ ] 4. Renewal Package    │  │  Upload claims experience, premium       │  │
│  [ ] 5. Census Data        │  │  rates, and stop-loss information        │  │
│  [ ] 6. Review             │  │                                          │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │                                  │    │  │
│  ─────────────────         │  │  │   Drop files here or click       │    │  │
│  Progress: 33%             │  │  │   to upload                      │    │  │
│  [======-----------]       │  │  │                                  │    │  │
│                            │  │  │   PDF, DOCX, XLSX, CSV, PNG, JPG │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  │  YOUR DOCUMENTS            [+ Library]   │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │ Claims_Experience_2024.pdf       │    │  │
│                            │  │  │   [x] Auto-detected           [x]│    │  │
│                            │  │  ├──────────────────────────────────┤    │  │
│                            │  │  │ Premium_Rates.xlsx               │    │  │
│                            │  │  │   [x] Auto-detected           [x]│    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  │  [!] RECOMMENDED                         │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │ Upload a Large Claimant Report   │    │  │
│                            │  │  │ for more accurate trend analysis │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  │  TIP: 12-24 months of data provides the  │  │
│                            │  │  most accurate trend analysis            │  │
│                            │  │                                          │  │
│                            │  │  ─────────────────────────────────────   │  │
│                            │  │                                          │  │
│                            │  │  ADDITIONAL CONTEXT              (?)     │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │                                  │    │  │
│                            │  │  │  Add any notes about the         │    │  │
│                            │  │  │  financial data, known issues,   │    │  │
│                            │  │  │  or context for analysis...      │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  └──────────────────────────────────────────┘  │
│                            │                                                │
│                            │          [< Back]         [Continue >]        │
│                            │                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 5: Renewal Package

Upload carrier renewal proposal (optional - can be skipped).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WIZARD SIDEBAR            │  MAIN CONTENT AREA                             │
│  ─────────────────         │                                                │
│                            │  ┌──────────────────────────────────────────┐  │
│  [x] 1. Welcome            │  │  Step 4 of 6                             │  │
│  [x] 2. Current Plans      │  │                                          │  │
│  [x] 3. Financial Data     │  │  Renewal Package                 OPTIONAL│  │
│  [>] 4. Renewal Package    │  │  Upload the carrier's renewal proposal,  │  │
│  [ ] 5. Census Data        │  │  rate justification, or plan options     │  │
│  [ ] 6. Review             │  │                                          │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │                                  │    │  │
│  ─────────────────         │  │  │   Drop files here or click       │    │  │
│  Progress: 50%             │  │  │   to upload                      │    │  │
│  [========--------]        │  │  │                                  │    │  │
│                            │  │  │   PDF, DOCX, XLSX, CSV, PNG, JPG │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  │  YOUR DOCUMENTS            [+ Library]   │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │ Carrier_Renewal_2025.pdf         │    │  │
│                            │  │  │   [x] Auto-detected           [x]│    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  │  TIP: Don't have the renewal yet? Skip   │  │
│                            │  │  this step and we'll create a pre-       │  │
│                            │  │  renewal analysis instead.               │  │
│                            │  │                                          │  │
│                            │  │  ─────────────────────────────────────   │  │
│                            │  │                                          │  │
│                            │  │  ADDITIONAL CONTEXT              (?)     │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │                                  │    │  │
│                            │  │  │  Add any notes about the renewal │    │  │
│                            │  │  │  proposal, negotiation details,  │    │  │
│                            │  │  │  or carrier communications...    │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  └──────────────────────────────────────────┘  │
│                            │                                                │
│                            │      [< Back]    [Skip]    [Continue >]       │
│                            │                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 6: Census Data

Upload employee census information.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WIZARD SIDEBAR            │  MAIN CONTENT AREA                             │
│  ─────────────────         │                                                │
│                            │  ┌──────────────────────────────────────────┐  │
│  [x] 1. Welcome            │  │  Step 5 of 6                             │  │
│  [x] 2. Current Plans      │  │                                          │  │
│  [x] 3. Financial Data     │  │  Census Data                             │  │
│  [x] 4. Renewal Package    │  │  Upload employee census with enrollment  │  │
│  [>] 5. Census Data        │  │  information and demographics            │  │
│  [ ] 6. Review             │  │                                          │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │                                  │    │  │
│  ─────────────────         │  │  │   Drop files here or click       │    │  │
│  Progress: 67%             │  │  │   to upload                      │    │  │
│  [==========------]        │  │  │                                  │    │  │
│                            │  │  │   PDF, DOCX, XLSX, CSV, PNG, JPG │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  │  YOUR DOCUMENTS            [+ Library]   │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │ Employee_Census_Q4.xlsx          │    │  │
│                            │  │  │   [x] Auto-detected           [x]│    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  │  TIP: Best census files include: age,    │  │
│                            │  │  gender, coverage tier, salary,          │  │
│                            │  │  and plan elections                      │  │
│                            │  │                                          │  │
│                            │  │  ─────────────────────────────────────   │  │
│                            │  │                                          │  │
│                            │  │  ADDITIONAL CONTEXT              (?)     │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │                                  │    │  │
│                            │  │  │  Add any notes about the         │    │  │
│                            │  │  │  employee population, recent     │    │  │
│                            │  │  │  changes, or demographics...     │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  │                                  │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  └──────────────────────────────────────────┘  │
│                            │                                                │
│                            │          [< Back]         [Continue >]        │
│                            │                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 7: Review

Summary of all collected information before generation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  WIZARD SIDEBAR            │  MAIN CONTENT AREA                             │
│  ─────────────────         │                                                │
│                            │  ┌──────────────────────────────────────────┐  │
│  [x] 1. Welcome            │  │  Step 6 of 6                             │  │
│  [x] 2. Current Plans      │  │                                          │  │
│  [x] 3. Financial Data     │  │  Review Your Canvas                      │  │
│  [x] 4. Renewal Package    │  │  Confirm everything looks correct        │  │
│  [x] 5. Census Data        │  │                                          │  │
│  [>] 6. Review             │  │  ─────────────────────────────────────   │  │
│                            │  │                                          │  │
│                            │  │  CANVAS                         [Edit]   │  │
│  ─────────────────         │  │  ┌──────────────────────────────────┐    │  │
│  Progress: 83%             │  │  │ Renewal Presentation             │    │  │
│  [=============---]        │  │  │ Acme Corporation                 │    │  │
│                            │  │  │ Effective: January 1, 2025       │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  │  DOCUMENTS (8 total)            [Edit]   │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │ Current Plans: 2                 │    │  │
│                            │  │  │ Financial Data: 3                │    │  │
│                            │  │  │ Renewal Package: 1               │    │  │
│                            │  │  │ Census Data: 1                   │    │  │
│                            │  │  │ Other: 1                         │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  │  [!] Missing: Large claimant report      │  │
│                            │  │                                          │  │
│                            │  │  ADDITIONAL CONTEXT            [Edit]   │  │
│                            │  │  ┌──────────────────────────────────┐    │  │
│                            │  │  │ "Client had a large claimant in  │    │  │
│                            │  │  │ Q3 that skewed medical costs.    │    │  │
│                            │  │  │ They are also considering a..."  │    │  │
│                            │  │  └──────────────────────────────────┘    │  │
│                            │  │                                          │  │
│                            │  └──────────────────────────────────────────┘  │
│                            │                                                │
│                            │          [< Back]    [Generate Canvas >]      │
│                            │                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 8: Processing Modal

Centered modal overlay showing generation progress. No sidebar visible.

```
+================================================================================+
|                                                                                |
|                                                                                |
|                                                                                |
|         ┌────────────────────────────────────────────────────────────┐         |
|         │                                                            │         |
|         │                  Generating Your Canvas                    │         |
|         │                                                            │         |
|         │         [====================------------] 62%             │         |
|         │                                                            │         |
|         │         [x] Reading your documents                         │         |
|         │         [x] Understanding plan designs                     │         |
|         │         [x] Analyzing claims trends                        │         |
|         │         [>] Calculating cost impacts                       │         |
|         │         [ ] Building presentation                          │         |
|         │         [ ] Running compliance checks                      │         |
|         │                                                            │         |
|         │         ─────────────────────────────────────────          │         |
|         │                                                            │         |
|         │         TIP: Our AI is comparing your claims data          │         |
|         │         against industry benchmarks to identify            │         |
|         │         savings opportunities.                             │         |
|         │                                                            │         |
|         │         Estimated time remaining: ~20 seconds              │         |
|         │                                                            │         |
|         └────────────────────────────────────────────────────────────┘         |
|                                                                                |
|                                                                                |
+================================================================================+
```

### Processing Phases

| Phase | Description |
|-------|-------------|
| Reading documents | Extracting text and data from uploads |
| Understanding plan designs | Identifying coverage details and structures |
| Analyzing claims trends | Finding patterns and cost drivers |
| Calculating cost impacts | Projecting costs and savings |
| Building presentation | Creating slides and visualizations |
| Running compliance checks | Checking for ACA and regulatory issues |

---

## Screen 9: Canvas Editor

Post-wizard editing interface. Three-column layout with AI prompt input.

```
+================================================================================+
|  < Exit    Acme Corporation - 2025 Renewal            [Export v]   [Publish]   |
+================================================================================+
|  SLIDES          |  SLIDE EDITOR                          |  INSIGHTS          |
|  ───────────     |  ─────────────                         |  ─────────         |
|                  |                                        |                    |
|  ┌───────────┐   |  ┌────────────────────────────────┐    |  [!] ALERTS        |
|  │ 1. Cover  │   |  │                                │    |                    |
|  └───────────┘   |  │                                │    |  ACA affordability |
|  ┌───────────┐   |  │                                │    |  threshold at 9.8% |
|  │ 2. Summary│   |  │                                │    |  (limit: 9.12%)    |
|  └───────────┘   |  │    [Current Slide Content]     │    |                    |
|  ┌───────────┐   |  │                                │    |  ─────────────     |
|  │ 3. Cost   │   |  │                                │    |                    |
|  └───────────┘   |  │                                │    |  SOURCES           |
|  ┌───────────┐   |  │                                │    |                    |
|  │ 4. Medical│ > |  │                                │    |  Claims_2024.pdf   |
|  └───────────┘   |  │                                │    |  Census_Q4.xlsx    |
|  ┌───────────┐   |  └────────────────────────────────┘    |  Renewal_2025.pdf  |
|  │ 5. Dental │   |                                        |                    |
|  └───────────┘   |  ┌────────────────────────────────┐    |                    |
|  ┌───────────┐   |  │                                │    |                    |
|  │ 6. Claims │   |  │  Ask AI to edit this slide...  │    |                    |
|  └───────────┘   |  │                                │    |                    |
|  ┌───────────┐   |  │                           [->] │    |                    |
|  │ 7. Bench. │   |  └────────────────────────────────┘    |                    |
|  └───────────┘   |                                        |                    |
|                  |                                        |                    |
|  [+ Add Slide]   |                                        |                    |
|                  |                                        |                    |
+================================================================================+
```

### AI Prompt Input

The prompt input at the bottom of the slide editor allows users to make AI-powered edits:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  Ask AI to edit this slide...                                              │
│                                                                            │
│  Examples:                                                                 │
│  - "Add a comparison chart showing year-over-year cost changes"            │
│  - "Simplify the language for a non-technical audience"                    │
│  - "Include the stop-loss renewal terms from the uploaded documents"       │
│  - "Add a bullet point about the large claimant impact"                    │
│                                                                            │
│                                                              [Send ->]     │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Document Library Sidebar

Slides in from right when user clicks "+ Library" on any document upload step.
Simple file browser showing documents for the current client.

```
+===================================================================+
|  Document Library                                              [x] |
+===================================================================+
|                                                                   |
|  Search documents...                                              |
|                                                                   |
|  Sort: Recent v                                                   |
|        +-----------+                                              |
|        | Recent    |                                              |
|        | Name A-Z  |                                              |
|        | Name Z-A  |                                              |
|        | Type      |                                              |
|        +-----------+                                              |
|                                                                   |
|  ───────────────────────────────────────────────────────────────  |
|                                                                   |
|  ┌─────────────────────────────────────────────────────────────┐  |
|  │  Claims_Experience_2024.pdf                            [+]  │  |
|  │  Financial Data - Dec 15, 2024                              │  |
|  ├─────────────────────────────────────────────────────────────┤  |
|  │  Employee_Census_Q4.xlsx                               [+]  │  |
|  │  Census - Dec 10, 2024                                      │  |
|  ├─────────────────────────────────────────────────────────────┤  |
|  │  Carrier_Renewal_2025.pdf                              [+]  │  |
|  │  Renewal - Dec 5, 2024                                      │  |
|  ├─────────────────────────────────────────────────────────────┤  |
|  │  SPD_Medical_2024.pdf                                  [+]  │  |
|  │  Plan Document - Nov 20, 2024                               │  |
|  ├─────────────────────────────────────────────────────────────┤  |
|  │  Premium_Rates_2024.xlsx                               [+]  │  |
|  │  Financial Data - Nov 15, 2024                              │  |
|  ├─────────────────────────────────────────────────────────────┤  |
|  │  Stop_Loss_Policy.pdf                                  [+]  │  |
|  │  Financial Data - Nov 10, 2024                              │  |
|  ├─────────────────────────────────────────────────────────────┤  |
|  │  Industry_Benchmark_2024.pdf                           [+]  │  |
|  │  Benchmarking - Oct 25, 2024                                │  |
|  ├─────────────────────────────────────────────────────────────┤  |
|  │  ACA_1095C_2024.pdf                                    [+]  │  |
|  │  Compliance - Oct 15, 2024                                  │  |
|  └─────────────────────────────────────────────────────────────┘  |
|                                                                   |
+===================================================================+
```

### Sort Options

| Option | Behavior |
|--------|----------|
| Recent | Most recently uploaded first (default) |
| Name A-Z | Alphabetical by filename |
| Name Z-A | Reverse alphabetical |
| Type | Grouped by document category |

---

## AI Classification Toast

Appears when a document is uploaded and auto-classified.

```
┌──────────────────────────────────────────────────────────────────┐
│  [x] Detected: Claims Experience Report                         │
│                                                                  │
│  Added to: Financial Data                                        │
│                                                                  │
│  [Change Category v]                                  [Dismiss]  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Smart Defaults

The system infers configuration from context - no explicit settings screens needed:

| What | How It's Inferred |
|------|-------------------|
| **Client** | Already selected before entering this flow |
| **Renewal Date** | From client's benefits renewal date in system |
| **Canvas Type** | User selects from dropdown when clicking "New Canvas" |
| **Analysis Focus** | Based on canvas type + documents present |
| **Compliance Checks** | Enabled if compliance docs present; flagged if missing |

---

## Responsive Considerations

| Breakpoint | Layout Adjustments |
|------------|-------------------|
| **Desktop (1440px+)** | Full layout as shown above |
| **Tablet (768-1024px)** | Collapsible sidebar, library as modal |
| **Mobile (<768px)** | Single column, bottom sheet for library, icon-only sidebar |

---

## Component Summary

| Component | Used In |
|-----------|---------|
| **Dashboard** | Screen 1 (canvas list, new canvas dropdown) |
| **WizardLayout** | Screens 2-7 (wraps sidebar + content) |
| **WizardSidebar** | Screens 2-7 (step navigation) |
| **WizardStep** | Each wizard screen (header + content wrapper) |
| **WizardNavigation** | Screens 2-7 (Back/Continue/Skip footer) |
| **StepWelcome** | Screen 2 |
| **StepDocumentUpload** | Screens 3-6 (reusable) |
| **AdditionalContextInput** | Screens 3-6 (text area for user notes) |
| **StepReview** | Screen 7 |
| **ProcessingModal** | Screen 8 |
| **CanvasEditor** | Screen 9 |
| **AIPromptInput** | Screen 9 (slide editing) |
| **DocumentLibrarySidebar** | Screens 3-6 (overlay) |
| **AIClassificationToast** | Screens 3-6 |

---

## Flow Summary

```
Dashboard (client context)
    |
    v
[+ New Canvas v] --> Select type from dropdown
    |
    v
+-- Wizard Flow (6 steps) --+
|                           |
|  1. Welcome               |
|  2. Current Plans         |
|  3. Financial Data        |
|  4. Renewal Package (opt) |
|  5. Census Data           |
|  6. Review                |
|                           |
+---------------------------+
    |
    v
Processing Modal
    |
    v
Canvas Editor (with AI prompt)
```

---

## Appendix: Document Categories

| Category | Description | Example Documents |
|----------|-------------|-------------------|
| Plan Documents | Current benefit plans | SPDs, Benefit summaries |
| Financial Data | Cost and claims data | Claims experience, Premium rates, Stop-loss |
| Renewal | Carrier proposals | Proposed rates, Rate justification |
| Census | Employee information | Employee census, Enrollment counts |
| Benchmarking | Competitive context | Competitive quotes, Industry benchmarks |
| Compliance | Regulatory compliance | ACA 1094-C/1095-C, Testing results |

## Appendix: Status Indicators

| Indicator | Meaning |
|-----------|---------|
| [x] Auto-detected | Document classified by AI |
| [!] Recommended | Suggested document for better analysis |
| OPTIONAL | Step can be skipped |
