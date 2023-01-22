import { nanoid } from "nanoid";
import { ClickEvent } from "./ClickEvent";

export class SceneImageInstance {
  id = nanoid(12);
  customId = null;
  name = "";
  show = true;
  withCollisions = false;
  position = { x: 8, y: 1, z: 8 };
  scale = { x: 1, y: 1, z: 1 };
  rotation = { x: 0, y: 0, z: 0 };
  clickEvent = {...new ClickEvent(), synced: true};
  showDetails = true;

  constructor() {}

  getId = () => {
    return this.customId || this.id;
  };
}
