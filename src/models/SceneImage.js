import { nanoid } from "nanoid";
import { ClickEvent } from "./ClickEvent";

export class SceneImage {
  id = nanoid(6);
  customId = null;
  show = true;
  name = "";
  imageLink = "";
  clickEvent = new ClickEvent();
  instances = [];
  isTransparent = false;
  hasCollider = false;

  constructor() {}

  getId = () => {
    return this.customId || this.id
  }
}
