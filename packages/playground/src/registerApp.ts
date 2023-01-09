import { userRegisterApp } from "@doain/client";
import "@doain/client/dist/style.css";

export default userRegisterApp({
  setup() {
    console.log("setup");
  },
  onAppReady(context) {
    console.log(context);
  },
});
