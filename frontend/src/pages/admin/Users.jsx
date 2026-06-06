import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

function AdminUsers() {

  // 1. List of users fetched from backend
  const [users, setUsers] = useState([]);

  // 2. Filter object: name, email, address, role (empty string means no filter)
  const [filters, setFilters] = useState({ name: "", email: "", address: "", role: "" });

  // 3. Which column to sort by (name, email, address, role)
  const [sortBy, setSortBy] = useState("name");

  // 4. Sort order: "asc" (A→Z) or "desc" (Z→A)
  const [order, setOrder] = useState("asc");
  const [error, setError] = useState("");

  // 5. Stores a single user object when admin clicks "View" on a row
  const [selectedUser, setSelectedUser] = useState(null);

  // 6. Toggle to show/hide the "Add New User" form
  const [showAddForm, setShowAddForm] = useState(false);

  // 7. New user form data (default role is "user")
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", address: "", role: "user" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const { logout } = useAuth();
  const navigate = useNavigate();

  // 8. Re‑fetch users whenever filters, sortBy, or order change
  useEffect(() => {
    fetchUsers();
  }, [filters, sortBy, order]);

  // 9. Fetch users from backend with query params (filters + sort)
  const fetchUsers = async () => {
    try {
      const response = await API.get("/admin/users", {
        params: { ...filters, sortBy, order },
      });
      setUsers(response.data);
      console.log("Users:", response.data);
    } catch (err) {
      setError("Failed to load users");
    }
  };

  // 10. Fetch a single user by ID when admin clicks "View"
  const fetchUserById = async (id) => {
    try {
      const response = await API.get(`/admin/users/${id}`);
      setSelectedUser(response.data);
      console.log("Selected user:", response.data);
    } catch (err) {
      setError("Failed to load user details");
    }
  };

  // 11. Update filter values when user types in filter inputs
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // 12. Submit handler for "Add New User" form
  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    try {

      // 13. POST to /admin/users with new user data
      await API.post("/admin/users", newUser);
      setFormSuccess("User created successfully");

      // Reset form fields
      setNewUser({ name: "", email: "", password: "", address: "", role: "user" });

      // Refresh the user list
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <div>
        <h2>Manage Users</h2>
        <div>
          <button onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/admin/stores")}>Stores</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Filters section */}
      <div>
        <input name="name" placeholder="Filter by name" value={filters.name} onChange={handleFilterChange} />
        <input name="email" placeholder="Filter by email" value={filters.email} onChange={handleFilterChange} />
        <input name="address" placeholder="Filter by address" value={filters.address} onChange={handleFilterChange} />
        <select name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      {/* Sort controls */}
      <div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
          <option value="address">Sort by Address</option>
          <option value="role">Sort by Role</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Users table */}
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.address}</td>
              <td>{user.role}</td>
              <td>
                {/* 14. When clicked, fetch and show details of that user */}
                <button onClick={() => fetchUserById(user.id)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* User detail box (appears only if selectedUser is not null) */}
      {selectedUser && (
        <div>
          <h3>User Details</h3>
          <p>Name: {selectedUser.name}</p>
          <p>Email: {selectedUser.email}</p>
          <p>Address: {selectedUser.address}</p>
          <p>Role: {selectedUser.role}</p>
          
          {/* 15. avgRating may not exist for all users, check with undefined */}
          {selectedUser.avgRating !== undefined && (
            <p>Average Rating: {selectedUser.avgRating}</p>
          )}
          <button onClick={() => setSelectedUser(null)}>Close</button>
        </div>
      )}

      {/* Add New User section */}
      <div>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "Add New User"}
        </button>

        {showAddForm && (
          <form onSubmit={handleAddUser}>
            <h3>Add New User</h3>
            {formError && <p style={{ color: "red" }}>{formError}</p>}
            {formSuccess && <p style={{ color: "green" }}>{formSuccess}</p>}
            <div>
              <input placeholder="Name" value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
            </div>
            <div>
              <input placeholder="Email" type="email" value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
            </div>
            <div>
              <input placeholder="Password" type="password" value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
            </div>
            <div>
              <textarea placeholder="Address" value={newUser.address}
                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} required />
            </div>
            <div>
              <select value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit">Create User</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;