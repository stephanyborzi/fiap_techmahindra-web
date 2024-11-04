import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function RaceDashboard({ showFinalDashboard, setShowFinalDashboard, raceData }) {
  return (
    <Dialog open={showFinalDashboard} onOpenChange={setShowFinalDashboard}>
      <DialogContent className="max-w-4xl  max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dashboard da Corrida</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultados Finais</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {raceData?.drivers.map((driver, index) => (
                  <div
                    key={driver.name}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <span>
                      {index + 1}. {driver.name}
                    </span>
                    <span>{driver.lapTime}</span>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Progressão do Tempo de Volta</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={raceData?.lapData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="lap" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {raceData?.drivers.map((driver, index) => (
                    <Line
                      key={driver.name}
                      type="monotone"
                      dataKey={`drivers.${index}.lapTime`}
                      name={driver.name}
                      stroke={`hsl(${(index * 360) / raceData.drivers.length}, 70%, 50%)`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Energia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={raceData?.drivers || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="energyManagement.energyUsed" fill="#8884d8" name="Energy Used" />
                  <Bar dataKey="energyManagement.regeneration" fill="#82ca9d" name="Energy Regenerated" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Análise de Ultrapassagens</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={raceData?.drivers || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="overtakingData.overtakes" fill="#8884d8" name="Overtakes" />
                  <Bar dataKey="overtakingData.defensiveActions" fill="#82ca9d" name="Defensive Actions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
