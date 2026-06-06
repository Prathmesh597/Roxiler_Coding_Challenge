const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { validatePassword, validateRating } = require("../utils/validate");


//1. Normal User - Get All Stores with ratings
const getStores = async (req, res) => {
  try {

    //1. query parameters to search
    const { name, address, sortBy, order } = req.query;

    //2. Getting logged in user's id
    const userId = req.user.id;

    //3. base query
    // SELECT:
    // - Store ID
    // - Store Name
    // - Store Address
    // - Average Rating of store
    // - Logged-in user's rating for that store
    let query = `SELECT s.id, s.name, s.address,
            COALESCE(AVG(r.rating), 0) as avgRating,
            MAX(CASE WHEN r.user_id = ? THEN r.rating END) as userRating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE 1=1`;
    
    //4. Parameters array
    const params = [userId];

    //6. filter by name
     if (name) {
      query += " AND s.name LIKE ?";
      params.push(`%${name}%`);
    }

    //7. filter by address
    if (address) {
      query += " AND s.address LIKE ?";
      params.push(`%${address}%`);
    }

    //8. Group records by store
    query += " GROUP BY s.id, s.name, s.address";

    //9. sort by - 'name', 'address' OR 'avgRating'
    const validSortFields = ["name", "address", "avgRating"];

    //Default Sortby 'name'
    let sortField = "name";
    if (validSortFields.includes(sortBy)) {
      sortField = sortBy;
    }

    //10. order by  - 'asc' OR 'desc'
    const validOrders = ["asc", "desc"];

    // Default Orderby 'asc'
    let sortOrder = "asc";

    if (validOrders.includes(order?.toLowerCase())) {
      sortOrder = order.toLowerCase();
    }

    //11. Add ORDER BY clause
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    //12. Execute Query
    const [stores] = await db.query(query, params);

    //13. Send stores data as JSON response
    res.json(stores);


  }catch(error){
    res.status(500).json({ message: "Failed to get Store", error: error.message });
  }
}


//2. Normal User - Submit Rating for a Store
const submitRating = async (req, res) => {
  try {

    //1. Get store_id and rating from request body
    const { store_id, rating } = req.body;

    //2. Get logged-in user's ID
    const userId = req.user.id;

    //3.  Validate rating
    const ratingError = validateRating(rating);
    if (ratingError) return res.status(400).json({ message: ratingError });

    //4. Check if store exists
    const [store] = await db.query(
      "SELECT id FROM stores WHERE id = ?",
      [store_id]
    );

    //5.  If store NOT found, Error message
    if (store.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    //6. Check if user already rated this store
    const [existingRating] = await db.query(
      "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
      [userId, store_id]
    );

    //7. If rating already exists, Error message
    if (existingRating.length > 0) {
      return res.status(400).json({ message: "You have already rated this store. Use update instead." });
    }

    //8. Insert new rating
    await db.query(
      "INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)",
      [userId, store_id, rating]
    );

    //9. Send success response
    res.status(201).json({ message: "Rating submitted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//3. Normal User - Update Submitted Rating
const updateRating = async (req, res) => {
  try {

    //1. Request Body store_id and new rating
    const { store_id, rating } = req.body;

    //2. Get logged-in user's ID
    const userId = req.user.id;

    //3.  Validate rating
    const ratingError = validateRating(rating);
    if (ratingError) return res.status(400).json({ message: ratingError });

    //4.  Check if rating exists
    const [existingRating] = await db.query(
      "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
      [userId, store_id]
    );

    //5.  If rating NOT exists, Error message
    if (existingRating.length === 0) {
      return res.status(404).json({ message: "No rating found. Submit a rating first." });
    }

    //6.  Update rating
    await db.query(
      "UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?",
      [rating, userId, store_id]
    );

    //7. Return success response
    res.json({ message: "Rating updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//4. Normal User - Update Password
const updatePassword = async (req, res) => {
  try {

    //1. passwords from request body
    const { currentPassword, newPassword } = req.body;

    //2. Get logged-in user's ID
    const userId = req.user.id;

    //3.  Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) return res.status(400).json({ message: passwordError });

    //4. Get current user's password from database
    const [users] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    //5. Compare current password with stored hashed password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);

    // 6. If password does NOT match, Error message
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    //7. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //8. Update password in database
    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );

    //9. Return success response
    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  getStores,
  submitRating,
  updateRating,
  updatePassword,
};