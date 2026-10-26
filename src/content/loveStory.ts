/**
 * ────────────────────────────────────────────────────────────────
 *  EDIT EVERYTHING HERE  ❤
 *  Names, dates, photos, memories, letter, reasons, music.
 *  To add a photo: drop the file into `src/assets/` and import it
 *  at the top of this file, then use it as the `image` value.
 *  e.g.  import ourFirstDate from "@/assets/our-first-date.jpg";
 * ────────────────────────────────────────────────────────────────
 */

import photoUs1 from "@/assets/photos/Snapchat-1625205945-2.jpg.asset.json";
import photoUs2 from "@/assets/photos/Snapchat-1634327033-2.jpg.asset.json";
import photoUs3 from "@/assets/photos/file_0000000014fc71fa8c9a1eacdf6b924f-2.png.asset.json";
import photoUs4 from "@/assets/photos/Snapchat-1267333793-2.jpg.asset.json";
import photoUs5 from "@/assets/photos/Snapchat-1001237552.jpg.asset.json";

export const couple = {
  wifeName: "My Love", // ← her name
  husbandName: "Yours Forever", // ← your name
  birthday: "Happy Birthday", // ← e.g. "24 August"
};

export const journal = {
  title: "Our Love Journey",
  crest: "S",
  passcode: "1914",
  chapters: [
    "Our Love Journey",
    "A Birthday Wish",
    "The Love Scanner",
    "Our Destiny",
    "Written in the Stars",
    "A Moment, Just Us",
    "Hey, My Love",
    "Little Pieces of Us",
  ],
  scanner: {
    eyebrow: "SOUL SYNCHRONIZATION",
    title: "The Love Scanner",
    instruction: "Hold your thumb to synchronize our heartbeats...",
    result: "Two Hearts. One Rhythm. Perfectly Matched For Eternity ❤️",
  },
};

/** Romantic background music 🎶
 *  These bundled instrumentals work immediately. Replace their `src` values with
 *  licensed Tamil song files whenever you are ready to personalize the playlist. */
export type Track = { src: string; title: string };

/** Starts empty — add your own songs with the (+) button in the music player. */
export const playlist: Track[] = [];

/** kept for backwards compatibility */
export const music = playlist[0] ?? { src: "", title: "" };

export const opening = {
  greeting: "Hey, My Love... ❤️",
  whisper: "I made something special for you.",
  second: "Because you deserve more than just a birthday wish.",
  button: "ENTER OUR STORY ❤️",
};

export const birthdayCake = {
  title: "A Birthday Wish Just For You",
  subtitle: "Close your eyes, make your deepest wish, and blow out the candle...",
  blow: "Blow Out the Candle 🎂✨",
  cut: "Tap to cut the cake 🍰",
  wish: "Your wish is on its way to the stars… ✨",
  message: "Happy Birthday, My Love! May every wish come true ❤️",
  enter: "Turn Page ✨",
};

export const hero = {
  title: "Happy Birthday, My Love ❤️",
  line: "Today isn't just your birthday...\nIt's the day someone incredibly special came into this world.",
};

export type StoryChapter = {
  label: string;
  date: string;
  caption: string;
  body: string;
  image?: string; // optional imported photo
};

export const story: StoryChapter[] = [
  {
    label: "THE DAY WE MET",
    date: "July 18, 2026",
    caption: "Where the universe quietly aligned.",
    body: "Out of millions of souls and ordinary days, my eyes found yours. I didn’t know it that day, but the moment you looked at me, every scattered piece of my world quietly fell into place. That was the day home stopped being a place and became you.",
    image: photoUs1.url,
  },
  {
    label: "THE MOMENT I FELL FOR YOU",
    date: "October 2, 2026",
    caption: "The second my heart completely surrendered.",
    body: "It wasn’t just a feeling—it was a quiet certainty. The gentle warmth in your voice, the way your smile made all my worries vanish, and the softness you brought into my life. Without even realizing it, my heart chose you for a lifetime.",
    image: photoUs4.url,
  },
  {
    label: "OUR FIRST SPECIAL MEMORY",
    date: "October 2, 2026",
    caption: "The moment time stood completely still.",
    body: "Just you and me, letting the world fade away. Every laugh we shared, every soft look, felt like a sacred promise written in the stars. That was the day I realized I never want to walk a single step of this life without your hand held tightly in mine.",
    image: photoUs5.url,
  },
  {
    label: "THE MOMENTS THAT MADE US",
    date: "April 4, 2026",
    caption: "The quiet bond only our hearts understand.",
    body: "The midnight conversations, the unspoken understandings, and the little arguments that only brought us closer. It’s in every secret glance and every gentle check-in—the endless little pieces of love that turned 'you and me' into 'us'.",
    image: photoUs2.url,
  },
  {
    label: "THE MEMORIES I WILL ALWAYS KEEP",
    date: "September 30, 2025",
    caption: "Etched into the deepest corners of my soul.",
    body: "No matter where life leads us or how many years pass, this memory stays alive inside my chest. A timeless reminder of our beginning, of purest innocence, and the beautiful reason my soul will always choose you, again and again.",
    image: photoUs3.url,
  },
];

