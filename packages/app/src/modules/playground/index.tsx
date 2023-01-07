import { DefaultPageContainer } from "~components";

import { createDialog } from "@doain/client";
import { ElButton } from "element-plus";
import { defineComponent } from "vue";

import { Demo } from "./Demo";
import innerForm from "./InnerForm";

export default defineComponent({
  name: "Playground",
  setup() {
    const [DialogComponent, { open }] = createDialog(innerForm, {
      width: "500px",
    });

    const onOpen = () => {
      open({ queryId: 111, content: "Hello" });
    };

    return () => (
      <DefaultPageContainer>
        <div class="playground">
          <h1>Playground</h1>
          <Demo></Demo>
          <Demo timeout={500}></Demo>
          <Demo timeout={2000}></Demo>
          <ElButton onClick={onOpen}>open</ElButton>

          <DialogComponent></DialogComponent>
        </div>
      </DefaultPageContainer>
    );
  },
});
