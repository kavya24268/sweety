import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

function Reports() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [reportType, setReportType] = useState("daily");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      let endpoint;

      if (reportType === "daily") {
        endpoint = `/reports/daily?date=${selectedDate}`;
      } else if (reportType === "month-to-date") {
        endpoint = `/reports/month-to-date?date=${selectedDate}`;
      } else {
        endpoint = `/reports/monthly?month=${selectedMonth}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load report");
      }

      setReport(data.report);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchReport();
  };

  return (
    <div className="reports-page">
      <div className="reports-container">

        {/* Header */}
        <header className="report-header">
          <div>
            <div className="brand-small">
              <h1>Sweety</h1>
              <p>Blood Glucose Reports</p>
            </div>
          </div>

          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </header>

        {/* Report Controls */}
        <section className="report-controls">

          <div className="form-group">
            <label htmlFor="reportType">
              Report Type
            </label>

            <select
              id="reportType"
              value={reportType}
              onChange={(event) => {
                setReportType(event.target.value);
                setReport(null);
              }}
            >
              <option value="daily">Daily</option>
              <option value="month-to-date">
                Month-to-Date
              </option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {reportType === "monthly" ? (
            <div className="form-group">
              <label htmlFor="month">
                Month
              </label>

              <input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(event.target.value)
                }
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="date">
                Date
              </label>

              <input
                id="date"
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
              />
            </div>
          )}

          <button
            type="button"
            className="report-button"
            onClick={handleSubmit}
          >
            Generate Report
          </button>
        </section>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading">
            Loading report...
          </div>
        )}

        {/* Report */}
        {!loading && report && (
          <>
            {/* Summary */}
            <section className="summary-grid">

              <div className="summary-card">
                <p>Highest</p>

                <h3>
                  {report.highest === null
                    ? "—"
                    : `${report.highest} mg/dL`}
                </h3>
              </div>

              <div className="summary-card">
                <p>Lowest</p>

                <h3>
                  {report.lowest === null
                    ? "—"
                    : `${report.lowest} mg/dL`}
                </h3>
              </div>

              <div className="summary-card">
                <p>Average</p>

                <h3>
                  {report.average === null
                    ? "—"
                    : `${report.average} mg/dL`}
                </h3>
              </div>

              <div className="summary-card">
                <p>Total Readings</p>

                <h3>
                  {report.count}
                </h3>
              </div>

            </section>

            {/* Readings */}
            <section className="report-table-card">

              <h2>
                {reportType === "daily"
                  ? `Readings for ${report.date}`
                  : reportType === "month-to-date"
                  ? `Readings from ${report.startDate} to ${report.endDate}`
                  : `Readings for ${report.month}`}
              </h2>

              {report.readings.length === 0 ? (
                <div className="empty-state">
                  <p>
                    No readings found for this period.
                  </p>

                  <p>
                    Add a glucose reading from the Dashboard
                    to see it here.
                  </p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="readings-table">

                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Slot</th>
                        <th>Glucose</th>
                      </tr>
                    </thead>

                    <tbody>
                      {report.readings.map((reading) => (
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

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}

            </section>
          </>
        )}

      </div>
    </div>
  );
}

export default Reports;