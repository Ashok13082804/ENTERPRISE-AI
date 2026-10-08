/**
 * AI Image Studio Presets & Library
 * Exhaustive data for all 30 Categories, Photographic Controls, Character Controls,
 * Typography, College Project Architecture, Collage Layouts, and Sample Projects.
 */
import { CategoryDefinition, CollageSettings, StudioProject } from '@/types/imageStudio';

// ==============================================================================
// 30 Complete Categories & All Subtypes Library
// ==============================================================================

export const ALL_30_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'cat_01',
    number: 1,
    name: 'Art & Illustration',
    iconName: 'Palette',
    description: 'Traditional and modern artistic mediums, digital paintings, sketches, and comic art.',
    accentColor: 'from-pink-500 to-rose-500',
    recommendedAspect: '1:1',
    suggestedPrompt: 'A vibrant fantasy forest landscape with mystical glowing plants and flowing rivers',
    subtypes: [
      'Digital Painting', 'Pencil Sketch', 'Charcoal Drawing', 'Watercolor Painting',
      'Oil Painting', 'Acrylic Painting', 'Ink Drawing', 'Line Art',
      'Cartoon Illustration', 'Comic Art', 'Manga', 'Anime-style Artwork',
      'Chibi Characters', 'Pixel Art', 'Vector-style Illustration', 'Minimalist Art',
      'Abstract Art', 'Surrealism', 'Pop Art', 'Concept Art', 'Fantasy Art',
      'Folk Art', 'Traditional-art Styles'
    ]
  },
  {
    id: 'cat_02',
    number: 2,
    name: 'Photorealistic Images',
    iconName: 'Camera',
    description: 'High-end studio photography, cinema grade portraits, drone shots and macro lenses.',
    accentColor: 'from-blue-500 to-cyan-500',
    recommendedAspect: '3:2',
    suggestedPrompt: 'Cinematic portrait of a cyberpunk explorer with neon reflections, 85mm f/1.4 lens, shallow depth of field',
    subtypes: [
      'Portraits', 'Professional Headshots', 'Fashion Photography', 'Product Photography',
      'Food Photography', 'Nature Photography', 'Wildlife Photography', 'Landscape Photography',
      'Architecture Photography', 'Street Photography', 'Studio Photography',
      'Wedding-style Photography', 'Travel Photography', 'Cinematic Photography',
      'Aerial/Drone-style Photography', 'Historical-looking Photographs'
    ]
  },
  {
    id: 'cat_03',
    number: 3,
    name: 'People & Characters',
    iconName: 'Users',
    description: 'Human heroes, game avatars, androids, mythological figures and character model sheets.',
    accentColor: 'from-amber-500 to-orange-500',
    recommendedAspect: '3:4',
    suggestedPrompt: 'Full body character sheet of a futuristic mech pilot with cybernetic helmet and exoskeleton armor',
    subtypes: [
      'Human Characters', 'Fictional Characters', 'Game Characters', 'Fantasy Characters',
      'Superheroes', 'Villains', 'Robots', 'Androids', 'Aliens',
      'Mythological Characters', 'Medieval Characters', 'Historical Figures/Styles',
      'Character Sheets', 'Character Poses', 'Character Expressions',
      'Character Costumes', 'Avatars', 'Virtual Influencers'
    ]
  },
  {
    id: 'cat_04',
    number: 4,
    name: 'Architecture & Interior Design',
    iconName: 'Building2',
    description: 'Modern luxury villas, smart offices, interior floorplans and architectural renders.',
    accentColor: 'from-emerald-500 to-teal-500',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Modern minimalist luxury living room with floor-to-ceiling glass windows overlooking Tokyo skyline at dusk',
    subtypes: [
      'Houses', 'Apartments', 'Villas', 'Offices', 'Classrooms', 'Hospitals',
      'Hotels', 'Restaurants', 'Cafes', 'Shopping Malls', 'Smart Homes',
      'Bedrooms', 'Living Rooms', 'Kitchens', 'Gaming Rooms', 'Server Rooms',
      'Modern Buildings', 'Futuristic Cities', 'Interior Concepts', 'Exterior Concepts',
      'Floor-plan Visualization', 'Architectural Rendering', 'Furniture Arrangement'
    ]
  },
  {
    id: 'cat_05',
    number: 5,
    name: 'Nature & Environment',
    iconName: 'Trees',
    description: 'Majestic mountain ranges, tranquil lakes, bioluminescent rainforests and sunsets.',
    accentColor: 'from-green-500 to-emerald-600',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Panoramic view of snowy mountains reflecting in a mirror-still alpine lake during vibrant golden hour',
    subtypes: [
      'Mountains', 'Beaches', 'Forests', 'Waterfalls', 'Rivers', 'Lakes',
      'Deserts', 'Snow Landscapes', 'Gardens', 'Islands', 'Volcanoes',
      'Caves', 'Rainforests', 'Sunsets', 'Sunrises', 'Night Skies',
      'Aurora Borealis', 'Underwater Environments'
    ]
  },
  {
    id: 'cat_06',
    number: 6,
    name: 'Sci-Fi & Futuristic',
    iconName: 'Rocket',
    description: 'Cyberpunk metropolis, space stations, Dyson spheres, AI labs and quantum holograms.',
    accentColor: 'from-violet-500 to-purple-600',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Futuristic AI laboratory with holographic interfaces, robotic arms, cinematic lighting, ultra-detailed environment',
    subtypes: [
      'Futuristic Cities', 'Space Stations', 'Spaceships', 'Planets', 'Galaxies',
      'Black Holes', 'Cyberpunk Cities', 'Robots', 'AI Laboratories',
      'Futuristic Vehicles', 'Holograms', 'Virtual Reality Worlds',
      'Futuristic Interfaces', 'Space Colonies'
    ]
  },
  {
    id: 'cat_07',
    number: 7,
    name: 'Fantasy',
    iconName: 'Sparkles',
    description: 'Mythical dragons, ancient spellcaster towers, enchanted forests and magical relics.',
    accentColor: 'from-purple-500 to-fuchsia-600',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Majestic celestial dragon wrapped around a glowing crystal castle floating above cloud kingdoms',
    subtypes: [
      'Dragons', 'Wizards', 'Elves', 'Magical Kingdoms', 'Castles',
      'Mythical Creatures', 'Fairies', 'Magic Environments', 'Enchanted Forests',
      'Fantasy Warriors', 'Ancient Kingdoms', 'Fantasy Maps'
    ]
  },
  {
    id: 'cat_08',
    number: 8,
    name: 'Historical & Cultural',
    iconName: 'Landmark',
    description: 'Ancient empires, archaeological wonders, renaissance courts and cultural festivals.',
    accentColor: 'from-amber-600 to-yellow-600',
    recommendedAspect: '4:3',
    suggestedPrompt: 'Historical reconstruction of an ancient Roman forum bustling with merchants and marble colonnades',
    subtypes: [
      'Ancient Civilizations', 'Ancient Cities', 'Historical Architecture',
      'Medieval Environments', 'Traditional Clothing', 'Cultural Festivals',
      'Historical Scenes', 'Archaeological Reconstructions', 'Traditional Villages',
      'Museum-style Reconstructions'
    ]
  },
  {
    id: 'cat_09',
    number: 9,
    name: 'Technology & Computer Images',
    iconName: 'Cpu',
    description: 'Neural networks, quantum processors, supercomputers, cloud nodes and robotics.',
    accentColor: 'from-cyan-500 to-blue-600',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Glowing neural network synapse mesh fusing into an illuminated quantum computing processor core',
    subtypes: [
      'AI Concepts', 'Machine Learning Concepts', 'Neural Networks', 'Data Centers',
      'Cloud Computing', 'Cybersecurity', 'Blockchain', 'IoT', 'Robotics',
      'Programming Concepts', 'Software Development', 'Digital Transformation',
      'Quantum Computing', 'Digital Brains', 'AI Robots'
    ]
  },
  {
    id: 'cat_10',
    number: 10,
    name: 'Diagrams & Educational Images',
    iconName: 'Network',
    description: 'Flowcharts, block schemas, system architecture, ER diagrams and scientific diagrams.',
    accentColor: 'from-sky-500 to-indigo-500',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Comprehensive system architecture flowchart showing client gateway, microservices, Kafka queue and distributed DB',
    subtypes: [
      'Flowcharts', 'Block Diagrams', 'System Architecture', 'Network Diagrams',
      'UML Diagrams', 'ER Diagrams', 'Mind Maps', 'Process Diagrams',
      'Infographics', 'Timelines', 'Scientific Diagrams', 'Educational Illustrations',
      'Biology Diagrams', 'Physics Diagrams', 'Chemistry Diagrams', 'Mathematical Illustrations'
    ]
  },
  {
    id: 'cat_11',
    number: 11,
    name: 'UI/UX & Software Design',
    iconName: 'Layout',
    description: 'Modern mobile app layouts, SaaS enterprise dashboards, glassmorphic dark-mode web mockups.',
    accentColor: 'from-indigo-500 to-violet-500',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Ultra-modern dark mode fintech dashboard UI with real-time financial charts, balance cards and neon accents',
    subtypes: [
      'Website UI', 'Mobile App UI', 'Dashboard UI', 'Admin Panels', 'Login Screens',
      'Signup Screens', 'Profile Screens', 'E-commerce Interfaces', 'Banking Interfaces',
      'AI Dashboards', 'Data Analytics Dashboards', 'Cybersecurity Dashboards',
      'Game Interfaces', 'Dark-mode Interfaces', 'Light-mode Interfaces',
      'Wireframes', 'Design Mockups', 'Landing Pages'
    ]
  },
  {
    id: 'cat_12',
    number: 12,
    name: 'Business & Marketing',
    iconName: 'Briefcase',
    description: 'Minimalist brand logos, business cards, YouTube thumbnails, banner ads and flyers.',
    accentColor: 'from-blue-600 to-indigo-700',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Sleek luxury brand identity mockups including embossed business card, stationery and stationery set',
    subtypes: [
      'Logos', 'Brand Identity Concepts', 'Business Cards', 'Posters',
      'Advertisements', 'Product Banners', 'Social-media Posts', 'YouTube Thumbnails',
      'Presentation Graphics', 'Brochures', 'Flyers', 'Event Posters',
      'Infographics', 'Promotional Graphics', 'Website Banners'
    ]
  },
  {
    id: 'cat_13',
    number: 13,
    name: 'Books & Publishing',
    iconName: 'BookOpen',
    description: 'Sci-fi fantasy novel covers, children storybook artwork, chapter illustrations and comics.',
    accentColor: 'from-rose-500 to-pink-600',
    recommendedAspect: '2:3',
    suggestedPrompt: 'Bestseller epic fantasy book cover featuring an illuminated sword embedded in a crystalline throne',
    subtypes: [
      'Book Covers', 'Magazine Covers', 'Children\'s Books', 'Story Illustrations',
      'Educational Books', 'Comics', 'Graphic Novels', 'Chapter Illustrations',
      'Character Illustrations', 'Maps for Books'
    ]
  },
  {
    id: 'cat_14',
    number: 14,
    name: 'Games',
    iconName: 'Gamepad2',
    description: 'Pixel art sprites, isometric level tiles, boss monsters, weapon sheets and 3D concept art.',
    accentColor: 'from-fuchsia-500 to-pink-500',
    recommendedAspect: '16:9',
    suggestedPrompt: '2D pixel art isometric dungeon tileset with lava pits, treasure chests, gargoyle pillars and stairs',
    subtypes: [
      'Game Characters', 'Game Environments', 'Game Maps', 'Game Backgrounds',
      'Game Assets', 'Weapons/Items', 'Vehicles', 'Buildings', 'Boss Characters',
      'NPCs', 'Game Icons', 'Game Logos', 'Loading Screens', 'Game UI',
      '2D Sprites', '3D Concept Art'
    ]
  },
  {
    id: 'cat_15',
    number: 15,
    name: 'Movies & Entertainment',
    iconName: 'Clapperboard',
    description: 'Theatrical blockbuster posters, cinematic scenes, music album art and storyboard animatics.',
    accentColor: 'from-red-500 to-rose-600',
    recommendedAspect: '2:3',
    suggestedPrompt: 'Cinematic sci-fi movie poster with towering interstellar stargate, astronaut silhouette, title typography space',
    subtypes: [
      'Movie Posters', 'Film Concepts', 'Cinematic Scenes', 'Storyboards',
      'Character Concepts', 'Fantasy Scenes', 'Sci-fi Scenes', 'Horror Scenes',
      'Action Scenes', 'Historical Scenes', 'Music-video Concepts', 'Album Covers'
    ]
  },
  {
    id: 'cat_16',
    number: 16,
    name: 'Fashion',
    iconName: 'Sparkle',
    description: 'Haute couture runway outfits, sarees, modern streetwear, jewelry and model lookbooks.',
    accentColor: 'from-purple-400 to-pink-500',
    recommendedAspect: '3:4',
    suggestedPrompt: 'High-fashion editorial photo of a model in an avant-garde iridescent metallic trench coat on a Paris street',
    subtypes: [
      'Clothing Designs', 'Fashion Models', 'Dresses', 'Sarees', 'Suits',
      'Streetwear', 'Sportswear', 'Traditional Clothing', 'Jewelry', 'Shoes',
      'Handbags', 'Fashion Catalogues', 'Runway Concepts'
    ]
  },
  {
    id: 'cat_17',
    number: 17,
    name: 'Food & Restaurant',
    iconName: 'Utensils',
    description: 'Gourmet culinary photography, fine dining interiors, artisan pastries and cocktail ads.',
    accentColor: 'from-orange-500 to-amber-500',
    recommendedAspect: '4:3',
    suggestedPrompt: 'Close-up gourmet photography of a multi-layered chocolate mousse cake with gold leaf and raspberry glaze',
    subtypes: [
      'Food Photography', 'Restaurant Interiors', 'Menu Designs', 'Recipe Illustrations',
      'Food Advertisements', 'Product Packaging', 'Cakes', 'Desserts',
      'Beverages', 'Traditional Cuisines'
    ]
  },
  {
    id: 'cat_18',
    number: 18,
    name: 'Vehicles',
    iconName: 'Car',
    description: 'Electric supercars, supersonic jets, robotic drones, bullet trains and yachts.',
    accentColor: 'from-blue-500 to-cyan-600',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Futuristic matte black autonomous electric hypercar with glowing cyan LED headlights parked in wet city street',
    subtypes: [
      'Cars', 'Motorcycles', 'Buses', 'Trucks', 'Trains', 'Ships', 'Boats',
      'Aircraft', 'Helicopters', 'Drones', 'Spaceships', 'Concept Vehicles',
      'Autonomous Vehicles', 'Electric Vehicles'
    ]
  },
  {
    id: 'cat_19',
    number: 19,
    name: 'Science & Medicine',
    iconName: 'Atom',
    description: 'DNA double helix strands, cellular microscopy, anatomical models and medical robotics.',
    accentColor: 'from-teal-500 to-cyan-500',
    recommendedAspect: '1:1',
    suggestedPrompt: '3D microscopic visualization of a glowing DNA double helix structure with molecular bonds and particles',
    subtypes: [
      'Anatomy Illustrations', 'Medical Diagrams', 'Laboratory Environments',
      'Microscopic Concepts', 'DNA Illustrations', 'Cells', 'Viruses',
      'Molecular Structures', 'Medical Equipment', 'Scientific Visualization',
      'Space Science', 'Chemistry Concepts', 'Physics Concepts'
    ]
  },
  {
    id: 'cat_20',
    number: 20,
    name: 'Agriculture',
    iconName: 'Sprout',
    description: 'Automated smart farming fields, hydroponic greenhouses, agricultural inspection drones.',
    accentColor: 'from-green-600 to-emerald-700',
    recommendedAspect: '16:9',
    suggestedPrompt: 'High-tech greenhouse with vertical hydroponic towers and automated sensor-guided harvesting robots',
    subtypes: [
      'Farms', 'Smart Farming', 'Crop Fields', 'Irrigation Systems',
      'Agricultural Drones', 'Plant Diseases', 'Crop Monitoring',
      'Greenhouses', 'Precision Agriculture', 'Agricultural Machinery'
    ]
  },
  {
    id: 'cat_21',
    number: 21,
    name: 'Cybersecurity',
    iconName: 'Shield',
    description: 'Hacker command terminals, SOC threat maps, digital cryptographic locks and zero-trust mesh.',
    accentColor: 'from-cyan-400 to-emerald-500',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Security Operations Center (SOC) room with huge curved monitors tracking global cyber threat matrices in real time',
    subtypes: [
      'Cybersecurity Dashboards', 'Hacker-themed Conceptual Scenes',
      'Network Security Diagrams', 'Digital Locks', 'Encryption Concepts',
      'Blockchain Concepts', 'Secure File Systems', 'Digital Forensics',
      'Security Operations Centers', 'Threat Visualization'
    ]
  },
  {
    id: 'cat_22',
    number: 22,
    name: 'Documents & Professional Materials',
    iconName: 'FileCheck',
    description: 'Graduation certificates, resumes, corporate ID badges, letterheads and presentation decks.',
    accentColor: 'from-slate-500 to-gray-700',
    recommendedAspect: '4:3',
    suggestedPrompt: 'Elegant gold-foiled graduation certificate with ornate border, crest and formal calligraphy layout',
    subtypes: [
      'Certificates', 'Resumes', 'Business Cards', 'ID-card Concepts',
      'Reports', 'Brochures', 'Posters', 'Invitations', 'Letterheads',
      'Presentation Slides', 'Infographics'
    ]
  },
  {
    id: 'cat_23',
    number: 23,
    name: 'Social Media',
    iconName: 'Share2',
    description: 'Viral Instagram carousels, TikTok vertical banners, YouTube thumbnails and Twitter headers.',
    accentColor: 'from-pink-600 to-purple-600',
    recommendedAspect: '9:16',
    suggestedPrompt: 'Bold high-CTR YouTube thumbnail design with expressive avatar, glowing neon text backdrop and contrast sparkles',
    subtypes: [
      'Instagram Posts', 'Instagram Stories', 'YouTube Thumbnails',
      'LinkedIn Graphics', 'X/Twitter Graphics', 'Facebook Posts',
      'Pinterest Graphics', 'Profile Pictures', 'Banners', 'Memes', 'Quote Cards'
    ]
  },
  {
    id: 'cat_24',
    number: 24,
    name: 'Product & Industrial Design',
    iconName: 'Package',
    description: 'Sleek aluminum laptop concepts, ergonomic smartwatches, designer chairs and packaging.',
    accentColor: 'from-amber-500 to-stone-600',
    recommendedAspect: '1:1',
    suggestedPrompt: '3D studio render of a luxury titanium smartwatch with curved sapphire crystal glass on a slate podium',
    subtypes: [
      'Product Concepts', 'Smartphones', 'Laptops', 'Smartwatches',
      'Furniture', 'Electronics', 'Packaging', 'Industrial Machines',
      'Medical Devices', 'Consumer Products', '3D Product Renders'
    ]
  },
  {
    id: 'cat_25',
    number: 25,
    name: 'Maps & World Building',
    iconName: 'Map',
    description: 'Fantasy realm cartography, parchment treasure maps, metro transit routes and campus blueprints.',
    accentColor: 'from-amber-700 to-yellow-800',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Aged parchment fantasy world map showing mountains, kingdoms, sea monsters and compass rose',
    subtypes: [
      'World Maps', 'Fantasy Maps', 'City Maps', 'Game Maps',
      'Campus Maps', 'Treasure Maps', 'Geographic Illustrations',
      'Transportation Maps', 'Historical Maps'
    ]
  },
  {
    id: 'cat_26',
    number: 26,
    name: '3D & Rendered Images',
    iconName: 'Box',
    description: 'Blender clay sculpts, isometric low-poly scenes, miniature dioramas and vinyl toy characters.',
    accentColor: 'from-indigo-600 to-purple-700',
    recommendedAspect: '1:1',
    suggestedPrompt: 'Cute 3D isometric diorama of a cozy Japanese coffee shop with soft clay textures and pastel lighting',
    subtypes: [
      '3D Characters', '3D Objects', '3D Environments', 'Product Renders',
      'Architectural Renders', 'Isometric Scenes', 'Low-poly Models',
      'Clay Renders', 'Toy Designs', 'Figurines', 'Dioramas'
    ]
  },
  {
    id: 'cat_27',
    number: 27,
    name: 'Special Visual Effects',
    iconName: 'Flame',
    description: 'Particle bursts, glowing plasma energy, lightning arcs, liquid metal and holographic flares.',
    accentColor: 'from-yellow-500 to-red-600',
    recommendedAspect: '16:9',
    suggestedPrompt: 'Dynamic swirl of cosmic plasma fire and electric blue lightning colliding in dark space with glowing particles',
    subtypes: [
      'Glowing Effects', 'Neon Effects', 'Fire', 'Smoke', 'Lightning',
      'Holographic Effects', 'Glass Effects', 'Metallic Effects',
      'Liquid Effects', 'Particle Effects', 'Energy Effects', 'Magical Effects'
    ]
  },
  {
    id: 'cat_28',
    number: 28,
    name: 'AI Image Editing & Transformation',
    iconName: 'Wand2',
    description: 'Photo-to-art transformations (20+ styles), background removal, object inpainting and color grading.',
    accentColor: 'from-emerald-400 to-cyan-500',
    recommendedAspect: '1:1',
    suggestedPrompt: 'Transform photo into delicate watercolor painting with soft fluid wash and fine pencil contours',
    subtypes: [
      'Photo → Digital Painting', 'Photo → Pencil Sketch', 'Photo → Charcoal',
      'Photo → Watercolor', 'Photo → Oil Painting', 'Photo → Acrylic',
      'Photo → Ink Drawing', 'Photo → Line Art', 'Photo → Cartoon',
      'Photo → Comic', 'Photo → Manga', 'Photo → Anime-style Artwork',
      'Photo → Chibi', 'Photo → Pixel Art', 'Photo → Vector-style Illustration',
      'Photo → Minimalist Art', 'Photo → Abstract Art', 'Photo → Surreal Artwork',
      'Photo → Pop-art Style', 'Photo → Fantasy Art', 'Photo → 3D Render'
    ]
  },
  {
    id: 'cat_29',
    number: 29,
    name: 'Academic & College Project Visualization',
    iconName: 'GraduationCap',
    description: 'Final-year project architectures, system workflows, database schemas, thesis posters and PPT mockups.',
    accentColor: 'from-blue-600 to-indigo-600',
    recommendedAspect: '16:9',
    suggestedPrompt: 'College final year project architecture diagram: React frontend, FastAPI backend, ChromaDB vector store, Llama3 LLM',
    subtypes: [
      'Project Architecture Diagrams', 'Flowcharts', 'System Workflows',
      'Database Diagrams (ERD)', 'UML Diagrams', 'Research Figures',
      'Project Posters', 'PPT Illustrations', 'Prototype Screens',
      'Mobile-app Mockups', 'AI Architecture', 'ML Pipeline Diagrams',
      'RAG Architecture', 'Cybersecurity Architecture', 'Blockchain Architecture'
    ]
  },
  {
    id: 'cat_30',
    number: 30,
    name: 'AI/ML Visualization',
    iconName: 'Brain',
    description: 'Deep neural networks, Agentic-AI loops, RAG workflows, computer vision pipelines and training telemetry.',
    accentColor: 'from-fuchsia-600 to-indigo-600',
    recommendedAspect: '16:9',
    suggestedPrompt: 'End-to-end Agentic AI workflow showing Multi-Agent coordinator, tool execution sandbox, vector RAG, evaluator loop',
    subtypes: [
      'Neural-network Diagrams', 'Machine-learning Pipelines', 'RAG Pipelines',
      'LLM Architecture Concepts', 'Agentic-AI Workflows', 'AI Agents',
      'Computer Vision Pipelines', 'NLP Pipelines', 'Data-processing Pipelines',
      'Training Workflows', 'Model Deployment Diagrams', 'AI Dashboards'
    ]
  }
];


