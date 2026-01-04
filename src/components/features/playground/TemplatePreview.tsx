import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import { Clock, Tag, Layers, Hash } from "lucide-react";
import {
  SlideTemplate,
  SlideTemplateCategory,
} from "@/features/playground/domain/slide-templates";
import { blockTypeLabels } from "@/features/playground";

export interface TemplatePreviewProps {
  template: SlideTemplate;
}

const categoryLabels: Record<SlideTemplateCategory, string> = {
  content: "Content",
  interaction: "Interaction",
  assessment: "Assessment",
  engagement: "Engagement",
  custom: "Custom",
};

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  // Extract placeholders from template blocks
  const placeholders = useMemo(() => {
    const placeholderSet = new Set<string>();

    template.blocks.forEach((block) => {
      Object.values(block.config).forEach((value) => {
        if (typeof value === "string") {
          const matches = value.match(/\{\{(\w+)\}\}/g);
          if (matches) {
            matches.forEach((match) => {
              const placeholder = match.replace(/[{}]/g, "");
              placeholderSet.add(placeholder);
            });
          }
        }
      });
    });

    return Array.from(placeholderSet);
  }, [template.blocks]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{template.name}</h3>
          <p className="text-muted-foreground mt-1">{template.description}</p>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {formatDuration(template.metadata.estimatedDuration)}
            </div>

            <Badge variant="outline">{categoryLabels[template.category]}</Badge>
          </div>
        </div>
      </div>

      {/* Template Structure */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Template Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-3">
              {template.blocks.length} blocks
            </div>
            {template.blocks.map((block, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <span>{blockTypeLabels[block.type] || block.type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Placeholders */}
      {placeholders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Placeholders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder) => (
                <Badge key={placeholder} variant="outline" className="text-xs">
                  {placeholder}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {template.metadata.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {template.metadata.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
