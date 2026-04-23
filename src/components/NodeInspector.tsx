type Props = {
  codeHtml: string;
};

export function NodeInspector({ codeHtml }: Props) {
  return (
    <div className="data-panel">
      <div className="panel-header">
        <span className="panel-title-text">Node Inspector</span>
        <span className="status-indicator">● LIVE SYNC</span>
      </div>
      <div
        className="code-block"
        dangerouslySetInnerHTML={{ __html: codeHtml }}
      />
    </div>
  );
}
