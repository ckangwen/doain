import { CharrueLayout } from "@charrue/layout-next";
import { defineComponent, ref } from "vue";
import { RouterView } from "vue-router";

import { getDoainConfig } from "../../config/index";
import HeaderRight from "./HeaderRight";
import { NavigationTab } from "./NavigationTab/index";

export const GlobalLayout = defineComponent({
  name: "GlobalLayout",
  setup() {
    const collapse = ref(false);
    return {
      collapse,
    };
  },
  render() {
    const layoutConfig = getDoainConfig().layout;

    return (
      <div class="global-layout-container">
        <CharrueLayout
          v-model={[this.collapse, "collapse"]}
          data={layoutConfig.sidebarMenu}
          sidebarWidth={layoutConfig.sidebarWidth}
          title={layoutConfig.title}
          logo={layoutConfig.logo}
          layout={layoutConfig.layout}
        >
          {{
            "header-right": () => <HeaderRight />,
            default: () => <RouterView></RouterView>,
            "content-header": () => <NavigationTab></NavigationTab>,
          }}
        </CharrueLayout>
      </div>
    );
  },
});
