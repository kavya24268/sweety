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
    <div>
      <header>
        <h1>Sweety Reports</h1>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main>
        <section>
          <h2>Report Type</h2>

          <select
            value={reportType}
            onChange={(event) => {
              setReportType(event.target.value);
              setReport(null);
            }}
          >
            <option value="daily">Daily</option>
            <option value="month-to-date">Month-to-Date</option>
            <option value="monthly">Monthly</option>
          </select>

          <form onSubmit={handleSubmit}>
            {reportType === "monthly" ? (
              <div>
                <label htmlFor="month">Month</label>

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
              <div>
                <label htmlFor="date">Date</label>

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

            <button type="submit">Generate Report</button>
          </form>
        </section>

        {error && <p>{error}</p>}

        {loading && <p>Loading report...</p>}

        {!loading && report && (
          <section>
            <h2>Summary</h2>

            <p>
              <strong>Highest:</strong>{" "}
              {report.highest === null
                ? "No data"
                : `${report.highest} mg/dL`}
            </p>

            <p>
              <strong>Lowest:</strong>{" "}
              {report.lowest === null
                ? "No data"
                : `${report.lowest} mg/dL`}
            </p>

            <p>
              <strong>Average:</strong>{" "}
              {report.average === null
                ? "No data"
                : `${report.average} mg/dL`}
            </p>

            <p>
              <strong>Total readings:</strong> {report.count}
            </p>

            <h2>Readings</h2>

            {report.readings.length === 0 ? (
              <p>No readings found for this period.</p>
            ) : (
              <table>
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
                      <td>{reading.reading_date}</td>
                      <td>{reading.slot}</td>
                      <td>{reading.glucose_value} mg/dL</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default Reports;