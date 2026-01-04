"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  BlockType,
  ImprovedStrategy,
  SlideNavigationState,
  SlideType,
  StrategyBlock,
  StrategySlide,
} from "@/features/playground";
import {} from "@/types/playbook";

interface PlaygroundProviderProps {
  children: React.ReactNode;
}

export interface PlaygroundState {
  slides: StrategySlide[];
  currentSlideId: string | null;
  isDirty: boolean;
  title: string;
  selectedSlide: StrategySlide | null;
  selectedBlock: StrategyBlock | null;
}

export interface PlaygroundActions {
  addSlide: (title: string, type: SlideType, afterSlideId?: string) => void;
  addSlideAfter: (afterSlideId: string, title: string, type: SlideType) => void;
  updateSlide: (id: string, updates: Partial<StrategySlide>) => void;
  deleteSlide: (id: string) => void;
  duplicateSlide: (id: string) => void;
  reorderSlide: (slideId: string, newIndex: number) => void;
  selectSlide: (id: string | null) => void;
  navigateToNext: () => void;
  navigateToPrevious: () => void;
  addBlockToSlide: (
    slideId: string,
    blockType: BlockType,
    position?: number
  ) => void;
  updateBlockInSlide: (
    slideId: string,
    blockId: string,
    updates: Partial<StrategyBlock>
  ) => void;
  deleteBlockFromSlide: (slideId: string, blockId: string) => void;
  reorderBlockInSlide: (
    slideId: string,
    blockId: string,
    newPosition: number
  ) => void;
  resetBuilder: () => void;
  selectBlock: (blockId: string | null) => void;

  loadStrategy: (strategy: ImprovedStrategy) => void;
  setTitle: (title: string) => void;
}

type PlaygroundContextType = PlaygroundActions &
  PlaygroundState & {
    navigationState: SlideNavigationState;
  };

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(
  undefined
);

