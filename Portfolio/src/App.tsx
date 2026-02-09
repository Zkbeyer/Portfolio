import { Scroll } from "@react-three/drei";
import ScrollSectionScene from "./components/ScrollSectionScene";
import ProjectsPage from "./pages/Projects/ProjectsPage";

export default function App() {
  return (
    <div style={{ backgroundColor: "white", color: "white" }}>
      <ScrollSectionScene />
    </div>
  );
}