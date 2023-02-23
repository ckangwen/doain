export default defineComponent({
  name: "PageContainer",
  render() {
    return <div class="bg-white w-full h-full p-4 box-border">{this.$slots.default?.()}</div>;
  },
});
