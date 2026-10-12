import { Monitor } from "./Monitor";
import { Lamp } from "./Lamp";
import { Books } from "./Books";
import { Plant } from "./Plant";
import { Mug } from "./Mug";
import { Pi } from "./Pi";
import { Notebook } from "./Notebook";
import { Cassette } from "./Cassette";
import { Telescope } from "./Telescope";
import { Decor } from "./Decor";
import { ANCHORS, DESK } from "../layout";
import { Hotspot, type HitBox } from "../Hotspot";
import { useHotspotActive } from "../hotspots";
import { PlaneHotspot } from "../window/PlaneHotspot";
import { useAudioPlaying } from "../../audio/audioStore";
import type { Vec3 } from "../layout";

const offset = (a: Vec3, dx: number, dy: number, dz: number): Vec3 => [a[0] + dx, a[1] + dy, a[2] + dz];

// Generous hit boxes around each interactive prop (world space, see layout.ts).
const HIT: Record<"monitor" | "pi" | "notebook" | "cassette" | "telescope", HitBox> = {
  monitor: { center: ANCHORS.monitorsCenter, size: [1.5, 0.72, 0.26] },
  pi: { center: offset(ANCHORS.pi, 0, 0.035, 0), size: [0.24, 0.16, 0.18] },
  notebook: { center: offset(ANCHORS.notebook, 0, 0.03, 0), size: [0.44, 0.08, 0.34] },
  cassette: { center: offset(ANCHORS.cassette, 0, 0.075, 0), size: [0.26, 0.18, 0.14] },
  telescope: { center: [ANCHORS.telescope[0], DESK.topY + 0.24, ANCHORS.telescope[2] - 0.06], size: [0.3, 0.48, 0.6] },
};

/** Everything on the desk and shelf. Positions come from layout.ts ANCHORS; interactive ones are Hotspots. */
export function Props() {
  const monitorActive = useHotspotActive("monitor");
  const notebookActive = useHotspotActive("notebook");
  const telescopeActive = useHotspotActive("telescope");
  const playing = useAudioPlaying();

  return (
    <group>
      <Hotspot id="monitor" hit={HIT.monitor} labelAt={offset(ANCHORS.monitorsCenter, 0, 0.45, 0)}>
        <Monitor active={monitorActive} />
      </Hotspot>
      <Hotspot id="pi" hit={HIT.pi} labelAt={offset(ANCHORS.pi, 0, 0.2, 0.02)}>
        <Pi />
      </Hotspot>
      <Hotspot id="notebook" hit={HIT.notebook} labelAt={offset(ANCHORS.notebook, -0.1, 0.09, 0.16)}>
        <Notebook active={notebookActive} />
      </Hotspot>
      <Hotspot
        id="cassette"
        hit={HIT.cassette}
        labelAt={offset(ANCHORS.cassette, 0, 0.25, 0)}
        labelText={playing ? "lofi: on" : "lofi: off"}
      >
        <Cassette playing={playing} />
      </Hotspot>
      <Hotspot id="telescope" hit={HIT.telescope} labelAt={offset(ANCHORS.telescope, -0.2, 0.62, 0.05)}>
        <Telescope active={telescopeActive} />
      </Hotspot>
      <PlaneHotspot />
      <Lamp />
      <Books />
      <Plant />
      <Mug />
      <Decor />
    </group>
  );
}
