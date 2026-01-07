"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  StepCanvasType,
  StepClientSelect,
  StepDocumentUpload,
  StepOptionalDocs,
  StepProcessing,
  StepRenewalPeriod,
  StepReview,
  StepSuccess,
  StepWelcome,
  WizardLayout,
} from "@/components/wizard";
import { useWizardState } from "@/hooks/use-wizard-state";
import type { DocumentCategory, WizardDocument } from "@/lib/wizard-types";

// Mock clients data
const MOCK_CLIENTS = [
  {
    id: "client-1",
    name: "Acme Corporation",
    industry: "Technology",
    location: "San Francisco",
    employeeCount: 250,
    lastCanvasDate: "Dec 1, 2024",
  },
  {
    id: "client-2",
    name: "TechStart Inc.",
    industry: "SaaS",
    location: "Austin",
    employeeCount: 85,
    lastCanvasDate: "Nov 15, 2024",
  },
  {
    id: "client-3",
    name: "Global Manufacturing Co.",
    industry: "Manufacturing",
    location: "Chicago",
    employeeCount: 1200,
  },
];

// Processing phases
type ProcessingStatus = "pending" | "in_progress" | "completed";
type ProcessingPhase = { id: string; label: string; status: ProcessingStatus };

const PROCESSING_PHASES: ProcessingPhase[] = [
  {
    id: "reading",
    label: "Reading your documents",
    status: "pending",
  },
  {
    id: "understanding",
    label: "Understanding plan designs",
    status: "pending",
  },
  {
    id: "analyzing",
    label: "Analyzing claims trends",
    status: "pending",
  },
  {
    id: "calculating",
    label: "Calculating cost impacts",
    status: "pending",
  },
  {
    id: "building",
    label: "Building presentation",
    status: "pending",
  },
  {
    id: "compliance",
    label: "Running compliance checks",
    status: "pending",
  },
];

