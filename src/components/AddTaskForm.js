import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
//import { Description } from '@mui/icons-material';

function AddTaskForm({ addTask }) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !deadline) return;

    addTask({
      id: Date.now(),
      title,
      deadline,
      description,
      completed: false,
    });

    setTitle('');
    setDeadline('');
    setDescription('');
  };

  return (
    <Box
    component="form"
    onSubmit={handleSubmit}
    sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mb: 3 }}
    >
      <TextField
        label="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        sx={{ minWidth: 150 }}
      />
      <TextField
        label="Deadline"
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        InputLabelProps={{shrink: true}}
        required
        sx={{ minWidth: 180 }}
      />
      <TextField
       label="Description"
       multiline
       rows={1}
       value={description}
       onChange={(e) => setDescription(e.target.value)}
       placeholder="Optional notes or links..."
       sx={{ minWidth: 250 }}
      />
      <Button type="submit" variant='contained'>Add Task</Button>
    </Box>
  );
}

export default AddTaskForm;
