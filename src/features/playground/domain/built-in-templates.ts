/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SlideTemplate,
  SlideType,
  ImprovedStrategy,
  StrategySlide,
  BlockType,
  HandoutConfig,
  DisplayVariableConfig,
  CollectInputConfig,
} from "./";

// Activity Template - Full multi-slide activity
export interface ActivityTemplate {
  id: string;
  title: string;
  description: string;
  slides: Omit<StrategySlide, "id" | "order">[];
  sharedState?: Record<string, any>;
  metadata: {
    estimatedDuration: number;
    tags: string[];
    author: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Built-in template constants
export const QUESTION_RESPONSE_TEMPLATE: SlideTemplate = {
  id: "question-response",
  name: "Question & Response",
  description: "Ask a question and collect text responses from participants",
  slideType: SlideType.INTERACTION,
  blocks: [
    {
      type: BlockType.DISPLAY_PROMPT,
      config: {
        title: "{{question_title}}",
        content: "{{question_content}}",
      },
    },
    {
      type: BlockType.COLLECT_INPUT,
      config: {
        inputType: "text",
        placeholder: "Enter your response...",
        required: true,
      },
    },
  ],
  metadata: {
    estimatedDuration: 300, // 5 minutes
    tags: ["question", "response", "text", "interaction"],
    author: "system",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

export const POLL_RESULTS_TEMPLATE: SlideTemplate = {
  id: "poll-results",
  name: "Poll & Results",
  description: "Conduct a poll and display results to participants",

  slideType: SlideType.INTERACTION,
  blocks: [
    {
      type: BlockType.POLL_VOTE,
      config: {
        question: "{{poll_question}}",
        options: ["{{option_1}}", "{{option_2}}", "{{option_3}}"],
        allowMultiple: false,
        showResults: true,
      },
    },
    {
      type: BlockType.DISPLAY_PROMPT,
      config: {
        title: "Poll Results",
        content: "Here are the results from our poll:",
      },
    },
  ],
  metadata: {
    estimatedDuration: 240, // 4 minutes
    tags: ["poll", "voting", "results", "interaction"],
    author: "system",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

export const CONTENT_DISPLAY_TEMPLATE: SlideTemplate = {
  id: "content-display",
  name: "Content Display",
  description: "Display information, instructions, or content to participants",

  slideType: SlideType.CONTENT,
  blocks: [
    {
      type: BlockType.DISPLAY_PROMPT,
      config: {
        title: "{{content_title}}",
        content: "{{content_body}}",
        mediaUrl: "{{media_url}}",
        requireAcknowledgment: true,
      },
    },
  ],
  metadata: {
    estimatedDuration: 180, // 3 minutes
    tags: ["content", "information", "display"],
    author: "system",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

export const TIMER_BREAK_TEMPLATE: SlideTemplate = {
  id: "timer-break",
  name: "Timer Break",
  description: "Give participants a timed break or thinking period",

  slideType: SlideType.TIMER,
  blocks: [
    {
      type: BlockType.DISPLAY_PROMPT,
      config: {
        title: "{{break_title}}",
        content: "{{break_message}}",
      },
    },
    {
      type: BlockType.TIMER,
      config: {
        duration: 300, // 5 minutes default
        showCountdown: true,
        autoAdvance: false,
      },
    },
  ],
  metadata: {
    estimatedDuration: 300, // 5 minutes
    tags: ["timer", "break", "pause", "engagement"],
    author: "system",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

export const ASSESSMENT_TEMPLATE: SlideTemplate = {
  id: "assessment",
  name: "Assessment",
  description: "Comprehensive assessment with multiple question types",

  slideType: SlideType.MIXED,
  blocks: [
    {
      type: BlockType.DISPLAY_PROMPT,
      config: {
        title: "{{assessment_title}}",
        content: "{{assessment_instructions}}",
        requireAcknowledgment: true,
      },
    },
    {
      type: BlockType.COLLECT_INPUT,
      config: {
        inputType: "text",
        placeholder: "Enter your answer...",
        required: true,
      },
    },
    {
      type: BlockType.POLL_VOTE,
      config: {
        question: "{{multiple_choice_question}}",
        options: [
          "{{option_a}}",
          "{{option_b}}",
          "{{option_c}}",
          "{{option_d}}",
        ],
        allowMultiple: false,
        showResults: false,
      },
    },
  ],
  metadata: {
    estimatedDuration: 600, // 10 minutes
    tags: ["assessment", "quiz", "evaluation", "mixed"],
    author: "system",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

// Function to get all built-in templates
export function getBuiltInTemplates(): SlideTemplate[] {
  return [
    QUESTION_RESPONSE_TEMPLATE,
    POLL_RESULTS_TEMPLATE,
    CONTENT_DISPLAY_TEMPLATE,
    TIMER_BREAK_TEMPLATE,
    ASSESSMENT_TEMPLATE,
  ];
}

// ============================================
// ACTIVITY TEMPLATES (Multi-Slide Activities)
// ============================================

// Snowball Activity Template
export const SNOWBALL_ACTIVITY_TEMPLATE: ActivityTemplate = {
  id: "snowball-activity",
  title: "Snowball",
  description:
    "Students write questions, pick questions from a pool, and discuss their chosen questions",

  slides: [
    {
      title: "Write Questions",
      type: SlideType.INTERACTION,
      blocks: [
        {
          id: "prompt-1",
          type: BlockType.COLLECT_INPUT,
          order: 0,
          config: {
            required: true,
            saveToSharedState: true,
            inputType: "text",
            variableName: "responses",
            title: "Write Your Question",
            content:
              "Think of a question related to a topic covered in the last lecture. Enter it below...",
          } as CollectInputConfig,
        },
      ],
      transitions: {
        type: "manual",
      },
      timing: {
        estimatedDuration: 300,
        showTimer: false,
      },
    },

    {
      title: "Distribute Responses",
      type: SlideType.HANDOUT,
      blocks: [
        {
          id: "handout",
          type: BlockType.HANDOUT,
          order: 0,
          config: {
            content: "Here's your assigned question:",
            distributionMode: "exclude-own",
            allowParticipantResponse: false,
            mismatchHandling: "auto",
            dataSource: "responses",
            displayMode: "cards",
            showAuthor: false,
          } as HandoutConfig,
        },
      ],
      transitions: {
        type: "manual",
      },
      timing: {
        estimatedDuration: 60,
        showTimer: false,
      },
    },

    {
      title: "Discussion",
      type: SlideType.CONTENT,
      blocks: [
        {
          id: "prompt-2",
          type: BlockType.DISPLAY_PROMPT,
          order: 0,
          config: {
            title: "Discussion",
            content: "",
          },
        },
        {
          id: "display-2",
          type: BlockType.DISPLAY_VARIABLE,
          order: 1,
          config: {
            title: "Discussion",
            content:
              "Read your question aloud and try to answer as best as you can.",
            variableName: "assignments.current",
          } as DisplayVariableConfig,
        },
      ],
      transitions: {
        type: "manual",
      },
      timing: {
        estimatedDuration: 300,
        showTimer: false,
      },
    },
  ],
  sharedState: {
    responses: [],
  },
  metadata: {
    estimatedDuration: 1080, // 18 minutes total
    tags: ["collaborative", "questions", "discussion", "peer-learning"],
    author: "system",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

// Poll Activity Template
export const POLL_ACTIVITY_TEMPLATE: ActivityTemplate = {
  id: "poll-activity",
  title: "Poll & Discussion",
  description:
    "Conduct a poll with multiple choice options, display results, and facilitate discussion",

  slides: [
    {
      title: "Introduction",
      type: SlideType.CONTENT,
      blocks: [
        {
          id: "intro-prompt",
          type: BlockType.DISPLAY_PROMPT,
          order: 0,
          config: {
            title: "Quick Poll",
            content:
              "We're going to take a quick poll to gauge understanding. Answer honestly - there are no wrong answers!",
            requireAcknowledgment: true,
          },
        },
      ],
      transitions: {
        type: "auto",
        delay: 3000,
      },
      timing: {
        estimatedDuration: 30,
        showTimer: false,
      },
    },
    {
      title: "Poll Question",
      type: SlideType.INTERACTION,
      blocks: [
        {
          id: "poll-1",
          type: BlockType.POLL_VOTE,
          order: 0,
          config: {
            question: "What is your current understanding of this topic?",
            options: [
              "I understand it well",
              "I have some questions",
              "I'm confused",
              "I need more examples",
            ],
            allowMultiple: false,
            showResults: "afterVoting",
            anonymous: true,
            saveToSharedState: true,
            variableName: "poll_results",
          },
        },
      ],
      transitions: {
        type: "manual",
      },
      timing: {
        estimatedDuration: 120,
        showTimer: false,
      },
    },
    {
      title: "Results & Discussion",
      type: SlideType.CONTENT,
      blocks: [
        {
          id: "results-prompt",
          type: BlockType.DISPLAY_PROMPT,
          order: 0,
          config: {
            title: "Poll Results",
            content:
              "Here's what the class thinks: {{poll_results}}\n\nLet's discuss these results and address any questions.",
          },
        },
      ],
      transitions: {
        type: "manual",
      },
      timing: {
        estimatedDuration: 300,
        showTimer: false,
      },
    },
  ],
  sharedState: {
    poll_results: {},
  },
  metadata: {
    estimatedDuration: 450, // 7.5 minutes total
    tags: ["poll", "assessment", "discussion", "feedback"],
    author: "system",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

// Discussion Activity Template
export const DISCUSSION_ACTIVITY_TEMPLATE: ActivityTemplate = {
  id: "discussion-activity",
  title: "Guided Discussion",
  description:
    "Structured discussion with prompts, individual reflection, and group sharing",

  slides: [
    {
      title: "Discussion Prompt",
      type: SlideType.CONTENT,
      blocks: [
        {
          id: "discussion-intro",
          type: BlockType.DISPLAY_PROMPT,
          order: 0,
          config: {
            title: "Today's Discussion Topic",
            content:
              "We're going to explore an important concept together. First, take a moment to think individually, then we'll share as a group.",
            requireAcknowledgment: true,
          },
        },
      ],
      transitions: {
        type: "auto",
        delay: 5000,
      },
      timing: {
        estimatedDuration: 60,
        showTimer: false,
      },
    },
    {
      title: "Individual Reflection",
      type: SlideType.INTERACTION,
      blocks: [
        {
          id: "reflection-prompt",
          type: BlockType.DISPLAY_PROMPT,
          order: 0,
          config: {
            title: "Think About It",
            content:
              "Take 3 minutes to reflect on this question. Write down your initial thoughts.",
          },
        },
        {
          id: "reflection-timer",
          type: BlockType.TIMER,
          order: 1,
          config: {
            duration: 180,
            displayStyle: "countdown",
            autoAdvance: false,
            title: "Reflection Time",
          },
        },
        {
          id: "reflection-input",
          type: BlockType.COLLECT_INPUT,
          order: 2,
          config: {
            question: "What are your thoughts on this topic?",
            inputType: "text",
            required: false,
            placeholder: "Share your reflection...",
            saveToSharedState: true,
            variableName: "student_reflections",
          },
        },
      ],
      transitions: {
        type: "manual",
      },
      timing: {
        estimatedDuration: 240,
        showTimer: true,
      },
    },
    {
      title: "Pair Discussion",
      type: SlideType.CONTENT,
      blocks: [
        {
          id: "pair-prompt",
          type: BlockType.DISPLAY_PROMPT,
          order: 0,
          config: {
            title: "Pair & Share",
            content:
              "Turn to a partner and share your thoughts. Listen actively and ask follow-up questions.",
          },
        },
        {
          id: "pair-timer",
          type: BlockType.TIMER,
          order: 1,
          config: {
            duration: 300,
            displayStyle: "countdown",
            autoAdvance: false,
            title: "Pair Discussion",
          },
        },
      ],
      transitions: {
        type: "manual",
      },
      timing: {
        estimatedDuration: 300,
        showTimer: true,
      },
    },
    {
      title: "Group Sharing",
      type: SlideType.CONTENT,
      blocks: [
        {
          id: "group-prompt",
          type: BlockType.DISPLAY_PROMPT,
          order: 0,
          config: {
            title: "Share with the Group",
            content:
              "Let's hear from a few pairs. What interesting ideas came up in your discussions?\n\nReflections: {{student_reflections}}",
          },
        },
      ],
      transitions: {
        type: "manual",
      },
      timing: {
        estimatedDuration: 420,
        showTimer: false,
      },
    },
  ],
  sharedState: {
    student_reflections: [],
  },
  metadata: {
    estimatedDuration: 1020, // 17 minutes total
    tags: ["discussion", "reflection", "collaboration", "think-pair-share"],
    author: "system",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

// Function to get all built-in activity templates
export function getBuiltInActivityTemplates(): ActivityTemplate[] {
  return [
    SNOWBALL_ACTIVITY_TEMPLATE,
    POLL_ACTIVITY_TEMPLATE,
    DISCUSSION_ACTIVITY_TEMPLATE,
  ];
}

// Function to create an ImprovedStrategy from an ActivityTemplate
export function createStrategyFromTemplate(
  template: ActivityTemplate,
  customTitle?: string
): ImprovedStrategy {
  const timestamp = Date.now();
  const slides: StrategySlide[] = template.slides.map((slide, index) => ({
    ...slide,
    id: `slide-${timestamp}-${index}`,
    order: index,
    blocks: slide.blocks.map((block, blockIndex) => ({
      ...block,
      id: `block-${timestamp}-${index}-${blockIndex}`,
    })),
  }));

  return {
    id: `activity-${Date.now()}`,
    title: customTitle || template.title,
    slides,
    sharedState: template.sharedState || {},
    metadata: {
      position: 1,
      estimatedDuration: template.metadata.estimatedDuration,
      participantCount: 20,
    },
  };
}
