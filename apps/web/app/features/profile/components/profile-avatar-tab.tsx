"use client";

import { useCallback, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Alert,
} from "@mui/material";
import { CloudUpload, Delete } from "@mui/icons-material";
import { UserProfile } from "@/app/hooks/use-profile";
import { getCookie } from "cookies-next";
import { uploadAvatarAction } from "../actions/upload-avatar";

interface ProfileAvatarTabProps {
  profile: UserProfile | undefined;
}

export const ProfileAvatarTab = ({ profile }: ProfileAvatarTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);

  /**
   * Handle file selection and preview
   */
  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const acceptedFormats = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];

    if (!acceptedFormats.includes(file.type)) {
      setError("Formato deve ser PNG, JPG, GIF ou WebP");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Arquivo deve ser menor que 5MB");
      return;
    }

    // Clear previous errors and success
    setError(null);
    setSuccess(false);

    // Set selected file
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  /**
   * Handle file input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Handle upload button click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle avatar save
   */
  const handleSaveAvatar = async () => {
    if (!selectedFile) {
      setError("Selecione uma imagem primeiro");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get token from cookie
      const token = getCookie("access_token");
      if (!token) {
        setError("Token de autenticação não encontrado. Faça login novamente.");
        setIsLoading(false);
        return;
      }

      const result = await uploadAvatarAction(selectedFile, token as string);

      if (result.success) {
        setSuccess(true);
        setSelectedFile(null);
        setPreview(null);

        // Call refetch callback to update profile data
        if (onUploadSuccess) {
          await onUploadSuccess();
        }

        // Reset after 2 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.message || "Erro ao enviar avatar");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Erro ao enviar avatar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentAvatar = previewUrl || profile?.avatar;

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
                src={currentAvatar || undefined}
                sx={{ width: 150, height: 150, fontSize: 48 }}
              >
                {profile?.name?.charAt(0).toUpperCase()}
              </Avatar>

              {previewUrl && (
                <IconButton
                  size="small"
                  onClick={handleRemovePreview}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
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
                className="mb-2"
              >
                Formatos aceitos: JPG, PNG, GIF
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tamanho máximo: 5MB
              </Typography>
            </Box>

            {/* Upload Button */}
            <Box className="flex gap-2">
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
              >
                Selecionar Imagem
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileSelect}
                />
              </Button>

              {currentAvatar && !previewUrl && (
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

            {selectedFile && (
              <Alert severity="info" className="w-full max-w-md">
                Arquivo selecionado: {selectedFile.name}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      <Box className="flex justify-end">
        <Button
          variant="contained"
          disabled={!selectedFile}
          startIcon={<CloudUpload />}
        >
          Salvar Avatar
        </Button>
      </Box>
    </Box>
  );
};
