// SPDX-FileCopyrightText: 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const MATERIAL_SWATCH_NODE_TYPE = "material-swatch";

export const DEFAULT_MATERIAL_WIDTH = 180;
export const DEFAULT_MATERIAL_HEIGHT = 240;
export const MIN_MATERIAL_WIDTH = 140;
export const MIN_MATERIAL_HEIGHT = 180;
export const SPEC_CARD_HEIGHT = 80;

export const MATERIAL_CATEGORIES = {
  STONE: "STONE / FLOORING",
  WOOD: "WOOD / FIXTURES",
  METAL: "METAL / HARDWARE",
  TEXTILE: "TEXTILE / DRAPERY",
  CONCRETE: "CONCRETE / WALLS",
  GLASS: "GLASS / PARTITIONS",
  PAINT: "SURFACE / COATING",
} as const;

export const RETAIL_MATERIAL_PRESETS = [
  {
    id: "travertine",
    name: "Travertino Romano",
    finish: "Honed Matte • REF-402",
    category: MATERIAL_CATEGORIES.STONE,
    color: "#E2D9C8",
    accentColor: "#C4B59D",
  },
  {
    id: "carrara",
    name: "Carrara Marble",
    finish: "Polished Silk • REF-108",
    category: MATERIAL_CATEGORIES.STONE,
    color: "#F0F2F5",
    accentColor: "#D1D5DB",
  },
  {
    id: "brass",
    name: "Brushed Brass",
    finish: "Satin Brushed • REF-880",
    category: MATERIAL_CATEGORIES.METAL,
    color: "#D4AF37",
    accentColor: "#AA8C2C",
  },
  {
    id: "black_steel",
    name: "Black Oxide Steel",
    finish: "Micro-Textured • REF-912",
    category: MATERIAL_CATEGORIES.METAL,
    color: "#27272A",
    accentColor: "#18181B",
  },
  {
    id: "oak",
    name: "European Natural Oak",
    finish: "Wire-Brushed Oil • REF-320",
    category: MATERIAL_CATEGORIES.WOOD,
    color: "#D7B58D",
    accentColor: "#B8956C",
  },
  {
    id: "walnut",
    name: "American Dark Walnut",
    finish: "Deep Satin Oil • REF-515",
    category: MATERIAL_CATEGORIES.WOOD,
    color: "#6B4F3B",
    accentColor: "#4E3727",
  },
  {
    id: "terrazzo",
    name: "Venetian Terrazzo",
    finish: "Polished Mineral • REF-740",
    category: MATERIAL_CATEGORIES.STONE,
    color: "#EAE6DF",
    accentColor: "#BCB4A6",
  },
  {
    id: "concrete",
    name: "Architectural Concrete",
    finish: "Raw Formwork • REF-601",
    category: MATERIAL_CATEGORIES.CONCRETE,
    color: "#9CA3AF",
    accentColor: "#6B7280",
  },
  {
    id: "boucle",
    name: "Ivory Wool Bouclé",
    finish: "Textured Weave • REF-220",
    category: MATERIAL_CATEGORIES.TEXTILE,
    color: "#F5F3ED",
    accentColor: "#E5E1D5",
  },
  {
    id: "terracotta",
    name: "Glazed Terracotta",
    finish: "Artisanal Gloss • REF-345",
    category: MATERIAL_CATEGORIES.PAINT,
    color: "#C25E3E",
    accentColor: "#9E472D",
  },
] as const;
