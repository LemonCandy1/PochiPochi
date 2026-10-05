import json, os

existing_path = r'C:\Users\luisc\Desktop\Project\PochiPochi\server\anime_raw.json'
with open(existing_path, 'r', encoding='utf-8') as f:
    existing_questions = json.load(f)

print(f"Loaded {len(existing_questions)} existing questions.")

new_questions = [
    # JUJUTSU KAISEN (JJK)
    ["What is Satoru Gojo's signature barrier technique that creates an infinite space between him and attacks?", "Infinity", "Domain Amplification", "Simple Domain", "Falling Blossom Emotion", "Jujutsu Kaisen", 250],
    ["What is the name of Satoru Gojo's Domain Expansion?", "Unlimited Void", "Malevolent Shrine", "Chimera Shadow Garden", "Self-Embodiment of Perfection", "Jujutsu Kaisen", 200],
    ["Which attack combines Gojo's Red and Blue techniques into an imaginary mass that erases everything in its path?", "Hollow Purple", "Maximum Blue", "Reversal Red", "Lime Green", "Jujutsu Kaisen", 250],
    ["What special physical trait allows Gojo to perceive cursed energy at an atomic level?", "Six Eyes", "Rinnegan", "Sharingan", "Byakugan", "Jujutsu Kaisen", 250],
    ["Who is known as the King of Curses in Jujutsu Kaisen?", "Ryomen Sukuna", "Suguru Geto", "Kenjaku", "Mahito", "Jujutsu Kaisen", 200],
    ["What is Ryomen Sukuna's barrierless Domain Expansion called?", "Malevolent Shrine", "Unlimited Void", "Coffin of the Iron Mountain", "Horizon of the Captivating Skandha", "Jujutsu Kaisen", 250],
    ["What are Sukuna's two primary slashing attacks?", "Dismantle and Cleave", "Sever and Pierce", "Slash and Hack", "Rend and Tear", "Jujutsu Kaisen", 300],
    ["How many fingers does Ryomen Sukuna originally possess across his four arms?", "20", "10", "12", "16", "Jujutsu Kaisen", 200],
    ["What is Megumi Fushiguro's inherited Zenin clan cursed technique?", "Ten Shadows Technique", "Limitless", "Blood Manipulation", "Straw Doll Technique", "Jujutsu Kaisen", 250],
    ["What is the untamed, ultimate divine shikigami of the Ten Shadows Technique?", "Mahoraga", "Divine Dog: Totality", "Nue", "Max Elephant", "Jujutsu Kaisen", 300],
    ["What is Nobara Kugisaki's signature cursed technique involving nails and a straw doll?", "Resonance", "Idle Transfiguration", "Boogie Woogie", "Divergent Fist", "Jujutsu Kaisen", 250],
    ["Who is the ancient sorcerer possessing Suguru Geto's body with brain stitches?", "Kenjaku", "Tengen", "Sukuna", "Uraume", "Jujutsu Kaisen", 350],
    ["What is Kento Nanami's signature 7:3 ratio cursed technique?", "Ratio Technique", "Boogie Woogie", "Projection Sorcery", "Black Flash", "Jujutsu Kaisen", 250],
    ["What must Aoi Todo do to trigger his Boogie Woogie teleportation technique?", "Clap his hands", "Snap his fingers", "Stomp his feet", "Blink his eyes", "Jujutsu Kaisen", 200],
    ["Who is Aoi Todo's beloved idol whose image he hallucinates during battle?", "Nobuko Takada (Takada-chan)", "Ai Hoshino", "Misa Amane", "Hatsune Miku", "Jujutsu Kaisen", 300],
    ["What binding condition gives Toji Fushiguro superhuman physical prowess at the cost of zero cursed energy?", "Heavenly Restriction", "Simple Domain", "Domain Amplification", "Cursed Pact", "Jujutsu Kaisen", 300],
    ["What cursed tool did Toji use to pierce Gojo's Infinity barrier?", "Inverted Spear of Heaven", "Playful Cloud", "Split Soul Katana", "Dragon Bone", "Jujutsu Kaisen", 350],
    ["Who is Yuta Okkotsu's Special Grade bonded cursed spirit in Jujutsu Kaisen 0?", "Rika Orimoto", "Hanami", "Dagon", "Tamamo-no-Mae", "Jujutsu Kaisen", 250],
    ["What is Mahito's cursed technique that alters the shape of human souls?", "Idle Transfiguration", "Straw Doll", "Curtain", "Soul Resonance", "Jujutsu Kaisen", 300],
    ["What type of cursed speech prevents Toge Inumaki from speaking normally, leading him to use what words?", "Rice ball ingredients", "Color names", "Animal noises", "Numbers", "Jujutsu Kaisen", 200],
    ["What special event in Shibuya on October 31st was designed by Kenjaku to seal Gojo?", "Shibuya Incident", "Culling Game", "Goodwill Event", "Night Parade of 100 Demons", "Jujutsu Kaisen", 250],
    ["What cursed object was used to seal Satoru Gojo during the Shibuya Incident?", "Prison Realm", "Goku-Kyo-Kensei", "Cursed Womb", "Hollow Wicker Basket", "Jujutsu Kaisen", 300],
    ["What phenomenon occurs when cursed energy is applied within 0.000001 seconds of a physical hit?", "Black Flash", "Divergent Fist", "Red Spark", "Critical Strike", "Jujutsu Kaisen", 300],
    ["What is Kinji Hakari's Domain Expansion modeled after?", "A Romance Pachinko Game", "A Casino Roulette", "A Lottery Wheel", "A Horse Race", "Jujutsu Kaisen", 350],
    ["What is Hiromi Higuruma's profession before awakening as a sorcerer?", "Defense Attorney", "Police Detective", "Surgeon", "Judge", "Jujutsu Kaisen", 350],
    ["What is Choso's blood technique that compresses blood into a lethal laser-like beam?", "Piercing Blood", "Blood Edge", "Supernova", "Slicing Exorcism", "Jujutsu Kaisen", 350],
    ["Who killed Suguru Geto at the conclusion of Jujutsu Kaisen 0?", "Satoru Gojo", "Yuta Okkotsu", "Yuji Itadori", "Kento Nanami", "Jujutsu Kaisen", 300],
    ["What are Panda's three inner sibling cores in Jujutsu Kaisen?", "Panda, Gorilla, and Sister (Triceratops)", "Panda, Tiger, and Bear", "Panda, Lion, and Dragon", "Panda, Wolf, and Eagle", "Jujutsu Kaisen", 350],
    ["What is the name of Naobito and Naoya Zenin's 24-frames-per-second technique?", "Projection Sorcery", "Animation Step", "Motion Capture", "Speed Division", "Jujutsu Kaisen", 400],
    ["What is Tengen's role in the Jujutsu world?", "Maintaining the barriers across Japan", "Leading the Tokyo school", "Judging evil spirits", "Guarding the Prison Realm", "Jujutsu Kaisen", 350],

    # CHAINSAW MAN
    ["What kind of Devil is Pochita before becoming Denji's heart?", "Chainsaw Devil", "Dog Devil", "Blade Devil", "Gun Devil", "Chainsaw Man", 200],
    ["How does Denji trigger his Chainsaw Man transformation?", "Pulls a ripcord on his chest", "Snaps his fingers", "Cuts his wrist", "Bites his hand", "Chainsaw Man", 200],
    ["What is Makima's true identity in Chainsaw Man?", "The Control Devil", "The War Devil", "The Death Devil", "The Famine Devil", "Chainsaw Man", 250],
    ["What gesture does Makima use to telekinetically blast holes through targets?", "Pointing a finger gun and saying Bang", "Clapping her hands", "Snapping her fingers", "Stamping her foot", "Chainsaw Man", 250],
    ["What is Power's species in Chainsaw Man?", "Blood Fiend", "Full Devil", "Hybrid", "Cursed Human", "Chainsaw Man", 200],
    ["What is the name of Power's beloved companion cat?", "Meowy (Nyako)", "Tama", "Kuro", "Pochi", "Chainsaw Man", 200],
    ["What devil lives inside Aki Hayakawa's right eye, allowing him to see a few seconds into the future?", "The Future Devil", "The Fox Devil", "The Curse Devil", "The Ghost Devil", "Chainsaw Man", 300],
    ["What phrase does the Future Devil make people chant before showing their future?", "The Future Rules! (Future is best!)", "Time is money!", "Death awaits!", "Look closely!", "Chainsaw Man", 300],
    ["What tragedy struck the world 13 years ago, causing fear of devils to skyrocket in Chainsaw Man?", "The Gun Devil attack", "The Bomb Devil explosion", "The Fall of Hell", "The Chainsaw Rampage", "Chainsaw Man", 250],
    ["What body part does Himeno sacrifice to the Ghost Devil to unleash all its arms?", "Her entire body", "Her right leg", "Her voice", "Her left arm", "Chainsaw Man", 350],
    ["Who is the brutal veteran Devil Hunter that trained Denji and Power by killing them repeatedly?", "Kishibe", "Kurose", "Arai", "Fusha", "Chainsaw Man", 300],
    ["What weapon transformation does Reze possess as a Soviet hybrid?", "Bomb Devil", "Gun Devil", "Crossbow Devil", "Sword Devil", "Chainsaw Man", 250],
    ["How does Reze trigger her Bomb Devil transformation?", "Pulls a grenade pin in her neck choker", "Presses a detonator", "Strikes a match", "Pulls a chest ripcord", "Chainsaw Man", 300],
    ["What horrifying Primal Fear Devil appears in Hell surrounded by bisected astronauts?", "The Darkness Devil", "The Falling Devil", "The Death Devil", "The Pain Devil", "Chainsaw Man", 350],
    ["What is Kobeni Higashiyama's infamous prized possession that gets damaged repeatedly?", "Her car", "Her knife", "Her dress", "Her apartment", "Chainsaw Man", 250],
    ["Who is the First Devil Hunter who fights with bows and commands a fiend harem?", "Quanxi", "Santa Claus", "Tolka", "Tendo", "Chainsaw Man", 350],
    ["What unique ability does the Chainsaw Devil possess that makes all devils fear him?", "Erasing the name and concept of any devil he eats", "Infinite stamina", "Absolute mind control", "Immunity to all physical damage", "Chainsaw Man", 400],
    ["What form did Aki Hayakawa tragically take when attacking Denji in his apartment?", "The Gun Fiend", "The Ghost Devil", "The Fox Fiend", "The Curse Hybrid", "Chainsaw Man", 350],
    ["How does Denji bypass Makima's contract with the Japanese Prime Minister to defeat her?", "Attacks her with a chainsaw made of Power's blood and consumes her out of love", "Kills the Prime Minister first", "Banishes her to Hell", "Uses the Angel Devil spear", "Chainsaw Man", 400],
    ["What is Beam's fiend identity in Chainsaw Man?", "Shark Fiend", "Spider Fiend", "Violence Fiend", "Angel Fiend", "Chainsaw Man", 300],

    # BLEACH & THOUSAND-YEAR BLOOD WAR
    ["What is Ichigo Kurosaki's signature sword strike that releases concentrated reiatsu?", "Getsuga Tensho", "Cero", "Bite of the Serpent", "Senbonzakura", "Bleach", 200],
    ["What is the name of Ichigo's Zanpakuto spirit?", "Zangetsu", "Hyorinmaru", "Senbonzakura", "Wabisuke", "Bleach", 200],
    ["What is the release command for Byakuya Kuchiki's Bankai?", "Scatter, Senbonzakura Kageyoshi", "Roar, Zabimaru", "Bloom, Tobiume", "Dance, Sode no Shirayuki", "Bleach", 250],
    ["What is Rukia Kuchiki's Zanpakuto, renowned as the most beautiful in Soul Society?", "Sode no Shirayuki", "Haineko", "Tobiume", "Suzumebachi", "Bleach", 250],
    ["What is Sosuke Aizen's Zanpakuto ability?", "Complete Hypnosis (Kyoka Suigetsu)", "Extreme Heat (Ryujin Jakka)", "Absolute Ice (Daiguren Hyorinmaru)", "Space Erasure (Minazuki)", "Bleach", 250],
    ["Where was Aizen imprisoned for 20,000 years after his defeat in Karakura Town?", "Muken (Central 46 Underground Prison)", "Rukongai", "Hueco Mundo", "Silbern", "Bleach", 350],
    ["Who served as Captain-Commander of the Gotei 13 for over a millennium?", "Genryusai Shigekuni Yamamoto", "Shunsui Kyoraku", "Jushiro Ukitake", "Retsu Unohana", "Bleach", 250],
    ["What is Yamamoto's flame Zanpakuto called?", "Ryujin Jakka", "Enrakyoten", "Tengumaru", "Hi no Yaiba", "Bleach", 250],
    ["What is the name of the oldest medical captain revealed to be the First Kenpachi?", "Retsu (Yachiru) Unohana", "Isane Kotetsu", "Kirio Hikifune", "Soi Fon", "Bleach", 350],
    ["Who is the Emperor of the Wandenreich and Father of the Quincy?", "Yhwach", "Jugram Haschwalth", "Askin Nakk Le Vaar", "Gerard Valkyrie", "Bleach", 300],
    ["What is Yhwach's Schrift ability that allows him to see and alter future timelines?", "The Almighty (A)", "The Antithesis (A)", "The Balance (B)", "The Miracle (M)", "Bleach", 350],
    ["Who created the Zanpakuto for all Shinigami in Squad Zero?", "Oetsu Nimaiya", "Ichibe Hyosube", "Senjumaru Shutara", "Tenjiro Kirinji", "Bleach", 350],
    ["What is Ichibe Hyosube's title in the Royal Guard?", "Monk Who Calls the Real Name", "Blade God", "Divine Weaver", "Hot Spring Demon", "Bleach", 400],
    ["Which Espada held the rank of Cuatro (4) and fought Ichigo on the roof of Las Noches?", "Ulquiorra Cifer", "Grimmjow Jaegerjaquez", "Tier Harribel", "Coyote Starrk", "Bleach", 250],
    ["What is Grimmjow's Resurreccion form called?", "Pantera", "Murcielago", "Tiburón", "Los Lobos", "Bleach", 300],
    ["What is the name of Kenpachi Zaraki's Zanpakuto when finally awakened?", "Nozarashi", "Sanpo Kenju", "Gegetsuburi", "Ashisogi Jizo", "Bleach", 350],
    ["Who becomes the new Captain-Commander after Yamamoto's death?", "Shunsui Kyoraku", "Byakuya Kuchiki", "Toshiro Hitsugaya", "Sajin Komamura", "Bleach", 300],
    ["What Quincy technique steals a Shinigami's Bankai in the Thousand-Year Blood War?", "Medallion (Bankai Plundering)", "Hirenkyaku", "Blut Vene", "Ransotengai", "Bleach", 350],
    ["What defensive Quincy technique pumps Reishi into blood vessels to dramatically boost durability?", "Blut Vene", "Blut Arterie", "Kirchenlied", "Sanrei Glove", "Bleach", 350],
    ["What is the true nature of Ichigo's old man Zangetsu?", "The manifestation of his Quincy powers (resembling Yhwach 1000 years ago)", "A pure Soul Reaper spirit", "A regular Hollow", "His biological father's ghost", "Bleach", 400],

    # JOJO'S BIZARRE ADVENTURE
    ["What mask transforms Dio Brando into a vampire in Phantom Blood?", "Stone Mask", "Aja Mask", "Gold Mask", "Bone Mask", "JoJo's Bizarre Adventure", 200],
    ["What martial art harnessing sunlight energy is taught by Will A. Zeppeli in Part 1?", "Hamon (Ripple)", "Spin", "Nen", "Chakra", "JoJo's Bizarre Adventure", 200],
    ["Who founded the wealthy foundation that assists the Joestar family across generations?", "Robert E. O. Speedwagon", "Rudol von Stroheim", "Smokey Brown", "Erina Pendleton", "JoJo's Bizarre Adventure", 200],
    ["What famous catchphrase does young Joseph Joestar use right before reading his opponent's mind?", "Next you're gonna say...", "Good grief...", "WRYYYY!", "Muda muda muda!", "JoJo's Bizarre Adventure", 250],
    ["What ancient race of beings created the Stone Mask in Battle Tendency?", "Pillar Men", "Rock Humans", "Vampire Lords", "Aztec Gods", "JoJo's Bizarre Adventure", 250],
    ["Who is the leader of the Pillar Men who seeks the Red Stone of Aja to become the Ultimate Thing?", "Kars", "Esidisi", "Wamuu", "Santana", "JoJo's Bizarre Adventure", 250],
    ["How was Ultimate Kars finally defeated by Joseph Joestar?", "Launched into outer space by a volcanic eruption where he stopped thinking", "Burned by the Red Stone of Aja", "Crushed by Caesar's cross", "Dissolved in acid", "JoJo's Bizarre Adventure", 300],
    ["What is Jotaro Kujo's iconic Stand name in Part 3?", "Star Platinum", "The World", "Silver Chariot", "Magician's Red", "JoJo's Bizarre Adventure", 200],
    ["What power does DIO's Stand, The World (Za Warudo), possess?", "Stopping time", "Erasing space", "Rewinding time", "Creating fire", "JoJo's Bizarre Adventure", 200],
    ["What French swordsman wields the Stand Silver Chariot?", "Jean Pierre Polnareff", "Noriaki Kakyoin", "Mohammed Avdol", "Hol Horse", "JoJo's Bizarre Adventure", 250],
    ["What Boston Terrier dog Stand user joined the Stardust Crusaders with the Stand The Fool?", "Iggy", "Danny", "Arnold", "Rocky", "JoJo's Bizarre Adventure", 250],
    ["What is Josuke Higashikata's Stand ability in Diamond is Unbreakable?", "Crazy Diamond - fixing and restoring broken objects and healing wounds", "Erasing space with a swipe", "Turning people into books", "Creating bomb bubbles", "JoJo's Bizarre Adventure", 250],
    ["What triggers uncontrollable fury in Josuke Higashikata?", "Insulting his pompadour hairstyle", "Stealing his money", "Disrespecting his mother", "Losing a video game", "JoJo's Bizarre Adventure", 200],
    ["Who is the serial killer terrorizing the quiet town of Morioh in Part 4?", "Yoshikage Kira", "Akira Otoishi", "Anjuro Katagiri", "Terunosuke Miyamoto", "JoJo's Bizarre Adventure", 250],
    ["What is Yoshikage Kira's primary Stand called?", "Killer Queen", "Sheer Heart Attack", "Bites the Dust", "Stray Cat", "JoJo's Bizarre Adventure", 250],
    ["What is Giorno Giovanna's father lineage in Golden Wind?", "DIO with Jonathan Joestar's body", "Joseph Joestar", "Jotaro Kujo", "Diavolo", "JoJo's Bizarre Adventure", 250],
    ["What is Giorno Giovanna's life-giving Stand?", "Gold Experience", "Sticky Fingers", "Moody Blues", "Purple Haze", "JoJo's Bizarre Adventure", 200],
    ["What Stand power does Bruno Bucciarati use to create zippers on any surface?", "Sticky Fingers (Zipper Man)", "Sex Pistols", "Aerosmith", "Spice Girl", "JoJo's Bizarre Adventure", 250],
    ["Why does Guido Mista refuse to associate with anything involving the number 4?", "Tetraphobia (superstition that 4 brings bad luck)", "He was born on April 4th", "His gun has only 3 chambers", "Passione banned the number", "JoJo's Bizarre Adventure", 300],
    ["What is Diavolo's Stand ability with King Crimson?", "Erasing/skipping time and predicting the future with Epitaph", "Stopping time for 5 seconds", "Resetting actions to zero", "Speeding up the universe", "JoJo's Bizarre Adventure", 350],
    ["What is the ultimate ability of Gold Experience Requiem?", "Resetting any action or willpower to zero", "Infinite time stop", "Universal gravity collapse", "Total soul destruction", "JoJo's Bizarre Adventure", 350],
    ["What prison is Jolyne Cujoh confined in at the start of Stone Ocean?", "Green Dolphin Street Prison", "Alcatraz", "Impel Down", "Sing Sing", "JoJo's Bizarre Adventure", 250],
    ["What is Father Enrico Pucci's final evolved Stand that accelerates universe time to a reset point?", "Made in Heaven", "Whitesnake", "C-Moon", "The World Over Heaven", "JoJo's Bizarre Adventure", 350],

    # CYBERPUNK: EDGERUNNERS
    ["What military-grade cyberware implant does David Martinez install along his spine?", "Sandevistan", "Gorilla Arms", "Mantis Blades", "Monowire", "Cyberpunk: Edgerunners", 200],
    ["What dream destination on another celestial body does Lucy long to visit?", "The Moon", "Mars", "Orbital Station Crystal Palace", "Titan", "Cyberpunk: Edgerunners", 200],
    ["What trigger-happy, petite solo carries heavy artillery and swears constantly in David's crew?", "Rebecca", "Kiwi", "Dorio", "Gloria", "Cyberpunk: Edgerunners", 200],
    ["Who is the muscular cyber-armed leader of the edgerunner crew before David takes over?", "Maine", "Faraday", "Pilar", "Falco", "Cyberpunk: Edgerunners", 250],
    ["What fatal mental dissociation condition affects individuals with excessive cybernetic modifications?", "Cyberpsychosis", "Blackwall Syndrome", "Synapse Burnout", "Relic Corruption", "Cyberpunk: Edgerunners", 250],
    ["Who is Arasaka's terrifying, near-fully cybernetic enforcer who crushes David Martinez in Night City?", "Adam Smasher", "Goro Takemura", "Oda Sandayu", "Yorinobu Arasaka", "Cyberpunk: Edgerunners", 200],
    ["What device allows users in Night City to re-live recorded sensory and emotional experiences of others?", "Braindance (BD)", "Cyberdeck", "Neuro-Link", "Shard Deck", "Cyberpunk: Edgerunners", 250],
    ["What mega-corporation was David's mother Gloria Martinez collecting cyberware scraps from?", "Arasaka", "Militech", "Kang Tao", "Trauma Team", "Cyberpunk: Edgerunners", 250],
    ["Who was the four-eyed fixer that betrayed Maine's crew to Arasaka and Militech?", "Faraday", "Wakako Okada", "Padre", "Rogue", "Cyberpunk: Edgerunners", 300],
    ["What vehicle driver survives the final confrontation and helps Lucy escape to her dream?", "Falco", "Pilar", "Maine", "David", "Cyberpunk: Edgerunners", 300],

    # SPY X FAMILY
    ["What is Twilight's civilian undercover name in Berlint?", "Loid Forger", "Donovan Desmond", "Franky Franklin", "Yuri Briar", "Spy x Family", 200],
    ["What secret intelligence agency does Loid work for in Westalis?", "WISE", "Garden", "SSS", "MI6", "Spy x Family", 250],
    ["What is Yor Forger's assassin alias under the shadowy organization Garden?", "Thorn Princess", "Nightfall", "Rose Assassin", "Shadow Viper", "Spy x Family", 200],
    ["What secret telepathic ability does Anya Forger possess?", "Reading minds", "Seeing the future", "Moving objects with her mind", "Healing wounds", "Spy x Family", 200],
    ["What is Anya's favorite food in the entire world?", "Peanuts", "Crispy bacon", "Strawberry cake", "Hamburgers", "Spy x Family", 200],
    ["What is the name of the Forger family dog who can foresee the future?", "Bond", "Anya Jr.", "Spy", "Sherlock", "Spy x Family", 200],
    ["What is the name of Loid's top-secret mission to preserve peace between Ostania and Westalis?", "Operation Strix", "Operation Desmond", "Operation Eden", "Operation WISE", "Spy x Family", 250],
    ["What elite school does Anya attend to help Loid get close to Donovan Desmond?", "Eden Academy", "St. Michael's", "Imperial Institute", "Berlint High", "Spy x Family", 200],
    ["What medals are awarded to students of Eden Academy for academic or athletic excellence?", "Stella Stars", "Tonitrus Bolts", "Imperial Badges", "Eagle Medals", "Spy x Family", 250],
    ["What demerit badges are given to Eden Academy students for misbehavior, threatening expulsion at eight badges?", "Tonitrus Bolts", "Stella Stars", "Black Marks", "Demerit Seals", "Spy x Family", 250],
    ["What is Yor's younger brother Yuri Briar's real secret profession?", "State Security Service (Secret Police) lieutenant", "Foreign spy", "Army general", "School inspector", "Spy x Family", 250],
    ["Who is Loid's fellow WISE spy agent code-named Nightfall who secretly loves him?", "Fiona Frost", "Sylvia Sherwood", "Camilla", "Sharon", "Spy x Family", 300],
    ["What nickname does Anya affectionately use when referring to her classmate Damian Desmond?", "Sy-on boy", "Boss kid", "Prince Desmond", "Little lord", "Spy x Family", 250],
    ["What is Franky Franklin's role in assisting Loid Forger?", "Informant and gadget supplier", "Sniper backup", "Driver and combatant", "WISE commanding officer", "Spy x Family", 250],

    # FRIEREN: BEYOND JOURNEY'S END
    ["How many years did Frieren and the Hero's party spend traveling to defeat the Demon King?", "10 years", "5 years", "20 years", "50 years", "Frieren", 200],
    ["Whose passing after 50 years makes Frieren realize she took human mortality for granted?", "Himmel the Hero", "Heiter the Priest", "Eisen the Dwarf", "Flamme the Great", "Frieren", 200],
    ["Who is Frieren's human apprentice who specializes in rapid offensive magic?", "Fern", "Laufen", "Kanne", "Ubel", "Frieren", 200],
    ["Who is the young warrior apprentice of Eisen who wields a heavy battleaxe?", "Stark", "Sein", "Wirbel", "Denken", "Frieren", 200],
    ["What is the destination in the northern continent where souls are said to rest and Frieren seeks Himmel?", "Aureole (Ende)", "Tor", "Äußerst", "Strahl", "Frieren", 300],
    ["What fundamental offensive magic developed by Qual was analyzed and adopted by humanity?", "Zoltraak (Ordinary Offensive Magic)", "Vollzanbel", "Reelseiden", "Jilwer", "Frieren", 250],
    ["What fundamental biological trait defines demons in Frieren's world?", "They are apex monsters without empathy who mimic speech strictly to deceive humans", "They are fallen angels", "They are cursed humans", "They are undead spirits", "Frieren", 300],
    ["Who was Frieren's human mentor that founded humanity's magical development?", "Flamme", "Serie", "Sense", "Macht", "Frieren", 300],
    ["What ancient living grimoire elf leads the Continental Magic Association?", "Serie", "Flamme", "Frieren", "Mithrun", "Frieren", 300],
    ["What command does Frieren give to Aura the Guillotine after balancing her scales of obedience?", "Aura, kill yourself", "Drop your weapons", "Bow before me", "Return to your castle", "Frieren", 250],
    ["What peculiar habit does Frieren have when searching through dungeons and reward chests?", "Getting stuck inside Mimics", "Tripping over traps", "Stealing gold coins", "Breaking every chest", "Frieren", 200],
    ["What type of magic grimoires does Frieren particularly love to collect as hobby rewards?", "Bizarre or trivial spells like cleaning bronze statues or making sweet shaved ice", "Super destructive ancient spells", "Forbidden resurrection spells", "Immortality potions", "Frieren", 250],
    ["What Sage of Destruction turned the entire city of Weise into solid gold?", "Macht of El Dorado", "Bose the Immortal", "Grausam the Miraculous", "Immortal Qual", "Frieren", 350],
    ["What item did Himmel buy for Frieren with a mirror lotus motif symbolizing enduring love?", "A silver ring", "A necklace", "A silver bracelet", "An earring", "Frieren", 300],

    # NEON GENESIS EVANGELION
    ["What phrase does Shinji Ikari repeatedly whisper to himself to face piloting EVA-01?", "I mustn't run away", "I have to be strong", "Father is watching", "Protect Tokyo-3", "Evangelion", 200],
    ["What entity's soul is housed within the core of Evangelion Unit-01?", "Yui Ikari (Shinji's mother)", "Lilith", "Adam", "Kyoko Zeppelin", "Evangelion", 300],
    ["What is Asuka Langley Soryu's iconic dismissive retort directed at Shinji?", "Anta baka? (Are you stupid?)", "Get lost!", "Don't touch me!", "Whatever, Shinji!", "Evangelion", 200],
    ["Who is the First Child cloned from Yui Ikari who houses the soul of Lilith?", "Rei Ayanami", "Asuka Langley Soryu", "Misato Katsuragi", "Ritsuko Akagi", "Evangelion", 250],
    ["What catastrophic disaster occurred in Antarctica in the year 2000, melting polar ice caps?", "Second Impact", "First Impact", "Third Impact", "The Contact Event", "Evangelion", 250],
    ["What force field generated by Angels and Evangelions represents the boundary of the ego?", "AT Field (Absolute Terror Field)", "Hex Barrier", "LCL Shield", "Positron Wall", "Evangelion", 250],
    ["What is the name of the amber liquid that floods the cockpit plug to supply oxygen and link neural synapses?", "LCL", "NERV fluid", "Adam essence", "Synch blood", "Evangelion", 250],
    ["What divine extraterrestrial spear can bypass any AT Field and pin Lilith in Terminal Dogma?", "Spear of Longinus", "Spear of Cassius", "Lance of God", "Trident of Adam", "Evangelion", 300],
    ["What secret organization oversees NERV and manipulates events according to the Dead Sea Scrolls?", "SEELE", "GEHIRN", "WILLE", "Marduk Institute", "Evangelion", 300],
    ["What is Gendo Ikari's ultimate selfish goal behind the Human Instrumentality Project?", "Reuniting with his deceased wife Yui", "Becoming an omnipotent god", "Saving the human race from extinction", "Destroying all Angels permanently", "Evangelion", 350],
    ["What species of pet animal does Misato Katsuragi keep in her apartment?", "A warm-water penguin (Pen Pen)", "A cat", "A dog", "A ferret", "Evangelion", 200],

    # STEINS;GATE
    ["What chuunibyou pseudonym does Rintaro Okabe use as a self-proclaimed mad scientist?", "Hououin Kyouma", "John Titor", "Doctor Franken", "Kuroba Kaito", "Steins;Gate", 200],
    ["What neuroscience prodigy and Victor Chondria researcher does Okabe nickname Christina?", "Kurisu Makise", "Mayuri Shiina", "Moeka Kiryu", "Faris NyanNyan", "Steins;Gate", 200],
    ["What is Mayuri Shiina's cheerful signature vocal greeting?", "Tuturu~♪", "Yahallo~!", "Nico Nico Nii!", "Gao~!", "Steins;Gate", 200],
    ["What is the name of the invention created by combining a microwave with a mobile phone?", "PhoneWave (name subject to change)", "Future Gadget 8", "Time Jumper", "CERN Diverter", "Steins;Gate", 250],
    ["What strange physical transformation happens to bananas heated inside the PhoneWave?", "They turn into soft green jelly", "They turn into stone", "They disintegrate into smoke", "They explode", "Steins;Gate", 250],
    ["What are text messages sent back in time via the PhoneWave called?", "D-Mails (DeLorean Mails)", "Time Texts", "Chrono Notes", "Leap Pings", "Steins;Gate", 250],
    ["What is Okabe's unique passive ability to retain memories across different worldline shifts?", "Reading Steiner", "World Sight", "Chrono Memory", "Timeline Recall", "Steins;Gate", 250],
    ["What vintage computer is required to decode proprietary SERN database archives?", "IBN 5100", "Apple II", "Commodore 64", "IBM PC XT", "Steins;Gate", 300],
    ["Who is John Titor revealed to be in the Alpha worldline?", "Suzuha Hashida (Daru's future daughter)", "Kurisu Makise", "Mayuri Shiina", "Mr. Braun", "Steins;Gate", 300],
    ["What European nuclear research institute secretly experiments with mini black holes to build a time machine?", "SERN", "CERN", "ITER", "DESY", "Steins;Gate", 250],
    ["What worldline divergence value represents the Steins Gate worldline where both Kurisu and Mayuri live?", "1.048596%", "0.571024%", "0.337187%", "1.130205%", "Steins;Gate", 400],

    # COWBOY BEBOP
    ["What martial art discipline practiced by Bruce Lee does Spike Spiegel employ?", "Jeet Kune Do", "Karate", "Wing Chun", "Judo", "Cowboy Bebop", 250],
    ["What is the name of the converted interplanetary fishing trawler that serves as the crew's spaceship?", "Bebop", "Swordfish II", "Red Tail", "Hammerhead", "Cowboy Bebop", 200],
    ["What converted mono-racer high-speed craft does Spike pilot in combat?", "Swordfish II", "Hammerhead", "Red Tail", "Bebop II", "Cowboy Bebop", 250],
    ["What syndicate was Spike formerly a deadly hitman for alongside Vicious?", "Red Dragon Crime Syndicate", "Blue Cobra Clan", "Titan Cartel", "Mars Mafia", "Cowboy Bebop", 250],
    ["What type of genetically engineered dog is Ein?", "Data Dog (Welsh Corgi)", "Cyber Pug", "Labrador", "Shiba Inu", "Cowboy Bebop", 200],
    ["Why does Faye Valentine suffer from immense debts when she wakes up in 2068?", "Cryogenic freezing hospital fees after 54 years in stasis", "Unpaid gambling loan sharks", "Purchasing luxury space vessels", "Her stolen identity", "Cowboy Bebop", 300],
    ["What is the standard monetary currency used across the solar system in Cowboy Bebop?", "Woolong", "Credits", "Zeni", "Double-Dollars", "Cowboy Bebop", 200],
    ["What physical defect does Spike reveal about his eyes?", "One is a cybernetic replacement that only sees the past", "He is completely blind in his left eye", "He sees infrared heat", "His right pupil is permanently dilated", "Cowboy Bebop", 300],
    ["What is Spike Spiegel's legendary final word as he points his finger at the syndicate camera?", "Bang", "See you", "Adios", "Goodbye", "Cowboy Bebop", 200],
    ["What Earth girl prodigy hacker lives on the Bebop and talks to a computer called Tomato?", "Radical Edward (Ed)", "Julia", "Judy", "Stella", "Cowboy Bebop", 200],

    # CODE GEASS
    ["What power does C.C. grant to Lelouch Lamperouge in Shinjuku Ghetto?", "Geass (The Power of Absolute Obedience)", "Telekinesis", "Future Sight", "Mind Reading", "Code Geass", 200],
    ["What is Lelouch's masked alter-ego when commanding the Black Knights?", "Zero", "V for Victory", "Kuro", "Phantom", "Code Geass", 200],
    ["What rule restricts Lelouch's Geass upon a human target?", "It can only be used once on each person", "It expires after one hour", "The target must share his bloodline", "It requires touching their skin", "Code Geass", 250],
    ["Who is Lelouch's childhood best friend who pilots the white Knightmare Frame Lancelot?", "Suzaku Kururugi", "Gino Weinberg", "Clovis la Britannia", "Rolo Lamperouge", "Code Geass", 200],
    ["What food brand is the immortal witch C.C. obsessed with eating?", "Pizza Hut", "McDonald's", "KFC", "Subway", "Code Geass", 200],
    ["What renamed territorial designation is given to conquered Japan under the Holy Britannian Empire?", "Area 11", "District 9", "Zone 7", "Colony 1", "Code Geass", 200],
    ["What valuable superconductor mineral found abundantly in Japan powers Knightmare Frames?", "Sakuradite", "Vibranium", "Gundanium", "Promethium", "Code Geass", 300],
    ["What tragedy befalls Princess Euphemia due to Lelouch losing control of his Geass?", "She is compelled to order the massacre of the Japanese people", "She goes completely blind", "She attacks Suzaku in battle", "She forgets who she is", "Code Geass", 300],
    ["What was Lelouch's grand master plan named to bring peace to the world through his own death?", "Zero Requiem", "Operation Blackout", "Area 11 Liberation", "Britannian Sunset", "Code Geass", 300],
    ["Who plays the role of Zero during the public assassination of Emperor Lelouch in the finale?", "Suzaku Kururugi", "Kallen Kouzuki", "Jeremiah Gottwald", "Schneizel el Britannia", "Code Geass", 300],

    # OSHI NO KO
    ["What 16-year-old idol star serves as the center of B-Komachi in Oshi no Ko?", "Ai Hoshino", "Kana Arima", "Ruby Hoshino", "Akane Kurokawa", "Oshi no Ko", 200],
    ["What was Aqua Hoshino's profession in his previous life as Gorou Amamiya?", "Obstetrician gynecologist", "Pediatrician", "High school teacher", "Police detective", "Oshi no Ko", 250],
    ["What is Aqua's dark motivation throughout the story of Oshi no Ko?", "Tracking down and killing his biological father who orchestrated Ai's murder", "Becoming the top actor in Japan", "Making Ruby the world's greatest idol", "Taking over Strawberry Productions", "Oshi no Ko", 250],
    ["What was Kana Arima nicknamed during her childhood acting career?", "The genius child actor who can cry on cue in 10 seconds", "The Little Idol Queen", "Tokyo's Sweetheart", "The Screen Princess", "Oshi no Ko", 250],
    ["What theatrical group is the genius method actress Akane Kurokawa a member of?", "Lalalai Theatrical Company", "Gekidan Shiki", "Takarazuka Revue", "Tokyo Stage", "Oshi no Ko", 300],
    ["What internet influencer with small devil horns joins the revived B-Komachi idol group?", "MEM-cho", "Frill Shiranui", "Minami Kotobuki", "Miyako Saitou", "Oshi no Ko", 250],
    ["What agency manages Ai Hoshino and later the reformed B-Komachi?", "Strawberry Productions", "Star Agency", "Dot Idol", "Moonlight Entertainment", "Oshi no Ko", 250],

    # SOLO LEVELING
    ["What title was Sung Jinwoo known by before awakening with the System?", "The Weakest Hunter of All Mankind", "E-Rank Rookie", "The C-Rank Slayer", "The Unlucky One", "Solo Leveling", 200],
    ["What special dungeon did Jinwoo survive by following the commandments of Cartenon Temple?", "The Double Dungeon", "The Red Gate", "The Demon Castle", "Jeju Island Hive", "Solo Leveling", 250],
    ["What is Jinwoo's vocal trigger to extract the shadow of a slain monster or hunter?", "Arise", "Awaken", "Rise Up", "Obey", "Solo Leveling", 200],
    ["What Blood-Red Commander knight becomes Jinwoo's primary armored shadow warrior?", "Igris", "Tank", "Iron", "Beru", "Solo Leveling", 250],
    ["What monstrous ant king extracted from Jeju Island can speak human language and fly?", "Beru", "Kaisel", "Tusk", "Jima", "Solo Leveling", 250],
    ["Which female S-rank hunter from the Hunters Guild is sensitive to the smell of other hunters?", "Cha Hae-in", "Lee Joohee", "Park Heejin", "Yoo Soohyun", "Solo Leveling", 250],
    ["What ancient being selected Sung Jinwoo to inherit the power of the Shadow Monarch?", "Ashborn", "Antares", "Rulers", "Legia", "Solo Leveling", 350],
    ["What elixir did Jinwoo synthesize to cure his mother of the Eternal Slumber disease?", "Holy Water of Life", "Elixir of Immortality", "Divine Dew", "Tears of the Phoenix", "Solo Leveling", 350],

    # BLUE LOCK
    ["What position are all participants in the Blue Lock facility competing to become?", "The world's greatest selfish striker", "An elite central midfielder", "A legendary goalkeeper", "A world-class defender", "Blue Lock", 200],
    ["Who is the eccentric coach and creator of the Blue Lock project?", "Jinpachi Ego", "Anri Teieri", "Tatsuhiko Kaburagi", "Noel Noa", "Blue Lock", 200],
    ["What is Yoichi Isagi's primary spatial weapon on the soccer pitch?", "Spatial awareness and direct volley kick", "Hyper-speed dribbling", "Curved long shots", "Physical shoulder charges", "Blue Lock", 250],
    ["What dribbling prodigy moves according to an inner monster he envisions?", "Meguru Bachira", "Hyoma Chigiri", "Rensuke Kunigami", "Seishiro Nagi", "Blue Lock", 200],
    ["What is Seishiro Nagi's natural soccer superpower before joining Blue Lock?", "God-level ball trapping and first touch", "Rocket long passes", "Sprint speed", "Headers", "Blue Lock", 250],
    ["What nickname does the arrogant, power-oriented striker Shoei Barou give himself?", "The King", "The Emperor", "The Beast", "The God", "Blue Lock", 200],
    ["What injury did Hyoma Chigiri fear re-aggravating before unlocking his top speed?", "Torn right knee ACL", "Broken ankle", "Hamstring tear", "Fractured shin", "Blue Lock", 300],
    ["Who is the younger brother of Sae Itoshi who dominates the Blue Lock rankings?", "Rin Itoshi", "Oliver Aiku", "Ryusei Shido", "Tabito Karasu", "Blue Lock", 250],

    # BOCCHI THE ROCK!
    ["What is Hitori Gotoh's username when uploading virtuoso guitar covers to the internet?", "guitarhero", "bocchirock", "shredgirl", "kessokukid", "Bocchi the Rock!", 200],
    ["What is the name of the four-girl indie rock band formed by Nijika Ichiji?", "Kessoku Band", "Afterglow", "Starry Night", "Pastel Palettes", "Bocchi the Rock!", 200],
    ["What live house club in Shimokitazawa serves as the home base for Kessoku Band?", "STARRY", "SHELTER", "LOFT", "CLUB QUE", "Bocchi the Rock!", 250],
    ["What vintage electric guitar does Bocchi borrow from her father to play in the band?", "Gibson Les Paul Custom (Black Beauty)", "Fender Stratocaster", "Ibanez RG", "Gibson SG", "Bocchi the Rock!", 300],
    ["What eccentric bassist in Kessoku Band frequently runs out of money and eats weeds?", "Ryo Yamada", "Nijika Ichiji", "Ikuyo Kita", "Seika Ichiji", "Bocchi the Rock!", 250],
    ["Why did Ikuyo Kita originally buy a six-string bass guitar by mistake before switching?", "She thought it was a regular electric guitar", "It was on discount sale", "Ryo told her to buy it", "She liked the color red", "Bocchi the Rock!", 300],

    # FATE SERIES
    ["What is Shirou Emiya's ultimate Reality Marble in Fate/stay night?", "Unlimited Blade Works", "Ionian Hetairoi", "Aestus Domus Aurea", "Gate of Babylon", "Fate Series", 200],
    ["What is Saber's true historical identity in Fate/stay night?", "Artoria Pendragon (King Arthur)", "Joan of Arc", "Nero Claudius", "Boudica", "Fate Series", 200],
    ["What is Archer's true identity in Fate/stay night?", "The future heroic spirit of Shirou Emiya (EMIYA)", "Gilgamesh", "Cu Chulainn", "Kotomine Kirei", "Fate Series", 250],
    ["What is Gilgamesh's signature Noble Phantasm that summons endless legendary weapons from his treasury?", "Gate of Babylon", "Enuma Elish", "Chariot of the Sun", "Rho Aias", "Fate Series", 250],
    ["What sword of rupture does Gilgamesh wield to split space and time with Enuma Elish?", "Ea", "Excalibur", "Caliburn", "Gram", "Fate Series", 300],
    ["What weapon used by Lancer Cu Chulainn reverses cause and effect so the spear pierces the heart first?", "Gae Bolg", "Gungnir", "Fragarach", "Harpe", "Fate Series", 250],
    ["What food is Father Kirei Kotomine notoriously obsessed with consuming in large quantities?", "Spicy Mapo Tofu", "Ramen", "Curry Rice", "Sushi", "Fate Series", 250],
    ["Who was Shirou's adoptive father known as the Magus Killer in Fate/Zero?", "Kiritsugu Emiya", "Tokiomi Tohsaka", "Kirei Kotomine", "Waver Velvet", "Fate Series", 250],
    ["What is Berserker Heracles's defensive Noble Phantasm that grants him 12 extra lives?", "God Hand (Twelve Labors)", "Armor of Fafnir", "Lord Camelot", "Nine Lives", "Fate Series", 300],
    ["What city in Japan serves as the battleground for the Holy Grail Wars in Fate/stay night?", "Fuyuki City", "Misaki Town", "Hinatsuru", "Shinjuku", "Fate Series", 200],

    # RE:ZERO
    ["What curse allows Subaru Natsuki to restart from a save point after dying in Re:Zero?", "Return by Death", "Time Reversal", "Witch's Resurrection", "Phoenix Soul", "Re:Zero", 200],
    ["What silver-haired half-elf does Subaru fall in love with upon being summoned?", "Emilia", "Rem", "Ram", "Satella", "Re:Zero", 200],
    ["Which blue-haired maid demon at Roswaal's mansion professes her unconditional love to Subaru in episode 18?", "Rem", "Ram", "Frederica", "Petra", "Re:Zero", 200],
    ["What Sin Archbishop of Sloth contorts his body and screams about being slothful?", "Petelgeuse Romanee-Conti", "Regulus Corneas", "Ley Batenkaitos", "Capella Emerada Lugnica", "Re:Zero", 250],
    ["What gigantic fog-spewing beast of the Three Great Mabeasts was hunted down in Season 1?", "The White Whale", "The Great Rabbit", "The Black Snake", "The Crimson Wyvern", "Re:Zero", 250],
    ["What great spirit resembles a gray cat with a pouch of coins and serves as Emilia's guardian?", "Puck", "Beatrice", "Echidna", "Typhon", "Re:Zero", 200],
    ["What is Beatrice's library called inside Roswaal's mansion?", "The Forbidden Library", "The Sanctuary", "The Archive of Souls", "The Witch's Vault", "Re:Zero", 250],
    ["Who is the Witch of Greed who hosts tea parties with Subaru in the Sanctuary?", "Echidna", "Satella", "Minerva", "Daphne", "Re:Zero", 250],

    # MOB PSYCHO 100
    ["What is Shigeo Kageyama's childhood nickname in Mob Psycho 100?", "Mob", "Psycho", "Spark", "White T-Poison", "Mob Psycho 100", 200],
    ["What happens when Mob's suppressed emotional gauge reaches 100%?", "An explosion of overwhelming psychic power", "He loses consciousness", "He falls asleep", "His physical body turns giant", "Mob Psycho 100", 200],
    ["Who is Mob's con-artist mentor who runs the Spirits and Such Consultation Office?", "Arataka Reigen", "Teruki Hanazawa", "Katsuya Serizawa", "Keiji Mogami", "Mob Psycho 100", 200],
    ["What green upper-class spirit floats alongside Mob as his companion?", "Dimple (Ekubo)", "Matsuo", "Smile", "Banshee", "Mob Psycho 100", 200],
    ["What school club did Mob choose to join instead of the Telepathy Club to improve himself?", "Body Improvement Club", "Soccer Club", "Martial Arts Club", "Cooking Club", "Mob Psycho 100", 250],
    ["Who is Mob's younger brother who developed psychic powers through jealousy?", "Ritsu Kageyama", "Teruki Hanazawa", "Sho Suzuki", "Toichiro Suzuki", "Mob Psycho 100", 250],

    # GURREN LAGANN
    ["What energy source drives spiral beings to evolve and overcome impossible odds in Gurren Lagann?", "Spiral Power", "Anti-Spiral Force", "Photon Energy", "Cosmic Core", "Gurren Lagann", 200],
    ["What charismatic brother figure declares: 'Believe in the me that believes in you!'?", "Kamina", "Simon", "Kittan", "Rossiu", "Gurren Lagann", 200],
    ["What small core drill found underground starts up the mini-Gunmen Lagann?", "Core Drill", "Spiral Key", "Heaven Shifter", "Drill of Destiny", "Gurren Lagann", 250],
    ["What sniper heroine wears a bikini top and flame hair clip in Team Dai-Gurren?", "Yoko Littner", "Nia Teppelin", "Kiyal", "Darry", "Gurren Lagann", 200],
    ["What is Simon's signature mech attack that shatters the heavens?", "Giga Drill Break", "Spiral Buster", "Heavenly Slash", "Super Galaxy Punch", "Gurren Lagann", 250],
    ["Who was the ruler of the Beastmen who kept humanity underground to prevent the Spiral Nemesis?", "Lordgenome (Spiral King)", "Guame", "Cytomander", "Thymilph", "Gurren Lagann", 300],

    # MONSTER & VINLAND SAGA & CLASSICS
    ["Who is the charismatic, psychopathic serial manipulator in Naoki Urasawa's Monster?", "Johan Liebert", "Kenzo Tenma", "Inspector Lunge", "Wolfgang Grimmer", "Monster", 250],
    ["What profession did Dr. Kenzo Tenma hold in Düsseldorf before his life fell apart?", "Neurosurgeon", "Cardiothoracic Surgeon", "Psychiatrist", "Forensic Pathologist", "Monster", 250],
    ["What orphanage in East Germany conducted psychological experiments on children including Johan?", "Kinderheim 511", "Düsseldorf Haven", "St. Jude's Home", "Berlin Center", "Monster", 350],
    ["What picture book by Emil Scherbe plays a central symbolic role in Monster?", "The Nameless Monster", "The Red Dragon", "The Boy with No Shadow", "The Crying Beast", "Monster", 350],
    ["Who murdered Thorfinn's father Thors in Vinland Saga, whom Thorfinn spent years trying to duel?", "Askeladd", "Floki", "Thorkell", "Canute", "Vinland Saga", 250],
    ["What giant warrior in Vinland Saga loves fighting so much he defects to the English just for fun?", "Thorkell the Tall", "Ragnar", "Halfdan", "Garm", "Vinland Saga", 250],
    ["What peaceful fertile continent across the western ocean does Thors and Thorfinn dream of settling?", "Vinland (North America)", "Greenland", "Iceland", "Normandy", "Vinland Saga", 250],
    ["What is Thors's core philosophical lesson passed to Thorfinn before his death?", "You have no enemies. No one has any enemies.", "Strength is the only truth in this world.", "Never trust a Dane.", "A warrior dies with his sword in hand.", "Vinland Saga", 300],

    # VIOLET EVERGARDEN
    ["What occupation does Violet Evergarden take up after the end of the Great War?", "Auto Memory Doll (Ghostwriter)", "Post Office Courier", "Military Officer", "School Teacher", "Violet Evergarden", 200],
    ["What precious gem brooch does Violet cherish because it matches Major Gilbert's eyes?", "Emerald Brooch", "Sapphire Pendant", "Ruby Ring", "Diamond Locket", "Violet Evergarden", 250],
    ["What phrase spoken by Major Gilbert Bougainvillea does Violet spend the story seeking to understand?", "I love you", "Live freely", "Forget about me", "You are human", "Violet Evergarden", 200],
    ["What replaces Violet's arms after they were severed in the final battle of the war?", "Adamantine metallic prosthetic arms", "Wooden automail", "Carbon-fiber claws", "Brass puppet joints", "Violet Evergarden", 250],

    # STUDIO GHIBLI & FILMS
    ["In Spirited Away, what name does the witch Yubaba give to Chihiro Ogino?", "Sen", "Rin", "Kiki", "Satsuki", "Spirited Away", 200],
    ["What creature in Spirited Away offers endless gold nuggets before devouring workers in the bathhouse?", "No-Face (Kaonashi)", "Kamaji", "Boh", "Radish Spirit", "Spirited Away", 200],
    ["What is the real river spirit identity of Haku in Spirited Away?", "Kohaku River Spirit (Nigihayami Kohakunushi)", "Tama River Spirit", "Shinano River Dragon", "Tone River Lord", "Spirited Away", 250],
    ["What fire demon powers the wandering moving castle in Howl's Moving Castle?", "Calcifer", "Turnip Head", "Heen", "Suliman", "Howl's Moving Castle", 200],
    ["What curse turns young Sophie Hatter into a 90-year-old woman in Howl's Moving Castle?", "Curse of the Witch of the Waste", "Madam Suliman's Spell", "Howl's Heart Binding", "The Black Gate Charm", "Howl's Moving Castle", 200],
    ["What giant ancient floating city of legend does Sheeta possess the crystal pendant for in Castle in the Sky?", "Laputa", "Atlantis", "El Dorado", "Agartha", "Castle in the Sky", 200],
    ["What forest god is hunted down by Lady Eboshi in Princess Mononoke?", "The Great Forest Spirit (Shishigami)", "Moro the Wolf Goddess", "Okkoto the Boar God", "Kodan", "Princess Mononoke", 250],
    ["What small white tree spirits rattle their heads in the enchanted forest of Princess Mononoke?", "Kodama", "Soot Sprites", "Totoro", "Kitsune", "Princess Mononoke", 200],
    ["In Makoto Shinkai's Your Name, what body-swapping teenagers connect across different timelines?", "Taki Tachibana and Mitsuha Miyamizu", "Hodaka and Hina", "Souta and Suzume", "Takao and Yukino", "Your Name", 200],
    ["What celestial disaster threatens the mountain town of Itomori in Your Name?", "A fragment of Comet Tiamat striking the town", "A volcanic eruption", "A massive tsunami", "An earthquake sinkhole", "Your Name", 250],
    ["What is Hina Amano's supernatural power in Weathering With You?", "100% Sunshine Girl who can clear the rain by praying", "Freezing water", "Summoning thunderstorms", "Controlling sea tides", "Weathering With You", 200],
    ["In Suzume, what entity transforms into a three-legged chair after Souta is cursed?", "Souta Munakata", "Daijin the Cat", "Suzume's Uncle", "Tomoya Serizawa", "Suzume", 200],

    # MORE ONE PIECE, NARUTO, DRAGON BALL EXPANSIONS
    ["What is the ancient kingdom weapon buried under Wano according to Kozuki Sukiyaki?", "Pluton", "Poseidon", "Uranus", "Noah", "One Piece", 350],
    ["Which princess was revealed to be the ancient living weapon Poseidon in One Piece?", "Princess Shirahoshi", "Princess Vivi", "Princess Rebecca", "Princess Mansherry", "One Piece", 300],
    ["What are the mysterious giant indestructible cubes with historical text called in One Piece?", "Poneglyphs", "Log Poses", "Dials", "Bubbly Stones", "One Piece", 250],
    ["What is the name of Gol D. Roger's first mate and the Dark King who trained Luffy?", "Silvers Rayleigh", "Crocus", "Scopper Gaban", "Kozuki Oden", "One Piece", 250],
    ["What is the name of Luffy's father who leads the Revolutionary Army?", "Monkey D. Dragon", "Monkey D. Garp", "Jaguar D. Saul", "Portgas D. Ace", "One Piece", 200],
    ["Who is the supreme secret monarch of the World Government sitting on the Empty Throne?", "Imu (I-mu)", "Gorosei Saturn", "Akainu", "Kong", "One Piece", 350],
    ["What island is the location of Dr. Vegapunk's futuristic research laboratory?", "Egghead Island", "Punk Hazard", "Karakuri Island", "Baltigo", "One Piece", 300],
    ["What is Roronoa Zoro's cursed white sword from Shimotsuki Kozaburo?", "Wado Ichimonji", "Sandai Kitetsu", "Shusui", "Enma", "One Piece", 300],
    ["What sword belonging to Kozuki Oden did Zoro receive in exchange for Shusui in Wano?", "Enma", "Ame no Habakiri", "Yoru", "Nidai Kitetsu", "One Piece", 300],
    ["What is Sanji's dream sea where all four oceans meet and every fish species exists?", "All Blue", "Grand Line", "Calm Belt", "Eden Sea", "One Piece", 200],
    ["Who is the captain of the Heart Pirates who allied with Luffy against Doflamingo and Kaido?", "Trafalgar D. Water Law", "Eustass Kid", "Killer", "Bepo", "One Piece", 200],
    ["What is the signature technique of Pain in Naruto that repels all matter and attacks?", "Shinra Tensei (Almighty Push)", "Bansho Ten'in", "Chibaku Tensei", "Gedo Art", "Naruto", 250],
    ["What massive spherical gravity technique does Pain use to trap the Nine-Tails in the sky?", "Chibaku Tensei (Planetary Devastation)", "Shinra Tensei", "Kirin", "Amaterasu", "Naruto", 250],
    ["Who was Naruto's first teacher at the Ninja Academy who acknowledged him and bought him ramen?", "Iruka Umino", "Kakashi Hatake", "Jiraiya", "Ebisu", "Naruto", 200],
    ["What is Jiraiya's self-appointed wandering author title and mentor handle?", "Toad Sage (Ero-Sennin)", "Snake Sage", "Slug Master", "Konoha Fang", "Naruto", 200],
    ["What technique created by Kakashi Hatake concentrates lightning chakra into the palm?", "Chidori (Raikiri)", "Rasengan", "Raijin", "Chidori Stream", "Naruto", 200],
    ["What black inextinguishable flames are produced by the Mangekyo Sharingan?", "Amaterasu", "Tsukuyomi", "Kagutsuchi", "Kamui", "Naruto", 250],
    ["What space-time dojutsu technique does Obito Uchiha use to make his body intangible?", "Kamui", "Izanagi", "Kotoamatsukami", "Susanoo", "Naruto", 300],
    ["Who was the first Hokage of the Hidden Leaf Village who mastered Wood Release?", "Hashirama Senju", "Tobirama Senju", "Hiruzen Sarutobi", "Minato Namikaze", "Naruto", 250],
    ["What was the name of the colossal samurai avatar formed by Mangekyo Sharingan chakra?", "Susanoo", "Bijuu Mode", "Sage Cloak", "Asura Avatar", "Naruto", 250],
    ["What Saiyan prince is Goku's eternal rival in Dragon Ball Z?", "Vegeta", "Broly", "Raditz", "Nappa", "Dragon Ball", 200],
    ["What beam attack taught by Master Roshi is Goku's iconic finisher?", "Kamehameha", "Final Flash", "Galick Gun", "Special Beam Cannon", "Dragon Ball", 200],
    ["What green Namekian warrior sacrifices himself to protect Gohan from Nappa?", "Piccolo", "Kami", "Dende", "Nail", "Dragon Ball", 200],
    ["What wish-granting dragon on Planet Namek is summoned with the Namekian language?", "Porunga", "Shenron", "Super Shenron", "Toronbo", "Dragon Ball", 300],
    ["What sword technique does Future Trunks use to instantly dice Frieza upon arriving on Earth?", "Shining Sword Attack", "Buster Cannon", "Burning Attack", "Heat Dome Attack", "Dragon Ball", 250],
    ["What silver-haired state of divine martial arts does Goku achieve against Jiren in the Tournament of Power?", "Mastered Ultra Instinct", "Super Saiyan Blue Kaioken", "Super Saiyan God", "Ultra Ego", "Dragon Ball", 250],
    ["What purple aura transformation fueled by destruction does Vegeta unlock in Dragon Ball Super?", "Ultra Ego", "Ultra Instinct", "Super Saiyan Rose", "Royal Blue", "Dragon Ball", 300],
    ["What warrior from Universe 11 pushed Goku to the absolute limit in the Tournament of Power?", "Jiren", "Toppo", "Dyspo", "Hit", "Dragon Ball", 250],
]

# Append new questions to existing
all_questions = existing_questions + new_questions

# Deduplicate by question text
unique_dict = {}
for q in all_questions:
    key = q[0].strip().lower()
    if key not in unique_dict:
        unique_dict[key] = q

deduped = list(unique_dict.values())
print(f"Total unique anime questions after merge: {len(deduped)}")

with open(existing_path, 'w', encoding='utf-8') as f:
    json.dump(deduped, f, ensure_ascii=False, indent=2)

print("Saved updated anime_raw.json successfully.")
