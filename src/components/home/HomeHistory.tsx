import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getLotteryHistory,
  deleteLotteryEntry,
  clearLotteryHistory,
  LotteryHistoryEntry,
} from "../../lib/lotteryHistoryService";
import { getUserTournaments, deleteTournament, getTournamentMatches } from "../../lib/tournamentService";
import { Tournament, TournamentMatch } from "../../types/tournament";
import BracketDisplay from "../tournament/BracketDisplay";
import { computeBracket, getR1SlotRanges } from "../../lib/bracketEngine";
import type { BracketSlot } from "../../types/tournamentDraw";
import { LotteryItem } from "../../hooks/useLottery";
import ConfirmModal from "../ui/ConfirmModal";

interface HomeHistoryProps {
  isAuthenticated: boolean;
  refreshKey?: number;
  onRelaunch?: (items: LotteryItem[], title?: string) => void;
}

type MainTab  = "lottery" | "tournament";
type ViewMode = "list" | "participants";

// ── Avatar colors ────────────────────────────────────────────────────────────
const PALETTE = [
  { bg: "rgba(121,101,224,0.22)", color: "#a195f8" },
  { bg: "rgba(232,149,42,0.2)",  color: "#f0b96a" },
  { bg: "rgba(255,64,128,0.2)",  color: "#ff80b0" },
  { bg: "rgba(21,184,168,0.2)",  color: "#4dd4c8" },
  { bg: "rgba(56,168,232,0.2)",  color: "#72c8f4" },
  { bg: "rgba(170,56,216,0.2)",  color: "#cc7eea" },
  { bg: "rgba(56,200,96,0.2)",   color: "#7ddba0" },
  { bg: "rgba(200,144,64,0.2)",  color: "#e8bf80" },
];
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return PALETTE[h % PALETTE.length];
}

// ── Grouping helpers ──────────────────────────────────────────────────────────
interface ParticipantGroup {
  key: string;
  participants: string[];
  entries: LotteryHistoryEntry[];
  winCounts: Record<string, number>;
}

function groupByParticipants(history: LotteryHistoryEntry[]): ParticipantGroup[] {
  const map = new Map<string, LotteryHistoryEntry[]>();
  for (const e of history) {
    if (!e.elements?.length) continue;
    const key = [...e.elements].map(p => p.name.toLowerCase()).sort().join("|");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries())
    .map(([key, entries]) => {
      const winCounts: Record<string, number> = {};
      for (const e of entries) winCounts[e.winner.name] = (winCounts[e.winner.name] ?? 0) + 1;
      return { key, participants: entries[0].elements.map(p => p.name), entries, winCounts };
    })
    .sort((a, b) => b.entries.length - a.entries.length);
}

