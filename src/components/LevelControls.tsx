type Props = {
  floorCount: number;
  onAdd: () => void;
  onRemove: () => void;
};

export function LevelControls({ floorCount, onAdd, onRemove }: Props) {
  return (
    <div className="level-controls">
      <button className="lvl-btn" onClick={onAdd} type="button">+</button>
      <span className="lvl-value">{floorCount}</span>
      <button className="lvl-btn" onClick={onRemove} type="button">−</button>
      <span className="lvl-label">PISOS</span>
    </div>
  );
}
