import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { ValidationResult } from "../domain/distribution-engine.types";

export interface PreviewValidationWarningProps {
  validation: ValidationResult;
}

export function PreviewValidationWarning({
  validation,
}: PreviewValidationWarningProps) {
  if (validation.valid && validation.warnings.length === 0) {
    return null;
  }

  return (
    <Card
      className={
        validation.valid
          ? "border-primary-500 bg-primary-50"
          : "border-accent-500 bg-accent-50"
      }
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" />
          {validation.valid ? "Configuration Warning" : "Configuration Error"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {validation.errors.map((error, index) => (
            <div key={`error-${index}`} className="text-sm text-red-700">
              • {error}
            </div>
          ))}
          {validation.warnings.map((warning, index) => (
            <div key={`warning-${index}`} className="text-sm text-yellow-700">
              • {warning}
            </div>
          ))}
          {validation.suggestions && validation.suggestions.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <div className="font-medium text-sm mb-1">Suggestions:</div>
              {validation.suggestions.map((suggestion, index) => (
                <div key={`suggestion-${index}`} className="text-sm">
                  • {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
