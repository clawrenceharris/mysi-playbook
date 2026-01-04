"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import {
  PreviewExecutionEngine,
  type PreviewState,
  ParticipantManagerProvider,
  ParticipantPreviewView,
  HostPreviewView,
} from "./";
import { ArrowLeft } from "lucide-react";
import { type ImprovedStrategy } from "../";
import { slugify } from "@/lib/utils";

export interface ActivityPreviewProps {
  strategy: ImprovedStrategy;
  onEndPreview: () => void;
}

export function ActivityPreview({
  strategy,
  onEndPreview,
}: ActivityPreviewProps) {
  const [engine, setEngine] = useState<PreviewExecutionEngine | null>(null);
  const [state, setState] = useState<PreviewState>();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    // Create and start the preview engine
    const previewEngine = new PreviewExecutionEngine(strategy);
    previewEngine.on("event", () => {
      setState(previewEngine.getState());
    });

    previewEngine.start();
    setEngine(previewEngine);
    setState(previewEngine.getState());
  }, [strategy]);

  // Phase navigation handlers
  const handleNextPhase = () => {
    if (currentSlideIndex < strategy.slides.length - 1) {
      const nextSlide = strategy.slides[currentSlideIndex + 1];
      const nextPhase = slugify(nextSlide.title);
      setCurrentSlideIndex(currentSlideIndex + 1);

      engine?.sendEvent({
        type: `${strategy.slug}:phase-${nextPhase}`,
      });

      engine?.setState({ ...state, phase: nextPhase });
    }
  };

  const handlePreviousPhase = () => {
    if (currentSlideIndex > 0) {
      const prevSlide = strategy.slides[currentSlideIndex - 1];
      const prevPhase = slugify(prevSlide.title);
      setCurrentSlideIndex(currentSlideIndex - 1);
      engine?.sendEvent({
        type: `${strategy.slug}:phase-${prevPhase}`,
      });

      engine?.setState({ ...state, phase: prevPhase });
    }
  };

  const canGoNext = currentSlideIndex < strategy.slides.length - 1;
  const canGoPrevious = currentSlideIndex > 0;

  return (
    <Tabs defaultValue="participant">
      {/* Header */}
      <div className="flex sticky p-3 top-0 z-9 bg-white items-center justify-between gap-4">
        <div className="center-all gap-2">
          <Button onClick={onEndPreview} variant="outline" size="icon">
            <ArrowLeft />
          </Button>
          <Badge variant="secondary" className="text-xs">
            Preview Mode
          </Badge>
        </div>

        <TabsList>
          <TabsTrigger className="shadow-none" value="participant">
            Participant View
          </TabsTrigger>
          <TabsTrigger value="host">Host View</TabsTrigger>
        </TabsList>

        <span className="text-muted-foreground">
          {currentSlideIndex + 1} / {strategy.slides.length}
        </span>
      </div>

      <div className="p-4 space-y-5">
        <ParticipantManagerProvider>
          <TabsContent value="participant">
            <ParticipantPreviewView
              strategy={strategy}
              slide={strategy.slides[currentSlideIndex]}
            />
          </TabsContent>

          <TabsContent value="host">
            <HostPreviewView
              strategy={strategy}
              slide={strategy.slides[currentSlideIndex]}
            />
          </TabsContent>
        </ParticipantManagerProvider>
      </div>

      {/* Phase Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePreviousPhase}
          disabled={!canGoPrevious}
          variant="outline"
        >
          Previous Slide
        </Button>
        <Button
          onClick={handleNextPhase}
          disabled={!canGoNext}
          variant="default"
        >
          Next Slide
        </Button>
      </div>
    </Tabs>
  );
}
