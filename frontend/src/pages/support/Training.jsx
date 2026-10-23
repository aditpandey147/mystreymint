// frontend/src/pages/support/Training.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import videoThumbnail from "../../assets/video-thumbnail.jpg";
import {
  Play,
  BookOpen,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Video,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Rocket,
  Headphones,
  PlayCircle,
} from "lucide-react";

// ================================================================
// 🎨 THEME
// ================================================================
const C = {
  mainBg: "#000C16",
  card: "#031520",
  cardSecondary: "#0C1926",
  input: "#000611",
  gold: "#F6C55D",
  goldHover: "#FFD36D",
  darkGold: "#B77B32",
  cyan: "#00D4D9",
  heading: "#F5F5F3",
  secondary: "#AAB3B9",
  muted: "#707F88",
  border: "#29414C",
  goldGradient:
    "linear-gradient(135deg, #FFD36D 0%, #F6C55D 50%, #B77B32 100%)",
};

const Training = () => {
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const faqContainerRef = useRef(null);

  // Demo Video Configuration
  const VIDEO_ID = "YOUR_VIDEO_ID"; // Replace with your YouTube video ID
  const videoUrl = `https://www.youtube.com/embed/${VIDEO_ID}`;

  // ================================================================
  // FAQ DATA — MysteryMint AI specific
  // ================================================================
  const faqs = [
    // ============ Getting Started (5) ============
    {
      id: 1,
      category: "Getting Started",
      question: "What is MysteryMint AI and how does it work?",
      answer:
        "MysteryMint AI is an AI-powered platform that creates complete, ready-to-play mystery games in minutes. Enter your title, genre, and setting — our AI generates the story, suspects, clues, evidence documents, puzzles, timeline, and a full Game Master solution. Everything exports as a professional PDF kit you can print and play.",
      icon: "🎭",
    },
    {
      id: 2,
      category: "Getting Started",
      question: "How do I create my first mystery?",
      answer:
        "Go to your dashboard → click 'Create New Mystery' → fill in the title, genre, setting, difficulty, player count and duration → optionally pick a template or write a story idea → click 'Generate My Mystery'. The pipeline runs through 9 stages over 2-4 minutes, then your complete mystery is ready to preview and download.",
      icon: "➕",
    },
    {
      id: 3,
      category: "Getting Started",
      question: "How long does mystery generation take?",
      answer:
        "A complete mystery takes 2-4 minutes to generate. This includes the hidden blueprint, story, characters, clues, evidence documents, puzzles, timelines, solution guide, and AI-generated images (cover, portraits, scenes). You can track live progress on the My Mysteries page while it runs in the background.",
      icon: "⏱️",
    },
    {
      id: 4,
      category: "Getting Started",
      question: "What genres and settings are supported?",
      answer:
        "MysteryMint AI supports Murder Mystery, Detective Mystery, Spy Thriller, Horror Mystery, Sci-Fi Mystery, Historical Mystery, Escape Room adventures and more. Settings are unlimited — Luxury Hotels, Cruise Ships, Victorian Manors, Space Stations, Ancient Tombs, or anything you can imagine.",
      icon: "📚",
    },
    {
      id: 5,
      category: "Getting Started",
      question: "Can I edit or regenerate my mystery?",
      answer:
        "Yes — from the Mystery Detail page you can regenerate any section individually (Story, Suspects, Clues, Puzzles, Solution) without redoing the whole mystery. You can also delete any mystery and generate a fresh one with new parameters.",
      icon: "🔄",
    },

    // ============ Mystery Creation (6) ============
    {
      id: 6,
      category: "Mystery Creation",
      question: "What's included in a complete mystery kit?",
      answer:
        "Every mystery includes: a full Story PDF with chapters, Suspect Cards with detailed character dossiers and portraits, Clues & Evidence PDF, Puzzle Sheets with printable answer space, Timeline, Solution Guide for the Game Master, and Player Instructions. The complete kit downloads as a single ZIP file.",
      icon: "📦",
    },
    {
      id: 7,
      category: "Mystery Creation",
      question: "How are mystery images generated?",
      answer:
        "Every mystery gets AI-generated visuals: a cinematic cover image, portraits for each suspect, and crime scene illustrations for key locations. All images are generated through Replicate and saved locally to your kit — they're included in the ZIP download and in the individual section PDFs.",
      icon: "🎨",
    },
    {
      id: 8,
      category: "Mystery Creation",
      question: "How do I download my mystery kit?",
      answer:
        "From the Mystery Detail page, click 'Download Complete Kit' — this builds a ZIP containing all 6 PDFs (Story, Suspects, Clues & Evidence, Puzzles, Solution, Instructions) plus all images. You can also view or download individual section PDFs from each tab.",
      icon: "📥",
    },
    {
      id: 9,
      category: "Mystery Creation",
      question: "Can I generate multiple mysteries at once?",
      answer:
        "Yes! Each generation runs independently in the background. You can start as many mysteries as your plan allows and track every one from the My Mysteries page — each with its own progress ring, current stage, and status.",
      icon: "📚",
    },
    {
      id: 10,
      category: "Mystery Creation",
      question: "What player counts and durations work best?",
      answer:
        "We support 2-4, 4-8, and 8-12 player counts. Durations range from 30 minutes (quick party games) up to 120+ minutes (elaborate dinner mysteries). The AI adjusts the number of suspects, clue complexity, and puzzle difficulty based on your selected player count and duration.",
      icon: "⏳",
    },
    {
      id: 11,
      category: "Mystery Creation",
      question: "Can I use templates to speed things up?",
      answer:
        "Yes — browse the Templates page to pick from ready-made mystery concepts across all genres. Each template prefills title, genre, setting, difficulty, players, duration, and even a story seed. Click any template card to jump straight into Create Mystery with everything prefilled.",
      icon: "⚡",
    },

    // ============ Studios & Tools (5) ============
    {
      id: 12,
      category: "Studios & Tools",
      question: "What is the Character Studio?",
      answer:
        "Character Studio generates deeply detailed suspects — name, age, role, occupation, personality, background, motive, alibi, public and private information, and a cinematic AI portrait. Characters are saved to your library and can be reused across any mystery.",
      icon: "👥",
    },
    {
      id: 13,
      category: "Studios & Tools",
      question: "What is the Clue & Evidence Studio?",
      answer:
        "Clue & Evidence Studio creates individual clues and evidence documents with cinematic AI visuals. Generate clues by type (Physical, Testimony, Document, Observation, Forensic), importance level (Critical / Major / Minor), and red-herring toggle. Evidence includes letters, diaries, reports, and photos — all with editable body copy.",
      icon: "🔍",
    },
    {
      id: 14,
      category: "Studios & Tools",
      question: "What is the AI Puzzle Studio?",
      answer:
        "AI Puzzle Studio generates 8 puzzle types — Cipher, Riddle, Logic, Deduction, Pattern, Timeline, Relationship, and Math. Each puzzle comes with a question, structured puzzle data, an answer, an explanation, and 3 hints. Difficulty is Easy / Medium / Hard. Perfect for inserting puzzles into existing mysteries.",
      icon: "🧩",
    },
    {
      id: 15,
      category: "Studios & Tools",
      question: "What is the Escape Room AI?",
      answer:
        "Escape Room AI designs complete escape-room experiences: 4-6 interconnected puzzles, room descriptions, a final exit lock with combination, cinematic room visuals, per-puzzle hints, and a full solution walkthrough with GM notes. Choose from 9 themes (Haunted Library, Cyber Heist, Victorian Asylum, Pirate Shipwreck, and more).",
      icon: "🚪",
    },
    {
      id: 16,
      category: "Studios & Tools",
      question: "What are the Sales Kit and Party Planner?",
      answer:
        "The Sales Kit generates platform-optimized marketing copy for 10 platforms (Etsy, Gumroad, Amazon KDP, Fiverr, Pinterest, TikTok, Instagram, Facebook, LinkedIn, Blog) — titles, descriptions, tags, hashtags, and prices per platform. The Party Planner builds a complete host's runbook: invitations, prep timeline, character assignments, food & drink, décor, icebreakers, and GM cue cards.",
      icon: "🎉",
    },

    // ============ DFY Packs (3) ============
    {
      id: 17,
      category: "DFY Mystery Packs",
      question: "What are DFY Mystery Packs?",
      answer:
        "DFY (Done-For-You) Mystery Packs are pre-built, ready-to-play mystery games. Each pack includes a complete kit — story, suspect cards, clues, evidence, puzzles, and solution — delivered as a print-ready ZIP. No AI generation needed — just download, print, and play instantly.",
      icon: "📦",
    },
    {
      id: 18,
      category: "DFY Mystery Packs",
      question: "How many DFY packs are available?",
      answer:
        "We currently offer 10 DFY packs spanning multiple genres: Victorian Manor, Museum Heist, Luxury Train, Remote Lighthouse, Space Station, Clockmaker's Workshop, Egyptian Tomb, Masquerade Ball, Radio Station, and Restaurant Kitchen. Each pack varies in difficulty (Easy / Medium / Hard) and supports 4-8 players.",
      icon: "📚",
    },
    {
      id: 19,
      category: "DFY Mystery Packs",
      question: "Can I sell or resell DFY packs?",
      answer:
        "Yes! DFY packs are royalty-free and can be used commercially. With the RESELLER plan you can rebrand and resell them under your own business — perfect for party planners, event hosts, escape room owners, and digital product sellers.",
      icon: "💼",
    },

    // ============ Plans & Pricing (4) ============
    {
      id: 20,
      category: "Plans & Pricing",
      question: "What plans are available?",
      answer:
        "We offer: FE Front-End ($12), FE + TURBO ($27), Unlimited Silver ($47), Unlimited Gold ($69), Mystery Creator Pro ($37), Viral Shorts AI ($49), Mystery Growth Studio ($67), AI Mystery Branding Suite ($47), DFY Mystery Pack Silver ($97), DFY Mystery Pack Gold ($129), AI Ranker ($69), Agency ($197), and RESELLER ($249).",
      icon: "💎",
    },
    {
      id: 21,
      category: "Plans & Pricing",
      question: "Can I upgrade my plan later?",
      answer:
        "Yes — upgrades are instant. Buy a higher tier anytime and you immediately unlock all new features. All your existing mysteries, characters, clues, and DFY pack downloads stay exactly where they are.",
      icon: "⬆️",
    },
    {
      id: 22,
      category: "Plans & Pricing",
      question: "Do you offer refunds?",
      answer:
        "Yes — we offer a 30-day money-back guarantee. If you're not satisfied for any reason, contact support within 30 days of purchase for a full refund, no questions asked.",
      icon: "✅",
    },
    {
      id: 23,
      category: "Plans & Pricing",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers through our payment partners JVZoo and LaunchPad.",
      icon: "💳",
    },

    // ============ General (3) ============
    {
      id: 24,
      category: "General",
      question: "How do I contact support?",
      answer:
        "Open a support ticket from the Support page in your dashboard, or use live chat for faster responses. Our team replies within 24-48 hours (excluding Sundays). For urgent issues, live chat is the fastest path.",
      icon: "📧",
    },
    {
      id: 25,
      category: "General",
      question: "Can I create unlimited mysteries?",
      answer:
        "With Unlimited Silver and Unlimited Gold plans, yes — unlimited mysteries, unlimited studios usage, and unlimited exports. Lower plans have reasonable monthly generation limits that reset each billing cycle.",
      icon: "♾️",
    },
    {
      id: 26,
      category: "General",
      question: "How do I change my password?",
      answer:
        "Go to Settings → Security → Change Password. Enter your current password and your new password, then click Save. Your initial password is the same as your purchase email — we strongly recommend changing it after first login.",
      icon: "🔐",
    },
  ];

  const categories = ["all", ...new Set(faqs.map((faq) => faq.category))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const categoryCounts = faqs.reduce((acc, faq) => {
    acc[faq.category] = (acc[faq.category] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (id) => setExpandedFaq(expandedFaq === id ? null : id);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToCategory = (category) => {
    const element = document.getElementById(
      `faq-${category.replace(/\s+/g, "-")}`
    );
    if (element)
      element.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handlePlayVideo = () => setIsVideoPlaying(true);

  return (
    <div
      className="flex h-screen"
      style={{ background: C.mainBg }}
    >
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />

        <div
          className="flex-1 overflow-y-auto custom-scroll"
          ref={faqContainerRef}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {/* ===== HEADER ===== */}
            <div className="mb-6">
              <h1
                className="font-['Playfair_Display',Georgia,serif] text-2xl md:text-3xl font-bold flex items-center gap-3"
                style={{ color: C.heading }}
              >
                <BookOpen size={28} style={{ color: C.gold }} />
                Training Center
              </h1>
              <p className="text-sm mt-1" style={{ color: C.secondary }}>
                Watch our demo video and find answers to common questions
              </p>
            </div>

            {/* ===== TWO COLUMN LAYOUT ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ===== LEFT COLUMN ===== */}
              <div className="lg:col-span-2 space-y-6">
                {/* ===== Video Section ===== */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,.35)",
                  }}
                >
                  <div
                    className="px-6 py-4"
                    style={{ background: C.goldGradient }}
                  >
                    <div className="flex items-center gap-2">
                      <Video size={20} style={{ color: C.mainBg }} />
                      <h2
                        className="text-lg font-bold"
                        style={{ color: C.mainBg }}
                      >
                        Demo Video
                      </h2>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: C.mainBg, opacity: 0.75 }}
                    >
                      Watch this quick demo to get started
                    </p>
                  </div>

                  <div className="p-4 md:p-6">
                    <div
                      className="relative aspect-video rounded-xl overflow-hidden shadow-lg group"
                      style={{
                        background: C.cardSecondary,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      {!isVideoPlaying ? (
                        <>
                          {!thumbnailError && (
                            <img
                              src={videoThumbnail}
                              alt="Demo Video Thumbnail"
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={() => setThumbnailError(true)}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                          <button
                            onClick={handlePlayVideo}
                            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                          >
                            <div className="relative">
                              <div
                                className="absolute inset-0 rounded-full animate-ping"
                                style={{ background: "rgba(246,197,93,.35)" }}
                              ></div>
                              <div
                                className="relative w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-2xl"
                                style={{
                                  background: "rgba(255,255,255,.15)",
                                  backdropFilter: "blur(6px)",
                                  border: "2px solid rgba(255,255,255,.3)",
                                }}
                              >
                                <div
                                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg transition"
                                  style={{ background: C.goldGradient }}
                                >
                                  <Play
                                    size={28}
                                    style={{ color: C.mainBg }}
                                    className="ml-1"
                                  />
                                </div>
                              </div>
                            </div>
                          </button>

                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <p
                              className="font-semibold text-sm flex items-center gap-2"
                              style={{ color: C.heading }}
                            >
                              <PlayCircle size={16} style={{ color: C.gold }} />
                              Watch Demo Video
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: C.secondary }}
                            >
                              Click play to watch the demo • ~5 minutes
                            </p>
                          </div>

                          <div
                            className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2"
                            style={{
                              background: "rgba(0,12,22,.75)",
                              backdropFilter: "blur(6px)",
                              border: `1px solid rgba(255,255,255,.15)`,
                              color: C.heading,
                            }}
                          >
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            HD
                          </div>
                        </>
                      ) : (
                        <iframe
                          src={`${videoUrl}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                          title="Demo Video"
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          frameBorder="0"
                        ></iframe>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===== FAQ Section ===== */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,.35)",
                  }}
                >
                  <div
                    className="px-6 py-4"
                    style={{ background: C.goldGradient }}
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle size={20} style={{ color: C.mainBg }} />
                      <h2
                        className="text-lg font-bold"
                        style={{ color: C.mainBg }}
                      >
                        Frequently Asked Questions
                      </h2>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: C.mainBg, opacity: 0.75 }}
                    >
                      Find answers to common questions
                    </p>
                  </div>

                  <div className="p-4 md:p-6">
                    {/* Search */}
                    <div className="relative mb-4">
                      <Search
                        size={18}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                        style={{ color: C.muted }}
                      />
                      <input
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 rounded-xl text-sm focus:outline-none transition"
                        style={{
                          background: C.input,
                          border: `1px solid ${C.border}`,
                          color: C.heading,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = C.gold;
                          e.currentTarget.style.boxShadow = `0 0 0 3px rgba(246,197,93,.15)`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = C.border;
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 transition"
                          style={{ color: C.muted }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <p className="text-xs mb-4" style={{ color: C.secondary }}>
                      Showing {filteredFaqs.length} of {faqs.length} FAQs
                    </p>

                    {Object.keys(groupedFaqs).length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: C.heading }}
                        >
                          No FAQs Found
                        </h3>
                        <p className="text-sm" style={{ color: C.secondary }}>
                          Try adjusting your search or filter
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("all");
                          }}
                          className="mt-4 text-sm font-medium transition"
                          style={{ color: C.gold }}
                        >
                          Clear filters
                        </button>
                      </div>
                    ) : (
                      Object.entries(groupedFaqs).map(
                        ([category, categoryFaqs]) => (
                          <div key={category} className="mb-6 last:mb-0">
                            <h3
                              id={`faq-${category.replace(/\s+/g, "-")}`}
                              className="text-sm font-semibold px-4 py-2 rounded-lg mb-3 flex items-center gap-2"
                              style={{
                                color: C.heading,
                                background: C.cardSecondary,
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              <FolderOpen
                                size={16}
                                style={{ color: C.gold }}
                              />
                              {category} ({categoryFaqs.length})
                            </h3>

                            <div className="space-y-2">
                              {categoryFaqs.map((faq) => {
                                const isOpen = expandedFaq === faq.id;
                                return (
                                  <div
                                    key={faq.id}
                                    className="rounded-xl overflow-hidden transition-all duration-200"
                                    style={{
                                      background: isOpen
                                        ? "rgba(246,197,93,.08)"
                                        : "rgba(0,6,17,.6)",
                                      border: isOpen
                                        ? `1px solid ${C.gold}66`
                                        : `1px solid ${C.border}`,
                                      boxShadow: isOpen
                                        ? "0 8px 24px rgba(0,0,0,.35)"
                                        : "none",
                                    }}
                                  >
                                    <button
                                      onClick={() => toggleFaq(faq.id)}
                                      className="w-full px-4 py-3 text-left flex items-start gap-3 transition"
                                    >
                                      <span className="text-xl mt-0.5">
                                        {faq.icon}
                                      </span>
                                      <span
                                        className="text-sm font-medium pr-4 flex-1"
                                        style={{ color: C.heading }}
                                      >
                                        {faq.question}
                                      </span>
                                      <span
                                        className="transition-transform duration-300 flex-shrink-0 mt-1"
                                        style={{
                                          transform: isOpen
                                            ? "rotate(180deg)"
                                            : "rotate(0)",
                                          color: isOpen ? C.gold : C.muted,
                                        }}
                                      >
                                        <ChevronDown size={18} />
                                      </span>
                                    </button>

                                    {isOpen && (
                                      <div
                                        className="px-4 pb-3 pt-0"
                                        style={{
                                          borderTop: `1px solid ${C.border}`,
                                        }}
                                      >
                                        <p
                                          className="text-sm leading-relaxed pt-3"
                                          style={{ color: C.secondary }}
                                        >
                                          {faq.answer}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* ===== RIGHT COLUMN ===== */}
              <div className="lg:col-span-1 space-y-4 sticky top-4">
                {/* Categories */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 4px 20px rgba(0,0,0,.35)",
                  }}
                >
                  <div
                    className="px-4 py-3"
                    style={{ background: C.goldGradient }}
                  >
                    <h3
                      className="text-sm font-bold flex items-center gap-2"
                      style={{ color: C.mainBg }}
                    >
                      <FolderOpen size={16} />
                      Categories
                    </h3>
                  </div>

                  <div className="p-4">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1"
                      style={
                        selectedCategory === "all"
                          ? {
                              background: "rgba(246,197,93,.15)",
                              color: C.heading,
                              border: `1px solid ${C.gold}66`,
                            }
                          : {
                              color: C.secondary,
                              border: "1px solid transparent",
                            }
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span>📋 All Questions</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: C.input,
                            border: `1px solid ${C.border}`,
                            color: C.secondary,
                          }}
                        >
                          {faqs.length}
                        </span>
                      </div>
                    </button>

                    {categories
                      .filter((c) => c !== "all")
                      .map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            scrollToCategory(category);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition mb-1"
                          style={
                            selectedCategory === category
                              ? {
                                  background: "rgba(246,197,93,.15)",
                                  color: C.heading,
                                  border: `1px solid ${C.gold}66`,
                                }
                              : {
                                  color: C.secondary,
                                  border: "1px solid transparent",
                                }
                          }
                        >
                          <div className="flex items-center justify-between">
                            <span>{category}</span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                background: C.input,
                                border: `1px solid ${C.border}`,
                                color: C.secondary,
                              }}
                            >
                              {categoryCounts[category] || 0}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Need Help */}
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(246,197,93,.08)",
                    border: `1px solid ${C.gold}55`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones size={18} style={{ color: C.gold }} />
                    <h3
                      className="text-sm font-bold"
                      style={{ color: C.heading }}
                    >
                      Need Help?
                    </h3>
                  </div>
                  <p className="text-xs mb-3" style={{ color: C.secondary }}>
                    Still have questions? Our support team is here to help.
                  </p>
                  <div className="space-y-2">
                    <a
                      href="/support"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition hover:-translate-y-[1px]"
                      style={{
                        background: C.goldGradient,
                        color: C.mainBg,
                        border: `1px solid ${C.goldHover}`,
                        boxShadow:
                          "inset 0 1px 1px rgba(255,255,255,.25), 0 6px 18px rgba(246,197,93,.35)",
                      }}
                    >
                      <MessageCircle size={16} />
                      Contact Support
                      <ArrowRight size={14} />
                    </a>
                    <a
                      href="/dashboard"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition"
                      style={{
                        background: C.input,
                        border: `1px solid ${C.border}`,
                        color: C.secondary,
                      }}
                    >
                      <Rocket size={16} />
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full transition z-50"
          style={{
            background: C.goldGradient,
            color: C.mainBg,
            border: `1px solid ${C.goldHover}`,
            boxShadow: "0 8px 24px rgba(246,197,93,.45)",
          }}
        >
          <ChevronUp size={20} />
        </button>
      )}

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(246,197,93,.4);
          border-radius: 20px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(246,197,93,.7);
        }
        .custom-scroll { scroll-behavior: smooth; }
        @keyframes ping {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Training;