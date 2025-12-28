import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  triggerIcon?: string;
  alignment?: "left" | "right";
}

const DropdownMenu = ({
  items,
  triggerIcon = "⋮",
  alignment = "right",
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={menuRef}>
      <motion.button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();

          const rect = e.currentTarget.getBoundingClientRect();
          const menuWidth = 160;

          setMenuPosition({
            top: rect.bottom + 4,
            left: alignment === "right" ? rect.right - menuWidth : rect.left,
          });

          setIsOpen(!isOpen);
        }}
        className="p-1.5 text-white/70 hover:text-white glass-dark hover:glass-strong rounded-lg transition-all"
        aria-label="Menu"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-lg font-bold">{triggerIcon}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed w-44 glass-strong border border-white/10 rounded-xl shadow-glass-lg z-[100] overflow-hidden"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {items.map((item, index) => (
              <motion.button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-all ${
                  item.variant === "danger"
                    ? "text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropdownMenu;
