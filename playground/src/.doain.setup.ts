import { userRegisterApp } from "@doain/toolkit";
import "doain/index.css";
import "@doain/toolkit/index.css";
import "@charrue/schema-table-next/index.css";

export default userRegisterApp({
  setup() {
    console.log("registerApp");
  },
  onAppReady() {
    console.log("onAppReady");
  },
});
