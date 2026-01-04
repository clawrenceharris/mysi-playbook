import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RoleGuard } from "../RoleGuard";

// Mock the user provider
const mockUseUser = vi.fn();
vi.mock("@/providers", () => ({
  useUser: () => mockUseUser(),
}));

describe("RoleGuard", () => {
  it("should render children when user has required role", () => {
    mockUseUser.mockReturnValue({
      user: { id: "test-user" },
      profile: { role: "si_leader" },
    });

    render(
      <RoleGuard allowedRoles={["si_leader"]}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should not render children when user does not have required role", () => {
    mockUseUser.mockReturnValue({
      user: { id: "test-user" },
      profile: { role: "student" },
    });

    render(
      <RoleGuard allowedRoles={["si_leader"]}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render fallback when user does not have required role", () => {
    mockUseUser.mockReturnValue({
      user: { id: "test-user" },
      profile: { role: "student" },
    });

    render(
      <RoleGuard
        allowedRoles={["si_leader"]}
        fallback={<div>Access Denied</div>}
      >
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should allow multiple roles", () => {
    mockUseUser.mockReturnValue({
      user: { id: "test-user" },
      profile: { role: "coordinator" },
    });

    render(
      <RoleGuard allowedRoles={["si_leader", "coordinator"]}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
