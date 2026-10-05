import json, os

existing_path = r'C:\Users\luisc\Desktop\Project\PochiPochi\server\anime_raw.json'
with open(existing_path, 'r', encoding='utf-8') as f:
    existing_questions = json.load(f)

print(f"Loaded {len(existing_questions)} existing questions.")

new_questions = [
    # YU-GI-OH!
    ["What ancient Egyptian artifact did Yugi Muto spend 8 years assembling to awaken the Pharaoh?", "The Millennium Puzzle", "The Millennium Eye", "The Millennium Ring", "The Millennium Rod", "Yu-Gi-Oh!", 200],
    ["What are the five cards that grant an instant victory when held together in hand?", "Exodia the Forbidden One", "The Three Egyptian Gods", "The Destiny Board", "The Sacred Beasts", "Yu-Gi-Oh!", 200],
    ["What is Seto Kaiba's signature powerhouse monster, of which only three exist in the world?", "Blue-Eyes White Dragon", "Dark Magician", "Red-Eyes Black Dragon", "Summoned Skull", "Yu-Gi-Oh!", 200],
    ["What is Yugi Muto's signature ace spellcaster monster?", "Dark Magician", "Buster Blader", "Celtic Guardian", "Dark Magician Girl", "Yu-Gi-Oh!", 200],
    ["What dragon card did Joey Wheeler win from Rex Raptor during Duelist Kingdom?", "Red-Eyes Black Dragon", "Blue-Eyes White Dragon", "Time Wizard", "Baby Dragon", "Yu-Gi-Oh!", 200],
    ["Who created the Duel Monsters card game and possesses the Millennium Eye?", "Maximillion Pegasus", "Seto Kaiba", "Marik Ishtar", "Bakura Ryou", "Yu-Gi-Oh!", 250],
    ["What are the three legendary Egyptian God Cards in Yu-Gi-Oh!?", "Slifer the Sky Dragon, Obelisk the Tormentor, and The Winged Dragon of Ra", "Blue-Eyes, Red-Eyes, and Black-Eyes", "Uria, Raviel, and Hamon", "Odin, Thor, and Loki", "Yu-Gi-Oh!", 250],
    ["What is the real ancient Egyptian name of the Pharaoh inhabiting the Millennium Puzzle?", "Atem", "Akhenaten", "Tutankhamun", "Ramses", "Yu-Gi-Oh!", 250],

    # INITIAL D
    ["What car does Takumi Fujiwara drive to deliver tofu down Mount Akina?", "Toyota Sprinter Trueno (AE86)", "Mazda RX-7 (FD3S)", "Nissan Skyline GT-R (R32)", "Mitsubishi Lancer Evolution IV", "Initial D", 200],
    ["What family business does Takumi Fujiwara deliver products for early every morning?", "Fujiwara Tofu Shop", "Akina Ramen", "Mount Fuji Bakery", "Gunma Auto Repairs", "Initial D", 200],
    ["What racing technique did Takumi develop using the gutter on the hairpins of Mount Akina?", "Gutter Run (Gutter Drift)", "Braking Drift", "Inertia Drift", "Heel-and-Toe Shift", "Initial D", 250],
    ["What electronic music genre famously soundtracked the high-speed drift battles of Initial D?", "Eurobeat", "Synthwave", "Hardstyle", "J-Rock", "Initial D", 200],
    ["Who is Takumi's stoic father, an ex-racer who trained him by placing a cup of water in the cup holder?", "Bunta Fujiwara", "Ryosuke Takahashi", "Koichiro Iketani", "Yuichi Tachibana", "Initial D", 250],
    ["What two brothers lead the Akagi RedSuns street racing team in Gunma?", "Ryosuke and Keisuke Takahashi", "Takeshi and Shingo", "Seiji and Kyoichi", "Nobuhiko and Wataru", "Initial D", 250],

    # INUYASHA
    ["What half-demon dog warrior is the titular protagonist pinned to a sacred tree by Kikyo?", "Inuyasha", "Sesshomaru", "Koga", "Naraku", "Inuyasha", 200],
    ["What modern Tokyo junior high school girl falls down an ancient shrine well into the Sengoku period?", "Kagome Higurashi", "Kikyo", "Sango", "Rin", "Inuyasha", 200],
    ["What shattered magical artifact are Inuyasha and Kagome racing across feudal Japan to collect?", "The Shikon Jewel (Jewel of Four Souls)", "The Sacred Mirror", "The Dragon Pearl", "The Tessaiga Scabbard", "Inuyasha", 200],
    ["What sword forged from the fang of Inuyasha's father can slay 100 demons in a single swing?", "Tessaiga (Iron-Crushing Fang)", "Tenseiga", "Bakusaiga", "Tokijin", "Inuyasha", 250],
    ["What full-demon older half-brother of Inuyasha wields the healing sword Tenseiga?", "Sesshomaru", "Naraku", "Bankotsu", "Hakushin", "Inuyasha", 200],
    ["What dark half-demon manipulator was created from the bandit Onigumo's corrupted soul?", "Naraku", "Moryomaru", "Hakudoshi", "Kagura", "Inuyasha", 250],
    ["What lecherous Buddhist monk travels with Inuyasha, bearing a cursed Wind Tunnel (Kazaana) in his right hand?", "Miroku", "Myoga", "Mushin", "Shippo", "Inuyasha", 200],
    ["What demon slayer maiden travels with a giant two-tailed cat demon named Kirara?", "Sango", "Kikyo", "Ayame", "Yura", "Inuyasha", 200],

    # SAILOR MOON
    ["What clumsy, crying schoolgirl transforms into the Champion of Justice, Sailor Moon?", "Usagi Tsukino", "Ami Mizuno", "Rei Hino", "Makoto Kino", "Sailor Moon", 200],
    ["What black cat with a crescent moon mark on her forehead awakes Usagi's destiny?", "Luna", "Artemis", "Diana", "Chibi", "Sailor Moon", 200],
    ["What mysterious gentleman in a cape and top hat throws red roses to aid Sailor Moon?", "Tuxedo Mask (Mamoru Chiba)", "Jadeite", "Kunzite", "Prince Demande", "Sailor Moon", 200],
    ["Which Sailor Guardian represents wisdom and water, wielding the power of Mercury?", "Sailor Mercury (Ami Mizuno)", "Sailor Mars", "Sailor Jupiter", "Sailor Venus", "Sailor Moon", 200],
    ["Which Sailor Guardian is a miko shrine maiden wielding fire and psychic charms?", "Sailor Mars (Rei Hino)", "Sailor Mercury", "Sailor Venus", "Sailor Pluto", "Sailor Moon", 200],
    ["What sacred relic of the Moon Kingdom does Queen Beryl and the Dark Kingdom seek to steal?", "The Legendary Silver Crystal", "The Golden Moon Mirror", "The Star Seed", "The Holy Grail", "Sailor Moon", 250],

    # BERSERK
    ["What is the name of the colossal six-foot greatsword wielded by Guts the Black Swordsman?", "Dragon Slayer", "Beast Cleaver", "Demonsbane", "Iron Buster", "Berserk", 200],
    ["What cursed mark is branded onto Guts's neck, attracting malevolent spirits every night?", "The Brand of Sacrifice", "The Sigil of Femto", "The Mark of Cain", "The Eye of the Void", "Berserk", 200],
    ["Who was the charismatic leader of the Band of the Hawk who sacrificed his comrades during the Eclipse?", "Griffith (Femto)", "Judeau", "Pippin", "Corkus", "Berserk", 200],
    ["What supernatural talisman resembling an egg with scrambled human facial features triggers the God Hand?", "Behelit (The Egg of the King)", "Crimson Stone", "Demon Relic", "Astral Core", "Berserk", 250],
    ["What demonic suit of armor allows Guts to surpass human physical limits while ignoring pain and breaking bones?", "The Berserker Armor", "The Dragon Mail", "The Skull Knight Plate", "The Cursed Carapace", "Berserk", 250],
    ["What mysterious armored undead warrior riding a spectral steed opposes the God Hand and saves Guts?", "The Skull Knight", "Void", "Slan", "Ubik", "Berserk", 250],

    # TRIGUN & HELLSING
    ["What legendary gunslinger with a 60 billion double-dollar bounty refuses to kill anyone in Trigun?", "Vash the Stampede (The Humanoid Typhoon)", "Nicholas D. Wolfwood", "Millions Knives", "Legato Bluesummers", "Trigun", 200],
    ["What massive cross-shaped weapon containing a machine gun and rocket launcher is carried by Wolfwood?", "The Punisher", "The Crusader", "The Cross Cannon", "The Redeemer", "Trigun", 250],
    ["What ancient vampire king bound to the Hellsing Organization uses dual custom pistols named 454 Casull and Jackal?", "Alucard", "Alexander Anderson", "Walter C. Dornez", "The Captain", "Hellsing", 200],
    ["What former police girl turned fledgling vampire serves as Alucard's loyal draculina?", "Seras Victoria", "Sir Integra Hellsing", "Rip van Winkle", "Zorin Blitz", "Hellsing", 200],
    ["What fanatical Vatican priest and regenerator wields bayonets wrapped in scripture pages against Alucard?", "Father Alexander Anderson", "Enrico Maxwell", "Heinkel Wolfe", "Yumiko Takagi", "Hellsing", 250],

    # PSYCHO-PASS & BLACK LAGOON
    ["What special weapon used by Public Safety inspectors analyzes a suspect's mental state to stun or lethally eliminate them?", "The Dominator", "The Enforcer", "The Sibyl Ray", "The Crime Breaker", "Psycho-Pass", 200],
    ["What numerical reading measures a citizen's probability of committing criminal acts in Psycho-Pass?", "Crime Coefficient", "Sin Index", "Psycho Level", "Menace Ratio", "Psycho-Pass", 200],
    ["What criminal mastermind in Psycho-Pass possessed an asymptomatic brain that the Sibyl System could not judge?", "Shogo Makishima", "Kirito Kamui", "Shinya Kogami", "Tomomi Masaoka", "Psycho-Pass", 250],
    ["What ruthless female gunslinger nicknamed Two-Hands dual-wields modified Beretta 92FS pistols in Roanapur?", "Revy (Rebecca Lee)", "Balalaika", "Eda", "Roberta", "Black Lagoon", 200],
    ["What Japanese salaryman was kidnapped by the Lagoon Company and chose to stay in Thailand under the name Rock?", "Rokuro Okajima (Rock)", "Dutch", "Benny", "Chang", "Black Lagoon", 200],
    ["What former Soviet airborne officer leads the Russian mafia syndicate Hotel Moscow in Roanapur?", "Balalaika (Sofia Pavlovena)", "Boris", "Sister Yolanda", "Shenhua", "Black Lagoon", 250],

    # MADE IN ABYSS & DANMACHI
    ["What humanoid robot boy with extendable mechanical arms and an incinerator cannon accompanies Riko down the Abyss?", "Reg", "Riko", "Nanachi", "Bondrewd", "Made in Abyss", 200],
    ["What deadly physiological reaction strikes explorers when attempting to ascend from the lower layers of the Abyss?", "The Curse of the Abyss (Strains of Ascension)", "Abyssal Fever", "The Miasma Sickness", "Void Rot", "Made in Abyss", 250],
    ["What fluffy Hollow creature with rabbit-like ears helps Riko after she was poisoned in the Fourth Layer?", "Nanachi", "Mitty", "Prushka", "Marulk", "Made in Abyss", 200],
    ["What white whistle scientist known as the Sovereign of Dawn conducted unethical human experiments in Ido Front?", "Bondrewd", "Ozen the Immovable", "Lyza the Annihilator", "Habolg", "Made in Abyss", 250],
    ["What rookie adventurer in Orario is the sole member of the pint-sized Goddess Hestia's Familia?", "Bell Cranel", "Welf Crozzo", "Liliruca Arde", "Yamato Mikoto", "DanMachi", 200],
    ["What legendary level 6 first-class swordswoman is nicknamed the Sword Princess in DanMachi?", "Ais Wallenstein", "Ryuu Lion", "Tiona Hiryute", "Riveria Ljos Alf", "DanMachi", 200],
    ["What rare passive skill allows Bell Cranel's growth speed to accelerate according to the strength of his feelings?", "Liaris Freese", "Firebolt", "Argonaut", "Ox Slayer", "DanMachi", 250],

    # SAMURAI CHAMPLOO & RUROUNI KENSHIN
    ["What swordsman in Samurai Champloo uses an unpredictable breakdance-inspired fighting style?", "Mugen", "Jin", "Kagetoki", "Sara", "Samurai Champloo", 200],
    ["What stoic, glasses-wearing ronin in Samurai Champloo practices orthodox Mujushin Kenjutsu?", "Jin", "Mugen", "Okiyo", "Shoryu", "Samurai Champloo", 200],
    ["What mysterious samurai with a floral scent did Fuu travel across Edo Japan to locate?", "The Samurai who smells of Sunflowers", "The Cherry Blossom Ronin", "The Lotus Blade", "The Orchid Master", "Samurai Champloo", 200],
    ["What type of blade does Kenshin Himura carry to uphold his vow of never taking another human life?", "Sakabato (Reverse-Blade Sword)", "Bokuto", "Shinai", "Wakizashi", "Rurouni Kenshin", 200],
    ["What ancient lightning-fast sword style does Kenshin practice, taught to him by Seijuro Hiko XIII?", "Hiten Mitsurugi-ryu", "Kamiya Kasshin-ryu", "Oniwabanshu Kenjutsu", "Shito-ryu", "Rurouni Kenshin", 250],
    ["What heavily bandaged former Ishin Shishi assassin sought to conquer Japan by burning Kyoto?", "Makoto Shishio", "Aoshi Shinomori", "Saito Hajime", "Enishi Yukishiro", "Rurouni Kenshin", 250],

    # CARTOON & COMEDY CULT CLASSICS
    ["In Nichijou, what robotic schoolgirl with a wind-up key on her back was built by the 8-year-old Professor?", "Nano Shinonome", "Yuko Aioi", "Mio Naganohara", "Mai Minakami", "Nichijou", 200],
    ["In Lucky Star, what otaku high school girl loves chocolate cornets and anime video games?", "Konata Izumi", "Kagami Hiiragi", "Tsukasa Hiiragi", "Miyuki Takara", "Lucky Star", 200],
    ["In Gintama, what odd-jobs business in Kabukicho does Sakata Gintoki run alongside Shinpachi and Kagura?", "Yorozuya Gin-chan", "Kaientai", "Shinsengumi", "Kiheitai", "Gintama", 200],
    ["What alien clan does Kagura belong to in Gintama, known as the strongest mercenary warrior race in the universe?", "Yato Clan", "Amanto Clan", "Dakini Clan", "Shinra Clan", "Gintama", 250],
    ["Who is the mayonnaise-obsessed Vice-Commander of the Shinsengumi in Gintama?", "Toshiro Hijikata", "Isao Kondo", "Sougo Okita", "Sagaru Yamazaki", "Gintama", 200],
    ["In Pop Team Epic, what two bizarre schoolgirls star in short absurdist surreal sketch parodies?", "Popuko and Pipimi", "Aoi and Hinata", "Yui and Mio", "Ritsu and Tsumugi", "Pop Team Epic", 200],
    ["In K-On!, what is the name of the four-member afternoon tea pop music club at Sakuragaoka High School?", "Ho-kago Tea Time (HTT)", "Kessoku Band", "After School Rock", "Girls Dead Monster", "K-On!", 200],
    ["In K-On!, what clumsy lead guitarist names her beloved Gibson Les Paul Heritage Cherry Sunburst guitar 'Giita'?", "Yui Hirasawa", "Mio Akiyama", "Ritsu Tainaka", "Tsumugi Kotobuki", "K-On!", 200],
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
