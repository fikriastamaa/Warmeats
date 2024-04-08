const express = require("express");
const router = express.Router();

const {
  getAllWarmindo,
  getWarmindoById,
  postWarmindo,
  updateWarmindo,
  deleteWarmindo,
} = require("../controller/warmindo");

// get all warmindo
router.get("/api/warmindos/fetch-all", getAllWarmindo);

// get all warmindo by id
router.get("/api/warmindos/:id", getWarmindoById);

//add warmindo
router.post("/api/warmindos/add-warmindo", postWarmindo);

//update warmindo data
router.put("/api/warmindos/:id", updateWarmindo);

//delete warmindo data
router.delete("/api/warmindos/:id", deleteWarmindo);

module.exports = router;
