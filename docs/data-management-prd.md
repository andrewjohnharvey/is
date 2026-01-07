# Data Management Feature - Product Requirements Document

## Executive Summary

The Data Management feature is a critical module within Impact Studio that enables benefits consultants to centrally manage all client insurance policies, plan documents, and related data organized by plan years. This feature transforms the current placeholder page into a comprehensive data hub that powers downstream analytics, reporting, and AI-generated canvases.

---

## 1. Feature Overview

### Vision

Create a single source of truth for all client benefits data that is organized, accessible, and actionable. The Data Management feature should feel like a well-organized filing cabinet that anticipates consultant needs and reduces manual data entry through smart features like plan copying.

### Key Value Propositions

- **Time Savings**: Copy plans between years instead of re-entering data
- **Data Integrity**: Structured data entry reduces errors and ensures consistency
- **Accessibility**: All client data in one place, organized by plan year
- **Foundation for AI**: Clean, structured data enables better AI-generated canvases and reports

### Target Users

- **Primary**: Benefits consultants managing client accounts
- **Secondary**: Account managers reviewing client data
- **Tertiary**: Clients (future: read-only access to their own data)

---

## 2. Information Architecture

### Data Hierarchy

```
Client
└── Plan Years (sorted by date, newest first)
    ├── Plan Year 2025-2026 (Active)
    │   ├── Insurance Policies
    │   │   ├── Medical (2 plans)
    │   │   ├── Dental (1 plan)
    │   │   ├── Vision (1 plan)
    │   │   ├── Life (1 plan)
    │   │   ├── Voluntary Life (1 plan)
    │   │   ├── STD (1 plan)
    │   │   ├── LTD (1 plan)
    │   │   ├── Critical Illness (0 plans)
    │   │   ├── Hospital Indemnity (0 plans)
    │   │   └── Accidental (0 plans)
    │   ├── Retirement Plans
    │   │   └── 401(k) Plan
    │   ├── PNC Policies
    │   │   └── (if applicable)
    │   └── Documents
    │       ├── Pre-Renewal Meeting (3 files)
    │       ├── Renewal Meeting (5 files)
    │       ├── Open Enrollment (8 files)
    │       ├── Stewardship Reports (2 files)
    │       ├── Employee Handbooks (1 file)
    │       └── General (4 files)
    └── Plan Year 2024-2025 (Archived)
        └── ...
```

### Navigation Structure

```
Data Management (page)
├── Plan Year Selector (dropdown, top of page)
├── Tab Navigation
│   ├── Insurance Policies (default)
│   ├── Retirement Plans
│   ├── PNC Policies
│   └── Documents
└── Content Area (based on selected tab)
```

---

## 3. Insurance Coverage Types

The system supports the following insurance coverage types:

| Coverage Type | Description |
|---------------|-------------|
| Medical | Health insurance plans (HMO, PPO, HDHP, EPO) |
| Dental | Dental coverage (DHMO, DPPO) |
| Vision | Vision care coverage |
| Life | Basic life insurance |
| Voluntary Life | Employee-elected supplemental life |
| STD | Short-Term Disability |
| LTD | Long-Term Disability |
| Critical Illness | Coverage for specific critical conditions |
| Hospital Indemnity | Fixed payments for hospital stays |
| Accidental | Accident insurance coverage |

---

## 4. Document Categories

| Category | Description | Typical Files |
|----------|-------------|---------------|
| Pre-Renewal Meeting | Documents prepared for pre-renewal discussions | Agendas, current plan summaries, claims data |
| Renewal Meeting | Renewal presentation materials | Proposals, rate comparisons, recommendations |
| Open Enrollment | Employee communication materials | Benefit guides, enrollment forms, presentations |
| Stewardship Reports | Periodic performance reports | Quarterly reviews, annual stewardship |
| Employee Handbooks | HR policy documents | Benefits sections, SPDs |
| General | Catch-all for uncategorized documents | Misc correspondence, notes |

### Upload Specifications

| Attribute | Specification |
|-----------|---------------|
| Max File Size | 50MB per file |
| Max Files per Upload | 10 files |
| Allowed Types | PDF, DOCX, XLSX, PPTX, PNG, JPG |
| Storage | Convex file storage |
| Processing | Auto-index for RAG (existing functionality) |

---

## 5. UI/UX Considerations

### Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Data Management                                                  │
│ Upload, manage, and validate client census and benefits data.   │
├─────────────────────────────────────────────────────────────────┤
│ Plan Year: [2025-2026 ▼]              [+ New Plan Year] [Copy →]│
├─────────────────────────────────────────────────────────────────┤
│ [Insurance Policies] [Retirement] [PNC] [Documents]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ Filters ──────────────────────────────────────────────────┐ │
│  │ Coverage Type: [All ▼]  Status: [All ▼]  Carrier: [All ▼]  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Policy Table ─────────────────────────────────────────────┐ │
│  │ □ | Type    | Carrier      | Policy #  | Status | Premium  │ │
│  │───┼─────────┼──────────────┼───────────┼────────┼──────────│ │
│  │ □ | Medical | Blue Cross   | BC-12345  | Active | $1,234   │ │
│  │ □ | Medical | Aetna        | AE-67890  | Active | $1,456   │ │
│  │ □ | Dental  | Delta Dental | DD-11111  | Active | $89      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [+ Add Policy]                          Showing 1-25 of 42     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key UX Principles

1. **Progressive Disclosure**: Show common fields first, advanced fields in expandable sections
2. **Smart Defaults**: Pre-fill dates based on plan year, suggest carriers from history
3. **Inline Validation**: Validate as user types, not just on submit
4. **Confirmation for Destructive Actions**: Always confirm delete/archive
5. **Undo Support**: Allow undo for recent deletions (toast with undo button)
6. **Keyboard Navigation**: Full keyboard support for power users
7. **Responsive Design**: Table collapses to cards on mobile

### Empty States

**No Plan Years**
```
┌─────────────────────────────────────────┐
│         📅                              │
│    No Plan Years Yet                    │
│                                         │
│    Create your first plan year to       │
│    start organizing client data.        │
│                                         │
│    [+ Create Plan Year]                 │
└─────────────────────────────────────────┘
```

**No Policies in Plan Year**
```
┌─────────────────────────────────────────┐
│         📋                              │
│    No Insurance Policies                │
│                                         │
│    Add policies manually or copy from   │
│    a previous plan year.                │
│                                         │
│    [+ Add Policy]  [Copy from 2024-25]  │
└─────────────────────────────────────────┘
```

---

## 6. Database Schema

### Schema Validators

