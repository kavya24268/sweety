import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Sweety</h1>} />
        <Route path="/login" element={<h1>Login</h1>} />
        <Route path="/register" element={<h1>Register</h1>} />
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
        <Route path="/reports" element={<h1>Reports</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;