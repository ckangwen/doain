import elementResizeDetectorMaker from "element-resize-detector";
import { Ref, computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getDoainConfig } from "../../../config/index";
import { createLocalStorage } from "../../../helpers/index";
import { NormalizedRouteData, formatNormalizedRoute } from "./shared";
import { useNavigationTabStore } from "./useNavigationTabStore";

const globalConfig = getDoainConfig();
const SCROLL_AMPLITUDE = 20;
const getTabKey = (routeFullPath: string) => `tag-${routeFullPath.split("/").join("-")}`;

const useNavigationTabDom = (activeKey: Ref<string>) => {
  /**
   * 可滚动区域
   */
  const tabScrollRef = ref();
  /**
   * 标签页容器
   */
  const tabContentRef = ref();
  /**
   * 是否可滚动
   */
  const scrollable = ref(true);

  const updateNavScroll = async (autoScroll?: boolean) => {
    await nextTick();
    if (!tabScrollRef.value) return;

    const containerWidth = tabScrollRef.value.offsetWidth;
    const navWidth = tabScrollRef.value.scrollWidth;

    if (containerWidth < navWidth) {
      scrollable.value = true;
      if (autoScroll) {
        const tabItemElList = tabScrollRef.value.querySelectorAll(".tabs-card-scroll-item") || [];
        [...tabItemElList].forEach((tabEl: HTMLElement) => {
          if (tabEl.id === getTabKey(activeKey.value)) {
            tabEl.scrollIntoView?.();
          }
        });
      }
    } else {
      scrollable.value = false;
    }
  };

  /**
   * @param value 要滚动到的位置
   * @param amplitude 每次滚动的长度
   */
  const scrollTo = (value: number, amplitude: number) => {
    const currentScroll = tabScrollRef.value.scrollLeft;
    const scrollWidth =
      (amplitude > 0 && currentScroll + amplitude >= value) ||
      (amplitude < 0 && currentScroll + amplitude <= value)
        ? value
        : currentScroll + amplitude;

    tabScrollRef.value?.scrollTo?.(scrollWidth, 0);

    if (scrollWidth === value) return;

    window.requestAnimationFrame(() => scrollTo(value, amplitude));
  };

  /**
   * 向左滚动
   */
  const scrollPrev = () => {
    const containerWidth = tabScrollRef.value.offsetWidth;
    const currentScroll = tabScrollRef.value.scrollLeft;

    if (!currentScroll) return;

    const scrollLeft = currentScroll > containerWidth ? currentScroll - containerWidth : 0;
    scrollTo(scrollLeft, (scrollLeft - currentScroll) / SCROLL_AMPLITUDE);
  };

  const scrollNext = () => {
    const containerWidth = tabScrollRef.value.offsetWidth;
    const navWidth = tabScrollRef.value.scrollWidth;
    const currentScroll = tabScrollRef.value.scrollLeft;

    if (navWidth - currentScroll <= containerWidth) return;

    const scrollLeft =
      navWidth - currentScroll > containerWidth * 2
        ? currentScroll + containerWidth
        : navWidth - containerWidth;

    scrollTo(scrollLeft, (scrollLeft - currentScroll) / SCROLL_AMPLITUDE);
  };

  const onElementResize = () => {
    const observer = elementResizeDetectorMaker();
    if (tabContentRef.value) {
      observer.listenTo(tabContentRef.value, () => {
        updateNavScroll();
      });
    }
  };

  return {
    scrollable,
    tabScrollRef,
    tabContentRef,
    updateNavScroll,
    onElementResize,
    scrollPrev,
    scrollNext,
  };
};

const useNavigationTabEvents = (activeKey: Ref<string>) => {
  const tabViewStore = useNavigationTabStore();
  const router = useRouter();

  const openPage = (routeData: NormalizedRouteData) => {
    const { fullPath } = routeData;
    if (activeKey.value === fullPath) return;
    activeKey.value = fullPath;
    router.push(fullPath);
  };

  const closePage = (routeData: NormalizedRouteData) => {
    const openedTab = tabViewStore.opened;
    if (openedTab.length === 1) {
      return;
    }

    const isCurrentPage = activeKey.value === routeData.fullPath;
    const currentIndex = openedTab.findIndex((item) => item.fullPath === routeData.fullPath);
    if (isCurrentPage) {
      // 如果是最后一个标签页，关闭当前标签页后，激活前一个标签页
      // 如果不是最后一个标签页，关闭当前标签页后，激活后一个标签页
      const nextIndex = currentIndex === openedTab.length - 1 ? currentIndex - 1 : currentIndex + 1;
      const nextRouteData = openedTab[nextIndex];
      tabViewStore.close(routeData, "current");
      router.push(nextRouteData.fullPath);
    } else {
      tabViewStore.close(routeData, "current");
    }
  };

  return {
    openPage,
    closePage,
  };
};

export const useNavigationTab = () => {
  const router = useRouter();
  const route = useRoute();
  const lStorage = createLocalStorage();
  const currentNormalizedRoute = computed(() => formatNormalizedRoute(route));

  // 当前高亮的标签页
  const activeKey = ref(currentNormalizedRoute.value.fullPath);

  const tabViewStore = useNavigationTabStore();
  // 如果只有一个标签页，不显示关闭按钮
  const closable = computed(() => tabViewStore.opened.length > 1);

  const {
    scrollable,
    tabScrollRef,
    tabContentRef,
    updateNavScroll,
    onElementResize,

    scrollPrev,
    scrollNext,
  } = useNavigationTabDom(activeKey);

  const { openPage, closePage } = useNavigationTabEvents(activeKey);

  const init = () => {
    const allRoutes = router.getRoutes();

    tabViewStore.init(
      allRoutes.filter((item) => item.meta?.[globalConfig.layout.ignoreNavigationTabKey] !== false),
    );
    tabViewStore.loadOpened(currentNormalizedRoute.value);

    watch(
      () => route.fullPath,
      () => {
        activeKey.value = route.fullPath;
        tabViewStore.add(route);
        updateNavScroll(true);
      },
      { immediate: true },
    );

    onMounted(() => {
      onElementResize();
    });

    window.addEventListener("beforeunload", () => {
      lStorage.set(globalConfig.layout.tabViewStorageName, JSON.stringify(tabViewStore.opened));
    });
  };

  init();

  return {
    tabContentRef,
    tabScrollRef,

    closable,
    activeKey,
    scrollable,

    navigationTabList: tabViewStore.opened,

    openPage,
    closePage,

    scrollPrev,
    scrollNext,
  };
};
