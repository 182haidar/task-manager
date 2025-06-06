import {
  collection,
  setDoc,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import React, { useState, useEffect, useMemo } from "react";
import Typography from "@mui/material/Typography";
import { QRCodeCanvas } from "qrcode.react";
import "./App.css";
import KeyViewer from "./components/KeyViewer";
import AddTaskForm from "./components/AddTaskForm";
import { Switch, FormControlLabel, Box, Snackbar, Button } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import ListView from "./components/ListView";
import CardView from "./components/CardView";

function App() {
  // --- Handle private key setup from URL or localStorage ---
  const queryParams = new URLSearchParams(window.location.search);
  const keyFromUrl = queryParams.get("key");
  const localKey = localStorage.getItem("privateKey");

  if (keyFromUrl && keyFromUrl !== localKey) {
    localStorage.setItem("privateKey", keyFromUrl);
    // Optional: Clean up URL
    const cleanUrl = new URL(window.location);
    cleanUrl.searchParams.delete("key");
    window.history.replaceState({}, document.title, cleanUrl.toString());
  } else if (!localKey) {
    const generatedKey = Math.random().toString(36).substring(2, 10); // e.g., "x9a4tq7p"
    localStorage.setItem("privateKey", generatedKey);
  }
  const isMobile = useMediaQuery('(max-width:600px)');
  const privateKey = localStorage.getItem("privateKey");
  const [showQR, setShowQR] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isCardView, setIsCardView] = useState(isMobile);
  const [isLoaded, setIsLoaded] = useState(false);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          ...(prefersDarkMode
            ? {
                background: {
                  default: "#121212", // Dark background
                  paper: "#1E1E1E", // Card/List background in dark
                },
                text: {
                  primary: "#FFFFFF",
                  secondary: "#B0B0B0",
                },
              }
            : {
                background: {
                  default: "#f5f5f5", // Soft light grey instead of pure white
                  paper: "#ffffff", // Keep cards/lists white for contrast
                },
                text: {
                  primary: "#000000",
                  secondary: "#555555",
                },
              }),
        },
      }),
    [prefersDarkMode]
  );
  //const filteredTasks = tasks.filter((task) => !task.completed);
  const sortedTasks = [...tasks].sort((a, b) => {
    const today = new Date();
    const aDiff = Math.ceil(
      (new Date(a.deadline) - today) / (1000 * 60 * 60 * 24)
    );
    const bDiff = Math.ceil(
      (new Date(b.deadline) - today) / (1000 * 60 * 60 * 24)
    );
    return aDiff - bDiff;
  });
  const toggleComplete = async (id) => {
    const originalTask = tasks.find(task => task.id === id);
  setLastAction({
    type: "toggle",
    task: { ...originalTask } // Clone to preserve pre-change state
  });
  setSnackbarOpen(true);

    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    const changedTask = updatedTasks.find((task) => task.id === id);
    const privateKey = localStorage.getItem("privateKey") || "demo-key";
    const taskRef = doc(db, "tasks", privateKey, "userTasks", id.toString());

    try {
      await updateDoc(taskRef, { completed: changedTask.completed });
    } catch (error) {
      console.error("Error updating completion status:", error);
    }
  };

  const addTaskToFirestore = async (task) => {
    const privateKey = localStorage.getItem("privateKey") || "demo-key";
    const userTasksRef = collection(doc(db, "tasks", privateKey), "userTasks");

    const docRef = await addDoc(userTasksRef, task);
    return { ...task, id: docRef.id };
  };

  const addTask = async (task) => {
    const newTask = await addTaskToFirestore(task);
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUndo = async () => {
  if (!lastAction) return;

  const privateKey = localStorage.getItem("privateKey") || "demo-key";
  const taskRef = doc(db, "tasks", privateKey, "userTasks", lastAction.task.id.toString());

  if (lastAction.type === "delete") {
    // 1. Restore to Firestore
    try {
      await setDoc(taskRef, lastAction.task); // re-create the deleted task
    } catch (err) {
      console.error("Failed to restore task to Firestore:", err);
    }

    // 2. Restore to local UI
    setTasks((prev) => [...prev, lastAction.task]);
  }

  if (lastAction.type === "toggle") {
    // 1. Flip completion status
    const toggled = {
      ...lastAction.task,
      completed: !lastAction.task.completed,
    };

    // 2. Update Firestore
    try {
      await updateDoc(taskRef, { completed: toggled.completed });
    } catch (err) {
      console.error("Failed to undo toggle in Firestore:", err);
    }

    // 3. Update UI
    setTasks((prev) =>
      prev.map((t) => (t.id === toggled.id ? toggled : t))
    );
  }

  setSnackbarOpen(false);
  setLastAction(null);
};


  const deleteTask = async (id) => {
  const taskToDelete = tasks.find((t) => t.id === id);
  if (!taskToDelete) return;

  // 🔁 1. Store lastAction for undo
  setLastAction({ type: "delete", task: { ...taskToDelete } });
  setSnackbarOpen(true);

  // 🗑 2. Delete from Firestore
  const privateKey = localStorage.getItem("privateKey") || "demo-key";
  const taskRef = doc(db, "tasks", privateKey, "userTasks", id.toString());

  try {
    await deleteDoc(taskRef);
    setTasks(tasks.filter((task) => task.id !== id));
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};


  const postponeTask = async (id) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const newDate = new Date(task.deadline);
        newDate.setDate(newDate.getDate() + 2); // Add 2 days
        return { ...task, deadline: newDate.toISOString() };
      }
      return task;
    });

    setTasks(updatedTasks);

    const updatedTask = updatedTasks.find((task) => task.id === id);
    const privateKey = localStorage.getItem("privateKey") || "demo-key";
    const taskRef = doc(db, "tasks", privateKey, "userTasks", id.toString());

    try {
      await updateDoc(taskRef, { deadline: updatedTask.deadline });
    } catch (error) {
      console.error("Error postponing task:", error);
    }
  };

  // Load tasks from LocalStorage on first render
  useEffect(() => {
    const privateKey = localStorage.getItem("privateKey") || "demo-key";
    const loadTasksFromFirestore = async () => {
      try {
        const userTasksRef = collection(
          doc(db, "tasks", privateKey),
          "userTasks"
        );
        const querySnapshot = await getDocs(userTasksRef);
        const fetchedTasks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };

    loadTasksFromFirestore();
    setIsLoaded(true);
  }, []);

  // Save tasks to LocalStorage whenever tasks change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const handleResetKey = () => {
  const newKey = Math.random().toString(36).substring(2, 10); // short and readable
  localStorage.setItem("privateKey", newKey);
  window.location.reload(); // refresh to load the new, empty Firestore path
};

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Box sx={{ display: "flex", justifyContent: "flex-end", padding: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isCardView}
                onChange={(e) => setIsCardView(e.target.checked)}
                color="primary"
              />
            }
            label={isCardView ? "Card View" : "List View"}
          />
          <KeyViewer onReset={handleResetKey} />
        </Box>

        <h1>Task Manager</h1>
        <Typography variant="body2" align="center" sx={{ mt: -3, mb: 3 }}>
          🔑 Your Sync Key: <code>{privateKey}</code>
          <Tooltip title={showQR ? "Hide QR" : "Show QR"}>
            <IconButton
              onClick={() => setShowQR((prev) => !prev)}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            >
              <QrCode2Icon />
            </IconButton>
          </Tooltip>
        </Typography>
        {!isCardView && <AddTaskForm addTask={addTask} />}
        {isCardView ? ( 
          <CardView
            tasks={sortedTasks}
            markAsDone={toggleComplete}
            deleteTask={deleteTask}
            postponeTask={postponeTask}
          />
        ) : (
          <ListView
            tasks={sortedTasks}
            toggleComplete={toggleComplete}
            deleteTask={deleteTask}
            setTasks={setTasks}
          />
        )}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={() => setSnackbarOpen(false)}
          message="Task updated"
          action={
            <Button color="secondary" size="small" onClick={handleUndo}>
              UNDO
            </Button>
          }
        />
        {showQR && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 9999,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowQR(false)} // tap anywhere to close
          >
            <QRCodeCanvas
              value={`${window.location.origin}/?key=${privateKey}`}
              size={220}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
            <Typography variant="body2" color="white" sx={{ mt: 2 }}>
              Tap anywhere to hide QR
            </Typography>
          </Box>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
