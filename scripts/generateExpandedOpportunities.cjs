const fs = require('fs');
const path = require('path');

const mockDataPath = path.resolve(__dirname, '../src/data/mockData.ts');
const content = fs.readFileSync(mockDataPath, 'utf8');

// Org logo pool
const ORG_LOGOS = [
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=120&q=80'
];

const CATEGORIES = [
  'Grants',
  'Exhibitions',
  'Competitions',
  'Freelance',
  'Jobs',
  'Collaborations',
  'Internships',
  'Workshops',
  'Scholarships'
];

const OPPORTUNITY_TEMPLATES = [
  // Grants
  {
    category: 'Grants',
    titles: [
      'Global Emerging Visual Arts Biennial Grant 2026',
      'Deccan Voices: Hyderabad Cultural Heritage Production Grant',
      'International Digital Ecology & Bio-Art Fellowship Grant',
      'Pacific Rim Indigenous & Contemporary Artists Seed Grant',
      'Mediterranean Narrative & Documentary Photo Fellowship',
      'Latin American Mural & Public Art Civic Grant',
      'Nordic Light Architecture & Ephemeral Stills Grant',
      'Sub-Saharan Contemporary Storytelling Production Grant',
      'Southeast Asian Textile & Botanical Heritage Grant',
      'Kyoto Traditional Master & Contemporary Apprentice Grant',
      'Transatlantic Experimental Sound & Visual Installation Fund',
      'Independent Women in Visual Arts Creation Award'
    ],
    orgs: [
      'Artverse Foundation & Lumina Studios',
      'Telangana Visual Heritage Trust',
      'Geneva Digital Bio-Art Council',
      'Pacific Contemporary Guild',
      'Fondation Méditerranée pour l’Art',
      'São Paulo Public Arts Commission',
      'Stockholm Contemporary Light Foundation',
      'Lagos Contemporary Arts Initiative',
      'Bangkok Silk & Craft Council',
      'Kyoto Heritage & Arts Foundation',
      'London Sound & Vision Trust',
      'Global Women Artists Alliance'
    ],
    comps: ['₹1,50,000 Grant (~$1,800 USD)', '₹2,50,000 Production Grant', '€8,500 Full Production Budget', '$12,000 USD Creation Fellowship', '₹3,00,000 Grant + Studio Residency', '£6,000 International Travel & Studio Fund'],
    modes: ['Hybrid', 'Online', 'Offline', 'Hybrid']
  },
  // Exhibitions
  {
    category: 'Exhibitions',
    titles: [
      'Venice Parallel Biennial: Global South Emerging Pavilions',
      'Paris Salon de la Nouvelle Photographie Curated Showcase',
      'Tokyo Shibuya Spatial Shaders & Generative Art Triennial',
      'London Saatchi Gallery Emerging Voices Autumn Exhibition',
      'New York Chelsea Contemporary Solo Showcase Open Call',
      'Berlin Kunsthalle Transmedia Visions Exhibition',
      'Seoul Modern Hanji & Generative Code Pavilion',
      'Melbourne National Gallery Southern Skies Showcase',
      'Dubai Alserkal Avenue Regional Masters & Newcomers',
      'Oaxaca Indigenous Pigment & Clay National Exhibition',
      'Cape Town Zeitz MOCAA Young Curators Selection',
      'Toronto Nuit Blanche Architectural Night Projections'
    ],
    orgs: [
      'Venice Biennale Affiliate Curators',
      'Société des Photographes de Paris',
      'Tokyo Shibuya Media Arts Institute',
      'Saatchi Emerging Guild',
      'Chelsea Modern Gallery Consortium',
      'Berlin Kunsthalle Contemporary',
      'Seoul Arts Center Foundation',
      'Melbourne Art Foundation',
      'Alserkal Cultural Development',
      'Oaxaca Cultural Institute',
      'Zeitz MOCAA Collaborative',
      'City of Toronto Culture Division'
    ],
    comps: ['Full Exhibition Curation & Catalog inclusion', '€4,000 Artist Stipend + Shipping covered', 'Exhibition in Chelsea NYC Gallery + Press', '₹1,00,000 Artist Fee + Travel Assistance', 'Tokyo Solo Showcase + VIP Collector Dinner', 'Catalog publication + International sales representation'],
    modes: ['Offline', 'Hybrid', 'Offline', 'Hybrid']
  },
  // Competitions
  {
    category: 'Competitions',
    titles: [
      'Global Portraiture & Human Condition Prize 2026',
      'International Generative AI & Spatial Canvas Championship',
      'Worldwide Monochromatic Street Photography Award',
      'International Sustainable Architecture & Ephemeral Pavilion Design',
      'Contemporary Ceramic Sculpture Open Trophy',
      'The New Typography & Typeface Design Global Prize',
      'Global Eco-Visuals Wildlife & Habitat Lens Trophy',
      'Narrative Short Form Graphic Novel & Storyboard Prize',
      'Abstract Expressionism in the Digital Age Competition',
      'Kinetic & Sound Installation Global Challenge',
      'National Folk Motif Contemporary Reinterpretation Trophy',
      'Avant-Garde Fashion & Wearable Sculpture Award'
    ],
    orgs: [
      'International Society of Contemporary Painters',
      'ACM SIGGRAPH Cultural Chapter',
      'Magnum Legacy Forum',
      'World Architecture & Ephemeral Arts Forum',
      'International Ceramicists Academy',
      'Type Directors Club Affiliate',
      'Earth Visuals Preservation Guild',
      'Comic Arts & Graphic Narrative Alliance',
      'Digital Abstract Foundation',
      'Sound & Kinetic Research Institute',
      'Indian Craft & Design Council',
      'Milan Haute Creative Forum'
    ],
    comps: ['$15,000 Grand Prize + Trophy', '€10,000 First Place + Global Tour', '₹2,00,000 Cash Prize + Publication', '$8,000 Production Award', '₹1,50,000 Gold Medal + Solo Show', '£7,500 Innovation Prize'],
    modes: ['Online', 'Online', 'Hybrid', 'Online']
  },
  // Freelance
  {
    category: 'Freelance',
    titles: [
      'Lead Visual Identity & Cultural Motifs for Heritage Luxury Hotel',
      'Editorial Cover Illustration Series for International Literary Review',
      '3D Spatial Environment & Virtual Gallery for Venice Pavilion',
      'Brand Identity & Custom Typographic Alphabet for Craft Distillery',
      'Documentary Photo Essay on Himalayan Artisan Weavers',
      'Generative Motion Visuals for Ambient Electronica World Tour',
      'Curatorial Essay Writing & Bilingual Art Book Translation',
      'Hand-Painted Botanical Pattern Collection for Sustainable Textile Label',
      'Interactive WebGL Visual Experience for Contemporary Art Fair',
      'Sculptural Trophy Commission for Global Sustainability Summit',
      'Character & World Concept Art for Indian Mythology Video Game',
      'Public Mural Commission for Tech Campus Innovation Atrium'
    ],
    orgs: [
      'The Oberoi Heritage Group',
      'The Atlantic Cultural Bureau',
      'Venice Virtual Arts Collective',
      'Highland Craft Spirits',
      'National Geographic Explorer Guild',
      'Warp Records Sound Labs',
      'Phaidon International Press',
      'FabIndia Eco Collective',
      'Art Basel Digital Services',
      'World Sustainability Forum',
      'Nodding Heads Interactive',
      'T-Hub Hyderabad Innovation Campus'
    ],
    comps: ['₹1,80,000 Fixed Contract', '₹95,000 Editorial Package', '$6,500 USD Project Scope', '€4,200 Deliverable Contract', '₹2,20,000 + Travel & Accommodations', '$8,000 USD Full Stage Package'],
    modes: ['Online', 'Hybrid', 'Online', 'Offline']
  },
  // Jobs
  {
    category: 'Jobs',
    titles: [
      'Head of Curatorial Programming & Artist Relations',
      'Senior 3D Environmental Artist & Shader Architect',
      'Resident Master Printmaker & Lithography Studio Manager',
      'Creative Director of Visual Narrative & Brand Storytelling',
      'Assistant Professor of Contemporary Mixed Media & South Asian Art',
      'Principal Spatial Designer & Exhibition Architect',
      'Lead Typography & Editorial Design Specialist',
      'Director of Digital Collections & Archival Preservation',
      'Art Director for Immersive Dome Projections',
      'Community Arts Educator & Youth Workshop Facilitator',
      'Studio Assistant for Internationally Represented Sculptor',
      'Senior Art Conservator & Material Restorationist'
    ],
    orgs: [
      'Kiran Nadar Museum of Art (KNMA)',
      'Epic Games Virtual Production Lab',
      'Edinburgh Printmakers Workshop',
      'Vogue India Creative Studio',
      'National Institute of Design (NID)',
      'Foster + Partners Spatial Arts Group',
      'Penguin Random House International',
      'The British Museum Digital Labs',
      'Satosphere Immersive Dome Montreal',
      'Pratham Arts Education Foundation',
      'Anish Kapoor Studio Affiliate',
      'National Gallery of Modern Art (NGMA)'
    ],
    comps: ['₹18,00,000 - ₹24,00,000 / year', '$110,000 - $130,000 USD / year', '£38,000 - £44,000 / year + Studio', '₹15,00,000 - ₹20,00,000 / year', '₹12,00,000 / year + Research Grant', '€65,000 - €75,000 / year'],
    modes: ['Hybrid', 'Hybrid', 'Offline', 'Offline', 'Offline', 'Hybrid']
  },
  // Collaborations
  {
    category: 'Collaborations',
    titles: [
      'Cross-Disciplinary Sound & Ceramic Sculpture Installation',
      'Generative AI Code Meets Ancient Kanchipuram Silk Weaving',
      'Bio-Luminescent Mycelium & Kinetic Origami Spatial Pavilion',
      'Sitar Polyphony Meets Modular Synthesizer Album Collaboration',
      'Poetry of Migration: Calligraphy & Street Muralism Synergy',
      'Architectural Clay & VR Headset Experience Co-Creation',
      'Contemporary Kathak Dance & Interactive Particle Projection',
      'Sustainable Dye Chemistry & Haute Couture Runway Collaboration',
      'Indigenous Amazonian Pigments & Blockchain Archival Provenance',
      'Documentary Cinema & Experimental Ambient Cello Score',
      'Ceramic Tea Vessels Meets Japanese Woodblock Printmaker',
      'Large-scale Public Light Installation & Community Choir'
    ],
    orgs: [
      'Artverse Cross-Stage Labs',
      'Madras Craft & Tech Collaborative',
      'MIT Media Lab Bio-Art Group',
      'Bhoomi Sound Research Circle',
      'Berlin Wall Urban Canvas Network',
      'Kyoto Clay & Silicon Guild',
      'Natya Shastra Contemporary Ensemble',
      'Paris Sustainable Fashion Week',
      'Amazonian Forest Preservation Artists',
      'Sundance Institute Sound Fellows',
      'Kyoto-London Artisan Bridge',
      'Reykjavik Light Festival'
    ],
    comps: ['Co-ownership & Equal Profit Split', '₹1,20,000 Production Seed Fund each', '€3,500 Travel Stipend per collaborator', 'Studio Space & Gallery Commission covered', '50/50 Revenue + Grant Support', 'Joint Residency in Kyoto (Full funding)'],
    modes: ['Hybrid', 'Online', 'Hybrid', 'Offline']
  },
  // Internships
  {
    category: 'Internships',
    titles: [
      'Curatorial & Gallery Archival Summer Internship',
      '3D CGI & Virtual Set Production Traineeship',
      'Traditional Lithography & Hand-Binding Apprenticeship',
      'Museum Public Programming & Community Engagement Fellowship',
      'Fine Art Photography Studio & Darkroom Internship',
      'Digital Art Platform Product & Community Operations Intern',
      'Heritage Textile Conservation & Natural Dye Research Intern',
      'Art Fair VIP Relations & Collector Services Trainee',
      'Sculpture Foundry Bronze Casting Apprentice',
      'Editorial Art Journalism & Art Criticism Junior Fellow',
      'Immersive Media & Unreal Engine Creative Technologist Intern',
      'Ceramic Glaze Chemistry & Kiln Master Apprenticeship'
    ],
    orgs: [
      'Guggenheim International Internship Program',
      'The Mill Spatial Media Studio',
      'Spike Island Printmakers Bristol',
      'Smithsonian Institution Affiliate',
      'Magnum Photos Tokyo Bureau',
      'Artverse Engineering & Curation Lab',
      'Saris of India Heritage Archives',
      'India Art Fair Curatorial Team',
      'Pangolin Editions Bronze Foundry',
      'Frieze Magazine Editorial Wing',
      'Ars Electronica Futurelab',
      'Golden Bridge Pottery Pondicherry'
    ],
    comps: ['₹35,000 / month Stipend', '$2,200 USD / month Stipend', '£1,400 / month + Studio Access', '₹40,000 / month Stipend', '€1,200 / month + Housing', '₹30,000 / month Remote Stipend'],
    modes: ['Hybrid', 'Hybrid', 'Offline', 'Offline', 'Offline', 'Online']
  },
  // Workshops
  {
    category: 'Workshops',
    titles: [
      'Masterclass: Archival Platinum Palladium Printing Intensive',
      'TouchDesigner & GLSL Shaders for Immersive Live Stages',
      'Japanese Woodblock Moku-Hanga Carving & Printing Workshop',
      'Natural Mineral Pigments & Tempera Fresco Preparation',
      'Experimental Typography & Risograph Print Publication Bootcamp',
      'Large-scale Aerosol & Architectural Trompe-l’œil Techniques',
      'Soundscape Field Recording & Sonic Cartography Seminar',
      'Ceramic Wood-Firing & Anagama Kiln 4-Day Immersion',
      'Documentary Visual Storytelling & Photobook Sequencing',
      'Hand-Spun Indigo Vats & Shibori Resist Dyeing Intensive',
      'Sculpting Digital Clay in ZBrush for Physical Bronze 3D Printing',
      'Curatorial Proposal Writing & International Biennial Pitches'
    ],
    orgs: [
      'Deccan Photography Guild',
      'Berlin Live Coding Society',
      'Kyoto Craft Master Guild',
      'Florence Classical Arts Academy',
      'London Riso Collective',
      'Wynwood Mural Arts Workshop',
      'BBC Sound Archives Researcher Network',
      'Kashmir Clay Research Kiln',
      'Aperture Foundation Educational Wing',
      'Jaipur Block Print Heritage Center',
      'Royal College of Art Digital Lab',
      'International Curators Network'
    ],
    comps: ['Certificate + Portfolio Review with Master Curators', 'Free for Shortlisted Emerging Creators', 'Hands-on Materials & Kiln Access included', '₹15,000 Honorarium for Teaching Assistants', 'All Tools, Pigments & Papers provided', 'International Continuing Arts Accreditation'],
    modes: ['Hybrid', 'Online', 'Offline', 'Offline', 'Hybrid', 'Offline']
  },
  // Scholarships
  {
    category: 'Scholarships',
    titles: [
      'Royal Academy of Arts Post-Graduate Full Fellowship',
      'Rhode Island School of Design Global South Creator Scholarship',
      'Tokyo University of the Arts International Urushi Lacquer Fellowship',
      'Le Fresnoy Studio National des Arts Contemporains Scholarship',
      'National Institute of Design Master of Visual Storytelling Award',
      'Slade School of Fine Art Emerging Masters Bursary',
      'Milan Domus Academy Creative Direction & Future Arts Scholarship',
      'CalArts Experimental Sound & Interactive Media Grant',
      'Universität der Künste Berlin Transdisciplinary Arts Award',
      'Central Saint Martins Innovation in Textile & Materiality Bursary',
      'École Nationale Supérieure des Beaux-Arts Paris Merit Scholarship',
      'Santiniketan Kala Bhavana Folk & Contemporary Heritage Award'
    ],
    orgs: [
      'Royal Academy of Arts Trust',
      'RISD International Diversity Council',
      'Monbukagakusho (MEXT) Arts Council',
      'Ministère de la Culture France',
      'Ministry of Education & NID',
      'UCL Slade Art Trust',
      'Domus International Foundation',
      'Walt Disney Arts Philanthropy Fund',
      'DAAD German Academic Exchange',
      'UAL Central Saint Martins Trust',
      'Beaux-Arts Paris Endowment',
      'Visva-Bharati University Kala Bhavana'
    ],
    comps: ['Full Tuition Fee Waiver + £18,000 / yr Living Stipend', '100% Tuition + $22,000 / yr Living Grant', 'Full MEXT Scholarship + ¥145,000 / mo + Airfare', '€15,000 / yr Production + Studio Residence', 'Full Tuition + ₹25,000 / mo Living Allowance', 'Full Fees Covered + £16,500 Annual Stipend'],
    modes: ['Offline', 'Offline', 'Offline', 'Offline', 'Offline', 'Offline']
  }
];

