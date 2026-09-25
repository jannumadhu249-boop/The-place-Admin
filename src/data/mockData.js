// Realistic Mock Data for Food Delivery Admin Dashboard

export const initialOrders = [
  {
    id: "ORD-9821",
    customer: { name: "Sophia Reynolds", phone: "+1 (555) 234-8901", address: "742 Evergreen Terr, Springfield" },
    restaurant: "L'Amour Bistro",
    items: [
      { name: "Truffle Tagliatelle", qty: 2, price: 24.50 },
      { name: "Burrata Caprese", qty: 1, price: 16.00 },
      { name: "Sparkling San Pellegrino", qty: 2, price: 5.50 }
    ],
    subtotal: 76.00,
    deliveryFee: 4.50,
    discount: 10.00,
    total: 70.50,
    paymentMethod: "Credit Card (Stripe)",
    paymentStatus: "Paid",
    status: "pending",
    category: "pending",
    orderType: "Delivery",
    createdAt: "10 mins ago",
    scheduledTime: null,
    deliveryPartner: null,
    specialInstructions: "Please ring the side doorbell. Contactless delivery preferred."
  },
  {
    id: "ORD-9820",
    customer: { name: "Marcus Sterling", phone: "+1 (555) 871-3320", address: "1280 Park Avenue, Apt 4B" },
    restaurant: "Spice Dynasty",
    items: [
      { name: "Butter Chicken Supreme", qty: 2, price: 19.00 },
      { name: "Garlic Butter Naan", qty: 4, price: 4.00 },
      { name: "Mango Lassi", qty: 2, price: 5.00 }
    ],
    subtotal: 64.00,
    deliveryFee: 3.50,
    discount: 0,
    total: 67.50,
    paymentMethod: "Apple Pay",
    paymentStatus: "Paid",
    status: "accepted",
    category: "accepted",
    orderType: "Delivery",
    createdAt: "22 mins ago",
    scheduledTime: null,
    deliveryPartner: { name: "David Chen", phone: "+1 555-443-1289", rating: 4.9 },
    specialInstructions: "Extra spicy on the chicken please."
  },
  {
    id: "ORD-9819",
    customer: { name: "Elena Rostova", phone: "+1 (555) 609-1244", address: "91 Wall Street, Floor 18" },
    restaurant: "Saffron & Wood Grill",
    items: [
      { name: "Dry-Aged Ribeye 12oz", qty: 1, price: 46.00 },
      { name: "Roasted Asparagus", qty: 1, price: 12.00 },
      { name: "Château Red Wine", qty: 1, price: 38.00 }
    ],
    subtotal: 96.00,
    deliveryFee: 5.00,
    discount: 15.00,
    total: 86.00,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    status: "processing",
    category: "processing",
    orderType: "Delivery",
    createdAt: "35 mins ago",
    scheduledTime: null,
    deliveryPartner: { name: "Carlos Morales", phone: "+1 555-789-0112", rating: 4.8 },
    specialInstructions: "Medium rare steak."
  },
  {
    id: "ORD-9818",
    customer: { name: "Jonathan Ward", phone: "+1 (555) 431-7782", address: "450 Lexington Ave, Suite 12" },
    restaurant: "Kyoto Artisan Sushi",
    items: [
      { name: "Omakase Nigiri Set (12 pcs)", qty: 2, price: 52.00 },
      { name: "Salmon Sashimi", qty: 1, price: 18.00 },
      { name: "Miso Soup Deluxe", qty: 2, price: 4.50 }
    ],
    subtotal: 130.50,
    deliveryFee: 6.00,
    discount: 20.00,
    total: 116.50,
    paymentMethod: "PayPal",
    paymentStatus: "Paid",
    status: "Food on the way",
    category: "Food on the way",
    orderType: "Delivery",
    createdAt: "48 mins ago",
    scheduledTime: null,
    deliveryPartner: { name: "Liam O'Connor", phone: "+1 555-321-9988", rating: 4.95 },
    specialInstructions: "Please call when 2 mins away."
  },
  {
    id: "ORD-9817",
    customer: { name: "Chloe Dupont", phone: "+1 (555) 992-4411", address: "220 Central Park South" },
    restaurant: "L'Amour Bistro",
    items: [
      { name: "Duck Confit", qty: 1, price: 32.00 },
      { name: "Crème Brûlée", qty: 2, price: 11.00 }
    ],
    subtotal: 54.00,
    deliveryFee: 4.00,
    discount: 5.00,
    total: 53.00,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    status: "Delivered",
    category: "Delivered",
    orderType: "Delivery",
    createdAt: "1 hr 15 mins ago",
    scheduledTime: null,
    deliveryPartner: { name: "David Chen", phone: "+1 555-443-1289", rating: 4.9 },
    specialInstructions: "Delivered directly to reception."
  },
  {
    id: "ORD-9816",
    customer: { name: "Alexander Vance", phone: "+1 (555) 782-9011", address: "310 Hudson Street, Penthouse" },
    restaurant: "Firenze Woodfired Pizza",
    items: [
      { name: "Prosciutto & Arugula Pizza", qty: 2, price: 21.00 },
      { name: "Classic Tiramisu", qty: 2, price: 9.50 }
    ],
    subtotal: 61.00,
    deliveryFee: 4.50,
    discount: 0,
    total: 65.50,
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    status: "Scheduled",
    category: "Scheduled",
    orderType: "Delivery",
    createdAt: "Yesterday",
    scheduledTime: "Today at 7:30 PM",
    deliveryPartner: null,
    specialInstructions: "Delivery for anniversary celebration."
  },
  {
    id: "ORD-9815",
    customer: { name: "Brian Kelly", phone: "+1 (555) 345-6678", address: "Table #08 (L'Amour Bistro)" },
    restaurant: "L'Amour Bistro",
    items: [
      { name: "Pan-Seared Sea Bass", qty: 2, price: 34.00 },
      { name: "Vintage Pinot Noir Glass", qty: 2, price: 14.00 }
    ],
    subtotal: 96.00,
    deliveryFee: 0,
    discount: 9.60,
    total: 86.40,
    paymentMethod: "Dine-in POS Terminal",
    paymentStatus: "Paid",
    status: "Dine in",
    category: "Dine in",
    orderType: "Dine In",
    createdAt: "40 mins ago",
    scheduledTime: null,
    deliveryPartner: null,
    specialInstructions: "Indoor Table #08 - Table reserved under Brian"
  },
  {
    id: "ORD-9814",
    customer: { name: "Grace Montgomery", phone: "+1 (555) 123-9900", address: "55 Water St, Brooklyn" },
    restaurant: "Green Gourmet Vegan Cafe",
    items: [
      { name: "Avocado Super Bowl", qty: 2, price: 15.50 },
      { name: "Cold-Pressed Detox Juice", qty: 2, price: 8.00 }
    ],
    subtotal: 47.00,
    deliveryFee: 3.50,
    discount: 5.00,
    total: 45.50,
    paymentMethod: "Cash On Delivery",
    paymentStatus: "Unpaid (Collect Cash)",
    status: "Offline Payments",
    category: "Offline Payments",
    orderType: "Delivery",
    createdAt: "15 mins ago",
    scheduledTime: null,
    deliveryPartner: { name: "Kenji Sato", phone: "+1 555-665-2211", rating: 4.88 },
    specialInstructions: "Customer has exact cash ($45.50)."
  },
  {
    id: "ORD-9813",
    customer: { name: "Richard Hall", phone: "+1 (555) 888-2341", address: "19 East 64th Street" },
    restaurant: "Spice Dynasty",
    items: [
      { name: "Lamb Rogan Josh", qty: 1, price: 22.00 },
      { name: "Basmati Pilaf", qty: 1, price: 6.00 }
    ],
    subtotal: 28.00,
    deliveryFee: 3.50,
    discount: 0,
    total: 31.50,
    paymentMethod: "Credit Card (Failed)",
    paymentStatus: "Declined",
    status: "Payment Failed",
    category: "Payment Failed",
    orderType: "Delivery",
    createdAt: "2 hrs ago",
    scheduledTime: null,
    deliveryPartner: null,
    specialInstructions: "Bank 3D-Secure authentication timed out."
  },
  {
    id: "ORD-9812",
    customer: { name: "Samantha Cole", phone: "+1 (555) 543-1188", address: "800 5th Avenue" },
    restaurant: "Firenze Woodfired Pizza",
    items: [
      { name: "Quattro Formaggi Pizza", qty: 1, price: 23.00 },
      { name: "Insalata Mista", qty: 1, price: 11.00 }
    ],
    subtotal: 34.00,
    deliveryFee: 4.00,
    discount: 0,
    total: 38.00,
    paymentMethod: "Credit Card",
    paymentStatus: "Refunded via Stripe",
    status: "Refunded",
    category: "Refunded",
    orderType: "Delivery",
    createdAt: "3 hrs ago",
    scheduledTime: null,
    deliveryPartner: null,
    specialInstructions: "Refund granted: Restaurant was unable to prepare gluten-free crust."
  },
  {
    id: "ORD-9811",
    customer: { name: "Daniel Craig", phone: "+1 (555) 777-0099", address: "330 Riverside Drive" },
    restaurant: "Kyoto Artisan Sushi",
    items: [
      { name: "Dragon Roll Deluxe", qty: 2, price: 22.00 },
      { name: "Spicy Tuna Roll", qty: 2, price: 14.00 }
    ],
    subtotal: 72.00,
    deliveryFee: 5.00,
    discount: 0,
    total: 77.00,
    paymentMethod: "Apple Pay",
    paymentStatus: "Cancelled",
    status: "Canceled",
    category: "Canceled",
    orderType: "Delivery",
    createdAt: "4 hrs ago",
    scheduledTime: null,
    deliveryPartner: null,
    specialInstructions: "Customer cancelled within 2 minutes of placement."
  }
];

