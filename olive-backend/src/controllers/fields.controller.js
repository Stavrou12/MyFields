const Field = require("../models/Field");

/* ============================================================
   FIELD CRUD
============================================================ */

exports.createField = async (req, res) => {
  try {
    const field = await Field.create({ ...req.body, userId: req.user });
    res.status(201).json(field);
  } catch (err) {
    console.error("❌ Create Field Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getFields = async (req, res) => {
  try {
    const fields = await Field.find({ userId: req.user });
    res.json(fields);
  } catch (err) {
    console.error("❌ Get Fields Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getFieldById = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) return res.status(404).json({ msg: "Field not found" });
    res.json(field);
  } catch (err) {
    console.error("❌ Get Field By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateField = async (req, res) => {
  try {
    const field = await Field.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!field) return res.status(404).json({ msg: "Field not found" });
    res.json(field);
  } catch (err) {
    console.error("❌ Update Field Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteField = async (req, res) => {
  try {
    const field = await Field.findByIdAndDelete(req.params.id);
    if (!field) return res.status(404).json({ msg: "Field not found" });
    res.json({ msg: "Field deleted" });
  } catch (err) {
    console.error("❌ Delete Field Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   STATS
============================================================ */

exports.getFieldWithStats = async (req, res) => {
  try {
    const { id } = req.params;
    const field = await Field.findById(id);

    if (!field) return res.status(404).json({ msg: "Field not found" });

    const CURRENT_YEAR = new Date().getFullYear();

    // --- Filter only CURRENT YEAR yields ---
    const yieldsThisYear = field.oilProduction.filter(r => {
      if (!r.date) return false;
      return new Date(r.date).getFullYear() === CURRENT_YEAR;
    });

    const totalProductionKg = yieldsThisYear.reduce((s, x) => s + (x.kg || 0), 0);
    const totalOilLiters = yieldsThisYear.reduce((s, x) => s + (x.liters || 0), 0);
    const oilYieldPercentage =
      totalProductionKg > 0
        ? ((totalOilLiters / totalProductionKg) * 100).toFixed(2)
        : 0;

    // --- REAL Last Harvest (latest by date, any year) ---
    const sorted = field.oilProduction
      .filter(r => r.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const lastHarvestYear = sorted.length
      ? new Date(sorted[0].date).getFullYear()
      : "Never";

    // Helpers for last fertilization / pruning / spraying
    const getLastByDate = (arr) => {
      const valid = arr
        .filter(r => r.date)
        .map(r => ({ ...r.toObject(), d: new Date(r.date) }))
        .filter(r => !isNaN(r.d));
      if (valid.length === 0) return "None";
      valid.sort((a, b) => b.d - a.d);
      return valid[0].d.toLocaleDateString();
    };

    res.json({
      field,
      stats: {
        year: CURRENT_YEAR,
        totalProductionKg,
        totalOilLiters,
        oilYieldPercentage,
        lastHarvestYear,
        lastFertilization: getLastByDate(field.fertilization),
        lastPruning: getLastByDate(field.pruning),
        lastSpraying: getLastByDate(field.spraying)
      }
    });
  } catch (err) {
    console.error("getFieldWithStats error:", err);
    res.status(500).json({ error: err.message });
  }
};



/* ============================================================
   YEAR HISTORY
============================================================ */

exports.getFieldHistory = async (req, res) => {
  try {
    const selectedYear = parseInt(req.query.year, 10);
    if (!selectedYear) return res.status(400).json({ msg: "Year required" });

    const field = await Field.findById(req.params.id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    // Matches any record with date/year <= selectedYear
    const recordMatches = (rec) => {
      if (!rec) return false;

      // If explicit year exists
      if (rec.year && rec.year <= selectedYear) return true;

      // Fallback to date
      if (rec.date) {
        const d = new Date(rec.date);
        if (!isNaN(d.getTime()) && d.getFullYear() <= selectedYear) return true;
      }

      return false;
    };

    // Now include ALL history up to selected year
    const yields = field.oilProduction.filter(recordMatches);
    const fertilizations = field.fertilization.filter(recordMatches);
    const pruning = field.pruning.filter(recordMatches);
    const sprayings = field.spraying.filter(recordMatches);

    // Summary ONLY for the selected year
    const yieldsSelectedYear = field.oilProduction.filter(r => {
      const d = new Date(r.date);
      return !isNaN(d.getTime()) && d.getFullYear() === selectedYear;
    });

    const totalYieldKg = yieldsSelectedYear.reduce((s, x) => s + (Number(x.kg) || 0), 0);
    const totalOilLiters = yieldsSelectedYear.reduce((s, x) => s + (Number(x.liters) || 0), 0);

    const summary = {
      totalYieldKg,
      totalOilLiters,
      oilYieldPercentage:
        totalYieldKg > 0
          ? ((totalOilLiters / totalYieldKg) * 100).toFixed(2)
          : 0
    };

    return res.json({
      year: selectedYear,
      yields,
      fertilizations,
      pruning,
      sprayings,
      summary
    });

  } catch (err) {
    console.error("❌ History Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.addRecordMedia = async (req, res) => {
  const fieldId = req.params.id;
  const type = req.params.recordType;
  const recordId = req.params.recordId;

  try {
    const field = await Field.findById(fieldId);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    const list = field[type];
    if (!list) return res.status(400).json({ msg: "Invalid record type" });

    const record = list.id(recordId);
    if (!record) return res.status(404).json({ msg: "Record not found" });

    record.media.push({
      url: req.body.url,
      isVideo: req.body.isVideo,
    });

    await field.save();
    res.json(record.media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getRecord = async (req, res) => {
  const { id, recordId } = req.params;
  const type = req.path.split("/")[2]; // oil, fertilization, pruning, spraying

  try {
    const field = await Field.findById(id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    const list = field[type];
    const record = list.id(recordId);

    if (!record) return res.status(404).json({ msg: "Record not found" });

    res.json(record);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


exports.deleteRecordMedia = async (req, res) => {
  const fieldId = req.params.id;
  const type = req.params.recordType;
  const recordId = req.params.recordId;
  const mediaId = req.params.mediaId;

  try {
    await Field.updateOne(
      { _id: fieldId, [`${type}._id`]: recordId },
      { $pull: { [`${type}.$.media`]: { _id: mediaId } } }
    );

    res.json({ msg: "Media deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


exports.getFieldYearStats = async (req, res) => {
  try {
    const { id, year } = req.params;
    const field = await Field.findById(id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    const y = parseInt(year);

    // Filter yields for that year
    const yields = field.oilProduction.filter(r => r.year === y);

    const totalProductionKg = yields.reduce((s, x) => s + (x.kg || 0), 0);
    const totalOilLiters = yields.reduce((s, x) => s + (x.liters || 0), 0);

    const oilYieldPercentage =
      totalProductionKg > 0
        ? ((totalOilLiters / totalProductionKg) * 100).toFixed(2)
        : 0;

    // 🌿 Get last activities for THIS year
    const filterByYear = rec =>
      rec.date && new Date(rec.date).getFullYear() === y;

    const getLastDate = (arr) => {
      const valid = arr.filter(r => r.date).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      return valid.length ? new Date(valid[0].date).toLocaleDateString() : "None";
    };

    const lastFertilization = getLastDate(field.fertilization.filter(filterByYear));
    const lastPruning = getLastDate(field.pruning.filter(filterByYear));
    const lastSpraying = getLastDate(field.spraying.filter(filterByYear));

    res.json({
      stats: {
        totalProductionKg,
        totalOilLiters,
        oilYieldPercentage,
        lastHarvestYear: yields.length ? y : "Never",
        lastFertilization,
        lastPruning,
        lastSpraying
      }
    });
  } catch (err) {
    console.error("YEAR STATS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};




/* ============================================================
   ADD RECORDS
============================================================ */

exports.addYield = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    const dateObj = new Date(req.body.date);
    const year = dateObj.getFullYear();

    const record = {
      date: dateObj,
      year,
      kg: Number(req.body.kg),
      liters: Number(req.body.liters),
      trees: req.body.trees ? Number(req.body.trees) : undefined,
      quality: req.body.quality || ""
    };

    field.oilProduction.push(record);
    await field.save();
    res.json(record);
  } catch (err) {
    console.error("❌ Add Yield Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.addFertilization = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    const record = {
      date: new Date(req.body.date),
      fertilizerType: req.body.fertilizerType,
      fertilizerName: req.body.fertilizerName,
      trees: req.body.trees ? Number(req.body.trees) : undefined,
      notes: req.body.notes || ""
    };

    field.fertilization.push(record);
    await field.save();
    res.json(record);
  } catch (err) {
    console.error("❌ Fertilization Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.addPruning = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    const record = {
      date: new Date(req.body.date),
      pruningType: req.body.pruningType,
      treesPruned: req.body.treesPruned ? Number(req.body.treesPruned) : undefined,
      notes: req.body.notes || ""
    };

    field.pruning.push(record);
    await field.save();
    res.json(record);
  } catch (err) {
    console.error("❌ Add Pruning Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.addSpraying = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    const record = {
      date: new Date(req.body.date),
      sprayType: req.body.sprayType,
      product: req.body.product,
      trees: req.body.trees ? Number(req.body.trees) : undefined,
      notes: req.body.notes || ""
    };

    field.spraying.push(record);
    await field.save();
    res.json(record);
  } catch (err) {
    console.error("❌ Add Spraying Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   EDIT RECORDS
============================================================ */

exports.editYield = async (req, res) => {
  try {
    const dateObj = new Date(req.body.date);
    const year = dateObj.getFullYear();

    await Field.updateOne(
      { _id: req.params.id, "oilProduction._id": req.params.recordId },
      {
        $set: {
          "oilProduction.$.date": dateObj,
          "oilProduction.$.year": year,
          "oilProduction.$.kg": Number(req.body.kg),
          "oilProduction.$.liters": Number(req.body.liters),
          "oilProduction.$.trees": req.body.trees
            ? Number(req.body.trees)
            : undefined,
          "oilProduction.$.quality": req.body.quality || ""
        }
      }
    );
    res.json({ msg: "Yield updated" });
  } catch (err) {
    console.error("❌ Edit Yield Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.editFertilization = async (req, res) => {
  try {
    await Field.updateOne(
      { _id: req.params.id, "fertilization._id": req.params.recordId },
      {
        $set: {
          "fertilization.$.date": new Date(req.body.date),
          "fertilization.$.fertilizerType": req.body.fertilizerType,
          "fertilization.$.fertilizerName": req.body.fertilizerName,
          "fertilization.$.trees": req.body.trees
            ? Number(req.body.trees)
            : undefined,
          "fertilization.$.notes": req.body.notes || ""
        }
      }
    );
    res.json({ msg: "Fertilization updated" });
  } catch (err) {
    console.error("❌ Edit Fertilization Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.editPruning = async (req, res) => {
  try {
    await Field.updateOne(
      { _id: req.params.id, "pruning._id": req.params.recordId },
      {
        $set: {
          "pruning.$.date": new Date(req.body.date),
          "pruning.$.pruningType": req.body.pruningType,
          "pruning.$.treesPruned": req.body.treesPruned
            ? Number(req.body.treesPruned)
            : undefined,
          "pruning.$.notes": req.body.notes || ""
        }
      }
    );
    res.json({ msg: "Pruning updated" });
  } catch (err) {
    console.error("❌ Edit Pruning Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.editSpraying = async (req, res) => {
  try {
    await Field.updateOne(
      { _id: req.params.id, "spraying._id": req.params.recordId },
      {
        $set: {
          "spraying.$.date": new Date(req.body.date),
          "spraying.$.sprayType": req.body.sprayType,
          "spraying.$.product": req.body.product,
          "spraying.$.trees": req.body.trees
            ? Number(req.body.trees)
            : undefined,
          "spraying.$.notes": req.body.notes || ""
        }
      }
    );
    res.json({ msg: "Spraying updated" });
  } catch (err) {
    console.error("❌ Edit Spraying Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ============================================================
   DELETE RECORDS
============================================================ */

exports.deleteYield = async (req, res) => {
  try {
    await Field.updateOne(
      { _id: req.params.id },
      { $pull: { oilProduction: { _id: req.params.recordId } } }
    );
    res.json({ msg: "Yield deleted" });
  } catch (err) {
    console.error("❌ Delete Yield Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFertilization = async (req, res) => {
  try {
    await Field.updateOne(
      { _id: req.params.id },
      { $pull: { fertilization: { _id: req.params.recordId } } }
    );
    res.json({ msg: "Fertilization deleted" });
  } catch (err) {
    console.error("❌ Delete Fertilization Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deletePruning = async (req, res) => {
  try {
    await Field.updateOne(
      { _id: req.params.id },
      { $pull: { pruning: { _id: req.params.recordId } } }
    );
    res.json({ msg: "Pruning deleted" });
  } catch (err) {
    console.error("❌ Delete Pruning Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSpraying = async (req, res) => {
  try {
    await Field.updateOne(
      { _id: req.params.id },
      { $pull: { spraying: { _id: req.params.recordId } } }
    );
    res.json({ msg: "Spraying deleted" });
  } catch (err) {
    console.error("❌ Delete Spraying Error:", err);
    res.status(500).json({ error: err.message });
  }
};
