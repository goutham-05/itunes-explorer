import React, { useEffect, useState, useMemo, useCallback } from "react";
import debounce from "lodash/debounce";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { FaMusic, FaSearch } from "react-icons/fa";
import {
  AppBar,
  Box,
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
  Skeleton
} from "@mui/material";

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

const gridLayout = {
  xs: "1fr",
  sm: "repeat(2, 1fr)",
  md: "repeat(3, 1fr)",
  lg: "repeat(4, 1fr)",
  xl: "repeat(5, 1fr)"
};

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onDebouncedChange
}) => {
  const [inputValue, setInputValue] = useState(value);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => onDebouncedChange(value), 1000),
    [onDebouncedChange]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInputValue(newValue);
      debouncedSearch(newValue);
    },
    [debouncedSearch]
  );

  return (
    <TextField
      value={inputValue}
      onChange={handleChange}
      variant="outlined"
      placeholder="Search iTunes"
      fullWidth
      sx={{ maxWidth: 800, width: "100%", mx: "auto", mb: 4 }}
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
        if (response.status === 404) {
          setData([] as unknown as T);
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setTimeout(() => {
          setData(result);
          setLoading(false);
        }, 1000);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("An error occurred"));
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, error };
};

function App() {
  const [searchTerm, setSearchTerm] = useState("pop");
  const [queryTerm, setQueryTerm] = useState("pop");

  const {
    data: itunesResults,
    loading: itunesLoading,
    error: itunesError
  } = useFetch<{ results: ItunesResult[] }>(
    `https://itunes.apple.com/search?term=${queryTerm || "pop"}`
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setQueryTerm(value || "pop");
  };

  const handleReset = () => {
    setSearchTerm("pop");
    setQueryTerm("pop");
  };

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
        <AppBar position="static" sx={{ backgroundColor: "#1db954" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <FaMusic />
            </IconButton>
            <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: "bold" }}>
              iTunes Explorer
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 4,
            px: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%"
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              maxWidth: 800,
              mb: 2
            }}
          >
            <CustomInput
              value={searchTerm}
              onDebouncedChange={handleSearchChange}
            />
          </Box>
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              mt: 2,
              mb: 3
            }}
          >
            Search Results
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              width: "100%",
              maxWidth: "1600px",
              padding: 2
            }}
          >
            <Box display="grid" gridTemplateColumns={gridLayout} gap={3}>
              {itunesLoading ? (
                [...Array(10)].map((_, index) => (
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
                ))
              ) : itunesError ? (
                <Box gridColumn="1 / -1" textAlign="center">
                  <Typography color="error">
                    Error: {itunesError.message}
                  </Typography>
                </Box>
              ) : itunesResults?.results.length === 0 ? (
                <Box gridColumn="1 / -1" textAlign="center">
                  <Typography variant="h6" color="textSecondary">
                    No results found
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleReset}
                    sx={{ mt: 2 }}
                  >
                    Reset Search
                  </Button>
                </Box>
              ) : (
                itunesResults?.results.map((track) => (
                  <Card
                    key={track.trackId}
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
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >
                      <Typography variant="h6" gutterBottom noWrap>
                        {track.trackName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {track.artistName}
                      </Typography>
                      <Box mt={2} sx={{ marginTop: "auto" }}>
                        <AudioPlayer
                          src={track.previewUrl}
                          className="audio-player"
                          customControlsSection={[
                            RHAP_UI.MAIN_CONTROLS,
                            RHAP_UI.VOLUME_CONTROLS
                          ]}
                          customProgressBarSection={[
                            RHAP_UI.PROGRESS_BAR,
                            RHAP_UI.CURRENT_TIME,
                            RHAP_UI.DURATION
                          ]}
                          layout="stacked-reverse"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;
