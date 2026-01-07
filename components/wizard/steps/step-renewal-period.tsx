"use client";

import { Calendar, Lightbulb } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { WizardStep } from "@/components/wizard/wizard-step";

interface StepRenewalPeriodProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onBack: () => void;
  onContinue: () => void;
  clientName?: string | null;
  suggestedDate?: Date;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export function StepRenewalPeriod({
  selectedDate,
  onSelectDate,
  onBack,
  onContinue,
  clientName,
  suggestedDate,
}: StepRenewalPeriodProps) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2];

  const selectedMonth =
    selectedDate?.getMonth() ?? suggestedDate?.getMonth() ?? 0;
  const selectedDay = selectedDate?.getDate() ?? suggestedDate?.getDate() ?? 1;
  const selectedYear =
    selectedDate?.getFullYear() ??
    suggestedDate?.getFullYear() ??
    currentYear + 1;

  // Initialize with suggested date if no date selected
  useMemo(() => {
    if (!selectedDate && suggestedDate) {
      onSelectDate(suggestedDate);
    }
  }, [selectedDate, suggestedDate, onSelectDate]);

  const handleChange = (month: number, day: number, year: number) => {
    const date = new Date(year, month, day);
    onSelectDate(date);
  };

  return (
    <>
      <WizardStep
        clientName={clientName}
        description="This helps us identify the right comparison periods and highlight time-sensitive decisions."
        stepId="renewal-period"
        title="When is this renewal effective?"
      >
        {/* Date selectors */}
        <div className="mb-6">
          <label className="mb-2 block font-medium text-sm">
            Renewal Effective Date
          </label>
          <div className="flex flex-wrap gap-3">
            {/* Month */}
            <select
              className="h-12 rounded-xl border border-border bg-background px-4 text-base shadow-sm outline-none transition-all hover:border-muted-foreground/30 focus-visible:border-blue-lightest focus-visible:ring-2 focus-visible:ring-blue-lightest/20"
              onChange={(e) =>
                handleChange(Number(e.target.value), selectedDay, selectedYear)
              }
              value={selectedMonth}
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>

            {/* Day */}
            <select
              className="h-12 rounded-xl border border-border bg-background px-4 text-base shadow-sm outline-none transition-all hover:border-muted-foreground/30 focus-visible:border-blue-lightest focus-visible:ring-2 focus-visible:ring-blue-lightest/20"
              onChange={(e) =>
                handleChange(
                  selectedMonth,
                  Number(e.target.value),
                  selectedYear
                )
              }
              value={selectedDay}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            {/* Year */}
            <select
              className="h-12 rounded-xl border border-border bg-background px-4 text-base shadow-sm outline-none transition-all hover:border-muted-foreground/30 focus-visible:border-blue-lightest focus-visible:ring-2 focus-visible:ring-blue-lightest/20"
              onChange={(e) =>
                handleChange(selectedMonth, selectedDay, Number(e.target.value))
              }
              value={selectedYear}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tip */}
        {suggestedDate && (
          <Card className="bg-primary/5">
            <CardContent className="flex items-start gap-3 pt-4">
              <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-sm">Tip</p>
                <p className="text-muted-foreground text-sm">
                  Based on {clientName ? `${clientName}'s` : "this client's"}{" "}
                  history, their renewal typically falls on{" "}
                  {MONTHS[suggestedDate.getMonth()]} {suggestedDate.getDate()}.
                  We've pre-filled this for you.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar icon visual */}
        <div className="mt-8 flex justify-center">
          <div className="flex size-24 items-center justify-center rounded-2xl bg-muted">
            <Calendar className="size-12 text-muted-foreground" />
          </div>
        </div>
      </WizardStep>

      <WizardNavigation
        canContinue={selectedDate !== null}
        onBack={onBack}
        onContinue={onContinue}
      />
    </>
  );
}
