import { nanoid } from "nanoid";
import { ClickEvent } from "./ClickEvent";

export class VideoInstance {
  id = nanoid(6);
  name = "";
  show = true;
  position = { x: 0, y: 0, z: 0 };
  scale = { x: 1, y: 1, z: 1 };
  rotation = { x: 0, y: 0, z: 0 };
  type = 0;
  offType = 1;

  constructor() {}
}
