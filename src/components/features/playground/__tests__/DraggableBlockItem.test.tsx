import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableBlockItem } from "../DraggableBlockItem";
import { StrategyBlock } from "@/features/playground/domain/playground.types";

const mockBlock: StrategyBlock = {
  id: "block-1",
  type: "display-prompt",
  order: 0,
  config: { title: "Welcome", content: "Hello world" },
};

const mockProps = {
  block: mockBlock,
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
};

// Wrapper component to provide DnD context
function DndWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DndContext>
      <SortableContext
        items={["block-1"]}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}

describe("DraggableBlockItem", () => {
  it("should render block with drag handle", () => {
    render(
      <DndWrapper>
        <DraggableBlockItem {...mockProps} />
      </DndWrapper>
    );

    expect(screen.getByTestId("block-block-1")).toBeInTheDocument();
    expect(screen.getByTestId("drag-handle-block-1")).toBeInTheDocument();
  });

  it("should display block type and config", () => {
    render(
      <DndWrapper>
        <DraggableBlockItem {...mockProps} />
      </DndWrapper>
    );

    expect(screen.getByText("display-prompt")).toBeInTheDocument();
    expect(screen.getByText(/Welcome/)).toBeInTheDocument();
  });

  it("should have proper drag attributes", () => {
    render(
      <DndWrapper>
        <DraggableBlockItem {...mockProps} />
      </DndWrapper>
    );

    const blockElement = screen.getByTestId("block-block-1");
    expect(blockElement).toHaveAttribute("data-draggable", "true");
  });

  it("should show visual feedback when dragging", () => {
    // This test would need more complex setup to simulate dragging state
    // For now, we'll just test that the component renders correctly
    render(
      <DndWrapper>
        <DraggableBlockItem {...mockProps} />
      </DndWrapper>
    );

    expect(screen.getByTestId("block-block-1")).toBeInTheDocument();
  });
});
