import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const PaymentPending = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 8 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gradient-card border-border shadow-glow">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-warning" />
          </div>
          <CardTitle className="text-2xl text-foreground">Pago en Proceso</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme la transacción.
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate("/")} className="w-full">
              Volver al Inicio
            </Button>
            <p className="text-sm text-muted-foreground">
              Serás redirigido automáticamente en 8 segundos...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPending;