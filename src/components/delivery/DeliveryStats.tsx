
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryOrder } from "@/services/delivery";

interface DeliveryStatsProps {
  deliveries: DeliveryOrder[];
}

const DeliveryStats = ({ deliveries }: DeliveryStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm">Entregas Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {deliveries.filter(d => d.status === 'pending' || d.status === 'preparing').length}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm">En Ruta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {deliveries.filter(d => d.status === 'en-route').length}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm">Entregados Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {deliveries.filter(d => d.status === 'delivered').length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryStats;
