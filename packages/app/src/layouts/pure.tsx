import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export default defineComponent({
  name: "GlobalPureLayout",
  render() {
    return (
      <div>
        <RouterView></RouterView>
      </div>
    );
  },
});