export const restaurantsData = [
  {
    id: "REST-001",
    name: "L'Amour Bistro & Lounge",
    cuisine: "French Fine Dining, Continental",
    rating: 4.9,
    reviews: 1420,
    address: "450 Grand Avenue, Downtown",
    phone: "+1 (555) 234-9988",
    email: "contact@lamourbistro.com",
    commissionRate: 15, // percent
    totalOrders: 3840,
    totalEarnings: "$84,290.00",
    status: "Active",
    isOpen: true,
    zone: "Zone 1 - Downtown Core",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "REST-002",
    name: "Kyoto Artisan Sushi",
    cuisine: "Japanese, Sushi, Omakase",
    rating: 4.8,
    reviews: 980,
    address: "88 Mercer St, SoHo",
    phone: "+1 (555) 456-7890",
    email: "orders@kyotoartisansushi.com",
    commissionRate: 18,
    totalOrders: 2710,
    totalEarnings: "$92,400.00",
    status: "Active",
    isOpen: true,
    zone: "Zone 2 - West District",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "REST-003",
    name: "Firenze Woodfired Pizza",
    cuisine: "Italian, Neapolitan Pizza",
    rating: 4.7,
    reviews: 2150,
    address: "120 Bleecker St, Greenwich",
    phone: "+1 (555) 890-1234",
    email: "manager@firenzepizza.com",
    commissionRate: 14,
    totalOrders: 5410,
    totalEarnings: "$112,650.00",
    status: "Active",
    isOpen: true,
    zone: "Zone 2 - West District",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "REST-004",
    name: "Spice Dynasty Indian Cuisine",
    cuisine: "North Indian, Tandoor, Mughlai",
    rating: 4.6,
    reviews: 1120,
    address: "340 Lexington Ave, Midtown",
    phone: "+1 (555) 678-9012",
    email: "info@spicedynasty.com",
    commissionRate: 15,
    totalOrders: 3190,
    totalEarnings: "$68,900.00",
    status: "Active",
    isOpen: false,
    zone: "Zone 3 - Midtown Central",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "REST-005",
    name: "Green Gourmet Vegan Cafe",
    cuisine: "Organic, Vegan, Healthy Bowls",
    rating: 4.9,
    reviews: 650,
    address: "15 North 6th St, Williamsburg",
    phone: "+1 (555) 345-6789",
    email: "hello@greengourmet.com",
    commissionRate: 12,
    totalOrders: 1820,
    totalEarnings: "$41,200.00",
    status: "Pending Approval",
    isOpen: false,
    zone: "Zone 4 - Brooklyn North",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80"
  }
];

