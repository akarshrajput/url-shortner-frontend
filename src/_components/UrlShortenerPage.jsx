import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const API_BASE = "http://localhost:4000";

const emptyInput = { url: "", validity: "", shortcode: "" };

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function UrlShortenerPage() {
  const [inputs, setInputs] = useState([{ ...emptyInput }]);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Correct state update - create new array and new object for the changed row
  const handleChange = (index, field, value) => {
    setInputs((prevInputs) => {
      return prevInputs.map((input, i) =>
        i === index ? { ...input, [field]: value } : input
      );
    });
  };

  const addInput = () => {
    if (inputs.length < 5) {
      setInputs((prev) => [...prev, { ...emptyInput }]);
    }
  };

  const removeInput = (index) => {
    setInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setErrors([]);
    setResults([]);
    setLoading(true);

    const validationErrors = [];

    inputs.forEach(({ url, validity, shortcode }, i) => {
      if (!url || !isValidUrl(url)) {
        validationErrors.push(`Row ${i + 1}: Invalid URL`);
      }
      if (validity && (!/^\d+$/.test(validity) || parseInt(validity) <= 0)) {
        validationErrors.push(
          `Row ${i + 1}: Validity must be a positive integer`
        );
      }
      if (shortcode && !/^[a-zA-Z0-9]{4,10}$/.test(shortcode)) {
        validationErrors.push(
          `Row ${i + 1}: Shortcode must be 4-10 alphanumeric chars`
        );
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const responses = await Promise.all(
        inputs.map(({ url, validity, shortcode }) => {
          const data = { url };
          if (validity) data.validity = parseInt(validity);
          if (shortcode) data.shortcode = shortcode;
          return axios.post(`${API_BASE}/shorturls`, data);
        })
      );

      const newResults = responses.map((res, i) => ({
        originalUrl: inputs[i].url,
        shortLink: res.data.shortLink,
        expiry: res.data.expiry,
      }));

      setResults(newResults);
    } catch (error) {
      if (error.response?.data?.error) {
        setErrors([error.response.data.error]);
      } else {
        setErrors(["An unexpected error occurred."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={4}>
        Shorten URLs (up to 5 at once)
      </Typography>

      {inputs.map((input, index) => (
        <Paper key={index} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                label="Original URL"
                placeholder="https://example.com/long-url"
                fullWidth
                required
                value={input.url}
                onChange={(e) => handleChange(index, "url", e.target.value)}
                size="medium"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                label="Validity (minutes)"
                type="number"
                inputProps={{ min: 1 }}
                fullWidth
                value={input.validity}
                onChange={(e) =>
                  handleChange(index, "validity", e.target.value)
                }
                size="medium"
                placeholder="30"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                label="Custom Shortcode"
                fullWidth
                value={input.shortcode}
                onChange={(e) =>
                  handleChange(index, "shortcode", e.target.value)
                }
                helperText="4-10 alphanumeric chars (optional)"
                size="medium"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sx={{ textAlign: { xs: "left", md: "right" } }}
            >
              {inputs.length > 1 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeInput(index)}
                  sx={{ mt: { xs: 1, md: 0 } }}
                >
                  Remove
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Box mb={4}>
        {inputs.length < 5 && (
          <Button variant="text" onClick={addInput} sx={{ fontWeight: "bold" }}>
            + Add URL
          </Button>
        )}
      </Box>

      <Box mb={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          size="large"
          disabled={loading}
          sx={{ fontWeight: "bold", minWidth: 160 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Shorten"}
        </Button>
      </Box>

      {errors.length > 0 && (
        <Box mb={4}>
          {errors.map((err, i) => (
            <Alert severity="error" key={i} sx={{ mb: 1 }}>
              {err}
            </Alert>
          ))}
        </Box>
      )}

      {results.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Results
          </Typography>
          {results.map(({ originalUrl, shortLink, expiry }, i) => (
            <Paper
              key={i}
              sx={{
                p: 3,
                mb: 3,
                cursor: "pointer",
                "&:hover": { boxShadow: "0 8px 24px rgba(25,118,210,0.2)" },
              }}
              onClick={() => window.open(shortLink, "_blank")}
              title="Click to open short link"
            >
              <Typography
                variant="subtitle1"
                noWrap
                color="primary"
                fontWeight="bold"
              >
                {shortLink}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Original URL: {originalUrl}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expires: {new Date(expiry).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
