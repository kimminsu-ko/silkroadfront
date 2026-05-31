<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { PhMapTrifold, PhSparkle, PhCamera, PhChatCircleText, PhArrowRight } from "@phosphor-icons/vue";

// Images
import imgPlan from "@/assets/homeImg/intro_plan.png";
import imgAi from "@/assets/homeImg/intro_ai.png";
import imgSearch from "@/assets/homeImg/intro_search.png";
import imgCommunity from "@/assets/homeImg/intro_community.png";

const router = useRouter();
const { t } = useI18n();

// Refs for scroll observation
const headerRef = ref(null);
const featureRefs = ref([]);

// Data for features
const features = computed(() => [
  {
    id: 1,
    title: t("intro.features.plan.title"),
    desc: t("intro.features.plan.desc"),
    buttonText: t("intro.features.plan.button"),
    link: "/my-plans",
    icon: PhMapTrifold,
    color: "#E8F3FF", // Soft Blue
    iconColor: "#4A90E2",
    image: imgPlan,
  },
  {
    id: 2,
    title: t("intro.features.ai.title"),
    desc: t("intro.features.ai.desc"),
    buttonText: t("intro.features.ai.button"),
    link: "/ai-route",
    icon: PhSparkle,
    color: "#F3E5F5", // Soft Purple
    iconColor: "#9C27B0",
    image: imgAi,
  },
  {
    id: 3,
    title: t("intro.features.search.title"),
    desc: t("intro.features.search.desc"),
    buttonText: t("intro.features.search.button"),
    link: "/tourist-search",
    icon: PhCamera,
    color: "#E0F2F1", // Soft Teal
    iconColor: "#009688",
    image: imgSearch,
  },
  {
    id: 4,
    title: t("intro.features.community.title"),
    desc: t("intro.features.community.desc"),
    buttonText: t("intro.features.community.button"),
    link: "/board",
    icon: PhChatCircleText,
    color: "#FFF3E0", // Soft Orange
    iconColor: "#FF9800",
    image: imgCommunity,
  },
]);

// Intersection Observer Logic
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.25, // Trigger when 25% visible
};

let observer;

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Optional: Stop observing once visible if you want it to animate only once
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  if (headerRef.value) observer.observe(headerRef.value);

  featureRefs.value.forEach((el) => {
    if (el) observer.observe(el);
  });
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <section class="home-intro">
    <!-- Main Poetic Intro -->
    <div class="intro-header" ref="headerRef">
      <p class="eyebrow">{{ t("intro.header.eyebrow") }}</p>
      <h2 class="main-title" style="white-space: pre-line">
        {{ t("intro.header.title") }}
      </h2>
      <p class="sub-title" style="white-space: pre-line">
        {{ t("intro.header.subtitle") }}
      </p>
    </div>

    <!-- Feature Sections -->
    <div class="features-container">
      <div
        v-for="(feature, index) in features"
        :key="feature.id"
        class="feature-section"
        :class="{ reverse: index % 2 === 1 }"
        :ref="(el) => (featureRefs[index] = el)"
      >
        <!-- Text Content -->
        <div class="feature-content">
          <div
            class="feature-icon-wrapper"
            :style="{
              backgroundColor: feature.color,
              color: feature.iconColor,
            }"
          >
            <component :is="feature.icon" weight="fill" />
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc" style="white-space: pre-line">{{ feature.desc }}</p>
          <button class="feature-btn" @click="router.push(feature.link)">
            {{ feature.buttonText }}
            <PhArrowRight weight="bold" />
          </button>
        </div>

        <!-- Visual/Image Area -->
        <div class="feature-visual">
          <div class="visual-card" :style="{ backgroundColor: feature.color }">
            <img
              :src="feature.image"
              :alt="feature.title"
              class="visual-img"
              :class="{
                'visual-img-contain': [4].includes(feature.id),
                'visual-img-plan': feature.id === 1,
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-intro {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 8rem 1.5rem 10rem;
  overflow: hidden; /* Prevent horizontal scroll from animations */
}

/* Header Section */
.intro-header {
  text-align: center;
  margin-bottom: 10rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.intro-header.visible {
  opacity: 1;
  transform: translateY(0);
}

.eyebrow {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #cca478;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

.main-title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #3b2f22;
  line-height: 1.3;
  margin-bottom: 2rem;
  word-break: keep-all;
}
.intro-card-meta {
  margin: 10px 0 0;
  font-size: 0.9rem;
  color: #9c8c74;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.meta-nick {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta-like {
  flex-shrink: 0;
}

.sub-title {
  font-size: 1.2rem;
  color: #7a7a7a;
  line-height: 1.6;
  font-weight: 400;
}

/* Feature Sections */
.features-container {
  display: flex;
  flex-direction: column;
  gap: 8rem; /* Space between sections */
}

.feature-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  opacity: 0;
  transform: translateY(60px);
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.feature-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.feature-section.reverse {
  flex-direction: row-reverse;
}

/* Content Side */
.feature-content {
  flex: 1;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.feature-section.reverse .feature-content {
  align-items: flex-end;
  text-align: right;
}

.feature-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 2rem;
  font-weight: 700;
  color: #3b2f22;
  margin-bottom: 1rem;
}

.feature-desc {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.7;
  margin-bottom: 2rem;
  white-space: pre-line; /* Handle newlines */
}

.feature-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #3b2f22;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-btn:hover {
  background-color: #cca478;
  transform: translateY(-2px);
  padding-right: 28px; /* Slide effect */
}

/* Visual Side */
.feature-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.visual-card {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 4/3;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  transition: transform 0.5s ease;
  overflow: hidden;
}

.feature-section:hover .visual-card {
  transform: scale(1.02);
}

.visual-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.visual-img.visual-img-contain {
  width: 85%;
  height: 85%;
  object-fit: contain;
  border-radius: 12px;
}
.visual-img.visual-img-plan {
  width: 90%;
  height: 90%;
  object-fit: cover;
  border-radius: 12px;
}

.feature-section:hover .visual-img {
  transform: scale(1.05);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .home-intro {
    padding: 4rem 1.5rem;
  }

  .intro-header {
    margin-bottom: 6rem;
  }

  .feature-section {
    flex-direction: column;
    gap: 3rem;
    text-align: center;
  }

  .feature-section.reverse {
    flex-direction: column;
  }

  .feature-content {
    align-items: center;
    text-align: center;
  }

  .feature-section.reverse .feature-content {
    align-items: center;
    text-align: center;
  }

  .feature-desc {
    white-space: normal;
  }
}
</style>
