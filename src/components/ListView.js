import React, { useState } from 'react';
import Linkify from 'react-linkify';
import { Typography,List, TextField, ListItem, ListItemText, Divider, Checkbox,IconButton, Box, Button} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getFriendlyDeadline, getUrgencyColor } from '../utils/dateHelpers';

function ListView({ tasks, toggleComplete, deleteTask, setTasks }) {
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [tempDescription, setTempDescription] = useState('');
  const handleToggleExpand = (id) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };
  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setTempDescription(task.description || '');
  };
  const handleSaveDescription = (taskId) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, description: tempDescription } : t
    );
    setTasks(updatedTasks);
    setEditingTaskId(null);
  };
  const shortenLink = (href) => {
    const maxLength = 40;
    return href.length > maxLength 
      ? href.slice(0, 30) + '...' 
      : href;
  };
  
  const linkDecorator = (href, text, key) => (
    <a href={href} key={key} target="_blank" rel="noopener noreferrer">
      {shortenLink(href)}
    </a>
  );
  return (
    <List sx={{ width: '100%', maxWidth: 1000, margin: 'auto',mt: 2}}>
      {tasks.length === 0 && (
      <Typography variant="h6" align="center" >
        🎉 You're all caught up! No tasks remaining.
      </Typography> 
      )}
      {tasks.map((task) => (
        <React.Fragment key={task.id}>
          <ListItem
            sx={{borderLeft: `8px solid ${getUrgencyColor(task.deadline)}`, backgroundColor: 'background.paper', borderRadius: 1}}
             secondaryAction={
            <>
              <IconButton onClick={() => handleToggleExpand(task.id)}>
                {expandedTaskId === task.id ? '-' : '+'}
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => deleteTask(task.id)}>
                <DeleteIcon />
              </IconButton>
            </>
            }
            >
            <Checkbox
              checked={task.completed}
              onChange={() => toggleComplete(task.id)}
            />
            <ListItemText
              primary={
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'grey' : 'inherit' }}>
                  {task.title}
                </span>
              }
              secondary={getFriendlyDeadline(task.deadline)}
            />
          </ListItem>
          {/* Show Description When Expanded */}
          {expandedTaskId === task.id && (
  <Box sx={{ pl: 6, pr: 2, pb: 1 }}>
    {editingTaskId === task.id ? (
      <>
        <TextField
          multiline
          fullWidth
          value={tempDescription}
          onChange={(e) => setTempDescription(e.target.value)}
          sx={{ mb: 1 }}
        />
        <Button variant="contained" size="small" onClick={() => handleSaveDescription(task.id)}>
          Save
        </Button>
      </>
    ) : (
      <>
        <Linkify componentDecorator={linkDecorator}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt:1}}>
            {task.description || "No description yet. Click Edit to add one."}
          </Typography>
        </Linkify>
        <Button variant="outlined" size="small" onClick={() => handleEditClick(task)} sx={{ mt: 1 }}>
          Edit
        </Button>
      </>
    )}
          </Box>
          )}
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
}

export default ListView;
