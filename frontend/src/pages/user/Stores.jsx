import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

function UserStores() {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: "", address: "" });
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [error, setError] = useState("");
  const [ratingInputs, setRatingInputs] = useState({});
  const [ratingMessages, setRatingMessages] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, [filters, sortBy, order]);

  const fetchStores = async () => {
    try {
      const response = await API.get("/user/stores", {
        params: { ...filters, sortBy, order },
      });
      setStores(response.data);
      console.log("Stores:", response.data);
    } catch (err) {
      setError("Failed to load stores");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRatingSubmit = async (storeId, isUpdate) => {
    const rating = ratingInputs[storeId];
    if (!rating) return;

    try {
      if (isUpdate) {
        await API.put("/user/ratings", { store_id: storeId, rating: parseInt(rating) });
      } else {
        await API.post("/user/ratings", { store_id: storeId, rating: parseInt(rating) });
      }
      setRatingMessages({ ...ratingMessages, [storeId]: isUpdate ? "Rating updated!" : "Rating submitted!" });
      fetchStores();
    } catch (err) {
      setRatingMessages({ ...ratingMessages, [storeId]: err.response?.data?.message || "Failed" });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    try {
      await API.put("/user/password", passwordData);
      setPasswordSuccess("Password updated successfully");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <div>
        <h2>Stores</h2>
        <div>
          <span>Welcome, {user?.name}</span>
          <button onClick={() => setShowPasswordForm(!showPasswordForm)}>
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Change Password Form */}
      {showPasswordForm && (
        <div>
          <h3>Change Password</h3>
          {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
          {passwordSuccess && <p style={{ color: "green" }}>{passwordSuccess}</p>}
          <form onSubmit={handlePasswordUpdate}>
            <input
              type="password"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />
            <button type="submit">Update Password</button>
          </form>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Filters */}
      <div>
        <input name="name" placeholder="Search by name" value={filters.name} onChange={handleFilterChange} />
        <input name="address" placeholder="Search by address" value={filters.address} onChange={handleFilterChange} />
      </div>

      {/* Sort */}
      <div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="address">Sort by Address</option>
          <option value="avgRating">Sort by Rating</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Stores Table */}
      <table border="1">
        <thead>
          <tr>
            <th>Store Name</th>
            <th>Address</th>
            <th>Overall Rating</th>
            <th>Your Rating</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id}>
              <td>{store.name}</td>
              <td>{store.address}</td>
              <td>{parseFloat(store.avgRating).toFixed(1)}</td>
              <td>{store.userRating || "Not rated"}</td>
              <td>
                <select
                  value={ratingInputs[store.id] || ""}
                  onChange={(e) => setRatingInputs({ ...ratingInputs, [store.id]: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button onClick={() => handleRatingSubmit(store.id, store.userRating !== null)}>
                  {store.userRating !== null ? "Update Rating" : "Submit Rating"}
                </button>
                {ratingMessages[store.id] && (
                  <span style={{ color: "green" }}>{ratingMessages[store.id]}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserStores;