import json, os

existing_path = r'C:\Users\luisc\Desktop\Project\PochiPochi\server\anime_raw.json'
with open(existing_path, 'r', encoding='utf-8') as f:
    existing_questions = json.load(f)

print(f"Loaded {len(existing_questions)} existing questions.")

new_questions = [
    # ONE PUNCH MAN
    ["What daily training routine gave Saitama his overwhelming strength at the cost of his hair?", "100 push-ups, 100 sit-ups, 100 squats, and a 10km run every single day", "1000 push-ups and lifting cars", "Meditating under waterfalls for 10 years", "Injecting monster cells", "One Punch Man", 200],
    ["Who is Saitama's loyal cyborg disciple who takes notes on everything he does?", "Genos (Demon Cyborg)", "Drive Knight", "Metal Knight", "Child Emperor", "One Punch Man", 200],
    ["What S-Class Rank 2 hero is a petite esper with immense telekinetic power?", "Tatsumaki (Tornado of Terror)", "Fubuki (Blizzard of Hell)", "Psykos", "Do-S", "One Punch Man", 200],
    ["Who is known as the Strongest Man on Earth, though his real power is extreme luck and the King Engine heartbeat?", "King", "Bang", "Atomic Samurai", "Superalloy Darkshine", "One Punch Man", 200],
    ["Who is the martial arts master known as Silver Fang, user of the Water Stream Rock Smashing Fist?", "Bang", "Bomb", "Garou", "Suiryu", "One Punch Man", 250],
    ["Who is the Hero Hunter and former disciple of Bang who transforms into a half-monster?", "Garou", "Sonic", "Boros", "Gouketsu", "One Punch Man", 250],
    ["What alien warlord survived Saitama's normal punches and forced him to use a Serious Punch?", "Lord Boros", "Deep Sea King", "Carnage Kabuto", "Vaccine Man", "One Punch Man", 250],
    ["What C-Class Rank 1 hero rides his bicycle of justice and never gives up against impossible monsters?", "Mumen Rider", "Stinger", "Lightning Max", "Tanktop Tiger", "One Punch Man", 200],
    ["What ninja rival of Saitama constantly trains to kill him but repeatedly humiliates himself?", "Speed-o'-Sound Sonic", "Flashy Flash", "Hellfire Flame", "Gale Wind", "One Punch Man", 200],
    ["What hero fights by wielding an indestructible metal baseball bat fueled by fighting spirit?", "Metal Bat (Bad)", "Puri-Puri Prisoner", "Zombieman", "Tanktop Master", "One Punch Man", 250],

    # DETECTIVE CONAN / CASE CLOSED
    ["What drug developed by the Black Organization shrank high school detective Shinichi Kudo into a child?", "APTX 4869", "Sherry Formula", "Snake Venom 9", "Kudo Toxin", "Detective Conan", 200],
    ["What alias does Shinichi adopt, taking inspiration from Sir Arthur Conan Doyle?", "Conan Edogawa", "Kogoro Mouri", "Heiji Hattori", "Kaito Kid", "Detective Conan", 200],
    ["What two Black Organization agents in black coats forced Shinichi to ingest the APTX 4869 poison?", "Gin and Vodka", "Bourbon and Rye", "Chianti and Korn", "Vermouth and Pisco", "Detective Conan", 200],
    ["Who is Conan's childhood friend and romantic interest whose father is the sleeping detective Kogoro?", "Ran Mouri", "Sonoko Suzuki", "Kazuha Toyama", "Ai Haibara", "Detective Conan", 200],
    ["What former Black Organization scientist and creator of APTX 4869 (code-named Sherry) also shrank into a child?", "Ai Haibara (Shiho Miyano)", "Vermouth", "Kir", "Jodie Starling", "Detective Conan", 250],
    ["What phantom thief and master of disguise frequently clashes with Conan while seeking the Pandora gem?", "Kaito Kid (Kaito Kuroba)", "Lupin III", "Phantom Raven", "Black Star", "Detective Conan", 200],
    ["What Kansai high school detective is Shinichi's close friend and rival from Osaka?", "Heiji Hattori", "Saguru Hakuba", "Makoto Kyogoku", "Eisuke Hondo", "Detective Conan", 250],
    ["What FBI agent and master sniper faked his death with Conan's help and lives under the alias Subaru Okiya?", "Shuichi Akai (Rye)", "Rei Furuya (Bourbon)", "James Black", "Andre Camel", "Detective Conan", 300],
    ["What gadget created by Professor Agasa allows Conan to impersonate Kogoro Mouri's voice?", "Voice-Changing Bowtie", "Stun-Gun Watch", "Turbo Engine Skateboard", "Super Sneakers", "Detective Conan", 200],

    # FAIRY TAIL
    ["What type of magic does Natsu Dragneel use, taught to him by the dragon Igneel?", "Fire Dragon Slayer Magic", "Lightning Dragon Slayer", "Iron Dragon Slayer", "Sky Dragon Slayer", "Fairy Tail", 200],
    ["Who is Natsu's blue flying Exceed cat companion who loves fish and says 'Aye!'?", "Happy", "Carla", "Panther Lily", "Frosch", "Fairy Tail", 200],
    ["What Celestial Spirit wizard summons spirits using gold and silver zodiac keys?", "Lucy Heartfilia", "Yukino Agria", "Layla Heartfilia", "Karen Lilica", "Fairy Tail", 200],
    ["What Ice-Make wizard is Natsu's eternal rival who has a habit of unintentionally stripping?", "Gray Fullbuster", "Lyon Vastia", "Ur", "Silver Fullbuster", "Fairy Tail", 200],
    ["What S-Class mage known as Titania utilizes Requip magic to swap armor and weapons instantly?", "Erza Scarlet", "Mirajane Strauss", "Cana Alberona", "Juvia Lockser", "Fairy Tail", 200],
    ["Who is the tiny, grandfatherly Third (and Sixth and Eighth) Master of the Fairy Tail guild?", "Makarov Dreyar", "Gildarts Clive", "Precht Gaebolg", "Mavis Vermillion", "Fairy Tail", 250],
    ["Who is the founding First Master of Fairy Tail whose ethereal spirit resides on Tenrou Island?", "Mavis Vermillion", "Yury Dreyar", "Warrod Sequen", "Zeira", "Fairy Tail", 250],
    ["Who is the ancient immortal dark mage and creator of the Etherious demons, who is also Natsu's older brother?", "Zeref Dragneel", "Acnologia", "August", "Mard Geer", "Fairy Tail", 300],
    ["What terrifying dragon known as the Black Dragon of the Apocalypse slaughters dragons and humans alike?", "Acnologia", "Igneel", "Grandeeney", "Metalicana", "Fairy Tail", 250],
    ["What Dragon Slayer possesses the power of Sky Dragon Slayer magic to heal wounds and control wind?", "Wendy Marvell", "Cobra", "Sting Eucliffe", "Rogue Cheney", "Fairy Tail", 200],

    # BLACK CLOVER
    ["What condition makes Asta completely unique in the magical Clover Kingdom?", "He possesses zero magic power", "He has two magic affinities", "He has infinite mana", "He can only use forbidden magic", "Black Clover", 200],
    ["What rare grimoire does Asta receive, housing a demon and anti-magic swords?", "Five-Leaf Clover Grimoire", "Four-Leaf Clover Grimoire", "Three-Leaf Clover Grimoire", "Black Rose Grimoire", "Black Clover", 200],
    ["Who is Asta's childhood rival and foster brother who received a legendary four-leaf clover grimoire?", "Yuno Grinberryall", "Nozel Silva", "Fuegoleon Vermillion", "Finral Roulacase", "Black Clover", 200],
    ["What ragtag, chaotic Magic Knight squad does Asta join, led by Captain Yami Sukehiro?", "Black Bulls", "Golden Dawn", "Silver Eagles", "Crimson Lion Kings", "Black Clover", 200],
    ["What Magic Knight captain uses Dark Magic and katana strikes, repeatedly telling his squad to 'surpass your limits'?", "Yami Sukehiro", "William Vangeance", "Jack the Ripper", "Mereoleona Vermillion", "Black Clover", 200],
    ["What water-magic noblewoman of the Silva family struggles with her aim before mastering Valkyrie Dress?", "Noelle Silva", "Mimosa Vermillion", "Charlotte Roselei", "Nebra Silva", "Black Clover", 200],
    ["Who serves as the Wizard King of the Clover Kingdom with a deep fascination for exotic magic?", "Julius Novachrono", "Lumiere Silvamillion Clover", "Marx Francois", "Damnatio Kira", "Black Clover", 250],
    ["What is the name of the devil residing within Asta's five-leaf grimoire who shares a brotherly bond with him?", "Liebe", "Zagred", "Lucifero", "Megicula", "Black Clover", 300],
    ["What fierce female captain took over the Crimson Lion Kings and attacks with fiery bare-knuckle brawling?", "Mereoleona Vermillion", "Fuegoleon Vermillion", "Leopold Vermillion", "Dorothy Unsworth", "Black Clover", 250],

    # TOKYO GHOUL
    ["What college student was turned into a one-eyed ghoul after an organ transplant from Rize Kamishiro?", "Ken Kaneki", "Hideyoshi Nagachika", "Nishiki Nishio", "Koutarou Amon", "Tokyo Ghoul", 200],
    ["What coffee shop in the 20th Ward serves as a peaceful sanctuary for ghouls?", "Anteiku", "Helter Skelter", "Re:", "Kamii", "Tokyo Ghoul", 200],
    ["What predatory organ do ghouls manifest in combat, categorized into Ukaku, Koukaku, Rinkaku, and Bikaku?", "Kagune", "Quinque", "Kakuja", "Kakuhou", "Tokyo Ghoul", 250],
    ["What weapons created by the CCG utilize harvested ghoul kakuhou to fight ghouls?", "Quinque", "Kagune", "Arata", "Breaker", "Tokyo Ghoul", 250],
    ["Who is the undefeated CCG Special Class investigator known as the White Reaper of the CCG?", "Kisho Arima", "Koutarou Amon", "Kureo Mado", "Juuzou Suzuya", "Tokyo Ghoul", 250],
    ["What sadistic torture at the hands of Yakumo Oomori (Yamori / Jason) turned Kaneki's hair white?", "Endless toe and finger snapping while counting backwards by 7 from 1000", "Starvation in a sealed vault", "Electric shock therapy", "Poison gas immersion", "Tokyo Ghoul", 250],
    ["What mask does Ken Kaneki wear in battle, crafted by the mask-maker Uta?", "A black leather mask with an exposed left eye and toothy zipper smile", "A white fox mask", "A clown mask", "A bird beak plague doctor mask", "Tokyo Ghoul", 200],
    ["Who is revealed to be the One-Eyed Owl who founded the militant ghoul organization Aogiri Tree?", "Eto Yoshimura (Sen Takatsuki)", "Yoshimura (Kuzen)", "Tatara", "Noro", "Tokyo Ghoul", 300],

    # THE RISING OF THE SHIELD HERO
    ["What weapon was Naofumi Iwatani granted when summoned to the kingdom of Melromarc as a Cardinal Hero?", "The Legendary Shield", "The Legendary Sword", "The Legendary Spear", "The Legendary Bow", "The Rising of the Shield Hero", 200],
    ["What demi-human raccoon girl did Naofumi buy from the slave trader, who becomes his loyal sword?", "Raphtalia", "Filo", "Melty", "Sadeena", "The Rising of the Shield Hero", 200],
    ["What giant bird creature hatched from an egg purchased by Naofumi, transforming into a winged girl?", "Filo (Filolial Queen)", "Fitoria", "Gaelion", "Rino", "The Rising of the Shield Hero", 200],
    ["What manipulative first princess falsely accused Naofumi of assault, earning the legal name 'Bitch'?", "Malty S. Melromarc", "Melty Q. Melromarc", "Mirellia Q. Melromarc", "Atla", "The Rising of the Shield Hero", 200],
    ["What catastrophic periodic dimensional incursions must the Four Cardinal Heroes defend the world against?", "Waves of Catastrophe", "The Great Calamity", "Dragon Raids", "Abyssal Rifts", "The Rising of the Shield Hero", 250],

    # THAT TIME I GOT REINCARNATED AS A SLIME (TENSLURA)
    ["What office worker was stabbed on the street and reincarnated as a blue slime monster?", "Satoru Mikami (Rimuru Tempest)", "Tamura", "Yuuki Kagurazaka", "Kenya Misaki", "Slime Isekai", 200],
    ["What ancient Storm Dragon was sealed inside the cave where Rimuru first awakened, becoming his sworn friend?", "Veldora Tempest", "Velgrynd", "Velzard", "Ifrit", "Slime Isekai", 200],
    ["What unique skill possessed by Rimuru provides instant analysis, appraisal, and tactical calculations?", "Great Sage (later Raphael)", "Gluttony", "Predator", "Beelzebuth", "Slime Isekai", 200],
    ["What title does Rimuru claim after wiping out the 20,000 soldiers of the Falmuth army to revive his citizens?", "True Demon Lord (Octagram member)", "Hero of the West", "Dragon Emperor", "High King", "Slime Isekai", 250],
    ["What pink-haired ancient Dragonoid Demon Lord is Rimuru's self-proclaimed 'bestie'?", "Milim Nava", "Ramiris", "Luminous Valentine", "Carrion", "Slime Isekai", 200],
    ["Who is the purple-haired kijin secretary who is devoted to Rimuru but cooks lethal food?", "Shion", "Shuna", "Souei", "Hakuro", "Slime Isekai", 200],
    ["What primordial black demon was summoned by Rimuru as an archdemon and serves as his fanatic butler?", "Diablo (Noir)", "Guy Crimson", "Beretta", "Ultima", "Slime Isekai", 250],

    # KUROKO'S BASKETBALL (KUROKO NO BASKE)
    ["What middle school team produced the legendary basketball prodigies known as the Generation of Miracles?", "Teiko Junior High", "Seirin High", "Shutoku High", "Rakuzan High", "Kuroko's Basketball", 200],
    ["What unique playstyle does Tetsuya Kuroko use on the court?", "Misdirection and touch passes as the Phantom Sixth Man", "Thunderous slam dunks", "Full-court three-point shots", "Lockdown post defense", "Kuroko's Basketball", 200],
    ["What high-flying American-raised power forward becomes Kuroko's new 'light' at Seirin High?", "Taiga Kagami", "Junpei Hyuga", "Teppei Kiyoshi", "Shun Izuki", "Kuroko's Basketball", 200],
    ["Which Generation of Miracles shooting guard can accurately shoot three-pointers from anywhere on the court?", "Shintaro Midorima", "Daiki Aomine", "Ryota Kise", "Atsushi Murasakibara", "Kuroko's Basketball", 200],
    ["What former ace of Teiko declared: 'The only one who can beat me, is me!'?", "Daiki Aomine", "Seijuro Akashi", "Taiga Kagami", "Ryota Kise", "Kuroko's Basketball", 200],
    ["What is Seijuro Akashi's terrifying optical ability that predicts opponent movements and causes ankle-breaks?", "Emperor Eye", "Hawk Eye", "Eagle Eye", "Zone Vision", "Kuroko's Basketball", 250],
    ["What heightened mental state allows prodigy athletes to perform at 100% of their physical potential?", "The Zone", "Direct Drive", "Perfect Copy", "Phantom Flow", "Kuroko's Basketball", 250],

    # HAIKYUU!!
    ["What high school volleyball team do Hinata and Kageyama join, nicknamed the Fallen Crows?", "Karasuno High School", "Aoba Johsai", "Nekoma High", "Fukurodani Academy", "Haikyuu!!", 200],
    ["What position did Shoyo Hinata play despite his diminutive height of 162 cm?", "Middle Blocker", "Libero", "Setter", "Wing Spiker", "Haikyuu!!", 200],
    ["What was Tobio Kageyama's middle school nickname due to his oppressive, demanding sets?", "The King of the Court", "The Volleyball Tyrant", "The Iron Wall", "The Prodigy", "Haikyuu!!", 200],
    ["What Karasuno libero is nicknamed Karasuno's Guardian Deity for his impossible diving saves?", "Yu Nishinoya", "Ryunosuke Tanaka", "Daichi Sawamura", "Kei Tsukishima", "Haikyuu!!", 200],
    ["What is the traditional practice rivalry match between Karasuno and Nekoma High called?", "The Dumpster Battle (Battle at the Garbage Dump)", "The Crow vs Cat Showdown", "The Tokyo Climax", "The Wings Classic", "Haikyuu!!", 250],
    ["Who is the charismatic, handsome setter and captain of Aoba Johsai (Seijoh) who mentored Kageyama?", "Toru Oikawa", "Hajime Iwaizumi", "Kentaro Kyotani", "Akira Kunimi", "Haikyuu!!", 200],
    ["What powerhouse left-handed ace from Shiratorizawa Academy was the undisputed king of Miyagi prefecture?", "Wakatoshi Ushijima", "Satori Tendo", "Tsutomu Goshiki", "Kenjiro Shirabu", "Haikyuu!!", 250],
    ["What energetic ace of Fukurodani Academy experiences severe emo mood swings mid-match?", "Kotaro Bokuto", "Keiji Akaashi", "Tetsuro Kuroo", "Kenma Kozume", "Haikyuu!!", 200],

    # ASSASSINATION CLASSROOM
    ["What yellow octopus-like creature threatened to destroy the Earth unless Class 3-E assassinate him?", "Koro-sensei", "Shiro", "Reaper", "Itona", "Assassination Classroom", 200],
    ["What top speed can Koro-sensei fly at while dodging sniper rounds and grading tests?", "Mach 20", "Mach 5", "Mach 50", "Speed of Sound", "Assassination Classroom", 200],
    ["What blue-haired, quiet student in Class 3-E has a natural, hidden talent for assassination?", "Nagisa Shiota", "Karma Akabane", "Tomohito Sugino", "Yuma Isogai", "Assassination Classroom", 200],
    ["What rebellious, red-haired genius student is the first to inflict physical damage on Koro-sensei?", "Karma Akabane", "Ryoma Terasaka", "Nagisa Shiota", "Hiroto Maehara", "Assassination Classroom", 200],
    ["What materials are safe for humans but melt Koro-sensei's tentacles like acid?", "Anti-Sensei BB pellets and rubber knives", "Silver bullets and holy water", "Liquid nitrogen and iron blades", "Saltwater and copper wires", "Assassination Classroom", 250],
    ["What is the foreign assassin teacher Irina Jelavic nicknamed by the students of Class 3-E?", "Bitch-sensei", "Professor Viper", "Madame Rose", "Blonde Assassin", "Assassination Classroom", 200],

    # DR. STONE
    ["What scientific compound made from nitric acid and alcohol did Senku discover to reverse petrification?", "Nital solution (miracle fluid)", "Aqua regia", "Sulfuric acid", "Acetone extract", "Dr. Stone", 200],
    ["Who is Senku's brawny childhood best friend with boundless stamina who stayed conscious for 3,700 years?", "Taiju Oki", "Chrome", "Kinro", "Ginro", "Dr. Stone", 200],
    ["Who was the martial artist revived by Senku who sought to eliminate adults and build an Empire of Might?", "Tsukasa Shishio", "Hyoga", "Ukyo Saionji", "Yo Uei", "Dr. Stone", 200],
    ["What village populated by descendants of astronauts from the International Space Station did Senku find?", "Ishigami Village", "Tsukasa Village", "Science Town", "Petri Village", "Dr. Stone", 250],
    ["Who is the self-proclaimed 'sorcerer' of Ishigami Village who becomes Senku's fellow science apprentice?", "Chrome", "Kaseki", "Gen Asagiri", "Magma", "Dr. Stone", 200],
    ["What mentalist magician was sent by Tsukasa to spy on Senku but switched sides for a glass of cola?", "Gen Asagiri", "Ryusui Nanami", "Francois", "Stanley Snyder", "Dr. Stone", 250],
    ["What mysterious entity sends Morse code broadcasts from the Moon asking: 'WHY'?", "Why-Man", "The Medusa AI", "The Stone Master", "Dr. Xeno", "Dr. Stone", 300],

    # FIRE FORCE
    ["What third-generation pyrokinetic hero is known as Devil's Footprints because flames emit from his feet?", "Shinra Kusakabe", "Arthur Boyle", "Tamaki Kotatsu", "Takehisa Hinawa", "Fire Force", 200],
    ["What delusional second-generation pyrokinetic fights with a plasma-blade sword and believes he is King Arthur?", "Arthur Boyle", "Ogun Montgomery", "Toru Kishiri", "Pan Ko Paat", "Fire Force", 200],
    ["What Captain of Special Fire Force Company 8 has no pyrokinetic abilities and trains purely with heavy iron weights?", "Akitaru Obi", "Leonard Burns", "Soichiro Hague", "Kayoko Huang", "Fire Force", 200],
    ["What mysterious white flame phenomenon connects chosen pyrokinetics directly to the Evangelist's realm?", "Adolla Burst", "Infernal Flame", "Hellfire Spark", "Solar Core", "Fire Force", 250],
    ["Who is Shinra's younger brother who was kidnapped as an infant to serve as the Evangelist's commander?", "Sho Kusakabe", "Charon", "Inca Kasugatani", "Haumea", "Fire Force", 250],

    # MUSHOKU TENSEI: JOBLESS REINCARNATION
    ["What was Rudeus Greyrat's blue-haired Water Saint Magician tutor who gifted him his first staff?", "Roxy Migurdia", "Sylphiette", "Eris Boreas Greyrat", "Zenith Greyrat", "Mushoku Tensei", 200],
    ["What fierce, red-haired noble swordswoman did Rudeus tutor before the Teleportation Incident?", "Eris Boreas Greyrat", "Ghislaine Dedoldia", "Ariel Anemoi Asura", "Linia Dedoldia", "Mushoku Tensei", 200],
    ["What green-haired half-elf childhood friend of Rudeus later enrolled in the Magic Academy disguised as Silent Fitz?", "Sylphiette", "Elinalise Dragonroad", "Sara", "Nanahoshi Shizuka", "Mushoku Tensei", 200],
    ["What terrifying god-level entity known as the Dragon God obliterated Rudeus's chest during their first encounter?", "Orsted", "Hitogami (Man-God)", "Perugius Dola", "Laplace", "Mushoku Tensei", 300],
    ["What emerald-haired warrior from the feared Superd race escorted Rudeus and Eris across the Demon Continent?", "Ruijerd Superdia", "Nokopara", "Badi Gadi", "Kishirika Kishirisu", "Mushoku Tensei", 250],
    ["What mysterious divine trickster appears in Rudeus's dreams to give deceptive advice?", "Hitogami (The Man-God)", "The Dragon God", "The Water God", "The First King", "Mushoku Tensei", 250],

    # CLASSROOM OF THE ELITE
    ["What class was Kiyotaka Ayanokoji assigned to at the Tokyo Metropolitan Advanced Nurturing High School?", "Class 1-D (The Defective Class)", "Class 1-A", "Class 1-B", "Class 1-C", "Classroom of the Elite", 200],
    ["What clandestine government research facility trained Ayanokoji to excel in every cognitive and physical domain?", "The White Room", "Project Genesis", "Section 4", "The Eden Project", "Classroom of the Elite", 250],
    ["Who is the aloof black-haired girl who aims to rise to Class A, acting as Ayanokoji's public mouthpiece?", "Suzune Horikita", "Kikyo Kushida", "Kei Karuizawa", "Honami Ichinose", "Classroom of the Elite", 200],
    ["What cheerful, popular classmate hides a dark, hateful personality that was accidentally discovered by Ayanokoji?", "Kikyo Kushida", "Maya Sato", "Airi Sakura", "Hiyori Shiina", "Classroom of the Elite", 250],
    ["What blonde student who suffered middle-school bullying becomes Ayanokoji's most trusted confidante and partner?", "Kei Karuizawa", "Honami Ichinose", "Arisu Sakayanagi", "Mio Ibuki", "Classroom of the Elite", 250],
    ["Who is the crippled, smug leader of Class A who utilizes a cane and knew Ayanokoji from the White Room?", "Arisu Sakayanagi", "Kakeru Ryuen", "Kohei Katsuragi", "Masayoshi Hashimoto", "Classroom of the Elite", 300],

    # SWORD ART ONLINE (SAO)
    ["What VRMMORPG creator trapped 10,000 players inside the death game Sword Art Online?", "Akihiko Kayaba (Heathcliff)", "Sugou Nobuyuki", "Seijiro Kikuoka", "Johnny Black", "Sword Art Online", 200],
    ["What two swords did Kirito wield when revealing his unique Dual Blades skill against the Gleam Eyes?", "Elucidator and Dark Repulser", "Lambent Light and Liberator", "Night Sky Sword and Blue Rose Sword", "Anneal Blade and Wind Fleuret", "Sword Art Online", 200],
    ["What guild was led by Heathcliff, renowned as the strongest clearing guild in SAO?", "Knights of the Blood Oath (KoB)", "Fairy Dance", "Aincrad Liberators", "Moonlit Black Cats", "Sword Art Online", 250],
    ["What sniper rifle user suffered from gun trauma in real life before teaming up with Kirito in Gun Gale Online?", "Sinon (Shino Asada)", "Asuna", "Suguha (Leafa)", "Silica", "Sword Art Online", 200],
    ["What anti-materiel sniper rifle does Sinon use in Gun Gale Online?", "PGM Ultima Ratio Hecate II", "Accuracy International AWM", "Barrett M82", "Dragunov SVD", "Sword Art Online", 250],
    ["Who was Kirito's noble partner and swordsman apprentice in the Underworld who wielded the Blue Rose Sword?", "Eugeo", "Bercouli", "Fanatio", "Eldrie", "Sword Art Online", 250],
    ["What highest-ranking Administrator ruled the Axiom Church from the Central Cathedral in Alicization?", "Quinella (Administrator)", "Cardinal", "Chudelkin", "Gabriel Miller", "Sword Art Online", 300],

    # NO GAME NO LIFE
    ["What unbeaten gaming duo composed of step-siblings Sora and Shiro plays under what blank username?", "Blank [ ]", "Zero", "White", "Ghost", "No Game No Life", 200],
    ["What God of Games summoned Sora and Shiro to the fantasy world of Disboard?", "Tet", "Artosh", "Kainas", "Okan", "No Game No Life", 200],
    ["How many Pledges (Rules) govern all disputes, territory, and wagers on the world of Disboard?", "Ten Pledges (10)", "Sixteen Pledges", "Seven Pledges", "Twelve Pledges", "No Game No Life", 200],
    ["What wing-headed Flügel library guardian challenged Sora and Shiro to a game of Materialization Shiritori?", "Jibril", "Azril", "Raphael", "Fiel Nirvalen", "No Game No Life", 250],
    ["What lowest-ranked human race without magic on Disboard is represented by Sora and Shiro?", "Imanity", "Warbeasts", "Elves", "Dwarves", "No Game No Life", 200],

    # KILL LA KILL
    ["What weapon does Ryuko Matoi carry to avenge her father Isshin Matoi?", "A red Scissor Blade", "A wooden bokuto", "A chain scythe", "A mechanical rapier", "Kill la Kill", 200],
    ["What sentient sailor uniform made of 100% Life Fibers transforms Ryuko in battle?", "Senketsu", "Junketsu", "Shinra-Koketsu", "Bakuzan", "Kill la Kill", 200],
    ["Who is the iron-fisted Student Council President of Honnouji Academy who wields the sword Bakuzan?", "Satsuki Kiryuin", "Ragyo Kiryuin", "Nui Harime", "Mako Mankanshoku", "Kill la Kill", 200],
    ["Who is Ryuko's hyperactive best friend who is president of the Fight Club and delivers inspirational speeches?", "Mako Mankanshoku", "Nonon Jakuzure", "Houka Inumuta", "Ira Gamagori", "Kill la Kill", 200],

    # DANGANRONPA
    ["What title was granted to Makoto Naegi when entering Hope's Peak Academy through a random lottery?", "Ultimate Lucky Student (later Ultimate Hope)", "Ultimate Detective", "Ultimate Affluent Progeny", "Ultimate Swimmer", "Danganronpa", 200],
    ["What two-toned robotic bear acts as the sadistic headmaster of Hope's Peak Academy?", "Monokuma", "Monomi", "Kurokuma", "Shirokuma", "Danganronpa", 200],
    ["Who is the Ultimate Fashionista revealed to be the true mastermind behind the Killing Game?", "Junko Enoshima", "Mukuro Ikusaba", "Celestia Ludenberg", "Sayaka Maizono", "Danganronpa", 200],
    ["What mysterious, stoic girl in Trigger Happy Havoc discovers she is the Ultimate Detective?", "Kyoko Kirigiri", "Aoi Asahina", "Toko Fukawa", "Chihiro Fujisaki", "Danganronpa", 200],
    ["In Danganronpa 2, who is the chaotic Ultimate Lucky Student obsessed with hope as a stepping stone?", "Nagito Komaeda", "Hajime Hinata", "Gundham Tanaka", "Fuyuhiko Kuzuryu", "Danganronpa", 250],

    # SOUL EATER
    ["What weapon does Maka Albarn wield, who is also her demon weapon partner?", "Soul Eater Evans (Scythe)", "Tsubaki Nakatsukasa", "Liz and Patty", "Spirit Albarn", "Soul Eater", 200],
    ["How many evil human souls and witch souls must a Demon Weapon consume to become a Death Scythe?", "99 evil human souls and 1 witch soul", "100 evil souls and 1 demon soul", "50 evil souls and 3 witch souls", "1000 evil souls", "Soul Eater", 250],
    ["What Shinigami student is obsessed with absolute perfect symmetry in all things?", "Death the Kid", "Black Star", "Kilik Rung", "Ox Ford", "Soul Eater", 200],
    ["What loud assassin student from the Star Clan declares he will surpass God?", "Black Star", "Death the Kid", "Soul Evans", "Crona", "Soul Eater", 200],
    ["What witch uses snake magic and infused her child Crona with the melted Black Blood?", "Medusa Gorgon", "Arachne Gorgon", "Shaula Gorgon", "Eruka Frog", "Soul Eater", 250],

    # ROMANCE & SLICE OF LIFE CLASSICS
    ["In Your Lie in April, what instrument does Kaori Miyazono play that reawakens Kosei Arima's love for music?", "Violin", "Cello", "Flute", "Piano", "Your Lie in April", 200],
    ["What trauma prevented pianist prodigy Kosei Arima from hearing the notes of his own piano?", "The abuse and death of his strict mother Saki", "A hand fracture from a bicycle crash", "Ear infection from swimming", "Stage fright after losing a contest", "Your Lie in April", 200],
    ["In Toradora!, what animal nickname is given to the diminutive, fiercely aggressive Taiga Aisaka?", "Palmtop Tiger", "Pocket Dragon", "Fierce Kitten", "Tiny Lion", "Toradora!", 200],
    ["Why are people at school terrified of Ryuji Takasu despite his gentle, domestic personality?", "His naturally intimidating, delinquent-looking eyes", "His massive physical height", "His family's yakuza connection", "His scarred forehead", "Toradora!", 200],
    ["In Clannad, what beloved traditional theater group does Nagisa Furukawa endeavor to revive at Hikarizaka High?", "The Drama Club", "The Choir Club", "The Literature Club", "The Art Society", "Clannad", 200],
    ["What iconic, nostalgic family song does Nagisa love to sing in Clannad?", "Dango Daikazoku (The Great Dango Family)", "Chiisana Tenohira", "Toki wo Kizamu Uta", "Ana", "Clannad", 200],
]

all_questions = existing_questions + new_questions

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
