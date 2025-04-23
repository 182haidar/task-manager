import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, Box, FormControlLabel, Checkbox } from '@mui/material';

function AddTaskForm({ addTask }) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !deadline) return;

    addTask({
      id: Date.now(),
      title,
      deadline,
      category,
      completed: false,
      priority: priority
    });

    setTitle('');
    setDeadline('');
    setCategory('Work');
    setPriority(false);
  };

  return (
    <Box
    component="form"
    onSubmit={handleSubmit}
    sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 3}}
    >
      <TextField
        label="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <TextField
        label="Deadline"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        InputLabelProps={{shrink: true}}
        required
      />
      <Select
       value={category} 
       onChange={(e) => setCategory(e.target.value)}
       >
        <MenuItem value="Work">Work</MenuItem>
        <MenuItem value="Study">Study</MenuItem>
        <MenuItem value="Personal">Personal</MenuItem>
      </Select>
      <FormControlLabel
        control={
          <Checkbox
            checked={priority}
            onChange={(e) => setPriority(e.target.checked)}
          />
        }
        label="Mark as Priority"
      />
      <Button type="submit" variant='contained'>Add Task</Button>
    </Box>
  );
}

export default AddTaskForm;
