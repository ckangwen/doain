<script setup lang="ts">
import { useRouter } from "vue-router";

const value = ref();
const keepAliveRoutes = useRouter()
  .getRoutes()
  .filter((route) => route.meta?.keepAlive)
  ?.map((route) => {
    if (typeof route.name === "string") return route.name;
    return "";
  })
  ?.filter((name) => name);
console.log(keepAliveRoutes);
</script>

<template>
  <div class="h-full">
    <h1>Demo01</h1>

    <el-input v-model="value" />
  </div>
</template>

<route>
  {
    meta: {
      keepAlive: true
    }
  }
  </route>
