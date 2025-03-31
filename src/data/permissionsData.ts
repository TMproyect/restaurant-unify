
import { Permission, UserRole } from "@/contexts/auth/types";

export const defaultPermissions: Permission[] = [
  // Dashboard permissions
  {
    id: "dashboard.access",
    name: "Acceder al Dashboard principal con métricas generales",
    description: "Visualizar ventas totales, mesas ocupadas, etc. Generalmente para Gerentes/Admins",
    category: "dashboard",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "dashboard.basic",
    name: "Acceder a funciones básicas del sistema",
    description: "Login, perfil propio y funcionalidades base",
    category: "dashboard",
    default: {
      admin: true,
      gerente: true,
      mesero: true,
      cocina: true,
      repartidor: true,
      propietario: true,
      manager: true,
      waiter: true,
      kitchen: true,
      delivery: true,
      owner: true
    }
  },
  
  // Orders permissions
  {
    id: "orders.create",
    name: "Crear nuevos pedidos desde el POS",
    description: "Los pedidos se crean vía POS en este flujo",
    category: "orders",
    default: {
      admin: true,
      gerente: true,
      mesero: true,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: true,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "orders.view",
    name: "Buscar y visualizar pedidos existentes",
    description: "Necesario para encontrar la cuenta del cliente",
    category: "orders",
    default: {
      admin: true,
      gerente: true,
      mesero: true,
      cocina: true,
      repartidor: true,
      propietario: true,
      manager: true,
      waiter: true,
      kitchen: true,
      delivery: true,
      owner: true
    }
  },
  {
    id: "orders.edit",
    name: "Modificar ítems o cantidades en pedidos abiertos",
    description: "Cambiar contenido de un pedido existente",
    category: "orders",
    default: {
      admin: true,
      gerente: true,
      mesero: true,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: true,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "orders.cancel",
    name: "Cancelar pedidos completos o ítems individuales",
    description: "Acción sensible, usualmente requiere permiso de Gerente",
    category: "orders",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  
  // Tables permissions
  {
    id: "tables.view",
    name: "Ver listado/mapa de mesas y su estado",
    description: "Libre, Ocupada, Pendiente de Pago. Útil para localizar rápidamente la orden del cliente",
    category: "tables",
    default: {
      admin: true,
      gerente: true,
      mesero: true,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: true,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "tables.manage",
    name: "Asignar, unir o liberar mesas",
    description: "Gestionar la asignación y estado de mesas",
    category: "tables",
    default: {
      admin: true,
      gerente: true,
      mesero: true,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: true,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  
  // Kitchen permissions
  {
    id: "kitchen.view",
    name: "Ver la pantalla de comandas de cocina",
    description: "Visualizar los pedidos que necesitan preparación",
    category: "kitchen",
    default: {
      admin: true,
      gerente: true,
      mesero: true,
      cocina: true,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: true,
      kitchen: true,
      delivery: false,
      owner: true
    }
  },
  {
    id: "kitchen.manage",
    name: "Marcar platos como listos para servir",
    description: "Actualizar el estado de los pedidos en preparación",
    category: "kitchen",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: true,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: true,
      delivery: false,
      owner: true
    }
  },
  
  // Cashier permissions
  {
    id: "cashier.access",
    name: "Acceder a la Interfaz de Caja",
    description: "Permiso fundamental para realizar cualquier acción de cobro",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.orders",
    name: "Buscar/Seleccionar órdenes pendientes de pago",
    description: "Buscar órdenes por Mesa, Código para proceder con el pago",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.details",
    name: "Ver el detalle completo de la cuenta",
    description: "Visualizar items, precios, impuestos y total",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: true,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: true,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.discounts.preset",
    name: "Aplicar descuentos predefinidos",
    description: "Descuentos como 'Empleado', 'Promoción Martes', ya configurados por un Admin",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.discounts.manual",
    name: "Aplicar descuentos manuales",
    description: "Aplicar descuentos porcentuales o de monto fijo no estándar",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.split",
    name: "Dividir la cuenta",
    description: "Dividir el pago equitativamente, por ítem, o por monto",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.void",
    name: "Anular ítems de una cuenta antes del cobro",
    description: "Corregir errores de último momento. Podría requerir permiso superior",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.payment",
    name: "Procesar pagos",
    description: "Efectivo, Tarjeta, Mixto, Otros métodos configurados",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.cash",
    name: "Registrar y calcular cambio para pagos en efectivo",
    description: "Manejar dinero en efectivo y cálculo de cambio",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.tip",
    name: "Añadir propinas",
    description: "Registrar propinas a través del POS",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.receipt",
    name: "Imprimir recibo/ticket de venta",
    description: "Generar tickets para el cliente",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.invoice",
    name: "Generar y/o imprimir Factura Fiscal",
    description: "Crear facturas legales si aplica",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.email",
    name: "Enviar recibo/factura por email",
    description: "Enviar documentos por correo electrónico",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.open",
    name: "Realizar Apertura de Turno de Caja",
    description: "Registrar fondo inicial del turno",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.close",
    name: "Realizar Cierre de Turno de Caja",
    description: "Conteo, cuadre y resumen del turno",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.movement",
    name: "Registrar Entradas/Salidas de Efectivo justificadas",
    description: "Registrar dinero que entra o sale de la caja fuera de las ventas, ej. pago a proveedor",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.report.own",
    name: "Ver Reporte del Propio Turno de Caja",
    description: "Visualizar resumen de ventas y movimientos realizados durante su sesión activa",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "cashier.report.all",
    name: "Ver reportes de caja de otros turnos o históricos",
    description: "Acceder a reportes de sesiones anteriores",
    category: "cashier",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  
  // Inventory permissions
  {
    id: "inventory.access",
    name: "Acceder a la gestión de inventario",
    description: "Manejar stock, recetas, y proveedores",
    category: "inventory",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: true,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: true,
      delivery: false,
      owner: true
    }
  },
  
  // Reports permissions
  {
    id: "reports.access",
    name: "Acceder a informes generales",
    description: "Ver reportes de ventas, productos, etc.",
    category: "reports",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  
  // Staff permissions
  {
    id: "staff.view",
    name: "Ver la lista de personal",
    description: "Visualizar el directorio de empleados",
    category: "staff",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "staff.manage",
    name: "Añadir, editar o eliminar usuarios",
    description: "Gestionar las cuentas de usuario del sistema",
    category: "staff",
    default: {
      admin: true,
      gerente: false,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: false,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "staff.roles",
    name: "Asignar roles a usuarios",
    description: "Cambiar el rol de un usuario existente",
    category: "staff",
    default: {
      admin: true,
      gerente: false,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: false,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  
  // Settings permissions
  {
    id: "settings.access",
    name: "Acceder a la configuración general del sistema",
    description: "Configurar impuestos, métodos de pago y otros ajustes",
    category: "settings",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "settings.menu",
    name: "Gestionar el Menú",
    description: "Configurar productos, categorías y precios",
    category: "settings",
    default: {
      admin: true,
      gerente: true,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: true,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  },
  {
    id: "settings.roles",
    name: "Acceder a la configuración de Roles y Permisos",
    description: "Este permiso permite editar esta misma pantalla. Solo para Admins",
    category: "settings",
    default: {
      admin: true,
      gerente: false,
      mesero: false,
      cocina: false,
      repartidor: false,
      propietario: true,
      manager: false,
      waiter: false,
      kitchen: false,
      delivery: false,
      owner: true
    }
  }
];

export const systemRoles: Record<UserRole, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  mesero: 'Mesero',
  cocina: 'Cocina',
  repartidor: 'Repartidor',
  propietario: 'Propietario',
  manager: 'Manager',
  waiter: 'Waiter',
  kitchen: 'Kitchen',
  delivery: 'Delivery',
  owner: 'Owner'
};

// Utility function to get default role permissions
export const getDefaultRolePermissions = (roleName: UserRole): Record<string, boolean> => {
  return defaultPermissions.reduce((acc, permission) => {
    acc[permission.id] = permission.default[roleName];
    return acc;
  }, {} as Record<string, boolean>);
};
