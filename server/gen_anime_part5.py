import json, os

existing_path = r'C:\Users\luisc\Desktop\Project\PochiPochi\server\anime_raw.json'
with open(existing_path, 'r', encoding='utf-8') as f:
    existing_questions = json.load(f)

print(f"Loaded {len(existing_questions)} existing questions.")

new_questions = [
    # ONE PIECE EGGHEAD & LORE
    ["What are the six satellite bodies created by Dr. Vegapunk named?", "Shaka, Lilith, Edison, Pythagoras, Atlas, and York", "Alpha, Beta, Gamma, Delta, Epsilon, Zeta", "North, South, East, West, Zenith, Nadir", "Mercury, Venus, Mars, Jupiter, Saturn, Uranus", "One Piece", 350],
    ["Which Vegapunk satellite betrayed the others to become a Celestial Dragon?", "York (Greed)", "Lilith (Evil)", "Shaka (Good)", "Atlas (Wrath)", "One Piece", 350],
    ["What cyborg clones modeled after former Warlords of the Sea were created by SSG?", "The Seraphim", "The Pacifistas", "The Germa Clones", "The Ancient Giants", "One Piece", 300],
    ["Which Gorosei elder personally sailed to Egghead Island to oversee its Buster Call?", "Jaygarcia Saturn", "Marcus Mars", "Topman Warcury", "Ethanbaron V. Nusjuro", "One Piece", 350],
    ["What ancient robotic behemoth powered by ancient flame energy awoke on Egghead Island?", "The Iron Giant (Emet)", "Pluton", "Franky Shogun", "Zunesha", "One Piece", 350],
    ["What giant elephant wanders the New World carrying the Mink Tribe's civilization on its back?", "Zunesha", "Nola", "Laboon", "Kraken", "One Piece", 250],

    # DRAGON BALL SUPER
    ["Who was the rogue Supreme Kai apprentice from Universe 10 who stole Goku's body?", "Zamasu (Goku Black)", "Gowasu", "Shin", "Elder Kai", "Dragon Ball", 250],
    ["What transformation does Goku Black unlock with his corrupted divine Saiyan cells?", "Super Saiyan Rosé", "Super Saiyan Blue", "Ultra Instinct", "Super Saiyan God", "Dragon Ball", 250],
    ["What technique does Future Trunks use to channel the hopes of humanity into his sword against Fused Zamasu?", "Sword of Hope (Spirit Bomb Sword)", "Final Flash", "Burning Attack", "Masenko", "Dragon Ball", 300],
    ["Who is the Grand Priest (Daishinkan) in Dragon Ball Super?", "The attendant to Zeno and father of all Angels", "The ruler of Universe 7", "The God of Destruction King", "The creator of the Super Dragon Balls", "Dragon Ball", 350],
    ["What childish omnipotent ruler of the multiverse can erase entire universes with a wave of his hand?", "Grand Zeno (Omni-King)", "Beerus", "Champa", "Zamasu", "Dragon Ball", 200],

    # ATTACK ON TITAN FINAL SEASON
    ["What Marleyan family secretly controlled the Warhammer Titan behind the scenes?", "The Tybur Family (Willy Tybur)", "The Braun Family", "The Finger Family", "The Grice Family", "Attack on Titan", 300],
    ["Which Scout commander sacrifices their life to buy time against the Colossal Wall Titans of the Rumbling?", "Hange Zoe", "Erwin Smith", "Levi Ackerman", "Keith Shadis", "Attack on Titan", 250],
    ["What form does Falco Grice's Jaw Titan unexpectedly take after ingesting Zeke's spinal fluid?", "A winged flying bird-like Titan", "A quadrupedal tank Titan", "A crystal-encased Titan", "A colossal steam Titan", "Attack on Titan", 300],
    ["Who was the first human to ever awaken the power of the Titans 2,000 years ago?", "Ymir Fritz", "Maria", "Rose", "Sina", "Attack on Titan", 250],
    ["What path dimension connects all Eldian descendants to the Founding Titan through the Coordinate?", "The Paths", "The Void", "The Tree of Life", "The Nexus", "Attack on Titan", 300],

    # DEMON SLAYER UPPER MOONS & HASHIRA
    ["Who is Upper Rank Two of the Twelve Kizuki, wielding ice fans and leading the Eternal Paradise Cult?", "Doma", "Akaza", "Kokushibo", "Gyokko", "Demon Slayer", 250],
    ["Who is Upper Rank One, wielding a fleshy flesh-sword and practicing Moon Breathing?", "Kokushibo", "Akaza", "Doma", "Kaigaku", "Demon Slayer", 300],
    ["What demon siblings share the position of Upper Rank Six in the Yoshiwara Entertainment District?", "Gyutaro and Daki", "Akaza and Koyuki", "Rui and his Mother", "Enmu and Rokuro", "Demon Slayer", 250],
    ["Who is the blind Stone Hashira, widely recognized as the strongest Hashira in the Demon Slayer Corps?", "Gyomei Himejima", "Sanemi Shinazugawa", "Giyu Tomioka", "Obanai Iguro", "Demon Slayer", 250],
    ["What Breathing Style does the Serpent Hashira Obanai Iguro practice alongside his white snake Kaburamaru?", "Serpent Breathing", "Water Breathing", "Flower Breathing", "Mist Breathing", "Demon Slayer", 250],
    ["What technique allows Demon Slayers to see inside an opponent's body to predict muscle movements?", "Transparent World (See-Through World)", "Total Concentration Constant", "Crimson Blade", "Demon Slayer Mark", "Demon Slayer", 350],

    # HUNTER X HUNTER CHIMERA ANT & DARK CONTINENT
    ["What terrifying weapon does Chairman Isaac Netero detonate inside his chest to kill Meruem?", "The Miniature Rose (Poor Man's Rose)", "Zero Hand", "Guanyin Bomb", "Dragon Dive", "HxH", 300],
    ["What 100-armed golden Buddhist construct does Netero summon at supersonic speeds?", "100-Type Guanyin Bodhisattva", "Nen Dragon", "Golden Buddha", "Zero Stance", "HxH", 300],
    ["What blind human girl who plays Gungi touches the heart of the Chimera Ant King Meruem?", "Komugi", "Palm Siberia", "Shidore", "Reina", "HxH", 200],
    ["What extreme condition did Gon Freecss place on his body and Nen to defeat Neferpitou?", "A vow sacrificing his entire life potential and Nen to age into his peak physical prime", "Consuming Chimera Ant cells", "Opening all eight aura nodes", "Transferring Killua's Nen", "HxH", 300],
    ["What wish-granting entity from the Dark Continent resides inside Killua's sibling Alluka?", "Nanika (Something)", "Ai", "Brion", "Pap", "HxH", 300],

    # JUJUTSU KAISEN (MORE DEEP LORE)
    ["What lawyer awakened a Domain Expansion called Deadly Sentencing with the shikigami Judgeman?", "Hiromi Higuruma", "Hajime Kashimo", "Ryu Ishigori", "Fumihiko Takaba", "Jujutsu Kaisen", 300],
    ["What sorcerer's cursed technique 'Comedian' makes anything he finds genuinely funny manifest in reality?", "Fumihiko Takaba", "Charles Bernard", "Reggie Star", "Iori Hazenoki", "Jujutsu Kaisen", 350],
    ["What Sendai Colony sorcerer possesses the highest cursed energy output in history with 'Granite Blast'?", "Ryu Ishigori", "Takako Uro", "Dhruv Lakdawalla", "Kurourushi", "Jujutsu Kaisen", 350],
    ["What ancient sorcerer reincarnated in the Culling Game can only use his cursed technique Mythical Beast Amber once?", "Hajime Kashimo (God of Lightning)", "Sukuna", "Kenjaku", "Naoya Zenin", "Jujutsu Kaisen", 350],
    ["What is the cursed tool created from the soul of Maki's twin sister Mai before she died?", "Split Soul Katana", "Dragon Bone", "Playful Cloud", "Chain of a Thousand Miles", "Jujutsu Kaisen", 350],

    # FRIEREN (ADDITIONAL LORE)
    ["What pacifist First-Class Mage tester wears clothes made of hair and tests mages with a peaceful dungeon crawl?", "Sense", "Genau", "Lernen", "Burg", "Frieren", 300],
    ["What imperial court mage fought against Frieren using ordinary earth magic and close combat in the exam?", "Denken", "Richter", "Laufen", "Scharf", "Frieren", 250],
    ["What northern mercenary captain leads a squad hunting demons, declaring 'it's pragmatic'?", "Wirbel", "Ehre", "Ton", "Blei", "Frieren", 250],
    ["What is the name of the bird species mages had to capture during the first stage of the First-Class Mage Exam?", "Stille", "Komet", "Falke", "Adler", "Frieren", 250],
    ["What ancient spell allows Frieren to walk on water or produce a field of blue moon flowers?", "Folk magic spells found in forgotten grimoires", "Holy scripture magic", "Demon curses", "Elven forbidden arts", "Frieren", 200],

    # MORE MODERN & ICONIC TRIVIA
    ["In Cyberpunk: Edgerunners, what drink at the Afterlife bar is named after David Martinez?", "Vodka on the rocks with a dash of lime and Nicola", "Tequila and soda", "Whiskey straight", "Beer and energy drink", "Cyberpunk: Edgerunners", 300],
    ["In Bocchi the Rock!, what is Bocchi's little sister's name who pets her like a strange dog?", "Futari Gotoh", "Nijika", "Seika", "Kikuri", "Bocchi the Rock!", 200],
    ["In Bocchi the Rock!, what indie band bassist is a drunken genius playing an electric bass with her teeth?", "Kikuri Hiroi (SICK HACK)", "Ryo Yamada", "Yoyoko Ohtsuki", "Eren Gotoh", "Bocchi the Rock!", 250],
    ["In Haikyuu!!, what Brazilian beach volleyball career step did Hinata undertake after high school?", "Playing beach volleyball in Rio de Janeiro to master all skills", "Joining an Italian club", "Playing college volleyball", "Working as a coach", "Haikyuu!!", 300],
    ["In Kuroko's Basketball, what team did Kuroko and Kagami face in the Winter Cup finals?", "Rakuzan High", "Touou Academy", "Yosen High", "Kaijo High", "Kuroko's Basketball", 250],
    ["In Blue Lock, what German club team in the Neo Egoist League does Isagi choose to join?", "Bastard Munchen", "Paris X Gen", "Manshine City", "Ubers", "Blue Lock", 250],
    ["In Blue Lock, what French star striker is the number one master forward of Bastard Munchen?", "Noel Noa", "Chris Prince", "Marc Snuffy", "Lavis", "Blue Lock", 250],
    ["In Solo Leveling, what is Sung Jinwoo's shadow wyvern mount named?", "Kaisel", "Tank", "Tusk", "Jima", "Solo Leveling", 250],
    ["In Solo Leveling, what high orc shaman shadow was extracted from the hunter dungeon and uses gravity magic?", "Tusk", "Iron", "Igris", "Beru", "Solo Leveling", 250],
    ["In Chainsaw Man, what weapon does the War Devil Yoru create from Asa Mitaka's school uniform?", "Super Strong Uniform Sword", "Nail Dagger", "Spinal Cord Sword", "Rib Spear", "Chainsaw Man", 300],
    ["In Bleach TYBW, what is Byakuya Kuchiki's improved technique after training in the Royal Palace?", "Senbonzakura Kageyoshi: Ikka Senjinka", "Hakka no Togame", "Goryutenmetsu", "Kurohitsugi", "Bleach", 350],
    ["In Bleach TYBW, what happens to Rukia Kuchiki's body when activating her Bankai Hakka no Togame?", "Her body drops to absolute zero temperature (-273.15 C)", "She transforms into a giant ice dragon", "She dissolves into snow", "She freezes time", "Bleach", 350],
    ["In Bleach TYBW, what is the ability of Askin Nakk Le Vaar, the Deathdealing (D)?", "Controlling the lethal dose of any substance in the blood", "Creating infinite illusions", "Reversing all damage taken", "Stealing spiritual pressure", "Bleach", 350],
    ["In Bleach TYBW, what miraculous Schutzstaffel Quincy grows into a colossal giant every time he takes damage?", "Gerard Valkyrie (The Miracle)", "Pernida Parnkgjas", "Lille Barro", "Bazz-B", "Bleach", 350],
    ["In JoJo's Bizarre Adventure Part 4, what power does Rohan Kishibe's Stand Heaven's Door possess?", "Turning people into books and reading/editing their thoughts and memories", "Erasing space", "Repairing broken objects", "Freezing time", "JoJo's Bizarre Adventure", 200],
    ["In JoJo's Bizarre Adventure Part 5, what assassination squad of Passione revolts against the Boss?", "La Squadra Esecuzioni (Hitman Team)", "Passione Elite Guard", "Unita Speciale", "The Pillar Guard", "JoJo's Bizarre Adventure", 250],
    ["In JoJo's Bizarre Adventure Part 6, what creature's DNA does Weather Report use to rain down poisonous animals?", "Poison dart frogs", "Rattlesnakes", "Scorpions", "Jellyfish", "JoJo's Bizarre Adventure", 250],
    ["In Steins;Gate 0, what artificial intelligence system was built using Kurisu Makise's memories?", "Amadeus", "SERN-AI", "Valkyrie", "Titor", "Steins;Gate", 250],
    ["In Fate/Zero, who is the Rider servant summoned by Waver Velvet, known as the King of Conquerors?", "Iskandar (Alexander the Great)", "Gilgamesh", "Lancelot", "Diarmuid Ua Duibhne", "Fate Series", 200],
    ["In Fate/Zero, what is Iskandar's Reality Marble that summons his entire million-man army in the desert?", "Ionian Hetairoi", "Unlimited Blade Works", "Gate of Babylon", "Excalibur Morgan", "Fate Series", 250],
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
