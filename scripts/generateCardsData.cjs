const fs = require('fs');
const path = require('path');

// 24 Global Stage Countries with Real Creative Hubs
const REGIONS = [
  { country: 'India', flag: '🇮🇳', count: 2842, cities: ['Hyderabad', 'Mumbai', 'Chennai', 'Bengaluru', 'Delhi', 'Kolkata', 'Jaipur', 'Kochi'] },
  { country: 'USA', flag: '🇺🇸', count: 1920, cities: ['Austin', 'New York', 'Los Angeles', 'Chicago', 'Seattle', 'Portland', 'Santa Fe'] },
  { country: 'UK', flag: '🇬🇧', count: 874, cities: ['London', 'Manchester', 'Bristol', 'Edinburgh', 'Glasgow'] },
  { country: 'Japan', flag: '🇯🇵', count: 612, cities: ['Tokyo', 'Kyoto', 'Osaka', 'Fukuoka', 'Kanazawa'] },
  { country: 'Nigeria', flag: '🇳🇬', count: 480, cities: ['Lagos', 'Abuja', 'Ibadan', 'Enugu', 'Calabar'] },
  { country: 'Germany', flag: '🇩🇪', count: 520, cities: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Leipzig'] },
  { country: 'Australia', flag: '🇦🇺', count: 410, cities: ['Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide'] },
  { country: 'Brazil', flag: '🇧🇷', count: 680, cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Belo Horizonte'] },
  { country: 'South Korea', flag: '🇰🇷', count: 540, cities: ['Seoul', 'Busan', 'Daegu', 'Gwangju', 'Jeonju'] },
  { country: 'Morocco', flag: '🇲🇦', count: 320, cities: ['Marrakech', 'Fez', 'Casablanca', 'Rabat', 'Tangier'] },
  { country: 'Canada', flag: '🇨🇦', count: 590, cities: ['Vancouver', 'Toronto', 'Montreal', 'Calgary', 'Halifax'] },
  { country: 'Mexico', flag: '🇲🇽', count: 460, cities: ['Mexico City', 'Oaxaca', 'Guadalajara', 'Monterrey', 'San Cristóbal'] },
  { country: 'Kenya', flag: '🇰🇪', count: 280, cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'] },
  { country: 'Sweden', flag: '🇸🇪', count: 350, cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala'] },
  { country: 'Thailand', flag: '🇹🇭', count: 310, cities: ['Chiang Mai', 'Bangkok', 'Chiang Rai', 'Phuket'] },
  { country: 'Argentina', flag: '🇦🇷', count: 390, cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Bariloche'] },
  { country: 'France', flag: '🇫🇷', count: 740, cities: ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Arles'] },
  { country: 'Italy', flag: '🇮🇹', count: 690, cities: ['Florence', 'Rome', 'Milan', 'Venice', 'Naples', 'Bologna'] },
  { country: 'South Africa', flag: '🇿🇦', count: 380, cities: ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'] },
  { country: 'Spain', flag: '🇪🇸', count: 620, cities: ['Barcelona', 'Madrid', 'Valencia', 'Seville', 'Bilbao'] },
  { country: 'Colombia', flag: '🇨🇴', count: 370, cities: ['Bogotá', 'Medellín', 'Cali', 'Cartagena'] },
  { country: 'Egypt', flag: '🇪🇬', count: 340, cities: ['Cairo', 'Alexandria', 'Luxor', 'Aswan'] },
  { country: 'Vietnam', flag: '🇻🇳', count: 290, cities: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hoi An'] },
  { country: 'Indonesia', flag: '🇮🇩', count: 450, cities: ['Ubud', 'Yogyakarta', 'Jakarta', 'Bandung'] }
];

// Rich Pool of Verified Unsplash Images for Covers and Artworks
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1579783901586-78822e5997bb?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1569172122301-bc500f30913c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1460661419200-93729e847c5d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1520523839898-507125ef538a?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1508921912186-1d1395d43e16?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=1600&q=80'
];

const AVATAR_IMAGES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534751516642-a1714f5263a2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=800&q=80'
];

// Diverse creator profiles covering all 24 countries & creative disciplines
const CREATOR_ARCHETYPES = [
  // India (continued)
  { name: 'Kavita Sundaram', city: 'Bengaluru', country: 'India', region: 'Karnataka', category: 'Digital Art', title: 'Generative Code & Biophilic Artist' },
  { name: 'Farhan Zaidi', city: 'Delhi', country: 'India', region: 'Delhi NCR', category: 'Visual Art', title: 'Miniature Revivalist & Calligrapher' },
  { name: 'Sunita Majumdar', city: 'Kolkata', country: 'India', region: 'West Bengal', category: 'Visual Art', title: 'Terracotta Sculptor & Muralist' },
  { name: 'Aditya Nair', city: 'Kochi', country: 'India', region: 'Kerala', category: 'Photography', title: 'Coastal Archipelago Documentarian' },
  { name: 'Meenakshi Iyer', city: 'Jaipur', country: 'India', region: 'Rajasthan', category: 'Design', title: 'Natural Indigo Dyer & Textile Architect' },
  
  // USA
  { name: 'Marcus Vance', city: 'New York', country: 'USA', region: 'New York', category: 'Visual Art', title: 'Abstract Expressionist & Assemblage Artist' },
  { name: 'Chloe Lin', city: 'Austin', country: 'USA', region: 'Texas', category: 'Digital Art', title: 'Interactive Media & Generative Shaders' },
  { name: 'Elijah Brooks', city: 'Chicago', country: 'USA', region: 'Illinois', category: 'Photography', title: 'Architectural Brutalism & Urban Light' },
  { name: 'Sierra Torres', city: 'Santa Fe', country: 'USA', region: 'New Mexico', category: 'Visual Art', title: 'Pueblo Adobe Clay Sculptor' },
  { name: 'Devon Hayes', city: 'Seattle', country: 'USA', region: 'Washington', category: 'Design', title: 'Zero-Waste Industrial Craftsman' },

  // UK
  { name: 'Oliver Sterling', city: 'Bristol', country: 'UK', region: 'South West', category: 'Visual Art', title: 'Graffiti & Trompe-l\'œil Muralist' },
  { name: 'Freya MacLeod', city: 'Edinburgh', country: 'UK', region: 'Scotland', category: 'Photography', title: 'Highland Atmospheric Landscape Stills' },
  { name: 'Hamza Al-Sayed', city: 'Manchester', country: 'UK', region: 'Greater Manchester', category: 'Music', title: 'Orchestral Trip-Hop Producer' },
  { name: 'Imogen Clarke', city: 'London', country: 'UK', region: 'London', category: 'Design', title: 'Sustainable Biomaterial Sculptor' },

  // Japan
  { name: 'Sayuri Mori', city: 'Kyoto', country: 'Japan', region: 'Kansai', category: 'Visual Art', title: 'Washi Paper Sculptor & Lacquerist' },
  { name: 'Ren Watanabe', city: 'Osaka', country: 'Japan', region: 'Kansai', category: 'Photography', title: 'Cyberpunk Alley Light Hunter' },
  { name: 'Hina Sato', city: 'Kanazawa', country: 'Japan', region: 'Chubu', category: 'Design', title: 'Modern Kutani Ceramic Potter' },
  { name: 'Daiki Inoue', city: 'Tokyo', country: 'Japan', region: 'Kanto', category: '3D / Animation', title: 'Kinetic Holographic Animator' },

  // Nigeria
  { name: 'Emeka Okafor', city: 'Lagos', country: 'Nigeria', region: 'Lagos State', category: 'Visual Art', title: 'Afrofuturist Oil & Collage Painter' },
  { name: 'Amina Bello', city: 'Abuja', country: 'Nigeria', region: 'FCT', category: 'Design', title: 'Northern Leather & Brass Sculptor' },
  { name: 'Chidi Nnamdi', city: 'Enugu', country: 'Nigeria', region: 'Enugu State', category: 'Photography', title: 'Masquerade Cultural Documentarian' },
  { name: 'Blessing Kalu', city: 'Ibadan', country: 'Nigeria', region: 'Oyo State', category: 'Digital Art', title: 'Yoruba Mythology Concept Illustrator' },

  // Germany
  { name: 'Lukas Weber', city: 'Berlin', country: 'Germany', region: 'Berlin', category: 'Digital Art', title: 'Modular Synthesizer & AV Laser Artist' },
  { name: 'Hannah Richter', city: 'Munich', country: 'Germany', region: 'Bavaria', category: 'Visual Art', title: 'Minimalist Monochromatic Oil Painter' },
  { name: 'Felix Braun', city: 'Hamburg', country: 'Germany', region: 'Hamburg', category: 'Photography', title: 'Maritime Industrial Minimalist' },
  { name: 'Greta Koch', city: 'Leipzig', country: 'Germany', region: 'Saxony', category: 'Design', title: 'Bauhaus Reinterpreted Typographer' },

  // Australia
  { name: 'Jack Marwood', city: 'Melbourne', country: 'Australia', region: 'Victoria', category: 'Visual Art', title: 'Outback Ochre & Linen Landscape Painter' },
  { name: 'Talia Henderson', city: 'Sydney', country: 'Australia', region: 'New South Wales', category: 'Photography', title: 'Oceanic Subsurface Stills & Conservation' },
  { name: 'Liam O\'Connor', city: 'Perth', country: 'Australia', region: 'Western Australia', category: 'Design', title: 'Reclaimed Jarrah Wood Furniture Sculptor' },
  { name: 'Kylie Gungurra', city: 'Brisbane', country: 'Australia', region: 'Queensland', category: 'Visual Art', title: 'Contemporary Indigenous Dot-Matrix Narratives' },

  // Brazil
  { name: 'Mateus Santos', city: 'São Paulo', country: 'Brazil', region: 'São Paulo', category: 'Visual Art', title: 'Concrete Brutalist Fresco Muralist' },
  { name: 'Luciana Ferreira', city: 'Rio de Janeiro', country: 'Brazil', region: 'Rio de Janeiro', category: 'Photography', title: 'Favela Joy & Carnival Motion Stills' },
  { name: 'Thiago Bahia', city: 'Salvador', country: 'Brazil', region: 'Bahia', category: 'Music', title: 'Afro-Brazilian Maracatu Electronic Producer' },
  { name: 'Beatriz Lima', city: 'Belo Horizonte', country: 'Brazil', region: 'Minas Gerais', category: 'Design', title: 'Soapstone Ceramic Tableware Sculptor' },

  // South Korea
  { name: 'Min-Soo Kim', city: 'Seoul', country: 'South Korea', region: 'Seoul', category: 'Digital Art', title: 'Cyberpunk Metahuman Sculptor' },
  { name: 'Eun-Ji Choi', city: 'Busan', country: 'South Korea', region: 'Busan', category: 'Photography', title: 'Port City Fog & Neon Long Exposures' },
  { name: 'Tae-Hyun Jung', city: 'Jeonju', country: 'South Korea', region: 'Jeollabuk-do', category: 'Design', title: 'Traditional Hanji Paper Lighting Designer' },
  { name: 'So-Yeon Bae', city: 'Gwangju', country: 'South Korea', region: 'Gwangju', category: 'Visual Art', title: 'Ink Wash Abstract Expressionist' },

  // Morocco
  { name: 'Tariq Mansouri', city: 'Marrakech', country: 'Morocco', region: 'Marrakech-Safi', category: 'Design', title: 'Chiseled Tadelakt & Brass Lamp Craftsman' },
  { name: 'Nadia El-Fassi', city: 'Fez', country: 'Morocco', region: 'Fès-Meknès', category: 'Visual Art', title: 'Natural Mineral Indigo Weaver' },
  { name: 'Karim Bouzidi', city: 'Casablanca', country: 'Morocco', region: 'Casablanca-Settat', category: 'Photography', title: 'Art Deco & Atlantic Dusk Chronicler' },
  { name: 'Salma Chraibi', city: 'Tangier', country: 'Morocco', region: 'Tanger-Tétouan', category: 'Visual Art', title: 'Mediterranean Coastal Watercolorist' },

  // Canada
  { name: 'Noah Tremblay', city: 'Montreal', country: 'Canada', region: 'Quebec', category: 'Digital Art', title: 'Generative Projection Mapping Architect' },
  { name: 'Astrid Roy', city: 'Toronto', country: 'Canada', region: 'Ontario', category: 'Photography', title: 'Glacial Ice Core & Arctic Stills' },
  { name: 'Caleb Campbell', city: 'Calgary', country: 'Canada', region: 'Alberta', category: 'Visual Art', title: 'Rocky Mountain En Plein Air Oil Painter' },
  { name: 'Maya St-Laurent', city: 'Vancouver', country: 'Canada', region: 'British Columbia', category: 'Design', title: 'Mycelium Acoustic Bio-Panels' },

  // Mexico
  { name: 'Emiliano Vargas', city: 'Oaxaca', country: 'Mexico', region: 'Oaxaca', category: 'Visual Art', title: 'Cochineal Dye & Handwoven Wool Weaver' },
  { name: 'Ximena Paredes', city: 'Mexico City', country: 'Mexico', region: 'CDMX', category: 'Photography', title: 'Surrealist Lucha Libre Cultural Stills' },
  { name: 'Rodrigo Nava', city: 'Guadalajara', country: 'Mexico', region: 'Jalisco', category: 'Design', title: 'Blown Glass & Volcanic Basalt Sculptor' },
  { name: 'Paloma Soto', city: 'Monterrey', country: 'Mexico', region: 'Nuevo León', category: 'Visual Art', title: 'Northern Sierra Limestone Sculptor' },

  // Kenya
  { name: 'Juma Mwangi', city: 'Nairobi', country: 'Kenya', region: 'Nairobi County', category: 'Visual Art', title: 'Scrap Metal Wildlife Sculptor' },
  { name: 'Zahara Hassan', city: 'Mombasa', country: 'Kenya', region: 'Coast Province', category: 'Photography', title: 'Swahili Dhow Fishermen Stills' },
  { name: 'Otieno Kiprono', city: 'Kisumu', country: 'Kenya', region: 'Nyanza', category: 'Design', title: 'Lake Victoria Water Hyacinth Fiber Sculptor' },
  { name: 'Achieng Were', city: 'Nairobi', country: 'Kenya', region: 'Nairobi County', category: 'Digital Art', title: 'Afro-Speculative Graphic Novelist' },

  // Sweden
  { name: 'Erik Lindqvist', city: 'Stockholm', country: 'Sweden', region: 'Stockholm', category: 'Design', title: 'Nordic Birch & Cast Glass Luminaire Designer' },
  { name: 'Linnea Berg', city: 'Gothenburg', country: 'Sweden', region: 'Västra Götaland', category: 'Visual Art', title: 'Archipelago Cold Pigment Oil Painter' },
  { name: 'Gustav Holm', city: 'Malmö', country: 'Sweden', region: 'Skåne', category: 'Photography', title: 'Boreal Winter Twilight Stills' },
  { name: 'Astrid Nilsson', city: 'Uppsala', country: 'Sweden', region: 'Uppsala', category: 'Digital Art', title: 'Nordic Folk Flora Generative Shader' },

  // Thailand
  { name: 'Somchai Prasert', city: 'Chiang Mai', country: 'Thailand', region: 'Chiang Mai', category: 'Visual Art', title: 'Celadon Ceramic & Teak Wood Carver' },
  { name: 'Kanya Ratanakul', city: 'Bangkok', country: 'Thailand', region: 'Central Thailand', category: 'Digital Art', title: 'Chao Phraya River Light Installation' },
  { name: 'Arthit Saelim', city: 'Chiang Rai', country: 'Thailand', region: 'Northern Thailand', category: 'Photography', title: 'Golden Triangle Misty Dawn Stills' },
  { name: 'Nattaya Boonmee', city: 'Phuket', country: 'Thailand', region: 'Southern Thailand', category: 'Design', title: 'Pearl Shell Inlay Sustainable Jewelry' },

  // Argentina
  { name: 'Facundo Rossi', city: 'Buenos Aires', country: 'Argentina', region: 'Buenos Aires', category: 'Visual Art', title: 'Fileteado Porteño Modernist' },
  { name: 'Micaela Gomez', city: 'Córdoba', country: 'Argentina', region: 'Córdoba', category: 'Photography', title: 'Sierras Chicas Monochromatic Stills' },
  { name: 'Joaquin Ferreyra', city: 'Mendoza', country: 'Argentina', region: 'Mendoza', category: 'Design', title: 'Andean Vineyard Oak Wood Sculptor' },
  { name: 'Lucia Pellegrini', city: 'Bariloche', country: 'Argentina', region: 'Río Negro', category: 'Visual Art', title: 'Patagonian Glacial Melt Watercolorist' },

  // France
  { name: 'Julien Moreau', city: 'Paris', country: 'France', region: 'Île-de-France', category: 'Visual Art', title: 'Neo-Impressionist Atmospheric Oil Painter' },
  { name: 'Camille Laurent', city: 'Lyon', country: 'France', region: 'Auvergne-Rhône-Alpes', category: 'Design', title: 'Jacquard Silk Weaver & Modular Fashion' },
  { name: 'Etienne Girard', city: 'Marseille', country: 'France', region: 'Provence-Alpes-Côte d\'Azur', category: 'Photography', title: 'Mediterranean Salt-Mist Cyanotypes' },
  { name: 'Celine Dubois', city: 'Bordeaux', country: 'France', region: 'Nouvelle-Aquitaine', category: 'Digital Art', title: 'Gothic Cathedral Fractal Lighting' },

  // Italy
  { name: 'Matteo Bellini', city: 'Florence', country: 'Italy', region: 'Tuscany', category: 'Visual Art', title: 'Carrara Marble & Bronze Foundry Sculptor' },
  { name: 'Chiara Russo', city: 'Rome', country: 'Italy', region: 'Lazio', category: 'Photography', title: 'Roman Travertine Shadow & Ochre Light' },
  { name: 'Lorenzo Moretti', city: 'Venice', country: 'Italy', region: 'Veneto', category: 'Design', title: 'Murano Hand-Blown Freeform Glassmaker' },
  { name: 'Alessia Conti', city: 'Milan', country: 'Italy', region: 'Lombardy', category: '3D / Animation', title: 'High-Fashion Kinetic Digital Cloth Animator' },

  // South Africa
  { name: 'Thabo Mthembu', city: 'Cape Town', country: 'South Africa', region: 'Western Cape', category: 'Visual Art', title: 'Table Mountain Sandstone & Pigment Painter' },
  { name: 'Zanele Khumalo', city: 'Johannesburg', country: 'South Africa', region: 'Gauteng', category: 'Photography', title: 'Soweto Vibrant Youth Culture Chronicler' },
  { name: 'Sipho Dlamini', city: 'Durban', country: 'South Africa', region: 'KwaZulu-Natal', category: 'Design', title: 'Zulu Wire Basket Geometric Innovator' },
  { name: 'Lerato Ndlovu', city: 'Pretoria', country: 'South Africa', region: 'Gauteng', category: 'Digital Art', title: 'Pan-African Speculative World Builder' },

  // Spain
  { name: 'Alejandro Soler', city: 'Barcelona', country: 'Spain', region: 'Catalonia', category: 'Visual Art', title: 'Mosaic Ceramic Fragment Sculptor' },
  { name: 'Ines Navarro', city: 'Madrid', country: 'Spain', region: 'Community of Madrid', category: 'Photography', title: 'Castilian Sun-Drenched Street Stills' },
  { name: 'Pablo Ibanez', city: 'Seville', country: 'Spain', region: 'Andalusia', category: 'Music', title: 'Flamenco Cante & Microtonal Guitarist' },
  { name: 'Elena Ramos', city: 'Valencia', country: 'Spain', region: 'Valencian Community', category: 'Design', title: 'Terracotta Acoustic Pavilion Architect' },

  // Colombia
  { name: 'Santiago Montoya', city: 'Medellín', country: 'Colombia', region: 'Antioquia', category: 'Visual Art', title: 'Coffee Bean Husk & Bio-Resin Sculptor' },
  { name: 'Catalina Restrepo', city: 'Bogotá', country: 'Colombia', region: 'Cundinamarca', category: 'Photography', title: 'Andean Cloud Forest Epiphyte Stills' },
  { name: 'Andres Caicedo', city: 'Cali', country: 'Colombia', region: 'Valle del Cauca', category: 'Design', title: 'Guadua Bamboo Parametric Pavilions' },
  { name: 'Daniela Mejia', city: 'Cartagena', country: 'Colombia', region: 'Bolívar', category: 'Visual Art', title: 'Caribbean Coral Bleaching Pigment Studies' },

  // Egypt
  { name: 'Youssef El-Masry', city: 'Cairo', country: 'Egypt', region: 'Cairo Governorate', category: 'Visual Art', title: 'Papyrus & Ancient Egyptian Fresco Revivalist' },
  { name: 'Farida Mansoor', city: 'Alexandria', country: 'Egypt', region: 'Alexandria', category: 'Photography', title: 'Mediterranean Port & Roman Catacomb Stills' },
  { name: 'Mostafa Kamel', city: 'Luxor', country: 'Egypt', region: 'Luxor Governorate', category: 'Design', title: 'Alabaster Hand-Carved Vessels & Lights' },
  { name: 'Layla Osman', city: 'Aswan', country: 'Egypt', region: 'Aswan Governorate', category: 'Visual Art', title: 'Nubian Geometric Mud-Brick Colorist' },

  // Vietnam
  { name: 'Nguyen Van Minh', city: 'Hanoi', country: 'Vietnam', region: 'Red River Delta', category: 'Visual Art', title: 'Eggshell & Gold Leaf Lacquer Painter' },
  { name: 'Tran Thi Mai', city: 'Ho Chi Minh City', country: 'Vietnam', region: 'Southeast', category: 'Photography', title: 'Mekong Floating Market Dawn Stills' },
  { name: 'Le Hoang Nam', city: 'Da Nang', country: 'Vietnam', region: 'South Central Coast', category: 'Design', title: 'Marble Mountain Hand-Chiseled Modern Vessels' },
  { name: 'Pham Thu Huong', city: 'Hoi An', country: 'Vietnam', region: 'Quang Nam', category: 'Visual Art', title: 'Silk Lantern Paper & Botanical Watercolorist' },

  // Indonesia
  { name: 'I Wayan Sudiarta', city: 'Ubud', country: 'Indonesia', region: 'Bali', category: 'Visual Art', title: 'Sacred Balinese Temple Wood Carver' },
  { name: 'Dewi Kartika', city: 'Yogyakarta', country: 'Indonesia', region: 'Special Region of Yogyakarta', category: 'Design', title: 'Canting Wax Batik Canting Textile Artist' },
  { name: 'Budi Santoso', city: 'Jakarta', country: 'Indonesia', region: 'DKI Jakarta', category: 'Digital Art', title: 'Javanese Shadow Puppet Kinetic Animator' },
  { name: 'Putu Ayu Ratna', city: 'Bandung', country: 'Indonesia', region: 'West Java', category: 'Photography', title: 'Volcanic Tea Plantation Dawn Stills' }
];

console.log('Archetypes defined:', CREATOR_ARCHETYPES.length);