```typescript
// convex/schema.ts additions

export const coverageTypeValidator = v.union(
  v.literal("medical"),
  v.literal("dental"),
  v.literal("vision"),
  v.literal("life"),
  v.literal("voluntary_life"),
  v.literal("std"),
  v.literal("ltd"),
  v.literal("critical_illness"),
  v.literal("hospital_indemnity"),
  v.literal("accidental")
);

export const policyStatusValidator = v.union(
  v.literal("active"),
  v.literal("pending"),
  v.literal("terminated")
);

export const documentCategoryValidator = v.union(
  v.literal("pre_renewal"),
  v.literal("renewal"),
  v.literal("open_enrollment"),
  v.literal("stewardship"),
  v.literal("handbook"),
  v.literal("general")
);

export const retirementPlanTypeValidator = v.union(
  v.literal("401k"),
  v.literal("403b"),
  v.literal("pension"),
  v.literal("other")
);
```

### Tables

```typescript
planYears: defineTable({
  clientId: v.id("clients"),
  name: v.string(),
  startDate: v.number(),
  endDate: v.number(),
  isActive: v.boolean(),
  isArchived: v.boolean(),
  createdAt: v.number(),
  createdBy: v.optional(v.string()),
})
  .index("by_client", ["clientId"])
  .index("by_client_active", ["clientId", "isActive"]),

insurancePolicies: defineTable({
  clientId: v.id("clients"),
  planYearId: v.id("planYears"),
  coverageType: coverageTypeValidator,
  carrier: v.string(),
  policyNumber: v.string(),
  effectiveDate: v.number(),
  terminationDate: v.optional(v.number()),
  status: policyStatusValidator,
  premiumMonthly: v.optional(v.number()),
  notes: v.optional(v.string()),
  coverageDetails: v.any(),
  copiedFrom: v.optional(v.id("insurancePolicies")),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.optional(v.number()),
})
  .index("by_plan_year", ["planYearId"])
  .index("by_client", ["clientId"])
  .index("by_coverage_type", ["planYearId", "coverageType"]),

retirementPlans: defineTable({
  clientId: v.id("clients"),
  planYearId: v.id("planYears"),
  planType: retirementPlanTypeValidator,
  planName: v.string(),
  recordkeeper: v.string(),
  matchFormula: v.optional(v.string()),
  vestingSchedule: v.optional(v.string()),
  autoEnrollment: v.boolean(),
  autoEnrollmentRate: v.optional(v.number()),
  details: v.any(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_plan_year", ["planYearId"]),

documentCategories: defineTable({
  clientId: v.id("clients"),
  planYearId: v.id("planYears"),
  documentId: v.id("documents"),
  category: documentCategoryValidator,
  linkedPolicyIds: v.array(v.id("insurancePolicies")),
})
  .index("by_plan_year_category", ["planYearId", "category"])
  .index("by_document", ["documentId"]),
```

---

## 7. File Structure

```
app/clients/[clientId]/data-management/
├── page.tsx                    # Main page with tabs
├── components/
│   ├── plan-year-selector.tsx  # Dropdown for plan year selection
│   ├── policy-table.tsx        # Main policy table
│   ├── policy-form.tsx         # Add/edit policy slide-out
│   ├── policy-copy-modal.tsx   # Copy policy modal
│   ├── bulk-copy-wizard.tsx    # Multi-step bulk copy
│   ├── document-manager.tsx    # Document tab content
│   └── coverage-type-icon.tsx  # Icons for each coverage type
└── hooks/
    ├── use-plan-years.ts       # Plan year queries/mutations
    ├── use-policies.ts         # Policy queries/mutations
    └── use-documents.ts        # Document queries/mutations

convex/
├── planYears.ts               # Plan year functions
├── insurancePolicies.ts       # Policy CRUD functions
├── retirementPlans.ts         # Retirement plan functions
└── documentCategories.ts      # Document categorization
```

---

## 8. Success Metrics

### Quantitative Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to complete renewal data entry | < 30 minutes | Track from first policy add to last in new plan year |
| Copy feature adoption | > 60% of renewals | % of new plan years created via copy |
| Document upload success rate | > 98% | Successful uploads / attempted uploads |
| Data completeness | > 80% fields filled | Required + optional fields with values |
| Page load time | < 2 seconds | Time to interactive for policy table |

### Qualitative Metrics

| Metric | Method |
|--------|--------|
| Consultant satisfaction | In-app feedback widget, quarterly survey |
| Feature discoverability | User testing sessions |
| Error rate reduction | Compare data quality before/after |
| Support ticket volume | Track data-related support requests |

### North Star Metric

**Time saved per client renewal**: Measure total time spent in Data Management during renewal period, compare to baseline (manual spreadsheet tracking).

---

## 9. MVP vs Future Enhancements

### MVP (v1.0) - Target: 6-8 weeks

**Must Have**
- [ ] Plan year CRUD (create, read, update, archive)
- [ ] Insurance policy CRUD for all 10 coverage types
- [ ] Basic policy table with sorting and filtering
- [ ] Single policy copy to new plan year
- [ ] Document upload with category assignment
- [ ] Document list view by category

**Should Have**
- [ ] Bulk policy copy
- [ ] Policy form validation with helpful errors
- [ ] Auto-suggest for carrier names
- [ ] Document preview (PDF inline)

### v1.1 - Target: 4 weeks after MVP

**Enhancements**
- [ ] Retirement plan management
- [ ] PNC policy management
- [ ] Document-to-policy linking
- [ ] Audit log / change history
- [ ] Export to Excel

### v1.2 - Target: 4 weeks after v1.1

**Advanced Features**
- [ ] Bulk document upload with auto-categorization (AI)
- [ ] Policy comparison view (side-by-side years)
- [ ] Rate change analysis
- [ ] Integration with carrier APIs (future)
- [ ] Client portal (read-only access)

### v2.0 - Future

**Strategic Features**
- [ ] Census data management
- [ ] Enrollment tracking
- [ ] Claims data integration
- [ ] Predictive analytics (renewal cost projections)
- [ ] Multi-client benchmarking from data

---

## 10. Edge Cases & Considerations

### Data Integrity

| Scenario | Handling |
|----------|----------|
| Duplicate policy numbers | Warn but allow (different carriers may reuse) |
| Overlapping plan years | Block creation with clear error message |
| Deleting plan year with data | Prevent deletion, offer archive instead |
| Orphaned documents | Documents without plan year shown in "Unassigned" |
| Policy dates outside plan year | Warning (yellow) but allow save |

### Concurrency

| Scenario | Handling |
|----------|----------|
| Two users editing same policy | Last write wins, but show "modified by X" warning |
| Bulk copy while another user adds policy | Include newly added policies in copy |
| Delete while viewing | Show "This policy was deleted" message, redirect |

### Performance

| Scenario | Handling |
|----------|----------|
| Client with 10+ plan years | Virtual scrolling in dropdown, show recent 5 by default |
| Plan year with 100+ policies | Pagination (25/page), lazy load details |
| Bulk copy of 50+ policies | Background job with progress indicator |
| Large document uploads | Chunked upload with resume capability |

### Accessibility

- All form fields have associated labels
- Error messages announced to screen readers
- Table sortable via keyboard
- Focus management in modals/panels
- Color not sole indicator of status (icons + text)

---

## 11. Integration Points

