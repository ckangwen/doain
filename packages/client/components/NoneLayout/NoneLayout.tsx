import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export const NoneLayout = defineComponent({
  name: "NoneLayout",
  render() {
    return (
      <div class="global-none-layout">
        <RouterView></RouterView>
      </div>
    );
  },
});
