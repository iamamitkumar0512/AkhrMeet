import "./App.css";
import { Route, Routes } from "react-router-dom";
import Lobby from "./Lobby";
import Room from "./Room";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Lobby />}></Route>
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </div>
  );
}

export default App;
