/**
 * File validation constants and utilities for document uploads.
 */

export const FILE_VALIDATION = {
  maxSize: 50 * 1024 * 1024, // 50MB in bytes
  maxFiles: 20,
  allowedTypes: {
    "application/pdf": { ext: "pdf", label: "PDF" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      ext: "docx",
      label: "DOCX",
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      ext: "xlsx",
      label: "XLSX",
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      {
        ext: "pptx",
        label: "PPTX",
      },
  },
} as const;

export type AllowedMimeType = keyof typeof FILE_VALIDATION.allowedTypes;

/**
 * Format file size in human-readable format.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if a MIME type is allowed.
 */
export function isAllowedFileType(
  mimeType: string
): mimeType is AllowedMimeType {
  return mimeType in FILE_VALIDATION.allowedTypes;
}

/**
 * Get the file type info for a MIME type.
 */
export function getFileTypeInfo(
  mimeType: string
): { ext: string; label: string } | null {
  if (isAllowedFileType(mimeType)) {
    return FILE_VALIDATION.allowedTypes[mimeType];
  }
  return null;
}

/**
 * Validate a single file.
 * Returns an object with validation result and optional error message.
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > FILE_VALIDATION.maxSize) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds the 50MB limit`,
    };
  }

  if (!isAllowedFileType(file.type)) {
    return {
      valid: false,
      error: `File "${file.name}" has an unsupported type. Use PDF, DOCX, XLSX, or PPTX`,
    };
  }

  return { valid: true };
}

/**
 * Validate multiple files including count limit.
 * Returns arrays of valid files and errors.
 */
export function validateFiles(
  files: File[],
  currentCount: number
): {
  validFiles: File[];
  errors: string[];
} {
  const validFiles: File[] = [];
  const errors: string[] = [];

  const remainingSlots = FILE_VALIDATION.maxFiles - currentCount;

  // Only validate up to the remaining slots
  let filesToValidate = files;
  if (files.length > remainingSlots) {
    errors.push(
      `Maximum ${FILE_VALIDATION.maxFiles} files allowed. You can only add ${remainingSlots} more file${remainingSlots === 1 ? "" : "s"}.`
    );
    filesToValidate = files.slice(0, remainingSlots);
  }

  for (const file of filesToValidate) {
    const result = validateFile(file);
    if (result.valid) {
      validFiles.push(file);
    } else if (result.error) {
      errors.push(result.error);
    }
  }

  return { validFiles, errors };
}

/**
 * Get a readable list of allowed file types.
 */
export function getAllowedFileTypesLabel(): string {
  return Object.values(FILE_VALIDATION.allowedTypes)
    .map((t) => t.label)
    .join(", ");
}

/**
 * Get the accept attribute string for file inputs.
 */
export function getAcceptAttribute(): string {
  return Object.keys(FILE_VALIDATION.allowedTypes).join(",");
}
