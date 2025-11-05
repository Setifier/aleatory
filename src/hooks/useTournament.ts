import { useState, useCallback } from "react";
import {
  Tournament,
  TournamentMatch,
  TournamentCreationForm,
} from "../types/tournament";
import {
  createTournament,
  getUserTournaments,
  getTournamentById,
  createTournamentMatches,
  getTournamentMatches,
  updateTournamentStatus,
  deleteTournament,
} from "../lib/tournamentService";
import { generateTournament } from "../lib/tournamentGenerator";

export const useTournament = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(
    null
  );
  const [currentMatches, setCurrentMatches] = useState<TournamentMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getUserTournaments();

    if (result.error) {
      setError(result.error);
    } else {
      setTournaments(result.tournaments);
    }

    setLoading(false);
  }, []);

  const loadTournament = useCallback(async (tournamentId: string) => {
    setLoading(true);
    setError(null);

    const [tournamentResult, matchesResult] = await Promise.all([
      getTournamentById(tournamentId),
      getTournamentMatches(tournamentId),
    ]);

    if (tournamentResult.error) {
      setError(tournamentResult.error);
    } else if (tournamentResult.tournament) {
      setCurrentTournament(tournamentResult.tournament);
    }

    if (matchesResult.error) {
      setError(matchesResult.error);
    } else {
      setCurrentMatches(matchesResult.matches);
    }

    setLoading(false);
  }, []);

  const createNewTournament = useCallback(
    async (form: TournamentCreationForm) => {
      setLoading(true);
      setError(null);

      const tournamentResult = await createTournament(form);

      if (!tournamentResult.success || !tournamentResult.tournament) {
        setError(tournamentResult.error || "Failed to create tournament");
        setLoading(false);
        return { success: false, error: tournamentResult.error };
      }

      const tournament = tournamentResult.tournament;
      const matches = generateTournament(tournament.id, form);
      const matchesResult = await createTournamentMatches(
        tournament.id,
        matches
      );

      if (!matchesResult.success) {
        setError(matchesResult.error || "Failed to create matches");
        setLoading(false);
        return { success: false, error: matchesResult.error };
      }

      await updateTournamentStatus(tournament.id, "active");

      setLoading(false);
      return { success: true, tournament };
    },
    []
  );

  const removeTournament = useCallback(async (tournamentId: string) => {
    setLoading(true);
    setError(null);

    const result = await deleteTournament(tournamentId);

    if (result.success) {
      setTournaments((prev) => prev.filter((t) => t.id !== tournamentId));
    } else {
      setError(result.error || "Failed to delete tournament");
    }

    setLoading(false);
    return result;
  }, []);

  return {
    tournaments,
    currentTournament,
    currentMatches,
    loading,
    error,
    loadTournaments,
    loadTournament,
    createNewTournament,
    removeTournament,
  };
};
