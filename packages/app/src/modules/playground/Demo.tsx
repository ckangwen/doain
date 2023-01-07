import { httpClient } from "@effective/client";

export const Demo = defineComponent({
  name: "Demo",
  props: {
    timeout: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const content = ref("...");
    const send = async () => {
      const res = await httpClient.limitRepeatedRequest({
        url: "/client/info",
      });
      content.value = "success!";
      console.log(res);
    };

    setTimeout(() => {
      send();
    }, props.timeout);

    return () => <div>Demo {content.value}</div>;
  },
});
