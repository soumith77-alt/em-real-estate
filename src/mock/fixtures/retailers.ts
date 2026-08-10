import type {
  Retailer,
  UnitFormat,
  UnitFeature,
  MarketTier,
  ExpansionStatus,
} from "@/types";
import { rng, range, rangeF, pick, chance } from "@/mock/seed";

type HandBrand = {
  brand: string;
  parentCompany: string;
  category: string;
  subcategory: string;
  sizeMin: number;
  sizeMid: number;
  sizeMax: number;
  formats: UnitFormat[];
  features?: UnitFeature[];
  tiers: MarketTier[];
  qc: boolean;
};

// 180 hand-authored real Canadian / NA retail brands, deterministic order.
const HAND: HandBrand[] = [
  // Grocery
  { brand: "Loblaws", parentCompany: "Loblaw Companies", category: "grocery", subcategory: "supermarket", sizeMin: 45_000, sizeMid: 60_000, sizeMax: 80_000, formats: ["anchor"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Metro", parentCompany: "Metro Inc.", category: "grocery", subcategory: "supermarket", sizeMin: 30_000, sizeMid: 42_000, sizeMax: 60_000, formats: ["anchor"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "IGA", parentCompany: "Sobeys Inc.", category: "grocery", subcategory: "supermarket", sizeMin: 20_000, sizeMid: 35_000, sizeMax: 55_000, formats: ["anchor"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Provigo", parentCompany: "Loblaw Companies", category: "grocery", subcategory: "supermarket", sizeMin: 22_000, sizeMid: 32_000, sizeMax: 45_000, formats: ["anchor"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Maxi", parentCompany: "Loblaw Companies", category: "grocery", subcategory: "discount-grocery", sizeMin: 25_000, sizeMid: 38_000, sizeMax: 55_000, formats: ["anchor"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Sobeys", parentCompany: "Empire Company", category: "grocery", subcategory: "supermarket", sizeMin: 25_000, sizeMid: 40_000, sizeMax: 55_000, formats: ["anchor"], tiers: ["small-town", "mid-market", "major-city"], qc: false },
  { brand: "Walmart Supercentre", parentCompany: "Walmart Canada", category: "grocery", subcategory: "supercentre", sizeMin: 80_000, sizeMid: 140_000, sizeMax: 200_000, formats: ["anchor", "freestanding"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Costco", parentCompany: "Costco Wholesale", category: "grocery", subcategory: "warehouse-club", sizeMin: 120_000, sizeMid: 150_000, sizeMax: 180_000, formats: ["freestanding"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Super C", parentCompany: "Metro Inc.", category: "grocery", subcategory: "discount-grocery", sizeMin: 25_000, sizeMid: 35_000, sizeMax: 45_000, formats: ["anchor"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Adonis", parentCompany: "Metro Inc.", category: "grocery", subcategory: "ethnic-grocery", sizeMin: 25_000, sizeMid: 35_000, sizeMax: 45_000, formats: ["anchor"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Marché Richelieu", parentCompany: "Metro Inc.", category: "grocery", subcategory: "supermarket", sizeMin: 10_000, sizeMid: 18_000, sizeMax: 30_000, formats: ["anchor", "end-cap"], tiers: ["small-town"], qc: true },
  { brand: "Bonichoix", parentCompany: "Sobeys Inc.", category: "grocery", subcategory: "supermarket", sizeMin: 8_000, sizeMid: 15_000, sizeMax: 22_000, formats: ["end-cap", "inline"], tiers: ["small-town"], qc: true },
  { brand: "Rachelle-Béry", parentCompany: "Sobeys Inc.", category: "grocery", subcategory: "natural-foods", sizeMin: 4_500, sizeMid: 8_000, sizeMax: 12_000, formats: ["inline", "end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Avril Supermarché Santé", parentCompany: "Sobeys Inc.", category: "grocery", subcategory: "natural-foods", sizeMin: 12_000, sizeMid: 18_000, sizeMax: 25_000, formats: ["end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "T&T Supermarket", parentCompany: "Loblaw Companies", category: "grocery", subcategory: "ethnic-grocery", sizeMin: 40_000, sizeMid: 55_000, sizeMax: 75_000, formats: ["anchor"], tiers: ["major-city"], qc: false },

  // Pharmacy
  { brand: "Jean Coutu", parentCompany: "Metro Inc.", category: "pharmacy", subcategory: "chain-pharmacy", sizeMin: 8_000, sizeMid: 11_000, sizeMax: 15_000, formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Pharmaprix", parentCompany: "Loblaw Companies", category: "pharmacy", subcategory: "chain-pharmacy", sizeMin: 8_000, sizeMid: 11_000, sizeMax: 15_000, formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Shoppers Drug Mart", parentCompany: "Loblaw Companies", category: "pharmacy", subcategory: "chain-pharmacy", sizeMin: 8_000, sizeMid: 12_000, sizeMax: 17_000, formats: ["inline", "end-cap", "freestanding"], tiers: ["small-town", "mid-market", "major-city"], qc: false },
  { brand: "Familiprix", parentCompany: "Familiprix Inc.", category: "pharmacy", subcategory: "chain-pharmacy", sizeMin: 4_000, sizeMid: 6_000, sizeMax: 8_000, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Uniprix", parentCompany: "McKesson Canada", category: "pharmacy", subcategory: "chain-pharmacy", sizeMin: 4_000, sizeMid: 6_000, sizeMax: 8_000, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Brunet", parentCompany: "Metro Inc.", category: "pharmacy", subcategory: "chain-pharmacy", sizeMin: 4_000, sizeMid: 6_000, sizeMax: 8_000, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Rexall", parentCompany: "McKesson Canada", category: "pharmacy", subcategory: "chain-pharmacy", sizeMin: 8_000, sizeMid: 11_000, sizeMax: 14_000, formats: ["inline", "end-cap"], tiers: ["mid-market", "major-city"], qc: false },
  { brand: "Proxim", parentCompany: "McKesson Canada", category: "pharmacy", subcategory: "chain-pharmacy", sizeMin: 4_000, sizeMid: 6_000, sizeMax: 8_000, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },

  // Home improvement / DIY
  { brand: "Canadian Tire", parentCompany: "Canadian Tire Corp.", category: "home-improvement", subcategory: "diy-general", sizeMin: 40_000, sizeMid: 70_000, sizeMax: 110_000, formats: ["anchor", "freestanding"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Home Depot", parentCompany: "The Home Depot", category: "home-improvement", subcategory: "big-box-diy", sizeMin: 90_000, sizeMid: 115_000, sizeMax: 135_000, formats: ["freestanding"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Réno-Dépôt", parentCompany: "Lowe's Canada", category: "home-improvement", subcategory: "big-box-diy", sizeMin: 60_000, sizeMid: 90_000, sizeMax: 130_000, formats: ["freestanding"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Rona", parentCompany: "Sycamore Partners", category: "home-improvement", subcategory: "diy-general", sizeMin: 30_000, sizeMid: 60_000, sizeMax: 90_000, formats: ["anchor", "freestanding"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Patrick Morin", parentCompany: "Patrick Morin", category: "home-improvement", subcategory: "diy-general", sizeMin: 25_000, sizeMid: 40_000, sizeMax: 65_000, formats: ["freestanding"], tiers: ["small-town", "mid-market"], qc: true },

  // Big-box general / off-price
  { brand: "Winners", parentCompany: "TJX Canada", category: "apparel", subcategory: "off-price", sizeMin: 20_000, sizeMid: 25_000, sizeMax: 30_000, formats: ["anchor", "end-cap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "HomeSense", parentCompany: "TJX Canada", category: "home-goods", subcategory: "off-price", sizeMin: 22_000, sizeMid: 26_000, sizeMax: 30_000, formats: ["anchor", "end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Marshalls", parentCompany: "TJX Canada", category: "apparel", subcategory: "off-price", sizeMin: 24_000, sizeMid: 28_000, sizeMax: 32_000, formats: ["anchor", "end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Giant Tiger", parentCompany: "Giant Tiger Stores", category: "dollar-store", subcategory: "value-general", sizeMin: 18_000, sizeMid: 22_000, sizeMax: 30_000, formats: ["anchor", "end-cap"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Structube", parentCompany: "Structube", category: "home-goods", subcategory: "furniture", sizeMin: 8_000, sizeMid: 12_000, sizeMax: 18_000, formats: ["end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Sail", parentCompany: "Sail Outdoors", category: "specialty-retail", subcategory: "outdoor-sports", sizeMin: 30_000, sizeMid: 45_000, sizeMax: 60_000, formats: ["anchor"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Décathlon", parentCompany: "Decathlon SA", category: "apparel", subcategory: "sporting-goods", sizeMin: 25_000, sizeMid: 35_000, sizeMax: 50_000, formats: ["anchor"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Value Village", parentCompany: "Savers Inc.", category: "specialty-retail", subcategory: "thrift", sizeMin: 22_000, sizeMid: 28_000, sizeMax: 35_000, formats: ["anchor", "end-cap"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Talize", parentCompany: "Talize Inc.", category: "specialty-retail", subcategory: "thrift", sizeMin: 20_000, sizeMid: 26_000, sizeMax: 32_000, formats: ["anchor"], tiers: ["small-town", "mid-market"], qc: false },

  // Dollar / value
  { brand: "Dollarama", parentCompany: "Dollarama Inc.", category: "dollar-store", subcategory: "dollar-store", sizeMin: 8_000, sizeMid: 10_000, sizeMax: 12_000, formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Dollar Tree", parentCompany: "Dollar Tree Inc.", category: "dollar-store", subcategory: "dollar-store", sizeMin: 8_000, sizeMid: 10_000, sizeMax: 12_000, formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market"], qc: false },
  { brand: "Rossy", parentCompany: "Rossy Inc.", category: "dollar-store", subcategory: "value-general", sizeMin: 8_000, sizeMid: 10_000, sizeMax: 14_000, formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Hart", parentCompany: "Hart Stores", category: "apparel", subcategory: "value-apparel", sizeMin: 10_000, sizeMid: 14_000, sizeMax: 20_000, formats: ["end-cap", "anchor"], tiers: ["small-town"], qc: true },
  { brand: "Bargain Shop", parentCompany: "The Bargain! Shop", category: "dollar-store", subcategory: "value-general", sizeMin: 6_500, sizeMid: 8_000, sizeMax: 10_000, formats: ["inline"], tiers: ["small-town"], qc: false },

  // Bulk / specialty food
  { brand: "Bulk Barn", parentCompany: "Bulk Barn Foods", category: "specialty-food", subcategory: "bulk-foods", sizeMin: 3_500, sizeMid: 5_000, sizeMax: 6_500, formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Chocolats Favoris", parentCompany: "Chocolats Favoris Inc.", category: "specialty-food", subcategory: "confectionery", sizeMin: 900, sizeMid: 1_400, sizeMax: 1_800, formats: ["inline"], tiers: ["mid-market"], qc: true },
  { brand: "Laura Secord", parentCompany: "Nutrisystem", category: "specialty-food", subcategory: "confectionery", sizeMin: 500, sizeMid: 800, sizeMax: 1_200, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Freshii", parentCompany: "Freshii Inc.", category: "quick-service-restaurant", subcategory: "salad", sizeMin: 1_200, sizeMid: 1_800, sizeMax: 2_500, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },

  // Liquor
  { brand: "SAQ", parentCompany: "Société des alcools du Québec", category: "liquor", subcategory: "liquor-store", sizeMin: 2_500, sizeMid: 4_000, sizeMax: 5_500, formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "SAQ Sélection", parentCompany: "Société des alcools du Québec", category: "liquor", subcategory: "liquor-store", sizeMin: 4_000, sizeMid: 5_500, sizeMax: 7_500, formats: ["end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "LCBO", parentCompany: "LCBO", category: "liquor", subcategory: "liquor-store", sizeMin: 4_000, sizeMid: 6_000, sizeMax: 9_500, formats: ["end-cap", "inline"], tiers: ["small-town", "mid-market"], qc: false },
  { brand: "Wine Rack", parentCompany: "Arterra Wines Canada", category: "liquor", subcategory: "liquor-store", sizeMin: 1_500, sizeMid: 2_200, sizeMax: 3_000, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: false },
  { brand: "Beer Store", parentCompany: "Brewers Retail Inc.", category: "liquor", subcategory: "liquor-store", sizeMin: 3_500, sizeMid: 4_500, sizeMax: 6_000, formats: ["freestanding", "end-cap"], tiers: ["small-town", "mid-market"], qc: false },

  // Apparel
  { brand: "Reitmans", parentCompany: "Reitmans Canada", category: "apparel", subcategory: "womens", sizeMin: 3_000, sizeMid: 4_200, sizeMax: 5_500, formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Laura", parentCompany: "Laura Canada", category: "apparel", subcategory: "womens", sizeMin: 3_000, sizeMid: 4_200, sizeMax: 5_500, formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Ricki's", parentCompany: "Comark Holdings", category: "apparel", subcategory: "womens", sizeMin: 2_500, sizeMid: 3_500, sizeMax: 4_500, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Cleo", parentCompany: "Reitmans Canada", category: "apparel", subcategory: "womens", sizeMin: 2_400, sizeMid: 3_200, sizeMax: 4_000, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Penningtons", parentCompany: "Reitmans Canada", category: "apparel", subcategory: "womens", sizeMin: 3_500, sizeMid: 4_500, sizeMax: 5_500, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Addition Elle", parentCompany: "Reitmans Canada", category: "apparel", subcategory: "womens", sizeMin: 3_000, sizeMid: 4_000, sizeMax: 5_000, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Marks", parentCompany: "Canadian Tire Corp.", category: "apparel", subcategory: "workwear", sizeMin: 8_000, sizeMid: 11_000, sizeMax: 14_000, formats: ["end-cap", "inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Old Navy", parentCompany: "Gap Inc.", category: "apparel", subcategory: "value-apparel", sizeMin: 12_000, sizeMid: 15_000, sizeMax: 20_000, formats: ["end-cap", "anchor"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "GAP", parentCompany: "Gap Inc.", category: "apparel", subcategory: "casual", sizeMin: 6_000, sizeMid: 9_000, sizeMax: 12_000, formats: ["inline", "end-cap"], tiers: ["major-city"], qc: true },
  { brand: "Ardene", parentCompany: "Ardene Holdings", category: "apparel", subcategory: "value-apparel", sizeMin: 4_000, sizeMid: 5_500, sizeMax: 7_500, formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Simons", parentCompany: "La Maison Simons", category: "apparel", subcategory: "department", sizeMin: 60_000, sizeMid: 90_000, sizeMax: 120_000, formats: ["anchor"], tiers: ["major-city"], qc: true },
  { brand: "La Vie en Rose", parentCompany: "La Vie en Rose Intl", category: "apparel", subcategory: "intimates", sizeMin: 2_500, sizeMid: 3_500, sizeMax: 5_000, formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Bikini Village", parentCompany: "La Vie en Rose Intl", category: "apparel", subcategory: "swimwear", sizeMin: 1_800, sizeMid: 2_500, sizeMax: 3_200, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Boathouse", parentCompany: "Boathouse Retail Group", category: "apparel", subcategory: "casual", sizeMin: 3_500, sizeMid: 4_800, sizeMax: 6_000, formats: ["inline"], tiers: ["mid-market"], qc: true },
  { brand: "Sports Experts", parentCompany: "Canadian Tire Corp.", category: "apparel", subcategory: "sporting-goods", sizeMin: 10_000, sizeMid: 14_000, sizeMax: 18_000, formats: ["end-cap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Sportium", parentCompany: "Canadian Tire Corp.", category: "apparel", subcategory: "sporting-goods", sizeMin: 15_000, sizeMid: 20_000, sizeMax: 25_000, formats: ["anchor", "end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Vans", parentCompany: "VF Corporation", category: "apparel", subcategory: "footwear", sizeMin: 2_500, sizeMid: 3_200, sizeMax: 4_000, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },

  // Beauty / personal care
  { brand: "Sephora", parentCompany: "LVMH", category: "beauty-personal-care", subcategory: "cosmetics", sizeMin: 4_500, sizeMid: 6_000, sizeMax: 8_000, formats: ["inline", "end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Bath & Body Works", parentCompany: "Bath & Body Works Inc.", category: "beauty-personal-care", subcategory: "bath-body", sizeMin: 2_200, sizeMid: 2_800, sizeMax: 3_500, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Yves Rocher", parentCompany: "Yves Rocher SA", category: "beauty-personal-care", subcategory: "cosmetics", sizeMin: 1_200, sizeMid: 1_800, sizeMax: 2_400, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "The Body Shop", parentCompany: "Natura & Co.", category: "beauty-personal-care", subcategory: "cosmetics", sizeMin: 1_500, sizeMid: 2_000, sizeMax: 2_500, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "MAC Cosmetics", parentCompany: "Estée Lauder", category: "beauty-personal-care", subcategory: "cosmetics", sizeMin: 1_400, sizeMid: 1_800, sizeMax: 2_400, formats: ["inline"], tiers: ["major-city"], qc: true },
  { brand: "Lush", parentCompany: "Lush Cosmetics", category: "beauty-personal-care", subcategory: "cosmetics", sizeMin: 1_200, sizeMid: 1_600, sizeMax: 2_200, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },

  // Quick service restaurants
  { brand: "Tim Hortons", parentCompany: "Restaurant Brands International", category: "quick-service-restaurant", subcategory: "coffee-donut", sizeMin: 1_800, sizeMid: 2_400, sizeMax: 3_200, formats: ["pad", "inline", "end-cap"], features: ["drive-thru"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "McDonald's", parentCompany: "McDonald's Restaurants of Canada", category: "quick-service-restaurant", subcategory: "burger", sizeMin: 2_800, sizeMid: 3_800, sizeMax: 4_500, formats: ["pad", "freestanding"], features: ["drive-thru"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Burger King", parentCompany: "Restaurant Brands International", category: "quick-service-restaurant", subcategory: "burger", sizeMin: 2_800, sizeMid: 3_500, sizeMax: 4_200, formats: ["pad", "freestanding"], features: ["drive-thru"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "A&W", parentCompany: "A&W Food Services of Canada", category: "quick-service-restaurant", subcategory: "burger", sizeMin: 2_400, sizeMid: 3_200, sizeMax: 4_000, formats: ["pad", "inline"], features: ["drive-thru"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Wendy's", parentCompany: "Wendy's Company", category: "quick-service-restaurant", subcategory: "burger", sizeMin: 2_800, sizeMid: 3_400, sizeMax: 4_000, formats: ["pad"], features: ["drive-thru"], tiers: ["mid-market"], qc: true },
  { brand: "Harvey's", parentCompany: "Recipe Unlimited", category: "quick-service-restaurant", subcategory: "burger", sizeMin: 2_400, sizeMid: 3_000, sizeMax: 3_600, formats: ["pad", "inline"], features: ["drive-thru"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Subway", parentCompany: "Subway Franchise Systems", category: "quick-service-restaurant", subcategory: "sandwich", sizeMin: 1_200, sizeMid: 1_800, sizeMax: 2_400, formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Mr. Sub", parentCompany: "MTY Group", category: "quick-service-restaurant", subcategory: "sandwich", sizeMin: 1_000, sizeMid: 1_500, sizeMax: 2_000, formats: ["inline"], tiers: ["small-town"], qc: true },
  { brand: "Sushi Shop", parentCompany: "MTY Group", category: "quick-service-restaurant", subcategory: "asian", sizeMin: 1_200, sizeMid: 1_800, sizeMax: 2_400, formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Ashton", parentCompany: "Restaurants Ashton", category: "quick-service-restaurant", subcategory: "poutine", sizeMin: 1_800, sizeMid: 2_400, sizeMax: 3_200, formats: ["pad", "inline"], features: ["drive-thru"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Popeyes", parentCompany: "Restaurant Brands International", category: "quick-service-restaurant", subcategory: "chicken", sizeMin: 2_400, sizeMid: 3_000, sizeMax: 3_800, formats: ["pad", "end-cap"], features: ["drive-thru"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "KFC", parentCompany: "Yum! Brands", category: "quick-service-restaurant", subcategory: "chicken", sizeMin: 2_400, sizeMid: 3_000, sizeMax: 3_800, formats: ["pad", "end-cap"], features: ["drive-thru"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Chipotle", parentCompany: "Chipotle Mexican Grill", category: "quick-service-restaurant", subcategory: "mexican", sizeMin: 2_200, sizeMid: 2_600, sizeMax: 3_200, formats: ["end-cap", "inline"], tiers: ["mid-market", "major-city"], qc: false },
  { brand: "Chick-fil-A Canada", parentCompany: "Chick-fil-A Inc.", category: "quick-service-restaurant", subcategory: "chicken", sizeMin: 3_800, sizeMid: 4_500, sizeMax: 5_200, formats: ["pad"], features: ["drive-thru"], tiers: ["mid-market", "major-city"], qc: false },
  { brand: "Five Guys", parentCompany: "Five Guys Enterprises", category: "quick-service-restaurant", subcategory: "burger", sizeMin: 2_200, sizeMid: 2_800, sizeMax: 3_400, formats: ["end-cap", "inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Pizza Pizza", parentCompany: "Pizza Pizza Royalty", category: "quick-service-restaurant", subcategory: "pizza", sizeMin: 1_200, sizeMid: 1_800, sizeMax: 2_400, formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Pizza Hut", parentCompany: "Yum! Brands", category: "quick-service-restaurant", subcategory: "pizza", sizeMin: 1_400, sizeMid: 2_000, sizeMax: 2_800, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: false },
  { brand: "Domino's Pizza", parentCompany: "Domino's Pizza Canada", category: "quick-service-restaurant", subcategory: "pizza", sizeMin: 1_200, sizeMid: 1_600, sizeMax: 2_200, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Thaï Express", parentCompany: "MTY Group", category: "quick-service-restaurant", subcategory: "asian", sizeMin: 900, sizeMid: 1_400, sizeMax: 2_000, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "La Belle et La Boeuf", parentCompany: "Foodtastic", category: "quick-service-restaurant", subcategory: "burger", sizeMin: 3_800, sizeMid: 4_800, sizeMax: 5_800, formats: ["pad", "end-cap"], tiers: ["mid-market", "major-city"], qc: true },

  // Coffee
  { brand: "Starbucks", parentCompany: "Starbucks Corp.", category: "quick-service-restaurant", subcategory: "coffee", sizeMin: 1_600, sizeMid: 2_200, sizeMax: 2_800, formats: ["pad", "end-cap", "inline"], features: ["drive-thru"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Second Cup", parentCompany: "Aegis Brands", category: "quick-service-restaurant", subcategory: "coffee", sizeMin: 1_400, sizeMid: 1_900, sizeMax: 2_400, formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Van Houtte", parentCompany: "Keurig Dr Pepper", category: "quick-service-restaurant", subcategory: "coffee", sizeMin: 1_200, sizeMid: 1_600, sizeMax: 2_000, formats: ["inline"], tiers: ["mid-market"], qc: true },

  // Casual dining
  { brand: "Boston Pizza", parentCompany: "Boston Pizza International", category: "casual-dining", subcategory: "family-dining", sizeMin: 4_500, sizeMid: 6_000, sizeMax: 7_500, formats: ["pad", "end-cap"], features: ["patio", "grease-trap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Scores", parentCompany: "MTY Group", category: "casual-dining", subcategory: "chicken", sizeMin: 4_500, sizeMid: 6_000, sizeMax: 7_500, formats: ["pad", "end-cap"], features: ["patio", "grease-trap"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Rôtisserie St-Hubert", parentCompany: "Recipe Unlimited", category: "casual-dining", subcategory: "chicken", sizeMin: 5_500, sizeMid: 7_500, sizeMax: 9_500, formats: ["pad", "end-cap", "freestanding"], features: ["patio", "grease-trap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Mikes", parentCompany: "MTY Group", category: "casual-dining", subcategory: "italian", sizeMin: 4_000, sizeMid: 5_500, sizeMax: 7_000, formats: ["pad", "end-cap"], features: ["patio"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Pacini", parentCompany: "Restaurants Pacini", category: "casual-dining", subcategory: "italian", sizeMin: 4_500, sizeMid: 6_000, sizeMax: 7_500, formats: ["pad", "end-cap"], features: ["patio", "grease-trap"], tiers: ["mid-market"], qc: true },
  { brand: "La Cage - Brasserie Sportive", parentCompany: "Sportscene Group", category: "casual-dining", subcategory: "sports-bar", sizeMin: 5_500, sizeMid: 7_500, sizeMax: 9_500, formats: ["pad", "end-cap"], features: ["patio", "grease-trap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Bâton Rouge", parentCompany: "Foodtastic", category: "casual-dining", subcategory: "steakhouse", sizeMin: 5_500, sizeMid: 7_500, sizeMax: 9_500, formats: ["pad", "end-cap"], features: ["patio", "grease-trap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Milestones", parentCompany: "Recipe Unlimited", category: "casual-dining", subcategory: "family-dining", sizeMin: 5_500, sizeMid: 7_000, sizeMax: 9_000, formats: ["pad", "end-cap"], features: ["patio"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Kelseys", parentCompany: "Recipe Unlimited", category: "casual-dining", subcategory: "family-dining", sizeMin: 5_000, sizeMid: 6_500, sizeMax: 8_000, formats: ["pad"], features: ["patio", "grease-trap"], tiers: ["small-town", "mid-market"], qc: false },
  { brand: "Swiss Chalet", parentCompany: "Recipe Unlimited", category: "casual-dining", subcategory: "chicken", sizeMin: 4_500, sizeMid: 6_000, sizeMax: 7_500, formats: ["pad", "end-cap"], features: ["patio", "grease-trap"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "East Side Mario's", parentCompany: "Recipe Unlimited", category: "casual-dining", subcategory: "italian", sizeMin: 4_500, sizeMid: 6_000, sizeMax: 7_500, formats: ["pad", "end-cap"], features: ["patio"], tiers: ["small-town", "mid-market"], qc: false },
  { brand: "Montana's", parentCompany: "Recipe Unlimited", category: "casual-dining", subcategory: "family-dining", sizeMin: 5_000, sizeMid: 6_500, sizeMax: 8_000, formats: ["pad"], features: ["patio", "grease-trap"], tiers: ["small-town", "mid-market"], qc: false },

  // Health-fitness
  { brand: "GoodLife Fitness", parentCompany: "GoodLife Fitness Centres", category: "health-fitness", subcategory: "gym", sizeMin: 18_000, sizeMid: 24_000, sizeMax: 32_000, formats: ["anchor", "end-cap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Éconofitness", parentCompany: "GoodLife Fitness Centres", category: "health-fitness", subcategory: "gym", sizeMin: 14_000, sizeMid: 18_000, sizeMax: 24_000, formats: ["anchor", "end-cap"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Nautilus Plus", parentCompany: "Nautilus Plus Inc.", category: "health-fitness", subcategory: "gym", sizeMin: 12_000, sizeMid: 16_000, sizeMax: 22_000, formats: ["end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "F45 Training", parentCompany: "F45 Training Holdings", category: "health-fitness", subcategory: "boutique-fitness", sizeMin: 2_200, sizeMid: 3_000, sizeMax: 3_800, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Orangetheory Fitness", parentCompany: "Orangetheory Fitness", category: "health-fitness", subcategory: "boutique-fitness", sizeMin: 2_800, sizeMid: 3_500, sizeMax: 4_200, formats: ["inline", "end-cap"], tiers: ["mid-market", "major-city"], qc: false },
  { brand: "YMCA", parentCompany: "YMCA Canada", category: "health-fitness", subcategory: "community", sizeMin: 30_000, sizeMid: 50_000, sizeMax: 70_000, formats: ["freestanding"], tiers: ["mid-market", "major-city"], qc: true },

  // Pet
  { brand: "PetSmart", parentCompany: "PetSmart Inc.", category: "pet", subcategory: "pet-supply", sizeMin: 18_000, sizeMid: 22_000, sizeMax: 28_000, formats: ["end-cap", "anchor"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "PetValu", parentCompany: "Pet Valu Inc.", category: "pet", subcategory: "pet-supply", sizeMin: 3_000, sizeMid: 4_500, sizeMax: 6_500, formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Global Pet Foods", parentCompany: "Global Pet Foods", category: "pet", subcategory: "pet-supply", sizeMin: 2_500, sizeMid: 3_500, sizeMax: 5_000, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Mondou", parentCompany: "Mondou Inc.", category: "pet", subcategory: "pet-supply", sizeMin: 3_000, sizeMid: 4_500, sizeMax: 6_000, formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Ren's Pets", parentCompany: "Ren's Pets Depot", category: "pet", subcategory: "pet-supply", sizeMin: 6_000, sizeMid: 9_000, sizeMax: 14_000, formats: ["end-cap"], tiers: ["mid-market"], qc: false },

  // Electronics
  { brand: "Best Buy", parentCompany: "Best Buy Canada", category: "electronics", subcategory: "big-box-electronics", sizeMin: 25_000, sizeMid: 32_000, sizeMax: 40_000, formats: ["anchor", "end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "The Source", parentCompany: "Bell Canada", category: "electronics", subcategory: "specialty-electronics", sizeMin: 1_800, sizeMid: 2_400, sizeMax: 3_200, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Staples", parentCompany: "Staples Canada", category: "electronics", subcategory: "office-supply", sizeMin: 20_000, sizeMid: 24_000, sizeMax: 30_000, formats: ["end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Apple Store", parentCompany: "Apple Inc.", category: "electronics", subcategory: "specialty-electronics", sizeMin: 4_500, sizeMid: 6_500, sizeMax: 9_500, formats: ["inline"], tiers: ["major-city"], qc: true },

  // Telecom
  { brand: "Bell", parentCompany: "Bell Canada", category: "telecom", subcategory: "wireless-store", sizeMin: 1_400, sizeMid: 1_800, sizeMax: 2_400, formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Rogers", parentCompany: "Rogers Communications", category: "telecom", subcategory: "wireless-store", sizeMin: 1_400, sizeMid: 1_800, sizeMax: 2_400, formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Telus", parentCompany: "Telus Corp.", category: "telecom", subcategory: "wireless-store", sizeMin: 1_400, sizeMid: 1_800, sizeMax: 2_400, formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Vidéotron", parentCompany: "Quebecor", category: "telecom", subcategory: "wireless-store", sizeMin: 1_400, sizeMid: 2_000, sizeMax: 2_600, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Fizz", parentCompany: "Quebecor", category: "telecom", subcategory: "wireless-store", sizeMin: 900, sizeMid: 1_200, sizeMax: 1_800, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Freedom Mobile", parentCompany: "Quebecor", category: "telecom", subcategory: "wireless-store", sizeMin: 1_200, sizeMid: 1_600, sizeMax: 2_200, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: false },

  // Financial services
  { brand: "RBC", parentCompany: "Royal Bank of Canada", category: "financial-services", subcategory: "retail-bank", sizeMin: 2_400, sizeMid: 3_200, sizeMax: 4_500, formats: ["inline", "end-cap", "freestanding"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "TD Canada Trust", parentCompany: "TD Bank Group", category: "financial-services", subcategory: "retail-bank", sizeMin: 2_400, sizeMid: 3_200, sizeMax: 4_500, formats: ["inline", "end-cap", "freestanding"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "BMO", parentCompany: "Bank of Montreal", category: "financial-services", subcategory: "retail-bank", sizeMin: 2_400, sizeMid: 3_200, sizeMax: 4_500, formats: ["inline", "end-cap", "freestanding"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Scotiabank", parentCompany: "Bank of Nova Scotia", category: "financial-services", subcategory: "retail-bank", sizeMin: 2_400, sizeMid: 3_200, sizeMax: 4_500, formats: ["inline", "end-cap", "freestanding"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "CIBC", parentCompany: "Canadian Imperial Bank of Commerce", category: "financial-services", subcategory: "retail-bank", sizeMin: 2_400, sizeMid: 3_200, sizeMax: 4_500, formats: ["inline", "end-cap", "freestanding"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Desjardins", parentCompany: "Mouvement Desjardins", category: "financial-services", subcategory: "credit-union", sizeMin: 3_000, sizeMid: 4_500, sizeMax: 6_500, formats: ["inline", "end-cap", "freestanding"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Banque Nationale", parentCompany: "National Bank of Canada", category: "financial-services", subcategory: "retail-bank", sizeMin: 2_400, sizeMid: 3_400, sizeMax: 4_500, formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "H&R Block", parentCompany: "H&R Block Inc.", category: "financial-services", subcategory: "tax-services", sizeMin: 900, sizeMid: 1_400, sizeMax: 2_000, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Money Mart", parentCompany: "Momentum Financial", category: "financial-services", subcategory: "cheque-cashing", sizeMin: 800, sizeMid: 1_200, sizeMax: 1_800, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },

  // Auto service
  { brand: "Mr. Lube", parentCompany: "Mr. Lube Canada", category: "automotive-service", subcategory: "oil-change", sizeMin: 1_800, sizeMid: 2_600, sizeMax: 3_600, formats: ["pad", "freestanding"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Speedy", parentCompany: "Speedy Auto Service", category: "automotive-service", subcategory: "muffler-brake", sizeMin: 2_200, sizeMid: 3_000, sizeMax: 4_000, formats: ["freestanding", "pad"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Midas", parentCompany: "TBC Corporation", category: "automotive-service", subcategory: "muffler-brake", sizeMin: 2_400, sizeMid: 3_200, sizeMax: 4_200, formats: ["freestanding"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "PartSource", parentCompany: "Canadian Tire Corp.", category: "automotive-service", subcategory: "auto-parts", sizeMin: 4_500, sizeMid: 6_000, sizeMax: 8_000, formats: ["end-cap"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "NAPA Auto Parts", parentCompany: "Genuine Parts Company", category: "automotive-service", subcategory: "auto-parts", sizeMin: 3_500, sizeMid: 5_000, sizeMax: 7_000, formats: ["end-cap", "freestanding"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Kal Tire", parentCompany: "Kal Tire", category: "automotive-service", subcategory: "tire", sizeMin: 4_500, sizeMid: 6_500, sizeMax: 9_000, formats: ["freestanding"], tiers: ["small-town", "mid-market"], qc: false },

  // Entertainment
  { brand: "Cineplex", parentCompany: "Cineplex Inc.", category: "entertainment", subcategory: "cinema", sizeMin: 35_000, sizeMid: 55_000, sizeMax: 80_000, formats: ["anchor", "freestanding"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Cinéma Guzzo", parentCompany: "Cinémas Guzzo", category: "entertainment", subcategory: "cinema", sizeMin: 30_000, sizeMid: 50_000, sizeMax: 75_000, formats: ["anchor"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Rec Room", parentCompany: "Cineplex Inc.", category: "entertainment", subcategory: "entertainment-complex", sizeMin: 40_000, sizeMid: 55_000, sizeMax: 70_000, formats: ["anchor"], tiers: ["major-city"], qc: false },
  { brand: "Chuck E. Cheese", parentCompany: "CEC Entertainment", category: "entertainment", subcategory: "family-entertainment", sizeMin: 10_000, sizeMid: 12_000, sizeMax: 15_000, formats: ["end-cap"], tiers: ["mid-market"], qc: false },

  // Specialty retail
  { brand: "Indigo", parentCompany: "Indigo Books & Music", category: "specialty-retail", subcategory: "books", sizeMin: 20_000, sizeMid: 26_000, sizeMax: 34_000, formats: ["anchor", "end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Renaud-Bray", parentCompany: "Renaud-Bray", category: "specialty-retail", subcategory: "books", sizeMin: 8_000, sizeMid: 14_000, sizeMax: 22_000, formats: ["end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Michaels", parentCompany: "The Michaels Companies", category: "specialty-retail", subcategory: "arts-crafts", sizeMin: 18_000, sizeMid: 22_000, sizeMax: 26_000, formats: ["end-cap", "anchor"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Party City", parentCompany: "Party City Holdco", category: "specialty-retail", subcategory: "party-supply", sizeMin: 8_000, sizeMid: 10_500, sizeMax: 13_000, formats: ["end-cap"], tiers: ["mid-market"], qc: false },
  { brand: "Toys R Us", parentCompany: "Doherty Retail Group", category: "specialty-retail", subcategory: "toys", sizeMin: 25_000, sizeMid: 32_000, sizeMax: 40_000, formats: ["anchor"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Bureau en Gros", parentCompany: "Staples Canada", category: "specialty-retail", subcategory: "office-supply", sizeMin: 18_000, sizeMid: 22_000, sizeMax: 28_000, formats: ["end-cap"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Deserres", parentCompany: "Deserres Inc.", category: "specialty-retail", subcategory: "arts-crafts", sizeMin: 6_000, sizeMid: 9_000, sizeMax: 14_000, formats: ["end-cap"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "Ardène", parentCompany: "Ardene Holdings", category: "apparel", subcategory: "value-apparel", sizeMin: 4_000, sizeMid: 5_500, sizeMax: 7_500, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },

  // Medical / services
  { brand: "IRIS", parentCompany: "New Look Vision Group", category: "beauty-personal-care", subcategory: "optical", sizeMin: 1_800, sizeMid: 2_500, sizeMax: 3_500, formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qc: true },
  { brand: "Greiche & Scaff", parentCompany: "Greiche & Scaff", category: "beauty-personal-care", subcategory: "optical", sizeMin: 1_800, sizeMid: 2_400, sizeMax: 3_200, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "LensCrafters", parentCompany: "EssilorLuxottica", category: "beauty-personal-care", subcategory: "optical", sizeMin: 1_800, sizeMid: 2_400, sizeMax: 3_200, formats: ["inline"], tiers: ["mid-market", "major-city"], qc: true },
  { brand: "New Look", parentCompany: "New Look Vision Group", category: "beauty-personal-care", subcategory: "optical", sizeMin: 1_800, sizeMid: 2_500, sizeMax: 3_500, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "First Choice Haircutters", parentCompany: "Regis Corporation", category: "beauty-personal-care", subcategory: "hair-salon", sizeMin: 1_100, sizeMid: 1_500, sizeMax: 2_000, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
  { brand: "Great Clips", parentCompany: "Great Clips Inc.", category: "beauty-personal-care", subcategory: "hair-salon", sizeMin: 1_000, sizeMid: 1_300, sizeMax: 1_700, formats: ["inline"], tiers: ["small-town", "mid-market"], qc: true },
];

// -------- Volatile helpers --------
const SOURCES = [
  "Retail Insider Q2 2026",
  "Retail Insider Q1 2026",
  "Company website",
  "Chain Store Guide 2026",
  "Press release",
  "SEC filing",
  "Retail Council of Canada 2026",
  "Investor Day deck 2026",
];

const CORRECTORS = ["Kyle Robitaille", "M. Tremblay", "S. Lévesque", "P. Chen"];

function volatileDate(): string {
  const y = pick([2025, 2025, 2026, 2026, 2026]);
  const m = range(1, 12);
  const d = range(1, 28);
  const capped = new Date(Date.UTC(y, m - 1, d));
  const demo = new Date("2026-08-10");
  if (capped > demo) capped.setUTCFullYear(2026, 5, 15);
  return capped.toISOString().slice(0, 10);
}

function makeProvinceMap(total: number, tiers: MarketTier[]): Record<string, number> {
  const provs = ["ON", "QC", "BC", "AB", "NS", "NB", "MB", "SK", "PE", "NL"];
  const weights = [0.34, 0.24, 0.14, 0.11, 0.05, 0.04, 0.03, 0.02, 0.015, 0.015];
  const out: Record<string, number> = {};
  let assigned = 0;
  for (let i = 0; i < provs.length; i++) {
    const share = Math.max(0, Math.round(total * weights[i] * rangeF(0.8, 1.2)));
    if (share > 0) out[provs[i]] = share;
    assigned += share;
  }
  const diff = total - assigned;
  if (diff !== 0 && out.ON !== undefined) {
    out.ON = Math.max(0, out.ON + diff);
  }
  // strip zeros
  for (const k of Object.keys(out)) if (out[k] === 0) delete out[k];
  // If regional / small-town-only, cut breadth
  if (tiers.length === 1 && tiers[0] === "small-town") {
    // Retain QC-heavy footprint
    for (const k of Object.keys(out)) {
      if (k !== "QC" && k !== "ON" && k !== "NB" && chance(0.6)) delete out[k];
    }
  }
  return out;
}

function pickExpansion(): ExpansionStatus {
  const roll = rng();
  if (roll < 0.35) return "expanding";
  if (roll < 0.72) return "stable";
  if (roll < 0.94) return "dormant";
  return "closing";
}

function contact(brand: string): { name: string; title: string; email: string } {
  const first = pick(["Alexandre", "Marie", "Jean", "Sophie", "Marc", "Julie", "Kevin", "Amélie", "Simon", "Catherine"]);
  const last = pick(["Tremblay", "Gagnon", "Lévesque", "Roy", "Bouchard", "Bergeron", "Fortin", "Côté", "Morin", "Lavoie"]);
  const domain = brand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 14);
  return {
    name: `${first} ${last}`,
    title: pick(["Director of Real Estate", "Real Estate Manager", "VP Development", "Head of Site Selection"]),
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain || "brand"}.com`,
  };
}

let corrCounter = 0;

function buildRetailer(
  id: string,
  h: HandBrand,
  baseCount: number,
): Retailer {
  const asOf = volatileDate();
  const expansion = pickExpansion();
  const wantsContact = expansion === "expanding" && chance(0.55);
  const total = Math.max(1, baseCount);
  const provinces = makeProvinceMap(total, h.tiers);
  corrCounter++;
  const correctedByUser =
    corrCounter % 50 === 0
      ? { at: volatileDate(), by: pick(CORRECTORS) }
      : undefined;
  const requiredFeatures: UnitFeature[] = h.features ?? [];
  return {
    id,
    brand: h.brand,
    parentCompany: h.parentCompany,
    category: h.category,
    subcategory: h.subcategory,
    sizeMin: h.sizeMin,
    sizeMid: h.sizeMid,
    sizeMax: h.sizeMax,
    formatsAccepted: h.formats,
    requiredFeatures,
    tiersOperated: h.tiers,
    operatesInQuebec: h.qc,
    locationsCanada: { value: total, asOf, source: pick(SOURCES), ...(correctedByUser ? { correctedByUser } : {}) },
    locationsByProvince: { value: provinces, asOf, source: pick(SOURCES) },
    expansionStatus: { value: expansion, asOf, source: pick(SOURCES) },
    ...(wantsContact ? { realEstateContact: contact(h.brand) } : {}),
  };
}

// Base location counts by category — plausible orders of magnitude
const BASE_LOCATIONS: Record<string, [number, number]> = {
  grocery: [80, 700],
  pharmacy: [140, 1_400],
  "home-improvement": [80, 400],
  apparel: [40, 400],
  "beauty-personal-care": [40, 300],
  "quick-service-restaurant": [140, 4_500],
  "casual-dining": [40, 400],
  "specialty-retail": [30, 350],
  "specialty-food": [40, 300],
  liquor: [80, 700],
  "dollar-store": [200, 1_600],
  "home-goods": [40, 200],
  "health-fitness": [30, 350],
  pet: [40, 400],
  electronics: [40, 400],
  telecom: [140, 900],
  "financial-services": [140, 1_100],
  "automotive-service": [80, 600],
  entertainment: [15, 180],
};

function baseCountFor(cat: string): number {
  const [lo, hi] = BASE_LOCATIONS[cat] ?? [30, 300];
  return range(lo, hi);
}

// ---- Build retailers deterministically ----
const built: Retailer[] = [];

// 1) Hand-authored
HAND.forEach((h, i) => {
  const id = `ret-${String(i + 1).padStart(4, "0")}`;
  built.push(buildRetailer(id, h, baseCountFor(h.category)));
});

// 2) Generated fillers from category templates
const TEMPLATES: Array<{
  category: string;
  subcategories: string[];
  sizeBand: [number, number, number];
  formats: UnitFormat[];
  features?: UnitFeature[];
  tiers: MarketTier[];
  qcProb: number;
}> = [
  { category: "apparel", subcategories: ["womens", "mens", "kids", "footwear", "casual", "value-apparel", "athleisure", "denim"], sizeBand: [2_400, 4_500, 7_500], formats: ["inline", "end-cap"], tiers: ["mid-market", "major-city"], qcProb: 0.5 },
  { category: "beauty-personal-care", subcategories: ["cosmetics", "salon", "spa", "optical", "brows-lashes", "nail-salon"], sizeBand: [900, 1_800, 3_500], formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qcProb: 0.6 },
  { category: "quick-service-restaurant", subcategories: ["burger", "chicken", "pizza", "sandwich", "asian", "mexican", "salad", "coffee", "smoothie", "poke", "shawarma"], sizeBand: [1_200, 2_600, 4_500], formats: ["inline", "end-cap", "pad"], features: ["grease-trap"], tiers: ["small-town", "mid-market", "major-city"], qcProb: 0.5 },
  { category: "casual-dining", subcategories: ["family-dining", "italian", "steakhouse", "sports-bar", "seafood", "asian", "mexican", "pub"], sizeBand: [3_500, 5_500, 8_000], formats: ["pad", "end-cap"], features: ["patio", "grease-trap"], tiers: ["mid-market", "major-city"], qcProb: 0.5 },
  { category: "specialty-retail", subcategories: ["books", "toys", "hobby", "gifts", "jewellery", "watches", "luggage", "eyewear"], sizeBand: [1_500, 3_000, 5_500], formats: ["inline"], tiers: ["mid-market", "major-city"], qcProb: 0.45 },
  { category: "specialty-food", subcategories: ["bakery", "confectionery", "butcher", "cheese-shop", "coffee-roaster", "tea", "produce"], sizeBand: [1_200, 2_400, 4_500], formats: ["inline"], tiers: ["mid-market", "major-city"], qcProb: 0.65 },
  { category: "health-fitness", subcategories: ["gym", "boutique-fitness", "yoga", "pilates", "spinning", "crossfit"], sizeBand: [2_000, 6_500, 20_000], formats: ["end-cap", "anchor"], tiers: ["mid-market", "major-city"], qcProb: 0.5 },
  { category: "pet", subcategories: ["pet-supply", "grooming", "pet-training"], sizeBand: [1_400, 3_500, 6_500], formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market"], qcProb: 0.55 },
  { category: "financial-services", subcategories: ["credit-union", "insurance", "tax-services", "wealth-management", "mortgage-broker"], sizeBand: [1_500, 2_800, 4_500], formats: ["inline", "end-cap"], tiers: ["small-town", "mid-market", "major-city"], qcProb: 0.55 },
  { category: "automotive-service", subcategories: ["oil-change", "muffler-brake", "auto-parts", "tire", "car-wash"], sizeBand: [1_800, 3_500, 6_000], formats: ["freestanding", "pad"], tiers: ["small-town", "mid-market"], qcProb: 0.5 },
  { category: "telecom", subcategories: ["wireless-store", "internet-provider"], sizeBand: [1_100, 1_800, 2_600], formats: ["inline"], tiers: ["small-town", "mid-market", "major-city"], qcProb: 0.5 },
  { category: "home-goods", subcategories: ["furniture", "mattress", "decor", "kitchenware"], sizeBand: [4_000, 8_500, 18_000], formats: ["end-cap", "anchor"], tiers: ["mid-market", "major-city"], qcProb: 0.5 },
  { category: "entertainment", subcategories: ["family-entertainment", "arcade", "escape-room", "trampoline-park", "karaoke", "axe-throwing"], sizeBand: [4_500, 9_500, 18_000], formats: ["end-cap"], tiers: ["mid-market", "major-city"], qcProb: 0.5 },
  { category: "electronics", subcategories: ["gaming", "audio", "phone-accessories", "repair"], sizeBand: [1_500, 2_400, 4_500], formats: ["inline"], tiers: ["mid-market", "major-city"], qcProb: 0.5 },
  { category: "specialty-retail", subcategories: ["vape", "smoke-shop", "party-supply", "cards-collectibles"], sizeBand: [1_400, 2_400, 4_000], formats: ["inline"], tiers: ["small-town", "mid-market"], qcProb: 0.45 },
];

// Fabricated brand-name generators
const BRAND_PREFIXES_EN = [
  "Northern", "Maple", "Aurora", "Pine", "Cedar", "Coastal", "Prairie", "Atlas",
  "Boreal", "Copper", "Riverside", "Summit", "Valley", "Beacon", "Trailhead", "Compass",
  "Harbour", "Hemlock", "Rocky", "Ember", "Frost", "Ridgeline", "Cascade", "Iron",
  "Silver", "Fox", "Timber", "Ivy", "Crimson", "Highland",
];
const BRAND_SUFFIXES_EN = [
  "Co.", "& Sons", "Bros.", "Market", "House", "Depot", "Emporium", "Group",
  "Studios", "Room", "Bar", "Kitchen", "Grill", "Table", "Trading Co.", "Supply",
  "Outfitters", "Boutique", "Shop", "Provisions", "Pantry",
];
const BRAND_FR_PREFIX = ["Boutique", "Chez", "Maison", "Café", "Bistro", "Épicerie", "Fromagerie"];
const BRAND_FR_ROOT = ["du Village", "de Rimouski", "des Cantons", "du Fleuve", "des Prés", "Laurentien", "de la Rive", "du Coin", "Nordique"];

function makeBrand(cat: string, tpl: (typeof TEMPLATES)[number], idx: number): string {
  if (chance(0.35)) {
    return `${pick(BRAND_FR_PREFIX)} ${pick(BRAND_FR_ROOT)}`;
  }
  const p = pick(BRAND_PREFIXES_EN);
  const suffixPool = cat === "casual-dining" || cat === "quick-service-restaurant"
    ? ["Kitchen", "Grill", "Table", "House", "Room"]
    : cat === "apparel"
    ? ["Boutique", "Co.", "& Co.", "Shop", "Outfitters"]
    : cat === "beauty-personal-care"
    ? ["Studio", "Beauty Bar", "Salon", "Aesthetics"]
    : BRAND_SUFFIXES_EN;
  return `${p} ${pick(suffixPool)} #${((idx % 9) + 1)}`;
}

const TARGET_TOTAL = 1240;
let genIdx = 0;
while (built.length < TARGET_TOTAL) {
  const tpl = TEMPLATES[genIdx % TEMPLATES.length];
  const subcategory = pick(tpl.subcategories);
  const [lo, mid, hi] = tpl.sizeBand;
  const sMin = Math.round(lo * rangeF(0.85, 1.05));
  const sMid = Math.round(mid * rangeF(0.9, 1.1));
  const sMax = Math.round(hi * rangeF(0.9, 1.15));
  const brand = makeBrand(tpl.category, tpl, genIdx);
  const parent = chance(0.65) ? `${brand.split(" ")[0]} Holdings` : `${brand.split(" ")[0]} Group`;
  const tiers: MarketTier[] = [...tpl.tiers];
  // Some brands are small-town-only regional
  if (chance(0.25)) {
    tiers.length = 0;
    tiers.push("small-town");
  }
  const h: HandBrand = {
    brand,
    parentCompany: parent,
    category: tpl.category,
    subcategory,
    sizeMin: sMin,
    sizeMid: sMid,
    sizeMax: sMax,
    formats: tpl.formats,
    features: tpl.features,
    tiers,
    qc: chance(tpl.qcProb),
  };
  const id = `ret-${String(built.length + 1).padStart(4, "0")}`;
  built.push(buildRetailer(id, h, baseCountFor(tpl.category)));
  genIdx++;
}

export const retailers: Retailer[] = built;
