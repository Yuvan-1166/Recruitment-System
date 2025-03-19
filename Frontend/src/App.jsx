import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import './App.css'
import Signup from './components/signup.jsx';
import Login from './components/login.jsx';
import Home from './components/home.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
