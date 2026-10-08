const fs = require('fs');
const path = require('path');

const mockDataPath = path.resolve(__dirname, '../src/data/mockData.ts');

// 120 Curated Unsplash photo IDs for Covers & Artworks
const PHOTO_IDS = [
  'photo-1579783900882-c0d3dad7b119', 'photo-1579783902614-a3fb3927b675', 'photo-1582561424760-0321d75e81fa',
  'photo-1514565131-fce0801e5785', 'photo-1618005182384-a83a8bd57fbe', 'photo-1509198397868-475647b2a1e5',
  'photo-1541701494587-cb58502866ab', 'photo-1550684848-fac1c5b4e853', 'photo-1547826039-bfc35e0f1ea8',
  'photo-1578328819058-b69f3a3b0f6b', 'photo-1563089145-599997674d42', 'photo-1579546929518-9e396f3cc809',
  'photo-1518709268805-4e9042af9f23', 'photo-1544717305-2782549b5136', 'photo-1577083552431-6e5fd01aa342',
  'photo-1580136579312-94651dfd596d', 'photo-1507676184212-d03ab07a01bf', 'photo-1492684223066-81342ee5ff30',
  'photo-1526374965328-7f61d4dc18c5', 'photo-1513364776144-60967b0f800f', 'photo-1547036967-23d11aacaee0',
  'photo-1539037116277-4db20889f2d4', 'photo-1558618666-fcd25c85f82e', 'photo-1441974231531-c6227db76b6e',
  'photo-1504609773096-104ff2c73ba4', 'photo-1561214115-f2f134cc4912', 'photo-1607604276583-eef5d076aa5f',
  'photo-1579783901586-78822e5997bb', 'photo-1569172122301-bc500f30913c', 'photo-1549887534-1541e9326642',
  'photo-1518998053901-5348d3961a04', 'photo-1586023492125-27b2c045efd7', 'photo-1551288049-bebda4e38f71',
  'photo-1536924940846-227afb31e2a5', 'photo-1563245372-f21724e3856d', 'photo-1515405295579-ba7b45403062',
  'photo-1460661419200-93729e847c5d', 'photo-1533158307587-828f0a76ef46', 'photo-1508739773434-c26b3d09e071',
  'photo-1576085898323-218337e3e43c', 'photo-1534447677768-be436bb09401', 'photo-1500485035595-cbe6f645feb1',
  'photo-1528459801416-a9e53bbf4e17', 'photo-1507679799987-c73779587ccf', 'photo-1513519245088-0e12902e5a38',
  'photo-1511671782779-c97d3d27a1d4', 'photo-1543857778-c4a1a3e0b2eb', 'photo-1550745165-9bc0b252726f',
  'photo-1518770660439-4636190af475', 'photo-1549490349-8643362247b5', 'photo-1508615039623-a25605d2b022',
  'photo-1516450360452-9312f5e86fc7', 'photo-1520523839898-507125ef538a', 'photo-1500462918059-b1a0cb512f1d',
  'photo-1506157786151-b8491531f063', 'photo-1519681393784-d120267933ba', 'photo-1505373877841-8d25f7d46678',
  'photo-1533090161767-e6ffed986c88', 'photo-1510915361894-db8b60106cb1', 'photo-1508921912186-1d1395d43e16',
  'photo-1470225620780-dba8ba36b745', 'photo-1487180144351-b8472da7d491', 'photo-1513542789411-b6a5d4f31634',
  'photo-1541701494587-cb58502866ab', 'photo-1579783901586-78822e5997bb', 'photo-1547826039-bfc35e0f1ea8',
  'photo-1577083552431-6e5fd01aa342', 'photo-1518709268805-4e9042af9f23', 'photo-1536924940846-227afb31e2a5',
  'photo-1515405295579-ba7b45403062', 'photo-1563245372-f21724e3856d', 'photo-1550684848-fac1c5b4e853',
  'photo-1578328819058-b69f3a3b0f6b', 'photo-1561214115-f2f134cc4912', 'photo-1582561424760-0321d75e81fa',
  'photo-1579783900882-c0d3dad7b119', 'photo-1509198397868-475647b2a1e5', 'photo-1514565131-fce0801e5785',
  'photo-1618005182384-a83a8bd57fbe', 'photo-1586023492125-27b2c045efd7', 'photo-1558618666-fcd25c85f82e',
  'photo-1569172122301-bc500f30913c', 'photo-1549887534-1541e9326642', 'photo-1504609773096-104ff2c73ba4',
  'photo-1526374965328-7f61d4dc18c5', 'photo-1539037116277-4db20889f2d4', 'photo-1492684223066-81342ee5ff30',
  'photo-1580136579312-94651dfd596d', 'photo-1544717305-2782549b5136', 'photo-1579546929518-9e396f3cc809',
  'photo-1563089145-599997674d42', 'photo-1507676184212-d03ab07a01bf', 'photo-1513364776144-60967b0f800f',
  'photo-1547036967-23d11aacaee0', 'photo-1441974231531-c6227db76b6e', 'photo-1607604276583-eef5d076aa5f',
  'photo-1518998053901-5348d3961a04', 'photo-1551288049-bebda4e38f71', 'photo-1460661419200-93729e847c5d',
  'photo-1533158307587-828f0a76ef46', 'photo-1508739773434-c26b3d09e071', 'photo-1576085898323-218337e3e43c',
  'photo-1534447677768-be436bb09401', 'photo-1500485035595-cbe6f645feb1', 'photo-1528459801416-a9e53bbf4e17',
  'photo-1507679799987-c73779587ccf', 'photo-1513519245088-0e12902e5a38', 'photo-1511671782779-c97d3d27a1d4',
  'photo-1543857778-c4a1a3e0b2eb', 'photo-1550745165-9bc0b252726f', 'photo-1518770660439-4636190af475',
  'photo-1549490349-8643362247b5', 'photo-1508615039623-a25605d2b022', 'photo-1516450360452-9312f5e86fc7',
  'photo-1520523839898-507125ef538a', 'photo-1500462918059-b1a0cb512f1d', 'photo-1506157786151-b8491531f063',
  'photo-1519681393784-d120267933ba', 'photo-1505373877841-8d25f7d46678', 'photo-1533090161767-e6ffed986c88',
  'photo-1510915361894-db8b60106cb1', 'photo-1508921912186-1d1395d43e16', 'photo-1470225620780-dba8ba36b745',
  'photo-1487180144351-b8472da7d491', 'photo-1513542789411-b6a5d4f31634', 'photo-1579783900882-c0d3dad7b119'
];

