import { Monitor } from "./Monitor";
import { Lamp } from "./Lamp";
import { Books } from "./Books";
import { Plant } from "./Plant";
import { Mug } from "./Mug";
import { Pi } from "./Pi";
import { Notebook } from "./Notebook";
import { RecordConsole, Turntable } from "./RecordConsole";
import { Telescope } from "./Telescope";
import { Decor } from "./Decor";
import { AccentLamps } from "./AccentLamps";
import { ANCHORS } from "../layout";
import { Hotspot, type HitBox } from "../Hotspot";
import { useHotspotActive } from "../hotspots";
import { useFocus } from "../focus";
import { ModelPlane } from "./ModelPlane";
import { BoardingPass } from "./BoardingPass";
import { useAudioPlaying } from "../../audio/audioStore";
import { StaticMerge } from "../StaticMerge";
import type { Vec3 } from "../layout";

const offset = (a: Vec3, dx: number, dy: number, dz: number): Vec3 => [a[0] + dx, a[1] + dy, a[2] + dz];

// Generous hit boxes around each interactive prop (world space, see layout.ts).
const HIT: Record<"monitor" | "pi" | "notebook" | "cassette" | "telescope" | "plane", HitBox> = {
  monitor: { center: ANCHORS.monitorsCenter, size: [1.5, 0.72, 0.26] },
  pi: { center: offset(ANCHORS.pi, -0.09, 0.05, 0), size: [0.42, 0.2, 0.2] }, // Pi + its status display
  notebook: { center: offset(ANCHORS.notebook, 0, 0.03, 0), size: [0.44, 0.08, 0.34] },
  plane: { center: offset(ANCHORS.modelPlane, 0.12, 0.08, 0.03), size: [0.54, 0.18, 0.26] }, // plane + boarding pass
  cassette: { center: offset(ANCHORS.cassette, 0, 0.05, 0), size: [0.4, 0.14, 0.32] },
  telescope: { center: [ANCHORS.telescope[0], 0.75, ANCHORS.telescope[2] - 0.05], size: [0.6, 1.5, 0.8] },
};

/** Everything on the desk and shelf. Positions come from layout.ts ANCHORS; interactive ones are Hotspots. */
export function Props() {
  const focus = useFocus();
  const monitorActive = useHotspotActive("monitor");
  const notebookActive = useHotspotActive("notebook");
  const telescopeActive = useHotspotActive("telescope");
  const planeActive = useHotspotActive("plane");
  const notebookOpen = focus === "notebook";
  const playing = useAudioPlaying();

  return (
    <group>
      <Hotspot id="monitor" hit={HIT.monitor} labelAt={offset(ANCHORS.monitorsCenter, 0, 0.45, 0)}>
        <Monitor active={monitorActive} mode={focus === "monitor" ? "projects" : "code"} />
      </Hotspot>
      <Hotspot id="pi" hit={HIT.pi} labelAt={offset(ANCHORS.pi, 0, 0.2, 0.02)}>
        <Pi focused={focus === "pi"} />
      </Hotspot>
      <Hotspot id="notebook" hit={HIT.notebook} labelAt={offset(ANCHORS.notebook, 0, 0.1, 0.16)}>
        <Notebook active={notebookActive} open={notebookOpen} />
      </Hotspot>
      <Hotspot
        id="cassette"
        hit={HIT.cassette}
        labelAt={offset(ANCHORS.cassette, 0, 0.2, 0.05)}
        labelText={playing ? "lo-fi: on" : "lo-fi"}
      >
        <Turntable playing={playing} />
      </Hotspot>
      <Hotspot id="telescope" hit={HIT.telescope} labelAt={offset(ANCHORS.telescope, -0.25, 1.4, 0.05)}>
        <Telescope active={telescopeActive} focused={focus === "telescope"} />
      </Hotspot>
      <Hotspot id="plane" hit={HIT.plane} labelAt={offset(ANCHORS.modelPlane, -0.02, 0.24, 0.03)}>
        <ModelPlane active={planeActive} />
        <BoardingPass open={focus === "plane"} hover={planeActive} />
      </Hotspot>
      <StaticMerge>
        <Lamp />
        <Books />
        <RecordConsole />
        <Decor />
      </StaticMerge>
      <Plant />
      <Mug />
      <AccentLamps />
    </group>
  );
}
