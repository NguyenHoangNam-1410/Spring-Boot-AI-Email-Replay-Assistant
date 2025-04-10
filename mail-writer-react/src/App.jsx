import { useState } from "react";
import "./App.css";
import {
  TextField,
  Typography,
  Container,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  CircularProgress,
  Select,
} from "@mui/material";
import axios from "axios";

function App() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [generateReply, setGenerateReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!emailContent) {
      setError("Email content is required.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:8080/api/email/generate",
        {
          emailContent,
          tone,
        }
      );
      setGenerateReply(
        response.data && typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data || "No reply generated.")
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to generate email reply.";
      setError(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Email Reply Generator
      </Typography>

      <Box sx={{ mx: 3 }}>
        <TextField
          fullWidth
          multiline
          row={6}
          variant="outlined"
          label="Original Email Content"
          value={emailContent || ""}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="tone-label">Tone (Optional)</InputLabel>
          <Select
            labelId="tone-label"
            value={tone || ""}
            onChange={(e) => setTone(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="friendly">Friendly</MenuItem>
            <MenuItem value="sincere">Sincere</MenuItem>
            <MenuItem value="luxurious">Luxurious</MenuItem>
            <MenuItem value="funny">Funny</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!emailContent || loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "Generate Reply"}
        </Button>
      </Box>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {generateReply && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generated Reply
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={12}
            variant="outlined"
            value={generateReply || ""}
            inputProps={{ readOnly: true }}
            sx={{ mb: 2 }} // Add margin below the TextField for better spacing
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigator.clipboard.writeText(generateReply)}
              sx={{ minWidth: 150 }} // Ensure consistent button width
            >
              Copy to Clipboard
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setEmailContent(""); // Clear the email content
                setGenerateReply(""); // Clear the generated reply
              }}
              sx={{ minWidth: 150 }} // Ensure consistent button width
            >
              Clear
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default App;
