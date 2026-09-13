<script setup lang="ts">
import { BlurReveal } from "@headerly/ui/components/blur-reveal";
import { ScrewText } from "@headerly/ui/components/screw-text";
import { Sparkles } from "@headerly/ui/components/sparkles";
import DownloadButtons from "../DownloadButtons.vue";
import ComparisonTable from "./ComparisonTable.vue";
import FeatureGrid from "./FeatureGrid.vue";
</script>

<template>
  <div class="headerly-home vp-raw">
    <section aria-labelledby="hero-title">
      <div class="hero-edition">
        <span>HEADERLY / BROWSER TOOLKIT</span><a href="https://github.com/headerly/headerly" target="_blank" rel="noopener noreferrer">FREE & OPEN SOURCE <i
          class="i-lucide-arrow-up-right" aria-hidden="true"
        /></a>
      </div>
      <div class="hero-main">
        <div class="hero-sparkles" aria-hidden="true">
          <Sparkles particle-color="var(--brand)" :particle-density="120" :min-size="0.7" :max-size="1.8" :speed="0.5" />
        </div>
        <div class="hero-emblem" aria-hidden="true">
          <img
            src="/images/headerly.svg" alt="" width="44" height="44" class="
              no-zoom
            "
          >
        </div>
        <BlurReveal id="hero-title" as="h1">
          Make the web<br>work <em>your way.</em>
        </BlurReveal>
        <BlurReveal as="p" :delay="0.1">
          Change a header. Redirect a request. Switch environments.<br
            class="desktop-break"
          > A little more control, right where you browse.
        </BlurReveal>
        <div class="hero-downloads">
          <DownloadButtons />
        </div>
        <ScrewText
          as="a"
          href="/start/first-profile"
          label="A two-minute introduction"
          class="home-text-link"
          rotate-direction="top"
          :stagger-duration="0.018"
        >
          <i class="i-lucide-arrow-right" aria-hidden="true" />
        </ScrewText>
      </div>
      <div class="hero-baseline">
        <span><i class="i-lucide-hard-drive" aria-hidden="true" /> Stored locally</span><span><i
          class="i-lucide-zap" aria-hidden="true"
        /> Applied by your browser</span><span><i
          class="i-lucide-code-xml" aria-hidden="true"
        /> Open by design</span>
      </div>
    </section>

    <section class="home-capabilities" aria-labelledby="capabilities-title">
      <BlurReveal class="home-section-heading">
        <p class="home-label">
          01 — CAPABILITIES
        </p><div>
          <h2 id="capabilities-title">
            Small extension.<br><span>Considerable control.</span>
          </h2><p>For the quick fixes, the tricky bugs,<br>and the setups you come back to.</p>
        </div>
      </BlurReveal>
      <FeatureGrid />
    </section>

    <section class="home-privacy" aria-labelledby="privacy-title">
      <BlurReveal class="privacy-heading">
        <p class="home-label">
          02 — BY DESIGN
        </p><h2 id="privacy-title">
          Your traffic.<br>Your business.
        </h2><a
          href="/explanation/privacy-model" class="home-text-link"
        >Read the privacy model <i
          class="i-lucide-arrow-up-right" aria-hidden="true"
        /></a>
      </BlurReveal>
      <div class="privacy-details">
        <div><i class="i-lucide-hard-drive" aria-hidden="true" /><h3>A setup that stays with you.</h3><p>Profiles and settings are stored locally in your extension. Headerly does not automatically upload them.</p></div>
        <div><i class="i-lucide-route" aria-hidden="true" /><h3>The browser does the work.</h3><p>Rules run through the browser’s built-in engine. Headerly does not proxy traffic or read request and response bodies.</p></div>
      </div>
    </section>

    <BlurReveal as="section" class="home-comparison" aria-labelledby="comparison-title">
      <div>
        <p class="home-label">
          03 — FIND YOUR FIT
        </p>
        <h2 id="comparison-title">
          The right tool<br>for your kind of work.
        </h2>
      </div>
      <div class="comparison-details">
        <p>Change a header right in the popup. Keep reusable rules close at hand. See how Headerly’s focused workflow compares with a full debugging toolkit.</p>
        <a href="/explanation/compare-tools" class="home-text-link">
          Compare the tools <i class="i-lucide-arrow-up-right" aria-hidden="true" />
        </a>
      </div>
      <ComparisonTable />
    </BlurReveal>

    <section class="home-start" aria-labelledby="start-title">
      <div>
        <p
          class="home-label"
        >
          YOURS TO CONFIGURE
        </p><h2 id="start-title">
          A better workflow<br>is one click away.
        </h2>
      </div><DownloadButtons />
    </section>

    <footer class="home-footer">
      <a href="/" class="home-wordmark"><img
        src="/images/headerly.svg" alt="" width="24" height="24" class="no-zoom"
      >Headerly</a><p>A small tool for a more personal web.</p><nav aria-label="Footer">
        <a href="/start/overview">Docs</a><a href="https://github.com/headerly/headerly" target="_blank" rel="noopener noreferrer">Source <i
          class="i-lucide-arrow-up-right" aria-hidden="true"
        /></a>
      </nav>
    </footer>
  </div>
</template>
