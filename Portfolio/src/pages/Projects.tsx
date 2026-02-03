import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Projects() {
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
      <h1 style={{ marginTop: 14 }}>Projects</h1>
      <p style={{ opacity: 0.75, maxWidth: 650 }}>
        Replace this with your project layout. This page is where the CRT “expands into.”
      </p>
    </motion.main>
  );
}