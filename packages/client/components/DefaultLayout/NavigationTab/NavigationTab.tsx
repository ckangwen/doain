import { defineComponent } from "vue";

import TabItem from "./TabItem";
// import Draggable from "vuedraggable";
import { useNavigationTab } from "./useNavigationTab";

export const NavigationTab = defineComponent({
  name: "NavigationTab",
  setup() {
    const state = useNavigationTab();

    return state;
  },
  render() {
    return (
      <div class="cl-navigation-tab-view">
        <div class="cl-navigation-tab-group">
          <div
            ref="tabContentRef"
            class={`cl-navigation-tab-content ${
              this.scrollable ? "cl-navigation-tab-content--scrollable" : ""
            }`}
          >
            <span class="cl-navigation-tab-content__prev" onClick={this.scrollPrev}>
              <i class="ri-arrow-left-s-line"></i>
            </span>
            <span class="cl-navigation-tab-content__next" onClick={this.scrollNext}>
              <i class="ri-arrow-right-s-line"></i>
            </span>

            <div ref="tabScrollRef" class="cl-navigation-tab-scroll">
              <div class="cl-navigation-tab-scroll-inner">
                {this.navigationTabList.map((element) => (
                  <TabItem
                    isActive={this.activeKey === element.path}
                    closable={this.closable}
                    onClick={() => this.openPage(element)}
                    onClose={() => this.closePage(element)}
                  >
                    <span>{element.name}</span>
                  </TabItem>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
