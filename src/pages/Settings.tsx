import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { motion } from "framer-motion";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { logger } from "../lib/logger";
import AnimatedBackground from "../components/ui/AnimatedBackground";
import ProfileSection from "../components/settings/ProfileSection";
import SecuritySection from "../components/settings/SecuritySection";
import SessionSection from "../components/settings/SessionSection";
import AdvancedActionsSection from "../components/settings/AdvancedActionsSection";
import EmailConfirmationModal from "../components/settings/EmailConfirmationModal";

const Settings = () => {
  usePageTitle("Paramètres");
  const auth = UserAuth();
  const navigate = useNavigate();
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState<{
    oldEmail: string;
    newEmail: string;
    expiresAt: number;
  } | null>(null);

  const handleSignOut = async () => {
    try {
      const result = await auth?.signOut();
      if (result?.success) navigate("/signin");
    } catch (error) {
      logger.error("Sign out error", error);
    }
  };

  const savePendingEmailChange = useCallback(
    (data: { oldEmail: string; newEmail: string; expiresAt: number } | null) => {
      if (data) localStorage.setItem("pendingEmailChange", JSON.stringify(data));
      else localStorage.removeItem("pendingEmailChange");
    },
    []
  );

  const loadPendingEmailChange = useCallback(() => {
    try {
      const saved = localStorage.getItem("pendingEmailChange");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }, []);

  const handleEmailChangeRequested = useCallback(
    (pendingData: { oldEmail: string; newEmail: string; expiresAt: number }) => {
      setPendingEmailChange(pendingData);
      savePendingEmailChange(pendingData);
      setShowEmailConfirmModal(true);
    },
    [savePendingEmailChange]
  );

  const checkEmailConfirmations = useCallback(() => {
    if (!pendingEmailChange || !auth?.session?.user) return;
    const { newEmail, expiresAt } = pendingEmailChange;
    if (Date.now() > expiresAt) {
      setPendingEmailChange(null);
      savePendingEmailChange(null);
      return;
    }
    if (auth.session.user.email === newEmail) {
      setPendingEmailChange(null);
      savePendingEmailChange(null);
    }
  }, [pendingEmailChange, auth?.session?.user, savePendingEmailChange]);

  useEffect(() => {
    const saved = loadPendingEmailChange();
    if (saved) setPendingEmailChange(saved);
  }, [loadPendingEmailChange]);

  useEffect(() => {
    if (!pendingEmailChange) return;
    checkEmailConfirmations();
    const interval = setInterval(checkEmailConfirmations, 5000);
    return () => clearInterval(interval);
  }, [pendingEmailChange, checkEmailConfirmations]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") checkEmailConfirmations();
    });
    return () => subscription.unsubscribe();
  }, [checkEmailConfirmations]);

  if (!auth?.session) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <AnimatedBackground variant="mesh" />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="rounded-2xl p-8 text-center max-w-md w-full"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h1 className="text-2xl font-black text-white uppercase tracking-wide mb-3">
              Connexion requise
            </h1>
            <p className="text-white/40 text-sm mb-6">
              Vous devez être connecté pour accéder aux paramètres.
            </p>
            <Link to="/signin"
              className="inline-flex items-center px-5 py-3 rounded-2xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-sm transition-all">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground variant="mesh" />

      <div className="relative z-10 max-w-4xl mx-auto py-8 sm:py-16 px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-white/25 text-xs mb-4">
            <Link to="/" className="hover:text-white/50 transition-colors">Accueil</Link>
            <span>›</span>
            <span className="text-white/50">Paramètres</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary-400 to-secondary-500" />
            <h1 className="text-xl font-black text-white uppercase tracking-wide">Paramètres</h1>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ProfileSection onEmailChangeRequested={handleEmailChangeRequested} />
          <SecuritySection />
          <SessionSection onSignOut={handleSignOut} />
          <AdvancedActionsSection />
        </motion.div>

        {pendingEmailChange && (
          <EmailConfirmationModal
            isOpen={showEmailConfirmModal}
            onClose={() => setShowEmailConfirmModal(false)}
            pendingEmailChange={pendingEmailChange}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