export const foodItemsData = [
  {
    id: "FOOD-101",
    name: "Truffle Tagliatelle with Wild Mushrooms",
    category: "Main Course",
    restaurant: "L'Amour Bistro & Lounge",
    price: 24.50,
    discountPrice: 21.00,
    rating: 4.9,
    isVeg: true,
    inStock: true,
    salesCount: 840,
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281014?w=500&auto=format&fit=crop&q=80",
    description: "Handcrafted tagliatelle tossed in authentic black truffle emulsion, forest mushrooms, and aged Parmigiano Reggiano."
  },
  {
    id: "FOOD-102",
    name: "Dry-Aged Ribeye 12oz Prime",
    category: "Steaks & Grills",
    restaurant: "Saffron & Wood Grill",
    price: 46.00,
    discountPrice: null,
    rating: 4.95,
    isVeg: false,
    inStock: true,
    salesCount: 620,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
    description: "45-day dry aged USDA Prime ribeye with roasted bone marrow butter and herb-infused sea salt."
  },
  {
    id: "FOOD-103",
    name: "Omakase Nigiri Set (12 pcs)",
    category: "Sushi & Sashimi",
    restaurant: "Kyoto Artisan Sushi",
    price: 52.00,
    discountPrice: 48.00,
    rating: 5.0,
    isVeg: false,
    inStock: true,
    salesCount: 1120,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80",
    description: "Chef's selection of fresh seasonal fish direct from Toyosu Market, brushed with nikiri shoyu."
  },
  {
    id: "FOOD-104",
    name: "Burrata Pugliese Caprese",
    category: "Appetizers",
    restaurant: "L'Amour Bistro & Lounge",
    price: 16.00,
    discountPrice: null,
    rating: 4.8,
    isVeg: true,
    inStock: true,
    salesCount: 530,
    image: "https://images.unsplash.com/photo-1592417817098-8f3d69106a2e?w=500&auto=format&fit=crop&q=80",
    description: "Fresh Puglia burrata, heirloom cherry tomatoes, cold-pressed Ligurian olive oil, balsamic glaze."
  },
  {
    id: "FOOD-105",
    name: "Prosciutto & Wild Arugula Pizza",
    category: "Woodfired Pizza",
    restaurant: "Firenze Woodfired Pizza",
    price: 21.00,
    discountPrice: 18.50,
    rating: 4.85,
    isVeg: false,
    inStock: true,
    salesCount: 1480,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80",
    description: "San Marzano D.O.P. tomatoes, buffalo mozzarella, 24-month aged Parma prosciutto, shaved grana."
  },
  {
    id: "FOOD-106",
    name: "Matcha Crepe Cake with Gold Leaf",
    category: "Desserts",
    restaurant: "Kyoto Artisan Sushi",
    price: 12.50,
    discountPrice: null,
    rating: 4.75,
    isVeg: true,
    inStock: false,
    salesCount: 410,
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=80",
    description: "Twenty delicate paper-thin green tea crepes layered with organic Uji matcha chantilly cream."
  }
];

