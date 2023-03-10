import userClientConfig from "~doain/clientConfig";

import { removeToken, useUserData, useUserStore } from "@doain/toolkit";
import { useFullscreen } from "@vueuse/core";
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from "element-plus";
import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";

enum UserAction {
  Logout = "logout",
}

const HeaderRight = defineComponent({
  name: "DefaultLayoutHeaderRight",
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const userData = useUserData();

    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
    const username = computed(() => userData.value.username);

    const onLogout = () => {
      removeToken();
      userStore.clearUserInfo();

      const loginRoute = userClientConfig?.router?.loginRoute;
      if (loginRoute) {
        router.push(loginRoute);
      }
    };

    const onCommand = (command: UserAction) => {
      if (command === UserAction.Logout) {
        onLogout();
      }
    };

    return {
      username,
      isFullscreen,

      toggleFullscreen,
      onCommand,
    };
  },
  render() {
    return (
      <div class="h-full flex items-center ml-3">
        <div class="header-action">
          <i class="ri-search-line"></i>
        </div>
        <div class="header-action" onClick={this.toggleFullscreen}>
          <i class={this.isFullscreen ? "ri-fullscreen-exit-line" : "ri-fullscreen-line"}></i>
        </div>
        <ElDropdown class="ml-4" onCommand={this.onCommand}>
          {{
            default: () => (
              <div class="cursor-pointer">
                <span class="login-name font-bold">{this.username}</span>
              </div>
            ),
            dropdown: () => (
              <ElDropdownMenu>
                <ElDropdownItem command={UserAction.Logout}>退出登录</ElDropdownItem>
              </ElDropdownMenu>
            ),
          }}
        </ElDropdown>
      </div>
    );
  },
});

export default HeaderRight;