function leaderboard(winCounts: Record<string, number>, participants: string[]) {
  return participants
    .map(name => ({ name, wins: winCounts[name] ?? 0 }))
    .sort((a, b) => b.wins - a.wins);
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HomeHistory({ isAuthenticated, refreshKey, onRelaunch }: HomeHistoryProps) {
  const [activeTab, setActiveTab] = useState<MainTab>("lottery");
  const [viewMode, setViewMode]   = useState<ViewMode>("list");

  const [lotteryHistory, setLotteryHistory]     = useState<LotteryHistoryEntry[]>([]);
  const [lotteryLoading, setLotteryLoading]     = useState(false);
  const [tournaments, setTournaments]           = useState<Tournament[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);

  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"lottery" | "tournament" | null>(null);
  const [showClearLottery, setShowClearLottery] = useState(false);

  // Lottery detail modal
  const [detailLotteryEntry, setDetailLotteryEntry] = useState<LotteryHistoryEntry | null>(null);

  // Participant group detail modal
  const [detailParticipantGroup, setDetailParticipantGroup] = useState<GroupDef | null>(null);

  // Tournament detail modal
  const [detailTournament, setDetailTournament] = useState<Tournament | null>(null);
  const [detailMatches, setDetailMatches]       = useState<TournamentMatch[]>([]);
  const [detailLoading, setDetailLoading]       = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLotteryLoading(true);
    getLotteryHistory()
      .then(setLotteryHistory)
      .finally(() => setLotteryLoading(false));
    setTournamentsLoading(true);
    getUserTournaments()
      .then(({ tournaments: t }) => setTournaments(t))
      .finally(() => setTournamentsLoading(false));
  }, [isAuthenticated, refreshKey]);

  const participantGroups = useMemo(() => groupByParticipants(lotteryHistory), [lotteryHistory]);

  const confirmDelete = (id: string, type: "lottery" | "tournament") => {
    setDeleteId(id); setDeleteType(type);
  };
  const handleDeleteConfirm = async () => {
    if (!deleteId || !deleteType) return;
    if (deleteType === "lottery") {
      await deleteLotteryEntry(deleteId);
      setLotteryHistory(prev => prev.filter(e => e.id !== deleteId));
    } else {
      await deleteTournament(deleteId);
      setTournaments(prev => prev.filter(t => t.id !== deleteId));
      if (detailTournament?.id === deleteId) setDetailTournament(null);
    }
    setDeleteId(null); setDeleteType(null);
  };
  const handleClearLottery = async () => {
    await clearLotteryHistory();
    setLotteryHistory([]); setShowClearLottery(false);
  };

  const handleOpenTournamentDetail = async (t: Tournament) => {
    setDetailTournament(t);
    setDetailLoading(true);
    setDetailMatches([]);
    const { matches } = await getTournamentMatches(t.id);
    setDetailMatches(matches);
    setDetailLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
          <p className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-2">Historique</p>
          <p className="text-white/35 text-sm mb-3">Connectez-vous pour accéder à votre historique</p>
          <Link to="/signin" className="text-primary-400 hover:text-primary-300 font-medium underline underline-offset-2 transition-colors text-sm">Se connecter</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">

        {/* Section title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary-400 to-secondary-500" />
          <h2 className="text-xl font-black text-white tracking-wide uppercase">Historique</h2>
        </div>

        {/* Main tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: "rgba(255,255,255,0.05)" }}>
          {(["lottery", "tournament"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab ? "bg-primary-600 text-white shadow-lg" : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab === "lottery" ? "Loterie" : "Tournois"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ══════════ LOTERIE ══════════ */}
          {activeTab === "lottery" && (
            <motion.div key="lottery" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
              {lotteryLoading ? <LoadingRows /> : lotteryHistory.length === 0 ? (
                <EmptyState label="Aucun tirage effectué" />
              ) : (
                <>
                  {/* View mode selector */}
                  <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
                    {([
                      { id: "list",         label: "Derniers tirages" },
                      { id: "participants", label: "Participants" },
                    ] as const).map(m => (
                      <button key={m.id} onClick={() => setViewMode(m.id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                          viewMode === m.id ? "bg-white/12 text-white" : "text-white/35 hover:text-white/60"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {viewMode === "list" && (
                      <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <LotteryListView
                          entries={lotteryHistory.slice(0, 50)}
                          totalCount={lotteryHistory.length}
                          onDetail={setDetailLotteryEntry}
                          onClear={() => setShowClearLottery(true)}
                        />
                      </motion.div>
                    )}
                    {viewMode === "participants" && (
                      <motion.div key="participants" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <GroupedView
                          groups={participantGroups.map(g => ({
                            heading: g.participants.slice(0, 4).join(" · ") + (g.participants.length > 4 ? ` +${g.participants.length - 4}` : ""),
                            subheading: `${g.participants.length} participants`,
                            drawCount: g.entries.length,
                            board: leaderboard(g.winCounts, g.participants),
                            participants: g.participants,
                            relaunchItems: g.entries[0].elements,
                          }))}
                          onSelectGroup={setDetailParticipantGroup}
                          onRelaunch={items => onRelaunch?.(items)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

          {/* ══════════ TOURNOIS ══════════ */}
          {activeTab === "tournament" && (
            <motion.div key="tournament" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              {tournamentsLoading ? <LoadingRows /> : tournaments.length === 0 ? (
                <EmptyState label="Aucun tournoi créé" />
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="px-5 py-3 border-b border-white/6">
                    <span className="text-white/35 text-xs font-semibold uppercase tracking-widest">
                      {tournaments.length} tournoi{tournaments.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {tournaments.map(t => {
                      const isGroup = t.format === "group";
                      return (
                        <div
                          key={t.id}
                          className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/3 active:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => handleOpenTournamentDetail(t)}
                        >
                          {/* Format badge */}
                          <div
                            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black tracking-wide"
                            style={isGroup
                              ? { background: "rgba(188,184,143,0.12)", color: "rgba(188,184,143,0.8)", border: "1px solid rgba(188,184,143,0.2)" }
                              : { background: "rgba(97,97,216,0.15)", color: "rgba(161,149,248,0.9)", border: "1px solid rgba(97,97,216,0.25)" }
                            }
                          >
                            {isGroup ? "GRP" : "ÉLIM"}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-semibold text-white text-sm truncate">{t.title}</span>
                              <StatusBadge status={t.status} />
                            </div>
                            <p className="text-xs text-white/30 truncate">
                              {new Date(t.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                              {" · "}{t.participant_count} participants
                            </p>
                          </div>

                          {/* Arrow */}
                          <span className="text-white/20 text-sm flex-shrink-0">›</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Participant group detail modal */}
      <ParticipantGroupModal
        group={detailParticipantGroup}
        onClose={() => setDetailParticipantGroup(null)}
        onRelaunch={(items, title) => { onRelaunch?.(items, title); setDetailParticipantGroup(null); }}
      />

      {/* Lottery detail modal */}
      <LotteryDetailModal
        entry={detailLotteryEntry}
        onClose={() => setDetailLotteryEntry(null)}
        onRelaunch={entry => { onRelaunch?.(entry.elements, entry.title); setDetailLotteryEntry(null); }}
        onDelete={id => { confirmDelete(id, "lottery"); setDetailLotteryEntry(null); }}
      />

      {/* Tournament detail modal */}
      <TournamentDetailModal
        tournament={detailTournament}
        matches={detailMatches}
        loading={detailLoading}
        onClose={() => setDetailTournament(null)}
        onDelete={id => { confirmDelete(id, "tournament"); setDetailTournament(null); }}
      />

      <ConfirmModal isOpen={!!deleteId} title="Supprimer cette entrée" message="Voulez-vous vraiment supprimer cette entrée ?" confirmLabel="Supprimer" cancelLabel="Annuler" isDestructive onConfirm={handleDeleteConfirm} onCancel={() => { setDeleteId(null); setDeleteType(null); }} />
      <ConfirmModal isOpen={showClearLottery} title="Vider l'historique" message="Voulez-vous vraiment supprimer tout l'historique des tirages ?" confirmLabel="Vider" cancelLabel="Annuler" isDestructive onConfirm={handleClearLottery} onCancel={() => setShowClearLottery(false)} />
    </>
  );
}

// ── Draw mode helpers ─────────────────────────────────────────────────────────
const DRAW_MODE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  wheel:       { label: "Roue",        color: "rgba(161,149,248,0.9)", bg: "rgba(97,97,216,0.15)"  },
  slot:        { label: "Slot",        color: "rgba(161,149,248,0.9)", bg: "rgba(97,97,216,0.15)"  },
  elimination: { label: "Élimination", color: "rgba(252,165,165,0.9)", bg: "rgba(239,68,68,0.12)"  },
  classement:  { label: "Classement",  color: "rgba(255,215,0,0.85)",  bg: "rgba(255,215,0,0.10)"  },
};

function DrawModeBadge({ mode }: { mode?: string }) {
  if (!mode) return null;
  const s = DRAW_MODE_LABELS[mode];
  if (!s) return null;
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide flex-shrink-0"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color.replace("0.9", "0.25").replace("0.85", "0.25")}` }}
    >
      {s.label}
    </span>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────
function LotteryListView({ entries, totalCount, onDetail, onClear }: {
  entries: LotteryHistoryEntry[];
  totalCount: number;
  onDetail: (entry: LotteryHistoryEntry) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
        <span className="text-white/35 text-xs font-semibold uppercase tracking-widest">
          {entries.length} dernier{entries.length > 1 ? "s" : ""} tirage{entries.length > 1 ? "s" : ""}
          {totalCount > entries.length && (
            <span className="text-white/20"> · {totalCount} au total</span>
          )}
        </span>
        <button onClick={onClear} className="text-white/25 hover:text-red-400 text-xs transition-colors uppercase tracking-wide">
          Tout effacer
        </button>
      </div>
      <div className="divide-y divide-white/5">
        {entries.map((entry, i) => {
          const col = colorFor(entry.winner.name);
          return (
            <div
              key={entry.id ?? i}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/3 active:bg-white/5 transition-colors cursor-pointer"
              onClick={() => onDetail(entry)}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                style={{ background: col.bg, color: col.color }}>
                {entry.winner.name.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-semibold text-white text-sm truncate">{entry.winner.name}</span>
                  {i === 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide flex-shrink-0"
                      style={{ background: "rgba(255,215,0,0.12)", color: "#ffd700", border: "1px solid rgba(255,215,0,0.2)" }}>
                      Récent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {entry.title && (
                    <span className="text-xs text-white/35 truncate">{entry.title}</span>
                  )}
                  <DrawModeBadge mode={entry.drawMode} />
                  <span className="text-xs text-white/25">
                    {[
                      entry.timestamp.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
                      `${entry.elementsCount} participants`,
                    ].join(" · ")}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <span className="text-white/20 text-sm flex-shrink-0">›</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Grouped view (by participants) ────────────────────────────────────────────
interface GroupDef {
  heading: string;
  subheading?: string;
  drawCount: number;
  board: Array<{ name: string; wins: number }>;
  participants: string[];
  relaunchItems: LotteryItem[];
  relaunchTitle?: string;
}

function GroupedView({ groups, onSelectGroup, onRelaunch }: {
  groups: GroupDef[];
  onSelectGroup: (g: GroupDef) => void;
  onRelaunch: (items: LotteryItem[], title?: string) => void;
}) {
  if (groups.length === 0) return <EmptyState label="Aucun groupe trouvé" />;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="px-5 py-3 border-b border-white/6">
        <span className="text-white/35 text-xs font-semibold uppercase tracking-widest">
          {groups.length} groupe{groups.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="divide-y divide-white/5">
        {groups.map((g, gi) => (
          <div
            key={gi}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/3 active:bg-white/5 transition-colors cursor-pointer"
            onClick={() => onSelectGroup(g)}
          >
            {/* Avatars — 3 max */}
            <div className="flex gap-1 flex-shrink-0">
              {g.participants.slice(0, 3).map((name, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                  style={{ background: colorFor(name).bg, color: colorFor(name).color }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
              ))}
              {g.participants.length > 3 && (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
                >
                  +{g.participants.length - 3}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{g.heading}</p>
              <p className="text-white/30 text-xs mt-0.5">
                {g.participants.length} participants · {g.drawCount} tirage{g.drawCount > 1 ? "s" : ""}
              </p>
            </div>

            {/* Actions — always visible for touch */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {g.relaunchItems.length >= 2 && (
                <button
                  onClick={e => { e.stopPropagation(); onRelaunch(g.relaunchItems, g.relaunchTitle); }}
                  className="text-xs font-bold text-primary-400 hover:text-primary-300 active:text-primary-200 transition-colors px-2 py-1 rounded-lg"
                  style={{ background: "rgba(97,97,216,0.12)" }}
                >
                  Relancer
                </button>
              )}
              <span className="text-white/20 text-sm">›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Participant group detail modal ────────────────────────────────────────────
function ParticipantGroupModal({ group, onClose, onRelaunch }: {
  group: GroupDef | null;
  onClose: () => void;
  onRelaunch: (items: LotteryItem[], title?: string) => void;
}) {
  return (
    <AnimatePresence>
      {group && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", paddingTop: "80px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full sm:max-w-sm flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{
              maxHeight: "calc(100vh - 96px)",
              background: "rgba(10,10,38,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            }}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 38 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wide">
                  Groupe de participants
                </h2>
                <p className="text-white/40 text-xs mt-0.5">
                  {group.participants.length} participants · {group.drawCount} tirage{group.drawCount > 1 ? "s" : ""}
                </p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 text-white/50 hover:text-white transition-all text-sm">
                ✕
              </button>
            </div>

            {/* Leaderboard */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Classement</p>
              <div className="space-y-3">
                {group.board.map((row, ri) => {
                  const pct = group.drawCount > 0 ? (row.wins / group.drawCount) * 100 : 0;
                  const isFirst = ri === 0 && row.wins > 0;
                  return (
                    <div key={row.name} className="flex items-center gap-3">
                      <span className="w-5 text-right text-xs font-black flex-shrink-0"
                        style={{ color: isFirst ? "#ffd700" : "rgba(255,255,255,0.25)" }}>
                        {ri + 1}
                      </span>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: colorFor(row.name).bg, color: colorFor(row.name).color }}>
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate"
                            style={{ color: isFirst ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)" }}>
                            {row.name}
                          </span>
                          <span className="flex-shrink-0 text-xs font-bold ml-3"
                            style={{ color: isFirst ? "#ffd700" : "rgba(255,255,255,0.35)" }}>
                            {row.wins}/{group.drawCount}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.07)" }}>
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, delay: ri * 0.05 }}
                            style={{
                              background: isFirst
                                ? "linear-gradient(90deg, #e8b84b, #ffd700)"
                                : "rgba(97,97,216,0.7)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            {group.relaunchItems.length >= 2 && (
              <div className="px-5 py-4 flex-shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  onClick={() => onRelaunch(group.relaunchItems, group.relaunchTitle)}
                  className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-sm transition-all"
                >
                  Relancer avec ce groupe
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function LoadingRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl py-12 flex flex-col items-center gap-2"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
    >
      <div className="w-8 h-px mb-1" style={{ background: "rgba(255,255,255,0.12)" }} />
      <p className="text-white/30 text-sm uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ── Lottery detail modal ──────────────────────────────────────────────────────
function LotteryDetailModal({ entry, onClose, onRelaunch, onDelete }: {
  entry: LotteryHistoryEntry | null;
  onClose: () => void;
  onRelaunch: (entry: LotteryHistoryEntry) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", paddingTop: "80px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full sm:max-w-sm flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{
              maxHeight: "calc(100vh - 96px)",
              background: "rgba(10,10,38,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            }}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 38 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wide">Détails du tirage</h2>
                <p className="text-white/40 text-xs mt-0.5">
                  {entry.timestamp.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 text-white/50 hover:text-white transition-all text-sm">
                ✕
              </button>
            </div>

            {/* Winner */}
            <div className="px-5 pt-4 pb-3 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {entry.title && (
                <p className="text-white/30 text-xs uppercase tracking-wider mb-2">{entry.title}</p>
              )}
              {entry.drawMode && (
                <div className="mb-3">
                  <DrawModeBadge mode={entry.drawMode} />
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0"
                  style={{ background: colorFor(entry.winner.name).bg, color: colorFor(entry.winner.name).color }}>
                  {entry.winner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-white/35 uppercase tracking-wider mb-0.5">Gagnant</p>
                  <p className="text-xl font-black text-white">{entry.winner.name}</p>
                </div>
                <span className="ml-auto text-2xl">🏆</span>
              </div>
            </div>

            {/* Participants */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-3">
                {entry.elements.length} participant{entry.elements.length > 1 ? "s" : ""}
              </p>
              <div className="space-y-0.5">
                {entry.elements.map((p, pi) => {
                  const isWinner = p.name === entry.winner.name;
                  const col = colorFor(p.name);
                  return (
                    <div key={pi}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl"
                      style={{ background: isWinner ? "rgba(255,215,0,0.05)" : "transparent" }}
                    >
                      <span className="w-4 text-right text-xs flex-shrink-0 tabular-nums"
                        style={{ color: isWinner ? "#ffd700" : "rgba(255,255,255,0.2)" }}>
                        {pi + 1}
                      </span>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: col.bg, color: col.color }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium flex-1 truncate"
                        style={{ color: isWinner ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)" }}>
                        {p.name}
                      </span>
                      {isWinner && <span className="text-sm flex-shrink-0">🏆</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 flex gap-2 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {entry.elements?.length >= 2 && (
                <button onClick={() => onRelaunch(entry)}
                  className="flex-1 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-sm transition-all">
                  Relancer
                </button>
              )}
              {entry.id && (
                <button onClick={() => onDelete(entry.id!)}
                  className="py-2.5 px-4 rounded-xl border border-white/10 text-white/35 hover:text-red-400 hover:border-red-500/25 font-medium text-sm transition-all">
                  Supprimer
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Tournament detail modal ───────────────────────────────────────────────────
function TournamentDetailModal({ tournament, matches, loading, onClose, onDelete }: {
  tournament: Tournament | null;
  matches: TournamentMatch[];
  loading: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {tournament && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", paddingTop: "96px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-[640px] flex flex-col rounded-3xl overflow-hidden"
            style={{
              maxHeight: "calc(100vh - 112px)",
              background: "rgba(10,10,38,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            }}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 360, damping: 38 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="min-w-0">
                <h2 className="text-lg font-black text-white uppercase tracking-wide truncate">
                  {tournament.title}
                </h2>
                <p className="text-white/40 text-xs mt-0.5">
                  {tournament.participant_count} participants
                  {" · "}
                  {tournament.format === "group" ? "Groupes" : "Élimination directe"}
                  {tournament.format !== "group" && tournament.participants_per_match && tournament.participants_per_match > 2
                    ? ` · ${tournament.participants_per_match}v1` : ""}
                  {" · "}
                  {new Date(tournament.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
              <button onClick={onClose}
                className="w-9 h-9 flex-shrink-0 ml-4 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 text-white/50 hover:text-white transition-all">
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-5">
              {loading ? (
                <LoadingRows />
              ) : tournament.format === "group" ? (
                <TournamentGroupDetail matches={matches} />
              ) : (
                <CompactBracketView
                  matches={matches}
                  participantCount={tournament.participant_count}
                  matchSize={tournament.participants_per_match || 2}
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => onDelete(tournament.id)}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  color: "rgba(252,165,165,0.7)",
                }}
              >
                Supprimer ce tournoi
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Group detail ──────────────────────────────────────────────────────────────
function TournamentGroupDetail({ matches }: { matches: TournamentMatch[] }) {
  const groupMap = new Map<string, string[]>();
  for (const m of matches) {
    if (m.stage !== "group" || !m.group_name) continue;
    if (!groupMap.has(m.group_name)) groupMap.set(m.group_name, []);
    for (const p of m.participants) groupMap.get(m.group_name)!.push(p);
  }
  const groups = Array.from(groupMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  if (groups.length === 0) {
    return <p className="text-white/25 text-xs py-2">Aucun détail disponible</p>;
  }

  return (
    <div className="grid gap-2.5"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
      {groups.map(([name, participants]) => (
        <div key={name} className="rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="px-3 py-2"
            style={{ background: "rgba(97,97,216,0.12)", borderBottom: "1px solid rgba(97,97,216,0.18)" }}>
            <p className="text-primary-300 text-xs font-black uppercase tracking-wide">{name}</p>
            <p className="text-white/30 text-[10px]">{participants.length} participant{participants.length > 1 ? "s" : ""}</p>
          </div>
          <div className="px-3 py-2 space-y-1">
            {participants.map((p, pi) => (
              <div key={pi} className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/22 w-3 text-right tabular-nums">{pi + 1}</span>
                <span className="text-white/75 text-xs truncate font-medium">{p}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Compact bracket view ──────────────────────────────────────────────────────
function CompactBracketView({ matches, participantCount, matchSize }: {
  matches: TournamentMatch[];
  participantCount: number;
  matchSize: number;
}) {
  const r32 = matches.filter(m => m.stage === "r32");
  if (r32.length === 0) {
    return <p className="text-white/25 text-xs py-2">Aucun détail de bracket disponible</p>;
  }

  const n  = Math.max(2, participantCount);
  const ms = Math.max(2, matchSize);
  const layout   = computeBracket(n, ms);
  const r1Ranges = getR1SlotRanges(layout);

  const byeSlotIndices = new Set<number>();
  layout.rounds[0].entries.forEach((entry, e) => {
    if (entry.kind === "bye") {
      for (let j = r1Ranges[e][0]; j < r1Ranges[e][1]; j++) byeSlotIndices.add(j);
    }
  });

  const names: (string | null)[] = Array(n).fill(null);
  for (const m of r32) {
    if (m.participants.length === 0) continue;
    const idx = m.match_number - 1;
    if (idx >= 0 && idx < n) names[idx] = m.participants[0];
  }

  const slots: BracketSlot[] = Array.from({ length: n }, (_, i) => ({
    slotIndex: i + 1,
    participant: names[i] ? { id: `h-${i}`, name: names[i]! } : null,
    isBye: byeSlotIndices.has(i),
  }));

  return (
    <BracketDisplay
      slots={slots}
      participantCount={n}
      matchSize={ms}
      compact
    />
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  draft:     { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)", label: "Brouillon" },
  active:    { bg: "rgba(97,216,97,0.12)",   color: "rgba(97,216,97,0.85)",   label: "En cours"  },
  completed: { bg: "rgba(255,215,0,0.1)",    color: "rgba(255,215,0,0.75)",   label: "Terminé"   },
};
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide flex-shrink-0"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
