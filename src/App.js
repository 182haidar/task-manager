import React, { useState, useEffect } from 'react';
import './App.css';
import AddTaskForm from './components/AddTaskForm';
import { Switch, FormControlLabel, Box} from '@mui/material';
import ListView from './components/ListView';
import CardView from './components/CardView';


function App() {
  const [tasks, setTasks] = useState([]);
  const [isCardView, setIsCardView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const toggleComplete = (id) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };
  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
  }
  const postponeTask = (id) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const newDate = new Date(task.deadline);
        newDate.setDate(newDate.getDate() + 2);  // Postpone by 2 days
        return { ...task, deadline: newDate.toISOString().split('T')[0] };  // Format as YYYY-MM-DD
      }
      return task;
    });
    setTasks(updatedTasks);
  };
  
  


  // Load tasks from LocalStorage on first render
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (Array.isArray(savedTasks)) {
      setTasks(savedTasks);
    }
    setIsLoaded(true);
  }, []);

  // Save tasks to LocalStorage whenever tasks change
  useEffect(() => {
    if (isLoaded) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const sortedTasks = [...tasks].sort((a, b) => {
    const today = new Date();
  
    const aDiff = Math.ceil((new Date(a.deadline) - today) / (1000 * 60 * 60 * 24));
    const bDiff = Math.ceil((new Date(b.deadline) - today) / (1000 * 60 * 60 * 24));
  
    return aDiff - bDiff;  // Closest deadlines first
  });
  
  return (
    <div className="App">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 2 }}>
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
      <AddTaskForm addTask={(task) => setTasks([...tasks,task])} />

      {isCardView ? (
         <CardView tasks={sortedTasks} markAsDone={toggleComplete} deleteTask={deleteTask} postponeTask={postponeTask}/>
      ) : (
         <ListView tasks={sortedTasks} toggleComplete={toggleComplete} deleteTask={deleteTask} />
      )}
    </div>
  );
}

export default App;
