// Ported from ../../src/data.js so mock mode looks identical to the current app.
// Keep the ingredient names/brands/prices in sync with the web app's DATA.pbmIngredients.

export const RECIPES = {
  pbm: {
    id: 'pbm',
    title: 'Paneer Butter Masala',
    chef: 'sanjyot',
    chefName: 'Sanjyot Keer',
    time: '25 min',
    serves: 4,
    heat: 2,
    reelHandle: '@yourfoodlab',
    reelDuration: '0:58',
  },
}

// The ingredient list a parsed "Paneer Butter Masala" Reel resolves to.
// `qty` is the recipe quantity; `pack` is what Instamart sells it as.
export const PBM_INGREDIENTS = [
  { name: 'Paneer',                qty: '400 g',    unit: 'g',    pack: '1 pack',      brand: 'Mother Dairy', chefPick: true,  price: 145, mrp: 155 },
  { name: 'Tomatoes',              qty: '500 g',    unit: 'g',    pack: '1 kg pack',   brand: 'Fresh',        chefPick: false, price: 38,  mrp: 45  },
  { name: 'White Butter',          qty: '100 g',    unit: 'g',    pack: '200 g block', brand: 'Amul',         chefPick: true,  price: 110, mrp: 115 },
  { name: 'Fresh Cream',           qty: '50 ml',    unit: 'ml',   pack: '200 ml pack', brand: 'Amul',         chefPick: true,  price: 75,  mrp: 80  },
  { name: 'Cashew Nuts',           qty: '50 g',     unit: 'g',    pack: '200 g pouch', brand: 'Happilo',      chefPick: false, price: 165, mrp: 199 },
  { name: 'Ginger',                qty: '1 inch',   unit: 'pc',   pack: '100 g pack',  brand: 'Fresh',        chefPick: false, price: 22,  mrp: 25  },
  { name: 'Garlic',                qty: '6 cloves', unit: 'pc',   pack: '100 g pack',  brand: 'Fresh',        chefPick: false, price: 28,  mrp: 32  },
  { name: 'Kashmiri Chilli Powder',qty: '1 tsp',   unit: 'tsp',  pack: '100 g jar',   brand: 'Tata Sampann', chefPick: true,  price: 95,  mrp: 110 },
  { name: 'Garam Masala',          qty: '½ tsp',    unit: 'tsp',  pack: '100 g pack',  brand: 'MDH',          chefPick: true,  price: 80,  mrp: 90  },
  { name: 'Kasuri Methi',          qty: '1 tbsp',   unit: 'tbsp', pack: '25 g pack',   brand: 'Catch',        chefPick: false, price: 45,  mrp: 50  },
  { name: 'Sugar',                 qty: '1 tsp',    unit: 'tsp',  pack: '1 kg pack',   brand: 'Madhur',       chefPick: false, price: 52,  mrp: 55  },
  // Intentionally not stocked at the demo pincode -> drives the "unmatched" UI.
  { name: 'Kewra Water',           qty: '2 drops',  unit: 'drop', pack: '30 ml bottle',brand: 'Dabur',        chefPick: false, price: 0,   mrp: 0, outOfStock: true },
]

// Alternatives surfaced by the "swap" sheet for paneer.
export const PANEER_ALTERNATIVES = [
  { brand: 'Mother Dairy', pack: '400 g', price: 145, mrp: 155, rating: 4.5, chefPick: true  },
  { brand: 'Amul',         pack: '400 g', price: 152, mrp: 160, rating: 4.4, chefPick: false },
  { brand: 'Gowardhan',    pack: '400 g', price: 138, mrp: 150, rating: 4.2, chefPick: false },
  { brand: 'Milky Mist',   pack: '400 g', price: 165, mrp: 175, rating: 4.6, chefPick: false },
]

export const ADDRESSES = [
  {
    id: 'addr_home_1',
    addressLine: 'A-1402, ATS Pristine, Siddharth Vihar, near Hindon Park, Ghaziabad 201009',
    phoneNumber: '9876543210',
    addressCategory: 'Home',
    addressTag: 'Home',
  },
  {
    id: 'addr_office_1',
    addressLine: 'Tower B, 6th Floor, Candor TechSpace, Sector 62, Noida 201309',
    phoneNumber: '9876543210',
    addressCategory: 'Office',
    addressTag: 'Work',
  },
]
