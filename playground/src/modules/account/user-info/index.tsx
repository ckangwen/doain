import { useUserData } from "@doain/toolkit";

export default defineComponent({
  name: "UserInfoPage",
  setup() {
    const userData = useUserData();

    return {
      userData,
    };
  },
  render() {
    return (
      <div class="w-full bg-white p-4 box-border">
        <div>Username: {this.userData.username}</div>
      </div>
    );
  },
});
