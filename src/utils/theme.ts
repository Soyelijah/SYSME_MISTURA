export interface CategoryTheme {
  id: number;
  name: string;
  gradient: string;
  solidBg: string;
  textHover: string;
  badgeBg: string;
  badgeText: string;
  cardBgLight: string;
  cardBgDark: string;
  borderColor: string;
  accentHex: string;
  glowColor: string;
}

export const CATEGORY_THEMES: Record<number, CategoryTheme> = {
  1: {
    // Tapas & Entrantes - Warm Spanish Amber / Orange
    id: 1,
    name: 'Tapas & Entrantes',
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    solidBg: 'bg-amber-500',
    textHover: 'hover:text-amber-500',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
    badgeText: 'text-amber-800 dark:text-amber-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-amber-50/80 to-white hover:border-amber-400',
    cardBgDark: 'bg-gradient-to-b from-amber-950/30 to-slate-900 hover:border-amber-500',
    borderColor: 'border-amber-300 dark:border-amber-600/40',
    accentHex: '#f59e0b',
    glowColor: 'shadow-amber-500/30',
  },
  2: {
    // Carnes & Brasa - Deep Fire Crimson & Ruby
    id: 2,
    name: 'Carnes & Brasa',
    gradient: 'from-red-500 via-rose-600 to-red-700',
    solidBg: 'bg-red-600',
    textHover: 'hover:text-red-500',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/80',
    badgeText: 'text-rose-800 dark:text-rose-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-rose-50/80 to-white hover:border-red-400',
    cardBgDark: 'bg-gradient-to-b from-rose-950/30 to-slate-900 hover:border-rose-500',
    borderColor: 'border-red-300 dark:border-red-600/40',
    accentHex: '#e11d48',
    glowColor: 'shadow-red-500/30',
  },
  3: {
    // Pescados & Mariscos - Mediterranean Aqua & Cyan
    id: 3,
    name: 'Pescados & Mariscos',
    gradient: 'from-cyan-500 via-teal-500 to-blue-600',
    solidBg: 'bg-cyan-600',
    textHover: 'hover:text-cyan-500',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/80',
    badgeText: 'text-cyan-800 dark:text-cyan-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-cyan-50/80 to-white hover:border-cyan-400',
    cardBgDark: 'bg-gradient-to-b from-cyan-950/30 to-slate-900 hover:border-cyan-500',
    borderColor: 'border-cyan-300 dark:border-cyan-600/40',
    accentHex: '#0891b2',
    glowColor: 'shadow-cyan-500/30',
  },
  4: {
    // Arroces & Paellas - Golden Valencia Saffron
    id: 4,
    name: 'Arroces & Pastas',
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    solidBg: 'bg-yellow-500',
    textHover: 'hover:text-yellow-600',
    badgeBg: 'bg-yellow-100 dark:bg-yellow-950/80',
    badgeText: 'text-yellow-900 dark:text-yellow-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-yellow-50/80 to-white hover:border-yellow-400',
    cardBgDark: 'bg-gradient-to-b from-yellow-950/30 to-slate-900 hover:border-yellow-500',
    borderColor: 'border-yellow-300 dark:border-yellow-600/40',
    accentHex: '#eab308',
    glowColor: 'shadow-yellow-500/30',
  },
  5: {
    // Hamburguesas & Bocatas - Cheddar & Warm Paprika
    id: 5,
    name: 'Hamburguesas & Bocatas',
    gradient: 'from-orange-500 via-amber-600 to-red-600',
    solidBg: 'bg-orange-500',
    textHover: 'hover:text-orange-500',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/80',
    badgeText: 'text-orange-800 dark:text-orange-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-orange-50/80 to-white hover:border-orange-400',
    cardBgDark: 'bg-gradient-to-b from-orange-950/30 to-slate-900 hover:border-orange-500',
    borderColor: 'border-orange-300 dark:border-orange-600/40',
    accentHex: '#f97316',
    glowColor: 'shadow-orange-500/30',
  },
  6: {
    // Bebidas & Refrescos - Vibrant Electric Azure Blue
    id: 6,
    name: 'Bebidas & Refrescos',
    gradient: 'from-blue-500 via-sky-500 to-indigo-600',
    solidBg: 'bg-blue-500',
    textHover: 'hover:text-blue-500',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/80',
    badgeText: 'text-blue-800 dark:text-blue-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-blue-50/80 to-white hover:border-blue-400',
    cardBgDark: 'bg-gradient-to-b from-blue-950/30 to-slate-900 hover:border-blue-500',
    borderColor: 'border-blue-300 dark:border-blue-600/40',
    accentHex: '#3b82f6',
    glowColor: 'shadow-blue-500/30',
  },
  7: {
    // Cervezas & Vinos - Burgundy & Royal Grape
    id: 7,
    name: 'Cervezas & Vinos',
    gradient: 'from-purple-600 via-violet-600 to-fuchsia-600',
    solidBg: 'bg-purple-600',
    textHover: 'hover:text-purple-500',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/80',
    badgeText: 'text-purple-800 dark:text-purple-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-purple-50/80 to-white hover:border-purple-400',
    cardBgDark: 'bg-gradient-to-b from-purple-950/30 to-slate-900 hover:border-purple-500',
    borderColor: 'border-purple-300 dark:border-purple-600/40',
    accentHex: '#9333ea',
    glowColor: 'shadow-purple-500/30',
  },
  8: {
    // Cafés & Desayunos - Warm Roasted Caramel & Mocha
    id: 8,
    name: 'Cafés & Infusiones',
    gradient: 'from-amber-700 via-yellow-700 to-stone-800',
    solidBg: 'bg-amber-800',
    textHover: 'hover:text-amber-700',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
    badgeText: 'text-amber-900 dark:text-amber-200 font-bold',
    cardBgLight: 'bg-gradient-to-b from-amber-50/80 to-white hover:border-amber-600',
    cardBgDark: 'bg-gradient-to-b from-amber-950/40 to-slate-900 hover:border-amber-600',
    borderColor: 'border-amber-400 dark:border-amber-700/50',
    accentHex: '#b45309',
    glowColor: 'shadow-amber-800/30',
  },
  9: {
    // Postres de Autor - Strawberry Pink & Raspberry
    id: 9,
    name: 'Postres Caseros',
    gradient: 'from-pink-500 via-rose-500 to-fuchsia-600',
    solidBg: 'bg-pink-500',
    textHover: 'hover:text-pink-500',
    badgeBg: 'bg-pink-100 dark:bg-pink-950/80',
    badgeText: 'text-pink-800 dark:text-pink-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-pink-50/80 to-white hover:border-pink-400',
    cardBgDark: 'bg-gradient-to-b from-pink-950/30 to-slate-900 hover:border-pink-500',
    borderColor: 'border-pink-300 dark:border-pink-600/40',
    accentHex: '#ec4899',
    glowColor: 'shadow-pink-500/30',
  },
  10: {
    // Licores & Cócteles - Neon Violet & Magenta
    id: 10,
    name: 'Licores & Cócteles',
    gradient: 'from-fuchsia-600 via-purple-600 to-indigo-700',
    solidBg: 'bg-fuchsia-600',
    textHover: 'hover:text-fuchsia-500',
    badgeBg: 'bg-fuchsia-100 dark:bg-fuchsia-950/80',
    badgeText: 'text-fuchsia-800 dark:text-fuchsia-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-fuchsia-50/80 to-white hover:border-fuchsia-400',
    cardBgDark: 'bg-gradient-to-b from-fuchsia-950/30 to-slate-900 hover:border-fuchsia-500',
    borderColor: 'border-fuchsia-300 dark:border-fuchsia-600/40',
    accentHex: '#c026d3',
    glowColor: 'shadow-fuchsia-500/30',
  },
  100: {
    // Favoritos & Cócteles
    id: 100,
    name: 'Favoritos & Cócteles',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-600',
    solidBg: 'bg-blue-600',
    textHover: 'hover:text-blue-500',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/80',
    badgeText: 'text-blue-800 dark:text-blue-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-blue-50/80 to-white hover:border-blue-400',
    cardBgDark: 'bg-gradient-to-b from-blue-950/30 to-slate-900 hover:border-blue-500',
    borderColor: 'border-blue-300 dark:border-blue-600/40',
    accentHex: '#3b82f6',
    glowColor: 'shadow-blue-500/30',
  },
  101: {
    // Delivery
    id: 101,
    name: 'Delivery',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    solidBg: 'bg-orange-500',
    textHover: 'hover:text-orange-500',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/80',
    badgeText: 'text-orange-800 dark:text-orange-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-orange-50/80 to-white hover:border-orange-400',
    cardBgDark: 'bg-gradient-to-b from-orange-950/30 to-slate-900 hover:border-orange-500',
    borderColor: 'border-orange-300 dark:border-orange-600/40',
    accentHex: '#f97316',
    glowColor: 'shadow-orange-500/30',
  },
  102: {
    // Jugos
    id: 102,
    name: 'Jugos Naturales',
    gradient: 'from-amber-400 via-yellow-500 to-orange-500',
    solidBg: 'bg-amber-500',
    textHover: 'hover:text-amber-500',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
    badgeText: 'text-amber-800 dark:text-amber-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-amber-50/80 to-white hover:border-amber-400',
    cardBgDark: 'bg-gradient-to-b from-amber-950/30 to-slate-900 hover:border-amber-500',
    borderColor: 'border-amber-300 dark:border-amber-600/40',
    accentHex: '#f59e0b',
    glowColor: 'shadow-amber-500/30',
  },
  109: {
    // Ceviches
    id: 109,
    name: 'Ceviches',
    gradient: 'from-cyan-500 via-teal-600 to-blue-600',
    solidBg: 'bg-cyan-600',
    textHover: 'hover:text-cyan-500',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/80',
    badgeText: 'text-cyan-800 dark:text-cyan-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-cyan-50/80 to-white hover:border-cyan-400',
    cardBgDark: 'bg-gradient-to-b from-cyan-950/30 to-slate-900 hover:border-cyan-500',
    borderColor: 'border-cyan-300 dark:border-cyan-600/40',
    accentHex: '#06b6d4',
    glowColor: 'shadow-cyan-500/30',
  },
  110: {
    // Tiraditos
    id: 110,
    name: 'Tiraditos',
    gradient: 'from-sky-500 via-blue-600 to-indigo-600',
    solidBg: 'bg-blue-600',
    textHover: 'hover:text-blue-500',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/80',
    badgeText: 'text-blue-800 dark:text-blue-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-blue-50/80 to-white hover:border-blue-400',
    cardBgDark: 'bg-gradient-to-b from-blue-950/30 to-slate-900 hover:border-blue-500',
    borderColor: 'border-blue-300 dark:border-blue-600/40',
    accentHex: '#3b82f6',
    glowColor: 'shadow-blue-500/30',
  },
  111: {
    // Causas
    id: 111,
    name: 'Causas',
    gradient: 'from-amber-400 via-yellow-500 to-lime-600',
    solidBg: 'bg-amber-500',
    textHover: 'hover:text-amber-500',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
    badgeText: 'text-amber-800 dark:text-amber-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-amber-50/80 to-white hover:border-amber-400',
    cardBgDark: 'bg-gradient-to-b from-amber-950/30 to-slate-900 hover:border-amber-500',
    borderColor: 'border-amber-300 dark:border-amber-600/40',
    accentHex: '#f59e0b',
    glowColor: 'shadow-amber-500/30',
  },
  112: {
    // Pulpos
    id: 112,
    name: 'Pulpos',
    gradient: 'from-purple-500 via-indigo-600 to-violet-700',
    solidBg: 'bg-purple-600',
    textHover: 'hover:text-purple-500',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/80',
    badgeText: 'text-purple-800 dark:text-purple-300 font-bold',
    cardBgLight: 'bg-gradient-to-b from-purple-50/80 to-white hover:border-purple-400',
    cardBgDark: 'bg-gradient-to-b from-purple-950/30 to-slate-900 hover:border-purple-500',
    borderColor: 'border-purple-300 dark:border-purple-600/40',
    accentHex: '#8b5cf6',
    glowColor: 'shadow-purple-500/30',
  },
};

export const getCategoryTheme = (categoryId: number): CategoryTheme => {
  return (
    CATEGORY_THEMES[categoryId] || {
      id: categoryId,
      name: 'General',
      gradient: 'from-blue-600 via-indigo-600 to-sky-600',
      solidBg: 'bg-blue-600',
      textHover: 'hover:text-blue-500',
      badgeBg: 'bg-blue-100 dark:bg-blue-950/80',
      badgeText: 'text-blue-800 dark:text-blue-300 font-bold',
      cardBgLight: 'bg-gradient-to-b from-slate-50 to-white hover:border-blue-400',
      cardBgDark: 'bg-slate-900 hover:border-blue-500',
      borderColor: 'border-slate-300 dark:border-slate-700',
      accentHex: '#2563eb',
      glowColor: 'shadow-blue-500/30',
    }
  );
};
