import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PlaygroundLibraryPage from "../PlaygroundLibraryPage";
import { useUser } from "@/providers";
import { useUserCustomActivities } from "@/features/playground/hooks";

// Mock the providers and hooks
vi.mock("@/providers", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/features/playground/hooks", () => ({
  useUserCustomActivities: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockUser = {
  id: "user-1",
  role: "si_leader",
  email: "test@example.com",
};

function renderWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
}

describe("ActivityLibraryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
    });
  });

  it("should show activity library interface for SI leaders", () => {
    (
      useUserCustomActivities as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      activities: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<PlaygroundLibraryPage />);

    expect(screen.getByText("Activity Library")).toBeDefined();
  });
});
