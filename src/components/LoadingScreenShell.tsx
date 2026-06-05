type Props = {
  brandMain: string;
  brandAccent: string;
};

export function LoadingScreenShell({ brandMain, brandAccent }: Props) {
  return (
    <div id="loading-ssr">
      <div className="loading-logo">
        {brandMain}<span>{brandAccent}</span>
      </div>
      <div className="loading-bar-wrap">
        <div className="loading-bar" style={{ width: "0%" }} />
      </div>
      <div className="loading-text" />
    </div>
  );
}