// ==============================================================================
// Photographic Controls Presets
// ==============================================================================

export const PHOTO_CAMERAS = [
  'Sony A7R V (61MP Full-Frame)',
  'Canon EOS R5 (8K Cinema)',
  'Hasselblad H6D-100c (Medium Format)',
  'Leica M11 Rangefinder',
  'Nikon Z9 Flagship',
  'Fujifilm GFX 100 II'
];

export const PHOTO_LENSES = [
  '85mm f/1.2 Portrait Prime',
  '50mm f/1.4 Nifty Fifty',
  '24-70mm f/2.8 Pro Zoom',
  '70-200mm f/2.8 Telephoto',
  '16-35mm f/2.8 Ultra-Wide',
  '100mm f/2.8 Macro Lens'
];

export const PHOTO_LIGHTING = [
  'Cinematic Volumetric Lighting',
  'Golden Hour Warm Sunlight',
  'Studio 3-Point Softbox Lighting',
  'Moody Chiaroscuro Low-Key',
  'Cyberpunk Neon Rim Lighting',
  'Natural Diffused Window Light',
  'Dramatic Spotlight',
  'Bioluminescent Ambient Glow'
];

export const PHOTO_ANGLES = [
  'Eye-Level Direct',
  'Low Angle (Heroic & Powerful)',
  'High Angle (Birds-Eye)',
  'Extreme Close-Up Macro',
  'Dutch Angle (Dynamic Tilt)',
  'Wide Establishing Shot',
  'Over-the-Shoulder',
  'Drone Aerial View'
];