const LOCATIONS = [
  'Hyderabad, India', 'Milan, Italy & Online', 'London, UK', 'New York, USA', 'Tokyo, Japan',
  'Berlin, Germany', 'Paris, France', 'São Paulo, Brazil', 'Seoul, South Korea', 'Kyoto, Japan',
  'Lagos, Nigeria', 'Oaxaca, Mexico', 'Stockholm, Sweden', 'Melbourne, Australia', 'Bangkok, Thailand',
  'Mumbai, India', 'Edinburgh, UK', 'Toronto, Canada', 'Cape Town, South Africa', 'Bengaluru, India',
  'Amsterdam, Netherlands', 'Austin, Texas, USA', 'Buenos Aires, Argentina', 'Geneva, Switzerland',
  'Florence, Italy', 'Kolkata, India', 'Nairobi, Kenya', 'Cairo, Egypt', 'Vienna, Austria'
];

console.log('Building 108 comprehensive Opportunities...');

const opportunities = [];
let oppId = 1;

for (const tmpl of OPPORTUNITY_TEMPLATES) {
  for (let i = 0; i < tmpl.titles.length; i++) {
    const title = tmpl.titles[i];
    const org = tmpl.orgs[i % tmpl.orgs.length];
    const comp = tmpl.comps[i % tmpl.comps.length];
    const mode = tmpl.modes[i % tmpl.modes.length];
    const loc = LOCATIONS[(oppId * 3) % LOCATIONS.length];
    const logo = ORG_LOGOS[oppId % ORG_LOGOS.length];

    const months = ['November 15, 2026', 'December 1, 2026', 'December 15, 2026', 'January 10, 2027', 'January 25, 2027', 'February 15, 2027'];
    const deadline = months[oppId % months.length];

    opportunities.push({
      id: `opp-${oppId}`,
      title: title,
      organization: org,
      orgLogo: logo,
      category: tmpl.category,
      location: loc,
      mode: mode,
      deadline: deadline,
      compensation: comp,
      prize: comp.includes('Prize') || comp.includes('Trophy') ? comp : undefined,
      description: `Official open call by ${org}. Seeking visionary creators pushing cultural, aesthetic, and conceptual boundaries. Selected candidates will gain international exposure, curatorial mentorship, and dedicated production support.`,
      requirements: [
        'Original creative portfolio (3-8 documented works)',
        'Artist bio and 200-word conceptual proposal',
        'Demonstrated commitment to cultural storytelling or technical excellence'
      ],
      eligibility: oppId % 3 === 0 ? 'Emerging artists with under 5 years practice' : 'Open to all international artists worldwide',
      tags: [tmpl.category, loc.split(',')[0], mode, 'Curated', 'Artverse Verified'],
      applyUrl: `https://artverse.org/apply/opp-${oppId}`,
      featured: oppId % 5 === 0 || oppId <= 6,
      createdAt: `2026-0${1 + (oppId % 3)}-${10 + (oppId % 18)}`
    });

    oppId++;
  }
}

