import { userRegisterApp } from "@doain/toolkit";
import "doain/index.css";

export default userRegisterApp({
  setup() {
    console.log("registerApp");
  },
  onAppReady() {
    console.log("onAppReady");
  },
});
