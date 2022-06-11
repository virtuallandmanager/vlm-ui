import { nanoid } from "nanoid";
import { ClickEvent } from "./ClickEvent";

export class SceneImageInstance {
  id = nanoid(6);
  name = "";
  show = true;
  position = { x: 0, y: 0, z: 0 };
  scale = { x: 1, y: 1, z: 1 };
  rotation = { x: 0, y: 0, z: 0 };
  clickEvent = new ClickEvent();

  constructor() {}
}
