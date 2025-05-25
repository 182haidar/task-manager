import React, { useState } from "react";
import useMediaQuery from '@mui/material/useMediaQuery';
import { TextField, Button, Box } from "@mui/material";
//import { Description } from '@mui/icons-material';
//import { collection, addDoc } from 'firebase/firestore';
//import { db } from './firebase';

function AddTaskForm({ addTask }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !deadline) return;

    addTask({
      title,
      deadline,
      description,
      completed: false,
    });

    setTitle("");
    setDeadline("");
    setDescription("");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        flexWrap: "wrap",
        alignItems: 'center',
        justifyContent: "center",
        gap: 2,
        mb: 3,
        px: 1
      }}
    >
      <TextField
        label="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        sx={{ 
          flexGrow: 1,
          minWidth: isMobile ? '100%' : 200,
          maxWidth: isMobile ? '100%' : 250,
        }}
      />
      <TextField
        label="Deadline"
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        InputLabelProps={{ shrink: true }}
        required
        sx={{ 
          flexGrow: 1,
          minWidth: isMobile ? '100%' : 175,
          maxWidth: isMobile ? '100%' : 200,
        }}
      />
      <TextField
        label="Description"
        multiline
        rows={1}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional notes or links..."
        sx={{ 
          flexGrow: 1,
          minWidth: isMobile ? '100%' : 175,
          maxWidth: isMobile ? '100%' : 250,
        }}
      />
      <Button type="submit" variant="contained">
        Add Task
      </Button>
    </Box>
  );
}

export default AddTaskForm;
