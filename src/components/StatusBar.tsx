import type { RefObject } from "react";

type StatusData = {
  engine: string;
  model: string;
  elements: string;
  lod: string;
};

type Props = {
  data: StatusData;
  sbHoverRef: RefObject<HTMLSpanElement | null>;
};

export function StatusBar({ data, sbHoverRef }: Props) {
  return (
    <div className="status-bar">
      <div className="sb-item">
        <div className="sb-dot" />
        Engine: <span className="sb-val">{data.engine}</span>
      </div>
      <div className="sb-item">
        Model: <span className="sb-val">{data.model}</span>
      </div>
      <div className="sb-item">
        Elements: <span className="sb-val">{data.elements}</span>
      </div>
      <div className="sb-item">
        LOD: <span className="sb-val">{data.lod}</span>
      </div>
      <div className="sb-item" style={{ marginLeft: "auto" }}>
        <span ref={sbHoverRef}>Hover a component to explore ↗</span>
      </div>
    </div>
  );
}
