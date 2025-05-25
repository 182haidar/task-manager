import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import AddTaskForm from "./components/AddTaskForm";
import { Switch, FormControlLabel, Box, Snackbar, Button } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isCardView, setIsCardView] = useState(false);
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

  const handleUndo = () => {
    if (!lastAction) return;

    if (lastAction.type === "delete") {
      setTasks((prev) => [...prev, lastAction.task]);
    } else if (lastAction.type === "toggle") {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === lastAction.task.id
            ? { ...task, completed: !lastAction.task.completed }
            : task
        )
      );
    }

    setSnackbarOpen(false);
    setLastAction(null);
  };

  const deleteTask = async (id) => {
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
            labelPlacement="start"
          />
        </Box>

        <h1>Task Manager</h1>
        <AddTaskForm addTask={addTask} />
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
      </div>
    </ThemeProvider>
  );
}

export default App;
