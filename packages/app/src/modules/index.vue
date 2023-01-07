<script lang="ts" setup>
import { getToken, useUserData } from "@doain/client";

const token = getToken();
const userData = useUserData();
const userDataDisplayValue = computed(() => JSON.stringify(userData.value, null, 2));
</script>

<template>
  <DefaultPageContainer>
    <h1>Home</h1>
    <p>Token: {{ token }}</p>
    <div>
      <p>userData</p>
      <pre>{{ userDataDisplayValue }}</pre>
    </div>
  </DefaultPageContainer>
</template>
