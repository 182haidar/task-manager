import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
} from "@mui/material";
import Linkify from "react-linkify";
import { getFriendlyDeadline, getUrgencyColor } from "../utils/dateHelpers";

const shortenLink = (href) => {
  const maxLength = 40;
  return href.length > maxLength ? href.slice(0, 30) + "..." : href;
};

const linkDecorator = (href, text, key) => (
  <a href={href} key={key} target="_blank" rel="noopener noreferrer">
    {shortenLink(href)}
  </a>
);

function CardView({ tasks, markAsDone, deleteTask, postponeTask }) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const currentTask = tasks[currentTaskIndex];

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentTaskIndex((prev) => (prev + 1) % tasks.length),
    onSwipedRight: () =>
      setCurrentTaskIndex((prev) => (prev - 1 + tasks.length) % tasks.length),
    trackMouse: true,
  });

  const moveToNextTask = () => {
    setCurrentTaskIndex((prev) => (prev + 1) % tasks.length);
  };

  const moveToPrevTask = () => {
    setCurrentTaskIndex((prev) => (prev - 1 + tasks.length) % tasks.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") moveToNextTask();
      if (e.key === "ArrowLeft") moveToPrevTask();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tasks.length]);

  if (!currentTask) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        🎉 You're all caught up! No tasks remaining.
      </Typography>
    );
  }

  return (
    <Box
      {...swipeHandlers}
      sx={{
        mt : 4,
        transition: "transform 1s ease",
      }}
    >
      <Grid container justifyContent="center">
        <Card
          sx={{
            transition: "transform 1s ease, opacity 0.1s ease",
            borderRadius: 3,
            boxShadow: 3,
            height: "35vh", // 50% of screen height
            width: "90vw",
            borderTop: `12px solid ${getUrgencyColor(currentTask.deadline)}`,
            backgroundColor: "background.paper",
            width: "100%",
            maxWidth: 500,
          }}
        >
          <CardContent>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: "bold",
                color: getUrgencyColor(currentTask.deadline),
              }}
            >
              {getFriendlyDeadline(currentTask.deadline)}
            </Typography>
            <Typography variant="h5" gutterBottom>
              {currentTask.title}
            </Typography>
            <Typography color="text.secondary">
              Due: {new Date(currentTask.deadline).toLocaleString()}
            </Typography>

            <Linkify componentDecorator={linkDecorator}>
              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  whiteSpace: "pre-line",
                  maxWidth: "100%",
                  wordBreak: "break-word",
                }}
              >
                {currentTask.description || "No description added."}
              </Typography>
            </Linkify>

            {currentTask.completed && (
              <Typography color="primary">✔ Completed</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 5,
          mt: 7,
          minHeight: 50,
        }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={() => markAsDone(currentTask.id)}
        >
          Mark as Done
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => postponeTask(currentTask.id)}
        >
          Postpone
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => deleteTask(currentTask.id)}
        >
          Delete
        </Button>
      </Box>
    </Box>
  );
}

export default CardView;
