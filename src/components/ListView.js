import React from 'react';
import { List, ListItem, ListItemText, Divider, Checkbox,IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const getUrgencyColor = (deadline) => {
    const today = new Date();
    const taskDate = new Date(deadline);
    const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
  
    if (diffDays <= 0) return '#f44336';
    if (diffDays <= 2) return '#ff9800';
    if (diffDays <= 5) return '#ffeb3b';
    return '#4caf50';
  };
  

function ListView({ tasks, toggleComplete, deleteTask }) {
  return (
    <List sx={{ width: '100%', maxWidth: 600, margin: 'auto' }}>
      {tasks.length === 0 && <p>No tasks available.</p>}
      {tasks.map((task) => (
        <React.Fragment key={task.id}>
          <ListItem
            sx={{ borderLeft: `8px solid ${getUrgencyColor(task.deadline)}`  }}
             secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => deleteTask(task.id)}>
                    <DeleteIcon />
                </IconButton>
            }
           >
            <Checkbox
              checked={task.completed}
              onChange={() => toggleComplete(task.id)}
            />
            <ListItemText
              primary={
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'grey' : 'black' }}>
                  {task.title}
                </span>
              }
              secondary={`Category: ${task.category} | Due: ${task.deadline}`}
            />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
}

export default ListView;
