<script lang="ts" setup>
import { DUpload } from "@doain/toolkit";

const imageUrl = "https://s2.loli.net/2023/01/12/a4ImQMsgHkbxtJL.jpg";
</script>

<template>
  <DUpload v-model="imageUrl" />
</template>
