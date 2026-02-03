import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export type Rect = { top: number; left: number; width: number; height: number };

export function ScreenTransitionOverlay({
  rect,
  isOpen,
  onComplete,
  children,
}: {
  rect: Rect | null;
  isOpen: boolean;
  onComplete: () => void;
  children?: React.ReactNode;
}) {
  // Lock scroll while transitioning
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && rect && (
        <motion.div
          initial={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            borderRadius: 18,
            opacity: 1,
          }}
          animate={{
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            borderRadius: 0,
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.9, 0.2, 1] }}
          onAnimationComplete={onComplete}
          style={{
            position: "fixed",
            zIndex: 9999,
            background: "#050608",
            overflow: "hidden",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}