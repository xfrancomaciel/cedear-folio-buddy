import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface Filters {
  level: string;
  category: string;
  enrolled: boolean;
}

interface CourseFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const levels = ["Principiante", "Intermedio", "Avanzado"];
const categories = ["Fundamentos", "Análisis", "Trading", "Estrategias", "Gestión de Riesgo"];

export function CourseFilters({ filters, onFiltersChange }: CourseFiltersProps) {
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== "" && value !== false
  ).length;

  const clearAllFilters = () => {
    onFiltersChange({
      level: "",
      category: "",
      enrolled: false
    });
  };

  const updateFilter = (key: keyof Filters, value: string | boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          <DropdownMenuLabel className="flex items-center justify-between">
            Filtros
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="h-auto p-1 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Level Filter */}
          <div className="p-2">
            <h4 className="font-medium text-sm mb-2">Nivel</h4>
            <div className="space-y-2">
              {levels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={level}
                    checked={filters.level === level}
                    onCheckedChange={(checked) => 
                      updateFilter("level", checked ? level : "")
                    }
                  />
                  <label 
                    htmlFor={level} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Category Filter */}
          <div className="p-2">
            <h4 className="font-medium text-sm mb-2">Categoría</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={filters.category === category}
                    onCheckedChange={(checked) => 
                      updateFilter("category", checked ? category : "")
                    }
                  />
                  <label 
                    htmlFor={category} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Enrolled Filter */}
          <div className="p-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enrolled"
                checked={filters.enrolled}
                onCheckedChange={(checked) => 
                  updateFilter("enrolled", checked as boolean)
                }
              />
              <label 
                htmlFor="enrolled" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Solo mis cursos
              </label>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.level && (
            <Badge variant="secondary" className="gap-1">
              Nivel: {filters.level}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => updateFilter("level", "")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              {filters.category}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => updateFilter("category", "")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.enrolled && (
            <Badge variant="secondary" className="gap-1">
              Mis cursos
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => updateFilter("enrolled", false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}