import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Home from './pages/Home/Home';
import DashBoard from './pages/DashBoard/DashBoard';
import Login from './pages/Login/Login';


// ... autres pages

function App() {
  return (
    <Router>
      <Header />
      <main className="pt-16 px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/login" element={<Login />} />
          {/* autres routes */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
