<route lang="yaml">
meta:
  layout: pure
</route>
<script lang="ts" setup>
import { CharrueSchemaForm } from "@charrue/schema-form-next";

import { useLogin } from "./useLogin";

const { formValue, loading, disabled, formSchema, formRules, doLogin } = useLogin();
</script>

<template>
  <div class="login-page">
    <div class="main-content">
      <div class="main-content-left">
        <!--  -->
      </div>
      <div class="main-content-right">
        <div class="main-content-right-inner">
          <CharrueSchemaForm
            ref="loginFormRef"
            v-model="formValue"
            :schema="formSchema"
            :rules="formRules"
            class="form-container"
            label-width="100px"
          >
            <template #extra>
              <!--  -->
              <el-form-item class="w-full">
                <el-button
                  :disabled="disabled"
                  :loading="loading"
                  class="w-full"
                  type="primary"
                  @click="doLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </template>
          </CharrueSchemaForm>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import "./index.scss";
</style>
