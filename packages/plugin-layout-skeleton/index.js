import { definePlugin } from "doain/plugin";

const styleContent = `.doain-skeleton-root {
  height: 100vh;
  width: 100vw;
  background-color: #fff;
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: 60px 1fr;
}
.doain-skeleton-root .doain-skeleton {
  --el-skeleton-color: #f0f2f5;
  --el-skeleton-to-color: #e6e8eb;
  background: linear-gradient(
    90deg,
    var(--el-skeleton-color) 25%,
    var(--el-skeleton-to-color) 37%,
    var(--el-skeleton-color) 63%
  );
  background-size: 400% 100%;
  animation: doain-skeleton-loading 1.4s ease infinite;
}
.doain-skeleton-root .ds-sidebar {
  grid-row: 1 / 3;
  grid-column: 1 / 2;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 12px 0;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
}
.doain-skeleton-root .ds-sidebar .ds-logo-container {
  height: 50px;
  width: 100%;
  padding: 0 20px 12px 20px;
}
.doain-skeleton-root .ds-sidebar .ds-logo-container .ds-title {
  height: 20px;
  width: 80%;
}
.doain-skeleton-root .ds-sidebar .ds-menu-container {
  flex: 1;
}
.doain-skeleton-root .ds-sidebar .ds-menu-container .ds-menu-item {
  height: 44px;
  width: 100%;
  margin-bottom: 8px;
}
.doain-skeleton-root .ds-header {
  grid-row: 1 / 2;
  grid-column: 2 / 3;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  box-sizing: border-box;
}
.doain-skeleton-root .ds-header .ds-header-left {
  display: flex;
  align-items: center;
  padding-left: 24px;
  padding-right: 24px;
  height: 100%;
}
.doain-skeleton-root .ds-header .ds-header-left .ds-collapse-trigger {
  width: 30px;
  height: 30px;
}
.doain-skeleton-root .ds-header .ds-header-right {
  height: 30px;
  width: 120px;
}
.doain-skeleton-root .ds-content {
  background-color: #f5f7f9;
  box-sizing: border-box;
  padding: 20px;
}
.doain-skeleton-root .ds-content .ds-body {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  padding: 20px 30px;
  box-sizing: border-box;
}
.doain-skeleton-root .ds-content .ds-body .ds-form {
  height: 80px;
  width: 100%;
  margin-bottom: 26px;
}
.doain-skeleton-root .ds-content .ds-body .ds-table {
  height: 400px;
  width: 100%;
}
@keyframes doain-skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}`.replace("\r\n", "");

const htmlContent = `<div class="doain-skeleton-root">
<div class="ds-sidebar">
  <div class="ds-logo-container">
    <div class="ds-title doain-skeleton"></div>
  </div>
  <div class="ds-menu-container">
    <div class="ds-menu-item doain-skeleton"></div>
    <div class="ds-menu-item doain-skeleton"></div>
    <div class="ds-menu-item doain-skeleton"></div>
    <div class="ds-menu-item doain-skeleton"></div>
  </div>
</div>
<div class="ds-header">
  <div class="ds-header-left">
    <div class="ds-collapse-trigger doain-skeleton"></div>
  </div>
  <div class="ds-header-right doain-skeleton"></div>
</div>
<div class="ds-content">
  <div class="ds-body">
    <div class="ds-form doain-skeleton"></div>
    <div class="ds-table doain-skeleton"></div>
  </div>
</div>
</div>`.replace("\r\n", "");

export default definePlugin(() => {
  return {
    name: "doain-plugin-layout-skeleton",
    html: {
      content: htmlContent,
      head: [["style", { type: "text/css" }, styleContent]],
    },
  };
});
