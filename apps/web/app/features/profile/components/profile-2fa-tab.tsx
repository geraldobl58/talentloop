"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from "@mui/material";
import {
  Security,
  QrCode2,
  CheckCircle,
  PhoneAndroid,
} from "@mui/icons-material";

export const Profile2FATab = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [verificationCode, setVerificationCode] = useState("");

  const steps = ["Baixar App", "Escanear QR Code", "Verificar Código"];

  const handleEnable2FA = () => {
    setActiveStep(1);
  };

  const handleVerifyCode = () => {
    // TODO: Implementar verificação do código
    if (verificationCode.length === 6) {
      setActiveStep(2);
      setIs2FAEnabled(true);
    }
  };

  const handleDisable2FA = () => {
    // TODO: Implementar desativação
    setIs2FAEnabled(false);
    setActiveStep(0);
    setVerificationCode("");
  };

  if (is2FAEnabled) {
    return (
      <Box className="space-y-6">
        <Card variant="outlined">
          <CardContent>
            <Box className="flex items-center gap-3 mb-4">
              <CheckCircle color="success" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6">
                  Autenticação de Dois Fatores Ativada
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sua conta está protegida com autenticação adicional
                </Typography>
              </Box>
            </Box>

            <Alert severity="success" className="mb-4">
              A autenticação de dois fatores está ativada para sua conta.
              Você precisará inserir um código do seu aplicativo autenticador
              toda vez que fizer login.
            </Alert>

            <Divider className="my-4" />

            <Box>
              <Typography variant="subtitle2" className="mb-2">
                Opções de Recuperação
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mb-4">
                Certifique-se de salvar seus códigos de recuperação em um local seguro.
                Você pode usá-los para acessar sua conta caso perca acesso ao seu
                aplicativo autenticador.
              </Typography>

              <Button variant="outlined" className="mr-2" disabled>
                Ver Códigos de Recuperação
              </Button>
              <Button variant="outlined" color="error" onClick={handleDisable2FA}>
                Desativar 2FA
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            <Security color="primary" />
            Autenticação de Dois Fatores (2FA)
          </Typography>

          <Alert severity="info" className="mb-4">
            <Typography variant="body2">
              Melhore significativamente a segurança da sua conta habilitando a
              autenticação em dois fatores. Ao ativar, você precisará inserir um
              código do seu aplicativo autenticador além da senha ao fazer login.
            </Typography>
          </Alert>

          {activeStep === 0 && (
            <Box className="text-center py-6">
              <Security sx={{ fontSize: 80, color: "grey.400" }} className="mb-4" />
              <Typography variant="h6" className="mb-2">
                Proteja sua conta
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mb-4">
                Adicione uma camada extra de segurança à sua conta usando
                um aplicativo autenticador.
              </Typography>
              <Button variant="contained" onClick={handleEnable2FA}>
                Ativar Autenticação de Dois Fatores
              </Button>
            </Box>
          )}

          {activeStep > 0 && (
            <>
              <Stepper activeStep={activeStep - 1} className="mb-6">
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {activeStep === 1 && (
                <Box className="space-y-4">
                  <Box className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <PhoneAndroid color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="subtitle1" className="font-semibold">
                        1. Baixe um aplicativo autenticador
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Recomendamos o Google Authenticator, Microsoft Authenticator
                        ou Authy. Esses aplicativos estão disponíveis gratuitamente
                        na App Store e Google Play.
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <QrCode2 color="primary" sx={{ fontSize: 40 }} />
                    <Box className="flex-1">
                      <Typography variant="subtitle1" className="font-semibold">
                        2. Escaneie o QR Code
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className="mb-4">
                        Use o aplicativo autenticador para escanear o código abaixo.
                      </Typography>
                      
                      {/* Placeholder para QR Code */}
                      <Box
                        className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto"
                      >
                        <Typography variant="body2" color="text.secondary">
                          QR Code será exibido aqui
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box className="p-4 bg-gray-50 rounded-lg">
                    <Typography variant="subtitle1" className="font-semibold mb-2">
                      3. Insira o código de verificação
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="mb-4">
                      Digite o código de 6 dígitos exibido no seu aplicativo autenticador.
                    </Typography>
                    
                    <Box className="flex gap-2 items-center">
                      <TextField
                        label="Código de Verificação"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        inputProps={{ maxLength: 6 }}
                        sx={{ maxWidth: 200 }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleVerifyCode}
                        disabled={verificationCode.length !== 6}
                      >
                        Verificar e Ativar
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
