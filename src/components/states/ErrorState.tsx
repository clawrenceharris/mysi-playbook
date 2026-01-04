"use client";

import React from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * Available variants for error display
 */
export type ErrorVariant = "item" | "card" | "page";

/**
 * Props for the ErrorState component
 */
export interface ErrorStateProps {
  /** The display variant - affects layout and styling */
  variant?: ErrorVariant;
  /** The error title/heading */
  title?: string;
  /** Detailed error message */
  message?: string | null;
  /** Custom icon to display (overrides default) */
  icon?: React.ReactNode;
  /** Callback function for retry action */
  onRetry?: () => void;
  /** Text for the retry button */
  retryLabel?: string;
  /** Additional CSS classes to apply */
  className?: string;
  /** Whether to show the error icon */
  showIcon?: boolean;
  action?: React.ReactNode;
}

/**
 * ErrorState component provides consistent error display with retry functionality.
 *
 * This component handles different error scenarios with appropriate visual feedback
 * and user actions. It supports multiple variants for different UI contexts and
 * provides customizable retry mechanisms.
 *
 * @example
 * ```tsx
 * // Default error state with retry
 * <ErrorState
 *   title="Failed to load habitats"
 *   message="Check your connection and try again"
 *   onRetry={handleRetry}
 * />
 *
 * // Minimal inline error
 * <ErrorState
 *   variant="minimal"
 *   title="Upload failed"
 *   onRetry={handleRetry}
 * />
 *
 * // Card-style error with custom icon
 * <ErrorState
 *   variant="card"
 *   title="Network Error"
 *   icon={<NetworkIcon />}
 * />
 * ```
 *
 * @param props - The component props
 * @returns An error display component with optional retry functionality
 */
export function ErrorState({
  variant = "page",
  title = "Something went wrong.",
  message = "Sorry, something broke. Come back later and try again.",
  icon,
  onRetry,
  retryLabel = "Try Again",
  className,
  showIcon = true,
}: ErrorStateProps) {
  const router = useRouter();
  const defaultIcon = (
    <svg
      className="w-12 h-12 text-destructive"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  );

  const renderCard = () => (
    <Card
      className={cn(
        "m-auto max-w-md min-w-sm text-center shadow-none border-2",
        className
      )}
    >
      <CardHeader>
        <Image
          width={510}
          height={510}
          className="w-full max-w-[200px] mx-auto"
          alt="Sad Notebook"
          src="/images/error.png"
        />
      </CardHeader>
      <CardContent>
        <CardTitle className="text-2xl">Something went wrong...</CardTitle>

        <CardDescription>{message}</CardDescription>
      </CardContent>
      <CardFooter className="gap-4 justify-end">
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            {retryLabel}
          </Button>
        )}
        <Button onClick={() => router.refresh()} variant="primary">
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );

  const renderItem = () => (
    <Item className={className}>
      <ItemContent>
        {showIcon && <ItemMedia>{icon || defaultIcon}</ItemMedia>}
        <ItemTitle>{title}</ItemTitle>
        {message && <ItemDescription>{message}</ItemDescription>}
        {onRetry && (
          <ItemActions>
            <Button onClick={onRetry}>{retryLabel}</Button>
          </ItemActions>
        )}
      </ItemContent>
    </Item>
  );
  const renderPage = () => (
    <main className="flex w-screen justify-center">{renderCard()}</main>
  );

  const renderVariant = () => {
    switch (variant) {
      case "card":
        return renderCard();
      case "item":
        return renderItem();
      case "page":
      default:
        return renderPage();
    }
  };

  return renderVariant();
}
