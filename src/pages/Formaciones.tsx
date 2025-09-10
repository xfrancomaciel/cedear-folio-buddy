import { useState } from "react";
import { Calendar, Clock, Users, Video, Search, Filter, BookOpen, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/Formaciones/CourseCard";
import { SessionSchedule } from "@/components/Formaciones/SessionSchedule";
import { CourseFilters } from "@/components/Formaciones/CourseFilters";

// Mock data - replace with actual data from your backend
const mockCourses = [
  {
    id: 1,
    title: "Análisis Fundamental de Acciones",
    description: "Aprende a evaluar empresas y tomar decisiones de inversión informadas",
    instructor: "Dr. Carlos Martínez",
    duration: "8 semanas",
    level: "Intermedio",
    category: "Análisis",
    price: "$299",
    image: "/placeholder.svg",
    nextSession: "2024-01-15T10:00:00",
    totalSessions: 16,
    completedSessions: 0,
    enrolled: false,
    rating: 4.8,
    students: 156
  },
  {
    id: 2,
    title: "Trading con Análisis Técnico",
    description: "Domina las herramientas y estrategias del análisis técnico",
    instructor: "María Rodriguez",
    duration: "6 semanas",
    level: "Avanzado",
    category: "Trading",
    price: "$399",
    image: "/placeholder.svg",
    nextSession: "2024-01-18T14:00:00",
    totalSessions: 12,
    completedSessions: 0,
    enrolled: true,
    rating: 4.9,
    students: 89
  },
  {
    id: 3,
    title: "Introducción a los Mercados Financieros",
    description: "Conceptos básicos para comenzar en el mundo de las inversiones",
    instructor: "Luis Fernández",
    duration: "4 semanas",
    level: "Principiante",
    category: "Fundamentos",
    price: "$199",
    image: "/placeholder.svg",
    nextSession: "2024-01-20T16:00:00",
    totalSessions: 8,
    completedSessions: 0,
    enrolled: false,
    rating: 4.7,
    students: 234
  }
];

const mockUpcomingSessions = [
  {
    id: 1,
    courseId: 2,
    title: "Patrones de Reversión",
    course: "Trading con Análisis Técnico",
    date: "2024-01-15T14:00:00",
    duration: "2 horas",
    zoomLink: "https://zoom.us/j/123456789"
  },
  {
    id: 2,
    courseId: 1,
    title: "Estados Financieros",
    course: "Análisis Fundamental de Acciones",
    date: "2024-01-16T10:00:00",
    duration: "1.5 horas",
    zoomLink: "https://zoom.us/j/987654321"
  }
];

export default function Formaciones() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    level: "",
    category: "",
    enrolled: false
  });

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !selectedFilters.level || course.level === selectedFilters.level;
    const matchesCategory = !selectedFilters.category || course.category === selectedFilters.category;
    const matchesEnrolled = !selectedFilters.enrolled || course.enrolled;
    
    return matchesSearch && matchesLevel && matchesCategory && matchesEnrolled;
  });

  const stats = [
    {
      title: "Cursos Activos",
      value: "12",
      icon: BookOpen,
      description: "Formaciones disponibles"
    },
    {
      title: "Próximas Sesiones",
      value: "5",
      icon: Calendar,
      description: "Esta semana"
    },
    {
      title: "Horas Completadas",
      value: "24",
      icon: Clock,
      description: "Total este mes"
    },
    {
      title: "Certificados",
      value: "3",
      icon: Award,
      description: "Obtenidos"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Formaciones</h1>
            <p className="text-muted-foreground">Desarrolla tus habilidades con nuestros cursos especializados</p>
          </div>
          <Button variant="default" className="gap-2">
            <Video className="h-4 w-4" />
            Próxima Sesión
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm font-medium text-foreground">{stat.title}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Sesiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SessionSchedule sessions={mockUpcomingSessions} />
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar formaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <CourseFilters filters={selectedFilters} onFiltersChange={setSelectedFilters} />
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No se encontraron formaciones</h3>
          <p className="text-muted-foreground">Prueba ajustando los filtros o términos de búsqueda</p>
        </div>
      )}
    </div>
  );
}