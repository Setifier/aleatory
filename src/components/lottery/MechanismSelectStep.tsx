import { motion } from "framer-motion";

export type DrawMechanism = "wheel" | "slot" | "elimination" | "classement";

const MECHANISMS: {
  id: DrawMechanism;
  icon: string;
  label: string;
  desc: string;
}[] = [
  {
    id: "wheel",
    icon: "/assets/icone_wheel.png",
    label: "Roue",
    desc: "Gagnant unique par la roue",
  },
  {
    id: "slot",
    icon: "/assets/icone_machine.png",
    label: "Machine à sous",
    desc: "Gagnant unique par tirage",
  },
  {
    id: "elimination",
    icon: "/assets/icone_winup.png",
    label: "Élimination",
    desc: "Du dernier au champion",
  },
  {
    id: "classement",
    icon: "/assets/icone_windown.png",
    label: "Classement",
    desc: "Du 1er au dernier",
  },
];

interface MechanismSelectStepProps {
  onSelect: (mechanism: DrawMechanism) => void;
}

export default function MechanismSelectStep({ onSelect }: MechanismSelectStepProps) {
  return (
    <div className="px-6 pt-6 pb-4">
      <div className="text-center mb-5">
        <h3 className="text-xl font-black text-white uppercase tracking-wide">
          Mode de tirage
        </h3>
        <p className="text-white/40 text-sm mt-1">
          Choisissez comment désigner le gagnant
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MECHANISMS.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(m.id)}
            className="flex flex-col items-center gap-2 px-3 py-5 rounded-2xl text-center transition-all group"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            whileHover={{ scale: 1.03, backgroundColor: "rgba(97,97,216,0.1)" }}
            whileTap={{ scale: 0.97 }}
          >
            <img src={m.icon} alt={m.label} className="w-10 h-10 object-contain" />
            <div>
              <p className="font-bold text-white text-sm leading-tight">{m.label}</p>
              <p className="text-white/35 text-xs mt-0.5 leading-tight">{m.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
