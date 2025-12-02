import { Box, Button, CircularProgress } from "@mui/material";

interface FormFooterProps {
  isLoading: boolean;
}

export const FormFooter = ({ isLoading }: FormFooterProps) => (
  <>
    {/* Submit Button */}
    <Box sx={{ mt: 3 }}>
      <Button
        fullWidth
        type="submit"
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ py: 1.5 }}
      >
        {isLoading ? (
          <Box className="flex items-center gap-2">
            <CircularProgress color="inherit" size={20} />
            Criando conta...
          </Box>
        ) : (
          "Criar Conta"
        )}
      </Button>
    </Box>
  </>
);
