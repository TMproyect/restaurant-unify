
// Definición de tipos para los productos del menú
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  popular?: boolean;
  allergens?: string[];
  options?: {
    name: string;
    choices: {
      id: string;
      name: string;
      price: number;
    }[];
  }[];
}

// Categorías de menú
export const menuCategories = [
  { id: "entradas", name: "Entradas" },
  { id: "principal", name: "Platos Principales" },
  { id: "pastas", name: "Pastas" },
  { id: "carnes", name: "Carnes" },
  { id: "pescados", name: "Pescados y Mariscos" },
  { id: "ensaladas", name: "Ensaladas" },
  { id: "postres", name: "Postres" },
  { id: "bebidas", name: "Bebidas" },
];

// Datos de ejemplo para el menú
export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Ensalada César",
    description: "Lechuga romana fresca, crutones, queso parmesano y aderezo César casero",
    price: 8.50,
    category: "ensaladas",
    available: true,
    popular: true,
    allergens: ["lácteos", "gluten"],
  },
  {
    id: "2",
    name: "Pasta Alfredo",
    description: "Fettuccine con salsa cremosa de queso parmesano",
    price: 12.90,
    category: "pastas",
    available: true,
    allergens: ["lácteos", "gluten"],
    options: [
      {
        name: "Proteína adicional",
        choices: [
          { id: "p1", name: "Pollo", price: 3.00 },
          { id: "p2", name: "Camarones", price: 4.50 },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Hamburguesa Clásica",
    description: "Carne de res, lechuga, tomate, cebolla y queso cheddar",
    price: 10.50,
    category: "principal",
    available: true,
    popular: true,
    allergens: ["lácteos", "gluten"],
    options: [
      {
        name: "Término",
        choices: [
          { id: "t1", name: "Medio", price: 0 },
          { id: "t2", name: "Tres cuartos", price: 0 },
          { id: "t3", name: "Bien cocido", price: 0 },
        ],
      },
      {
        name: "Acompañamiento",
        choices: [
          { id: "a1", name: "Papas fritas", price: 0 },
          { id: "a2", name: "Ensalada", price: 1.50 },
          { id: "a3", name: "Aros de cebolla", price: 2.00 },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Lomo Saltado",
    description: "Tiras de lomo fino salteadas con cebolla, tomate y papas fritas",
    price: 15.90,
    category: "carnes",
    available: true,
    popular: true,
    allergens: ["soja"],
  },
  {
    id: "5",
    name: "Ceviche Mixto",
    description: "Pescado blanco y mariscos marinados en limón con cebolla morada y ají",
    price: 16.50,
    category: "pescados",
    available: true,
    popular: true,
    allergens: ["pescado", "mariscos"],
  },
  {
    id: "6",
    name: "Sopa de Tomate",
    description: "Sopa cremosa de tomate con crutones y albahaca",
    price: 7.50,
    category: "entradas",
    available: true,
    allergens: ["lácteos", "gluten"],
  },
  {
    id: "7",
    name: "Tiramisú",
    description: "Postre italiano con capas de bizcocho, café y crema de mascarpone",
    price: 6.90,
    category: "postres",
    available: true,
    allergens: ["lácteos", "gluten", "huevo"],
  },
  {
    id: "8",
    name: "Limonada Casera",
    description: "Limonada recién exprimida con hojas de menta",
    price: 4.50,
    category: "bebidas",
    available: true,
  },
  {
    id: "9",
    name: "Risotto de Hongos",
    description: "Arroz cremoso con variedad de hongos y queso parmesano",
    price: 14.90,
    category: "principal",
    available: true,
    allergens: ["lácteos"],
  },
  {
    id: "10",
    name: "Tacos de Pescado",
    description: "Tres tacos de pescado empanizado con salsa de chipotle y guacamole",
    price: 12.50,
    category: "principal",
    available: true,
    allergens: ["pescado", "gluten"],
  },
  {
    id: "11",
    name: "Vino Tinto",
    description: "Copa de vino tinto de la casa",
    price: 7.50,
    category: "bebidas",
    available: true,
  },
  {
    id: "12",
    name: "Lasaña de Carne",
    description: "Pasta en capas con salsa boloñesa, bechamel y queso gratinado",
    price: 13.90,
    category: "pastas",
    available: true,
    allergens: ["lácteos", "gluten"],
  },
];

// Métodos de pago disponibles
export const paymentMethods = [
  { id: "efectivo", name: "Efectivo" },
  { id: "tarjeta", name: "Tarjeta de Crédito/Débito" },
  { id: "movil", name: "Pago Móvil" },
  { id: "dividir", name: "Dividir la Cuenta" },
];
