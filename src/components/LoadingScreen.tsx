export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-emoji">📰</div>
        <div className="loading-title">fetching the tea...</div>
        <div className="loading-sub">getting you the freshest drip rn 💅</div>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
