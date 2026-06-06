import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

function AdminDashboard() {
  // 1. stats: stores data from backend (null initially means "not loaded yet")
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  // 2. Get logged-in user info and logout function from AuthContext
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 3. Run fetchStats once when component first appears (empty array = run only once)
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 4. GET request to admin dashboard endpoint (token automatically added by api.js)
      const response = await API.get("/admin/dashboard");
      setStats(response.data);
      console.log("Dashboard stats:", response.data);
    } catch (err) {
      setError("Failed to load dashboard");
      console.error("Dashboard error:", err);
    }
  };

  const handleLogout = () => {
    logout();               // Clear token and user from localStorage
    navigate("/login");     // Redirect to login page
  };

  // 5. Show loading message while stats are being fetched
  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <div>
        <h2>Admin Dashboard</h2>
        <div>
          {/* 6. user?.name → optional chaining: if user exists, show name */}
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <div>
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div>
          <h3>Total Stores</h3>
          <p>{stats.totalStores}</p>
        </div>
        <div>
          <h3>Total Ratings</h3>
          <p>{stats.totalRatings}</p>
        </div>
      </div>

      <div>
        {/* 7. Navigate to other admin pages when buttons are clicked */}
        <button onClick={() => navigate("/admin/users")}>Manage Users</button>
        <button onClick={() => navigate("/admin/stores")}>Manage Stores</button>
      </div>
    </div>
  );
}

export default AdminDashboard;