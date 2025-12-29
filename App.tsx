
import React, { useState, useEffect, useMemo } from 'react';
import { Home, BookOpen, Users, Church as ChurchIcon, Calendar, Settings as SettingsIcon, Plus, Heart, Bell, Trash2, Edit3, ChevronRight, X, Info, Quote, Clock, MapPin, Palette, Type as TypeIcon, CheckCircle2, Download } from 'lucide-react';
import { Prayer, Person, Church, AppSettings, LiturgicalDay, MassSchedule, PersonNote, PrayerCategory } from './types';
import { BUILT_IN_PRAYERS, REFLECTIONS } from './constants';
import { getLiturgicalInfo, getColorHex, getContrastColor, getLightAccent, getDeepAccent } from './utils/liturgical';
import { getLiturgicalExplanation } from './services/geminiService';

const STORAGE_KEYS = {
  PRAYERS: 'ora_prayers',
  PEOPLE: 'ora_people',
  CHURCHES: 'ora_churches',
  SETTINGS: 'ora_settings'
};

const ACCENT_PRESETS = [
  { name: 'Sacred Gold', hex: '#d4af37' },
  { name: 'Deep Crimson', hex: '#991b1b' },
  { name: 'Marian Blue', hex: '#1e3a8a' },
  { name: 'Forest Green', hex: '#166534' },
  { name: 'Lenten Purple', hex: '#5b21b6' },
  { name: 'Charcoal Ink', hex: '#262626' }
];

/**
 * Custom SVG component representing the Chalice and Host logo provided by the user.
 * Kept as a simple line-art to respect "dont improve the logo".
 */
const SacredChaliceLogo = ({ size = 64, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Host */}
    <circle cx="256" cy="110" r="50" stroke={color} strokeWidth="14" />
    <path d="M256 80V140M226 110H286" stroke={color} strokeWidth="14" strokeLinecap="round" />
    {/* Glow rays */}
    <path d="M180 120L150 130M332 120L362 130M256 40V20M130 80L110 60M382 80L402 60" stroke={color} strokeWidth="10" strokeLinecap="round" opacity="0.4" />
    {/* Chalice Cup */}
    <path d="M160 210H352V250C352 300 320 340 256 340C192 340 160 300 160 250V210Z" stroke={color} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M160 235H352" stroke={color} strokeWidth="14" strokeLinecap="round" />
    <path d="M160 260H352" stroke={color} strokeWidth="10" strokeLinecap="round" />
    {/* Stem & Base */}
    <path d="M256 340V450" stroke={color} strokeWidth="18" strokeLinecap="round" />
    <circle cx="256" cy="385" r="15" stroke={color} strokeWidth="14" />
    <path d="M176 465C176 445 200 450 256 450C312 450 336 445 336 465V475H176V465Z" stroke={color} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M185 450H327" stroke={color} strokeWidth="10" strokeLinecap="round" />
  </svg>
);

/**
 * Seasonal symbols that change based on the liturgical season.
 * Symbols are chosen for their traditional Catholic significance.
 */
