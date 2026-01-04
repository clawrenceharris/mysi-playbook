import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import CreateSessionForm from "../CreateSessionForm";
import { FormProvider, useForm } from "react-hook-form";
import { CreateSessionInput } from "@/features/sessions/domain";

// Wrapper component to provide form context
function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<CreateSessionInput>({
    defaultValues: {
      course_name: "",
      topic: "",
      description: "",
      start_date: "",
      start_time: "",
      status: "scheduled",
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("CreateSessionForm", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should render basic form fields", () => {
    render(
      <TestWrapper>
        <CreateSessionForm />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText(/course/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/topic/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
  });

  it("should render activity selection field", () => {
    render(
      <TestWrapper>
        <CreateSessionForm />
      </TestWrapper>
    );

    // Should have an activity selection field
    expect(screen.getByLabelText(/activity/i)).toBeInTheDocument();
  });
});
