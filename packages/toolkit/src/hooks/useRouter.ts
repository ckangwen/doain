import { getCurrentInstance } from "vue";
import { useRouter as useVueRouter } from "vue-router";

export const useRouter = () => {
  const router = useVueRouter();
  if (router) return router;

  const instance = getCurrentInstance();
  if (instance) {
    return instance.proxy?.$router;
  }
  console.error("请在setup中使用useRouter");
  return null;
};
