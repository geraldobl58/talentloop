"use client";

import { memo, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Alert,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Refresh, Close } from "@mui/icons-material";

import { Disable2FAInput } from "../../schemas/profile-2fa";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface RegenerateBackupDialogProps {
  open: boolean;
  feedback: FeedbackState | null;
  regenerateForm: UseFormReturn<Disable2FAInput>;
  isRegenerating: boolean;
  onClose: () => void;
  onRegenerate: (data: Disable2FAInput) => void;
}

export const RegenerateBackupDialog = memo(
  ({
    open,
    feedback,
    regenerateForm,
    isRegenerating,
    onClose,
    onRegenerate,
  }: RegenerateBackupDialogProps) => {
    const handleClose = useCallback(() => {
      regenerateForm.reset();
      onClose();
    }, [regenerateForm, onClose]);

    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <Refresh color="primary" />
            Regenerar códigos de backup
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={regenerateForm.handleSubmit(onRegenerate)}>
          <DialogContent>
            <Alert severity="warning" className="mb-4">
              Os códigos de backup antigos não funcionarão mais após a
              regeneração.
            </Alert>

            <Typography variant="body2" color="text.secondary" className="mb-3">
              Digite seu código TOTP (6 dígitos) ou código de backup (8
              caracteres alfanuméricos) para confirmar.
            </Typography>

            <TextField
              fullWidth
              label="Código de verificação"
              placeholder="000000 ou ABCD1234"
              {...regenerateForm.register("token")}
              error={!!regenerateForm.formState.errors.token}
              helperText={regenerateForm.formState.errors.token?.message}
              disabled={isRegenerating}
              inputProps={{
                maxLength: 8,
                style: {
                  textTransform: "uppercase",
                },
              }}
            />

            {feedback && (
              <Alert severity={feedback.type} className="mt-3">
                {feedback.message}
              </Alert>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} disabled={isRegenerating}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!regenerateForm.formState.isValid || isRegenerating}
              startIcon={
                isRegenerating ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isRegenerating ? "Regenerando..." : "Regenerar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
);

RegenerateBackupDialog.displayName = "RegenerateBackupDialog";