export default function NewCanvasWizardPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const wizard = useWizardState();
  const [processingPhases, setProcessingPhases] = useState(PROCESSING_PHASES);
  const [generatedCanvasId] = useState("canvas-new-1");

  // Simulate processing
  useEffect(() => {
    if (wizard.state.currentStepId !== "processing") return;

    const phaseThresholds = [15, 30, 50, 70, 85, 100];
    let progress = 0;
    let currentPhase = 0;

    const phases = [...PROCESSING_PHASES];
    phases[0] = { ...phases[0], status: "in_progress" };
    setProcessingPhases([...phases]);

    const interval = setInterval(() => {
      progress += 2;
      wizard.updateGenerationProgress(progress, phases[currentPhase].label);

      const threshold = phaseThresholds[currentPhase];
      if (progress >= threshold && currentPhase < phases.length) {
        phases[currentPhase] = { ...phases[currentPhase], status: "completed" };
        if (currentPhase < phases.length - 1) {
          phases[currentPhase + 1] = {
            ...phases[currentPhase + 1],
            status: "in_progress",
          };
        }
        currentPhase++;
        setProcessingPhases([...phases]);

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            wizard.completeGeneration();
          }, 500);
        }
      }
    }, 80);

    return () => clearInterval(interval);
  }, [wizard.state.currentStepId, wizard]);

  // Handle client selection
  const handleSelectClient = useCallback(
    (client: {
      id: string;
      name: string;
      industry?: string;
      location?: string;
      employeeCount?: number;
    }) => {
      wizard.setClient({
        id: client.id,
        name: client.name,
        industry: client.industry,
        location: client.location,
        employeeCount: client.employeeCount,
      });
    },
    [wizard]
  );

  // Handle document operations
  const handleAddDocuments = useCallback(
    (category: DocumentCategory, docs: WizardDocument[]) => {
      wizard.addDocuments(category, docs);
    },
    [wizard]
  );

  const handleRemoveDocument = useCallback(
    (category: DocumentCategory, docId: string) => {
      wizard.removeDocument(category, docId);
    },
    [wizard]
  );

  // Handle edit from review
  const handleEditStep = useCallback(
    (step: "client" | "renewal-period" | "canvas-type" | "documents") => {
      const stepMap = {
        client: "client",
        "renewal-period": "renewal-period",
        "canvas-type": "canvas-type",
        documents: "current-plans",
      } as const;
      wizard.goToStep(stepMap[step]);
    },
    [wizard]
  );

  // Render current step
  const renderStep = () => {
    switch (wizard.state.currentStepId) {
      case "welcome":
        return <StepWelcome onGetStarted={wizard.goToNextStep} />;

      case "client":
        return (
          <StepClientSelect
            clients={MOCK_CLIENTS}
            onBack={wizard.goToPreviousStep}
            onContinue={wizard.goToNextStep}
            onSelectClient={handleSelectClient}
            selectedClientId={wizard.state.clientId}
          />
        );

      case "renewal-period":
        return (
          <StepRenewalPeriod
            clientName={wizard.state.clientName}
            onBack={wizard.goToPreviousStep}
            onContinue={wizard.goToNextStep}
            onSelectDate={wizard.setRenewalDate}
            selectedDate={wizard.state.renewalDate}
            suggestedDate={new Date(2025, 0, 1)} // Jan 1, 2025
          />
        );

      case "canvas-type":
        return (
          <StepCanvasType
            clientName={wizard.state.clientName}
            onBack={wizard.goToPreviousStep}
            onContinue={wizard.goToNextStep}
            onSelectType={wizard.setCanvasType}
            selectedType={wizard.state.canvasType}
          />
        );

      case "current-plans":
        return (
          <StepDocumentUpload
            category="currentPlans"
            clientName={wizard.state.clientName}
            description="These help us understand what benefits are currently in place."
            documents={wizard.state.documents.currentPlans}
            hint={{
              title: "What to include",
              items: [
                "Summary Plan Descriptions (SPDs)",
                "Benefit comparison grids or summaries",
                "Plan design documents",
              ],
            }}
            libraryDocumentCount={12}
            onAddDocuments={(docs) => handleAddDocuments("currentPlans", docs)}
            onBack={wizard.goToPreviousStep}
            onContinue={wizard.goToNextStep}
            onRemoveDocument={(id) => handleRemoveDocument("currentPlans", id)}
            stepId="current-plans"
            title="Let's start with your current plan documents"
          />
        );

      case "financial":
        return (
          <StepDocumentUpload
            category="financial"
            clientName={wizard.state.clientName}
            description="This is the heart of your analysis — claims, costs, and premiums."
            documents={wizard.state.documents.financial}
            hint={{
              title: "What to include",
              items: [
                "Claims experience reports (12-24 months ideal)",
                "Large claimant / shock loss reports",
                "Current premium rate sheets",
                "Stop-loss policy details",
              ],
            }}
            libraryDocumentCount={8}
            onAddDocuments={(docs) => handleAddDocuments("financial", docs)}
            onBack={wizard.goToPreviousStep}
            onContinue={wizard.goToNextStep}
            onRemoveDocument={(id) => handleRemoveDocument("financial", id)}
            recommendation={{
              type: "Large Claimant Report",
              description:
                "For a complete analysis, consider adding a large claimant report. This helps identify cost drivers and risk factors.",
            }}
            stepId="financial"
            title="Now let's add financial data"
          />
        );

      case "renewal-package":
        return (
          <StepDocumentUpload
            category="renewal"
            clientName={wizard.state.clientName}
            description="Upload the carrier's proposed rates and justification materials."
            documents={wizard.state.documents.renewal}
            hint={{
              title: "What to include",
              items: [
                "Proposed rates from carrier",
                "Rate justification / actuarial memo",
                "Trend assumptions",
                "Plan design options or alternatives",
              ],
            }}
            isOptional
            onAddDocuments={(docs) => handleAddDocuments("renewal", docs)}
            onBack={wizard.goToPreviousStep}
            onContinue={wizard.goToNextStep}
            onRemoveDocument={(id) => handleRemoveDocument("renewal", id)}
            onSkip={wizard.skipCurrentStep}
            stepId="renewal-package"
            title="Do you have the carrier's renewal package?"
          />
        );

      case "census":
        return (
          <StepDocumentUpload
            category="census"
            clientName={wizard.state.clientName}
            description="This helps us analyze demographics and enrollment patterns."
            documents={wizard.state.documents.census}
            hint={{
              title: "Ideal census includes",
              items: [
                "Age, gender, zip code",
                "Coverage tier (EE, ES, EC, FAM)",
                "Plan elections",
                "Salary (if available)",
              ],
            }}
            libraryDocumentCount={3}
            onAddDocuments={(docs) => handleAddDocuments("census", docs)}
            onBack={wizard.goToPreviousStep}
            onContinue={wizard.goToNextStep}
            onRemoveDocument={(id) => handleRemoveDocument("census", id)}
            stepId="census"
            title="Employee census data"
          />
        );

      case "optional-docs":
        return (
          <StepOptionalDocs
            clientName={wizard.state.clientName}
            documents={wizard.state.documents}
            onAddDocuments={handleAddDocuments}
            onBack={wizard.goToPreviousStep}
            onContinue={wizard.goToNextStep}
            onRemoveDocument={handleRemoveDocument}
          />
        );

      case "review":
        return (
          <StepReview
            canvasType={wizard.state.canvasType}
            clientEmployeeCount={wizard.state.clientEmployeeCount}
            clientIndustry={wizard.state.clientIndustry}
            clientLocation={wizard.state.clientLocation}
            clientName={wizard.state.clientName}
            documents={wizard.state.documents}
            missingRecommendations={
              wizard.state.documents.financial.length > 0 &&
              !wizard.state.documents.financial.some((d) =>
                d.name.toLowerCase().includes("claimant")
              )
                ? ["a large claimant report"]
                : []
            }
            onBack={wizard.goToPreviousStep}
            onEditStep={handleEditStep}
            onGenerate={wizard.startGeneration}
            renewalDate={wizard.state.renewalDate}
          />
        );

      case "processing":
        return (
          <StepProcessing
            phases={processingPhases}
            progress={wizard.state.generationProgress}
          />
        );

      case "success":
        return (
          <StepSuccess
            alertCount={2}
            canvasId={generatedCanvasId}
            canvasTitle={`${wizard.state.clientName} - ${wizard.state.renewalDate?.getFullYear()} Renewal`}
            clientId={clientId}
            onExport={() => {
              // TODO: Export to PowerPoint
              console.log("Export to PowerPoint");
            }}
            onViewCanvas={() => {
              router.push(`/clients/${clientId}/canvas/${generatedCanvasId}`);
            }}
            recommendationCount={3}
            slideCount={10}
          />
        );

      default:
        return null;
    }
  };

  return (
    <WizardLayout clientId={clientId} wizard={wizard}>
      {renderStep()}
    </WizardLayout>
  );
}
