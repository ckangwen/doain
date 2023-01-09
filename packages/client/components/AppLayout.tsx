import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export const AppLayout = defineComponent({
  name: "DoainAppLayout",
  setup() {
    return () => (
      <ElConfigProvider locale={zhCn}>
        <RouterView />
      </ElConfigProvider>
    );
  },
});