export const couponsData = [
  {
    id: "CPN-01",
    code: "ROYALFEAST25",
    title: "25% Off Luxury Dining",
    discountType: "Percentage",
    discountValue: "25%",
    minOrder: "$50.00",
    maxDiscount: "$20.00",
    usageLimit: 500,
    usedCount: 382,
    validUntil: "2026-10-31",
    status: "Active"
  },
  {
    id: "CPN-02",
    code: "FIRSTBITE10",
    title: "Welcome New Customer $10 Voucher",
    discountType: "Fixed Amount",
    discountValue: "$10.00",
    minOrder: "$30.00",
    maxDiscount: "$10.00",
    usageLimit: 2000,
    usedCount: 1420,
    validUntil: "2026-12-31",
    status: "Active"
  },
  {
    id: "CPN-03",
    code: "WEEKENDVIP",
    title: "Free Delivery on Orders over $40",
    discountType: "Free Delivery",
    discountValue: "100% Free Deliv.",
    minOrder: "$40.00",
    maxDiscount: "$7.50",
    usageLimit: 1000,
    usedCount: 994,
    validUntil: "2026-09-30",
    status: "Expiring Soon"
  },
  {
    id: "CPN-04",
    code: "SUMMERCHEF",
    title: "Seasonal Summer 15% Savings",
    discountType: "Percentage",
    discountValue: "15%",
    minOrder: "$25.00",
    maxDiscount: "$12.00",
    usageLimit: 800,
    usedCount: 800,
    validUntil: "2026-08-31",
    status: "Expired"
  }
];