1. **Canvas Generation**: Policies and documents feed into AI canvas generation
2. **Benchmarking**: Policy data used for peer comparisons
3. **Workforce Investment**: Premium data flows to investment calculations
4. **Strategic Roadmap**: Historical data informs recommendations

---

## 12. Open Questions

| Question | Owner | Due Date |
|----------|-------|----------|
| Should we support multiple policies per coverage type per plan year? | Product | Before dev start |
| What's the retention policy for archived plan years? | Legal/Compliance | Before v1.1 |
| Do we need role-based access (view vs edit)? | Product | Before v1.1 |
| Should documents be versioned? | Product | Before v1.2 |
| Integration with specific carrier portals? | Engineering | v2.0 planning |

---

## 13. Coverage Type Icons

| Coverage Type | Suggested Icon | Color |
|---------------|----------------|-------|
| Medical | Heart with plus | Red |
| Dental | Tooth | Blue |
| Vision | Eye | Purple |
| Life | Shield | Green |
| Voluntary Life | Shield with plus | Light Green |
| STD | Calendar (short) | Orange |
| LTD | Calendar (long) | Dark Orange |
| Critical Illness | Alert triangle | Yellow |
| Hospital Indemnity | Building (hospital) | Teal |
| Accidental | Bandage | Pink |

---

*Document Version: 1.0*
*Last Updated: December 11, 2025*
*Author: Product Management*

---

# User Stories & Acceptance Criteria

## Plan Year Management

### PY-001: Create New Plan Year

**As a** benefits consultant  
**I want to** create a new plan year for a client  
**So that** I can organize all benefits data for that coverage period

