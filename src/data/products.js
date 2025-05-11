// All products data centralized in one file
const products = [
  // Electronics Category
  {
    id: 1,
    name: "Sony WH-1000XM4 Headphones",
    price: 349,
    image: "https://m.media-amazon.com/images/I/61oqO1AMbdL._AC_UY327_FMwebp_QL65_.jpg",
    category: "Electronics",
    description: "Industry-leading noise cancellation wireless headphones",
    rating: 4.7,
    inStock: true
  },
  {
    id: 2,
    name: "Apple Watch Series 7",
    price: 399,
    image: "https://m.media-amazon.com/images/I/91Kd2PB5QsL._AC_UY327_FMwebp_QL65_.jpg",
    category: "Electronics",
    description: "Advanced smartwatch with health monitoring features",
    rating: 4.8,
    inStock: true
  },
  {
    id: 3,
    name: "Logitech G502 Gaming Mouse",
    price: 129,
    image: "https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_UY327_FMwebp_QL65_.jpg",
    category: "Electronics",
    description: "High-performance gaming mouse with adjustable weights",
    rating: 4.6,
    inStock: true
  },
  {
    id: 4,
    name: "Razer BlackWidow V3 Keyboard",
    price: 169,
    image: "https://m.media-amazon.com/images/I/61HLJYXFLjL._SL1500_.jpg",
    category: "Electronics",
    description: "Mechanical gaming keyboard with Razer Green switches",
    rating: 4.5,
    inStock: true
  },
  {
    id: 17,
    name: "Samsung Galaxy S23 Ultra",
    price: 1199,
    image: "https://m.media-amazon.com/images/I/71goZuIha-L._SL1500_.jpg",
    category: "Electronics",
    description: "Premium smartphone with pro-grade camera and S Pen",
    rating: 4.9,
    inStock: true
  },
  {
    id: 21,
    name: "iPad Pro 12.9-inch",
    price: 1099,
    image: "https://m.media-amazon.com/images/I/81c+9BOQNWL._AC_UY327_FMwebp_QL65_.jpg",
    category: "Electronics",
    description: "Powerful tablet with Liquid Retina XDR display and M2 chip",
    rating: 4.8,
    inStock: true
  },
  {
    id: 22,
    name: "Bose QuietComfort Earbuds",
    price: 279,
    image: "https://m.media-amazon.com/images/I/61qIEvCy6+L._SL1500_.jpg",
    category: "Electronics",
    description: "True wireless noise cancelling earbuds with high-fidelity audio",
    rating: 4.6,
    inStock: true
  },
  {
    id: 23,
    name: "LG C2 65-inch OLED TV",
    price: 1799,
    image: "https://m.media-amazon.com/images/I/71LJJrKbezL._AC_UY327_FMwebp_QL65_.jpg",
    category: "Electronics",
    description: "4K Smart OLED TV with Alexa built-in and stunning picture quality",
    rating: 4.7,
    inStock: true
  },
  {
    id: 24,
    name: "Nintendo Switch OLED Model",
    price: 349,
    image: "https://m.media-amazon.com/images/I/61nqNujSF2L._SL1330_.jpg",
    category: "Electronics",
    description: "Portable gaming console with vibrant 7-inch OLED screen",
    rating: 4.8,
    inStock: true
  },
  {
    id: 37,
    name: "DJI Mini 3 Pro Drone",
    price: 759,
    image: "https://m.media-amazon.com/images/I/610nnpm1VPL._SL1231_.jpg",
    category: "Electronics",
    description: "Lightweight camera drone with 4K video and obstacle sensing",
    rating: 4.7,
    inStock: true
  },
  {
    id: 38,
    name: "GoPro HERO11 Black",
    price: 399.99,
    image: "https://m.media-amazon.com/images/I/51t6c5t0nDL._SL1500_.jpg",
    category: "Electronics",
    description: "Waterproof action camera with 5.3K video and HyperSmooth stabilization",
    rating: 4.6,
    inStock: true
  },
  {
    id: 39,
    name: "Sony PlayStation 5",
    price: 499.99,
    image: "https://m.media-amazon.com/images/I/51ljnEaW0pL._SL1000_.jpg",
    category: "Electronics",
    description: "Next-gen gaming console with ultra-high speed SSD and haptic feedback",
    rating: 4.8,
    inStock: true
  },
  {
    id: 40,
    name: "Anker 737 Power Bank",
    price: 149.99,
    image: "https://m.media-amazon.com/images/I/71Linf+GHuL._AC_SL1500_.jpg",
    category: "Electronics",
    description: "24,000mAh portable charger with 140W output for laptops and phones",
    rating: 4.7,
    inStock: true
  },

  // Fashion Category
  {
    id: 5,
    name: "Levi's Men's 511 Slim Jeans",
    price: 69,
    image: "https://m.media-amazon.com/images/I/51bzbmpAXuL._AC_UL480_FMwebp_QL65_.jpg",
    category: "Fashion",
    description: "Classic slim-fit jeans in versatile wash",
    rating: 4.6,
    inStock: true
  },
  {
    id: 6,
    name: "Nike Tech Fleece Hoodie",
    price: 130,
    image: "https://m.media-amazon.com/images/I/71oup32GFwL._AC_UL480_FMwebp_QL65_.jpg",
    category: "Fashion",
    description: "Lightweight and warm tech fleece hoodie",
    rating: 4.7,
    inStock: true
  },
  {
    id: 7,
    name: "Adidas Ultraboost Sneakers",
    price: 180,
    image: "https://m.media-amazon.com/images/I/71w241T0CbS._AC_UL480_FMwebp_QL65_.jpg",
    category: "Fashion",
    description: "Comfortable running shoes with responsive cushioning",
    rating: 4.8,
    inStock: true
  },
  {
    id: 8,
    name: "Ray-Ban Aviator Sunglasses",
    price: 163,
    image: "https://m.media-amazon.com/images/I/51iEZoPcpuL._AC_UL480_FMwebp_QL65_.jpg",
    category: "Fashion",
    description: "Classic aviator sunglasses with polarized lenses",
    rating: 4.5,
    inStock: true
  },
  {
    id: 18,
    name: "Casio G-Shock Watch",
    price: 99,
    image: "https://m.media-amazon.com/images/I/61E+kMgwUVL._SX679_.jpg",
    category: "Fashion",
    description: "Rugged, shock-resistant sports watch with digital display",
    rating: 4.7,
    inStock: true
  },
  {
    id: 25,
    name: "The North Face Puffer Jacket",
    price: 220,
    image: "https://m.media-amazon.com/images/I/71nQAFWbJ6L._SY879_.jpg",
    category: "Fashion",
    description: "Water-repellent insulated jacket for cold weather protection",
    rating: 4.7,
    inStock: true
  },
  {
    id: 26,
    name: "Patagonia Better Sweater",
    price: 139,
    image: "https://thehambledon.com/cdn/shop/files/Patagonia-Better-Sweater-Jacket-New-Navy-2_1024x.jpg?v=1692966012",
    category: "Fashion",
    description: "Soft, warm fleece jacket made with recycled materials",
    rating: 4.8,
    inStock: true
  },
  {
    id: 27,
    name: "Timberland 6-Inch Premium Boots",
    price: 198,
    image: "https://m.media-amazon.com/images/I/718pL8pw8OL._SY695_.jpg",
    category: "Fashion",
    description: "Waterproof leather boots with padded collar for comfort",
    rating: 4.6,
    inStock: true
  },
  {
    id: 28,
    name: "Calvin Klein Boxer Briefs",
    price: 39.99,
    image: "https://images-cdn.ubuy.co.in/671f2e599601cd3f404dc695-calvin-klein-boys-39-underwear-boxer.jpg",
    category: "Fashion",
    description: "Comfortable cotton stretch underwear, pack of 5",
    rating: 4.5,
    inStock: true
  },
  {
    id: 41,
    name: "Columbia Bora Bora Booney Hat",
    price: 29.99,
    image: "https://m.media-amazon.com/images/I/51sWlRoTCnL._SX679_.jpg",
    category: "Fashion",
    description: "Sun-protective hat with UPF 50 and cooling mesh ventilation",
    rating: 4.7,
    inStock: true
  },
  {
    id: 42,
    name: "Lululemon Align Leggings",
    price: 98,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTITpn6cDjOfIhAeo8OviUCOP8iR9eZqyZdEg&s",
    category: "Fashion",
    description: "Buttery-soft high-rise yoga pants with four-way stretch",
    rating: 4.9,
    inStock: true
  },
  {
    id: 43,
    name: "Carhartt Acrylic Watch Hat",
    price: 19.99,
    image: "https://m.media-amazon.com/images/I/81W5UTTEaYL._SY879_.jpg",
    category: "Fashion",
    description: "Stretchable rib-knit beanie for cool-weather warmth",
    rating: 4.8,
    inStock: true
  },
  {
    id: 44,
    name: "HOKA Clifton 8 Running Shoes",
    price: 139.95,
    image: "https://m.media-amazon.com/images/I/81JlRGaeTAL._SX695_.jpg",
    category: "Fashion",
    description: "Lightweight cushioned running shoes with breathable mesh upper",
    rating: 4.6,
    inStock: true
  },

  // Home Category
  {
    id: 9,
    name: "Sonos One SL Speaker",
    price: 199,
    image: "https://m.media-amazon.com/images/I/71MTovdD7OL._AC_UY327_FMwebp_QL65_.jpg",
    category: "Home",
    description: "Powerful wireless smart speaker for home audio",
    rating: 4.7,
    inStock: true
  },
  {
    id: 10,
    name: "Philips Hue Smart Bulb",
    price: 49,
    image: "https://m.media-amazon.com/images/I/71PHtT6wqnL._AC_UL480_FMwebp_QL65_.jpg",
    category: "Home",
    description: "Color-changing smart LED bulb with app control",
    rating: 4.6,
    inStock: true
  },
  {
    id: 11,
    name: "Instant Pot Duo 7-in-1",
    price: 89,
    image: "https://m.media-amazon.com/images/I/71WtwEvYDOS._AC_UL480_FMwebp_QL65_.jpg",
    category: "Home",
    description: "Multi-use programmable pressure cooker",
    rating: 4.8,
    inStock: true
  },
  {
    id: 12,
    name: "Dyson V11 Vacuum Cleaner",
    price: 599,
    image: "https://m.media-amazon.com/images/I/418vSp+SqzL._AC_UY327_FMwebp_QL65_.jpg",
    category: "Home",
    description: "Cordless stick vacuum with powerful suction",
    rating: 4.5,
    inStock: true
  },
  {
    id: 19,
    name: "Ninja Air Fryer Max XL",
    price: 149.99,
    image: "https://m.media-amazon.com/images/I/71+8uTMDRFL._AC_UL480_FMwebp_QL65_.jpg",
    category: "Home",
    description: "5.5-quart air fryer for crispy, healthier cooking with less oil",
    rating: 4.8,
    inStock: true
  },
  {
    id: 29,
    name: "KitchenAid Stand Mixer",
    price: 379.99,
    image: "https://m.media-amazon.com/images/I/51HXid8ExKL._SX679_.jpg",
    category: "Home",
    description: "Professional 5-quart stand mixer for baking and cooking",
    rating: 4.9,
    inStock: true
  },
  {
    id: 30,
    name: "Nespresso VertuoPlus Coffee Maker",
    price: 149,
    image: "https://m.media-amazon.com/images/I/61Yagxtg7VL._SX679_.jpg",
    category: "Home",
    description: "Single-serve coffee and espresso machine with milk frother",
    rating: 4.7,
    inStock: true
  },
  {
    id: 31,
    name: "Vitamix E310 Blender",
    price: 349.95,
    image: "https://m.media-amazon.com/images/I/71x8cZMYdSL._SX679_.jpg",
    category: "Home",
    description: "Professional-grade blender with variable speed control",
    rating: 4.8,
    inStock: true
  },
  {
    id: 32,
    name: "Coway Air Purifier",
    price: 229.99,
    image: "https://m.media-amazon.com/images/I/91mE+0CCnGL._SX679_.jpg",
    category: "Home",
    description: "4-stage filtration air purifier with air quality indicator",
    rating: 4.7,
    inStock: true
  },
  {
    id: 45,
    name: "Le Creuset Enameled Cast Iron Dutch Oven",
    price: 369.95,
    image: "https://m.media-amazon.com/images/I/81FhKnzzVYL._SX679_.jpg",
    category: "Home",
    description: "Premium 5.5-quart enameled cast iron pot for slow cooking and baking",
    rating: 4.8,
    inStock: true
  },
  {
    id: 46,
    name: "iRobot Roomba i7+ Robot Vacuum",
    price: 799.99,
    image: "https://m.media-amazon.com/images/I/51mk1dEtqNL._SX679_.jpg",
    category: "Home",
    description: "Self-emptying robot vacuum with smart mapping and voice control",
    rating: 4.6,
    inStock: true
  },
  {
    id: 47,
    name: "Brooklinen Luxe Core Sheet Set",
    price: 149,
    image: "https://m.media-amazon.com/images/I/81-vpwRVjnL._SX679_.jpg",
    category: "Home",
    description: "Luxury 480-thread-count cotton sateen bedding for premium comfort",
    rating: 4.7,
    inStock: true
  },
  {
    id: 48,
    name: "Simplehuman Touch-Free Soap Dispenser",
    price: 44.99,
    image: "https://m.media-amazon.com/images/I/415WP8YtJcL._SL1000_.jpg",
    category: "Home",
    description: "Rechargeable sensor pump with variable dispense control",
    rating: 4.5,
    inStock: true
  },
  
  // Books Category
  {
    id: 13,
    name: "The Psychology of Success",
    price: 24.99,
    image: "https://m.media-amazon.com/images/I/71SbJP7R55L._SY522_.jpg",
    category: "Books",
    description: "Learn the mindset and habits of highly successful people",
    rating: 4.7,
    inStock: true
  },
  {
    id: 14,
    name: "Cooking Masterclass",
    price: 34.99,
    image: "https://m.media-amazon.com/images/I/81Tj-mnfV9L._SY522_.jpg",
    category: "Books",
    description: "Comprehensive guide to mastering culinary arts",
    rating: 4.8,
    inStock: true
  },
  {
    id: 15,
    name: "Digital Marketing Essentials",
    price: 29.99,
    image: "https://m.media-amazon.com/images/I/71OSomVoxlL._SY522_.jpg",
    category: "Books",
    description: "Modern strategies for online business growth",
    rating: 4.6,
    inStock: true
  },
  {
    id: 16,
    name: "Fitness Transformation Guide",
    price: 19.99,
    image: "https://m.media-amazon.com/images/I/71gjEfGEiUL._SY466_.jpg",
    category: "Books",
    description: "Complete workout and nutrition plan for optimal results",
    rating: 4.5,
    inStock: true
  },
  {
    id: 20,
    name: "Atomic Habits",
    price: 16.99,
    image: "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UY327_FMwebp_QL65_.jpg",
    category: "Books",
    description: "An easy and proven way to build good habits and break bad ones",
    rating: 4.9,
    inStock: true
  },
  {
    id: 33,
    name: "The Alchemist",
    price: 14.99,
    image: "https://m.media-amazon.com/images/I/51Z0nLAfLmL._AC_UY327_FMwebp_QL65_.jpg",
    category: "Books",
    description: "A fable about following your dreams and listening to your heart",
    rating: 4.7,
    inStock: true
  },
  {
    id: 34,
    name: "Sapiens: A Brief History of Humankind",
    price: 24.99,
    image: "https://m.media-amazon.com/images/I/713jIoMO3UL._SY522_.jpg",
    category: "Books",
    description: "A groundbreaking narrative of humanity's creation and evolution",
    rating: 4.8,
    inStock: true
  },
  {
    id: 35,
    name: "The Art of War",
    price: 12.99,
    image: "https://m.media-amazon.com/images/I/71jWgemHbML._SY522_.jpg",
    category: "Books",
    description: "Ancient military treatise with applications in business and beyond",
    rating: 4.7,
    inStock: true
  },
  {
    id: 36,
    name: "Rich Dad Poor Dad",
    price: 15.99,
    image: "https://m.media-amazon.com/images/I/81bsw6fnUiL._AC_UY327_FMwebp_QL65_.jpg",
    category: "Books",
    description: "What the rich teach their kids about money that the poor don't",
    rating: 4.7,
    inStock: true
  },
  {
    id: 49,
    name: "Educated: A Memoir",
    price: 17.99,
    image: "https://m.media-amazon.com/images/I/81NwOj14S6L._AC_UY327_FMwebp_QL65_.jpg",
    category: "Books",
    description: "A remarkable memoir about the power of education and self-invention",
    rating: 4.7,
    inStock: true
  },
  {
    id: 50,
    name: "The Subtle Art of Not Giving a F*ck",
    price: 15.99,
    image: "https://m.media-amazon.com/images/I/71QKQ9mwV7L._AC_UY327_FMwebp_QL65_.jpg",
    category: "Books",
    description: "A counterintuitive approach to living a good life with better values",
    rating: 4.6,
    inStock: true
  },
  {
    id: 51,
    name: "The Midnight Library",
    price: 16.79,
    image: "https://m.media-amazon.com/images/I/81tCtHFtOgL._AC_UY327_FMwebp_QL65_.jpg",
    category: "Books",
    description: "Novel about a library beyond the edge of the universe with infinite possibilities",
    rating: 4.5,
    inStock: true
  },
  {
    id: 52,
    name: "Project Hail Mary",
    price: 18.89,
    image: "https://m.media-amazon.com/images/I/81zD9kaVW9L._SY522_.jpg",
    category: "Books",
    description: "A science-based thriller about an astronaut who must save humanity",
    rating: 4.8,
    inStock: true
  }
];

export default products; 