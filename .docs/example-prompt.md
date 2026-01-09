Here's what the complete prompt looks like when a user selects:
- Audience: C-Suite Executives
- Priorities: Cost Management, Coverage Quality
- Presentation Depth: 75 (focused)
- Strategy Ideas: "Consider HDHPs with HSA contributions"

You are creating a presentation canvas for a benefits consultant meeting with their client.

## Document Analysis


## Target Audience: C-Suite Executives
You are presenting to C-Suite executives (CEO, CFO, COO) at Acme Corporation.

## Executive Priorities
- Focus on strategic implications and ROI
- Present high-level financial summaries with clear bottom-line impact
- Emphasize competitive positioning and enterprise risk management
- Keep technical details minimal - use business language
- Highlight decision points requiring executive action

## Communication Style
- Lead with key takeaways and recommendations
- Use data visualizations that tell a clear story at a glance
- Be concise - executive time is limited
- Connect benefits decisions to broader business outcomes
- Frame options in terms of strategic trade-offs
- Include competitive benchmarking context

## Client Priorities

### Priority: Cost Management
Given the client's emphasis on cost management for the 1/1/2025 renewal:

## Cost Analysis Focus
- Analyze all cost drivers and their relative impact on total spend
- Identify specific opportunities for premium reduction or containment
- Compare current costs against benchmarks (expected increase: 8.5%)
- Present cost-saving strategies with projected savings by option
- Model different contribution and plan design scenarios

## Key Deliverables
- Cost driver breakdown showing largest contributors
- Savings opportunities ranked by impact and feasibility
- Contribution strategy alternatives with employee impact
- Plan design changes that reduce costs without major disruption
- Multi-year cost projections under different scenarios

### Priority: Coverage Quality
Given the client's priority on maintaining coverage quality for the 1/1/2025 renewal:

## Coverage Analysis Focus
- Evaluate current benefit richness against market standards
- Identify areas where coverage can be preserved or enhanced
- Analyze network adequacy and provider access
- Assess prescription drug formulary and specialty coverage
- Review out-of-pocket maximums and cost-sharing structures

## Key Deliverables
- Coverage comparison showing current vs. proposed benefits
- Network analysis with provider access metrics
- Formulary review highlighting any changes
- Member impact analysis by coverage category
- Recommendations for maintaining value while managing costs

## Presentation Style
Create a focused and concise presentation (depth setting: 75/100).

## Consultant's Strategy Ideas
The consultant has shared these strategic ideas to consider:
Consider HDHPs with HSA contributions

## Renewal Benchmarks
- Expected increase: 8.5%
- Budget comparison: Slightly exceeds budget
- National average increase: 7.2%

## Your Task
Create a canvas structure that:
1. Addresses the most important topics found in the documents
2. Is tailored to the target audience's needs and communication style
3. Emphasizes the client's stated priorities
4. Presents data in a compelling, actionable way
5. Tells a coherent story across sections
6. Includes visualizations where data supports them

## Document Analysis Data
The following is the structured analysis of the uploaded documents:

{ ... JSON document analysis data ... }

## Guidelines
- Generate 3-10 sections based on content richness
- Section titles should be specific and descriptive (not generic like "Overview")
- Each section should have a clear purpose
- Don't force visualizations - only suggest them when data supports it
- Include an executive summary if there's enough content
- Be creative - if the data supports a unique insight, create a section for it

## Section IDs
Generate unique IDs for each section using format "section-{number}" (e.g., "section-1", "section-2")

The prompt is built in two stages:
1. Frontend (lib/prompt-builder.ts): Builds the context-specific parts from markdown templates
2. Convex (convex/canvasPlanning.ts): Adds the document analysis data and generation guidelines
