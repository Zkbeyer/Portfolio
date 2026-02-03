import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        minHeight: "100vh",
        background: "#07080b",
        color: "#e9edf3",
        padding: 28,
      }}
    >
      <Link to="/" style={{ color: "rgba(233,237,243,0.8)" }}>← Back</Link>
      <h1 style={{ marginTop: 14 }}>Contact</h1>
      <p style={{ opacity: 0.75, maxWidth: 650 }}>
        Put email + links here.
      </p>
    </motion.main>
  );
}