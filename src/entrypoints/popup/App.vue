<template>
  <div
    class="flex h-120 w-150 items-center justify-center outline-2"
  >
    <RouterView v-slot="{ Component, route }">
      <Transition
        enter-active-class="transition-all duration-150 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
        mode="out-in"
      >
        <Component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>
</template>
