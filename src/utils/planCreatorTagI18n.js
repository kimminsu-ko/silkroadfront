import { useI18n } from "vue-i18n";
import { REGION_SERVER_TO_KEY, TAG_SERVER_TO_KEY } from "@/utils/tagReverseMapper.js";

export const usePlanCreatorTagI18n = () => {
    const { t } = useI18n();

    const renderServerTag = (serverText) => {
        const regionKey = REGION_SERVER_TO_KEY[serverText];
        if (regionKey) return t(`planCreator.regions.${regionKey}`);

        const key = TAG_SERVER_TO_KEY[serverText];
        if (!key) return serverText;

        const themePath = `planCreator.themes.${key}`;
        const seasonPath = `planCreator.seasons.${key}`;

        const themeVal = t(themePath);
        if (themeVal !== themePath) return themeVal;

        const seasonVal = t(seasonPath);
        if (seasonVal !== seasonPath) return seasonVal;

        return serverText;
    };

    return { renderServerTag };
};