console.log(`Generated ${opportunities.length} Opportunities.`);

// 80+ Comments across artworks
console.log('Building 80+ realistic community Comments...');
const comments = [];
const COMMENT_TEXTS = [
  'The brushwork and cultural depth here are genuinely breathtaking. The interplay between texture and light is extraordinary.',
  'Such a distinctive voice! This reminds me of the traditional masterworks yet feels completely contemporary.',
  'Would love to feature this in our upcoming international exhibition catalog. Sent a direct curator inquiry!',
  'The tonal harmony in this piece is hypnotic. What specific pigments or medium did you use for the shadows?',
  'Incredible depth of emotion. You captured the exact spirit of the region with pure authenticity.',
  'This is museum caliber. Looking forward to seeing more works from this series!',
  'The digital rendering feels completely tactile and alive. Exceptional concept and execution.',
  'Stunning composition. The framing draws the eye right through every generational layer of the story.',
  'Pure visual poetry. Proud to see our cultural heritage represented so powerfully on the global stage.',
  'The contrast between stillness and energy here is masterfully balanced. Brilliant work!'
];

for (let c = 1; c <= 85; c++) {
  const artNum = 1 + (c % 115);
  const userNum = 1 + ((c * 3) % 115);
  comments.push({
    id: `comm-${c}`,
    artworkId: `art-${artNum}`,
    userId: `artist-${userNum}`,
    userName: `Creator ${userNum}`,
    userAvatar: `https://images.unsplash.com/photo-${1500000000000 + (c * 10000)}?auto=format&fit=crop&w=200&q=80`,
    text: COMMENT_TEXTS[c % COMMENT_TEXTS.length],
    createdAt: `2026-02-${10 + (c % 18)}`
  });
}

