import { supabase } from "./supabaseClient";
import { LotteryItem } from "../hooks/useLottery";
import { logger, logSupabaseError } from "./logger";
import { getAuthUser, handleServiceError } from "./serviceUtils";

export interface LotteryHistoryEntry {
  id?: string;
  title?: string;
  winner: LotteryItem;
  elements: LotteryItem[];
  elementsCount: number;
  timestamp: Date;
  userId?: string;
  drawMode?: string; // "wheel" | "slot" | "elimination" | "classement"
}

export interface DatabaseLotteryEntry {
  id: string;
  user_id: string;
  title: string | null;
  winner_name: string;
  winner_is_from_saved: boolean;
  participants_count: number;
  // Stored as string[] (names only) since the refactor.
  // Legacy rows may contain LotteryItem objects — fromDatabase handles both.
  participants_list: unknown;
  created_at: string;
  draw_mode: string | null; // requires: ALTER TABLE lottery_history ADD COLUMN draw_mode TEXT DEFAULT NULL;
}

const formatDrawTitle = (date: Date): string =>
  `Tirage du ${new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)}`;

const fromDatabase = (entry: DatabaseLotteryEntry): LotteryHistoryEntry => {
  // participants_list can be:
  //   • string[]      — new format (names only)
  //   • LotteryItem[] — legacy format (objects with id/name/isFromSaved)
  const raw = entry.participants_list as Array<string | { id?: string; name: string; isFromSaved?: boolean }>;
  const elements: LotteryItem[] = (raw ?? []).map((p) =>
    typeof p === "string"
      ? { id: crypto.randomUUID(), name: p }
      : { id: p.id ?? crypto.randomUUID(), name: p.name, isFromSaved: p.isFromSaved }
  );

  return {
    id: entry.id,
    title: entry.title || formatDrawTitle(new Date(entry.created_at)),
    winner: {
      id: `winner-${entry.id}`,
      name: entry.winner_name,
      isFromSaved: entry.winner_is_from_saved,
    },
    elements,
    elementsCount: entry.participants_count,
    timestamp: new Date(entry.created_at),
    userId: entry.user_id,
    drawMode: entry.draw_mode ?? undefined,
  };
};

export const saveLotteryResult = async (
  winner: LotteryItem,
  elements: LotteryItem[],
  title?: string,
  drawMode?: string
): Promise<LotteryHistoryEntry | null> => {
  try {
    const user = await getAuthUser();
    if (!user) {
      logger.warn("saveLotteryResult", "user not authenticated");
      return null;
    }

    const timestamp = new Date();

    // Base payload — always safe to insert.
    // Store only names (not full objects) to minimise JSONB size.
    const basePayload = {
      user_id: user.id,
      title: title?.trim() || formatDrawTitle(timestamp),
      winner_name: winner.name,
      winner_is_from_saved: winner.isFromSaved ?? false,
      participants_count: elements.length,
      participants_list: elements.map((e) => e.name),
    };

    const { data, error } = await supabase
      .from("lottery_history")
      .insert(drawMode ? { ...basePayload, draw_mode: drawMode } : basePayload)
      .select()
      .single();

    if (error) {
      // draw_mode column not yet migrated — retry without it so saves never fail silently.
      // Run: ALTER TABLE lottery_history ADD COLUMN draw_mode TEXT DEFAULT NULL;
      if (drawMode && (error.code === "42703" || error.message?.includes("draw_mode"))) {
        logger.warn("saveLotteryResult", "draw_mode column missing — saving without mode");
        const { data: fallback, error: fallbackErr } = await supabase
          .from("lottery_history")
          .insert(basePayload)
          .select()
          .single();
        if (fallbackErr) { logSupabaseError("saveLotteryResult", fallbackErr); return null; }
        return fromDatabase(fallback);
      }
      logSupabaseError("saveLotteryResult", error);
      return null;
    }

    return fromDatabase(data);
  } catch (err) {
    handleServiceError("saveLotteryResult", "lotteryHistory", "save", err, {
      winnerName: winner.name,
      elementsCount: elements.length,
    });
    return null;
  }
};

export const getLotteryHistory = async (): Promise<LotteryHistoryEntry[]> => {
  try {
    const user = await getAuthUser();
    if (!user) {
      logger.warn("getLotteryHistory", "user not authenticated");
      return [];
    }

    const { data, error } = await supabase
      .from("lottery_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(150); // DB trigger caps at 150 — we fetch all for participant stats

    if (error) {
      logSupabaseError("getLotteryHistory", error);
      return [];
    }

    return (data ?? []).map(fromDatabase);
  } catch (err) {
    handleServiceError("getLotteryHistory", "lotteryHistory", "get", err);
    return [];
  }
};

export const deleteLotteryEntry = async (entryId: string): Promise<boolean> => {
  try {
    const user = await getAuthUser();
    if (!user) return false;

    const { error } = await supabase
      .from("lottery_history")
      .delete()
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (error) {
      logSupabaseError("deleteLotteryEntry", error);
      return false;
    }

    return true;
  } catch (err) {
    handleServiceError("deleteLotteryEntry", "lotteryHistory", "delete", err, { entryId });
    return false;
  }
};

export const clearLotteryHistory = async (): Promise<boolean> => {
  try {
    const user = await getAuthUser();
    if (!user) return false;

    const { error } = await supabase
      .from("lottery_history")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      logSupabaseError("clearLotteryHistory", error);
      return false;
    }

    return true;
  } catch (err) {
    handleServiceError("clearLotteryHistory", "lotteryHistory", "clear", err);
    return false;
  }
};
