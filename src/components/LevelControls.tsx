type Props = {
  floorCount: number;
  onAdd: () => void;
  onRemove: () => void;
  floorsLabel: string;
};

export function LevelControls({ floorCount, onAdd, onRemove, floorsLabel }: Props) {
  return (
    <div className="level-controls">
      <button className="lvl-btn" onClick={onAdd} type="button">+</button>
      <span className="lvl-value">{floorCount}</span>
      <button className="lvl-btn" onClick={onRemove} type="button">−</button>
      <span className="lvl-label">{floorsLabel}</span>
    </div>
  );
}
