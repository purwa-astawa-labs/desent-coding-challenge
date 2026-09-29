/**
 * Product details shown when a product is selected: a description, a specs list and extra
 * gallery photos. Kept beside (not inside) the layout-focused catalog in `catalog.ts`.
 *
 * All descriptions and specs are SAMPLE content. Replace them with the real product data.
 * To add photos, put files under `public/` and list their paths (starting with `/`) in
 * `images`; they appear in the gallery after the main image and the "In your space" view.
 */

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductDetails {
  description: string;
  specs: ProductSpec[];
  /** Extra gallery photos, paths under /public. Empty until the owner adds photos. */
  images: string[];
}

const s = (label: string, value: string): ProductSpec => ({ label, value });

export const productDetails: Readonly<Record<string, ProductDetails>> = {
  // Desks
  "desk-minimal-white": {
    description: "A clean, compact desk with a matte white top that suits small rooms and minimal setups.",
    specs: [
      s("Dimensions", "120 × 60 × 74 cm"),
      s("Top", "Matte white laminate, 18 mm"),
      s("Frame", "Powder-coated steel, white"),
      s("Max load", "50 kg"),
    ],
    images: [],
  },
  "desk-oak-standing": {
    description: "Electric sit-stand desk with a solid oak top and memory presets, so you can switch posture through the day.",
    specs: [
      s("Dimensions", "140 × 70 cm"),
      s("Height range", "62–127 cm, electric dual motor"),
      s("Top", "Solid oak, oiled finish"),
      s("Presets", "4 memory positions"),
      s("Max load", "100 kg"),
    ],
    images: [],
  },

  // Chairs
  "chair-lounge-task": {
    description: "A soft, upholstered task chair for shorter work sessions with a relaxed, living-room look.",
    specs: [
      s("Seat height", "44–54 cm"),
      s("Upholstery", "Woven fabric, oatmeal"),
      s("Base", "5-star, castors"),
      s("Adjustments", "Height, tilt"),
    ],
    images: [],
  },
  "chair-ergo-mesh": {
    description: "Breathable mesh ergonomic chair with adjustable lumbar support for all-day comfort.",
    specs: [
      s("Seat height", "45–55 cm"),
      s("Back", "Breathable mesh, adjustable lumbar"),
      s("Armrests", "3D adjustable"),
      s("Adjustments", "Height, tilt lock, seat depth"),
      s("Max load", "130 kg"),
    ],
    images: [],
  },
  "chair-gaming": {
    description: "Racing-style gaming chair with neck and lumbar pillows and a deep recline for long sessions.",
    specs: [
      s("Seat height", "46–56 cm"),
      s("Upholstery", "PU leather, black/red"),
      s("Recline", "90–155°"),
      s("Extras", "Neck + lumbar pillows"),
      s("Max load", "120 kg"),
    ],
    images: [],
  },

  // Monitors
  "monitor-24-fhd": {
    description: "A dependable 24-inch Full HD IPS monitor for everyday work, easy to pair side by side.",
    specs: [
      s("Screen", '24" IPS, anti-glare'),
      s("Resolution", "1920 × 1080 (Full HD)"),
      s("Refresh rate", "75 Hz"),
      s("Inputs", "HDMI, DisplayPort"),
      s("Stand", "Tilt, VESA 100"),
    ],
    images: [],
  },
  "monitor-27-4k": {
    description: "Sharp 27-inch 4K monitor with USB-C, so one cable charges and connects your laptop.",
    specs: [
      s("Screen", '27" IPS, anti-glare'),
      s("Resolution", "3840 × 2160 (4K UHD)"),
      s("Refresh rate", "60 Hz"),
      s("Inputs", "USB-C (65 W), HDMI, DisplayPort"),
      s("Stand", "Height, tilt, swivel; VESA 100"),
    ],
    images: [],
  },

  // Desk accessories
  plants: {
    description: "An easy-care snake plant in a white ceramic pot to bring some green to your workspace.",
    specs: [
      s("Plant", "Snake plant (Sansevieria)"),
      s("Pot", "Ceramic, 12 cm"),
      s("Care", "Low light, water weekly"),
    ],
    images: [],
  },
  "desk-lamp": {
    description: "Adjustable LED desk lamp with dimming and warm-to-cool colour temperature.",
    specs: [
      s("Light", "LED, 8 W"),
      s("Colour temperature", "2700–6500 K"),
      s("Dimming", "5 levels, touch control"),
      s("Arm", "Adjustable, aluminium"),
    ],
    images: [],
  },

  // Lounge zone
  sofa: {
    description: "A three-seat sofa with deep cushions for breaks, reading or casual meetings.",
    specs: [
      s("Dimensions", "210 × 90 × 85 cm"),
      s("Seats", "3"),
      s("Upholstery", "Performance fabric, grey"),
      s("Legs", "Solid oak"),
    ],
    images: [],
  },
  "bean-bag": {
    description: "An oversized bean bag that shapes to you, with a washable cover.",
    specs: [
      s("Dimensions", "100 × 90 cm"),
      s("Cover", "Removable, machine washable"),
      s("Fill", "Recycled EPS beads"),
    ],
    images: [],
  },
  "floor-plant": {
    description: "A tall, low-maintenance floor plant in a matte planter that softens any corner.",
    specs: [
      s("Height", "About 120 cm"),
      s("Planter", "Matte ceramic, 30 cm"),
      s("Care", "Bright indirect light, water weekly"),
    ],
    images: [],
  },
  "coffee-station": {
    description: "A compact coffee station with a capsule machine and cup storage for your lounge.",
    specs: [
      s("Machine", "Capsule espresso, 19 bar"),
      s("Water tank", "1.2 L"),
      s("Cart", "Steel, 2 shelves"),
      s("Includes", "4 mugs"),
    ],
    images: [],
  },

  // Garage
  "garage-space": {
    description: "A private, lockable garage bay to store your rented gear. Required for any garage gear.",
    specs: [
      s("Size", "3 × 6 m"),
      s("Access", "24/7, keypad lock"),
      s("Power", "2 sockets, LED lighting"),
    ],
    images: [],
  },
  motorbike: {
    description: "A light, easy-to-ride city motorbike for commuting and weekend trips. Helmet included.",
    specs: [
      s("Engine", "125 cc, single cylinder"),
      s("Licence", "A1 or equivalent"),
      s("Fuel economy", "About 45 km/L"),
      s("Includes", "1 helmet, disc lock"),
    ],
    images: [],
  },
  surfboard: {
    description: "A forgiving foam-top surfboard for beginners and relaxed sessions, with leash and fins.",
    specs: [
      s("Length", "7'0\" (213 cm)"),
      s("Construction", "Soft foam top, HDPE bottom"),
      s("Volume", "56 L"),
      s("Includes", "Leash, 3 fins"),
    ],
    images: [],
  },
  "sport-gear": {
    description: "A home fitness kit with adjustable dumbbells, a yoga mat and resistance bands.",
    specs: [
      s("Dumbbells", "2 × adjustable, 2–12 kg"),
      s("Mat", "Yoga mat, 6 mm"),
      s("Bands", "3 resistance levels"),
    ],
    images: [],
  },
};

export function getDetails(id: string): ProductDetails | undefined {
  return Object.hasOwn(productDetails, id) ? productDetails[id] : undefined;
}

export type GallerySlide = { kind: "image"; src: string; label: string } | { kind: "scene"; label: string };

/**
 * Gallery order: the card image (thumbnail, else the scene image), the "In your space" scene view,
 * the scene image as a back view when a separate thumbnail exists, then any extra photos. Never empty slots.
 */
export function gallerySlides(
  item: { id: string; name: string; image: string; thumbnail?: string },
  zoneTitle: string,
): GallerySlide[] {
  const extra = (getDetails(item.id)?.images ?? []).filter((src) => src.trim() !== "");
  return [
    { kind: "image", src: item.thumbnail ?? item.image, label: item.name },
    { kind: "scene", label: `In your space (${zoneTitle.toLowerCase()})` },
    ...(item.thumbnail ? [{ kind: "image" as const, src: item.image, label: `${item.name}, back` }] : []),
    ...extra.map((src, i) => ({ kind: "image" as const, src, label: `${item.name}, photo ${i + 1}` })),
  ];
}