// ==============================================================================
// Typography / Font Presets
// ==============================================================================

export const FONT_PRESETS = [
  { id: 'inter', name: 'Inter (Professional)', family: 'Inter, sans-serif', category: 'Professional' },
  { id: 'outfit', name: 'Outfit (Modern)', family: 'Outfit, sans-serif', category: 'Modern' },
  { id: 'montserrat', name: 'Montserrat (Bold Minimal)', family: 'Montserrat, sans-serif', category: 'Minimal' },
  { id: 'caveat', name: 'Caveat (Handwritten)', family: 'Caveat, cursive', category: 'Handwritten' },
  { id: 'bangers', name: 'Bangers (Comic Pop)', family: 'Bangers, cursive', category: 'Comic' },
  { id: 'playfair', name: 'Playfair Display (Serif Luxury)', family: '"Playfair Display", serif', category: 'Serif' },
  { id: 'cinzel', name: 'Cinzel (Decorative Royal)', family: 'Cinzel, serif', category: 'Decorative' },
  { id: 'fira-code', name: 'Fira Code (Monospace Tech)', family: '"Fira Code", monospace', category: 'Monospace' }
];


// ==============================================================================
// Shape and Sticker Library
// ==============================================================================

export const SHAPE_PRESETS = [
  { id: 'rect', name: 'Rectangle', shapeType: 'rectangle' as const, icon: 'Square' },
  { id: 'circle', name: 'Circle', shapeType: 'circle' as const, icon: 'Circle' },
  { id: 'triangle', name: 'Triangle', shapeType: 'triangle' as const, icon: 'Triangle' },
  { id: 'star', name: 'Star', shapeType: 'star' as const, icon: 'Star' },
  { id: 'heart', name: 'Heart', shapeType: 'heart' as const, icon: 'Heart' },
  { id: 'arrow', name: 'Arrow', shapeType: 'arrow' as const, icon: 'ArrowRight' },
  { id: 'speech_bubble', name: 'Speech Bubble', shapeType: 'speech_bubble' as const, icon: 'MessageSquare' },
  { id: 'badge', name: 'Badge', shapeType: 'badge' as const, icon: 'Award' }
];

