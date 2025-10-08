import { supabase } from "./supabaseClient";
import { LotteryItem } from "../hooks/useLottery";
import { logger, logSupabaseError } from "./logger";
import * as Sentry from "@sentry/react";

export interface LotteryHistoryEntry {
  id?: string;
  title?: string;
  winner: LotteryItem;
  elements: LotteryItem[]; // Liste complète des éléments
  elementsCount: number;
  timestamp: Date;
  userId?: string;
}

export interface DatabaseLotteryEntry {
  id: string;
  user_id: string;
  title: string | null;
  winner_name: string;
  winner_is_from_saved: boolean;
  participants_count: number;
  participants_list: LotteryItem[];
  created_at: string;
}

/**
 * Génère un titre par défaut au format "Tirage du 16 Sept. 2025"
 */
export const generateDefaultTitle = (date: Date): string => {
  const months = [
    "Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin",
    "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `Tirage du ${day} ${month} ${year}`;
};

/**
 * Transforme une entrée de base vers le format application
 */
const transformFromDatabase = (entry: DatabaseLotteryEntry): LotteryHistoryEntry => ({
  id: entry.id,
  title: entry.title || generateDefaultTitle(new Date(entry.created_at)),
  winner: {
    id: `winner-${entry.id}`,
    name: entry.winner_name,
    isFromSaved: entry.winner_is_from_saved
  },
  elements: entry.participants_list,
  elementsCount: entry.participants_count,
  timestamp: new Date(entry.created_at),
  userId: entry.user_id
});

/**
 * Service pour gérer l'historique des tirages
 */
export class LotteryHistoryService {
  /**
   * Sauvegarder un tirage en base de données
   */
  static async saveLotteryResult(
    winner: LotteryItem,
    elements: LotteryItem[],
    title?: string
  ): Promise<LotteryHistoryEntry | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        logger.warn("Impossible de sauvegarder l'historique", "utilisateur non connecté");
        return null;
      }

      const timestamp = new Date();
      const finalTitle = title?.trim() || generateDefaultTitle(timestamp);

      const { data, error } = await supabase
        .from("lottery_history")
        .insert({
          user_id: user.id,
          title: finalTitle,
          winner_name: winner.name,
          winner_is_from_saved: winner.isFromSaved || false,
          participants_count: elements.length,
          participants_list: elements,
        })
        .select()
        .single();

      if (error) {
        logSupabaseError("sauvegarde du tirage", error);
        return null;
      }

      return transformFromDatabase(data);
    } catch (error) {
      logSupabaseError("erreur inattendue sauvegarde", error);

      Sentry.captureException(error, {
        tags: {
          service: 'lotteryHistory',
          action: 'save'
        },
        extra: {
          winnerName: winner.name,
          elementsCount: elements.length,
          title
        }
      });

      return null;
    }
  }

  /**
   * Récupérer l'historique des tirages (50 derniers)
   */
  static async getLotteryHistory(): Promise<LotteryHistoryEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        logger.warn("Aucun historique en base", "utilisateur non connecté");
        return [];
      }

      const { data, error } = await supabase
        .from("lottery_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        logSupabaseError("récupération de l'historique", error);
        return [];
      }

      return (data || []).map(transformFromDatabase);
    } catch (error) {
      logSupabaseError("erreur inattendue récupération", error);

      Sentry.captureException(error, {
        tags: {
          service: 'lotteryHistory',
          action: 'get'
        }
      });

      return [];
    }
  }

  /**
   * Supprimer un tirage de l'historique
   */
  static async deleteLotteryEntry(entryId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        logger.warn("Impossible de supprimer", "utilisateur non connecté");
        return false;
      }

      const { error } = await supabase
        .from("lottery_history")
        .delete()
        .eq("id", entryId)
        .eq("user_id", user.id); // Sécurité supplémentaire

      if (error) {
        logSupabaseError("suppression entrée historique", error);
        return false;
      }

      return true;
    } catch (error) {
      logSupabaseError("erreur inattendue suppression", error);

      Sentry.captureException(error, {
        tags: {
          service: 'lotteryHistory',
          action: 'delete'
        },
        extra: { entryId }
      });

      return false;
    }
  }

  /**
   * Vider complètement l'historique
   */
  static async clearLotteryHistory(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        logger.warn("Impossible de vider l'historique", "utilisateur non connecté");
        return false;
      }

      const { error } = await supabase
        .from("lottery_history")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        logSupabaseError("vidage de l'historique", error);
        return false;
      }

      return true;
    } catch (error) {
      logSupabaseError("erreur inattendue vidage", error);

      Sentry.captureException(error, {
        tags: {
          service: 'lotteryHistory',
          action: 'clear'
        }
      });

      return false;
    }
  }
}