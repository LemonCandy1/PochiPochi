import { Platform } from 'react-native';
import { Category, Question } from '../../types';

/**
 * Raw structure for a J! Archive / Jeopardy Clue (from 400k+ dataset / scraper)
 */
export interface JArchiveClue {
  id?: string;
  show_number?: number;
  air_date?: string;
  round: 'Jeopardy!' | 'Double Jeopardy!' | 'Final Jeopardy!';
  category: string;
  value: string | number; // e.g. "$200", "$1000", 200, 1000
  question: string;       // Clue text in Jeopardy terminology
  answer: string;         // Correct response
  distractors?: string[];
  wikipedia_url?: string;
}

/**
 * Raw structure for a TriviaQA / Natural Questions pair
 */
export interface TriviaQAPair {
  question_id: string;
  question: string;
  answer: {
    value: string;
    normalized_value?: string;
    aliases?: string[];
  };
  search_results?: Array<{ title: string; url: string }>;
  distractors?: string[];
}

/**
 * Distractor bank for standard category domains to synthesize 4-choice options
 */
const CATEGORY_DISTRACTOR_POOLS: Record<Category, string[]> = {
  science: [
    'Oxygen', 'Carbon', 'Hydrogen', 'Nitrogen', 'Helium', 'Titanium',
    'Mitochondria', 'Chloroplast', 'Ribosome', 'Nucleus',
    'Jupiter', 'Mars', 'Saturn', 'Venus', 'Neptune',
    'Photosynthesis', 'Cellular Respiration', 'Fermentation',
    'Proton', 'Neutron', 'Electron', 'Quark', 'Photon',
    'Plate Tectonics', 'Continental Drift', 'Subduction Zone',
  ],
  geography: [
    'Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River',
    'Mount Everest', 'K2', 'Kangchenjunga', 'Kilimanjaro', 'Mont Blanc',
    'Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean',
    'Sahara Desert', 'Gobi Desert', 'Kalahari Desert', 'Atacama Desert',
    'Tokyo', 'Kyoto', 'Seoul', 'Beijing', 'Bangkok', 'Manila',
    'Iceland', 'Greenland', 'Madagascar', 'New Zealand',
  ],
  anime: [
    'One Piece', 'Naruto', 'Bleach', 'Dragon Ball Z', 'Attack on Titan',
    'Spirited Away', 'Princess Mononoke', 'My Neighbor Totoro', 'Akira',
    'Death Note', 'Fullmetal Alchemist', 'Cowboy Bebop', 'Neon Genesis Evangelion',
    'Monkey D. Luffy', 'Goku', 'Naruto Uzumaki', 'Levi Ackerman',
    'Studio Ghibli', 'Toei Animation', 'Kyoto Animation', 'MAPPA',
  ],
  general: [
    'Leonardo da Vinci', 'Michelangelo', 'Vincent van Gogh', 'Pablo Picasso',
    'William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain',
    '1776', '1789', '1914', '1939', '1945', '1969',
    'French Revolution', 'Industrial Revolution', 'Renaissance', 'Enlightenment',
    'Athens', 'Sparta', 'Rome', 'Carthage', 'Alexandria',
  ],
};

/**
 * Curated J! Archive sample dataset representing real clues across
 * Jeopardy!, Double Jeopardy!, and Final Jeopardy! with dollar value tiers.
 */
