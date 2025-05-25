import React, { useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, Snackbar
} from "@mui/material";

function KeyViewer({ onReset }) {
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const privateKey = localStorage.getItem("privateKey") || "Not set";

  const handleCopy = () => {
    navigator.clipboard.writeText(privateKey);
    setSnackbarOpen(true);
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "This will only reset this device. Other devices using the same key will not be affected. Continue?"
    );
    if (!confirmed) return;

    localStorage.removeItem("privateKey");
    onReset(); // App will handle reloading or key regeneration
    setOpen(false);
  };

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        My Key
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Your Private Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={privateKey}
            InputProps={{ readOnly: true }}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopy}>Copy</Button>
          <Button color="error" onClick={handleReset}>Reset Key</Button>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Key copied!"
      />
    </>
  );
}

export default KeyViewer;
