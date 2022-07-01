import { nanoid } from "nanoid";
import { ClickEvent } from "./ClickEvent";

export class SceneImage {
  id = nanoid(6);
  show = true;
  name = "";
  imageLink = "";
  clickEvent = new ClickEvent();
  instances = [];
  isTransparent = false;

  constructor() {}
}