// 30+ Collaborations
console.log('Building 30+ rich Collaboration Requests...');
const collaborations = [];
const COLLAB_PROJECTS = [
  { title: 'Deccan Clay & Sound Polyphony', type: 'Sound & Sculpture Co-Creation', budget: '₹1,50,000 Seed Grant' },
  { title: 'Sub-Saharan & South Asian Textile Convergence', type: 'Cross-Border Textile Exhibition', budget: '€4,000 Cultural Fund' },
  { title: 'Generative Shaders Meets Classical Kathak', type: 'Immersive Particle Projection', budget: '$6,500 Production Budget' },
  { title: 'Monochromatic Architectural Archive Book', type: 'Collaborative Photobook', budget: '£3,200 Publishing Advance' },
  { title: 'Venice Pavilion Parallel Metaverse Room', type: 'Spatial 3D Virtual Gallery', budget: '$8,000 Tech Grant' }
];

for (let col = 1; col <= 32; col++) {
  const p = COLLAB_PROJECTS[col % COLLAB_PROJECTS.length];
  const senderId = `artist-${1 + (col % 60)}`;
  const receiverId = `artist-${1 + ((col * 2 + 5) % 115)}`;
  const statuses = ['pending', 'accepted', 'pending', 'accepted', 'declined'];

  collaborations.push({
    id: `collab-${col}`,
    senderId: senderId,
    senderName: `Artist ${senderId.replace('artist-', '')}`,
    senderEmail: `artist.${senderId}@artverse.demo`,
    senderAvatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
    receiverId: receiverId,
    receiverName: `Artist ${receiverId.replace('artist-', '')}`,
    artworkId: `art-${1 + (col % 115)}`,
    opportunityId: `opp-${1 + (col % 20)}`,
    projectTitle: `${p.title} (Vol. ${col})`,
    projectDescription: `Collaborative research and production proposal for ${p.type}. Merging traditional techniques with contemporary global presentation.`,
    type: p.type,
    requiredSkills: ['Creative Direction', 'Composition', 'Material Research'],
    message: `Greetings! I have been following your exceptional portfolio on Artverse and see immense potential in synthesizing our practices for an upcoming international submission. Let us connect!`,
    budget: p.budget,
    timeline: `${2 + (col % 4)} months`,
    status: statuses[col % statuses.length],
    createdAt: `2026-02-${10 + (col % 15)}`
  });
}

