type Props = {
  progress: number;
  text: string;
  hidden: boolean;
  brandMain: string;
  brandAccent: string;
};

export function LoadingScreen({ progress, text, hidden, brandMain, brandAccent }: Props) {
  return (
    <div id="loading" className={hidden ? "hidden" : ""}>
      <div className="loading-logo">
        {brandMain}<span>{brandAccent}</span>
      </div>
      <div className="loading-bar-wrap">
        <div className="loading-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-text">{text}</div>
    </div>
  );
}
