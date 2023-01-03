import { defineComponent } from "vue";

const DefaultPageContainer = defineComponent({
  name: "DefaultPageContainer",
  render() {
    return <div class="w-full h-full bg-white px-4 py-4">{{ ...this.$slots }}</div>;
  },
});

export default DefaultPageContainer;
