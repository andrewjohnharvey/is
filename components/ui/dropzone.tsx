"use client";

import { Upload } from "lucide-react";
import type * as React from "react";
import { useCallback, useRef, useState } from "react";
import {
  FILE_VALIDATION,
  getAcceptAttribute,
  getAllowedFileTypesLabel,
} from "@/lib/file-validation";
import { cn } from "@/lib/utils";

type DropzoneProps = {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  currentFileCount?: number;
  className?: string;
};

export function Dropzone({
  onFilesSelected,
  disabled = false,
  maxFiles = FILE_VALIDATION.maxFiles,
  currentFileCount = 0,
  className,
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = maxFiles - currentFileCount;
  const isAtLimit = remainingSlots <= 0;

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!(disabled || isAtLimit)) {
        setIsDragOver(true);
      }
    },
    [disabled, isAtLimit]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled || isAtLimit) {
        return;
      }

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [disabled, isAtLimit, onFilesSelected]
  );

  const handleClick = useCallback(() => {
    if (!(disabled || isAtLimit)) {
      inputRef.current?.click();
    }
  }, [disabled, isAtLimit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.key === "Enter" || e.key === " ") && !disabled && !isAtLimit) {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled, isAtLimit]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) {
        onFilesSelected(files);
      }
      // Reset the input so the same file can be selected again
      e.target.value = "";
    },
    [onFilesSelected]
  );

  return (
    // biome-ignore lint/a11y/useSemanticElements: Using div for drag-and-drop support which requires onDragOver/onDrop handlers
    <div
      aria-disabled={disabled || isAtLimit}
      aria-label="Upload files by dragging and dropping or clicking to browse"
      className={cn(
        "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200",
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        (disabled || isAtLimit) === true &&
          "cursor-not-allowed opacity-50 hover:border-border hover:bg-transparent",
        className
      )}
      onClick={handleClick}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled || isAtLimit ? -1 : 0}
    >
      <input
        accept={getAcceptAttribute()}
        className="hidden"
        disabled={disabled || isAtLimit}
        multiple
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />

      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-full transition-colors",
            isDragOver
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Upload className="size-6" />
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {isDragOver ? "Drop files here" : "Drag and drop files here"}
          </p>
          <p className="text-muted-foreground text-sm">or click to browse</p>
        </div>

        <p className="text-muted-foreground text-xs">
          {getAllowedFileTypesLabel()} up to 50MB
        </p>

        {isAtLimit ? (
          <p className="font-medium text-destructive text-sm">
            Maximum {maxFiles} files reached
          </p>
        ) : null}
      </div>
    </div>
  );
}
