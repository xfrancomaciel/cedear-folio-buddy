import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, History, Beaker } from "lucide-react";
import type { StressScenario } from "@/types/optimizer";

interface StressTestTableProps {
  hypothetical: StressScenario[];
  historical: StressScenario[];
}

const ScenarioTable = ({ 
  scenarios, 
  title, 
  description 
}: { 
  scenarios: StressScenario[];
  title: string;
  description: string;
}) => {
  if (!scenarios || scenarios.length === 0) return null;

  // Get all scenario names from the first entry
  const scenarioNames = Object.keys(scenarios[0]?.scenarios || {});

  return (
    <Card className="card-financial">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Portfolio</TableHead>
                {scenarioNames.map(name => (
                  <TableHead key={name} className="text-right whitespace-nowrap">
                    {name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((row) => (
                <TableRow key={row.portfolio}>
                  <TableCell className="font-medium">{row.portfolio}</TableCell>
                  {scenarioNames.map(name => {
                    const value = row.scenarios[name];
                    const isPositive = value > 0;
                    return (
                      <TableCell key={name} className="text-right">
                        <span className={`font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}{value.toFixed(2)}%
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export const StressTestTable = ({ hypothetical, historical }: StressTestTableProps) => {
  return (
    <div className="space-y-6">
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Stress Testing
          </CardTitle>
          <CardDescription>
            Impacto estimado en el portfolio bajo diferentes escenarios de mercado (basado en Beta vs SPY)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hypothetical" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hypothetical" className="flex items-center gap-2">
                <Beaker className="h-4 w-4" />
                Escenarios Hipotéticos
              </TabsTrigger>
              <TabsTrigger value="historical" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Escenarios Históricos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hypothetical" className="mt-4">
              <ScenarioTable 
                scenarios={hypothetical}
                title="Escenarios Hipotéticos"
                description="Impacto estimado si SPY cayera un porcentaje determinado"
              />
            </TabsContent>
            
            <TabsContent value="historical" className="mt-4">
              <ScenarioTable 
                scenarios={historical}
                title="Escenarios Históricos"
                description="Impacto estimado basado en eventos de mercado pasados"
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Metodología</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• El impacto se calcula como: <code className="bg-muted px-1 rounded">Beta × Shock del SPY</code></li>
              <li>• Un Beta &gt; 1 implica mayor sensibilidad a los movimientos del mercado.</li>
              <li>• Un Beta &lt; 1 implica menor sensibilidad (portfolio más defensivo).</li>
              <li>• Estos son estimados basados en datos históricos y pueden no reflejar comportamiento futuro.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
