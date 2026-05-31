import { TRAVEL_THEME_KEYS, SEASON_KEYS, REGION_KEYS } from "@/constants/tags";

export const REGION_SERVER_TO_KEY = Object.fromEntries(
    REGION_KEYS.map((x) => [x.server, x.key])
);

export const TAG_SERVER_TO_KEY = Object.fromEntries(
    [...TRAVEL_THEME_KEYS, ...SEASON_KEYS].map((x) => [x.server, x.key])
);