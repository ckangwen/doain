import userClientConfig from "~doain/clientConfig";

import { CharrueLayout } from "@charrue/layout-next";
import { DoainClientConfig } from "@doain/toolkit";
import { KeepAlive, Transition, defineComponent, ref } from "vue";
import { RouterView, useRouter } from "vue-router";

import HeaderRight from "./HeaderRight";
import { NavigationTab } from "./NavigationTab/index";

export const DefaultLayout = defineComponent({
  name: "DefaultLayout",
  setup() {
    const collapse = ref(false);
    return {
      collapse,
    };
  },
  render() {
    const layoutConfig: DoainClientConfig["layout"] = userClientConfig.layout;
    const keepAliveRoutes = useRouter()
      .getRoutes()
      .filter((route) => route.meta?.keepAlive)
      ?.map((item: any) => {
        return item?.components?.default?.__name;
      })
      ?.filter((name) => name);

    return (
      <div class="global-layout-container">
        <CharrueLayout
          {...layoutConfig}
          v-model={[this.collapse, "collapse"]}
          class={userClientConfig?.enableNavigationTab ? "" : "navigation-tab--hidden"}
        >
          {{
            "header-right": () => <HeaderRight />,
            default: () => (
              <RouterView>
                {{
                  default({ Component }: { Component: any }) {
                    return (
                      <Transition name={layoutConfig.transitionName} mode="out-in">
                        <KeepAlive include={keepAliveRoutes}>
                          <Component />
                        </KeepAlive>
                      </Transition>
                    );
                  },
                }}
              </RouterView>
            ),
            "content-header": () =>
              userClientConfig?.enableNavigationTab ? <NavigationTab></NavigationTab> : [],
          }}
        </CharrueLayout>
      </div>
    );
  },
});
