const router = require("express").Router();
const auth = require("../middleware/auth");

const {
  createField,
  getFields,
  getFieldById,
  updateField,
  deleteField,

  getFieldWithStats,
  getFieldHistory,
  getFieldYearStats,

  addYield,
  addFertilization,
  addPruning,
  addSpraying,

  editYield,
  editFertilization,
  editPruning,
  editSpraying,
  getRecord,

  deleteYield,
  deleteFertilization,
  deletePruning,
  deleteSpraying,
  addRecordMedia,
  deleteRecordMedia
} = require("../controllers/fields.controller");

/* FIELD CRUD */
router.post("/", auth, createField);
router.get("/", auth, getFields);
router.get("/:id", auth, getFieldById);
router.put("/:id", auth, updateField);
router.delete("/:id", auth, deleteField);


/* MEDIA FOR RECORDS */
router.post("/:id/:recordType/:recordId/media", auth, addRecordMedia);
router.delete("/:id/:recordType/:recordId/media/:mediaId", auth, deleteRecordMedia);



/* STATS & HISTORY */
router.get("/:id/stats", auth, getFieldWithStats);
router.get("/:id/history", auth, getFieldHistory);
router.get("/:id/year-stats/:year", auth, getFieldYearStats);

/* ADD RECORDS */
router.post("/:id/oil", auth, addYield);
router.post("/:id/fertilization", auth, addFertilization);
router.post("/:id/pruning", auth, addPruning);
router.post("/:id/spraying", auth, addSpraying);


/* EDIT RECORDS */
router.put("/:id/oil/:recordId", auth, editYield);
router.put("/:id/fertilization/:recordId", auth, editFertilization);
router.put("/:id/pruning/:recordId", auth, editPruning);
router.put("/:id/spraying/:recordId", auth, editSpraying);

/* DELETE RECORDS */
router.delete("/:id/oil/:recordId", auth, deleteYield);
router.delete("/:id/fertilization/:recordId", auth, deleteFertilization);
router.delete("/:id/pruning/:recordId", auth, deletePruning);
router.delete("/:id/spraying/:recordId", auth, deleteSpraying);

router.get("/:id/oil/:recordId", auth, getRecord);
router.get("/:id/fertilization/:recordId", auth, getRecord);
router.get("/:id/pruning/:recordId", auth, getRecord);
router.get("/:id/spraying/:recordId", auth, getRecord);


module.exports = router;
