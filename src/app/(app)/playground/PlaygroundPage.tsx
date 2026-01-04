"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlideSequenceSidebar,
  SlideEditor,
  ContextualToolbar,
  ActivityTemplateSelector,
  PlaygroundMenubar,
} from "@/components/features/playground";
import { RoleGuard } from "@/components/features/auth";
import { ErrorState } from "@/components/states";
import {
  StrategyBlock,
  ImprovedStrategy,
  BlockType,
  SlideType,
  ActivityTemplate,
  getBuiltInActivityTemplates,
  createStrategyFromTemplate,
} from "@/features/playground";

import { usePlayground } from "@/providers";
import { ActivityPreview } from "@/features/playground/compiler";
import { PlaybookStrategies } from "@/types/tables";

export default function PlaygroundPage() {
  const searchParams = useSearchParams();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isActivityTemplateOpen, setIsActivityTemplateOpen] = useState(false);
  const activityTemplates = useMemo(() => getBuiltInActivityTemplates(), []);
  const {
    slides,

    currentSlideId,
    selectedSlide,
    navigationState,
    addSlide,
    updateSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlide,
    selectSlide,
    navigateToNext,
    navigateToPrevious,
    addBlockToSlide,
    updateBlockInSlide,
    deleteBlockFromSlide,
    reorderBlockInSlide,
    loadStrategy,
    title,
    selectBlock,
  } = usePlayground();

  // Create activity object for preview
  const currentStrategy: ImprovedStrategy = useMemo(
    () => ({
      id: "preview-strategy",
      title,
      slides,
      slug: "preview-slug",
      settings: {
        allowParticipantNavigation: false,
        showProgress: true,
        autoSave: false,
      },
      metadata: {
        phase: "warmup",
        participantCount: 30,
      },
    }),
    [slides, title]
  );

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const slideParam = searchParams.get("slide");
      if (slideParam && slideParam !== currentSlideId) {
        selectSlide(slideParam);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [searchParams, currentSlideId, selectSlide]);

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Right Arrow: Next slide
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "ArrowRight" &&
        navigationState.canGoForward
      ) {
        event.preventDefault();
        navigateToNext();
      }

      // Ctrl/Cmd + Left Arrow: Previous slide
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "ArrowLeft" &&
        navigationState.canGoBack
      ) {
        event.preventDefault();
        navigateToPrevious();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigationState, navigateToNext, navigateToPrevious]);

  // Handle slide operations
  const handleSlideSelect = (slideId: string) => {
    selectSlide(slideId);
  };

  const handleSlideAdd = (afterSlideId?: string) => {
    addSlide("New Slide", SlideType.CONTENT, afterSlideId);
  };

  const handleSlideDelete = (slideId: string) => {
    deleteSlide(slideId);
    const prevSlideIndex =
      slides.indexOf(slides.find((s) => s.id === slideId)!) - 1;
    const prevSlide = slides.at(prevSlideIndex);
    if (prevSlide) {
      selectSlide(prevSlide.id);
    }
  };

  const handleSlideReorder = (slideId: string, newIndex: number) => {
    reorderSlide(slideId, newIndex);
  };

  const handleSlideDuplicate = (slideId: string) => {
    duplicateSlide(slideId);
  };

  // Handle block operations within current slide
  const handleBlockAdd = (blockType: BlockType, position?: number) => {
    if (currentSlideId) {
      addBlockToSlide(currentSlideId, blockType, position);
    }
  };

  const handleBlockUpdate = (
    blockId: string,
    updates: Partial<StrategyBlock>
  ) => {
    if (currentSlideId) {
      updateBlockInSlide(currentSlideId, blockId, updates);
    }
  };

  const handleBlockDelete = (blockId: string) => {
    if (currentSlideId) {
      deleteBlockFromSlide(currentSlideId, blockId);
    }
  };

  const handleBlockReorder = (blockId: string, newPosition: number) => {
    if (currentSlideId) {
      reorderBlockInSlide(currentSlideId, blockId, newPosition);
    }
  };

  // Handle activity template selection
  const handleActivityTemplateSelect = (template: ActivityTemplate) => {
    const strategy = createStrategyFromTemplate(template);
    loadStrategy(strategy);
    setIsActivityTemplateOpen(false);
  };
  const handlePhaseChange = (phase: PlaybookStrategies["phase"]) => {
    currentStrategy.metadata.phase = phase;
  };

  return (
    <RoleGuard
      allowedRoles={["si_leader", "coordinator"]}
      fallback={
        <ErrorState
          variant="card"
          message="Access denied. Only SI leaders and coordinators can access the Activity Builder."
        />
      }
    >
      <main className="h-screen flex flex-col">
        <div
          data-testid="playground-layout"
          className="container flex overflow-hidden"
        >
          <div className="flex flex-col w-full">
            <PlaygroundMenubar
              onPhaseChange={handlePhaseChange}
              onPreviewClick={() => setIsPreviewOpen(true)}
              onTemplateClick={() => setIsActivityTemplateOpen(true)}
              onSlideAdd={handleSlideAdd}
            />

            <div className="w-full h-full rounded-xl flex">
              {/* Left Sidebar - Slide Sequence */}
              {!isPreviewOpen && (
                <aside className="flex-[0.5] rounded-bl-xl border-r border-border bg-background overflow-y-auto">
                  <SlideSequenceSidebar
                    slides={slides}
                    currentSlideId={currentSlideId || ""}
                    onSlideSelect={handleSlideSelect}
                    onSlideAdd={handleSlideAdd}
                    onSlideDelete={handleSlideDelete}
                    onSlideReorder={handleSlideReorder}
                    onSlideDuplicate={handleSlideDuplicate}
                  />
                </aside>
              )}
              {/* Main Editor Area */}
              {/* Slide Editor */}
              <div className="flex-1 overflow-y-auto bg-muted">
                {selectedSlide && !isPreviewOpen ? (
                  <SlideEditor
                    onBlockSelect={selectBlock}
                    slide={selectedSlide}
                    allSlides={slides}
                    onSlideUpdate={updateSlide}
                    onBlockAdd={handleBlockAdd}
                    onBlockUpdate={handleBlockUpdate}
                    onBlockDelete={handleBlockDelete}
                    onBlockReorder={handleBlockReorder}
                  />
                ) : isPreviewOpen ? (
                  <ActivityPreview
                    onEndPreview={() => setIsPreviewOpen(false)}
                    strategy={currentStrategy}
                  />
                ) : null}
                {!selectSlide && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg font-medium">No slide selected</p>
                      <p className="text-sm">
                        Select a slide or create a new one to get started
                      </p>
                    </div>
                  </div>
                )}

                {/* Contextual Toolbar */}
              </div>
              {!isPreviewOpen && (
                <aside className="h-full flex-[0.6] bg-white rounded-br-xl">
                  <ContextualToolbar
                    onBlockAdd={handleBlockAdd}
                    onBlockUpdate={handleBlockUpdate}
                  />
                </aside>
              )}
            </div>
          </div>
        </div>

        {/* Activity Template Selector Dialog */}
        <ActivityTemplateSelector
          isOpen={isActivityTemplateOpen}
          templates={activityTemplates}
          onTemplateSelect={handleActivityTemplateSelect}
          onClose={() => setIsActivityTemplateOpen(false)}
        />
      </main>
    </RoleGuard>
  );
}
