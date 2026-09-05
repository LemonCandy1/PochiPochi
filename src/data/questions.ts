import { CategoryInfo, Question } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'science',
    label: 'Science',
    themeTag: 'STEM & Nature',
    iconName: 'flask-conical',
    description: 'Physics, Astronomy, Biology & Chemistry',
  },
  {
    id: 'geography',
    label: 'Geography',
    themeTag: 'World & Maps',
    iconName: 'globe-2',
    description: 'Capitals, Natural Wonders & Topography',
  },
  {
    id: 'anime',
    label: 'Anime & Manga',
    themeTag: 'Comics & Lore',
    iconName: 'sparkles',
    description: 'Shonen Classics, Ghibli & Pop Culture',
  },
  {
    id: 'general',
    label: 'General Knowledge',
    themeTag: 'History & Arts',
    iconName: 'book-open',
    description: 'World History, Literature & Curiosities',
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  // SCIENCE
  {
    id: 'sci-001',
    category: 'science',
    clue_text:
      'With atomic number 79, this transition metal was revered in ancient Egypt as the flesh of the sun gods, remains non-reactive to oxygen, and is represented by the Latin symbol Au.',
    answer: 'GOLD',
    answer_mask_length: 4,
    options: ['GOLD', 'SILVER', 'COPPER', 'PLATINUM'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Gold',
    context_summary:
      'Gold is a noble metal that does not tarnish or oxidize. Its chemical symbol Au derives from the Latin word "aurum", meaning shining dawn.',
    elo_rating: 1200,
    times_served: 0,
    times_correct: 0,
  },
  {
    id: 'sci-002',
    category: 'science',
    clue_text:
      'Discovered in 1928 by Alexander Fleming from a contaminated Petri dish, this antibiotic substance revolutionized 20th-century medicine and is derived from common blue mold.',
    answer: 'PENICILLIN',
    answer_mask_length: 10,
    options: ['PENICILLIN', 'AMOXICILLIN', 'STREPTOMYCIN', 'ASPIRIN'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Penicillin',
    context_summary:
      'Alexander Fleming noticed that a halo of inhibited bacterial growth surrounded a green mould (Penicillium notatum) accidentally contaminating his staphylococcus plate.',
    elo_rating: 1240,
    times_served: 0,
    times_correct: 0,
  },
  {
    id: 'sci-003',
    category: 'science',
    clue_text:
      'The largest planet in our solar system, this gas giant possesses a Great Red Spot anticyclonic storm larger than Earth and more than 90 known natural satellites.',
    answer: 'JUPITER',
    answer_mask_length: 7,
    options: ['JUPITER', 'SATURN', 'NEPTUNE', 'URANUS'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Jupiter',
    context_summary:
      'Jupiter is composed primarily of hydrogen and helium, and its magnetic field is nearly 20,000 times stronger than Earth’s.',
    elo_rating: 1180,
    times_served: 0,
    times_correct: 0,
  },

  // GEOGRAPHY
  {
    id: 'geo-001',
    category: 'geography',
    clue_text:
      'Situated at the foot of Mount Fuji in the Kanto region, this metropolitan powerhouse was known as Edo until 1868 when the imperial court relocated from Kyoto.',
    answer: 'TOKYO',
    answer_mask_length: 5,
    options: ['TOKYO', 'OSAKA', 'KYOTO', 'SAPPORO'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Tokyo',
    context_summary:
      'Tokyo literally translates to "Eastern Capital". It was renamed from Edo during the Meiji Restoration in 1868.',
    elo_rating: 1150,
    times_served: 0,
    times_correct: 0,
  },
  {
    id: 'geo-002',
    category: 'geography',
    clue_text:
      'Carving through northeastern Africa for over 6,600 kilometers, this legendary river features the White and Blue branches that converge at Khartoum before draining into the Mediterranean.',
    answer: 'NILE',
    answer_mask_length: 4,
    options: ['NILE', 'AMAZON', 'CONGO', 'YANGTZE'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Nile',
    context_summary:
      'The Nile provided the annual silt-rich floods that allowed ancient Egyptian agriculture and civilization to flourish.',
    elo_rating: 1210,
    times_served: 0,
    times_correct: 0,
  },
  {
    id: 'geo-003',
    category: 'geography',
    clue_text:
      'Enclosed between Jordan, the West Bank, and Israel, this hypersaline terminal lake sits more than 430 meters below sea level, making its shores the lowest land elevation on Earth.',
    answer: 'DEAD SEA',
    answer_mask_length: 7,
    options: ['DEAD SEA', 'CASPIAN SEA', 'LAKE BAIKAL', 'RED SEA'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Dead_Sea',
    context_summary:
      'With salinity approaching 34%, the Dead Sea is nearly 10 times saltier than the ocean, making natural swimming feel like effortless floating.',
    elo_rating: 1260,
    times_served: 0,
    times_correct: 0,
  },

  // ANIME & MANGA
  {
    id: 'ani-001',
    category: 'anime',
    clue_text:
      'Created by Hayao Miyazaki in 1988, this beloved Studio Ghibli mascot is a gentle forest spirit who befriends two young sisters named Satsuki and Mei in rural Japan.',
    answer: 'TOTORO',
    answer_mask_length: 6,
    options: ['TOTORO', 'JIJI', 'NO FACE', 'CALCIFER'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/My_Neighbor_Totoro',
    context_summary:
      'Totoro has become the official corporate logo of Studio Ghibli and an enduring icon of Japanese animation worldwide.',
    elo_rating: 1160,
    times_served: 0,
    times_correct: 0,
  },
  {
    id: 'ani-002',
    category: 'anime',
    clue_text:
      'Serialised in Weekly Shonen Jump since 1997 by Eiichiro Oda, this epic seafaring manga follows Monkey D. Luffy and his crew as they hunt for the world’s ultimate treasure.',
    answer: 'ONE PIECE',
    answer_mask_length: 8,
    options: ['ONE PIECE', 'NARUTO', 'BLEACH', 'HUNTER X HUNTER'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/One_Piece',
    context_summary:
      'One Piece is the best-selling manga series in history with over 500 million copies in circulation worldwide.',
    elo_rating: 1140,
    times_served: 0,
    times_correct: 0,
  },
  {
    id: 'ani-003',
    category: 'anime',
    clue_text:
      'In this psychological thriller by Tsugumi Ohba and Takeshi Obata, high school prodigy Light Yagami discovers a supernatural notebook dropped by the Shinigami Ryuk.',
    answer: 'DEATH NOTE',
    answer_mask_length: 9,
    options: ['DEATH NOTE', 'PSYCHO-PASS', 'MONSTER', 'CODE GEASS'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Death_Note',
    context_summary:
      'Death Note explores complex ethical dilemmas around vigilante justice and was adapted into anime, live-action films, and television.',
    elo_rating: 1220,
    times_served: 0,
    times_correct: 0,
  },

  // GENERAL KNOWLEDGE
  {
    id: 'gen-001',
    category: 'general',
    clue_text:
      'Commissioned in Renaissance Florence by merchant Francesco del Giocondo and painted by Leonardo da Vinci, this portrait in the Louvre is famous for its enigmatic smile.',
    answer: 'MONA LISA',
    answer_mask_length: 8,
    options: ['MONA LISA', 'THE SCREAM', 'GIRL WITH A PEARL EARRING', 'THE LAST SUPPER'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Mona_Lisa',
    context_summary:
      'Leonardo da Vinci employed the sfumato technique, delicately blending tones to achieve the subtle transitions around the lips and eyes.',
    elo_rating: 1170,
    times_served: 0,
    times_correct: 0,
  },
  {
    id: 'gen-002',
    category: 'general',
    clue_text:
      'Erected in Paris for the 1889 Exposition Universelle to commemorate the centennial of the French Revolution, this 330-meter wrought-iron lattice tower was designed by Gustave Eiffel.',
    answer: 'EIFFEL TOWER',
    answer_mask_length: 11,
    options: ['EIFFEL TOWER', 'ARC DE TRIOMPHE', 'BIG BEN', 'COLOSSEUM'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Eiffel_Tower',
    context_summary:
      'Originally criticized by prominent French artists and intellectuals as monstrous, the Eiffel Tower is now the global symbol of Paris.',
    elo_rating: 1130,
    times_served: 0,
    times_correct: 0,
  },
  {
    id: 'gen-003',
    category: 'general',
    clue_text:
      'Written in ancient Greek by Homer, this foundational epic poem recounts the ten-year journey of the king of Ithaca following the fall of Troy.',
    answer: 'ODYSSEY',
    answer_mask_length: 7,
    options: ['ODYSSEY', 'ILIAD', 'AENEID', 'METAMORPHOSES'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Odyssey',
    context_summary:
      'The Odyssey features iconic encounters with the Cyclops Polyphemus, the sorceress Circe, and the seductive song of the Sirens.',
    elo_rating: 1250,
    times_served: 0,
    times_correct: 0,
  },
];
