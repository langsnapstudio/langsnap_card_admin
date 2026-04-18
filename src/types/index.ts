export type Status = "published" | "draft";

export interface Language {
  id: string;
  name: string;
  emoji_flag: string;
  supports_pinyin: boolean;
  supports_zhuyin: boolean;
  status: Status;
  section_count?: number;
  deck_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  language_id: string;
  name: string;
  order_position: number;
  status: Status;
  deck_count?: number;
  created_at: string;
  updated_at: string;
  language?: Language;
}

export interface Deck {
  id: string;
  section_id: string;
  title: string;
  supporting_title?: string;
  cover_image_url?: string;
  order_position: number;
  status: Status;
  pack_count?: number;
  word_count?: number;
  created_at: string;
  updated_at: string;
  section?: Section;
}

export interface SubCategory {
  id: string;
  deck_id: string;
  name: string;
  order_position: number;
  card_count?: number;
  created_at: string;
  updated_at: string;
}

export type CardColor =
  | "white-card"
  | "cream-card"
  | "yellow-card"
  | "orange-card"
  | "rose-card"
  | "pink-card"
  | "green-card"
  | "emerald-card"
  | "teal-card"
  | "sky-card"
  | "deep-blue-card"
  | "indigo-card"
  | "brown-card"
  | "black-card";

export const CARD_COLOR_PRESETS: { token: CardColor; hex: string; label: string }[] = [
  { token: "white-card", hex: "#FAFAFA", label: "White" },
  { token: "cream-card", hex: "#F4F0E8", label: "Cream" },
  { token: "yellow-card", hex: "#FEF08A", label: "Yellow" },
  { token: "orange-card", hex: "#F6A275", label: "Orange" },
  { token: "rose-card", hex: "#FB7185", label: "Rose" },
  { token: "pink-card", hex: "#F472B6", label: "Pink" },
  { token: "green-card", hex: "#86EFAC", label: "Green" },
  { token: "emerald-card", hex: "#059669", label: "Emerald" },
  { token: "teal-card", hex: "#2DD4BF", label: "Teal" },
  { token: "sky-card", hex: "#7DD3FC", label: "Sky" },
  { token: "deep-blue-card", hex: "#056B96", label: "Deep Blue" },
  { token: "indigo-card", hex: "#312E81", label: "Indigo" },
  { token: "brown-card", hex: "#CE9C89", label: "Brown" },
  { token: "black-card", hex: "#262626", label: "Black" },
];

export interface Pack {
  id: string;
  deck_id: string;
  title: string;
  energy_cost: number;
  is_free: boolean;
  card_color: CardColor;
  thumbnail_url?: string;
  order_position: number;
  status: Status;
  card_count?: number;
  created_at: string;
  updated_at: string;
  deck?: Deck;
}

export interface Card {
  id: string;
  pack_id: string;
  word: string;
  pinyin: string;
  zhuyin?: string;
  meaning: string;
  part_of_speech: string;
  audio_url?: string;
  illustration_url?: string;
  card_color?: CardColor;
  sub_category_id?: string;
  tags?: string[];
  example_sentence_1?: string;
  example_sentence_1_pinyin?: string;
  example_sentence_1_zhuyin?: string;
  example_sentence_1_meaning?: string;
  example_sentence_1_part_of_speech?: string;
  example_sentence_2?: string;
  example_sentence_2_pinyin?: string;
  example_sentence_2_zhuyin?: string;
  example_sentence_2_meaning?: string;
  example_sentence_2_part_of_speech?: string;
  order_position: number;
  status: Status;
  created_at: string;
  updated_at: string;
  sub_category?: SubCategory;
}

export interface AvatarPack {
  id: string;
  name: string;
  category: string;
  avatar_count?: number;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface Avatar {
  id: string;
  avatar_pack_id: string;
  name: string;
  image_url: string;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface Feat {
  id: string;
  feat_number: number;
  name: string;
  requirement_description: string;
  reward_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  display_name: string;
  username: string;
  email: string;
  avatar_url?: string;
  plan: "free" | "premium";
  subscription_plan?: string;
  subscription_renewal_date?: string;
  streak: number;
  total_packs_redeemed: number;
  total_cards_reviewed: number;
  account_status: "active" | "deactivated" | "deleted";
  deletion_requested_at?: string;
  joined_at: string;
  last_active_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  audience: "all";
  deep_link?: string;
  scheduled_at?: string;
  sent_at?: string;
  estimated_reach?: number;
  created_at: string;
}
