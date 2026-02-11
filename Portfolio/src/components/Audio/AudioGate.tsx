import "./audioGate.css";

export default function AudioGate({
  visible,
  onEnable,
}: {
  visible: boolean;
  onEnable: () => void;
}) {
  if (!visible) return null;

  return (
    <button type="button" className="audioGate" onClick={onEnable}>
      Click to enable sound
    </button>
  );
}