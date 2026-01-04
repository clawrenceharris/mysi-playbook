import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import { Clock, Layers } from "lucide-react";
import { ActivityTemplate } from "@/features/playground/domain/built-in-templates";

export interface ActivityTemplateSelectorProps {
  isOpen: boolean;
  templates: ActivityTemplate[];
  onTemplateSelect: (template: ActivityTemplate) => void;
  onClose: () => void;
}

export function ActivityTemplateSelector({
  isOpen,
  templates,
  onTemplateSelect,
  onClose,
}: ActivityTemplateSelectorProps) {
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
          <DialogTitle>Choose an Activity Template</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Templates Grid */}
          <div className="overflow-y-auto max-h-96">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity templates available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 p-3 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer shadow-none hover:shadow-md transition-shadow"
                    onClick={() => onTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {template.title}
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
                          <Layers className="w-4 h-4" />
                          {template.slides.length} slides
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(template.metadata.estimatedDuration)}
                        </div>
                      </div>
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
