import userClientConfig from "~doain/clientConfig";

import { CharrueLayout } from "@charrue/layout-next";
import { defineComponent, ref } from "vue";
import { RouterView } from "vue-router";

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
    const layoutConfig = userClientConfig.layout || ({} as any);

    return (
      <div class="global-layout-container">
        <CharrueLayout
          v-model={[this.collapse, "collapse"]}
          data={layoutConfig.data}
          sidebarWidth={layoutConfig.sidebarWidth}
          title={layoutConfig.title}
          logo={layoutConfig.logo}
          layout={layoutConfig.layout}
        >
          {{
            "header-right": () => <HeaderRight />,
            default: () => <RouterView></RouterView>,
            "content-header": () =>
              userClientConfig?.enableNavigationTab ? <NavigationTab></NavigationTab> : [],
          }}
        </CharrueLayout>
      </div>
    );
  },
});