export type Memory = { caption: string; note: string; image?: string };

export const gallery: Memory[] = [
  { caption: "Your Smile ❤️", note: "[ add photo ]", image: photoUs1.url },
  { caption: "My Favorite Memory", note: "[ add photo ]", image: photoUs5.url },
  { caption: "Just Us", note: "[ add photo ]", image: photoUs3.url },
  { caption: "The Moment I Knew", note: "[ add photo ]", image: photoUs4.url },
  { caption: "One Of My Happiest Days", note: "[ add photo ]", image: photoUs2.url },
  {
    caption: "Forever Doesn't Sound Long Enough.",
    note: "[ add photo ]",
    image: photoUs1.url,
  },
];

export const letter = {
  button: "Open My Letter 💌",
  greeting: "Dear My Love,",
  body: `Finally the time came 🫴💖✨

🎊 Wish you a many more happy returns of the day dii pondatii 🫂 Don't worry about anything chlm 🥰 I am always with you chlm ❤️‍🩹 Thaniya irruka nu nenachukatha — na eppavum unkooda tha irrukean, irrupean 💕 Athanala chamathu pullaya olunga saptu, olunga thoonganum 🪄 Yaaru ethu sonnalum kandukatha chlm 👣 Kavala padatha — pesuruvanga vaiyellam onna sendhu oru odaikurom 👍

Na iniki varaikum unna epudi pathukutean la ennaku thrl, ana unna after mrg ennala mudinja varaikum na unna vechu pathupean dii thanga maiyulu 💯 Unnaku sila yoosana varum — enga mrg ku apram Ivan maariruvan oh — un mela sathiyam ah, mrg after nu illa, eppavum mara matean pattu 💯

Be brave ❤️‍🔥 Be strong 💪 You're a lucky chalm too me dii pondatiii 🫀 Nee ethayum nenachu kavala padatha chlm — atha intha mama oda aasa 😘 Always keep smiling 😊

Ok once again — happy birthday dii azhagu puzha... 🎉 Love you soo much vairam ahh ummmmmmmmmaaaaaaaaaaaaaahhhhhhhhh 😘💋😘💋😘💋😘💋😘💋😘💋😘💋😘💋😘💋😘💋😘💋😘💋😘💋`,
  signature: "Forever yours, SRIHARANNANTHINI ❤️",
};

export type ExtraSurprise = {
  kicker: string;
  title: string;
  button: string;
  text: string;
  hearts?: boolean;
};

/** Little hidden reveals that unlock after the letter is opened. */
export const extraSurprises: ExtraSurprise[] = [
  {
    kicker: "Hidden message",
    title: "One more thing I never said",
    button: "Unlock it 🔐",
    text: "Every single day I thank the universe for you. You are my luck, my calm, my home. En vazhkaiyoda azhagu nee tha dii. ❤️",
  },
  {
    kicker: "Our little moment",
    title: "Press play in your heart",
    button: "Play the moment ▶️",
    text: "Close your eyes for five seconds… that song, that rain, that laugh of yours. That moment is playing right now, and I am there with you. 🎬💫",
  },
  {
    kicker: "Heart shower",
    title: "All my love, all at once",
    button: "Let it rain ❤️",
    text: "Every heart falling on this screen is one thing I love about you — and I ran out of screen, not reasons. 💕",
    hearts: true,
  },
];

export const surprise = {
  title: "WAIT…\nTHERE'S ONE MORE THING.",
  button: "UNLOCK THE SURPRISE ❤️",
  reveal:
    "You are my favorite person, my safest place, my happiest memory, and the person I want beside me for every chapter of my life. ❤️",
};

/** Proposal and interactive milestone copy. Edit these messages freely. */
export const proposalMilestone = {
  date: "2024-06-06T00:00:00",
  title: "Since That Special ‘Yes’ — June 6, 2024",
  subtitle: "The day my whole world found its meaning",
  caption: "Every single second with you is my favorite memory.",
};

export const birthdayWish = {
  title: "Make A Birthday Wish",
  revealed: "May every single wish of yours come true ❤️",
};

export const handHold = {
  title: "Hold My Hand",
  instruction: "Press and hold until our hearts meet.",
  revealed: "No matter what comes, you will never face it alone. My hand is yours, always. ❤️",
};

export const openWhenLetters = [
  {
    title: "Open when you miss me",
    message:
      "Close your eyes and remember my arms around you. Distance can never make my heart feel far from yours.",
  },
  {
    title: "Open when you feel stressed",
    message:
      "Breathe slowly, my love. You do not have to carry everything at once. Rest here with me for a little while.",
  },
  {
    title: "Open when you need a smile",
    message:
      "That beautiful smile is my favorite sight in this world. Imagine me doing something silly just to see it again. ❤️",
  },
];

