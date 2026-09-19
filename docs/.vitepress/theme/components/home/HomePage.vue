<script setup lang="ts">
import { BlurReveal } from "@headerly/ui/components/blur-reveal";
import { ScrewText } from "@headerly/ui/components/screw-text";
import { Sparkles } from "@headerly/ui/components/sparkles";
import DownloadButtons from "../DownloadButtons.vue";
import FeatureGrid from "./FeatureGrid.vue";
import GitHubButton from "./GitHubButton.vue";
import ProductPreview from "./ProductPreview.vue";
</script>

<template>
  <main
    class="
      vp-raw mx-auto max-w-7xl px-12 text-foreground
      **:focus-visible:rounded-sm **:focus-visible:outline-2
      **:focus-visible:outline-offset-6 **:focus-visible:outline-ring
      max-lg:px-8
      max-sm:px-6
    "
  >
    <section aria-labelledby="hero-title">
      <div
        class="
          relative isolate flex flex-col items-center py-16 text-center
          max-sm:py-12
        "
      >
        <div
          class="
            pointer-events-none absolute inset-0 -z-10 mask-radial-from-65%
            mask-radial-to-100% opacity-75
          " aria-hidden="true"
        >
          <Sparkles particle-color="var(--brand)" :particle-density="120" :min-size="0.7" :max-size="1.8" :speed="0.5" />
        </div>
        <div
          class="
            mb-7 grid size-16 -rotate-6 place-items-center rounded-2xl border
            border-brand/20 bg-brand/5
          " aria-hidden="true"
        >
          <img
            src="/images/headerly.svg" alt="" width="44" height="44" class="
              no-zoom rounded-xl
            "
          >
        </div>
        <BlurReveal
          id="hero-title" as="h1" class="
            m-0 text-5xl leading-none font-medium tracking-tighter
            sm:text-7xl
            lg:text-8xl
          "
        >
          Make the web<br>work <em
            class="font-serif font-normal tracking-tighter text-brand"
          >your way.</em>
        </BlurReveal>
        <BlurReveal
          as="p" :delay="0.1" class="
            my-8 text-lg/relaxed text-muted-foreground
            max-sm:mt-6 max-sm:mb-7 max-sm:max-w-sm max-sm:text-base
          "
        >
          Change a HTTP request/response header. Redirect a request. Switch environments.<br
            class="max-sm:hidden"
          > A little more control, right where you browse.
        </BlurReveal>
        <DownloadButtons centered>
          <template #secondary>
            <GitHubButton />
          </template>
        </DownloadButtons>
        <ScrewText
          as="a"
          href="/start/first-profile"
          label="A two-minute introduction"
          class="
            group mt-6 inline-flex w-fit items-center gap-3 text-base
            font-medium
          "
          rotate-direction="top"
          :stagger-duration="0.018"
        >
          <i
            class="
              i-lucide-arrow-right size-4 transition-transform duration-200
              group-hover:translate-x-1
              motion-reduce:transition-none
            " aria-hidden="true"
          />
        </ScrewText>
      </div>
      <ProductPreview />
      <div
        class="
          flex justify-center gap-14 border-y border-border py-6 text-xs/6
          text-muted-foreground
          max-sm:justify-between max-sm:gap-3 max-sm:text-xs
        "
      >
        <span
          class="
            flex items-center gap-2.5
            max-sm:flex-col max-sm:gap-2 max-sm:text-center
          "
        ><i
          class="i-lucide-hard-drive size-4" aria-hidden="true"
        /> Stored locally</span><span
          class="
            flex items-center gap-2.5
            max-sm:flex-col max-sm:gap-2 max-sm:text-center
          "
        ><i
          class="i-lucide-zap size-4" aria-hidden="true"
        /> Applied by your browser</span><span
          class="
            flex items-center gap-2.5
            max-sm:flex-col max-sm:gap-2 max-sm:text-center
          "
        ><i
          class="i-lucide-code-xml size-4" aria-hidden="true"
        /> Open by design</span>
      </div>
    </section>

    <section
      class="
        pt-24 pb-16
        max-sm:pt-16 max-sm:pb-8
      " aria-labelledby="capabilities-title"
    >
      <BlurReveal>
        <p
          class="
            mb-7 font-mono text-xs/normal tracking-wider text-muted-foreground
          "
        >
          01 — CAPABILITIES
        </p><div
          class="
            flex items-end justify-between gap-8
            max-sm:block
          "
        >
          <h2
            id="capabilities-title" class="
              text-4xl/tight font-medium tracking-tighter
              lg:text-5xl
            "
          >
            Small extension.<br><span class="text-muted-foreground">Considerable control.</span>
          </h2><p
            class="
              pb-1 text-base/relaxed text-muted-foreground
              max-sm:mt-5
            "
          >
            For the quick fixes, the tricky bugs,<br>and the setups you come back to.
          </p>
        </div>
      </BlurReveal>
      <FeatureGrid />
    </section>

    <section
      class="
        grid grid-cols-2 gap-16 rounded-sm bg-primary p-16
        text-primary-foreground
        max-lg:gap-9 max-lg:p-10
        max-sm:grid-cols-1 max-sm:gap-11 max-sm:px-6 max-sm:py-8
      " aria-labelledby="privacy-title"
    >
      <BlurReveal>
        <p
          class="
            mb-7 font-mono text-xs/normal tracking-wider text-inherit opacity-55
          "
        >
          02 — BY DESIGN
        </p><h2
          id="privacy-title" class="
            text-4xl/tight font-medium tracking-tighter
            lg:text-5xl
          "
        >
          Your traffic.<br>Your business.
        </h2><a
          href="/explanation/privacy-model" class="
            group mt-9 inline-flex w-fit items-center gap-3 text-sm font-medium
          "
        >Read the privacy model <i
          class="
            i-lucide-arrow-up-right size-4 transition-transform duration-200
            group-hover:translate-x-1
            motion-reduce:transition-none
          " aria-hidden="true"
        /></a>
      </BlurReveal>
      <div class="grid gap-8">
        <div>
          <i class="mb-3.5 i-lucide-hard-drive block size-5 opacity-65" aria-hidden="true" /><h3
            class="text-lg font-medium tracking-tight"
          >
            A setup that stays with you.
          </h3><p
            class="mt-2 text-sm/relaxed opacity-65"
          >
            Profiles and settings are stored locally in your extension. Headerly does not automatically upload them.
          </p>
        </div>
        <div>
          <i class="mb-3.5 i-lucide-route block size-5 opacity-65" aria-hidden="true" /><h3
            class="text-lg font-medium tracking-tight"
          >
            The browser does the work.
          </h3><p
            class="mt-2 text-sm/relaxed opacity-65"
          >
            Rules run through the browser’s built-in engine. Headerly does not proxy traffic or read request and response bodies.
          </p>
        </div>
      </div>
    </section>

    <section
      class="
        flex items-center justify-between gap-10 py-24
        max-lg:flex-col max-lg:items-start max-lg:gap-8
        max-sm:py-16
      " aria-labelledby="start-title"
    >
      <div>
        <p
          class="mb-5 font-mono text-xs/normal tracking-wider text-brand"
        >
          YOURS TO CONFIGURE
        </p><h2
          id="start-title" class="
            text-5xl/tight font-medium tracking-tighter
            max-sm:text-4xl
          "
        >
          A better workflow<br>is one click away.
        </h2>
      </div>
      <DownloadButtons />
    </section>

    <footer
      class="
        flex items-center justify-between gap-6 border-t border-border pt-7 pb-9
        text-xs/6 text-muted-foreground
      "
    >
      <a
        href="/" class="
          inline-flex items-center gap-2 text-lg font-semibold tracking-tight
          text-foreground transition
          hover:text-brand
        "
      ><img
        src="/images/headerly.svg" alt="" width="24" height="24" class="no-zoom"
      >headerly</a><p class="max-sm:hidden">
        © 2026-present headerly. All rights reserved.
      </p><nav
        aria-label="Footer" class="flex gap-6"
      >
        <a
          href="/start/overview" class="
            flex items-center gap-1.5
            hover:text-brand
          "
        >Docs</a><a
          class="
            flex items-center gap-1.5
            hover:text-brand
          " href="https://github.com/headerly/headerly" target="_blank" rel="noopener noreferrer"
        >Source <i
          class="i-lucide-arrow-up-right size-3" aria-hidden="true"
        /></a>
      </nav>
    </footer>
  </main>
</template>
