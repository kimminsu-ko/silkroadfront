import { ref, computed, watch } from "vue";
import { regionData } from "@/constants/regions";

export function useRegionSelection() {
  const selectedRegion = ref("");
  const selectedSigungu = ref("");

  const sigunguOptions = computed(() => {
    const region = regionData.find((r) => r.code === selectedRegion.value);
    return region ? region.sigungu : [];
  });

  watch(selectedRegion, () => {
    selectedSigungu.value = "";
  });

  return {
    selectedRegion,
    selectedSigungu,
    sigunguOptions,
  };
}