export const bannersData = [
  {
    id: "BNR-01",
    title: "Michelin Guide Selection - Exclusive Home Delivery",
    category: "Featured Banner",
    zone: "All Zones",
    redirectUrl: "/restaurants/featured",
    status: "Active",
    startDate: "2026-09-01",
    endDate: "2026-10-15",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80"
  },
  {
    id: "BNR-02",
    title: "Weekend Italian Festa - 20% Off Woodfired Pizza",
    category: "Promotional Banner",
    zone: "Zone 1 & Zone 2",
    redirectUrl: "/food?category=pizza",
    status: "Active",
    startDate: "2026-09-15",
    endDate: "2026-09-28",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=80"
  },
  {
    id: "BNR-03",
    title: "Healthy Bowls & Smoothies - Free Delivery All Week",
    category: "Category Banner",
    zone: "Zone 4 - Brooklyn",
    redirectUrl: "/restaurants?category=healthy",
    status: "Paused",
    startDate: "2026-09-10",
    endDate: "2026-09-25",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80"
  }
];

export const pushNotificationsData = [
  {
    id: "PUSH-101",
    title: "Dinner is Served! 🍷 20% Off Fine Dining Tonight",
    message: "Treat yourself to an extraordinary culinary dinner from top city bistros. Use code DINNER20 at checkout.",
    target: "All Customers",
    zone: "All Zones",
    sentAt: "Today, 6:00 PM",
    deliveredCount: "24,850",
    openRate: "34.2%",
    status: "Sent"
  },
  {
    id: "PUSH-102",
    title: "Rain Surge Alert: High delivery bonuses active ⚡",
    message: "Heavy rain detected in Midtown & Downtown. Earn an extra $4.50 per completed order for the next 2 hours!",
    target: "Delivery Fleet Drivers",
    zone: "Midtown & Downtown",
    sentAt: "Today, 2:15 PM",
    deliveredCount: "420",
    openRate: "89.5%",
    status: "Sent"
  },
  {
    id: "PUSH-103",
    title: "New Gourmet Brunch Specials are Here 🥞",
    message: "Discover weekend brunch menus featuring artisan coffee, French toasts, and savory bowls.",
    target: "VIP Members",
    zone: "Zone 1 - Downtown Core",
    sentAt: "Scheduled: Saturday 9:00 AM",
    deliveredCount: "-",
    openRate: "-",
    status: "Scheduled"
  }
];

export const disbursementData = [
  {
    id: "DISB-701",
    recipient: "L'Amour Bistro & Lounge",
    type: "Restaurant",
    accountNumber: "US****8821 (Chase Bank)",
    amount: "$4,820.50",
    period: "Sep 07 - Sep 14, 2026",
    requestedAt: "Sep 15, 2026",
    status: "Completed",
    txRef: "TXN-998812301"
  },
  {
    id: "DISB-702",
    recipient: "David Chen (Driver #402)",
    type: "Delivery Partner",
    accountNumber: "US****3310 (Wells Fargo)",
    amount: "$685.20",
    period: "Sep 10 - Sep 17, 2026",
    requestedAt: "Sep 18, 2026",
    status: "Pending Approval",
    txRef: "TXN-998812302"
  },
  {
    id: "DISB-703",
    recipient: "Kyoto Artisan Sushi",
    type: "Restaurant",
    accountNumber: "US****9944 (Citibank)",
    amount: "$6,140.00",
    period: "Sep 07 - Sep 14, 2026",
    requestedAt: "Sep 16, 2026",
    status: "Processing",
    txRef: "TXN-998812303"
  },
  {
    id: "DISB-704",
    recipient: "Carlos Morales (Driver #219)",
    type: "Delivery Partner",
    accountNumber: "US****1104 (Bank of America)",
    amount: "$540.00",
    period: "Sep 10 - Sep 17, 2026",
    requestedAt: "Sep 18, 2026",
    status: "Completed",
    txRef: "TXN-998812304"
  },
  {
    id: "DISB-705",
    recipient: "Firenze Woodfired Pizza",
    type: "Restaurant",
    accountNumber: "US****7721 (PNC Bank)",
    amount: "$5,290.75",
    period: "Sep 07 - Sep 14, 2026",
    requestedAt: "Sep 17, 2026",
    status: "Pending Approval",
    txRef: "TXN-998812305"
  }
];

