import { nanoid } from "nanoid";
import { ClickEvent } from "./ClickEvent";
import { SceneImageInstance } from "./SceneImageInstance";

export class SceneImage {
  id = nanoid(6);
  show = true;
  name = "";
  imageLink = "";
  clickEvent = new ClickEvent();
  instances = [new SceneImageInstance()];
  isTransparent = false;

  constructor() {}
}
