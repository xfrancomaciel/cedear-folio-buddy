import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="card-financial max-w-md w-full">
        <CardContent className="text-center py-12">
          <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-warning" />
          <h1 className="text-4xl font-bold mb-4 text-gradient">404</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Página no encontrada
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            La página que buscas no existe o fue movida.
          </p>
          <Button asChild className="gradient-primary">
            <a href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Volver al Portfolio
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
