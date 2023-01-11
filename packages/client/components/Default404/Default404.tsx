import { getDoainConfig, subscribeDoainConfigKey } from "~toolkit";

import { defineComponent, ref } from "vue";
import { RouterLink } from "vue-router";

export const Default404 = defineComponent({
  name: "Default404",
  setup() {
    const homeRoute = ref(getDoainConfig().router.homeRoute);
    subscribeDoainConfigKey("router", (config) => {
      if (config.homeRoute && homeRoute.value !== config.homeRoute) {
        homeRoute.value = config.homeRoute;
      }
    });

    return {
      homeRoute,
    };
  },
  render() {
    return (
      <div class="page-not-found-container">
        <div class="pnf-container">
          <div class="pnf-block">
            <img src="https://s2.loli.net/2023/01/11/7ujk4K2gv8JcyCS.png" class="pnf-404-image" />
          </div>
          <div class="pnf-block pnf-block-column">
            <h1>404</h1>
            <h2>UH OH! 页面丢失</h2>
            <p>您所寻找的页面不存在。你可以点击下面的按钮，返回主页。</p>
            <RouterLink to={this.homeRoute}>
              <button class="pnf-back">返回首页</button>
            </RouterLink>
          </div>
        </div>
      </div>
    );
  },
});
