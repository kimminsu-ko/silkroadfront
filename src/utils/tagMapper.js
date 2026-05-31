import { TRAVEL_THEME_KEYS, SEASON_KEYS, REGION_KEYS } from "@/constants/tags";

// theme + season
const TAG_KEY_TO_SERVER = Object.fromEntries(
    [...TRAVEL_THEME_KEYS, ...SEASON_KEYS].map((x) => [x.key, x.server])
);

// region
const REGION_KEY_TO_SERVER = Object.fromEntries(
    REGION_KEYS.map((x) => [x.key, x.server])
);

export const toServerTag = (key) => TAG_KEY_TO_SERVER[key] ?? key;
export const toServerRegion = (key) => REGION_KEY_TO_SERVER[key] ?? key;