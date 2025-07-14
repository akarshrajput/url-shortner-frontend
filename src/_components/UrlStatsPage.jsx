import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

const API_BASE = "http://localhost:4000";

export default function UrlStatsPage() {
  const [shortcodes, setShortcodes] = useState([]);
  const [inputCode, setInputCode] = useState("");
  const [statsList, setStatsList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("shortcodes") || "[]");
    setShortcodes(saved);
  }, []);

  useEffect(() => {
    shortcodes.forEach((code) => {
      fetchStats(code);
    });
  }, [shortcodes]);

  const fetchStats = async (code) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/shorturls/${code}`);
      setStatsList((prev) => {
        if (prev.find((s) => s.shortcode === code)) return prev;
        return [...prev, res.data];
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const addShortcode = () => {
    if (!inputCode.match(/^[a-zA-Z0-9]{4,10}$/)) {
      setError("Shortcode must be 4-10 alphanumeric characters");
      return;
    }
    if (shortcodes.includes(inputCode)) {
      setError("Shortcode already added");
      return;
    }
    const updated = [...shortcodes, inputCode];
    setShortcodes(updated);
    localStorage.setItem("shortcodes", JSON.stringify(updated));
    fetchStats(inputCode);
    setInputCode("");
    setError("");
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={4}>
        URL Shortener Statistics
      </Typography>

      <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="Enter Shortcode"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          helperText="4-10 alphanumeric chars"
          sx={{ flexGrow: 1, minWidth: 220 }}
        />
        <Button
          variant="contained"
          onClick={addShortcode}
          sx={{ fontWeight: "bold" }}
        >
          Add
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <CircularProgress sx={{ mb: 3 }} />}

      {!loading && statsList.length === 0 && (
        <Typography>No statistics available. Add shortcodes above.</Typography>
      )}

      {statsList.map(
        ({
          shortcode,
          originalUrl,
          createdAt,
          expiry,
          totalClicks,
          clicks,
        }) => (
          <Paper key={shortcode} sx={{ mb: 4, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              Shortcode: {shortcode}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap mb={1}>
              Original URL:{" "}
              <a
                href={originalUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#1976d2" }}
              >
                {originalUrl}
              </a>
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Created At: {new Date(createdAt).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Expires At: {new Date(expiry).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Total Clicks: {totalClicks}
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Click Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {clicks.length === 0 ? (
                  <Typography>No clicks recorded yet.</Typography>
                ) : (
                  <Table size="small" sx={{ minWidth: 320 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Timestamp
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Referrer
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Location
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clicks.map((click, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            {new Date(click.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{click.referrer}</TableCell>
                          <TableCell>{click.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </AccordionDetails>
            </Accordion>
          </Paper>
        )
      )}
    </Box>
  );
}
