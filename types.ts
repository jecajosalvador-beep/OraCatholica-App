
export type LiturgicalSeason = 'Advent' | 'Christmas' | 'Ordinary Time' | 'Lent' | 'Easter';
export type LiturgicalColor = 'Violet' | 'White' | 'Green' | 'Red' | 'Rose';

export interface LiturgicalDay {
  name: string;
  season: LiturgicalSeason;
  color: LiturgicalColor;
  date: Date;
}

export type PrayerType = 'Built-in' | 'Personal';
export type PrayerCategory = 'Morning' | 'Evening' | 'Thanksgiving' | 'Petition' | 'None';
export type RepeatType = 'Once' | 'Daily' | 'Weekly';

export interface Prayer {
  id: string;
  title: string;
  text: string;
  type: PrayerType;
  category: PrayerCategory;
  isFavorite: boolean;
  reminderTime?: string; // HH:mm format
  repeatType: RepeatType;
  reminderEnabled: boolean;
}

export type PersonNote = 'Sick' | 'Deceased' | 'Thanksgiving' | 'Guidance' | 'None';

export interface Person {
  id: string;
  name: string;
  note: PersonNote;
  linkedPrayers: string[]; // Array of prayer IDs
  lastPrayed?: string; // ISO date string
}

export interface MassSchedule {
  id: string;
  day: number; // 0-6 (Sun-Sat)
  time: string; // HH:mm
  notes?: string;
  isSimbangGabi?: boolean;
}

export interface Church {
  id: string;
  name: string;
  location?: string;
  schedules: MassSchedule[];
  isDefault: boolean;
}

export interface AppSettings {
  accentColor: string;
  useLiturgicalColor: boolean;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  highContrastFonts: boolean;
  prayerNotifications: boolean;
  massNotifications: boolean;
  defaultChurchId?: string;
  showCalendar: boolean;
}
