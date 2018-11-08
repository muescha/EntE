import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@material-ui/core";
import { createTranslation } from "../helpers/createTranslation";

const lang = createTranslation({
  en: {
    title: "Delete?",
    abort: "Abort",
    submit: "Delete"
  },
  de: {
    title: "Löschen?",
    abort: "Abbrechen",
    submit: "Löschen"
  }
});

interface DeleteModalProps {
  show: boolean;
  onDelete: () => void;
  onClose: () => void;
  text: string;
}

export const DeleteModal: React.SFC<DeleteModalProps> = props => {
  const { show, onDelete, onClose, text } = props;

  return (
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{lang.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>
          {lang.abort}
        </Button>
        <Button onClick={onDelete} color="secondary">
          {lang.submit}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
