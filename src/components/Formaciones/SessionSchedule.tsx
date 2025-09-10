import { Calendar, Clock, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Session {
  id: number;
  courseId: number;
  title: string;
  course: string;
  date: string;
  duration: string;
  zoomLink: string;
}

interface SessionScheduleProps {
  sessions: Session[];
}

export function SessionSchedule({ sessions }: SessionScheduleProps) {
  const isSessionSoon = (sessionDate: string) => {
    const now = new Date();
    const session = new Date(sessionDate);
    const diffInMinutes = (session.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes <= 60 && diffInMinutes > 0;
  };

  const isSessionLive = (sessionDate: string) => {
    const now = new Date();
    const session = new Date(sessionDate);
    const diffInMinutes = (session.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes <= 0 && diffInMinutes > -120; // Live if within 2 hours of start
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No hay sesiones programadas próximamente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const sessionDate = new Date(session.date);
        const isSoon = isSessionSoon(session.date);
        const isLive = isSessionLive(session.date);

        return (
          <div 
            key={session.id} 
            className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
              isLive 
                ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
                : isSoon 
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${
                isLive 
                  ? 'bg-green-100 dark:bg-green-900/50' 
                  : isSoon 
                  ? 'bg-yellow-100 dark:bg-yellow-900/50'
                  : 'bg-primary/10'
              }`}>
                <Video className={`h-5 w-5 ${
                  isLive 
                    ? 'text-green-600 dark:text-green-400' 
                    : isSoon 
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-primary'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{session.title}</h4>
                  {isLive && (
                    <Badge variant="destructive" className="animate-pulse">
                      EN VIVO
                    </Badge>
                  )}
                  {isSoon && !isLive && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Próximamente
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{session.course}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {sessionDate.toLocaleDateString('es-ES', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {sessionDate.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  <span>•</span>
                  <span>{session.duration}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isLive ? (
                <Button 
                  variant="default" 
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => window.open(session.zoomLink, '_blank')}
                >
                  <Video className="h-4 w-4" />
                  Unirse Ahora
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => window.open(session.zoomLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Link Zoom
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}