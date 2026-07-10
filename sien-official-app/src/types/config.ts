export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  social: {
    twitter: string;
    youtube: string;
    tiktok: string;
    niconico?: string;
  };
  contact: {
    email: string;
    formUrl: string;
    discord?: string;
  };
  business: {
    businessHours: string;
    deliveryEstimate: string;
  };
}

export interface NavigationItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
  category?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  category: string;
  shortDescription?: string;
  basePrice: number;
  originalPrice?: number; // キャンペーンなどの元価格
  isRecommended?: boolean;
  features: string[];
  deliveryEstimate: string;
  revisions: string; // リテイク回数
  isActive?: boolean;
}

export interface PricingOption {
  id: string;
  name: string;
  category: string;
  price?: number;
  priceText: string;
  description?: string;
  isActive?: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  targetUsers: string[];
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  badge?: string; // 例: "Summer Sale"
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  linkUrl?: string;
}

export interface Portfolio {
  id: string;
  title: string;
  artistName: string;
  category: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  description?: string;
  publishedAt: string;
}