// Curated Avatars
const AVATAR_IDS = [
  'photo-1534528741775-53994a69daeb', 'photo-1507003211169-0a1dd7228f2d', 'photo-1517841905240-472988babdf9',
  'photo-1500648767791-00dcc994a43e', 'photo-1544005313-94ddf0286df2', 'photo-1506794778202-cad84cf45f1d',
  'photo-1539571696357-5a69c17a67c6', 'photo-1519085360753-af0119f7cbe7', 'photo-1524504388940-b1c1722653e1',
  'photo-1492562080023-ab3db95bfbce', 'photo-1472099645785-5658abf4ff4e', 'photo-1488426862026-3ee34a7d66df',
  'photo-1438761681033-6461ffad8d80', 'photo-1494790108755-2616b612b786', 'photo-1501196354995-cbb51c65aaea',
  'photo-1535713875002-d1d0cf377fde', 'photo-1522075469751-3a6694fb2f61', 'photo-1544725176-7c40e5a71c5e',
  'photo-1508214751196-bcfd4ca60f91', 'photo-1527980965255-d3b416303d12', 'photo-1570295999919-56ceb5ecca61',
  'photo-1580489944761-15a19d654956', 'photo-1534751516642-a1714f5263a2', 'photo-1546961329-78bef0414d7c'
];

