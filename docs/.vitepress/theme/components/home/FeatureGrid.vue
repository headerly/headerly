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
      mt-12 max-w-none gap-x-16 gap-y-0
      max-sm:mt-9
      md:auto-rows-auto md:grid-cols-2
    "
  >
    <BlurReveal
      v-for="(feature, index) in features"
      :key="feature.number" as="a" :delay="(index % 2) * 0.08" :href="feature.href" class="
        group flex flex-col border-t border-border pt-7 pb-8
        max-sm:py-6
      "
    >
      <div class="mb-6 flex items-center justify-between">
        <span
          class="font-mono text-xs/normal text-muted-foreground"
        >{{ feature.number }}</span><i
          class="size-6 text-brand" :class="feature.icon" aria-hidden="true"
        />
      </div>
      <h3
        class="
          text-2xl/snug font-medium tracking-tight
          group-hover:text-brand
        "
      >
        {{ feature.title }}
      </h3>
      <p
        class="mt-3 mb-6 max-w-md text-sm/relaxed text-muted-foreground"
      >
        {{ feature.description }}
      </p>
      <div
        class="
          mt-auto flex items-center justify-between gap-4 font-mono
          text-xs/normal tracking-wider text-muted-foreground
        "
      >
        <span>{{ feature.detail }}</span><i
          class="
            i-lucide-arrow-up-right size-4.5 text-foreground
            transition-transform duration-200
            group-hover:translate-x-1 group-hover:-translate-y-1
            motion-reduce:transition-none
          " aria-hidden="true"
        />
      </div>
    </BlurReveal>
  </BentoGrid>
</template>
