import { App } from "vue";
import { vConfirm } from "./confirm";

export default (app: App) => {
  app.directive('confirm', vConfirm);
}