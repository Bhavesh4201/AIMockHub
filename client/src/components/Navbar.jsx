import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/InterviewContext";
import "../css/Navbar.css";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">AWARE</Link>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/interview"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Interview
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/feedback"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Feedback
          </NavLink>
        </li>

        <li className="nav-user">
          {user?.email && (
            <span className="nav-email">{user.email}</span>
          )}
          <button
            onClick={handleLogout}
            className="nav-logout"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
