import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  IconButton,
} from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import LinkIcon from "@mui/icons-material/Link";
import BarChartIcon from "@mui/icons-material/BarChart";
import MenuIcon from "@mui/icons-material/Menu";
import { motion } from "framer-motion";
import UrlShortenerPage from "./_components/UrlShortenerPage";
import UrlStatsPage from "./_components/UrlStatsPage";
import theme from "./theme";

const drawerWidth = 280;

const navItems = [
  { label: "Shorten URLs", icon: <LinkIcon />, path: "/" },
  { label: "Statistics", icon: <BarChartIcon />, path: "/stats" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#fff",
          color: "#212121",
          borderRadius: 0,
          borderRight: "1px solid #e0e0e0",
          boxShadow: "none",
        },
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          sx={{ fontWeight: "bold", letterSpacing: "0.05em", color: "#1976d2" }} // keep brand color for title
        >
          Affordmed
        </Typography>
      </Toolbar>
      <List>
        {navItems.map(({ label, icon, path }) => (
          <ListItemButton
            key={label}
            selected={location.pathname === path}
            onClick={() => navigate(path)}
            sx={{
              color: "#212121",
              borderRadius: 0,
              "&.Mui-selected": {
                backgroundColor: "#e3f2fd",
                "&:hover": { backgroundColor: "#bbdefb" },
              },
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            <ListItemIcon sx={{ color: "#1976d2" }}>{icon}</ListItemIcon>{" "}
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <Box
            component="main"
            sx={{ flexGrow: 1, p: 4, bgcolor: "background.default" }}
          >
            <Toolbar />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route path="/" element={<UrlShortenerPage />} />
                <Route path="/stats" element={<UrlStatsPage />} />
              </Routes>
            </motion.div>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
