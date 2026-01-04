import React from "react";
import { Button } from "@/components/ui";

export interface PaletteBlockItemProps {
  title: string;
  description: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function PaletteBlockItem({
  title,
  onClick,
  icon: Icon,
}: PaletteBlockItemProps) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      data-testid="palette-block-item"
      className="hover:bg-muted w-full justify-start rounded-lg"
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary-500" />}
        <div className="text-sm font-medium">{title}</div>
      </div>
    </Button>
  );
}
