<script setup lang="ts">
import { BentoGrid } from "@headerly/ui/components/bento-grid";
import { BlurReveal } from "@headerly/ui/components/blur-reveal";

const features = [
  { number: "01", title: "Every header, handled.", description: "Set, append, or remove request and response headers. Test authentication, feature flags, and CORS without touching your application.", icon: "i-lucide-list-filter", href: "/guides/modify-request-headers", detail: "REQUEST + RESPONSE HEADERS" },
  { number: "02", title: "Point it somewhere better.", description: "Send an API to localhost, redirect an asset to staging, or block a noisy request. Allow traffic and upgrade HTTP to HTTPS, too.", icon: "i-lucide-corner-up-right", href: "/reference/actions/", detail: "REDIRECT / BLOCK / ALLOW" },
  { number: "03", title: "Only where you need it.", description: "Target URLs, regex, domains, request methods, and resource types. Get specific with individual tabs and tab groups.", icon: "i-lucide-crosshair", href: "/reference/conditions/", detail: "PRECISE REQUEST MATCHING" },
  { number: "04", title: "Switch contexts. Keep your setup.", description: "Organize rules into reusable profiles. Switch environments with radio groups, combine profiles with checkbox groups, and pause or resume them together.", icon: "i-lucide-panels-top-left", href: "/reference/profile-groups", detail: "PROFILES + GROUPS" },
  { number: "05", title: "Let your session keep up.", description: "Append a selected browser cookie to matching requests and keep its value in sync as it changes. Cookie access is enabled only when you grant permission.", icon: "i-lucide-refresh-cw", href: "/guides/sync-cookies", detail: "COOKIE SYNCHRONIZATION" },
  { number: "06", title: "Keep it. Share it. Reuse it.", description: "Back up profiles as JSON or pass a setup along with a share link. Synchronized cookie values are cleared from exports and shared profiles.", icon: "i-lucide-arrow-up-right", href: "/guides/import-export-share", detail: "IMPORT / EXPORT / SHARE" },
];
</script>

<template>
  <BentoGrid
    class="
      home-feature-grid max-w-none gap-x-16 gap-y-0
      md:auto-rows-auto md:grid-cols-2
    "
  >
    <BlurReveal
      v-for="(feature, index) in features"
      :key="feature.number" as="a" :delay="(index % 2) * 0.08" :href="feature.href" class="
        home-feature
      "
    >
      <div class="feature-index">
        <span>{{ feature.number }}</span><i :class="feature.icon" aria-hidden="true" />
      </div>
      <h3>{{ feature.title }}</h3>
      <p>{{ feature.description }}</p>
      <div class="feature-footnote">
        <span>{{ feature.detail }}</span><i
          class="i-lucide-arrow-up-right" aria-hidden="true"
        />
      </div>
    </BlurReveal>
  </BentoGrid>
</template>
