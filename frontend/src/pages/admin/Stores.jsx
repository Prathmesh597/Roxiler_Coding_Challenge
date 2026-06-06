import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

function AdminStores() {
  // 1. List of stores from backend
  const [stores, setStores] = useState([]);
  // 2. Filter object for name, email, address (empty string = no filter)
  const [filters, setFilters] = useState({ name: "", email: "", address: "" });
  // 3. Sort column (name, email, address, avgRating)
  const [sortBy, setSortBy] = useState("name");
  // 4. Sort order: "asc" (low to high) or "desc" (high to low)
  const [order, setOrder] = useState("asc");
  const [error, setError] = useState("");
  // 5. Toggle to show/hide the "Add New Store" form
  const [showAddForm, setShowAddForm] = useState(false);
  // 6. Form data for creating a new store
  const [newStore, setNewStore] = useState({ name: "", email: "", address: "", owner_id: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  // 7. List of store owners (users with role "store_owner") for dropdown
  const [storeOwners, setStoreOwners] = useState([]);

  const { logout } = useAuth();
  const navigate = useNavigate();

  // 8. Re‑fetch stores whenever filters, sortBy, or order change
  useEffect(() => {
    fetchStores();
  }, [filters, sortBy, order]);

  // 9. Fetch store owners once when component mounts (empty array)
  useEffect(() => {
    fetchStoreOwners();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await API.get("/admin/stores", {
        params: { ...filters, sortBy, order },
      });
      setStores(response.data);
      console.log("Stores:", response.data);
    } catch (err) {
      setError("Failed to load stores");
    }
  };

  const fetchStoreOwners = async () => {
    try {
      // 10. Fetch only users with role "store_owner" from /admin/users
      const response = await API.get("/admin/users", {
        params: { role: "store_owner" },
      });
      setStoreOwners(response.data);
      console.log("Store owners:", response.data);
    } catch (err) {
      console.error("Failed to load store owners");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    try {
      // 11. Convert owner_id from string to integer (or null if empty)
      await API.post("/admin/stores", {
        ...newStore,
        owner_id: newStore.owner_id ? parseInt(newStore.owner_id) : null,
      });
      setFormSuccess("Store created successfully");
      // Reset form
      setNewStore({ name: "", email: "", address: "", owner_id: "" });
      fetchStores(); // Refresh list
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create store");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <div>
        <h2>Manage Stores</h2>
        <div>
          <button onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/admin/users")}>Users</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Filters section */}
      <div>
        <input name="name" placeholder="Filter by name" value={filters.name} onChange={handleFilterChange} />
        <input name="email" placeholder="Filter by email" value={filters.email} onChange={handleFilterChange} />
        <input name="address" placeholder="Filter by address" value={filters.address} onChange={handleFilterChange} />
      </div>

      {/* Sort controls */}
      <div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
          <option value="address">Sort by Address</option>
          <option value="avgRating">Sort by Rating</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Stores table */}
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Average Rating</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id}>
              <td>{store.name}</td>
              <td>{store.email}</td>
              <td>{store.address}</td>
               {/* 12. avgRating may be a string or number; parse to float and show 1 decimal */}
              <td>{parseFloat(store.avgRating).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add New Store section */}
      <div>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "Add New Store"}
        </button>

        {showAddForm && (
          <form onSubmit={handleAddStore}>
            <h3>Add New Store</h3>
            {formError && <p style={{ color: "red" }}>{formError}</p>}
            {formSuccess && <p style={{ color: "green" }}>{formSuccess}</p>}
            <div>
              <input placeholder="Store Name" value={newStore.name}
                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })} required />
            </div>
            <div>
              <input placeholder="Store Email" type="email" value={newStore.email}
                onChange={(e) => setNewStore({ ...newStore, email: e.target.value })} required />
            </div>
            <div>
              <textarea placeholder="Store Address" value={newStore.address}
                onChange={(e) => setNewStore({ ...newStore, address: e.target.value })} required />
            </div>
            <div>
              {/* 13. Dropdown to select an existing store owner (or none) */}
              <select value={newStore.owner_id}
                onChange={(e) => setNewStore({ ...newStore, owner_id: e.target.value })}>
                <option value="">No Owner (assign later)</option>
                {storeOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit">Create Store</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminStores;