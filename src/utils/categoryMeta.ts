export interface CategoryMeta {
  subtitle: string;
  coverImage: string;
  badgeText?: string;
  accentColor: string;
}

export const CATEGORY_METAS: Record<number, CategoryMeta> = {
  100: {
    subtitle: 'Cócteles de autor, pisco sour peruano, mocktails y bebidas refrescantes.',
    coverImage: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80',
    badgeText: '⭐ Favoritos',
    accentColor: '#3b82f6',
  },
  1: {
    subtitle: 'Tapas crujientes, tequeños artesanales, empanadas y piqueos para compartir.',
    coverImage: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&auto=format&fit=crop&q=80',
    badgeText: '🔥 Para Empezar',
    accentColor: '#f97316',
  },
  109: {
    subtitle: 'Pescado fresco del día macerado en leche de tigre clásica, ají amarillo y rocoto.',
    coverImage: 'https://images.unsplash.com/photo-1535400255456-984241443b29?w=800&auto=format&fit=crop&q=80',
    badgeText: '🌊 Especialidad',
    accentColor: '#06b6d4',
  },
  110: {
    subtitle: 'Finas láminas de corvina y salmón con emulsión de maracuyá, ají y ponzu.',
    coverImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍣 Nikkei Fusión',
    accentColor: '#3b82f6',
  },
  111: {
    subtitle: 'Papa amarilla prensada con ají amarillo, palta fresca y rellenos gourmet.',
    coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    badgeText: '🥔 Tradición',
    accentColor: '#f59e0b',
  },
  112: {
    subtitle: 'Pulpo a la brasa con chimichurri andino, papas doradas y salsa anticuchera.',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    badgeText: '🐙 A la Brasa',
    accentColor: '#8b5cf6',
  },
  2: {
    subtitle: 'Lomo saltado criollo, bife de chorizo, costillas BBQ y carnes maduradas.',
    coverImage: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&auto=format&fit=crop&q=80',
    badgeText: '🥩 Brasas & Fuegos',
    accentColor: '#ef4444',
  },
  3: {
    subtitle: 'Corvina a la plancha, salmón glaseado, arroces marineros y parihuelas.',
    coverImage: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
    badgeText: '🦞 Mariscada',
    accentColor: '#0ea5e9',
  },
  4: {
    subtitle: 'Risottos cremosos, arroz chaufa al wok y pastas frescas con salsas de autor.',
    coverImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍝 Al Wok & Pastas',
    accentColor: '#d97706',
  },
  5: {
    subtitle: 'Burgers 100% Angus con pan brioche artesanal, quesos fundidos y salsas secretas.',
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍔 Smash & Gourmet',
    accentColor: '#84cc16',
  },
  9: {
    subtitle: 'Suspiro limeño, tres leches, volcán de chocolate belga y helados artesanales.',
    coverImage: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍰 Dulce Final',
    accentColor: '#ec4899',
  },
  6: {
    subtitle: 'Aguas saborizadas, limonadas de menta y jengibre, chicha morada y gaseosas.',
    coverImage: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
    badgeText: '🥤 Refrescantes',
    accentColor: '#3b82f6',
  },
  102: {
    subtitle: 'Frutas tropicales de estación recién exprimidas al instante 100% naturales.',
    coverImage: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    badgeText: '🥭 100% Natural',
    accentColor: '#eab308',
  },
  7: {
    subtitle: 'Cervezas artesanales IPA/Lager y selección de vinos tintos, blancos y espumantes.',
    coverImage: 'https://images.unsplash.com/photo-1608278049102-76c7ee609a47?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍷 Cava & Birras',
    accentColor: '#8b5cf6',
  },
  8: {
    subtitle: 'Café espresso de especialidad, cappuccino italiano, tés gourmet e infusiones.',
    coverImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    badgeText: '☕ Barista',
    accentColor: '#78350f',
  },
  103: {
    subtitle: 'Digestivos, licores finos de hierbas, amaretto, limoncello y destilados añejos.',
    coverImage: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍸 Sobremesa',
    accentColor: '#c026d3',
  },
  101: {
    subtitle: 'Combos preparados para envío rápido con empaques térmicos ecológicos.',
    coverImage: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&auto=format&fit=crop&q=80',
    badgeText: '🛵 A Domicilio',
    accentColor: '#f97316',
  }
};

export const getCategoryMeta = (categoryId: number, categoryName: string): CategoryMeta => {
  if (CATEGORY_METAS[categoryId]) {
    return CATEGORY_METAS[categoryId];
  }
  return {
    subtitle: `Descubre nuestra selecta variedad de ${categoryName.toLowerCase()} elaborados al momento.`,
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍽️ Carta',
    accentColor: '#0d9488',
  };
};
