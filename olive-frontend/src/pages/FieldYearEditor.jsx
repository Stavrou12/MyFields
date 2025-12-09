import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

// use the same base URL as your axios instance
const API_BASE_URL = api.defaults.baseURL || "http://localhost:5000";

export default function FieldYearEditor() {
  // eslint-disable-next-line no-unused-vars
  const [previewImage, setPreviewImage] = useState(null);

  const { id: fieldId, year } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [field, setField] = useState(null);
  const [history, setHistory] = useState({
    yields: [],
    fertilizations: [],
    pruning: [],
    sprayings: [],
    summary: null
  });

  useEffect(() => {
    refreshModalMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const [editingYield, setEditingYield] = useState(null);
  const [editingFert, setEditingFert] = useState(null);
  const [editingPrune, setEditingPrune] = useState(null);
  const [editingSpray, setEditingSpray] = useState(null);

  const [newYield, setNewYield] = useState({
    date: "",
    kg: "",
    liters: "",
    trees: "",
    quality: "",
    notes: ""
  });

  const [newFert, setNewFert] = useState({
    date: "",
    fertilizerType: "",
    fertilizerName: "",
    trees: "",
    notes: ""
  });

  const [newPrune, setNewPrune] = useState({
    date: "",
    pruningType: "",
    treesPruned: "",
    notes: ""
  });

  const [newSpray, setNewSpray] = useState({
    date: "",
    sprayType: "",
    product: "",
    trees: "",
    notes: ""
  });

  const [editYieldData, setEditYieldData] = useState({});
  const [editFertData, setEditFertData] = useState({});
  const [editPruneData, setEditPruneData] = useState({});
  const [editSprayData, setEditSprayData] = useState({});

  // 🔹 Media modal state
  const [mediaModal, setMediaModal] = useState({
    open: false,
    list: [],
    type: "", // "oil" | "fertilization" | "pruning" | "spraying"
    recordId: ""
  });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId, year]);

  const load = async () => {
    setLoading(true);
    try {
      const [fieldRes, histRes] = await Promise.all([
        api.get(`/fields/${fieldId}`),
        api.get(`/fields/${fieldId}/history?year=${year}`)
      ]);

      setField(fieldRes.data);
      setHistory({
        yields: histRes.data.yields || [],
        fertilizations: histRes.data.fertilizations || [],
        pruning: histRes.data.pruning || [],
        sprayings: histRes.data.sprayings || [],
        summary: histRes.data.summary || null
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load field data");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------
      MEDIA HANDLERS
  -------------------------- */

  // Map recordType (route segment) -> history key / field array name
  function getCollectionKey(recordType) {
    switch (recordType) {
      case "oil":
        return "yields";
      case "fertilization":
        return "fertilizations";
      case "pruning":
        return "pruning";
      case "spraying":
        return "sprayings";
      default:
        return null;
    }
  }

  function refreshModalMedia() {
    if (!mediaModal.open) return;

    const key = getCollectionKey(mediaModal.type);
    if (!key) return;

    const recArray = history[key] || [];
    const rec = recArray.find((r) => r._id === mediaModal.recordId);

    setMediaModal((prev) => ({
      ...prev,
      list: rec?.media || []
    }));
  }

  // Open modal for a specific record & type (oil, fertilization, pruning, spraying)
  const openMediaModal = (recordId, recordType) => {
    const key = getCollectionKey(recordType);
    if (!key) return;

    const recArray = history[key] || [];
    const rec = recArray.find((r) => r._id === recordId);

    setMediaModal({
      open: true,
      list: rec?.media || [],
      type: recordType,
      recordId
    });
  };

  const closeMediaModal = () => {
    setMediaModal({
      open: false,
      list: [],
      type: "",
      recordId: ""
    });
  };

  async function handleUploadRecordMedia(e) {
    try {
      const files = Array.from(e.target.files || []);
      if (!mediaModal.recordId || !mediaModal.type) {
        alert("No record selected for media.");
        return;
      }

      for (const file of files) {
        // 1) Upload file to /upload/media  (field name MUST be "media")
        const form = new FormData();
        form.append("media", file);
        // form.append("fieldId", fieldId);
        form.append("gps", JSON.stringify({}));

        const upload = await api.post("/upload/media", form, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        // 2) Attach to specific record in field
        const t = normalizeType(mediaModal.type);

        await api.post(
          `/fields/${fieldId}/${t}/${mediaModal.recordId}/media`,
          {
            url: upload.data.url,
            isVideo: upload.data.isVideo
          }
        );
      }

      await load();
      refreshModalMedia();
    } catch (err) {
      console.error("Upload media error:", err);
      alert("Error uploading media");
    }
  }

  const deleteMedia = async (mediaId) => {
    if (!window.confirm("Delete this media item?")) return;
    const t = normalizeType(mediaModal.type);
    try {
      await api.delete(
        `/fields/${fieldId}/${t}/${mediaModal.recordId}/media/${mediaId}`
      );
      await load();
      refreshModalMedia();
    } catch (err) {
      console.error("Delete media error:", err);
      alert("Error deleting media");
    }
  };

  /* -------------------------
      SAVE NEW RECORDS
  -------------------------- */

  const saveYield = async () => {
    if (!newYield.date || !newYield.kg || !newYield.liters) {
      alert("Please fill date, kg, and liters");
      return;
    }

    try {
      await api.post(`/fields/${fieldId}/oil`, {
        date: newYield.date,
        kg: newYield.kg,
        liters: newYield.liters,
        trees: newYield.trees,
        quality: newYield.quality,
        notes: newYield.notes
      });

      setNewYield({
        date: "",
        kg: "",
        liters: "",
        trees: "",
        quality: "",
        notes: ""
      });
      await load();
    } catch (error) {
      console.error("Yield save error:", error);
      alert("Error saving yield");
    }
  };

  const saveFertilization = async () => {
    if (!newFert.date) {
      alert("Please select a date");
      return;
    }
    const body = {
      date: newFert.date,
      fertilizerType: newFert.fertilizerType,
      fertilizerName: newFert.fertilizerName,
      trees: newFert.trees,
      notes: newFert.notes
    };

    try {
      await api.post(`/fields/${fieldId}/fertilization`, body);
      setNewFert({
        date: "",
        fertilizerType: "",
        fertilizerName: "",
        trees: "",
        notes: ""
      });
      await load();
    } catch (err) {
      console.error(err);
      alert("Error saving fertilization");
    }
  };

  const savePruning = async () => {
    if (!newPrune.date) {
      alert("Please select a date");
      return;
    }

    const body = {
      date: newPrune.date,
      pruningType: newPrune.pruningType,
      treesPruned: newPrune.treesPruned,
      notes: newPrune.notes
    };

    try {
      await api.post(`/fields/${fieldId}/pruning`, body);
      setNewPrune({
        date: "",
        pruningType: "",
        treesPruned: "",
        notes: ""
      });
      await load();
    } catch (err) {
      console.error(err);
      alert("Error saving pruning");
    }
  };

  const saveSpraying = async () => {
    if (!newSpray.date) {
      alert("Please select a date");
      return;
    }

    const body = {
      date: newSpray.date,
      sprayType: newSpray.sprayType,
      product: newSpray.product,
      trees: newSpray.trees,
      notes: newSpray.notes
    };

    try {
      await api.post(`/fields/${fieldId}/spraying`, body);
      setNewSpray({
        date: "",
        sprayType: "",
        product: "",
        trees: "",
        notes: ""
      });
      await load();
    } catch (err) {
      console.error(err);
      alert("Error saving spraying");
    }
  };

  /* -------------------------
      SAVE EDIT RECORD
  -------------------------- */

  const saveYieldEdit = async (recordId) => {
    try {
      await api.put(`/fields/${fieldId}/oil/${recordId}`, editYieldData);
      setEditingYield(null);
      await load();
    } catch (err) {
      console.error(err);
      alert("Error updating yield");
    }
  };

  const saveFertEdit = async (recordId) => {
    try {
      await api.put(
        `/fields/${fieldId}/fertilization/${recordId}`,
        editFertData
      );
      setEditingFert(null);
      await load();
    } catch (err) {
      console.error(err);
      alert("Error updating fertilization");
    }
  };

  const savePruneEdit = async (recordId) => {
    try {
      await api.put(`/fields/${fieldId}/pruning/${recordId}`, editPruneData);
      setEditingPrune(null);
      await load();
    } catch (err) {
      console.error(err);
      alert("Error updating pruning");
    }
  };

  const saveSprayEdit = async (recordId) => {
    try {
      await api.put(`/fields/${fieldId}/spraying/${recordId}`, editSprayData);
      setEditingSpray(null);
      await load();
    } catch (err) {
      console.error(err);
      alert("Error updating spraying");
    }
  };

  /* -------------------------
      DELETE RECORD
  -------------------------- */

  const del = async (type, recordId) => {
    // type is the segment in the URL: "oil", "fertilization", "pruning", "spraying"
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`/fields/${fieldId}/${type}/${recordId}`);
      await load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading || !field) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/my-fields")}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        ← Back to My Fields
      </button>
      <h1 className="text-3xl font-bold">{field.name}</h1>
      <h2 className="text-lg text-gray-600 mb-6">Year: {year}</h2>

      {/* SUMMARY */}
      {history.summary && (
        <Section title="Year Summary">
          <p>Total Yield: {history.summary.totalYieldKg} kg</p>
          <p>Total Oil: {history.summary.totalOilLiters} L</p>
          <p>Oil Yield: {history.summary.oilYieldPercentage}%</p>
        </Section>
      )}

      {/* ADD YIELD */}
      <Section title="Add New Yield (Harvest)">
        <Row>
          <Input
            type="date"
            value={newYield.date}
            onChange={(e) =>
              setNewYield({ ...newYield, date: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Kg"
            value={newYield.kg}
            onChange={(e) =>
              setNewYield({ ...newYield, kg: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Liters"
            value={newYield.liters}
            onChange={(e) =>
              setNewYield({ ...newYield, liters: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Trees"
            value={newYield.trees}
            onChange={(e) =>
              setNewYield({ ...newYield, trees: e.target.value })
            }
          />
        </Row>
        <select
          className="border p-2 w-full rounded-lg mb-3"
          value={newYield.quality}
          onChange={(e) =>
            setNewYield({ ...newYield, quality: e.target.value })
          }
        >
          <option value="">Category</option>
          <option value="Extra virgin olive oil">Extra virgin olive oil</option>
          <option value="Virgin olive oil">Virgin olive oil</option>
          <option value="Lampante">Lampante</option>
          <option value="Refined olive oil">Refined olive oil</option>
          <option value="Olive oil">Olive oil</option>
          <option value="Crude olive-pomace oil">Crude olive-pomace oil</option>
          <option value="Refined olive-pomace oil">
            Refined olive-pomace oil
          </option>
          <option value="Olive-pomace oil">Olive-pomace oil</option>
        </select>
        <Input
          placeholder="Notes"
          value={newYield.notes}
          onChange={(e) =>
            setNewYield({ ...newYield, notes: e.target.value })
          }
        />
        <SaveBtn onClick={saveYield} />
      </Section>

      {/* EXISTING YIELDS */}
      <Section title="Yields">
        {history.yields.length === 0 && (
          <p className="text-gray-500">No yields for this year.</p>
        )}
        {[...history.yields]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((y) =>
            editingYield === y._id ? (
              <EditorCard key={y._id}>
                <EditInput
                  type="date"
                  value={editYieldData.date}
                  onChange={(e) =>
                    setEditYieldData({
                      ...editYieldData,
                      date: e.target.value
                    })
                  }
                />
                <EditInput
                  type="number"
                  placeholder="Kg"
                  value={editYieldData.kg}
                  onChange={(e) =>
                    setEditYieldData({
                      ...editYieldData,
                      kg: e.target.value
                    })
                  }
                />
                <EditInput
                  type="number"
                  placeholder="Liters"
                  value={editYieldData.liters}
                  onChange={(e) =>
                    setEditYieldData({
                      ...editYieldData,
                      liters: e.target.value
                    })
                  }
                />
                <EditInput
                  type="number"
                  placeholder="Trees"
                  value={editYieldData.trees}
                  onChange={(e) =>
                    setEditYieldData({
                      ...editYieldData,
                      trees: e.target.value
                    })
                  }
                />
                <select
                  className="border p-2 w-full rounded-lg mb-2"
                  value={editYieldData.quality || ""}
                  onChange={(e) =>
                    setEditYieldData({
                      ...editYieldData,
                      quality: e.target.value
                    })
                  }
                >
                  <option value="">Category</option>
                  <option value="Extra virgin olive oil">
                    Extra virgin olive oil
                  </option>
                  <option value="Virgin olive oil">Virgin olive oil</option>
                  <option value="Lampante">Lampante</option>
                  <option value="Refined olive oil">Refined olive oil</option>
                  <option value="Olive oil">Olive oil</option>
                  <option value="Crude olive-pomace oil">
                    Crude olive-pomace oil
                  </option>
                  <option value="Refined olive-pomace oil">
                    Refined olive-pomace oil
                  </option>
                  <option value="Olive-pomace oil">Olive-pomace oil</option>
                </select>
                <EditInput
                  placeholder="Notes"
                  value={editYieldData.notes || ""}
                  onChange={(e) =>
                    setEditYieldData({
                      ...editYieldData,
                      notes: e.target.value
                    })
                  }
                />
                <BtnRow>
                  <SmallBtn green onClick={() => saveYieldEdit(y._id)}>
                    Save
                  </SmallBtn>
                  <SmallBtn onClick={() => setEditingYield(null)}>
                    Cancel
                  </SmallBtn>
                </BtnRow>
              </EditorCard>
            ) : (
              <ItemCard key={y._id}>
                <p>
                  {y.date
                    ? new Date(y.date).toLocaleDateString()
                    : "No date"}{" "}
                  — {y.kg}kg → {y.liters}L
                </p>
                <p className="text-sm text-gray-600">Trees: {y.trees}</p>
                <BtnRow>
                  <SmallBtn
                    onClick={() => {
                      setEditingYield(y._id);
                      setEditYieldData({
                        ...y,
                        date: y.date ? y.date.split("T")[0] : ""
                      });
                    }}
                  >
                    Edit
                  </SmallBtn>
                  <SmallBtn onClick={() => openMediaModal(y._id, "oil")}>
                    📷 Media
                  </SmallBtn>
                  <SmallBtn red onClick={() => del("oil", y._id)}>
                    Delete
                  </SmallBtn>
                </BtnRow>
              </ItemCard>
            )
          )}
      </Section>

      {/* ADD FERTILIZATION */}
      <Section title="Add Fertilization">
        <Row>
          <Input
            type="date"
            value={newFert.date}
            onChange={(e) =>
              setNewFert({ ...newFert, date: e.target.value })
            }
          />
          <select
            className="border p-2 w-full rounded-lg"
            value={newFert.fertilizerType}
            onChange={(e) =>
              setNewFert({
                ...newFert,
                fertilizerType: e.target.value
              })
            }
          >
            <option value="">Type</option>
            <option value="Organic">Organic</option>
            <option value="Chemical">Chemical</option>
          </select>
          <Input
            placeholder="Fertilizer Name"
            value={newFert.fertilizerName}
            onChange={(e) =>
              setNewFert({
                ...newFert,
                fertilizerName: e.target.value
              })
            }
          />
          <Input
            type="number"
            placeholder="Trees"
            value={newFert.trees}
            onChange={(e) =>
              setNewFert({ ...newFert, trees: e.target.value })
            }
          />
        </Row>
        <Input
          placeholder="Notes"
          value={newFert.notes}
          onChange={(e) =>
            setNewFert({ ...newFert, notes: e.target.value })
          }
        />
        <SaveBtn onClick={saveFertilization} />
      </Section>

      {/* EXISTING FERTILIZATION */}
      <Section title="Fertilization Records">
        {history.fertilizations.length === 0 && (
          <p className="text-gray-500">No fertilization for this year.</p>
        )}
        {[...history.fertilizations]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((f) =>
            editingFert === f._id ? (
              <EditorCard key={f._id}>
                <EditInput
                  type="date"
                  value={editFertData.date}
                  onChange={(e) =>
                    setEditFertData({ ...editFertData, date: e.target.value })
                  }
                />
                <select
                  className="border p-2 w-full rounded-lg mb-2"
                  value={editFertData.fertilizerType || ""}
                  onChange={(e) =>
                    setEditFertData({
                      ...editFertData,
                      fertilizerType: e.target.value
                    })
                  }
                >
                  <option value="">Type</option>
                  <option value="Organic">Organic</option>
                  <option value="Chemical">Chemical</option>
                </select>
                <EditInput
                  placeholder="Name"
                  value={editFertData.fertilizerName}
                  onChange={(e) =>
                    setEditFertData({
                      ...editFertData,
                      fertilizerName: e.target.value
                    })
                  }
                />
                <EditInput
                  type="number"
                  placeholder="Trees"
                  value={editFertData.trees}
                  onChange={(e) =>
                    setEditFertData({
                      ...editFertData,
                      trees: e.target.value
                    })
                  }
                />
                <EditInput
                  placeholder="Notes"
                  value={editFertData.notes}
                  onChange={(e) =>
                    setEditFertData({
                      ...editFertData,
                      notes: e.target.value
                    })
                  }
                />
                <BtnRow>
                  <SmallBtn green onClick={() => saveFertEdit(f._id)}>
                    Save
                  </SmallBtn>
                  <SmallBtn onClick={() => setEditingFert(null)}>
                    Cancel
                  </SmallBtn>
                </BtnRow>
              </EditorCard>
            ) : (
              <ItemCard key={f._id}>
                <p>
                  {f.date ? new Date(f.date).toLocaleDateString() : "No date"} —{" "}
                  {f.fertilizerType}: {f.fertilizerName}
                </p>
                <p className="text-sm text-gray-600">Trees: {f.trees}</p>
                <BtnRow>
                  <SmallBtn
                    onClick={() => {
                      setEditingFert(f._id);
                      setEditFertData({
                        ...f,
                        date: f.date ? f.date.split("T")[0] : ""
                      });
                    }}
                  >
                    Edit
                  </SmallBtn>
                  <SmallBtn
                    onClick={() => openMediaModal(f._id, "fertilization")}
                  >
                    📷 Media
                  </SmallBtn>
                  <SmallBtn red onClick={() => del("fertilization", f._id)}>
                    Delete
                  </SmallBtn>
                </BtnRow>
              </ItemCard>
            )
          )}
      </Section>

      {/* ADD PRUNING */}
      <Section title="Add Pruning">
        <Row>
          <Input
            type="date"
            value={newPrune.date}
            onChange={(e) =>
              setNewPrune({ ...newPrune, date: e.target.value })
            }
          />
          <select
            className="border p-2 w-full rounded-lg"
            value={newPrune.pruningType}
            onChange={(e) =>
              setNewPrune({
                ...newPrune,
                pruningType: e.target.value
              })
            }
          >
            <option value="">Pruning Type</option>
            <option value="Formative">Formative</option>
            <option value="Production">Production</option>
            <option value="Renewal (Rejuvenation)">
              Renewal (Rejuvenation)
            </option>
          </select>
          <Input
            type="number"
            placeholder="Trees Pruned"
            value={newPrune.treesPruned}
            onChange={(e) =>
              setNewPrune({
                ...newPrune,
                treesPruned: e.target.value
              })
            }
          />
        </Row>
        <Input
          placeholder="Notes"
          value={newPrune.notes}
          onChange={(e) =>
            setNewPrune({ ...newPrune, notes: e.target.value })
          }
        />
        <SaveBtn onClick={savePruning} />
      </Section>

      {/* EXISTING PRUNING */}
      <Section title="Pruning Records">
        {history.pruning.length === 0 && (
          <p className="text-gray-500">No pruning for this year.</p>
        )}
        {[...history.pruning]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((p) =>
            editingPrune === p._id ? (
              <EditorCard key={p._id}>
                <EditInput
                  type="date"
                  value={editPruneData.date}
                  onChange={(e) =>
                    setEditPruneData({
                      ...editPruneData,
                      date: e.target.value
                    })
                  }
                />
                <select
                  className="border p-2 w-full rounded-lg mb-2"
                  value={editPruneData.pruningType || ""}
                  onChange={(e) =>
                    setEditPruneData({
                      ...editPruneData,
                      pruningType: e.target.value
                    })
                  }
                >
                  <option value="">Pruning Type</option>
                  <option value="Formative">Formative</option>
                  <option value="Production">Production</option>
                  <option value="Renewal (Rejuvenation)">
                    Renewal (Rejuvenation)
                  </option>
                </select>
                <EditInput
                  type="number"
                  placeholder="Trees"
                  value={editPruneData.treesPruned}
                  onChange={(e) =>
                    setEditPruneData({
                      ...editPruneData,
                      treesPruned: e.target.value
                    })
                  }
                />
                <EditInput
                  placeholder="Notes"
                  value={editPruneData.notes}
                  onChange={(e) =>
                    setEditPruneData({
                      ...editPruneData,
                      notes: e.target.value
                    })
                  }
                />
                <BtnRow>
                  <SmallBtn green onClick={() => savePruneEdit(p._id)}>
                    Save
                  </SmallBtn>
                  <SmallBtn onClick={() => setEditingPrune(null)}>
                    Cancel
                  </SmallBtn>
                </BtnRow>
              </EditorCard>
            ) : (
              <ItemCard key={p._id}>
                <p>
                  {p.date ? new Date(p.date).toLocaleDateString() : "No date"} —{" "}
                  {p.pruningType}
                </p>
                <p className="text-sm text-gray-600">
                  Trees: {p.treesPruned}
                </p>
                <BtnRow>
                  <SmallBtn
                    onClick={() => {
                      setEditingPrune(p._id);
                      setEditPruneData({
                        ...p,
                        date: p.date ? p.date.split("T")[0] : ""
                      });
                    }}
                  >
                    Edit
                  </SmallBtn>
                  <SmallBtn onClick={() => openMediaModal(p._id, "pruning")}>
                    📷 Media
                  </SmallBtn>
                  <SmallBtn red onClick={() => del("pruning", p._id)}>
                    Delete
                  </SmallBtn>
                </BtnRow>
              </ItemCard>
            )
          )}
      </Section>

      {/* ADD SPRAYING */}
      <Section title="Add Spraying">
        <Row>
          <Input
            type="date"
            value={newSpray.date}
            onChange={(e) =>
              setNewSpray({ ...newSpray, date: e.target.value })
            }
          />
          <select
            className="border p-2 w-full rounded-lg"
            value={newSpray.sprayType}
            onChange={(e) =>
              setNewSpray({
                ...newSpray,
                sprayType: e.target.value
              })
            }
          >
            <option value="">Category</option>
            <option value="Nutrient Sprays">Nutrient Sprays</option>
            <option value="Pest & Disease Control">
              Pest & Disease Control
            </option>
            <option value="Fruit Management">Fruit Management</option>
          </select>
          <Input
            placeholder="Product Name"
            value={newSpray.product}
            onChange={(e) =>
              setNewSpray({ ...newSpray, product: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Trees"
            value={newSpray.trees}
            onChange={(e) =>
              setNewSpray({ ...newSpray, trees: e.target.value })
            }
          />
        </Row>
        <Input
          placeholder="Notes"
          value={newSpray.notes}
          onChange={(e) =>
            setNewSpray({ ...newSpray, notes: e.target.value })
          }
        />
        <SaveBtn onClick={saveSpraying} />
      </Section>

      {/* EXISTING SPRAYING */}
      <Section title="Spraying Records">
        {history.sprayings.length === 0 && (
          <p className="text-gray-500">No spraying for this year.</p>
        )}
        {[...history.sprayings]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((s) =>
            editingSpray === s._id ? (
              <EditorCard key={s._id}>
                <EditInput
                  type="date"
                  value={editSprayData.date}
                  onChange={(e) =>
                    setEditSprayData({
                      ...editSprayData,
                      date: e.target.value
                    })
                  }
                />
                <select
                  className="border p-2 w-full rounded-lg mb-2"
                  value={editSprayData.sprayType || ""}
                  onChange={(e) =>
                    setEditSprayData({
                      ...editSprayData,
                      sprayType: e.target.value
                    })
                  }
                >
                  <option value="">Category</option>
                  <option value="Nutrient Sprays">Nutrient Sprays</option>
                  <option value="Pest & Disease Control">
                    Pest & Disease Control
                  </option>
                  <option value="Fruit Management">Fruit Management</option>
                </select>
                <EditInput
                  placeholder="Product"
                  value={editSprayData.product}
                  onChange={(e) =>
                    setEditSprayData({
                      ...editSprayData,
                      product: e.target.value
                    })
                  }
                />
                <EditInput
                  type="number"
                  placeholder="Trees"
                  value={editSprayData.trees}
                  onChange={(e) =>
                    setEditSprayData({
                      ...editSprayData,
                      trees: e.target.value
                    })
                  }
                />
                <EditInput
                  placeholder="Notes"
                  value={editSprayData.notes}
                  onChange={(e) =>
                    setEditSprayData({
                      ...editSprayData,
                      notes: e.target.value
                    })
                  }
                />
                <BtnRow>
                  <SmallBtn green onClick={() => saveSprayEdit(s._id)}>
                    Save
                  </SmallBtn>
                  <SmallBtn onClick={() => setEditingSpray(null)}>
                    Cancel
                  </SmallBtn>
                </BtnRow>
              </EditorCard>
            ) : (
              <ItemCard key={s._id}>
                <p>
                  {s.date ? new Date(s.date).toLocaleDateString() : "No date"} —{" "}
                  {s.sprayType}
                </p>
                <p className="text-sm text-gray-600">Trees: {s.trees}</p>
                <BtnRow>
                  <SmallBtn
                    onClick={() => {
                      setEditingSpray(s._id);
                      setEditSprayData({
                        ...s,
                        date: s.date ? s.date.split("T")[0] : ""
                      });
                    }}
                  >
                    Edit
                  </SmallBtn>
                  <SmallBtn onClick={() => openMediaModal(s._id, "spraying")}>
                    📷 Media
                  </SmallBtn>
                  <SmallBtn red onClick={() => del("spraying", s._id)}>
                    Delete
                  </SmallBtn>
                </BtnRow>
              </ItemCard>
            )
          )}
      </Section>

      {/* 🔹 MEDIA MODAL RENDER */}
      <MediaModal
        open={mediaModal.open}
        onClose={closeMediaModal}
        media={mediaModal.list}
        onDelete={deleteMedia}
        onUpload={handleUploadRecordMedia}
        apiBase={API_BASE_URL}
      />
    </div>
  );
}

/* --------------------------
    REUSABLE UI COMPONENTS
--------------------------- */

function Section({ title, children }) {
  return (
    <div className="section-card">
      <h3 className="text-2xl mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
      {children}
    </div>
  );
}

function Input(props) {
  return <input {...props} className="border p-2 w-full rounded-lg" />;
}

function EditInput(props) {
  return <input {...props} className="border p-2 w-full rounded-lg mb-2" />;
}

function SaveBtn({ onClick }) {
  return (
    <button onClick={onClick} className="mt-8 btn-green px-5 py-2 font-medium">
      Save
    </button>
  );
}

function SmallBtn({ onClick, children, green, red }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded ${green ? "btn-green" : red ? "btn-red" : "btn-gray"
        }`}
    >
      {children}
    </button>
  );
}

function BtnRow({ children }) {
  return <div className="flex gap-2 mt-2">{children}</div>;
}

function ItemCard({ children }) {
  return <div className="item-card">{children}</div>;
}

function EditorCard({ children }) {
  return <div className="editor-card">{children}</div>;
}

/* --------------------------
    MEDIA MODAL COMPONENT
--------------------------- */

function normalizeType(t) {
  switch (t) {
    case "oil":
      return "oilProduction";
    case "fertilizations":
      return "fertilization";
    case "sprayings":
      return "spraying";
    case "pruning":
      return "pruning";
    default:
      return t;
  }
}

function MediaModal({ open, onClose, media, onDelete, onUpload, apiBase }) {
  const [previewImage, setPreviewImage] = useState(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 relative w-full max-w-lg">
        {/* Close */}
        <button
          className="absolute top-2 right-2 text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Media</h2>

        {/* Upload input */}
        <div className="mb-4">
          <input type="file" multiple onChange={onUpload} />
        </div>

        {!media?.length && (
          <p className="text-gray-500">No media uploaded</p>
        )}

        <div className="grid grid-cols-2 gap-2 mt-2 max-h-80 overflow-auto">
          {media?.map((m) => {
            const src =
              m.url && m.url.startsWith("http")
                ? m.url
                : `${apiBase}${m.url || ""}`;

            return (
              <div key={m._id} className="relative border rounded p-1">
                {m.isVideo ? (
                  <video
                    src={src}
                    controls
                    className="rounded w-full max-h-40 object-cover"
                  />
                ) : (
                  <img
                    src={src}
                    alt=""
                    className="rounded w-full max-h-40 object-cover cursor-pointer"
                    onClick={() => setPreviewImage(src)}
                  />
                )}

                <button
                  onClick={() => onDelete(m._id)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded px-1"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen preview */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt=""
            className="rounded max-w-[90vw] max-h-[90vh] rounded shadow-lg object-cover cursor-pointer"
            onClick={() => setPreviewImage(previewImage)}
          />
        </div>
      )}
    </div>
  );
}
