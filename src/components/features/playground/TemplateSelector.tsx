import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import { Clock, Tag } from "lucide-react";
import {
  SlideTemplate,
  SlideTemplateCategory,
} from "@/features/playground/domain/slide-templates";

export interface TemplateSelectorProps {
  isOpen: boolean;
  templates: SlideTemplate[];
  onTemplateSelect: (template: SlideTemplate) => void;
  onClose: () => void;
}

const categoryLabels: Record<SlideTemplateCategory, string> = {
  content: "Content",
  interaction: "Interaction",
  assessment: "Assessment",
  engagement: "Engagement",
  custom: "Custom",
};

export function TemplateSelector({
  isOpen,
  templates,
  onTemplateSelect,
  onClose,
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    SlideTemplateCategory | "all"
  >("all");

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(templates.map((t) => t.category))
    );
    return uniqueCategories;
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") {
      return templates;
    }
    return templates.filter(
      (template) => template.category === selectedCategory
    );
  }, [templates, selectedCategory]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {categoryLabels[category]}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="overflow-y-auto max-h-96">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No templates available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(template.metadata.estimatedDuration)}
                        </div>
                      </div>

                      {template.metadata.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          {template.metadata.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
