import { nanoid } from "nanoid";
import { ClickEvent } from "./ClickEvent";

export class SceneImage {
  id = nanoid(6);
  customId = null;
  show = true;
  name = "";
  imageLink = "";
  emission = 1;
  clickEvent = new ClickEvent();
  instances = [];
  isTransparent = false;
  withCollisions = false;

  constructor() {}
}
