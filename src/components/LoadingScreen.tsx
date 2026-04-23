type Props = {
  progress: number;
  text: string;
  hidden: boolean;
};

export function LoadingScreen({ progress, text, hidden }: Props) {
  return (
    <div id="loading" className={hidden ? "hidden" : ""}>
      <div className="loading-logo">
        ARQ<span>_DEV</span>
      </div>
      <div className="loading-bar-wrap">
        <div className="loading-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-text">{text}</div>
    </div>
  );
}