export const deliveryFleetData = [
  {
    id: "DRV-101",
    name: "David Chen",
    phone: "+1 (555) 443-1289",
    vehicle: "Honda Scooter (Electric)",
    plateNo: "NY-8821-E",
    rating: 4.9,
    status: "On Delivery",
    currentOrder: "ORD-9820",
    completedOrders: 1420,
    earningsToday: "$114.50",
    batteryOrFuel: "84%",
    zone: "Zone 1 - Downtown Core"
  },
  {
    id: "DRV-102",
    name: "Carlos Morales",
    phone: "+1 (555) 789-0112",
    vehicle: "Toyota Prius",
    plateNo: "NY-4419-P",
    rating: 4.85,
    status: "On Delivery",
    currentOrder: "ORD-9819",
    completedOrders: 980,
    earningsToday: "$88.00",
    batteryOrFuel: "65%",
    zone: "Zone 2 - West District"
  },
  {
    id: "DRV-103",
    name: "Liam O'Connor",
    phone: "+1 (555) 321-9988",
    vehicle: "Yamaha NMAX",
    plateNo: "NY-9021-M",
    rating: 4.95,
    status: "On Delivery",
    currentOrder: "ORD-9818",
    completedOrders: 2310,
    earningsToday: "$142.00",
    batteryOrFuel: "92%",
    zone: "Zone 3 - Midtown Central"
  },
  {
    id: "DRV-104",
    name: "Kenji Sato",
    phone: "+1 (555) 665-2211",
    vehicle: "Specialized E-Bike",
    plateNo: "BIKE-204",
    rating: 4.88,
    status: "Available",
    currentOrder: null,
    completedOrders: 750,
    earningsToday: "$54.00",
    batteryOrFuel: "78%",
    zone: "Zone 4 - Brooklyn North"
  },
  {
    id: "DRV-105",
    name: "Marcus Aurelius",
    phone: "+1 (555) 912-3344",
    vehicle: "Vespa Primavera",
    plateNo: "NY-3180-V",
    rating: 4.79,
    status: "Offline",
    currentOrder: null,
    completedOrders: 1840,
    earningsToday: "$0.00",
    batteryOrFuel: "100%",
    zone: "Zone 1 - Downtown Core"
  }
];

export const employeeRolesData = [
  {
    id: "ROLE-01",
    title: "Super Administrator",
    description: "Full master privilege across all restaurant modules, finances, staff and system settings.",
    assignedEmployees: 2,
    permissions: ["All Operations", "Manage Finances & Disbursements", "Employee & RBAC Control", "Restaurant Approval", "System Configuration"]
  },
  {
    id: "ROLE-02",
    title: "Operations & Order Manager",
    description: "Oversees live order workflows, delivery fleet dispatching, order status overrides and cancellations.",
    assignedEmployees: 6,
    permissions: ["View Orders", "Manage Live Dispatch", "Customer Refund Approval", "Assign Delivery Fleet"]
  },
  {
    id: "ROLE-03",
    title: "Financial Controller & Auditor",
    description: "Handles restaurant disbursements, merchant commissions, accounting ledgers, and revenue reports.",
    assignedEmployees: 3,
    permissions: ["Approve Disbursements", "View Financial Reports", "Tax & Commission Settings", "Export Ledgers"]
  },
  {
    id: "ROLE-04",
    title: "Catalog & Menu Specialist",
    description: "Audits restaurant food menus, photos, dietary tags, promotional banners, and campaign coupons.",
    assignedEmployees: 4,
    permissions: ["Manage Food Catalog", "Review Restaurant Profiles", "Create Coupons & Banners", "Push Notifications"]
  },
  {
    id: "ROLE-05",
    title: "Customer Support Representative",
    description: "First line of customer & vendor dispute resolution, ticket tracking, and driver communication.",
    assignedEmployees: 8,
    permissions: ["View Orders", "View Customer Profiles", "Live Chat Support", "Issue Credit Coupons"]
  }
];

