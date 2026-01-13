// Import React Router components
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";

// Import pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";

// Import protected route
import { ProtectedRoute } from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>

      {/* Navigation Bar */}
      <nav className="bg-gray-200 p-6 font-bold flex justify-center gap-6 w-full fixed top-0 left-0 shadow-md z-50">
        <Link to="/register" className="hover:text-blue-500">
          Register
        </Link>
        <Link to="/login" className="hover:text-blue-500">
          Login
        </Link>
        <Link to="/dashboard" className="hover:text-blue-500">
          Dashboard
        </Link>
        <Link to="/products" className="hover:text-blue-500">
          Products
        </Link>
      </nav>

      {/* Page Content */}
      <div className="pt-20">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/register" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
