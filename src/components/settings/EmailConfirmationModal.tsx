interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingEmailChange: {
    oldEmail: string;
    newEmail: string;
    expiresAt: number;
  };
}

const EmailConfirmationModal = ({ isOpen, onClose, pendingEmailChange }: EmailConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "rgba(10,10,38,0.98)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
        <h3 className="text-base font-black text-white uppercase tracking-wide mb-5">
          📧 Changement d'email initié
        </h3>

        <div className="space-y-2.5 mb-6">
          <div className="px-4 py-3 rounded-xl"
            style={{ background: "rgba(97,97,216,0.1)", border: "1px solid rgba(97,97,216,0.2)" }}>
            <p className="font-bold text-primary-300 text-xs uppercase tracking-wider mb-1.5">Étape 1</p>
            <p className="text-white/70 text-sm">Vérifiez <strong className="text-white">{pendingEmailChange.newEmail}</strong></p>
            <p className="text-white/50 text-xs mt-0.5">→ Cliquez sur le lien de confirmation</p>
          </div>

          <div className="px-4 py-3 rounded-xl"
            style={{ background: "rgba(232,149,42,0.08)", border: "1px solid rgba(232,149,42,0.2)" }}>
            <p className="font-bold text-xs uppercase tracking-wider mb-1.5" style={{ color: "#f0b96a" }}>Étape 2</p>
            <p className="text-white/70 text-sm">Vérifiez <strong className="text-white">{pendingEmailChange.oldEmail}</strong></p>
            <p className="text-white/50 text-xs mt-0.5">→ Cliquez sur le lien de confirmation</p>
          </div>

          <div className="px-4 py-3 rounded-xl"
            style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.15)" }}>
            <p className="text-xs font-semibold" style={{ color: "rgba(255,215,0,0.7)" }}>
              ⚠️ Vous serez déconnecté après validation des 2 emails. Reconnectez-vous avec votre nouvelle adresse.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-sm transition-all"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmationModal;
