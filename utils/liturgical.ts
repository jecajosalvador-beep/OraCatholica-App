
import { LiturgicalDay, LiturgicalSeason, LiturgicalColor } from '../types';
import { startOfDay, isWithinInterval, subDays, addDays, differenceInDays } from 'date-fns';

/**
 * Helper to get ordinal suffix for numbers
 */
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Calculates Easter Sunday for a given year using the Meeus/Jones/Butcher algorithm.
 */
function getEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function getLiturgicalInfo(date: Date): LiturgicalDay {
  const year = date.getFullYear();
  const d = startOfDay(date);
  
  const christmas = startOfDay(new Date(year, 11, 25));
  const newYear = startOfDay(new Date(year, 11, 31));
  const christmasEve = startOfDay(new Date(year, 11, 24));
  
  // Advent: Starts 4 Sundays before Dec 25
  const getAdventStart = (y: number) => {
    const chr = startOfDay(new Date(y, 11, 25));
    let start = subDays(chr, chr.getDay() || 7);
    return subDays(start, 21);
  };
  
  const adventStart = getAdventStart(year);
  const easter = startOfDay(getEaster(year));
  const ashWednesday = subDays(easter, 46);
  const pentecost = addDays(easter, 49);
  const baptismOfLord = addDays(christmas, (7 - christmas.getDay()) % 7 + 7); 
  
  let season: LiturgicalSeason = 'Ordinary Time';
  let color: LiturgicalColor = 'Green';
  let name = '';

  // Specific Date Overrides
  const month = d.getMonth();
  const dayOfMonth = d.getDate();

  if (isWithinInterval(d, { start: adventStart, end: subDays(christmas, 1) })) {
    season = 'Advent';
    color = 'Violet';
    const weeks = Math.floor(differenceInDays(d, adventStart) / 7) + 1;
    if (weeks === 3 && d.getDay() === 0) color = 'Rose';
    
    // Simbang Gabi Logic (Dec 16 - 24)
    if (month === 11 && dayOfMonth >= 16 && dayOfMonth <= 24) {
      name = `Simbang Gabi / ${getOrdinal(weeks)} Week of Advent`;
      if (dayOfMonth === 24) name = "Misa de Gallo / Christmas Eve";
    } else {
      name = d.getDay() === 0 ? `${getOrdinal(weeks)} Sunday of Advent` : `${getOrdinal(weeks)} Week of Advent`;
    }
  } 
  else if (isWithinInterval(d, { start: christmas, end: baptismOfLord })) {
    season = 'Christmas';
    color = 'White';
    const dayCount = differenceInDays(d, christmas) + 1;
    if (dayCount === 1) name = "Christmas Day";
    else if (dayOfMonth === 31) name = "New Year's Eve / 7th Day of Octave";
    else if (dayCount <= 8) name = `${getOrdinal(dayCount)} Day in the Octave of Christmas`;
    else name = `${getOrdinal(dayCount)} Day of Christmas`;
  } 
  else if (isWithinInterval(d, { start: ashWednesday, end: subDays(easter, 1) })) {
    season = 'Lent';
    color = 'Violet';
    const diff = differenceInDays(d, ashWednesday);
    const weeks = Math.floor(diff / 7) + 1;
    if (weeks === 4 && d.getDay() === 0) color = 'Rose';
    name = d.getDay() === 0 ? `${getOrdinal(weeks)} Sunday of Lent` : `Lenten Weekday`;
    if (diff === 0) name = "Ash Wednesday";
    // Holy Week
    const holyWeekDiff = differenceInDays(d, subDays(easter, 7));
    if (holyWeekDiff >= 0) {
      if (holyWeekDiff === 0) name = "Palm Sunday";
      else if (holyWeekDiff === 4) { name = "Holy Thursday"; color = 'White'; }
      else if (holyWeekDiff === 5) { name = "Good Friday"; color = 'Red'; }
      else if (holyWeekDiff === 6) { name = "Holy Saturday"; color = 'White'; }
    }
  } 
  else if (isWithinInterval(d, { start: easter, end: pentecost })) {
    season = 'Easter';
    color = 'White';
    const weeks = Math.floor(differenceInDays(d, easter) / 7) + 1;
    name = d.getDay() === 0 ? `${getOrdinal(weeks)} Sunday of Easter` : `Easter Season`;
    if (d.getTime() === easter.getTime()) name = "Easter Sunday";
    if (d.getTime() === pentecost.getTime()) {
        name = "Pentecost Sunday";
        color = "Red";
    }
  } 
  else {
    season = 'Ordinary Time';
    color = 'Green';
    const diffFromPentecost = differenceInDays(d, pentecost);
    const weekNum = Math.floor(diffFromPentecost / 7) + 7;
    name = d.getDay() === 0 ? `${getOrdinal(weekNum)} Sunday in Ordinary Time` : `${getOrdinal(weekNum)} Week in Ordinary Time`;
  }

  return { name, season, color, date: d };
}

export function getColorHex(color: LiturgicalColor): string {
  switch (color) {
    case 'Green': return '#166534'; // Forest Green
    case 'Violet': return '#5b21b6'; // Deep Violet
    case 'White': return '#d4af37'; // Sacred Gold/White
    case 'Red': return '#991b1b'; // Crimson
    case 'Rose': return '#be185d'; // Deep Pink
    default: return '#166534';
  }
}

export function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155 ? '#1a1a1a' : '#ffffff';
}

export function getLightAccent(color: LiturgicalColor): string {
  switch (color) {
    case 'Green': return '#f0fdf4';
    case 'Violet': return '#f5f3ff';
    case 'White': return '#fffbeb';
    case 'Red': return '#fef2f2';
    case 'Rose': return '#fdf2f8';
    default: return '#f0fdf4';
  }
}

export function getDeepAccent(color: LiturgicalColor): string {
  switch (color) {
    case 'Green': return '#064e3b';
    case 'Violet': return '#4c1d95';
    case 'White': return '#92400e'; 
    case 'Red': return '#7f1d1d';
    case 'Rose': return '#831843';
    default: return '#1a1a1a';
  }
}
