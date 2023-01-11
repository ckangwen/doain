import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export const GlobalPureLayout = defineComponent({
  name: "GlobalPureLayout",
  render() {
    return (
      <div class="global-pure-layout">
        <RouterView></RouterView>
      </div>
    );
  },
});