function getCover(index) {
  const id = PHOTO_IDS[index % PHOTO_IDS.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
}

function getArtworkImage(index) {
  // Offset by half to ensure artwork images look distinct from artist cover images
  const id = PHOTO_IDS[(index * 7 + 13) % PHOTO_IDS.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
}

function getAvatar(index) {
  const id = AVATAR_IDS[index % AVATAR_IDS.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;
}

// 24 Global Stage Countries with authentic regional creator profiles
const REGIONS_DATA = [
  {
    country: 'India',
    flag: '🇮🇳',
    cities: ['Hyderabad', 'Mumbai', 'Chennai', 'Bengaluru', 'Delhi', 'Kolkata', 'Vijayawada'],
    names: ['Ananya Rao', 'Rahul Kumar', 'Priya Sharma', 'Vikramaditya Roy', 'Nandini Patel', 'Arjun Varma', 'Tanvi Deshmukh', 'Kiran Bedi Rao', 'Divya Nair', 'Harshavardhan Sen'],
    regions: ['Telangana', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Delhi NCR', 'West Bengal', 'Andhra Pradesh']
  },
  {
    country: 'USA',
    flag: '🇺🇸',
    cities: ['Austin', 'New York', 'Los Angeles', 'Chicago', 'Seattle'],
    names: ['Marcus Vance', 'Elena Rostova', 'Julian Hayes', 'Maya Lin Peterson', 'Chloe Bennet', 'Darius Washington', 'Sarah Jenkins'],
    regions: ['Texas', 'New York', 'California', 'Illinois', 'Washington']
  },
  {
    country: 'UK',
    flag: '🇬🇧',
    cities: ['London', 'Manchester', 'Bristol', 'Edinburgh'],
    names: ['Oliver Thorne', 'Freya Campbell', 'Arthur Pendelton', 'Isla MacLeod', 'Rowan Davies', 'Callum Hughes'],
    regions: ['Greater London', 'Greater Manchester', 'South West England', 'Scotland']
  },
  {
    country: 'UAE',
    flag: '🇦🇪',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
    names: ['Fatima Al-Mansoor', 'Tariq Hashimi', 'Zainab Al-Nuaimi', 'Omar Kattan', 'Layla Bin Zayed'],
    regions: ['Dubai Emirate', 'Abu Dhabi', 'Sharjah Cultural District']
  },
  {
    country: 'Japan',
    flag: '🇯🇵',
    cities: ['Tokyo', 'Kyoto', 'Osaka', 'Fukuoka'],
    names: ['Kenji Takahashi', 'Aoi Moriyama', 'Ren Fujimoto', 'Sakura Endo', 'Daiki Watanabe', 'Mio Yoshimoto'],
    regions: ['Kanto', 'Kansai', 'Kansai', 'Kyushu']
  },
  {
    country: 'Nigeria',
    flag: '🇳🇬',
    cities: ['Lagos', 'Abuja', 'Ibadan'],
    names: ['Chidubem Okonkwo', 'Amara Eze', 'Folake Adeleke', 'Babatunde Alabi', 'Ngozi Chimamanda'],
    regions: ['Lagos State', 'Federal Capital Territory', 'Oyo State']
  },
  {
    country: 'Germany',
    flag: '🇩🇪',
    cities: ['Berlin', 'Munich', 'Hamburg', 'Cologne'],
    names: ['Lukas Weber', 'Greta Hoffmann', 'Maximilian Krause', 'Hannah Becker', 'Niklas Vogel'],
    regions: ['Berlin-Brandenburg', 'Bavaria', 'Hamburg', 'North Rhine-Westphalia']
  },
  {
    country: 'Australia',
    flag: '🇦🇺',
    cities: ['Melbourne', 'Sydney', 'Brisbane', 'Perth'],
    names: ['Liam O\'Connor', 'Sienna Wright', 'Jarrah Mundine', 'Harper Brooks', 'Kai Fletcher'],
    regions: ['Victoria', 'New South Wales', 'Queensland', 'Western Australia']
  },
  {
    country: 'Brazil',
    flag: '🇧🇷',
    cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
    names: ['Mateus Silva', 'Beatriz Guimarães', 'Thiago Moreira', 'Camila Cavalcanti', 'Gabriel Fonseca'],
    regions: ['São Paulo State', 'Rio de Janeiro', 'Distrito Federal', 'Bahia']
  },
  {
    country: 'South Korea',
    flag: '🇰🇷',
    cities: ['Seoul', 'Busan', 'Daegu', 'Gwangju'],
    names: ['Min-Jun Park', 'So-Hee Kang', 'Ji-Hoon Choi', 'Eun-Ji Song', 'Hyun-Woo Lee'],
    regions: ['Seoul Capital Area', 'Yeongnam', 'Daegu', 'Honam']
  },
  {
    country: 'Morocco',
    flag: '🇲🇦',
    cities: ['Marrakech', 'Fez', 'Casablanca', 'Rabat'],
    names: ['Yassine Benali', 'Kenza Tazi', 'Hamza El-Idrissi', 'Salma Bouhaddou', 'Mehdi Chraibi'],
    regions: ['Marrakech-Safi', 'Fès-Meknès', 'Casablanca-Settat', 'Rabat-Salé-Kénitra']
  },
  {
    country: 'Canada',
    flag: '🇨🇦',
    cities: ['Vancouver', 'Toronto', 'Montreal', 'Calgary'],
    names: ['Noah Tremblay', 'Zoé Gagnon', 'Aiden Roy', 'Maeve Campbell', 'Lucas Bouchard'],
    regions: ['British Columbia', 'Ontario', 'Quebec', 'Alberta']
  },
  {
    country: 'Mexico',
    flag: '🇲🇽',
    cities: ['Mexico City', 'Oaxaca', 'Guadalajara', 'Monterrey'],
    names: ['Diego Morales', 'Ximena Cruz', 'Emiliano Herrera', 'Valeria Solís', 'Santiago Ramos'],
    regions: ['CDMX', 'Oaxaca', 'Jalisco', 'Nuevo León']
  },
  {
    country: 'Kenya',
    flag: '🇰🇪',
    cities: ['Nairobi', 'Mombasa', 'Kisumu'],
    names: ['Kiprono Bett', 'Achieng Odera', 'Wanjiru Kamau', 'Mwangi Ndungu', 'Zawadi Muthoni'],
    regions: ['Nairobi County', 'Coast Province', 'Nyanza']
  },
  {
    country: 'Sweden',
    flag: '🇸🇪',
    cities: ['Stockholm', 'Gothenburg', 'Malmö'],
    names: ['Astrid Lindqvist', 'Elias Bergström', 'Freja Nygård', 'Axel Holm', 'Ebba Söderberg'],
    regions: ['Stockholm County', 'Västra Götaland', 'Skåne']
  },
  {
    country: 'Thailand',
    flag: '🇹🇭',
    cities: ['Chiang Mai', 'Bangkok', 'Chiang Rai'],
    names: ['Somchai Prasert', 'Kanya Rattana', 'Tanawat Siriporn', 'Narin Wongsuwan', 'Ploypailin Suksom'],
    regions: ['Chiang Mai Province', 'Bangkok Metropolis', 'Chiang Rai Province']
  },
  {
    country: 'Argentina',
    flag: '🇦🇷',
    cities: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza'],
    names: ['Facundo Gomez', 'Lucia Fernandez', 'Ignacio Beltran', 'Martina Rossi', 'Joaquin Alvarez'],
    regions: ['Buenos Aires CABA', 'Córdoba Province', 'Santa Fe', 'Cuyo']
  },
  {
    country: 'France',
    flag: '🇫🇷',
    cities: ['Paris', 'Lyon', 'Marseille'],
    names: ['Camille Dupont', 'Julien Moreau', 'Léa Roche', 'Théo Laurent', 'Manon Bernard'],
    regions: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur']
  },
  {
    country: 'Italy',
    flag: '🇮🇹',
    cities: ['Rome', 'Milan', 'Florence'],
    names: ['Matteo De Luca', 'Chiara Conti', 'Lorenzo Ferri', 'Giulia Marini', 'Alessio Moretti'],
    regions: ['Lazio', 'Lombardy', 'Tuscany']
  },
  {
    country: 'South Africa',
    flag: '🇿🇦',
    cities: ['Cape Town', 'Johannesburg', 'Durban'],
    names: ['Sipho Ndlovu', 'Zola Mthembu', 'Pieter Van Der Merwe', 'Nandi Khumalo', 'Lebo Moloi'],
    regions: ['Western Cape', 'Gauteng', 'KwaZulu-Natal']
  },
  {
    country: 'Spain',
    flag: '🇪🇸',
    cities: ['Madrid', 'Barcelona', 'Valencia'],
    names: ['Alba Navarro', 'Carlos Serrano', 'Irene Domínguez', 'Pablo Ramos', 'Lucía Vega'],
    regions: ['Comunidad de Madrid', 'Catalonia', 'Comunidad Valenciana']
  },
  {
    country: 'Colombia',
    flag: '🇨🇴',
    cities: ['Bogotá', 'Medellín', 'Cartagena'],
    names: ['Andrés Restrepo', 'Valentina Jaramillo', 'Camilo Orozco', 'Isabela Quintero', 'Felipe Arboleda'],
    regions: ['Bogotá D.C.', 'Antioquia', 'Bolívar']
  },
  {
    country: 'Egypt',
    flag: '🇪🇬',
    cities: ['Cairo', 'Alexandria', 'Luxor'],
    names: ['Nour El-Din', 'Mariam Farouk', 'Karim Mansour', 'Hoda Abdel-Rahman', 'Sherif Zaki'],
    regions: ['Cairo Governorate', 'Alexandria Governorate', 'Luxor']
  },
  {
    country: 'Vietnam',
    flag: '🇻🇳',
    cities: ['Hanoi', 'Ho Chi Minh City', 'Da Nang'],
    names: ['Nguyen Minh Tri', 'Tran Thi Mai', 'Le Hoang Nam', 'Pham Quynh Anh', 'Vo Thanh Tung'],
    regions: ['Red River Delta', 'Southeast', 'South Central Coast']
  }
];

const DISCIPLINES = [
  { category: 'Visual Art', title: 'Visual Artist & Cultural Storyteller', medium: 'Oil on Canvas & Mixed Media' },
  { category: 'Photography', title: 'Documentary & Architectural Photographer', medium: 'Medium Format Film & Archival Stills' },
  { category: 'Digital Art', title: 'Generative AI & Computational Artist', medium: '3D Spatial Shaders & TouchDesigner' },
  { category: 'Design', title: 'Botanical & Print Textile Designer', medium: 'Linocut & Hand-Screened Pigments' },
  { category: '3D / Animation', title: 'Spatial 3D & Virtual World Sculptor', medium: 'Blender, Cinema4D & Realtime Unreal' },
  { category: 'Film', title: 'Cinematic Visualist & Short Film Director', medium: '16mm Analog & High-Definition Color Grading' },
  { category: 'Music', title: 'Acoustic Soundscape & Modular Composer', medium: 'Modular Synthesizers & Field Recordings' },
  { category: 'Writing', title: 'Literary & Typographic Poet', medium: 'Handset Letterpress & Archival Ink' }
];

console.log('Generating 115 artists and 115 artworks...');

const allArtists = [];
const allArtworks = [];
let artistCounter = 1;
let artworkCounter = 1;

// Cycle through the regions to generate 115 distinct artists
for (let rIdx = 0; rIdx < REGIONS_DATA.length; rIdx++) {
  const reg = REGIONS_DATA[rIdx];
  // Allocate 4 to 6 artists per country
  const countForThisRegion = (rIdx < 19) ? 5 : 4;

  for (let c = 0; c < countForThisRegion; c++) {
    const artistId = `artist-${artistCounter}`;
    const name = reg.names[c % reg.names.length] + (c >= reg.names.length ? ` (Studio ${c+1})` : '');
    const city = reg.cities[c % reg.cities.length];
    const subRegion = reg.regions[c % reg.regions.length];
    const discipline = DISCIPLINES[(artistCounter - 1) % DISCIPLINES.length];
    const coverUrl = getCover(artistCounter);
    const avatarUrl = getAvatar(artistCounter);

    const emailName = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const artist = {
      id: artistId,
      name: name,
      email: `${emailName}@artverse.demo`,
      role: 'artist',
      title: discipline.title,
      location: `${city}, ${reg.country}`,
      region: subRegion,
      country: reg.country,
      category: discipline.category,
      experience: (artistCounter % 2 === 0 ? 'Professional' : (artistCounter % 3 === 0 ? 'Beginner' : 'Emerging')),
      availability: (artistCounter % 3 === 0) ? 'Busy' : (artistCounter % 4 === 0 ? 'Available from Nov 2026' : 'Available'),
      bio: `Rooted in the living heritage of ${city} and ${subRegion}, exploring ${discipline.category.toLowerCase()} intersections across regional traditions and contemporary global discourse.`,
      statement: `Art is our cultural imprint upon time — a dialogue between ancestral technique in ${reg.country} and future horizons.`,
      skills: ['Composition', 'Exhibition Design', 'Concept Art', 'Color Curation', 'Creative Direction'],
      tags: [reg.country, discipline.category, 'Global Stage', city, 'Contemporary Art'],
      achievements: [
        `${reg.country} National Visual Arts Spotlight 2025`,
        `Featured in Artverse Global Stage Collection`,
        `Selected for International Residency ${2025 + (artistCounter % 2)}`
      ],
      socialLinks: {
        instagram: `https://instagram.com/artverse.${emailName}`,
        behance: `https://behance.net/${emailName}`,
        website: `https://${emailName.replace(/\./g, '')}.art`
      },
      avatar: avatarUrl,
      coverImage: coverUrl,
      followersCount: 650 + ((artistCounter * 47) % 3200),
      profileViews: 4200 + ((artistCounter * 123) % 18000),
      artworkViews: 12000 + ((artistCounter * 345) % 45000),
      viewsGrowth: `+${20 + ((artistCounter * 3) % 45)}%`,
      engagementGrowth: `+${15 + ((artistCounter * 5) % 35)}%`,
      isRising: artistCounter % 3 === 1,
      isFeatured: artistCounter % 2 === 0 || artistCounter <= 10,
      isTrending: artistCounter % 4 === 0,
      createdAt: `2026-0${1 + (artistCounter % 3)}-${10 + (artistCounter % 18)}`
    };

    allArtists.push(artist);

    // Each artist gets at least 1 rich artwork
    const artworkId = `art-${artworkCounter}`;
    const artImg = getArtworkImage(artworkCounter);
    const artTitles = [
      `Symphony of ${city}`,
      `Echoes of ${reg.country}`,
      `Horizon in ${subRegion}`,
      `Resonance No. ${artworkCounter}`,
      `Chromatic Meditation of ${city}`,
      `Ancestral Solitude`,
      `The Golden Hour at ${city}`,
      `Luminous Fragments`,
      `Passage to ${reg.country}`,
      `Topography of Memory`
    ];
    const artTitle = artTitles[(artworkCounter - 1) % artTitles.length];

    const artwork = {
      id: artworkId,
      title: artTitle,
      artistId: artistId,
      artistName: artist.name,
      artistAvatar: artist.avatar,
      artistLocation: artist.location,
      imageUrl: artImg,
      description: `A profound ${discipline.category.toLowerCase()} meditation rooted in ${city}, ${reg.country}. Created with ${discipline.medium.toLowerCase()} to capture the tactile spirit of the locale.`,
      category: discipline.category,
      medium: discipline.medium,
      tags: [reg.country, discipline.category, 'Featured', city, 'Original'],
      likesCount: 140 + ((artworkCounter * 31) % 920),
      savesCount: 50 + ((artworkCounter * 19) % 480),
      viewsCount: 1800 + ((artworkCounter * 113) % 9400),
      commentsCount: 12 + ((artworkCounter * 7) % 85),
      isFeatured: artworkCounter % 2 === 1,
      createdAt: `2026-0${1 + (artworkCounter % 3)}-${12 + (artworkCounter % 16)}`
    };

    allArtworks.push(artwork);
    artistCounter++;
    artworkCounter++;
  }
}

console.log(`Generated ${allArtists.length} Artists and ${allArtworks.length} Artworks!`);

// Read opportunities, notifications, collaborations, comments from original mockData
const originalContent = fs.readFileSync(mockDataPath, 'utf8');

const oppMatch = originalContent.indexOf('export const INITIAL_OPPORTUNITIES: Opportunity[] = [');
const restOfFile = originalContent.slice(oppMatch);

// Build new updated GLOBAL_STAGE_REGIONS with real dynamic counts
const updatedRegions = REGIONS_DATA.map(reg => {
  const countInList = allArtists.filter(a => a.country.toLowerCase() === reg.country.toLowerCase()).length;
  return `  { country: '${reg.country}', flag: '${reg.flag}', count: ${countInList * 120 + 240}, cities: ${JSON.stringify(reg.cities)} }`;
}).join(',\n');

const newRegionsCode = `export const GLOBAL_STAGE_REGIONS = [\n${updatedRegions}\n];\n`;

// Replace the end of restOfFile which has export const GLOBAL_STAGE_REGIONS
const regIndex = restOfFile.indexOf('export const GLOBAL_STAGE_REGIONS = [');
const restWithoutOldRegions = restOfFile.slice(0, regIndex);
const finalRest = restWithoutOldRegions + newRegionsCode;

const newMockDataContent = `import { Artist, Artwork, Opportunity, CollaborationRequest, Comment, NotificationItem } from '../types';

export const INITIAL_ARTISTS: Artist[] = ${JSON.stringify(allArtists, null, 2)};

export const INITIAL_ARTWORKS: Artwork[] = ${JSON.stringify(allArtworks, null, 2)};

${finalRest}`;

fs.writeFileSync(mockDataPath, newMockDataContent, 'utf8');
console.log('Successfully wrote expanded mockData.ts!');
