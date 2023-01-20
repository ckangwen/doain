// import { describe, expect, test } from "vitest";

// describe("GlobalDoainConfig", () => {
//   test("should get the latest value", () => {
//     const globalConfig = _getDoainConfig();

//     expect(globalConfig.app).toEqual({
//       appKey: "doain-admin",
//       storageKey: "doain-admin",
//     });

//     setDoainConfig("app", {
//       appKey: "doain-admin-new",
//       storageKey: "doain-admin-new",
//     });

//     expect(globalConfig.app).toEqual({
//       appKey: "doain-admin-new",
//       storageKey: "doain-admin-new",
//     });
//   });

//   test("subscribe", () => {
//     subscribeDoainConfigKey("app", (config) => {
//       expect(config).toEqual({
//         appKey: "doain-admin-new",
//         storageKey: "doain-admin-new",
//       });
//     });

//     setDoainConfig("app", {
//       appKey: "doain-admin-new",
//       storageKey: "doain-admin-new",
//     });
//   });
// });