export const STICKER_PRESETS = [
  { id: 'st_ai', label: 'AI Powered', emoji: '✨' },
  { id: 'st_fire', label: 'Trending', emoji: '🔥' },
  { id: 'st_verified', label: 'Verified', emoji: '✅' },
  { id: 'st_rocket', label: 'Fast Launch', emoji: '🚀' },
  { id: 'st_crown', label: 'Premium', emoji: '👑' },
  { id: 'st_bulb', label: 'Idea', emoji: '💡' },
  { id: 'st_robot', label: 'Automation', emoji: '🤖' },
  { id: 'st_heart', label: 'Favorite', emoji: '💖' }
];


// ==============================================================================
// Collage Templates Library
// ==============================================================================

export const COLLAGE_LAYOUTS = [
  { id: 'grid_2', name: '2 Split Grid', icon: 'Columns2', count: 2, desc: 'Side-by-side balanced dual comparison' },
  { id: 'grid_3', name: '3 Hero Grid', icon: 'LayoutGrid', count: 3, desc: '1 prominent top banner + 2 sub-tiles' },
  { id: 'grid_4', name: '4 Classic Grid', icon: 'Grid2X2', count: 4, desc: 'Even 2x2 quadruple composition' },
  { id: 'grid_6', name: '6 Story Mosaic', icon: 'Grid3X3', count: 6, desc: '3x2 gallery grid layout' },
  { id: 'grid_9', name: '9 Matrix', icon: 'Grid3X3', count: 9, desc: '3x3 Instagram tile matrix' },
  { id: 'grid_12', name: '12 Catalog', icon: 'LayoutGrid', count: 12, desc: 'Compact product showcase layout' },
  { id: 'polaroid', name: 'Polaroid Trio', icon: 'Image', count: 3, desc: 'Tilted retro polaroid prints with shadows' },
  { id: 'photo_wall', name: 'Modern Photo Wall', icon: 'Layers', count: 4, desc: 'Dynamic masonry aesthetic gallery wall' },
  { id: 'magazine', name: 'Magazine Editorial', icon: 'BookOpen', count: 3, desc: 'High-fashion editorial layout' }
];


