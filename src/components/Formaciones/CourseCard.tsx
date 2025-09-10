import { Calendar, Clock, Star, Users, Video, BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  category: string;
  price: string;
  image: string;
  nextSession: string;
  totalSessions: number;
  completedSessions: number;
  enrolled: boolean;
  rating: number;
  students: number;
}

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const nextSessionDate = new Date(course.nextSession);
  const progress = course.enrolled ? (course.completedSessions / course.totalSessions) * 100 : 0;

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Principiante":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Intermedio":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Avanzado":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <Card className="border-border hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="h-16 w-16 text-primary/40" />
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
        </div>
        {course.enrolled && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary">Inscrito</Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-foreground leading-tight">{course.title}</h3>
            <div className="flex items-center gap-1 ml-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{course.rating}</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`/placeholder.svg`} />
              <AvatarFallback className="text-xs">
                {course.instructor.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{course.instructor}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar (if enrolled) */}
        {course.enrolled && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="text-foreground">{course.completedSessions}/{course.totalSessions} sesiones</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Course Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{course.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{course.students} estudiantes</span>
          </div>
        </div>

        {/* Next Session */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Próxima sesión</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {nextSessionDate.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            {nextSessionDate.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-foreground">{course.price}</span>
          <Badge variant="outline" className="w-fit">{course.category}</Badge>
        </div>
        
        {course.enrolled ? (
          <Button variant="default" className="gap-2">
            <Video className="h-4 w-4" />
            Continuar
          </Button>
        ) : (
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Inscribirse
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}