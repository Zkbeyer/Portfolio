import { motion } from "framer-motion";

export default function PagePreviewWidget({
  title,
  isActive,
  onHoverChange,
  onClick,
}: {
  title: string;
  isActive: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
      onClick={onClick}
      initial={false}
      animate={{
        scale: isActive ? 1 : 0.98,
        opacity: isActive ? 1 : 0.85,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18 }}
      style={{
        pointerEvents: "auto",
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(0,0,0,0.35)",
        color: "rgba(255,255,255,0.92)",
        borderRadius: 16,
        padding: 16,
        width: 320,
        textAlign: "left",
        cursor: "pointer",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      aria-label={`Open ${title}`}
    >
      <div style={{ fontSize: 12, letterSpacing: "0.14em", opacity: 0.7 }}>
        PREVIEW
      </div>
      <div style={{ fontSize: 22, marginTop: 6 }}>{title}</div>

      {/* Fake “preview UI” area — replace this with your own stylized widget later */}
      <div
        style={{
          marginTop: 12,
          borderRadius: 12,
          height: 110,
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 3px, transparent 6px)",
            opacity: 0.2,
            pointerEvents: "none",
          }}
        />
        <div style={{ padding: 12, opacity: 0.85, fontSize: 13 }}>
          Stylized widget goes here.
          <div style={{ opacity: 0.7, marginTop: 6 }}>
            (Cards / stats / mini timeline / etc.)
          </div>
        </div>
      </div>
    </motion.button>
  );
}