export const starMap = {
  title: "Written In The Stars",
  quote: "Out of billions of galaxies and infinite stars, I found you.",
};

/** 10–20 reasons. Add, remove or rewrite freely. */
export const reasons: string[] = [
  "Your smile makes my day.",
  "You understand me without a word.",
  "You make ordinary moments special.",
  "I love the way you care.",
  "I simply love being with you.",
  "Your laugh is my favorite sound.",
  "You make our home feel like peace.",
  "You believe in me on the days I don't.",
  "The way you hold my hand.",
  "You are kind, even when it's hard.",
  "You remember the little things.",
  "Your eyes when you're happy.",
  "You make me want to be better.",
  "Every version of you.",
  "Forever still feels too short with you.",
];

export const finale = {
  question: "If I could choose again…",
  answer: "I would still choose you.",
  beats: ["Today.", "Tomorrow.", "And every lifetime after this."],
  closing: "HAPPY BIRTHDAY, MY LOVE ❤️\nI LOVE YOU MORE THAN WORDS CAN EVER SAY.",
  button: "Forever & Always",
};

/** Hidden reveal: tap the glowing heart three times. */
export const secret = {
  found: "Okay… you found my secret. ❤️",
  message: "[ WRITE MY SECRET MESSAGE HERE — the one thing only she should ever read. ]",
};

// WhatsApp reaction button — replace with your number: country code + number, digits only (e.g. "919876543210")
export const whatsappReaction = {
  phoneNumber: "919342073364",
  label: "Tell me your reaction 💬❤️",
  subtext: "Sends a direct message straight to my WhatsApp",
  message:
    "I just finished reading your surprise... and I don't even have words. I love you so much! ❤️🥹",
};

/** Chapter 7 scratch-to-reveal memory cards. */
export type ScratchMemory = { numeral: string; title?: string; caption: string; image?: string };
export const scratchMemories: ScratchMemory[] = [
  {
    numeral: "I",
    title: "",
    caption:
      "Amidst the rush of crowded hallways, you were the only stillness my soul ever noticed. We were just two people crossing paths, never guessing that every tomorrow I would ever desire was quietly beginning right there.",
    image: photoUs1.url,
  },
  {
    numeral: "II",
    title: "",
    caption:
      "High above the sleeping world, with the cool wind carrying our whispered secrets. In that quiet space beneath the sky, holding your hand, I realized that home was never a place—it was this breath, right beside you.",
    image: photoUs5.url,
  },
  {
    numeral: "III",
    title: "",
    caption:
      "An entire story played upon the silver screen, yet my whole universe was seated right next to me. The gentle touch of your fingers finding mine in the dark was poetry words could never capture.",
    image: photoUs3.url,
  },
  {
    numeral: "IV",
    title: "",
    caption:
      "Watching the river flow beneath us, timeless and steady, just like the love quietly taking root in my heart. The world rushed on around us, but right beside you, time stood utterly still.",
    image: photoUs4.url,
  },
  {
    numeral: "V",
    title: "",
    caption:
      "Out of all the paths I’ve walked and every memory we have written into time, my purest sanctuary will always be beside you. You are the quiet prayer my heart whispers every night, and the only blessing I will never stop choosing.",
    image: photoUs2.url,
  },
];

/** "Our Song" retro cassette keepsake. */
export const ourSong = {
  track: "Inayae",
  lyric: "Every time this melody plays, in my mind, I'm holding you.",
};

/** Wishing jar — a reason for every day. */
export const jarReasons: string[] = [
  "Your smile makes my whole day brighter.",
  "The way you laugh at my worst jokes.",
  "You understand me without a single word.",
  "Your hand fits mine like it was made for it.",
  "You make ordinary moments feel magical.",
  "The way you care for everyone around you.",
  "Your voice is my favorite sound.",
  "You believe in me even when I don't.",
  "The way your eyes light up when you're happy.",
  "You turn every place into home.",
  "Your courage inspires me every day.",
  "The little things you remember about me.",
  "You make forever feel too short.",
  "Your hugs fix everything.",
  "The way you say my name.",
  "You are my calm in every storm.",
  "Your kindness, even on hard days.",
  "The way you dance when nobody watches.",
  "You make me want to be better.",
  "Your late-night talks that heal everything.",
  "The way you steal my food and my heart.",
  "You are my favorite hello and hardest goodbye.",
  "Your determination when you want something.",
  "The way you scrunch your nose when you smile.",
  "You make distance feel like nothing.",
  "Your faith in us, always.",
  "The way you love your family.",
  "You are my best friend and my greatest love.",
  "Every version of you, in every lifetime.",
  "Simply — because you are you.",
];

/** Footer quick action. */
export const instantHug = {
  label: "Send Me an Instant Hug 🤗",
  message:
    "I just reached the end of our storybook... and I need a real hug from you right now. ❤️",
};
