import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

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
    readingDate: new Date().toISOString().split("T")[0],
    slot: "Morning",
    glucoseValue: "",
  });

  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/readings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load readings");
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

    const glucoseValue = Number(formData.glucoseValue);

    if (!Number.isInteger(glucoseValue)) {
      setError("Glucose value must be a whole number");
      return false;
    }

    if (glucoseValue < 40 || glucoseValue > 600) {
      setError("Glucose value must be between 40 and 600 mg/dL");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      readingDate: new Date().toISOString().split("T")[0],
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

    const glucoseValue = Number(formData.glucoseValue);

    try {
      const response = await fetch(`${API_BASE_URL}/readings`, {
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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add reading");
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
      glucoseValue: String(reading.glucose_value),
    });

    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    const glucoseValue = Number(formData.glucoseValue);

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
        throw new Error(data.message || "Failed to update reading");
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
        throw new Error(data.message || "Failed to delete reading");
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
    <div>
      <header>
        <div>
          <h1>Sweety</h1>
          <p>Blood Glucose Tracker</p>
        </div>

        <div>
          <span>Welcome, {user?.name}</span>{" "}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main>
        <section>
          <h2>
            {editingId ? "Edit Glucose Reading" : "Add Glucose Reading"}
          </h2>

          <form
            onSubmit={editingId ? handleUpdate : handleSubmit}
          >
            <div>
              <label htmlFor="readingDate">Date</label>

              <input
                id="readingDate"
                name="readingDate"
                type="date"
                value={formData.readingDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="slot">Reading Slot</label>

              <select
                id="slot"
                name="slot"
                value={formData.slot}
                onChange={handleChange}
              >
                {SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div>
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

            {error && <p>{error}</p>}

            <button type="submit">
              {editingId ? "Update Reading" : "Add Reading"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </form>
        </section>

        <section>
          <h2>Your Readings</h2>

          {loading ? (
            <p>Loading readings...</p>
          ) : readings.length === 0 ? (
            <p>No glucose readings yet.</p>
          ) : (
            <table>
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
                    <td>{reading.reading_date}</td>

                    <td>{reading.slot}</td>

                    <td>
                      {reading.glucose_value} mg/dL
                    </td>

                    <td>
                      <button
                        onClick={() => handleEdit(reading)}
                      >
                        Edit
                      </button>{" "}

                      <button
                        onClick={() => handleDelete(reading.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <button onClick={() => navigate("/reports")}>
            View Reports
          </button>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;