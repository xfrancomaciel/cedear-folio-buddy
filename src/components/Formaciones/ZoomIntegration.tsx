import { useState, useEffect } from "react";
import { Video, ExternalLink, Calendar, Clock, Users, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ZoomSession {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  zoomLink: string;
  meetingId: string;
  passcode?: string;
  isLive: boolean;
  participants?: number;
}

interface ZoomIntegrationProps {
  session: ZoomSession;
  showControls?: boolean;
}

export function ZoomIntegration({ session, showControls = false }: ZoomIntegrationProps) {
  const [timeUntilSession, setTimeUntilSession] = useState<string>("");
  const [isJoining, setIsJoining] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const sessionStart = new Date(session.startTime);
      const diffInMs = sessionStart.getTime() - now.getTime();

      if (diffInMs > 0) {
        const hours = Math.floor(diffInMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeUntilSession(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeUntilSession(`${minutes}m ${seconds}s`);
        } else {
          setTimeUntilSession(`${seconds}s`);
        }
      } else {
        setTimeUntilSession("");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [session.startTime]);

  const handleJoinSession = async () => {
    setIsJoining(true);
    
    try {
      // Open Zoom link in new window
      window.open(session.zoomLink, '_blank', 'width=1200,height=800');
      
      // Simulate joining delay
      setTimeout(() => {
        setIsJoining(false);
      }, 2000);
    } catch (error) {
      console.error('Error joining session:', error);
      setIsJoining(false);
    }
  };

  const copyMeetingInfo = () => {
    const meetingInfo = `
Reunión: ${session.title}
ID de reunión: ${session.meetingId}
${session.passcode ? `Código de acceso: ${session.passcode}` : ''}
Enlace: ${session.zoomLink}
    `.trim();

    navigator.clipboard.writeText(meetingInfo);
  };

  const sessionStart = new Date(session.startTime);
  const now = new Date();
  const isSessionSoon = (sessionStart.getTime() - now.getTime()) <= 15 * 60 * 1000; // 15 minutes
  const isSessionActive = session.isLive || (now >= sessionStart && now <= new Date(sessionStart.getTime() + session.duration * 60 * 1000));

  return (
    <Card className={`border-border ${isSessionActive ? 'border-green-500' : isSessionSoon ? 'border-yellow-500' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {session.title}
          </CardTitle>
          {isSessionActive && (
            <Badge variant="destructive" className="animate-pulse">
              EN VIVO
            </Badge>
          )}
          {isSessionSoon && !isSessionActive && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Próximamente
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {sessionStart.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {sessionStart.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} ({session.duration} min)
            </span>
          </div>
        </div>

        {/* Live Participants Count */}
        {isSessionActive && session.participants !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-foreground">{session.participants} participantes conectados</span>
          </div>
        )}

        {/* Countdown */}
        {timeUntilSession && !isSessionActive && (
          <Alert className={isSessionSoon ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30" : ""}>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              La sesión comenzará en: <strong>{timeUntilSession}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Meeting Details */}
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Detalles de la reunión</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong>ID:</strong> {session.meetingId}</p>
            {session.passcode && <p><strong>Código:</strong> {session.passcode}</p>}
          </div>
        </div>

        {/* Audio Controls (if enabled) */}
        {showControls && (
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            <span className="text-sm text-muted-foreground">Audio:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMicEnabled(!micEnabled)}
              className={micEnabled ? "text-green-600" : "text-red-600"}
            >
              {micEnabled ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleJoinSession}
            disabled={isJoining}
            className={`flex-1 gap-2 ${
              isSessionActive 
                ? 'bg-green-600 hover:bg-green-700' 
                : ''
            }`}
            variant={isSessionActive ? "default" : "outline"}
          >
            <Video className="h-4 w-4" />
            {isJoining ? "Conectando..." : isSessionActive ? "Unirse Ahora" : "Abrir Zoom"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={copyMeetingInfo}
            className="gap-1"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Session Status Message */}
        {isSessionActive && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
            <Video className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              La sesión está en curso. Únete cuando estés listo.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}