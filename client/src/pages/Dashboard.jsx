import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

const API_BASE_URL = "https://sweety-k9ev.onrender.com/api";

const SLOTS = [
  "Morning",
  "After breakfast",
  "After lunch",
  "After dinner",
];

function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    readingDate: new Date()
      .toISOString()
      .split("T")[0],
    slot: "Morning",
    glucoseValue: "",
  });

  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/readings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load readings"
        );
      }

      setReadings(data.readings);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
  };

  const validateForm = () => {
    if (
      !formData.readingDate ||
      !formData.slot ||
      !formData.glucoseValue
    ) {
      setError("All reading fields are required");
      return false;
    }

    const glucoseValue = Number(
      formData.glucoseValue
    );

    if (!Number.isInteger(glucoseValue)) {
      setError(
        "Glucose value must be a whole number"
      );
      return false;
    }

    if (
      glucoseValue < 40 ||
      glucoseValue > 600
    ) {
      setError(
        "Glucose value must be between 40 and 600 mg/dL"
      );
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      readingDate: new Date()
        .toISOString()
        .split("T")[0],
      slot: "Morning",
      glucoseValue: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    const glucoseValue = Number(
      formData.glucoseValue
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/readings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            readingDate: formData.readingDate,
            slot: formData.slot,
            glucoseValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add reading"
        );
      }

      resetForm();

      await fetchReadings();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = (reading) => {
    setEditingId(reading.id);

    setFormData({
      readingDate: reading.reading_date,
      slot: reading.slot,
      glucoseValue: String(
        reading.glucose_value
      ),
    });

    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    const glucoseValue = Number(
      formData.glucoseValue
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/readings/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            readingDate: formData.readingDate,
            slot: formData.slot,
            glucoseValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update reading"
        );
      }

      resetForm();

      await fetchReadings();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setError("");
  };

  const handleDelete = async (readingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reading?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/readings/${readingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete reading"
        );
      }

      if (editingId === readingId) {
        resetForm();
      }

      await fetchReadings();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        <header className="topbar">

          <div className="brand-small">
            <h1>Sweety</h1>
            <p>Blood Glucose Tracker</p>
          </div>

          <div className="user-area">
            <span>
              Welcome, {user?.name}
            </span>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

        </header>

        <section className="welcome-card">

          <h2>
            Hello, {user?.name} 🌸
          </h2>

          <p>
            Keep track of your blood glucose readings
            and stay consistent with your daily monitoring.
          </p>

        </section>

        <section className="content-card">

          <h2>
            {editingId
              ? "Edit Glucose Reading"
              : "Add Glucose Reading"}
          </h2>

          <form
            className="reading-form"
            onSubmit={
              editingId
                ? handleUpdate
                : handleSubmit
            }
          >

            <div className="form-group">

              <label htmlFor="readingDate">
                Date
              </label>

              <input
                id="readingDate"
                name="readingDate"
                type="date"
                value={formData.readingDate}
                max={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label htmlFor="slot">
                Reading Slot
              </label>

              <select
                id="slot"
                name="slot"
                value={formData.slot}
                onChange={handleChange}
              >
                {SLOTS.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                  >
                    {slot}
                  </option>
                ))}
              </select>

            </div>

            <div className="form-group">

              <label htmlFor="glucoseValue">
                Glucose (mg/dL)
              </label>

              <input
                id="glucoseValue"
                name="glucoseValue"
                type="number"
                min="40"
                max="600"
                step="1"
                value={formData.glucoseValue}
                onChange={handleChange}
                placeholder="Enter glucose value"
              />

            </div>

            <button
              type="submit"
              className="add-reading-button"
            >
              {editingId
                ? "Update Reading"
                : "Add Reading"}
            </button>

          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <p className="form-note">
            Enter a whole-number glucose value between
            40 and 600 mg/dL.
          </p>

          {editingId && (
            <button
              type="button"
              className="back-button"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </button>
          )}

        </section>

        <section className="content-card">

          <h2>Your Readings</h2>

          {loading ? (
            <div className="loading">
              Loading readings...
            </div>
          ) : readings.length === 0 ? (
            <div className="empty-state">
              <p>No glucose readings yet.</p>
              <p>Add your first reading above.</p>
            </div>
          ) : (
            <div className="table-wrapper">

              <table className="readings-table">

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Slot</th>
                    <th>Glucose</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {readings.map((reading) => (
                    <tr key={reading.id}>

                      <td>
                        {reading.reading_date}
                      </td>

                      <td>
                        <span className="slot-badge">
                          {reading.slot}
                        </span>
                      </td>

                      <td>
                        <span className="glucose-value">
                          {reading.glucose_value} mg/dL
                        </span>
                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEdit(reading)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(reading.id)
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        <section className="content-card">

          <button
            className="report-button"
            onClick={() =>
              navigate("/reports")
            }
          >
            View Reports
          </button>

        </section>

      </div>
    </div>
  );
}

export default Dashboard;