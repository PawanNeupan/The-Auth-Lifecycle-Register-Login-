import { Link } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("access_token"); // Check login status

  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Remove token to logout
    window.location.href = "/login"; // Redirect to login
  };

  return (
    <nav className="bg-blue-500 p-4 text-white flex justify-between">
      <div className="font-bold">MyApp</div>
      <div className="space-x-4">
        {!token ? (
          // Show Login/Register links if not logged in
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        ) : (
          // Show Logout button if logged in
          <button onClick={handleLogout} className="hover:underline">Logout</button>
        )}
      </div>
    </nav>
  );
}
