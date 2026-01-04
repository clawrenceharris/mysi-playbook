/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PlayfieldContext } from "@/types/playbook";

/**
 * Helper functions for implementing the Snowball activity pattern
 * Provides utilities for question pool management, selection tracking, and data aggregation
 */
export const SnowballHelpers = {
  /**
   * Add an item to a pool (e.g., add a question to the question pool)
   */
  addToPool(ctx: PlayfieldContext, poolKey: string, item: any): void {
    ctx.call.sendCustomEvent({
      type: `${ctx.slug}:pool-add`,
      poolKey,
      item,
    });
  },

  /**
   * Remove an item from a pool by ID
   */
  removeFromPool(ctx: PlayfieldContext, poolKey: string, itemId: string): void {
    ctx.call.sendCustomEvent({
      type: `${ctx.slug}:pool-remove`,
      poolKey,
      itemId,
    });
  },

  /**
   * Track a user's selection of an item
   */
  trackSelection(
    ctx: PlayfieldContext,
    selectionKey: string,
    itemId: string
  ): void {
    ctx.call.sendCustomEvent({
      type: `${ctx.slug}:selection-track`,
      selectionKey,
      userId: ctx.userId,
      itemId,
    });
  },

  /**
   * Get all items from a pool
   */
  getPoolItems(ctx: PlayfieldContext, poolKey: string): any[] {
    const pool = ctx.state[poolKey];
    if (!Array.isArray(pool)) {
      return [];
    }
    return pool;
  },

  /**
   * Get items from a pool that haven't been selected yet
   */
  getAvailablePoolItems(
    ctx: PlayfieldContext,
    poolKey: string,
    selectionKey: string
  ): any[] {
    const pool = this.getPoolItems(ctx, poolKey);
    const selections = ctx.state[selectionKey] || {};
    const selectedIds = Object.values(selections);

    return pool.filter((item) => !selectedIds.includes(item.id));
  },

  /**
   * Get the current user's selection
   */
  getUserSelection(
    ctx: PlayfieldContext,
    selectionKey: string
  ): string | undefined {
    const selections = ctx.state[selectionKey];
    if (!selections || typeof selections !== "object") {
      return undefined;
    }
    return selections[ctx.userId];
  },

  /**
   * Get all user selections as an array
   */
  getAllSelections(
    ctx: PlayfieldContext,
    selectionKey: string
  ): Array<{ userId: string; itemId: string }> {
    const selections = ctx.state[selectionKey];
    if (!selections || typeof selections !== "object") {
      return [];
    }

    return Object.entries(selections).map(([userId, itemId]) => ({
      userId,
      itemId: itemId as string,
    }));
  },

  /**
   * Get selected items with full details from the pool
   */
  getSelectedItemsWithDetails(
    ctx: PlayfieldContext,
    poolKey: string,
    selectionKey: string
  ): Array<{ userId: string; item: any }> {
    const pool = this.getPoolItems(ctx, poolKey);
    const allSelections = this.getAllSelections(ctx, selectionKey);

    return allSelections.map(({ userId, itemId }) => {
      const item = pool.find((p) => p.id === itemId);
      return { userId, item };
    });
  },
};