export const employeesListData = [
  {
    id: "EMP-001",
    name: "Alexandria Montgomery",
    email: "alexandria.m@foodexpress.admin",
    phone: "+1 (555) 741-9920",
    role: "Super Administrator",
    department: "Executive Management",
    joinedDate: "Jan 12, 2024",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-002",
    name: "Jordan Christopher",
    email: "jordan.c@foodexpress.admin",
    phone: "+1 (555) 441-2299",
    role: "Operations & Order Manager",
    department: "Dispatch & Operations",
    joinedDate: "May 04, 2024",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-003",
    name: "Camilla Rodriguez",
    email: "camilla.r@foodexpress.admin",
    phone: "+1 (555) 902-3311",
    role: "Financial Controller & Auditor",
    department: "Finance & Accounting",
    joinedDate: "Mar 19, 2024",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-004",
    name: "Benjamin Scott",
    email: "benjamin.s@foodexpress.admin",
    phone: "+1 (555) 312-8877",
    role: "Catalog & Menu Specialist",
    department: "Marketing & Growth",
    joinedDate: "Aug 15, 2025",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-005",
    name: "Zara Patel",
    email: "zara.p@foodexpress.admin",
    phone: "+1 (555) 674-0012",
    role: "Customer Support Representative",
    department: "Customer Care",
    joinedDate: "Dec 01, 2025",
    status: "On Leave",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80"
  }
];

export const zonesData = [
  {
    id: "ZONE-01",
    name: "Zone 1 - Downtown Core & Financial District",
    code: "ZN-DWTN-01",
    coverageArea: "Manhattan South, Wall St, Tribeca, Battery Park",
    radiusKm: 6.5,
    center: [40.7128, -74.0060],
    color: "#be123c",
    minDeliveryCharge: "$3.99",
    perKmCharge: "$1.20",
    minOrderValue: "$15.00",
    assignedRestaurants: 48,
    activeDrivers: 24,
    status: "Active"
  },
  {
    id: "ZONE-02",
    name: "Zone 2 - West District & Chelsea",
    code: "ZN-WEST-02",
    coverageArea: "Chelsea, Meatpacking, Greenwich Village, SoHo",
    radiusKm: 5.8,
    center: [40.7465, -74.0014],
    color: "#0284c7",
    minDeliveryCharge: "$4.50",
    perKmCharge: "$1.40",
    minOrderValue: "$18.00",
    assignedRestaurants: 62,
    activeDrivers: 31,
    status: "Active"
  },
  {
    id: "ZONE-03",
    name: "Zone 3 - Midtown Central & Theater District",
    code: "ZN-MDTN-03",
    coverageArea: "Times Square, Hell's Kitchen, Murray Hill, Flatiron",
    radiusKm: 7.2,
    center: [40.7589, -73.9851],
    color: "#f59e0b",
    minDeliveryCharge: "$4.99",
    perKmCharge: "$1.50",
    minOrderValue: "$20.00",
    assignedRestaurants: 55,
    activeDrivers: 28,
    status: "Active"
  },
  {
    id: "ZONE-04",
    name: "Zone 4 - Brooklyn North & Williamsburg",
    code: "ZN-BKNY-04",
    coverageArea: "Williamsburg, Greenpoint, DUMBO, Brooklyn Heights",
    radiusKm: 8.5,
    center: [40.7178, -73.9576],
    color: "#10b981",
    minDeliveryCharge: "$3.50",
    perKmCharge: "$1.10",
    minOrderValue: "$15.00",
    assignedRestaurants: 39,
    activeDrivers: 19,
    status: "Active"
  }
];
