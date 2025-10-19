import "./App.css";
import ClaimReward from "./components/ClaimReward";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎯 Base AccountPaymaster</h1>
      </header>

      <main className="app-main">
        <ClaimReward />
      </main>
    </div>
  );
}

export default App;
