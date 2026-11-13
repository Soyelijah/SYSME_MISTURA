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
    subtitle: 'Jalea criolla, camarones milanesa, anticucho tradicional y piqueos para compartir.',
    coverImage: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&auto=format&fit=crop&q=80',
    badgeText: '🔥 Entradas',
    accentColor: '#f97316',
  },
  109: {
    subtitle: 'Pesca del día fresca marinada en limón de pica, tres ajíes, ceviche mixto y apaltado.',
    coverImage: 'https://images.unsplash.com/photo-1535400255456-984241443b29?w=800&auto=format&fit=crop&q=80',
    badgeText: '🌊 Ceviches',
    accentColor: '#06b6d4',
  },
  110: {
    subtitle: 'Finas láminas de pescado en ají amarillo, cilantro, estilo criollo y especial Mistura.',
    coverImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍣 Tiraditos',
    accentColor: '#3b82f6',
  },
  111: {
    subtitle: 'Papa amarilla amasada con ají amarillo, palta y rellenos de atún, pollo, camarón y jaiba.',
    coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    badgeText: '🥔 Causas',
    accentColor: '#f59e0b',
  },
  112: {
    subtitle: 'Pulpo tierno al olivo, olivo limón, a la parrilla, al ajillo y estilo Mistura.',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    badgeText: '🐙 Pulpos',
    accentColor: '#8b5cf6',
  },
  2: {
    subtitle: 'Filete de vacuno a la pimienta negra, mar y tierra, tres salsas, mignon y a la huancaína.',
    coverImage: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&auto=format&fit=crop&q=80',
    badgeText: '🥩 Carnes',
    accentColor: '#ef4444',
  },
  3: {
    subtitle: 'Pescado a la plancha en salsa a lo macho, camarón, jaiba, cilantro, tomillo o gratinado.',
    coverImage: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
    badgeText: '🐟 Pescado',
    accentColor: '#0ea5e9',
  },
  4: {
    subtitle: 'Arroz con mariscos, chaufas flambeados al wok y risottos cremosos en azafrán o tinta.',
    coverImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍚 Arroces & Risotto',
    accentColor: '#d97706',
  },
  120: {
    subtitle: 'Lomo saltado, ají de gallina, seco de vacuno, tacu tacu, picantes y pachamanca andina.',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    badgeText: '🇵🇪 Tradición',
    accentColor: '#dc2626',
  },
  121: {
    subtitle: 'Spaguettis salteados al wok, a lo macho, canelones rellenos y timbal de camarones.',
    coverImage: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍝 Pastas',
    accentColor: '#ea580c',
  },
  122: {
    subtitle: 'Ensaladas frescas de mariscos y mixta con palta, palmito y queso fresco.',
    coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    badgeText: '🥗 Frescas',
    accentColor: '#10b981',
  },
  123: {
    subtitle: 'Arroz blanco, champiñones, cilantro, papas fritas, yuca frita y panaché de verduras.',
    coverImage: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍟 Acompañamientos',
    accentColor: '#65a30d',
  },
  124: {
    subtitle: 'Chupe de camarones, sudado pesca del día, parihuela de la viuda y dieta de pollo.',
    coverImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
    badgeText: '🍲 Calientes',
    accentColor: '#ea580c',
  },
  9: {
    subtitle: 'Suspiro de limeña, crema volteada, pie de maracuyá, tres leches, tiramisú y degustación.',
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