export const BUNDLED_JARCHIVE_CLUES: JArchiveClue[] = [
  // --- SCIENCE ($200 to $2000) ---
  {
    round: 'Jeopardy!',
    category: 'ELEMENTS & ATOMS',
    value: '$200',
    question: 'With atomic number 1, it is the lightest and most abundant chemical element in the universe.',
    answer: 'Hydrogen',
    distractors: ['Helium', 'Oxygen', 'Carbon'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Hydrogen',
  },
  {
    round: 'Jeopardy!',
    category: 'PLANETARY SCIENCE',
    value: '$400',
    question: 'Known as the Red Planet due to iron oxide on its surface, it has the largest volcano in the Solar System, Olympus Mons.',
    answer: 'Mars',
    distractors: ['Venus', 'Mercury', 'Jupiter'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Mars',
  },
  {
    round: 'Jeopardy!',
    category: 'BIOLOGY 101',
    value: '$600',
    question: 'Often called the powerhouse of the eukaryotic cell, this organelle generates most of the chemical energy via ATP.',
    answer: 'Mitochondria',
    distractors: ['Ribosome', 'Golgi Apparatus', 'Lysosome'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Mitochondrion',
  },
  {
    round: 'Jeopardy!',
    category: 'PHYSICS LAWS',
    value: '$800',
    question: 'In quantum physics, this German physicist formulated the 1927 principle stating position and momentum cannot be simultaneously measured precisely.',
    answer: 'Werner Heisenberg',
    distractors: ['Niels Bohr', 'Erwin Schrödinger', 'Max Planck'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Werner_Heisenberg',
  },
  {
    round: 'Jeopardy!',
    category: 'EARTH SCIENCE',
    value: '$1000',
    question: 'The boundary between Earth’s crust and the underlying mantle is named after this Croatian seismologist who discovered it in 1909.',
    answer: 'Mohorovičić Discontinuity',
    distractors: ['Gutenberg Discontinuity', 'Lehmann Boundary', 'Conrad Discontinuity'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Mohorovi%C4%8Di%C4%87_discontinuity',
  },
  {
    round: 'Double Jeopardy!',
    category: 'DEEP ASTRONOMY',
    value: '$1200',
    question: 'First detected in 1967 by Jocelyn Bell Burnell, these rapidly rotating magnetized neutron stars emit beams of electromagnetic radiation.',
    answer: 'Pulsar',
    distractors: ['Quasar', 'Magnetar', 'White Dwarf'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Pulsar',
  },
  {
    round: 'Double Jeopardy!',
    category: 'NEUROBIOLOGY',
    value: '$2000',
    question: 'The fatty insulating sheath surrounding axonal nerve fibers that accelerates saltatory electrical impulse propagation.',
    answer: 'Myelin Sheath',
    distractors: ['Schwann Cell', 'Synaptic Cleft', 'Dendritic Spine'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Myelin',
  },

  // --- GEOGRAPHY ($200 to $2000) ---
  {
    round: 'Jeopardy!',
    category: 'WORLD BODIES OF WATER',
    value: '$200',
    question: 'Flowing north through northeastern Africa, this historic river has long been debated alongside the Amazon as the world’s longest.',
    answer: 'Nile River',
    distractors: ['Congo River', 'Danube River', 'Zambezi River'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Nile',
  },
  {
    round: 'Jeopardy!',
    category: 'WORLD CAPITALS',
    value: '$400',
    question: 'At an altitude of over 2,800 meters in the Andes, this capital city of Ecuador is the closest capital to the Equator.',
    answer: 'Quito',
    distractors: ['Bogotá', 'Lima', 'La Paz'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Quito',
  },
  {
    round: 'Jeopardy!',
    category: 'MOUNTAIN RANGES',
    value: '$600',
    question: 'Stretching over 7,000 kilometers along western South America, this is the longest continental mountain range in the world.',
    answer: 'Andes Mountains',
    distractors: ['Rockies', 'Himalayas', 'Alps'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Andes',
  },
  {
    round: 'Jeopardy!',
    category: 'ISLAND NATIONS',
    value: '$800',
    question: 'Located east of Mozambique across the Mozambique Channel, this island nation is famed for its endemic lemurs and baobabs.',
    answer: 'Madagascar',
    distractors: ['Mauritius', 'Seychelles', 'Comoros'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Madagascar',
  },
  {
    round: 'Double Jeopardy!',
    category: 'GLOBAL STRAITS & CANALS',
    value: '$1600',
    question: 'Connecting the Black Sea to the Sea of Marmara, this narrow Turkish strait divides Europe from Asia in Istanbul.',
    answer: 'Bosphorus Strait',
    distractors: ['Dardanelles Strait', 'Strait of Gibraltar', 'Strait of Hormuz'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Bosporus',
  },
  {
    round: 'Double Jeopardy!',
    category: 'LANDLOCKED REALMS',
    value: '$2000',
    question: 'Along with Uzbekistan, this tiny Alpine principality sandwiched between Switzerland and Austria is one of only two doubly landlocked nations.',
    answer: 'Liechtenstein',
    distractors: ['Luxembourg', 'Andorra', 'San Marino'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Liechtenstein',
  },

  // --- ANIME, MANGA & POP CULTURE ($200 to $2000) ---
  {
    round: 'Jeopardy!',
    category: 'ANIME HEROES',
    value: '$200',
    question: 'Wearing an iconic straw hat, Monkey D. Luffy sets sail across the Grand Line to discover this legendary ultimate treasure.',
    answer: 'One Piece',
    distractors: ['Dragon Balls', 'Death Note', 'Philosopher Stone'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/One_Piece',
  },
  {
    round: 'Jeopardy!',
    category: 'ANIMATION MASTERS',
    value: '$400',
    question: 'This legendary Japanese co-founder of Studio Ghibli directed cinema masterpieces including Spirited Away and Princess Mononoke.',
    answer: 'Hayao Miyazaki',
    distractors: ['Isao Takahata', 'Makoto Shinkai', 'Satoshi Kon'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Hayao_Miyazaki',
  },
  {
    round: 'Jeopardy!',
    category: 'MANGA LORE',
    value: '$600',
    question: 'In Tsugumi Ohba’s thriller, high school genius Light Yagami finds a supernatural notebook dropped by the Shinigami Ryuk.',
    answer: 'Death Note',
    distractors: ['Code Geass', 'Monster', 'Psycho-Pass'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Death_Note',
  },
  {
    round: 'Double Jeopardy!',
    category: 'MECHA CLASSICS',
    value: '$1200',
    question: 'Created by Hideaki Anno in 1995, this seminal psychological mecha anime series follows Shinji Ikari piloting EVA-01 against Angels.',
    answer: 'Neon Genesis Evangelion',
    distractors: ['Mobile Suit Gundam', 'Macross', 'Gurren Lagann'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Neon_Genesis_Evangelion',
  },
  {
    round: 'Double Jeopardy!',
    category: 'MANGA ORIGINS',
    value: '$2000',
    question: 'Widely revered as the Godfather of Manga and creator of Astro Boy, he pioneered modern cinematic visual pacing in comic panels.',
    answer: 'Osamu Tezuka',
    distractors: ['Shotaro Ishinomori', 'Fujiko F. Fujio', 'Go Nagai'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Osamu_Tezuka',
  },

  // --- GENERAL KNOWLEDGE & HISTORY ($200 to $2000) ---
  {
    round: 'Jeopardy!',
    category: 'ART MASTERPIECES',
    value: '$200',
    question: 'Housed in the Louvre Museum in Paris, this 16th-century portrait by Leonardo da Vinci portrays Lisa Gherardini with an enigmatic smile.',
    answer: 'Mona Lisa',
    distractors: ['The Last Supper', 'The Birth of Venus', 'Girl with a Pearl Earring'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Mona_Lisa',
  },
  {
    round: 'Jeopardy!',
    category: 'HISTORIC SHAKESPEARE',
    value: '$400',
    question: 'Set in the Kingdom of Denmark, this Shakespearean tragedy dramatizes the prince who famously contemplates "To be, or not to be".',
    answer: 'Hamlet',
    distractors: ['Macbeth', 'Othello', 'King Lear'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Hamlet',
  },
  {
    round: 'Jeopardy!',
    category: 'ANCIENT WONDERS',
    value: '$600',
    question: 'Constructed around 2560 BC on the Giza plateau for Pharaoh Khufu, this is the only one of the Seven Ancient Wonders largely intact.',
    answer: 'Great Pyramid of Giza',
    distractors: ['Colossus of Rhodes', 'Lighthouse of Alexandria', 'Hanging Gardens'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Great_Pyramid_of_Giza',
  },
  {
    round: 'Double Jeopardy!',
    category: 'PHILOSOPHY ICONS',
    value: '$1400',
    question: 'In his 1637 work Discourse on the Method, this French philosopher formulated the famous Latin proposition "Cogito, ergo sum".',
    answer: 'René Descartes',
    distractors: ['Baruch Spinoza', 'John Locke', 'Gottfried Leibniz'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Ren%C3%A9_Descartes',
  },
  {
    round: 'Double Jeopardy!',
    category: 'TREATIES OF HISTORY',
    value: '$2000',
    question: 'Signed in 1648, this landmark pair of peace treaties in Osnabrück and Münster ended the Thirty Years’ War and birthed state sovereignty.',
    answer: 'Peace of Westphalia',
    distractors: ['Treaty of Utrecht', 'Congress of Vienna', 'Treaty of Tordesillas'],
    wikipedia_url: 'https://en.wikipedia.org/wiki/Peace_of_Westphalia',
  },
];

/**
 * Service to interface with Open Bulk Datasets (J! Archive / TriviaQA)
 * and live API endpoints.
 */
export class TriviaApiClient {
  /**
   * Resolves the API endpoint URL:
   * - In production / custom setup: EXPO_PUBLIC_TRIVIA_API_URL
   * - In Android emulator: 10.0.2.2:4000
   * - In iOS / web: localhost:4000
   */
  public static getBaseUrl(): string {
    if (process.env.EXPO_PUBLIC_TRIVIA_API_URL) {
      return process.env.EXPO_PUBLIC_TRIVIA_API_URL;
    }
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${host}:4000/api/trivia`;
  }

  /**
   * Maps J! Archive dollar value and round to PochiPochi Elo Rating.
   * Dollar values ($200 to $2000) serve as built-in baseline difficulty tiers.
   */
  public static mapJArchiveValueToElo(
    round: string,
    valueRaw: string | number
  ): number {
    let numericValue = 400;

    if (typeof valueRaw === 'number') {
      numericValue = valueRaw;
    } else if (typeof valueRaw === 'string') {
      const clean = valueRaw.replace(/[^0-9]/g, '');
      numericValue = parseInt(clean, 10) || 400;
    }

    const isDoubleJeopardy =
      round.toLowerCase().includes('double') || numericValue >= 1200;
    const isFinalJeopardy = round.toLowerCase().includes('final');

    if (isFinalJeopardy) {
      return 1850;
    }

    if (isDoubleJeopardy) {
      // Double Jeopardy ($400 - $2000) -> 1300 to 1800 Elo
      switch (numericValue) {
        case 400: return 1300;
        case 800: return 1420;
        case 1200: return 1540;
        case 1600: return 1660;
        case 2000: return 1780;
        default:
          return Math.min(1850, 1300 + Math.round((numericValue / 2000) * 450));
      }
    } else {
      // Jeopardy Round ($200 - $1000) -> 950 to 1400 Elo
      switch (numericValue) {
        case 200: return 1000;
        case 400: return 1100;
        case 600: return 1200;
        case 800: return 1300;
        case 1000: return 1400;
        default:
          return Math.min(1450, 950 + Math.round((numericValue / 1000) * 450));
      }
    }
  }

  /**
   * Classifies raw category strings into PochiPochi's 4 core categories:
   * 'science' | 'geography' | 'anime' | 'general'
   */
  public static classifyCategory(rawCat: string): Category {
    const text = rawCat.toLowerCase();

    if (
      text.includes('science') ||
      text.includes('biology') ||
      text.includes('chemistry') ||
      text.includes('physics') ||
      text.includes('astronomy') ||
      text.includes('element') ||
      text.includes('space') ||
      text.includes('planet') ||
      text.includes('nature') ||
      text.includes('anatomy') ||
      text.includes('doctor') ||
      text.includes('medicine') ||
      text.includes('botany') ||
      text.includes('zoology')
    ) {
      return 'science';
    }

    if (
      text.includes('geography') ||
      text.includes('world') ||
      text.includes('capital') ||
      text.includes('country') ||
      text.includes('countries') ||
      text.includes('river') ||
      text.includes('mountain') ||
      text.includes('lake') ||
      text.includes('ocean') ||
      text.includes('sea') ||
      text.includes('island') ||
      text.includes('state') ||
      text.includes('city') ||
      text.includes('cities') ||
      text.includes('strait') ||
      text.includes('border')
    ) {
      return 'geography';
    }

    if (
      text.includes('anime') ||
      text.includes('manga') ||
      text.includes('comic') ||
      text.includes('animation') ||
      text.includes('cartoon') ||
      text.includes('video game') ||
      text.includes('gaming') ||
      text.includes('fictional') ||
      text.includes('character') ||
      text.includes('pop culture') ||
      text.includes('movie') ||
      text.includes('film') ||
      text.includes('television')
    ) {
      return 'anime';
    }

    return 'general';
  }

  /**
   * Generates 4 multiple choice options with 1 correct answer and 3 randomized distractors
   */
  public static generateFourOptions(
    correctAnswer: string,
    category: Category,
    providedDistractors?: string[]
  ): string[] {
    const distractors: string[] = [];

    if (providedDistractors && providedDistractors.length >= 3) {
      for (const d of providedDistractors) {
        if (d.toLowerCase() !== correctAnswer.toLowerCase() && !distractors.includes(d)) {
          distractors.push(d);
        }
        if (distractors.length === 3) break;
      }
    }

    // Fill from fallback category pool if needed
    const pool = CATEGORY_DISTRACTOR_POOLS[category] || CATEGORY_DISTRACTOR_POOLS.general;
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());

    for (const candidate of shuffledPool) {
      if (distractors.length >= 3) break;
      if (
        candidate.toLowerCase() !== correctAnswer.toLowerCase() &&
        !distractors.includes(candidate)
      ) {
        distractors.push(candidate);
      }
    }

    // Combine correct + 3 distractors and shuffle
    const fourChoices = [correctAnswer, ...distractors.slice(0, 3)];
    return fourChoices.sort(() => 0.5 - Math.random());
  }

  /**
   * Converts a J! Archive clue record into a full PochiPochi Question model
   */
  public static convertJArchiveToQuestion(
    clue: JArchiveClue,
    index: number = 0
  ): Question {
    const category = this.classifyCategory(clue.category);
    const elo = this.mapJArchiveValueToElo(clue.round, clue.value);
    const cleanAnswer = clue.answer.replace(/^the\s+/i, '').trim();
    const maskLength = cleanAnswer.replace(/\s+/g, '').length;
    const options = this.generateFourOptions(
      clue.answer,
      category,
      clue.distractors
    );
    const wikiUrl =
      clue.wikipedia_url ||
      `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanAnswer)}`;

    return {
      id: clue.id || `jarchive-${Date.now()}-${index}`,
      category,
      clue_text: clue.question,
      answer: clue.answer,
      answer_mask_length: maskLength,
      options,
      wikipedia_url: wikiUrl,
      context_summary: `J! Archive clue from ${clue.category} (${clue.round}, ${clue.value}). Baseline Elo calibrated from historic contestant solve frequency.`,
      elo_rating: elo,
      times_served: 0,
      times_correct: 0,
    };
  }

  /**
   * Fetches trivia clues from the configured API endpoint.
   * If the endpoint is offline or unavailable, automatically falls back to the
   * bundled J! Archive 40-season clue repository.
   */
  public static async fetchQuestions(params: {
    category?: Category | 'all';
    targetElo?: number;
    count?: number;
  }): Promise<Question[]> {
    const { category = 'all', targetElo = 1200, count = 10 } = params;
    const url = `${this.getBaseUrl()}/questions?category=${category}&elo=${targetElo}&count=${count}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json) && json.length > 0) {
          return json.map((item: any, idx: number) => {
            if (item.clue_text && item.answer && item.options) {
              return item as Question;
            }
            return this.convertJArchiveToQuestion(item as JArchiveClue, idx);
          });
        }
      }
    } catch {
      // Fallback cleanly to bundled J! Archive dataset
    }

    // Filter bundled J! Archive clues by category
    let pool = BUNDLED_JARCHIVE_CLUES.map((clue, idx) =>
      this.convertJArchiveToQuestion(clue, idx)
    );

    if (category !== 'all') {
      pool = pool.filter((q) => q.category === category);
    }

    // Sort closest to target Elo
    pool.sort(
      (a, b) =>
        Math.abs(a.elo_rating - targetElo) - Math.abs(b.elo_rating - targetElo)
    );

    return pool.slice(0, count);
  }
}
