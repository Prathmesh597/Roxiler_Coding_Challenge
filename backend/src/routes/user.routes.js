const express = require("express");
const router = express.Router();
const {
  getStores,
  submitRating,
  updateRating,
  updatePassword,
} = require("../controllers/user.controller");
const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.get("/stores", verifyToken, authorizeRoles("user"), getStores);
router.post("/ratings", verifyToken, authorizeRoles("user"), submitRating);
router.put("/ratings", verifyToken, authorizeRoles("user"), updateRating);
router.put("/password", verifyToken, authorizeRoles("user"), updatePassword);

module.exports = router;