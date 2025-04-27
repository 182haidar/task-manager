import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, CircularProgress, Box } from '@mui/material';
import Linkify from 'react-linkify';

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

const getFriendlyDeadline = (deadline) => {
  const now = new Date();
  const taskDate = new Date(deadline);
  const diffMs = taskDate - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) return `OVERDUE by ${Math.abs(diffHours)} hours`;
  if (diffHours < 24) return `Due in ${diffHours} hours`;

  const diffDays = Math.floor(diffHours / 24);
  return `Due in ${diffDays} days`;
};

   

function CardView({ tasks, markAsDone, deleteTask, postponeTask }) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdAction, setHoldAction] = useState(null);  // 'done' | 'delete' | 'postpone'
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  const currentTask = tasks[currentTaskIndex];
  const holdDuration = 5000;  // 3 seconds
  let holdTimer = null;

  const getUrgencyColor = (deadline) => {
    const today = new Date();
    const taskDate = new Date(deadline);
    const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
  
    if (diffDays <= 0) return '#f44336';   // Red
    if (diffDays <= 2) return '#ff9800';   // Orange
    if (diffDays <= 5) return '#ffeb3b';   // Yellow
    return '#4caf50';                      // Green
  };
  

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isHolding || !currentTask) return;

      if (e.key === 'ArrowRight') {
        triggerHold('done', () => markAsDone(currentTask.id));
      }
      if (e.key === 'ArrowLeft') {
        triggerHold('delete', () => deleteTask(currentTask.id));
      }
      if (e.key === 'ArrowUp') {
        triggerHold('postpone', () => postponeTask(currentTask.id));
      }
    };

    const handleKeyUp = () => {
      clearTimeout(holdTimer);
      setIsHolding(false);
      setHoldAction(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isHolding, currentTask]);

  const triggerHold = (actionType, callback) => {
    setIsHolding(true);
    setHoldAction(actionType);
    holdTimer = setTimeout(() => {
      callback();
      moveToNextTask();
    }, holdDuration);
  };

  const moveToNextTask = () => {
    setIsHolding(false);
    setHoldAction(null);
    setCurrentTaskIndex(prev => prev + 1);
  };

  if (!currentTask) {
    return <Typography variant="h6" align="center" sx={{ mt: 4 }}>
      🎉 You're all caught up! No tasks remaining.
      </Typography>;
  }

  return (
    <Grid container justifyContent="center" sx={{ marginTop: 4 }}>
      <Card sx={{ borderTop: `12px solid ${getUrgencyColor(currentTask.deadline)}`, backgroundColor: 'background.paper',minWidth: 300, marginBottom: 3 }}>
        <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: getUrgencyColor(currentTask.deadline) }}>
            {getFriendlyDeadline(currentTask.deadline)}
            </Typography>
            <Typography variant="h5" gutterBottom>
            {currentTask.title}
            </Typography>
            <Typography color="text.secondary">
            Due: {new Date(currentTask.deadline).toLocaleString()}
            </Typography>
            {currentTask.description && (
              <Linkify componentDecorator={linkDecorator}>
                <Typography variant="body2" sx={{ mt:2 , whiteSpace: 'pre-line', maxWidth: '400px',wordBreak: 'break-word' }}>
                  {currentTask.description}
                </Typography>
              </Linkify>
            )}
            {currentTask.completed && (
            <Typography color="primary">✔ Completed</Typography>
            )}
        </CardContent>
      </Card>


      {isHolding && (
        <Box sx={{ position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <CircularProgress size={80} />
          <Typography align="center" mt={2}>
            {holdAction === 'done' && 'Marking as Done...'}
            {holdAction === 'delete' && 'Deleting Task...'}
            {holdAction === 'postpone' && 'Postponing Task...'}
          </Typography>
        </Box>
      )}
    </Grid>
  );
}

export default CardView;