const SeasonalSymbol = ({ season, color = "currentColor", size = 48 }) => {
  switch (season) {
    case 'Advent':
      // Advent Wreath (circle with 4 candles)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
          <path d="M12 7v1M12 16v1M8 12h1M15 12h1" opacity="0.5" />
          <path d="M11 3.5l1-1 1 1" />
        </svg>
      );
    case 'Christmas':
      // Star of Bethlehem
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7-5.5-4h7l2-7z" />
          <path d="M12 2v20M2 12h20" opacity="0.2" />
        </svg>
      );
    case 'Lent':
      // Crown of Thorns or Simple Cross
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M7 7h10" />
          <path d="M9 5l1 1M14 5l1 1M5 10l1 1M18 10l1 1" opacity="0.5" />
        </svg>
      );
    case 'Easter':
      // Rising Sun or Resurrected Radiance
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" />
          <path d="M12 10v4M10 12h4" strokeWidth="1.5" />
        </svg>
      );
    default: // Ordinary Time
      // Chi-Rho or Wheat (Traditional symbols of growth)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M12 2a4 4 0 0 1 0 8H8M8 2h4M10 18l4-12" />
          <path d="M8 12h8" opacity="0.3" />
        </svg>
      );
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isIntro, setIsIntro] = useState(true);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>({
    accentColor: '#166534',
    useLiturgicalColor: true,
    fontSize: 'base',
    highContrastFonts: true,
    prayerNotifications: true,
    massNotifications: true,
    showCalendar: true
  });
  const [litInfo, setLitInfo] = useState<LiturgicalDay>(getLiturgicalInfo(new Date()));
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [showAiExp, setShowAiExp] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  
  // Modals
  const [showAddChurch, setShowAddChurch] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState<string | null>(null);
  const [showAddPrayer, setShowAddPrayer] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);

  // Form State - Church
  const [newChurchName, setNewChurchName] = useState('');
  const [newChurchLoc, setNewChurchLoc] = useState('');
  const [newSchedDay, setNewSchedDay] = useState(0);
  const [newSchedTime, setNewSchedTime] = useState('08:00 AM');

  // Form State - Prayer
  const [newPrayerTitle, setNewPrayerTitle] = useState('');
  const [newPrayerText, setNewPrayerText] = useState('');
  const [newPrayerCat, setNewPrayerCat] = useState<PrayerCategory>('None');

  // Form State - Person
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonNote, setNewPersonNote] = useState<PersonNote>('None');
  const [newPersonLinkedPrayers, setNewPersonLinkedPrayers] = useState<string[]>([]);

  // Derived Theme Values
  const themeColor = settings.useLiturgicalColor ? getColorHex(litInfo.color) : settings.accentColor;
  const themeContrast = getContrastColor(themeColor);
  const themeLight = getLightAccent(litInfo.color); 
  const themeDeep = getDeepAccent(litInfo.color);

  useEffect(() => {
    const timer = setTimeout(() => setIsIntro(false), 3000);
    
    const savedPrayers = localStorage.getItem(STORAGE_KEYS.PRAYERS);
    if (savedPrayers) {
      setPrayers(JSON.parse(savedPrayers));
    } else {
      setPrayers(BUILT_IN_PRAYERS);
      localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(BUILT_IN_PRAYERS));
    }

    const savedPeople = localStorage.getItem(STORAGE_KEYS.PEOPLE);
    if (savedPeople) setPeople(JSON.parse(savedPeople));
    
    const savedChurches = localStorage.getItem(STORAGE_KEYS.CHURCHES);
    if (savedChurches) setChurches(JSON.parse(savedChurches));

    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(prayers));
  }, [prayers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHURCHES, JSON.stringify(churches));
  }, [churches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    document.documentElement.classList.remove('dark');
  }, [settings]);

  const dailyReflection = useMemo(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return REFLECTIONS[dayOfYear % REFLECTIONS.length];
  }, []);

  const handleAiExplain = async () => {
    setShowAiExp(true);
    if (!aiExplanation) {
      const exp = await getLiturgicalExplanation(litInfo.season, litInfo.name, litInfo.color);
      setAiExplanation(exp || "The Church celebrates this season as a holy time of growth.");
    }
  };

  const addChurch = () => {
    if (!newChurchName.trim()) return;
    const newChurch: Church = {
        id: Date.now().toString(),
        name: newChurchName,
        location: newChurchLoc,
        schedules: [],
        isDefault: churches.length === 0
    };
    setChurches([...churches, newChurch]);
    setNewChurchName('');
    setNewChurchLoc('');
    setShowAddChurch(false);
  };

  const addSchedule = () => {
    if (!showAddSchedule) return;
    const newSchedule: MassSchedule = {
      id: Date.now().toString(),
      day: newSchedDay,
      time: newSchedTime
    };
    setChurches(churches.map(c => 
      c.id === showAddSchedule 
        ? { ...c, schedules: [...c.schedules, newSchedule].sort((a,b) => a.day - b.day || a.time.localeCompare(b.time)) } 
        : c
    ));
    setShowAddSchedule(null);
  };

  const removeSchedule = (churchId: string, scheduleId: string) => {
    setChurches(churches.map(c => 
      c.id === churchId 
        ? { ...c, schedules: c.schedules.filter(s => s.id !== scheduleId) } 
        : c
    ));
  };

  const addPersonalPrayer = () => {
    if (!newPrayerTitle.trim() || !newPrayerText.trim()) return;
    const newPrayer: Prayer = {
      id: Date.now().toString(),
      title: newPrayerTitle,
      text: newPrayerText,
      type: 'Personal',
      category: newPrayerCat,
      isFavorite: false,
      repeatType: 'Daily',
      reminderEnabled: false
    };
    setPrayers([...prayers, newPrayer]);
    setNewPrayerTitle('');
    setNewPrayerText('');
    setNewPrayerCat('None');
    setShowAddPrayer(false);
  };

  const addPerson = () => {
    if (!newPersonName.trim()) return;
    const newPerson: Person = {
      id: Date.now().toString(),
      name: newPersonName,
      note: newPersonNote,
      linkedPrayers: newPersonLinkedPrayers
    };
    setPeople([...people, newPerson]);
    setNewPersonName('');
    setNewPersonNote('None');
    setNewPersonLinkedPrayers([]);
    setShowAddPerson(false);
  };

  const togglePersonPrayed = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setPeople(people.map(p => 
      p.id === id ? { ...p, lastPrayed: p.lastPrayed === today ? undefined : today } : p
    ));
  };

  const renderHome = () => (
    <div className="space-y-6 pb-24 p-4 animate-fade-in-up">
      <div 
        className="rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden transition-all duration-700 border-b-4 border-black/10"
        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, color: themeContrast }}
      >
        <div className="absolute top-2 right-4 opacity-20 transform scale-150 origin-top-right">
          <SeasonalSymbol season={litInfo.season} color={themeContrast} size={160} />
        </div>
        <div className="relative z-10">
          <div className="mb-4 flex items-center space-x-3">
             <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
                <SeasonalSymbol season={litInfo.season} color={themeContrast} size={32} />
             </div>
             <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-80">{litInfo.season} Season</p>
          </div>
          <h1 className={`text-3xl ${settings.highContrastFonts ? 'font-black' : 'font-bold'} serif mb-1 leading-tight`}>{litInfo.name}</h1>
          <p className="text-sm opacity-70 mt-3 font-medium flex items-center">
            <Calendar size={14} className="mr-2" />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <button 
            onClick={handleAiExplain}
            className="mt-6 flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold uppercase transition-all"
            style={{ color: themeContrast }}
          >
            <Info size={14} />
            <span>Liturgical Meaning</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 relative">
        <div className="absolute top-6 left-6 text-slate-100 -z-10">
          <Quote size={48} />
        </div>
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4">Verse of the Day</h3>
        <p className={`text-xl serif italic ${settings.highContrastFonts ? 'font-bold text-black' : 'text-slate-800'} mb-3 leading-snug`}>"{dailyReflection.verse}"</p>
        <p className="text-sm font-semibold text-slate-500 mb-6">— {dailyReflection.ref}</p>
        <div 
          className="p-4 rounded-2xl border-l-2"
          style={{ backgroundColor: themeLight, borderColor: themeColor }}
        >
          <p className={`text-sm leading-relaxed italic ${settings.highContrastFonts ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
            {dailyReflection.reflect}
          </p>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className={`text-xl font-bold text-slate-800 serif ${settings.highContrastFonts ? 'font-black tracking-tight' : ''}`}>Daily Devotions</h2>
          <button onClick={() => setActiveTab('prayers')} className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>Library</button>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide px-1">
          {prayers.filter(p => p.isFavorite || p.type === 'Built-in').slice(0, 6).map(p => (
            <button 
              key={p.id} 
              onClick={() => setSelectedPrayer(p)}
              className="min-w-[150px] bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-start text-left transition-transform active:scale-95"
            >
              <div className="p-2 rounded-xl mb-3" style={{ backgroundColor: themeLight, color: themeDeep }}>
                <Heart size={16} fill={p.isFavorite ? 'currentColor' : 'none'} />
              </div>
              <h4 className={`font-bold text-slate-800 text-sm leading-tight line-clamp-2 serif ${settings.highContrastFonts ? 'font-black' : ''}`}>{p.title}</h4>
            </button>
          ))}
        </div>
      </section>

      <section className="px-1">
        <h2 className={`text-xl font-bold text-slate-800 mb-4 serif ${settings.highContrastFonts ? 'font-black tracking-tight' : ''}`}>Holy Mass</h2>
        {churches.length > 0 && churches[0].schedules.length > 0 ? (
            <div 
            className="rounded-[2rem] p-6 flex items-center justify-between border shadow-sm"
            style={{ backgroundColor: themeLight, borderColor: `${themeColor}22` }}
            >
            <div className="flex items-center space-x-4">
                <div className="p-4 rounded-2xl shadow-lg" style={{ backgroundColor: themeColor, color: themeContrast }}>
                   <SacredChaliceLogo size={24} color={themeContrast} />
                </div>
                <div>
                <p className={`font-bold text-slate-900 serif text-lg ${settings.highContrastFonts ? 'font-black' : ''}`}>{churches[0].name}</p>
                <p className={`text-sm font-medium ${settings.highContrastFonts ? 'text-slate-800 opacity-90' : 'opacity-60'}`}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][churches[0].schedules[0].day]} • {churches[0].schedules[0].time}
                </p>
                </div>
            </div>
            </div>
        ) : (
            <button 
                onClick={() => setActiveTab('churches')}
                className="w-full rounded-[2rem] p-8 flex flex-col items-center justify-center border-2 border-dashed transition-colors hover:bg-slate-50"
                style={{ borderColor: `${themeColor}33`, color: themeDeep }}
            >
                <Plus size={32} className="mb-2 opacity-40" />
                <p className="font-bold serif">{churches.length === 0 ? "Add Your Parish" : "Add Mass Schedules"}</p>
                <p className="text-xs opacity-60 uppercase tracking-widest mt-1">Manage Your Spiritual Life</p>
            </button>
        )}
      </section>
    </div>
  );

  const renderPrayers = () => (
    <div className="p-4 space-y-6 pb-24 animate-fade-in-up">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-slate-800 serif">Prayer Library</h1>
        <button 
          onClick={() => setShowAddPrayer(true)}
          className="p-3 rounded-2xl shadow-lg" 
          style={{ backgroundColor: themeColor, color: themeContrast }}
        >
          <Plus size={24} />
        </button>
      </div>
      
      <div className="space-y-4">
        {prayers.map(p => (
          <div 
            key={p.id} 
            onClick={() => setSelectedPrayer(p)}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group active:bg-slate-50 cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {p.type === 'Personal' && <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase">Personal</span>}
                <h3 className={`font-bold text-lg text-slate-800 serif leading-none ${settings.highContrastFonts ? 'font-black' : ''}`}>{p.title}</h3>
              </div>
              <p className={`text-xs truncate max-w-[240px] italic ${settings.highContrastFonts ? 'text-slate-600 font-bold' : 'text-slate-400'}`}>"{p.text.substring(0, 60)}..."</p>
            </div>
            <div className="flex space-x-4 items-center">
              <button 
                onClick={(e) => { e.stopPropagation(); setPrayers(prayers.map(x => x.id === p.id ? {...x, isFavorite: !x.isFavorite} : x)) }}
                className={`${p.isFavorite ? 'text-red-500' : 'text-slate-300'}`}
              >
                <Heart size={20} fill={p.isFavorite ? 'currentColor' : 'none'} />
              </button>
              {p.type === 'Personal' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm("Delete this prayer?")) setPrayers(prayers.filter(x => x.id !== p.id)) }}
                  className="text-slate-200 hover:text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <ChevronRight size={20} className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPeople = () => (
    <div className="p-4 space-y-6 pb-24 animate-fade-in-up">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-slate-800 serif">People I Pray For</h1>
        <button 
          onClick={() => setShowAddPerson(true)}
          className="p-3 rounded-2xl shadow-lg" 
          style={{ backgroundColor: themeColor, color: themeContrast }}
        >
          <Plus size={24} />
        </button>
      </div>

      {people.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed" style={{ borderColor: `${themeColor}22` }}>
           <Users className="mx-auto mb-4 opacity-20" size={64} style={{ color: themeColor }} />
           <p className={`serif text-lg italic ${settings.highContrastFonts ? 'font-bold text-slate-700' : 'text-slate-400'}`}>"Carry each other’s burdens..."</p>
           <button 
             onClick={() => setShowAddPerson(true)}
             className="mt-6 px-6 py-2 rounded-full font-bold uppercase text-[10px] tracking-[0.2em]"
             style={{ backgroundColor: themeColor, color: themeContrast }}
           >
             Add First Person
           </button>
        </div>
      ) : (
        <div className="space-y-4">
          {people.map(person => {
            const isPrayedToday = person.lastPrayed === new Date().toISOString().split('T')[0];
            return (
              <div key={person.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-xl font-bold text-slate-800 serif ${settings.highContrastFonts ? 'font-black' : ''}`}>{person.name}</h3>
                      {person.note !== 'None' && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: themeLight, color: themeDeep }}>
                          {person.note}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      {person.linkedPrayers.map(pid => {
                        const pObj = prayers.find(x => x.id === pid);
                        return pObj ? <div key={pid} className="text-[10px] text-slate-400 italic">Praying: {pObj.title}</div> : null;
                      })}
                    </div>
                  </div>
                  <button 
                    onClick={() => setPeople(people.filter(p => p.id !== person.id))}
                    className="text-slate-200 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isPrayedToday ? 'Prayed Today' : 'Not prayed today'}
                  </span>
                  <button 
                    onClick={() => togglePersonPrayed(person.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-xs transition-all ${isPrayedToday ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <CheckCircle2 size={16} />
                    <span>{isPrayedToday ? 'Blessed' : 'Mark as Prayed'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="p-4 space-y-8 pb-24 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-800 serif">Configuration</h1>
      
      {/* Brand Section */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3 px-2">
          <Palette size={18} style={{ color: themeColor }} />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">App Branding</h2>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col items-center text-center">
            <div className="mb-6 p-6 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner">
               <SacredChaliceLogo size={120} color={themeColor} />
            </div>
            <h3 className="text-xl font-bold serif text-slate-900 mb-1">Official Logo</h3>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">OraCatholica Chalice & Host</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center space-x-3 px-2">
          <Palette size={18} style={{ color: themeColor }} />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Sacred Colors</h2>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-6 flex items-center justify-between border-b border-slate-50">
            <div className="flex-1 pr-4">
              <span className="text-slate-700 font-bold serif block">Sync Liturgical Colors</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Current: {litInfo.color}</span>
            </div>
            <button 
              onClick={() => setSettings({...settings, useLiturgicalColor: !settings.useLiturgicalColor})}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer`}
              style={{ backgroundColor: settings.useLiturgicalColor ? themeColor : '#e2e8f0' }}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.useLiturgicalColor ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          {!settings.useLiturgicalColor && (
            <div className="p-6 space-y-4 animate-fade-in-up">
              <span className="text-slate-700 font-bold serif block">Choose Sacred Accent</span>
              <div className="grid grid-cols-6 gap-2">
                {ACCENT_PRESETS.map(preset => (
                  <button
                    key={preset.hex}
                    onClick={() => setSettings({ ...settings, accentColor: preset.hex })}
                    className={`w-full aspect-square rounded-full border-4 transition-transform ${settings.accentColor === preset.hex ? 'scale-110' : 'scale-90 border-transparent opacity-60'}`}
                    style={{ backgroundColor: preset.hex, borderColor: settings.accentColor === preset.hex ? '#ffffff88' : 'transparent' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center space-x-3 px-2">
          <TypeIcon size={18} style={{ color: themeColor }} />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Typography</h2>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-6 flex items-center justify-between border-b border-slate-50">
            <div className="flex-1 pr-4">
              <span className="text-slate-700 font-bold serif block">High Contrast Fonts</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Sharper legibility</span>
            </div>
            <button 
              onClick={() => setSettings({...settings, highContrastFonts: !settings.highContrastFonts})}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer`}
              style={{ backgroundColor: settings.highContrastFonts ? themeColor : '#e2e8f0' }}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.highContrastFonts ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>

      <button 
        onClick={() => {
          if(confirm("This will permanently erase all your parishes, prayers, and intercessions. Continue?")) {
            localStorage.clear();
            window.location.reload();
          }
        }}
        className="w-full bg-red-50 rounded-3xl p-6 border border-red-100 flex items-center justify-between group transition-colors hover:bg-red-100"
      >
        <span className="text-red-700 font-bold serif">Reset Spiritual Data</span>
        <Trash2 className="text-red-600" size={20} />
      </button>

      <div className="text-center opacity-30 text-[10px] uppercase tracking-widest font-bold">
        OraCatholica v1.2 • Roman Catholic Tradition
      </div>
    </div>
  );

  if (isIntro) {
    return (
      <div className="fixed inset-0 bg-[#fdfbf7] flex flex-col items-center justify-center transition-opacity duration-1000">
        <div className="animate-fade-in-up flex flex-col items-center">
          <div className="mb-8 p-12 rounded-[4rem] bg-white shadow-2xl scale-110 transition-transform duration-1000 hover:rotate-3 border border-slate-50">
             <SacredChaliceLogo size={128} color={themeColor} />
          </div>
          <h1 className="text-5xl font-bold serif text-slate-900 tracking-tight">OraCatholica</h1>
          <div className="h-1 w-12 bg-current mt-4 opacity-20" style={{ color: themeColor }}></div>
          <p className="text-slate-400 mt-4 font-medium uppercase tracking-[0.3em] text-[10px]">A Companion for Daily Catholic Prayer</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#fdfbf7] text-${settings.fontSize}`}>
      <div className="h-6" />

      <main className="max-w-md mx-auto min-h-screen">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'prayers' && renderPrayers()}
        {activeTab === 'intercessions' && renderPeople()}
        {activeTab === 'churches' && (
           <div className="p-4 space-y-6 pb-24 animate-fade-in-up">
             <div className="flex justify-between items-center mb-2">
               <h1 className="text-3xl font-bold text-slate-800 serif">Parish Life</h1>
               <button 
                 onClick={() => setShowAddChurch(true)}
                 className="p-3 rounded-2xl shadow-lg" 
                 style={{ backgroundColor: themeColor, color: themeContrast }}
               >
                 <Plus size={24} />
               </button>
             </div>
             {churches.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed" style={{ borderColor: `${themeColor}22` }}>
                   <div className="flex justify-center mb-6 opacity-10">
                      <SacredChaliceLogo size={100} color={themeColor} />
                   </div>
                   <p className="text-slate-400 serif text-lg italic">Add your local parish to track Mass times.</p>
                   <button onClick={() => setShowAddChurch(true)} className="mt-6 px-6 py-2 rounded-full font-bold uppercase text-[10px] tracking-[0.2em]" style={{ backgroundColor: themeColor, color: themeContrast }}>
                     Create First Parish
                   </button>
                </div>
             ) : (
                 <div className="space-y-4">
                    {churches.map(church => (
                        <div key={church.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                           <div className="flex justify-between items-start mb-4">
                              <div className="flex-1 pr-4">
                                 <h3 className={`text-xl font-bold text-slate-800 serif ${settings.highContrastFonts ? 'font-black' : ''}`}>{church.name}</h3>
                                 <div className="flex items-center text-xs text-slate-400 mt-1"><MapPin size={12} className="mr-1" />{church.location || 'No location set'}</div>
                              </div>
                              <button onClick={() => setChurches(churches.filter(c => c.id !== church.id))} className="text-slate-200 hover:text-red-500"><Trash2 size={18} /></button>
                           </div>
                           <div className="space-y-2 mb-4">
                              {church.schedules.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">No schedules added yet.</p>
                              ) : (
                                church.schedules.map(s => (
                                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                      <div className="flex items-center space-x-3">
                                        <div className="p-1.5 rounded-lg bg-white shadow-sm" style={{ color: themeDeep }}><Clock size={14} /></div>
                                        <span className={`text-sm font-bold serif ${settings.highContrastFonts ? 'text-slate-900' : 'text-slate-700'}`}>{['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][s.day]}</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <span className="text-sm font-bold" style={{ color: themeDeep }}>{s.time}</span>
                                        <button onClick={() => removeSchedule(church.id, s.id)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                                      </div>
                                  </div>
                                ))
                              )}
                           </div>
                           <button onClick={() => setShowAddSchedule(church.id)} className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-slate-50" style={{ borderColor: `${themeColor}22`, color: themeDeep }}>
                              <Plus size={14} /><span>Add Mass Time</span>
                           </button>
                        </div>
                    ))}
                 </div>
             )}
           </div>
        )}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Add Person Modal */}
      {showAddPerson && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#fdfbf7] w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-slate-800 serif">Add Person</h2>
               <button onClick={() => setShowAddPerson(false)} className="text-slate-400"><X /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Full Name</label>
                <input value={newPersonName} onChange={e => setNewPersonName(e.target.value)} placeholder="e.g. John Doe" className="w-full mt-1 bg-white border border-slate-100 rounded-2xl p-4 text-slate-800" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Note (Optional)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['Sick', 'Deceased', 'Thanksgiving', 'Guidance', 'None'] as PersonNote[]).map(note => (
                    <button key={note} onClick={() => setNewPersonNote(note)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase ${newPersonNote === note ? 'text-white' : 'bg-white border border-slate-100 text-slate-400'}`} style={{ backgroundColor: newPersonNote === note ? themeColor : undefined }}>{note}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Link Prayers</label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                  {prayers.map(p => (
                    <button key={p.id} onClick={() => setNewPersonLinkedPrayers(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all ${newPersonLinkedPrayers.includes(p.id) ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-50 text-slate-500'}`}>
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={addPerson} disabled={!newPersonName.trim()} className="w-full py-4 rounded-[2rem] font-bold shadow-xl transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: themeColor, color: themeContrast }}>
                Save Intention
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Personal Prayer Modal */}
      {showAddPrayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#fdfbf7] w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-slate-800 serif">New Prayer</h2>
               <button onClick={() => setShowAddPrayer(false)} className="text-slate-400"><X /></button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Title</label>
                <input value={newPrayerTitle} onChange={e => setNewPrayerTitle(e.target.value)} placeholder="e.g. Prayer for Family" className="w-full mt-1 bg-white border border-slate-100 rounded-2xl p-4 text-slate-800" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Prayer Text</label>
                <textarea value={newPrayerText} onChange={e => setNewPrayerText(e.target.value)} placeholder="Type your prayer here..." className="w-full mt-1 bg-white border border-slate-100 rounded-2xl p-4 text-slate-800 h-40 resize-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Category</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['Morning', 'Evening', 'Thanksgiving', 'Petition', 'None'] as PrayerCategory[]).map(cat => (
                    <button key={cat} onClick={() => setNewPrayerCat(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase ${newPrayerCat === cat ? 'text-white' : 'bg-white border border-slate-100 text-slate-400'}`} style={{ backgroundColor: newPrayerCat === cat ? themeColor : undefined }}>{cat}</button>
                  ))}
                </div>
              </div>
              <button onClick={addPersonalPrayer} disabled={!newPrayerTitle.trim() || !newPrayerText.trim()} className="w-full py-4 rounded-[2rem] font-bold shadow-xl transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: themeColor, color: themeContrast }}>
                Create Prayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Church Modal */}
      {showAddChurch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-4">
           <div className="bg-[#fdfbf7] w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-slate-800 serif">Add Parish</h2>
                 <button onClick={() => setShowAddChurch(false)} className="text-slate-400"><X /></button>
              </div>
              <div className="space-y-4 mb-8">
                 <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Parish Name</label>
                    <input value={newChurchName} onChange={e => setNewChurchName(e.target.value)} placeholder="e.g. St. Michael Parish" className="w-full mt-1 bg-white border border-slate-100 rounded-2xl p-4 text-slate-800" />
                 </div>
                 <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Location / Note</label>
                    <input value={newChurchLoc} onChange={e => setNewChurchLoc(e.target.value)} placeholder="e.g. 123 Church Rd." className="w-full mt-1 bg-white border border-slate-100 rounded-2xl p-4 text-slate-800" />
                 </div>
              </div>
              <button onClick={addChurch} disabled={!newChurchName.trim()} className="w-full py-4 rounded-[2rem] font-bold shadow-xl transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: themeColor, color: themeContrast }}>
                 Confirm Parish
              </button>
           </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddSchedule && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-4">
           <div className="bg-[#fdfbf7] w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-slate-800 serif">Add Mass Time</h2>
                 <button onClick={() => setShowAddSchedule(null)} className="text-slate-400"><X /></button>
              </div>
              <div className="space-y-6 mb-8">
                 <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Day of the Week</label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                       {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                         <button key={day} onClick={() => setNewSchedDay(idx)} className={`py-3 rounded-xl text-xs font-bold transition-all ${newSchedDay === idx ? '' : 'bg-white text-slate-400 border border-slate-100'}`} style={{ backgroundColor: newSchedDay === idx ? themeColor : undefined, color: newSchedDay === idx ? themeContrast : undefined }}>{day}</button>
                       ))}
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-2">Time</label>
                    <input type="text" value={newSchedTime} onChange={e => setNewSchedTime(e.target.value)} placeholder="e.g. 06:00 AM" className="w-full mt-1 bg-white border border-slate-100 rounded-2xl p-4 text-slate-800" />
                 </div>
              </div>
              <button onClick={addSchedule} className="w-full py-4 rounded-[2rem) font-bold shadow-xl transition-all active:scale-95" style={{ backgroundColor: themeColor, color: themeContrast }}>Save Mass Time</button>
           </div>
        </div>
      )}

      {/* Prayer Detail Modal */}
      {selectedPrayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
           <div className="bg-[#fdfbf7] w-full max-w-md rounded-[3rem] p-8 shadow-2xl border-t-8 max-h-[90vh] overflow-y-auto" style={{ borderTopColor: themeColor }}>
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setSelectedPrayer(null)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{selectedPrayer.type}</div>
                <Heart size={20} fill={selectedPrayer.isFavorite ? themeColor : 'none'} className={selectedPrayer.isFavorite ? '' : 'text-slate-200'} style={{ color: selectedPrayer.isFavorite ? themeColor : undefined }} />
              </div>
              <h2 className={`text-3xl font-bold text-slate-900 serif mb-6 text-center ${settings.highContrastFonts ? 'font-black' : ''}`}>{selectedPrayer.title}</h2>
              <div className={`serif text-xl leading-relaxed text-center whitespace-pre-wrap px-2 italic ${settings.highContrastFonts ? 'font-bold text-slate-800' : 'text-slate-700'}`}>{selectedPrayer.text}</div>
              <div className="mt-10 pt-6 border-t border-slate-100 text-center">
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-8">Gloria in Excelsis Deo</p>
                <button onClick={() => setSelectedPrayer(null)} className="w-full py-4 rounded-3xl font-bold shadow-xl transition-transform active:scale-95" style={{ backgroundColor: themeColor, color: themeContrast }}>Amen</button>
              </div>
           </div>
        </div>
      )}

      {/* AI Explanation Modal */}
      {showAiExp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-fade-in-up border-b-8" style={{ borderBottomColor: themeColor }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold text-slate-800 serif ${settings.highContrastFonts ? 'font-black' : ''}`}>Liturgical Insight</h2>
              <button onClick={() => setShowAiExp(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <p className={`leading-relaxed italic serif text-xl mb-8 ${settings.highContrastFonts ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{aiExplanation || "Consulting the Church's calendar..."}</p>
            <button onClick={() => setShowAiExp(false)} className="w-full py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200" style={{ backgroundColor: themeColor, color: themeContrast }}>God be praised</button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-40 pb-safe">
        <div className="max-w-md mx-auto flex justify-around p-3">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'prayers', icon: BookOpen, label: 'Prayers' },
            { id: 'intercessions', icon: Users, label: 'People' },
            { id: 'churches', icon: ChurchIcon, label: 'Mass' },
            { id: 'settings', icon: SettingsIcon, label: 'Setup' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center transition-all duration-300 px-4 py-2 rounded-2xl ${activeTab === tab.id ? 'scale-110' : 'opacity-40'}`} style={{ color: activeTab === tab.id ? themeDeep : undefined, backgroundColor: activeTab === tab.id ? themeLight : 'transparent' }}>
              <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