// ==============================================================================
// Negative Prompt Presets
// ==============================================================================

export const DEFAULT_NEGATIVE_PROMPTS: Record<string, string> = {
  general: 'blurry, low quality, distorted anatomy, unwanted objects, bad proportions, watermark, noisy, extra limbs, ugly, duplicate artifacts',
  portrait: 'deformed eyes, asymmetrical face, extra fingers, poorly drawn hands, plastic skin, bad teeth, blurry, low resolution',
  architecture: 'crooked pillars, collapsing walls, distorted perspective, impossible geometry, blurry textures, bad lighting',
  diagram: 'unreadable text, cluttered lines, confusing layout, low contrast, pixelated text, cut off labels',
  scifi: 'low polygon, primitive textures, muddy colors, bad lighting, blurry neon'
};


// ==============================================================================
// Sample Projects for Immediate Exploration
// ==============================================================================

export const SAMPLE_PROJECTS: StudioProject[] = [
  {
    id: 'proj_ai_portrait',
    name: 'AI Cyberpunk Explorer Portrait',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    canvas: { width: 1024, height: 1024, backgroundColor: '#0f172a' },
    layers: [
      {
        id: 'layer_bg',
        name: 'Cyberpunk Portrait',
        type: 'image',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
        x: 0,
        y: 0,
        width: 1024,
        height: 1024,
        rotation: 0,
        zIndex: 1,
        src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1024&auto=format&fit=crop&q=80'
      },
      {
        id: 'layer_badge',
        name: 'Neon Frame Badge',
        type: 'shape',
        visible: true,
        locked: false,
        opacity: 0.85,
        blendMode: 'screen',
        x: 60,
        y: 840,
        width: 420,
        height: 120,
        rotation: 0,
        zIndex: 2,
        shapeType: 'rectangle',
        fillColor: '#090d16',
        strokeColor: '#00f0ff',
        strokeWidth: 2,
        cornerRadius: 16
      },
      {
        id: 'layer_title',
        name: 'Cyber Title Text',
        type: 'text',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
        x: 90,
        y: 875,
        width: 360,
        height: 50,
        rotation: 0,
        zIndex: 3,
        text: 'NEXUS-07 // CYBERPUNK',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 24,
        fontColor: '#00f0ff',
        fontWeight: 700,
        textShadow: true,
        shadowColor: '#00f0ff',
        shadowBlur: 10
      }
    ],
    promptHistory: [
      {
        prompt: 'Futuristic cyberpunk portrait of a female explorer with glowing neural implants and neon reflection',
        timestamp: '2026-09-26 12:00',
        category: 'Photorealistic Images',
        style: 'Cinematic Photography'
      }
    ],
    createdAt: '2026-09-26',
    updatedAt: '2026-09-26'
  },
  {
    id: 'proj_college_diagram',
    name: 'College Project: CaseChain Architecture',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    canvas: { width: 1280, height: 720, backgroundColor: '#0b132b' },
    layers: [
      {
        id: 'diag_bg',
        name: 'Architecture Blueprint',
        type: 'shape',
        visible: true,
        locked: true,
        opacity: 1,
        blendMode: 'normal',
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        rotation: 0,
        zIndex: 0,
        shapeType: 'rectangle',
        fillColor: '#0b132b'
      },
      {
        id: 'diag_title',
        name: 'Project Header',
        type: 'text',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
        x: 60,
        y: 50,
        width: 800,
        height: 60,
        rotation: 0,
        zIndex: 1,
        text: 'CaseChain: Decentralized Judicial Evidence Tracking System',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 28,
        fontColor: '#38bdf8',
        fontWeight: 700
      },
      {
        id: 'node_1',
        name: 'Node: Client Gateway',
        type: 'shape',
        visible: true,
        locked: false,
        opacity: 0.9,
        blendMode: 'normal',
        x: 100,
        y: 200,
        width: 260,
        height: 120,
        rotation: 0,
        zIndex: 2,
        shapeType: 'rectangle',
        fillColor: '#1e293b',
        strokeColor: '#38bdf8',
        strokeWidth: 2,
        cornerRadius: 12
      },
      {
        id: 'node_1_text',
        name: 'Gateway Label',
        type: 'text',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
        x: 130,
        y: 245,
        width: 200,
        height: 40,
        rotation: 0,
        zIndex: 3,
        text: 'React 18 + Tailwind Client',
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontColor: '#ffffff',
        fontWeight: 600
      },
      {
        id: 'node_2',
        name: 'Node: FastAPI Core',
        type: 'shape',
        visible: true,
        locked: false,
        opacity: 0.9,
        blendMode: 'normal',
        x: 510,
        y: 200,
        width: 260,
        height: 120,
        rotation: 0,
        zIndex: 2,
        shapeType: 'rectangle',
        fillColor: '#1e293b',
        strokeColor: '#818cf8',
        strokeWidth: 2,
        cornerRadius: 12
      },
      {
        id: 'node_2_text',
        name: 'FastAPI Label',
        type: 'text',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
        x: 540,
        y: 245,
        width: 200,
        height: 40,
        rotation: 0,
        zIndex: 3,
        text: 'FastAPI Microservices',
        fontFamily: 'Inter, sans-serif',
        fontSize: 16,
        fontColor: '#ffffff',
        fontWeight: 600
      }
    ],
    promptHistory: [
      {
        prompt: 'College project architecture diagram: React frontend, FastAPI backend, ChromaDB vector store, Llama3 LLM',
        timestamp: '2026-09-26 14:30',
        category: 'Academic & College Project Visualization',
        style: 'Project Architecture Diagrams'
      }
    ],
    createdAt: '2026-09-26',
    updatedAt: '2026-09-26'
  }
];