**Priority:** P0 (Must Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access "Create Plan Year" from the Data Management page via a clearly visible button | Manual test |
| 2 | Form displays fields for: Start Date, End Date (both required) | Manual test |
| 3 | Plan year name is auto-generated from start date year (e.g., "2025" for Jan 1, 2025 start) | Unit test |
| 4 | System validates that end date is after start date | Unit test |
| 5 | System validates that new plan year does not overlap with existing plan years for the same client | Unit test |
| 6 | If overlap detected, system displays clear error message identifying the conflicting plan year | Manual test |
| 7 | On successful creation, user is redirected to the new plan year view | Manual test |
| 8 | Success toast notification displays "Plan year [name] created successfully" | Manual test |
| 9 | New plan year appears in the plan year dropdown selector | Manual test |
| 10 | Created plan year is set as active by default if no other active plan year exists | Unit test |

#### Technical Notes
- Mutation: `planYears.create`
- Validation should happen both client-side and server-side
- Store timestamps as Unix milliseconds

---

### PY-002: View All Plan Years

**As a** benefits consultant  
**I want to** view all plan years for a client  
**So that** I can navigate between different coverage periods

**Priority:** P0 (Must Have)  
**Story Points:** 3

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Plan year dropdown is visible at the top of the Data Management page | Manual test |
| 2 | Plan years are displayed in reverse chronological order (newest first) | Unit test |
| 3 | Active plan year is visually distinguished (e.g., badge, checkmark, or highlight) | Manual test |
| 4 | Each plan year shows: Name, Date range, Status (Active/Archived), Quick stats | Manual test |
| 5 | Quick stats include: Number of policies, Number of documents | Integration test |
| 6 | Archived plan years are hidden by default | Manual test |
| 7 | User can toggle "Show archived" to view archived plan years | Manual test |
| 8 | Archived plan years are visually dimmed or marked with "Archived" badge | Manual test |
| 9 | Clicking a plan year switches the view to that plan year's data | Manual test |
| 10 | Dropdown supports keyboard navigation (arrow keys, enter to select) | Accessibility test |

#### Technical Notes
- Query: `planYears.listByClient`
- Consider virtual scrolling if client has 10+ plan years

---

### PY-003: Set Active Plan Year

**As a** benefits consultant  
**I want to** mark a plan year as "active"  
**So that** it becomes the default view when I access the client

**Priority:** P1 (Should Have)  
**Story Points:** 2

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can set a plan year as active via dropdown menu or plan year settings | Manual test |
| 2 | Only one plan year can be active at a time per client | Unit test |
| 3 | Setting a new active plan year automatically deactivates the previous one | Unit test |
| 4 | Active plan year loads automatically when navigating to Data Management | Integration test |
| 5 | Visual indicator clearly shows which plan year is active | Manual test |
| 6 | Confirmation message displays when active plan year is changed | Manual test |
| 7 | Archived plan years cannot be set as active (option disabled/hidden) | Manual test |

#### Technical Notes
- Mutation: `planYears.setActive`
- Use transaction to ensure atomicity when switching active status

---

### PY-004: Edit Plan Year

**As a** benefits consultant  
**I want to** edit an existing plan year's dates  
**So that** I can correct mistakes or adjust coverage periods

**Priority:** P1 (Should Have)  
**Story Points:** 3

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access edit mode via plan year settings or dropdown menu | Manual test |
| 2 | Edit form is pre-populated with existing plan year data | Manual test |
| 3 | User can modify start date and end date | Manual test |
| 4 | Plan year name auto-updates if start date year changes | Unit test |
| 5 | System validates no overlap with other plan years (excluding current) | Unit test |
| 6 | System warns if policies exist with dates outside new plan year range | Manual test |
| 7 | Warning allows user to proceed or cancel | Manual test |
| 8 | Changes are saved with updated timestamp | Unit test |
| 9 | Success toast confirms "Plan year updated successfully" | Manual test |
| 10 | Audit log records the change with before/after values | Integration test |

#### Technical Notes
- Mutation: `planYears.update`
- Consider impact on associated policies when dates change

---

### PY-005: Archive Plan Year

**As a** benefits consultant  
**I want to** archive old plan years  
**So that** they don't clutter my view but data is preserved

**Priority:** P2 (Nice to Have)  
**Story Points:** 2

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can archive a plan year via dropdown menu or settings | Manual test |
| 2 | Confirmation dialog appears: "Archive [Plan Year Name]? This will hide it from the default view." | Manual test |
| 3 | System prevents archiving the active plan year | Unit test |
| 4 | System prevents archiving plan years that ended less than 1 year ago | Unit test |
| 5 | Archived plan years are hidden from the main dropdown by default | Manual test |
| 6 | User can view archived years via "Show archived" toggle | Manual test |
| 7 | Archived plan years retain all associated data (policies, documents) | Integration test |
| 8 | Archived plan years can be unarchived (restored) | Manual test |
| 9 | Success toast confirms "Plan year archived successfully" | Manual test |

#### Technical Notes
- Mutation: `planYears.archive`
- Soft archive (set `isArchived: true`), not deletion

---

### PY-006: Delete Plan Year

**As a** benefits consultant  
**I want to** delete an empty plan year  
**So that** I can remove accidentally created plan years

**Priority:** P2 (Nice to Have)  
**Story Points:** 2

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Delete option is only available for plan years with no associated data | Unit test |
| 2 | If plan year has policies or documents, delete option is disabled | Manual test |
| 3 | Disabled delete shows tooltip: "Cannot delete plan year with existing data. Archive instead." | Manual test |
| 4 | For empty plan years, confirmation dialog appears | Manual test |
| 5 | Confirmation requires typing plan year name to confirm | Manual test |
| 6 | On deletion, user is redirected to the most recent remaining plan year | Manual test |
| 7 | If no plan years remain, empty state is shown | Manual test |
| 8 | Deletion is permanent (hard delete) | Unit test |

#### Technical Notes
- Mutation: `planYears.delete`
- Check for associated policies and documents before allowing delete

---

## Insurance Policy Management

### IP-001: Add New Insurance Policy

**As a** benefits consultant  
**I want to** add a new insurance policy to a plan year  
**So that** I can track all coverage details for the client

**Priority:** P0 (Must Have)  
**Story Points:** 8

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access "Add Policy" button from the Insurance Policies tab | Manual test |
| 2 | Clicking "Add Policy" opens a slide-out panel from the right | Manual test |
| 3 | User must first select a coverage type from the 10 available options | Manual test |
| 4 | Form dynamically displays fields specific to the selected coverage type | Manual test |
| 5 | Common fields appear for all coverage types: Carrier, Policy Number, Effective Date, Status, Notes | Manual test |
| 6 | Required fields are clearly marked with asterisk (*) | Manual test |
| 7 | Carrier field provides auto-suggestions from previously entered carriers | Integration test |
| 8 | Effective date defaults to plan year start date | Unit test |
| 9 | Status defaults to "Active" | Unit test |
| 10 | Form validates all required fields before submission | Unit test |
| 11 | Inline validation shows errors as user completes fields | Manual test |
| 12 | On successful save, panel closes and table refreshes | Manual test |
| 13 | Success toast shows "Policy added successfully" with option to "Add Another" | Manual test |
| 14 | "Add Another" keeps panel open with form cleared | Manual test |
| 15 | Cancel button closes panel with confirmation if form has changes | Manual test |

#### Coverage-Specific Fields

**Medical:**
| Field | Type | Required |
|-------|------|----------|
| Plan Type | Select (HMO/PPO/HDHP/EPO) | Yes |
| Deductible (Individual) | Currency | Yes |
| Deductible (Family) | Currency | Yes |
| Out-of-Pocket Max (Individual) | Currency | Yes |
| Out-of-Pocket Max (Family) | Currency | Yes |
| Copay (PCP) | Currency | No |
| Copay (Specialist) | Currency | No |
| HSA Eligible | Boolean | Yes |
| Employer HSA Contribution | Currency | If HSA Eligible |

**Dental:**
| Field | Type | Required |
|-------|------|----------|
| Plan Type | Select (DHMO/DPPO) | Yes |
| Annual Maximum | Currency | Yes |
| Deductible | Currency | Yes |
| Preventive Coverage | Percentage | Yes |
| Basic Coverage | Percentage | Yes |
| Major Coverage | Percentage | Yes |
| Orthodontia Coverage | Boolean | No |
| Orthodontia Lifetime Max | Currency | If Ortho = Yes |

**Vision:**
| Field | Type | Required |
|-------|------|----------|
| Exam Copay | Currency | Yes |
| Frames Allowance | Currency | Yes |
| Lenses Coverage | Text | Yes |
| Contact Lens Allowance | Currency | No |
| Exam Frequency | Select (12/24 months) | Yes |
| Lenses Frequency | Select (12/24 months) | Yes |

**Life:**
| Field | Type | Required |
|-------|------|----------|
| Coverage Type | Select (Basic/Supplemental) | Yes |
| Benefit Amount | Currency or Formula | Yes |
| AD&D Included | Boolean | Yes |
| Guarantee Issue | Currency | No |
| Age Reduction Schedule | Text | No |

**Voluntary Life:**
| Field | Type | Required |
|-------|------|----------|
| Employee Max | Currency | Yes |
| Spouse Max | Currency | No |
| Child Coverage | Currency | No |
| Guarantee Issue (Employee) | Currency | Yes |
| Guarantee Issue (Spouse) | Currency | No |
| Portability | Boolean | No |

**STD (Short-Term Disability):**
| Field | Type | Required |
|-------|------|----------|
| Benefit Percentage | Percentage | Yes |
| Weekly Maximum | Currency | Yes |
| Elimination Period | Number (days) | Yes |
| Benefit Duration | Number (weeks) | Yes |
| Pre-existing Condition Clause | Boolean | No |

**LTD (Long-Term Disability):**
| Field | Type | Required |
|-------|------|----------|
| Benefit Percentage | Percentage | Yes |
| Monthly Maximum | Currency | Yes |
| Elimination Period | Number (days) | Yes |
| Benefit Duration | Select (SSNRA/5yr/etc) | Yes |
| Definition of Disability | Select (Own Occ/Any Occ) | Yes |
| Own Occupation Period | Number (months) | If Own Occ |

**Critical Illness:**
| Field | Type | Required |
|-------|------|----------|
| Benefit Amount | Currency | Yes |
| Covered Conditions | Multi-select | Yes |
| Recurrence Benefit | Boolean | No |
| Wellness Benefit | Currency | No |

**Hospital Indemnity:**
| Field | Type | Required |
|-------|------|----------|
| Admission Benefit | Currency | Yes |
| Daily Benefit | Currency | Yes |
| ICU Daily Benefit | Currency | No |
| Outpatient Surgery | Currency | No |

**Accidental:**
| Field | Type | Required |
|-------|------|----------|
| Principal Sum | Currency | Yes |
| Dismemberment Schedule | Text | No |
| Common Carrier Benefit | Currency | No |
| Wellness Benefit | Currency | No |

#### Technical Notes
- Mutation: `insurancePolicies.create`
- Store coverage-specific fields in `coverageDetails` JSON field
- Client-side and server-side validation required

---

### IP-002: Edit Existing Policy

**As a** benefits consultant  
**I want to** edit an existing insurance policy  
**So that** I can update information when details change

**Priority:** P0 (Must Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access edit via row click or edit icon in actions column | Manual test |
| 2 | Edit opens the same slide-out panel as "Add Policy" | Manual test |
| 3 | Form is pre-populated with all existing policy data | Manual test |
| 4 | Coverage type is displayed but cannot be changed (read-only) | Manual test |
| 5 | User can modify any other field | Manual test |
| 6 | "Last modified" timestamp and user shown at bottom of form | Manual test |
| 7 | Form tracks changes and highlights modified fields | Manual test |
| 8 | Save button is disabled if no changes made | Manual test |
| 9 | On save, confirmation dialog shows summary of changes | Manual test |
| 10 | Successful save updates the table row immediately | Manual test |
| 11 | Success toast shows "Policy updated successfully" | Manual test |
| 12 | Change history is recorded in audit log | Integration test |
| 13 | If another user modified the policy since it was opened, show conflict warning | Integration test |

#### Technical Notes
- Mutation: `insurancePolicies.update`
- Implement optimistic concurrency check using `updatedAt` timestamp

---

### IP-003: Delete Insurance Policy

**As a** benefits consultant  
**I want to** delete an insurance policy  
**So that** I can remove incorrect or duplicate entries

**Priority:** P1 (Should Have)  
**Story Points:** 3

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access delete via actions menu or delete icon | Manual test |
| 2 | Confirmation dialog appears with policy details | Manual test |
| 3 | Dialog shows: Coverage type, Carrier, Policy number | Manual test |
| 4 | User must click "Delete" button to confirm (not just press Enter) | Manual test |
| 5 | Deletion is a soft delete (sets `deletedAt` timestamp) | Unit test |
| 6 | Deleted policy is immediately removed from table view | Manual test |
| 7 | Success toast shows "Policy deleted" with "Undo" button | Manual test |
| 8 | Clicking "Undo" within 10 seconds restores the policy | Integration test |
| 9 | After 10 seconds, toast disappears and undo is no longer available | Manual test |
| 10 | Soft-deleted policies are permanently removed after 30 days | Background job test |
| 11 | Associated document links are preserved (documents not deleted) | Unit test |

#### Technical Notes
- Mutation: `insurancePolicies.softDelete`
- Background job: `insurancePolicies.permanentlyDeleteExpired`
- Undo mutation: `insurancePolicies.restore`

---

### IP-004: View Policies in Table

**As a** benefits consultant  
**I want to** view all policies in a table format  
**So that** I can quickly scan and find policy information

**Priority:** P0 (Must Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Table displays all non-deleted policies for the selected plan year | Integration test |
| 2 | Default columns: Checkbox, Coverage Type (with icon), Carrier, Policy #, Status, Effective Date, Monthly Premium, Documents (count), Actions | Manual test |
| 3 | Coverage type shows both icon and text label | Manual test |
| 4 | Status shows as colored badge (Active=green, Pending=yellow, Terminated=gray) | Manual test |
| 5 | Currency values formatted with $ and commas | Unit test |
| 6 | Dates formatted as "MMM D, YYYY" (e.g., "Jan 1, 2025") | Unit test |
| 7 | Long carrier names truncate with ellipsis and show full name on hover | Manual test |
| 8 | Table headers are clickable for sorting | Manual test |
| 9 | Sort indicator (arrow) shows current sort column and direction | Manual test |
| 10 | Default sort: Coverage type (alphabetical), then Carrier (alphabetical) | Unit test |
| 11 | Clicking sorted column toggles between ascending/descending | Manual test |
| 12 | Shift+click enables multi-column sort | Manual test |
| 13 | Table shows 25 rows per page by default | Manual test |
| 14 | Pagination controls at bottom: Previous, page numbers, Next | Manual test |
| 15 | Page size selector: 10, 25, 50, 100 | Manual test |
| 16 | "Showing X-Y of Z" text displays current view | Manual test |
| 17 | Empty state shows helpful message with CTA to add first policy | Manual test |
| 18 | Loading state shows skeleton rows matching table structure | Manual test |

#### Technical Notes
- Query: `insurancePolicies.listByPlanYear`
- Implement client-side sorting for performance
- Consider server-side pagination for 100+ policies

---

### IP-005: Filter Policies

**As a** benefits consultant  
**I want to** filter the policy table  
**So that** I can find specific policies quickly

**Priority:** P1 (Should Have)  
**Story Points:** 3

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Filter bar appears above the table | Manual test |
| 2 | Filter options: Coverage Type, Status, Carrier | Manual test |
| 3 | Coverage Type filter is multi-select (can select multiple types) | Manual test |
| 4 | Status filter is multi-select | Manual test |
| 5 | Carrier filter is searchable dropdown with all unique carriers | Manual test |
| 6 | Filters apply immediately on selection (no "Apply" button needed) | Manual test |
| 7 | Active filters show as pills/tags below filter bar | Manual test |
| 8 | Each filter pill has "X" to remove that filter | Manual test |
| 9 | "Clear all filters" link appears when any filter is active | Manual test |
| 10 | Table updates to show only matching policies | Integration test |
| 11 | "Showing X-Y of Z (filtered from N total)" when filters active | Manual test |
| 12 | Empty state when filters return no results: "No policies match your filters" | Manual test |
| 13 | Filter state persists during session (survives tab switching) | Integration test |
| 14 | Filter state does NOT persist across page refreshes | Unit test |

#### Technical Notes
- Implement client-side filtering for performance
- Store filter state in React state or URL params

---

### IP-006: Copy Single Policy to New Plan Year

**As a** benefits consultant  
**I want to** copy a policy to a different plan year  
**So that** I don't have to re-enter all the data for renewals

**Priority:** P0 (Must Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access "Copy to..." from policy row actions menu | Manual test |
| 2 | Copy modal opens with policy summary displayed | Manual test |
| 3 | Modal shows: Coverage type, Carrier, Policy number of source policy | Manual test |
| 4 | User must select target plan year from dropdown | Manual test |
| 5 | Target plan year dropdown excludes current plan year | Unit test |
| 6 | User can create new plan year from within the modal | Manual test |
| 7 | Options available: Copy premium/rates (checkbox, default: unchecked) | Manual test |
| 8 | Options available: Update effective dates (checkbox, default: checked) | Manual test |
| 9 | If "Update effective dates" checked, dates shift by 1 year | Unit test |
| 10 | Preview shows which fields will be copied and their values | Manual test |
| 11 | On copy, new policy is created in target plan year | Integration test |
| 12 | New policy has unique ID, new createdAt timestamp | Unit test |
| 13 | New policy has `copiedFrom` field referencing source policy ID | Unit test |
| 14 | Note auto-added: "Copied from [source plan year] on [date]" | Unit test |
| 15 | Success toast: "Policy copied to [target plan year]" with "View" link | Manual test |
| 16 | "View" link navigates to the new policy in target plan year | Manual test |

#### Technical Notes
- Mutation: `insurancePolicies.copyToYear`
- Transaction to ensure atomicity

---

### IP-007: Bulk Copy Policies to New Plan Year

**As a** benefits consultant  
**I want to** copy multiple policies at once to a new plan year  
**So that** I can quickly set up renewals

**Priority:** P1 (Should Have)  
**Story Points:** 8

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can select multiple policies via checkboxes in table | Manual test |
| 2 | "Select all" checkbox in header selects all visible policies | Manual test |
| 3 | When policies selected, bulk action bar appears above table | Manual test |
| 4 | Bulk action bar shows: "[N] policies selected" and "Copy to..." button | Manual test |
| 5 | Clicking "Copy to..." opens bulk copy wizard modal | Manual test |
| 6 | Step 1: Select target plan year (or create new) | Manual test |
| 7 | Step 2: Configure copy options (same as single copy) | Manual test |
| 8 | Step 3: Preview - shows list of all policies to be copied | Manual test |
| 9 | Preview allows user to deselect individual policies | Manual test |
| 10 | "Copy [N] Policies" button initiates the operation | Manual test |
| 11 | Progress indicator shows during bulk operation | Manual test |
| 12 | Progress shows: "Copying policy X of Y..." | Manual test |
| 13 | Operation continues even if individual policy copy fails | Unit test |
| 14 | On completion, summary shows: Succeeded (N), Failed (N) | Manual test |
| 15 | Failed policies listed with error reason | Manual test |
| 16 | User can retry failed policies | Manual test |
| 17 | Success toast with link to view copied policies in target year | Manual test |

#### Technical Notes
- Mutation: `insurancePolicies.bulkCopyToYear`
- Use Convex action for long-running operation
- Return partial success results

---

### IP-008: View Policy Details

**As a** benefits consultant  
**I want to** view full details of a policy  
**So that** I can review all coverage information

**Priority:** P1 (Should Have)  
**Story Points:** 3

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can click on a policy row to view details | Manual test |
| 2 | Details panel opens showing all policy fields | Manual test |
| 3 | Fields organized by category with clear section headers | Manual test |
| 4 | Common fields shown first, then coverage-specific fields | Manual test |
| 5 | Empty/null fields show "Not specified" in muted text | Manual test |
| 6 | Currency values formatted consistently | Unit test |
| 7 | Dates formatted consistently | Unit test |
| 8 | "Edit" button at top of panel opens edit mode | Manual test |
| 9 | "Linked Documents" section shows associated documents | Integration test |
| 10 | Each document link opens document preview/download | Manual test |
| 11 | "Copy History" section shows if policy was copied from another | Manual test |
| 12 | Copy history links to source policy (if still exists) | Manual test |
| 13 | "Last modified by [user] on [date]" shown at bottom | Manual test |

#### Technical Notes
- Query: `insurancePolicies.getById`
- Include linked documents in query response

---

## Document Management

### DM-001: Upload Documents

**As a** benefits consultant  
**I want to** upload documents to the client's data management area  
**So that** important files are organized and accessible

**Priority:** P0 (Must Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access Documents tab in Data Management | Manual test |
| 2 | Upload area shows drag-and-drop zone with clear instructions | Manual test |
| 3 | User can also click to browse and select files | Manual test |
| 4 | Multiple files can be uploaded at once (up to 10) | Manual test |
| 5 | Supported file types: PDF, DOCX, XLSX, PPTX, PNG, JPG | Unit test |
| 6 | Maximum file size: 50MB per file | Unit test |
| 7 | Invalid file type shows error: "[filename] is not a supported file type" | Manual test |
| 8 | Oversized file shows error: "[filename] exceeds 50MB limit" | Manual test |
| 9 | After selecting files, user must choose a category for each | Manual test |
| 10 | Category options: Pre-Renewal, Renewal, Open Enrollment, Stewardship, Handbook, General | Manual test |
| 11 | Default category is "General" | Unit test |
| 12 | Upload progress shown for each file | Manual test |
| 13 | Successfully uploaded files show checkmark | Manual test |
| 14 | Failed uploads show error with retry option | Manual test |
| 15 | On completion, documents appear in the appropriate category list | Integration test |
| 16 | Documents are automatically processed for RAG indexing | Integration test |

#### Technical Notes
- Use existing document upload infrastructure
- Mutation: `documents.upload` (existing)
- New mutation: `documentCategories.assign`

---

### DM-002: View Documents by Category

**As a** benefits consultant  
**I want to** view documents organized by category  
**So that** I can find specific documents quickly

**Priority:** P0 (Must Have)  
**Story Points:** 3

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Documents tab shows category tabs/pills: All, Pre-Renewal, Renewal, Open Enrollment, Stewardship, Handbook, General | Manual test |
| 2 | Each category tab shows document count in parentheses | Manual test |
| 3 | "All" tab is selected by default | Manual test |
| 4 | Selecting a category filters to show only those documents | Manual test |
| 5 | Documents displayed in a list or grid view | Manual test |
| 6 | User can toggle between list and grid view | Manual test |
| 7 | Each document shows: Filename, File type icon, Size, Upload date, Uploader | Manual test |
| 8 | Documents sorted by upload date (newest first) by default | Unit test |
| 9 | User can sort by: Name, Date, Size | Manual test |
| 10 | Search box allows filtering by filename | Manual test |
| 11 | Search is instant (filters as user types) | Manual test |
| 12 | Empty category shows: "No documents in this category" | Manual test |

#### Technical Notes
- Query: `documentCategories.listByPlanYearAndCategory`
- Implement client-side search for performance

---

### DM-003: Download Documents

**As a** benefits consultant  
**I want to** download documents  
**So that** I can share them externally or work with them offline

**Priority:** P0 (Must Have)  
**Story Points:** 2

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Each document has a download button/icon | Manual test |
| 2 | Clicking download starts browser download | Manual test |
| 3 | Downloaded file has original filename | Unit test |
| 4 | User can select multiple documents via checkboxes | Manual test |
| 5 | Bulk download button appears when multiple selected | Manual test |
| 6 | Bulk download creates ZIP file with all selected documents | Integration test |
| 7 | ZIP file named: "[ClientName]_Documents_[Date].zip" | Unit test |
| 8 | Download progress indicator for large files | Manual test |
| 9 | Failed download shows error with retry option | Manual test |

#### Technical Notes
- Use Convex storage URL for individual downloads
- Create server action for ZIP generation

---

### DM-004: Preview Documents

**As a** benefits consultant  
**I want to** preview documents without downloading  
**So that** I can quickly check document contents

**Priority:** P1 (Should Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Clicking document name/thumbnail opens preview modal | Manual test |
| 2 | PDF files render inline in modal | Manual test |
| 3 | Image files (PNG, JPG) display in modal | Manual test |
| 4 | Office files (DOCX, XLSX, PPTX) show "Preview not available" with download link | Manual test |
| 5 | Preview modal shows document name in header | Manual test |
| 6 | Preview modal has download button | Manual test |
| 7 | Preview modal has close button (X) and closes on Escape key | Manual test |
| 8 | For PDFs: Page navigation controls (prev/next, page number input) | Manual test |
| 9 | For PDFs: Zoom controls (zoom in, zoom out, fit to width) | Manual test |
| 10 | Modal is responsive and works on mobile | Manual test |

#### Technical Notes
- Use react-pdf or similar library for PDF preview
- Consider lazy loading for large PDFs

---

### DM-005: Delete Documents

**As a** benefits consultant  
**I want to** delete documents I no longer need  
**So that** the document library stays organized

**Priority:** P1 (Should Have)  
**Story Points:** 2

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Each document has delete option in actions menu | Manual test |
| 2 | Confirmation dialog: "Delete [filename]? This cannot be undone." | Manual test |
| 3 | Confirmation shows file details: name, size, upload date | Manual test |
| 4 | Delete button requires explicit click (not Enter key) | Manual test |
| 5 | Deleted document removed from list immediately | Manual test |
| 6 | Success toast: "Document deleted" | Manual test |
| 7 | Bulk delete available when multiple documents selected | Manual test |
| 8 | Bulk delete confirmation: "Delete [N] documents? This cannot be undone." | Manual test |
| 9 | Deleting document removes category assignment | Unit test |
| 10 | Deleting document removes policy links | Unit test |
| 11 | Document is removed from RAG index | Integration test |

#### Technical Notes
- Mutation: `documents.delete` (existing)
- Cascade delete to `documentCategories`

---

### DM-006: Rename Documents

**As a** benefits consultant  
**I want to** rename documents  
**So that** I can maintain consistent naming conventions

**Priority:** P2 (Nice to Have)  
**Story Points:** 2

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access rename via actions menu or by clicking filename | Manual test |
| 2 | Filename becomes editable inline | Manual test |
| 3 | File extension is shown but not editable | Manual test |
| 4 | Validation: filename cannot be empty | Unit test |
| 5 | Validation: filename cannot contain special characters (/, \, :, *, ?, ", <, >, |) | Unit test |
| 6 | Press Enter or click away to save | Manual test |
| 7 | Press Escape to cancel | Manual test |
| 8 | Original filename preserved in metadata | Unit test |
| 9 | Success toast: "Document renamed" | Manual test |

#### Technical Notes
- Mutation: `documents.rename`
- Store both `filename` (display) and `originalFilename` (metadata)

---

### DM-007: Change Document Category

**As a** benefits consultant  
**I want to** change a document's category  
**So that** I can fix miscategorized documents

**Priority:** P1 (Should Have)  
**Story Points:** 2

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Each document shows its current category | Manual test |
| 2 | User can change category via dropdown in document row | Manual test |
| 3 | Category dropdown shows all 6 category options | Manual test |
| 4 | Selecting new category saves immediately | Manual test |
| 5 | Document moves to new category list | Manual test |
| 6 | Success toast: "Document moved to [category]" | Manual test |
| 7 | Bulk category change available when multiple documents selected | Manual test |
| 8 | Bulk change shows: "Move [N] documents to [category dropdown]" | Manual test |

#### Technical Notes
- Mutation: `documentCategories.update`

---

### DM-008: Link Documents to Policies

**As a** benefits consultant  
**I want to** link documents to specific insurance policies  
**So that** I can easily find related documents when viewing a policy

**Priority:** P1 (Should Have)  
**Story Points:** 3

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Each document has "Link to Policy" option in actions menu | Manual test |
| 2 | Clicking opens modal with policy selector | Manual test |
| 3 | Policy selector shows all policies in current plan year | Manual test |
| 4 | Policies grouped by coverage type | Manual test |
| 5 | User can select multiple policies to link | Manual test |
| 6 | Currently linked policies are pre-selected | Manual test |
| 7 | User can unselect to remove links | Manual test |
| 8 | Save button updates links | Manual test |
| 9 | Linked policies shown as tags on document row | Manual test |
| 10 | Clicking policy tag navigates to that policy | Manual test |
| 11 | From policy detail view, linked documents are shown | Integration test |
| 12 | Links are bidirectional (document -> policy, policy -> documents) | Integration test |

#### Technical Notes
- Mutation: `documentCategories.updatePolicyLinks`
- Store `linkedPolicyIds` array in documentCategories table

---

## Retirement Plans

### RT-001: Add Retirement Plan

**As a** benefits consultant  
**I want to** add retirement plan information  
**So that** I have complete benefits data for the client

**Priority:** P1 (Should Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access Retirement Plans tab in Data Management | Manual test |
| 2 | "Add Retirement Plan" button visible in tab | Manual test |
| 3 | Clicking opens form panel | Manual test |
| 4 | Form fields include: | |
|   | - Plan Type (401k, 403b, Pension, Other) - Required | Manual test |
|   | - Plan Name - Required | Manual test |
|   | - Recordkeeper - Required | Manual test |
|   | - Match Formula (e.g., "100% up to 3%, 50% next 2%") - Optional | Manual test |
|   | - Vesting Schedule - Optional | Manual test |
|   | - Auto Enrollment - Boolean, Required | Manual test |
|   | - Auto Enrollment Rate - Percentage, Required if Auto Enrollment = Yes | Manual test |
| 5 | Additional details can be added in free-form notes field | Manual test |
| 6 | Form validates required fields | Unit test |
| 7 | On save, plan appears in Retirement Plans list | Integration test |
| 8 | Success toast: "Retirement plan added" | Manual test |

#### Technical Notes
- Mutation: `retirementPlans.create`
- Store additional details in `details` JSON field

---

### RT-002: View Retirement Plans

**As a** benefits consultant  
**I want to** view all retirement plans for a client  
**So that** I can review retirement benefits

**Priority:** P1 (Should Have)  
**Story Points:** 2

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Retirement Plans tab shows list of all plans for current plan year | Integration test |
| 2 | Each plan shows: Plan Type icon, Plan Name, Recordkeeper | Manual test |
| 3 | Match formula displayed if available | Manual test |
| 4 | Auto enrollment status shown as badge | Manual test |
| 5 | Click on plan opens detail view | Manual test |
| 6 | Empty state: "No retirement plans. Add your first plan." | Manual test |

#### Technical Notes
- Query: `retirementPlans.listByPlanYear`

---

### RT-003: Edit Retirement Plan

**As a** benefits consultant  
**I want to** edit retirement plan information  
**So that** I can keep details up to date

**Priority:** P1 (Should Have)  
**Story Points:** 3

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access edit via click on plan or edit icon | Manual test |
| 2 | Edit form pre-populated with existing data | Manual test |
| 3 | All fields editable | Manual test |
| 4 | Save updates the plan | Integration test |
| 5 | Success toast: "Retirement plan updated" | Manual test |
| 6 | Cancel returns to list without saving | Manual test |

#### Technical Notes
- Mutation: `retirementPlans.update`

---

### RT-004: Delete Retirement Plan

**As a** benefits consultant  
**I want to** delete a retirement plan  
**So that** I can remove incorrect entries

**Priority:** P2 (Nice to Have)  
**Story Points:** 2

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Delete option in actions menu | Manual test |
| 2 | Confirmation dialog required | Manual test |
| 3 | Hard delete (not soft delete) | Unit test |
| 4 | Success toast: "Retirement plan deleted" | Manual test |

#### Technical Notes
- Mutation: `retirementPlans.delete`

---

## PNC Policies

### PNC-001: Add PNC Policy

**As a** benefits consultant  
**I want to** add PNC (Property & Casualty) policy information  
**So that** I have complete coverage data for the client

**Priority:** P2 (Nice to Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access PNC Policies tab in Data Management | Manual test |
| 2 | "Add PNC Policy" button visible in tab | Manual test |
| 3 | Clicking opens form panel | Manual test |
| 4 | Form fields include: | |
|   | - Policy Type (General Liability, Property, Auto, Workers Comp, Umbrella, Other) - Required | Manual test |
|   | - Carrier - Required | Manual test |
|   | - Policy Number - Required | Manual test |
|   | - Effective Date - Required | Manual test |
|   | - Expiration Date - Optional | Manual test |
|   | - Premium (Annual) - Optional | Manual test |
|   | - Coverage Limits - Optional | Manual test |
|   | - Deductible - Optional | Manual test |
|   | - Notes - Optional | Manual test |
| 5 | Form validates required fields | Unit test |
| 6 | On save, policy appears in PNC Policies list | Integration test |
| 7 | Success toast: "PNC policy added" | Manual test |

#### Technical Notes
- New table: `pncPolicies`
- Mutation: `pncPolicies.create`

---

### PNC-002: View PNC Policies

**As a** benefits consultant  
**I want to** view all PNC policies for a client  
**So that** I can review property & casualty coverage

**Priority:** P2 (Nice to Have)  
**Story Points:** 2

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | PNC Policies tab shows table of all policies for current plan year | Integration test |
| 2 | Table columns: Policy Type, Carrier, Policy #, Status, Effective Date, Premium | Manual test |
| 3 | Table sortable by columns | Manual test |
| 4 | Click on row opens detail view | Manual test |
| 5 | Empty state: "No PNC policies. Add your first policy." | Manual test |

#### Technical Notes
- Query: `pncPolicies.listByPlanYear`

---

### PNC-003: Edit PNC Policy

**As a** benefits consultant  
**I want to** edit PNC policy information  
**So that** I can keep details up to date

**Priority:** P2 (Nice to Have)  
**Story Points:** 3

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | User can access edit via click on row or edit icon | Manual test |
| 2 | Edit form pre-populated with existing data | Manual test |
| 3 | All fields editable | Manual test |
| 4 | Save updates the policy | Integration test |
| 5 | Success toast: "PNC policy updated" | Manual test |

#### Technical Notes
- Mutation: `pncPolicies.update`

---

### PNC-004: Delete PNC Policy

**As a** benefits consultant  
**I want to** delete a PNC policy  
**So that** I can remove incorrect entries

**Priority:** P2 (Nice to Have)  
**Story Points:** 2

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Delete option in actions menu | Manual test |
| 2 | Confirmation dialog required | Manual test |
| 3 | Soft delete with undo option | Unit test |
| 4 | Success toast: "PNC policy deleted" with Undo | Manual test |

#### Technical Notes
- Mutation: `pncPolicies.softDelete`

---

## Cross-Cutting Concerns

### CC-001: Audit Logging

**As a** system administrator  
**I want** all data changes to be logged  
**So that** we have an audit trail for compliance

**Priority:** P1 (Should Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | All create, update, delete operations are logged | Integration test |
| 2 | Log entry includes: User, Action, Entity type, Entity ID, Timestamp | Unit test |
| 3 | For updates, log includes before and after values | Unit test |
| 4 | Logs are immutable (cannot be edited or deleted) | Unit test |
| 5 | Logs retained for minimum 7 years | Documentation |
| 6 | Admin users can view audit logs (future feature) | N/A - Future |

#### Technical Notes
- New table: `auditLogs`
- Create helper function to log all mutations

---

### CC-002: Data Export

**As a** benefits consultant  
**I want to** export policy data to Excel  
**So that** I can share data with clients or use in other tools

**Priority:** P1 (Should Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | "Export" button available in Insurance Policies tab | Manual test |
| 2 | Export options: Current view (filtered) or All policies | Manual test |
| 3 | Export format: Excel (.xlsx) | Unit test |
| 4 | Excel file includes all visible columns plus additional detail fields | Unit test |
| 5 | Coverage-specific fields in separate columns | Unit test |
| 6 | File named: "[ClientName]_Policies_[PlanYear]_[Date].xlsx" | Unit test |
| 7 | Export triggers browser download | Manual test |
| 8 | Large exports (100+ rows) show progress indicator | Manual test |

#### Technical Notes
- Use xlsx library for Excel generation
- Generate on server to handle large datasets

---

### CC-003: Search Across All Data

**As a** benefits consultant  
**I want to** search across all data management content  
**So that** I can quickly find what I need

**Priority:** P2 (Nice to Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Global search box at top of Data Management page | Manual test |
| 2 | Search queries policies, documents, retirement plans, PNC policies | Integration test |
| 3 | Results grouped by type | Manual test |
| 4 | Each result shows: Type icon, Name/Title, Key details, Plan year | Manual test |
| 5 | Clicking result navigates to that item | Manual test |
| 6 | Search is fast (< 500ms for typical queries) | Performance test |
| 7 | Minimum 2 characters to trigger search | Unit test |
| 8 | Recent searches shown when search box focused | Manual test |

#### Technical Notes
- Use existing Convex search infrastructure
- Consider search index optimization

---

### CC-004: Keyboard Shortcuts

**As a** power user  
**I want to** use keyboard shortcuts  
**So that** I can work more efficiently

**Priority:** P2 (Nice to Have)  
**Story Points:** 3

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | `n` - New policy (when in policies tab) | Manual test |
| 2 | `e` - Edit selected policy | Manual test |
| 3 | `d` - Delete selected policy (with confirmation) | Manual test |
| 4 | `c` - Copy selected policy | Manual test |
| 5 | `/` - Focus search box | Manual test |
| 6 | `Escape` - Close modal/panel | Manual test |
| 7 | `?` - Show keyboard shortcuts help | Manual test |
| 8 | Shortcuts disabled when in input fields | Unit test |
| 9 | Shortcuts can be viewed via help menu | Manual test |

#### Technical Notes
- Use react-hotkeys-hook or similar library
- Ensure no conflicts with browser shortcuts

---

### CC-005: Mobile Responsiveness

**As a** benefits consultant  
**I want to** access Data Management on mobile devices  
**So that** I can check data on the go

**Priority:** P2 (Nice to Have)  
**Story Points:** 5

#### Acceptance Criteria

| # | Criteria | Verification |
|---|----------|--------------|
| 1 | Page renders correctly on mobile (320px - 768px) | Manual test |
| 2 | Policy table converts to card view on mobile | Manual test |
| 3 | Each card shows key policy info | Manual test |
| 4 | Touch-friendly tap targets (minimum 44px) | Accessibility test |
| 5 | Forms are usable on mobile | Manual test |
| 6 | Document upload works on mobile (camera + files) | Manual test |
| 7 | Navigation is accessible via hamburger menu | Manual test |

#### Technical Notes
- Use Tailwind responsive classes
- Test on iOS Safari and Android Chrome

---

## Appendix: Priority Legend

| Priority | Description | Timeline |
|----------|-------------|----------|
| P0 | Must Have | MVP (v1.0) |
| P1 | Should Have | MVP or v1.1 |
| P2 | Nice to Have | v1.1 or later |
| P3 | Future | v2.0+ |

## Appendix: Story Point Reference

| Points | Effort | Example |
|--------|--------|---------|
| 1 | Trivial | Copy change, simple UI tweak |
| 2 | Small | Simple form, basic CRUD |
| 3 | Medium | Form with validation, filtered list |
| 5 | Large | Complex form, multi-step wizard |
| 8 | X-Large | Major feature, multiple components |
| 13 | Epic | Should be broken down further |