export function PlaygroundProvider({ children }: PlaygroundProviderProps) {
  const [state, setState] = useState<PlaygroundState>(() => ({
    slides: [],
    selectedBlock: null,
    currentSlideId: null,
    isDirty: false,
    title: "New Playfield Strategy",
    sharedState: { phase: "" },
    participants: [],
    selectedSlide: null,
  }));

  const setTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, title, isDirty: true }));
  }, []);

  // Slide management actions
  const addSlide = useCallback(
    (title: string, type: SlideType, afterSlideId?: string) => {
      const newSlide: StrategySlide = {
        id: `slide-${crypto.randomUUID()}`,
        title,
        type,
        timing: {
          estimatedDuration: 0,
          showTimer: false,
        },
        transitions: {
          type: "manual",
        },
        blocks: [],
        order: 0,
      };

      setState((prev) => {
        let newSlides: StrategySlide[];

        if (afterSlideId) {
          const afterIndex = prev.slides.findIndex(
            (s) => s.id === afterSlideId
          );
          newSlides = [
            ...prev.slides.slice(0, afterIndex + 1),
            newSlide,
            ...prev.slides.slice(afterIndex + 1),
          ];
        } else {
          newSlides = [...prev.slides, newSlide];
        }

        // Update order for all slides
        newSlides.forEach((slide, index) => {
          slide.order = index;
        });

        return {
          ...prev,
          slides: newSlides,
          currentSlideId: newSlide.id,
          isDirty: true,
        };
      });
    },
    []
  );

  const addSlideAfter = useCallback(
    (afterSlideId: string, title: string, type: SlideType) => {
      addSlide(title, type, afterSlideId);
    },
    [addSlide]
  );

  const updateSlide = useCallback(
    (id: string, updates: Partial<StrategySlide>) => {
      setState((prev) => ({
        ...prev,
        slides: prev.slides.map((slide) =>
          slide.id === id ? { ...slide, ...updates } : slide
        ),
        isDirty: true,
      }));
    },
    []
  );

  const deleteSlide = useCallback((id: string) => {
    setState((prev) => {
      const newSlides = prev.slides.filter((slide) => slide.id !== id);

      // Update order for remaining slides
      newSlides.forEach((slide, index) => {
        slide.order = index;
      });

      const newCurrentSlideId =
        prev.currentSlideId === id
          ? newSlides.length > 0
            ? newSlides[0].id
            : null
          : prev.currentSlideId;

      return {
        ...prev,
        slides: newSlides,
        currentSlideId: newCurrentSlideId,
        isDirty: true,
      };
    });
  }, []);

  const duplicateSlide = useCallback((id: string) => {
    setState((prev) => {
      const slideIndex = prev.slides.findIndex((s) => s.id === id);
      if (slideIndex === -1) return prev;

      const originalSlide = prev.slides[slideIndex];
      const duplicatedSlide: StrategySlide = {
        ...originalSlide,
        id: crypto.randomUUID(),
        title: `${originalSlide.title} (Copy)`,
        blocks: originalSlide.blocks.map((block) => ({
          ...block,
          id: crypto.randomUUID(),
        })),
      };

      const newSlides = [
        ...prev.slides.slice(0, slideIndex + 1),
        duplicatedSlide,
        ...prev.slides.slice(slideIndex + 1),
      ];

      // Update order for all slides
      newSlides.forEach((slide, index) => {
        slide.order = index;
      });

      return {
        ...prev,
        slides: newSlides,
        currentSlideId: duplicatedSlide.id,
        isDirty: true,
      };
    });
  }, []);

  const reorderSlide = useCallback((slideId: string, newIndex: number) => {
    setState((prev) => {
      const slideIndex = prev.slides.findIndex((s) => s.id === slideId);
      if (slideIndex === -1) return prev;

      const newSlides = [...prev.slides];
      const [movedSlide] = newSlides.splice(slideIndex, 1);
      newSlides.splice(newIndex, 0, movedSlide);

      // Update order for all slides
      newSlides.forEach((slide, index) => {
        slide.order = index;
      });

      return {
        ...prev,
        slides: newSlides,
        isDirty: true,
      };
    });
  }, []);

  // Navigation actions
  const selectSlide = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      currentSlideId: id,
    }));
  }, []);

  const navigateToNext = useCallback(() => {
    setState((prev) => {
      if (!prev.currentSlideId) return prev;

      const currentIndex = prev.slides.findIndex(
        (s) => s.id === prev.currentSlideId
      );
      if (currentIndex === -1 || currentIndex >= prev.slides.length - 1)
        return prev;

      return {
        ...prev,
        currentSlideId: prev.slides[currentIndex + 1].id,
      };
    });
  }, []);

  const navigateToPrevious = useCallback(() => {
    setState((prev) => {
      if (!prev.currentSlideId) return prev;

      const currentIndex = prev.slides.findIndex(
        (s) => s.id === prev.currentSlideId
      );
      if (currentIndex <= 0) return prev;

      return {
        ...prev,
        currentSlideId: prev.slides[currentIndex - 1].id,
      };
    });
  }, []);

  // Helper function to get default config for a block type
  const getDefaultBlockConfig = (blockType: BlockType): any => {
    switch (blockType) {
      case BlockType.DISPLAY_PROMPT:
        return {
          title: "",
          content: "",
          requireAcknowledgment: false,
        };
      case BlockType.COLLECT_INPUT:
        return {
          question: "",
          inputType: "text",
          required: false,
        };
      case BlockType.POLL_VOTE:
        return {
          question: "",
          options: ["Option 1", "Option 2"],
          allowMultiple: false,
          showResults: "afterVoting",
          anonymous: true,
        };
      case BlockType.TIMER:
        return {
          duration: 60,
          displayStyle: "countdown",
          autoAdvance: false,
        };
      case BlockType.HANDOUT:
        return {
          dataSource: "",
          distributionMode: "one-per-participant",
          mismatchHandling: "auto",
          showAuthor: false,
          displayMode: "cards",
          allowParticipantResponse: false,
          allowReassignment: true,
          showDistributionPreview: true,
        };
      default:
        return {};
    }
  };

  // Block management within slides
  const addBlockToSlide = useCallback(
    (slideId: string, blockType: BlockType, position?: number) => {
      const newBlock: StrategyBlock = {
        id: crypto.randomUUID(),
        type: blockType,
        order: position ?? 0,
        config: getDefaultBlockConfig(blockType),
      };

      setState((prev) => ({
        ...prev,
        slides: prev.slides.map((slide) => {
          if (slide.id !== slideId) return slide;

          const newBlocks = [...slide.blocks];
          if (position !== undefined) {
            newBlocks.splice(position, 0, newBlock);
          } else {
            newBlocks.push(newBlock);
          }

          // Update order for all blocks
          newBlocks.forEach((block, index) => {
            block.order = index;
          });

          return { ...slide, blocks: newBlocks };
        }),
        isDirty: true,
      }));
    },
    []
  );

  const updateBlockInSlide = useCallback(
    (slideId: string, blockId: string, updates: Partial<StrategyBlock>) => {
      setState((prev) => ({
        ...prev,
        slides: prev.slides.map((slide) => {
          if (slide.id !== slideId) return slide;

          return {
            ...slide,
            blocks: slide.blocks.map((block) =>
              block.id === blockId ? { ...block, ...updates } : block
            ),
          };
        }),
        isDirty: true,
      }));
    },
    []
  );
  const selectBlock = useCallback(
    (blockId: string | null) => {
      const currentSlide = state.slides.find(
        (slide) => slide.id === state.currentSlideId
      );
      if (blockId === null)
        return setState((prev) => ({ ...prev, selectedBlock: null }));
      setState((prev) => ({
        ...prev,
        selectedBlock:
          currentSlide?.blocks.find((block) => block.id === blockId) || null,
      }));
    },
    [state.currentSlideId, state.slides]
  );
  const deleteBlockFromSlide = useCallback(
    (slideId: string, blockId: string) => {
      setState((prev) => ({
        ...prev,
        slides: prev.slides.map((slide) => {
          if (slide.id !== slideId) return slide;

          const newBlocks = slide.blocks.filter(
            (block) => block.id !== blockId
          );

          // Update order for remaining blocks
          newBlocks.forEach((block, index) => {
            block.order = index;
          });

          return { ...slide, blocks: newBlocks };
        }),
        isDirty: true,
      }));
    },
    []
  );

  const reorderBlockInSlide = useCallback(
    (slideId: string, blockId: string, newPosition: number) => {
      setState((prev) => ({
        ...prev,
        slides: prev.slides.map((slide) => {
          if (slide.id !== slideId) return slide;

          const blockIndex = slide.blocks.findIndex((b) => b.id === blockId);
          if (blockIndex === -1) return slide;

          const newBlocks = [...slide.blocks];
          const [movedBlock] = newBlocks.splice(blockIndex, 1);
          newBlocks.splice(newPosition, 0, movedBlock);

          // Update order for all blocks
          newBlocks.forEach((block, index) => {
            block.order = index;
          });

          return { ...slide, blocks: newBlocks };
        }),
        isDirty: true,
      }));
    },
    []
  );

  // Utility actions
  const resetBuilder = useCallback(() => {
    setState({
      slides: [],
      selectedBlock: null,
      selectedSlide: null,
      title: "New Playfield Strategy",
      currentSlideId: null,
      isDirty: false,
    });
  }, []);

  const loadStrategy = useCallback((strategy: ImprovedStrategy) => {
    return setState({
      slides: strategy.slides,
      title: strategy.title,
      selectedBlock: strategy.slides[0].blocks[0],
      currentSlideId: strategy.slides[0].id,
      selectedSlide: strategy.slides[0],
      isDirty: false,
    });
  }, []);

  // Computed values
  const selectedSlide = useMemo(() => {
    return state.currentSlideId
      ? state.slides.find((slide) => slide.id === state.currentSlideId) || null
      : null;
  }, [state.slides, state.currentSlideId]);

  const navigationState = useMemo((): SlideNavigationState => {
    const currentIndex = state.currentSlideId
      ? state.slides.findIndex((s) => s.id === state.currentSlideId)
      : -1;

    return {
      currentSlideId: state.currentSlideId,
      previousSlideId:
        currentIndex > 0 ? state.slides[currentIndex - 1].id : null,
      canGoBack: currentIndex > 0,
      canGoForward: currentIndex >= 0 && currentIndex < state.slides.length - 1,
      totalSlides: state.slides.length,
      currentIndex: currentIndex >= 0 ? currentIndex : 0,
    };
  }, [state.slides, state.currentSlideId]);

  const actions: PlaygroundActions = {
    addSlide,
    addSlideAfter,
    updateSlide,
    setTitle,
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
    resetBuilder,
    loadStrategy,
    selectBlock,
  };

  const value = {
    // State
    ...state,
    selectedSlide,
    navigationState,
    // Actions
    ...actions,
  };

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export const usePlayground = () => {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error("usePlayground must be used within a PlaygroundProvider");
  }
  return context;
};
