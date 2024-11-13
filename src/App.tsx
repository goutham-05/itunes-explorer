import React, { useEffect, useState, useMemo } from "react";
import debounce from "lodash/debounce";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { FaMusic, FaSearch } from "react-icons/fa";
import {
  AppBar,
  Card,
  CardContent,
  CardMedia,
  InputAdornment,
  TextField,
  IconButton,
  Toolbar,
  Typography,
  Button,
  CssBaseline,
  Skeleton,
  Box
} from "@mui/material";

// Interfaces
interface ItunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
}

interface CustomInputProps {
  value: string;
  onDebouncedChange: (value: string) => void;
}

// Components
const AppHeader: React.FC = () => (
  <AppBar position="static" sx={{ backgroundColor: "#1db954" }}>
    <Toolbar>
      <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
        <FaMusic />
      </IconButton>
      <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: "bold" }}>
        iTunes Explorer
      </Typography>
    </Toolbar>
  </AppBar>
);

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onDebouncedChange
}) => {
  const [inputValue, setInputValue] = useState(value);

  const debouncedSearch = useMemo(
    () => debounce(onDebouncedChange, 1000),
    [onDebouncedChange]
  );

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    debouncedSearch(newValue);
  };

  return (
    <TextField
      value={inputValue}
      onChange={handleChange}
      variant="outlined"
      placeholder="Search iTunes"
      fullWidth
      sx={{ maxWidth: 800 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <FaSearch color="gray" />
          </InputAdornment>
        )
      }}
    />
  );
};

const ResultCard: React.FC<{ track: ItunesResult }> = ({ track }) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: 3,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      transition: "transform 0.2s",
      "&:hover": { transform: "scale(1.03)" }
    }}
  >
    <CardMedia
      component="img"
      image={track.artworkUrl100.replace("100x100", "300x300")}
      alt={track.trackName}
      sx={{ height: 200, borderRadius: "8px 8px 0 0" }}
    />
    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" gutterBottom noWrap>
        {track.trackName}
      </Typography>
      <Typography variant="body2" color="textSecondary" noWrap>
        {track.artistName}
      </Typography>
      <AudioPlayer
        src={track.previewUrl}
        className="audio-player"
        customControlsSection={[RHAP_UI.MAIN_CONTROLS, RHAP_UI.VOLUME_CONTROLS]}
        customProgressBarSection={[
          RHAP_UI.PROGRESS_BAR,
          RHAP_UI.CURRENT_TIME,
          RHAP_UI.DURATION
        ]}
        layout="stacked-reverse"
      />
    </CardContent>
  </Card>
);

const SearchResults: React.FC<{
  results: ItunesResult[] | null;
  loading: boolean;
  error: Error | null;
  onReset: () => void;
}> = ({ results, loading, error }) => {
  if (loading) {
    return (
      <>
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index} sx={{ borderRadius: 2, boxShadow: 3 }}>
            <Skeleton
              variant="rectangular"
              height={200}
              animation="wave"
              sx={{ borderRadius: "8px 8px 0 0" }}
            />
            <CardContent>
              <Skeleton
                variant="text"
                width="80%"
                height={24}
                animation="wave"
                sx={{ mb: 1 }}
              />
              <Skeleton
                variant="text"
                width="60%"
                height={20}
                animation="wave"
                sx={{ mb: 2 }}
              />
              <Skeleton
                variant="rectangular"
                height={54}
                width="100%"
                animation="wave"
                sx={{ borderRadius: 1 }}
              />
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        Error: {error.message}
      </Typography>
    );
  }

  return (
    <>
      {results?.map((track) => (
        <ResultCard key={track.trackId} track={track} />
      ))}
    </>
  );
};

// Main App Component
const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: itunesResults,
    loading: itunesLoading,
    error: itunesError
  } = useFetch<{ results: ItunesResult[] }>(
    `https://itunes.apple.com/search?term=${searchTerm || "pop"}`
  );

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5"
        }}
      >
        <AppHeader />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 4,
            px: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            sx={{ maxWidth: 800, width: "100%", mb: 4 }}
          >
            <CustomInput value={searchTerm} onDebouncedChange={setSearchTerm} />
            <Button
              variant="contained"
              color="success"
              onClick={() => setSearchTerm("")}
              sx={{ ml: 2, height: "100%", padding: "15px 40px" }}
            >
              Reset
            </Button>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
            {itunesResults?.results && itunesResults?.results?.length === 0
              ? "No results found"
              : "Search Results"}
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))"
            gap={3}
            sx={{ width: "100%", maxWidth: 1600 }}
          >
            <SearchResults
              results={itunesResults?.results || null}
              loading={itunesLoading}
              error={itunesError}
              onReset={() => setSearchTerm("")}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

// Custom Hook for Fetching Data
const useFetch = <T,>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("An error occurred"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default App;
