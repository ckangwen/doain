import { defineComponent } from "vue";

export default defineComponent({
  name: "NavigationTabItem",
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
    closable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["close", "click"],
  render() {
    return (
      <div class={`cl-navigation-tab ${this.isActive ? "cl-navigation-tab--active" : ""}`}>
        <div class="cl-navigation-tab__slot" onClick={() => this.$emit("click")}>
          {{
            default: () => this.$slots.default?.(),
          }}
        </div>
        {this.closable && (
          <div class="cl-navigation-tab__close" onClick={() => this.$emit("close")}>
            <i class="ri-close-line"></i>
          </div>
        )}
      </div>
    );
  },
});
