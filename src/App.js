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
  const toggleComplete = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    const changedTask = tasks.find((task) => task.id === id);
    setTasks(updatedTasks);
    setLastAction({ type: "toggle", task: changedTask });
    setSnackbarOpen(true);
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

  const deleteTask = (id) => {
    const taskToDelete = tasks.find((task) => task.id === id);
    setTasks(tasks.filter((task) => task.id !== id));
    setLastAction({ type: "delete", task: taskToDelete });
    setSnackbarOpen(true);
  };
  const postponeTask = (id) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const newDate = new Date(task.deadline);
        newDate.setDate(newDate.getDate() + 2); // Postpone by 2 days
        return { ...task, deadline: newDate.toISOString().split("T")[0] }; // Format as YYYY-MM-DD
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  // Load tasks from LocalStorage on first render
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (Array.isArray(savedTasks)) {
      setTasks(savedTasks);
    }
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
        <AddTaskForm addTask={(task) => setTasks([...tasks, { ...task, description: task.description || "" }])} />

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