// 25+ Real-time Notifications
console.log('Building 25+ Notifications...');
const notifications = [];
const NOTIF_TYPES = [
  { type: 'follower', title: 'New Creator Follower', msg: 'started following your curated visual portfolio.' },
  { type: 'like', title: 'Artwork Appreciation', msg: 'liked your artwork.' },
  { type: 'save', title: 'Artwork Saved to Collection', msg: 'saved your piece to their private inspiration board.' },
  { type: 'comment', title: 'New Curator Comment', msg: 'left a critique and curator note on your artwork.' },
  { type: 'collaboration', title: 'New Collaboration Request', msg: 'sent you a joint exhibition and production proposal.' },
  { type: 'opp_recommendation', title: 'AI Match for Grant', msg: 'Your portfolio scored a 96% match with Global Emerging Biennial Grant.' },
  { type: 'deadline', title: 'Application Deadline Approaching', msg: 'The deadline for Deccan Voices Production Grant closes in 3 days.' }
];

for (let n = 1; n <= 28; n++) {
  const item = NOTIF_TYPES[n % NOTIF_TYPES.length];
  notifications.push({
    id: `notif-${n}`,
    type: item.type,
    title: item.title,
    message: `Curator & Artist Elena Rostova ${item.msg}`,
    time: `${n * 2} hours ago`,
    read: n > 8,
    link: n % 2 === 0 ? '/opportunities' : '/explore'
  });
}

// Now inject into mockData.ts
// Keep artists and artworks untouched, replace opportunities, notifications, collaborations, comments!
const oppIndex = content.indexOf('export const INITIAL_OPPORTUNITIES: Opportunity[] = [');
const beforeOpps = content.slice(0, oppIndex);

// Keep GLOBAL_STAGE_REGIONS intact at the end
const regIndex = content.indexOf('export const GLOBAL_STAGE_REGIONS = [');
const regionsCode = content.slice(regIndex);

const newFileContent = `${beforeOpps}export const INITIAL_OPPORTUNITIES: Opportunity[] = ${JSON.stringify(opportunities, null, 2)};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = ${JSON.stringify(notifications, null, 2)};

export const INITIAL_COLLABORATIONS: CollaborationRequest[] = ${JSON.stringify(collaborations, null, 2)};

export const INITIAL_COMMENTS: Comment[] = ${JSON.stringify(comments, null, 2)};

${regionsCode}`;

fs.writeFileSync(mockDataPath, newFileContent, 'utf8');
console.log('Successfully written expanded opportunities, comments, collaborations, and notifications!');
