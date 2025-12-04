"use client";

import { useState, useRef } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { CloudUpload, Delete } from "@mui/icons-material";

import { UserProfile } from "@/app/hooks/use-profile";
import { useAvatarUpload } from "../hooks/use-avatar-upload";

interface ProfileAvatarTabProps {
  profile: UserProfile | undefined;
}

export const ProfileAvatarTab = ({ profile }: ProfileAvatarTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { mutate: uploadAvatar, isPending } = useAvatarUpload({
    onSuccess: (data) => {
      if (data.success) {
        setFeedback({
          type: "success",
          message: data.message || "Avatar atualizado com sucesso!",
        });
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setFeedback({
          type: "error",
          message: data.message || "Erro ao enviar avatar",
        });
      }
    },
    onError: (error) => {
      setFeedback({
        type: "error",
        message: error.message || "Erro inesperado ao enviar avatar",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFeedback(null);

    if (file) {
      // Validate file size (1MB max)
      if (file.size > 1 * 1024 * 1024) {
        setFeedback({
          type: "error",
          message: "Arquivo deve ser menor que 1MB",
        });
        return;
      }

      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setFeedback({
          type: "error",
          message: "Formato deve ser PNG, JPG, GIF ou WebP",
        });
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFeedback(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadAvatar(selectedFile);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  // Current avatar to display (preview takes priority)
  const displayAvatar = previewUrl || profile?.avatar || undefined;

  return (
    <Box className="space-y-6">
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            Foto de Perfil
          </Typography>

          <Box className="flex flex-col items-center gap-6">
            {/* Avatar Preview */}
            <Box className="relative">
              <Avatar
                alt={profile?.name || "Avatar"}
                src={displayAvatar}
                sx={{
                  width: 150,
                  height: 150,
                  fontSize: 48,
                  border: previewUrl ? "3px solid" : "none",
                  borderColor: "primary.main",
                }}
              >
                {profile?.name?.charAt(0).toUpperCase()}
              </Avatar>

              {previewUrl && (
                <IconButton
                  size="small"
                  onClick={handleRemovePreview}
                  disabled={isPending}
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    bgcolor: "error.main",
                    color: "white",
                    "&:hover": { bgcolor: "error.dark" },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Upload Instructions */}
            <Box className="text-center">
              <Typography
                variant="body2"
                color="text.secondary"
                className="mb-1"
              >
                Formatos aceitos: JPG, PNG, GIF, WebP
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tamanho máximo: 1MB
              </Typography>
            </Box>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            {/* Action Buttons */}
            <Box className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={handleSelectClick}
                disabled={isPending}
              >
                Selecionar Imagem
              </Button>

              {profile?.avatar && !previewUrl && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  disabled
                >
                  Remover Atual
                </Button>
              )}
            </Box>

            {/* Selected file info */}
            {selectedFile && (
              <Alert severity="info" className="w-full max-w-md">
                <Typography variant="body2">
                  <strong>Arquivo selecionado:</strong> {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
                </Typography>
              </Alert>
            )}

            {/* Feedback messages */}
            {feedback && (
              <Alert severity={feedback.type} className="w-full max-w-md">
                {feedback.message}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      <Box className="flex justify-end">
        <Button
          variant="contained"
          disabled={!selectedFile || isPending}
          startIcon={
            isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CloudUpload />
            )
          }
          onClick={handleUpload}
        >
          {isPending ? "Enviando..." : "Salvar Avatar"}
        </Button>
      </Box>
    </Box>
  );
};
