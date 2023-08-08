import { v4 as uuidv4 } from "uuid";
import { ClickEvent } from "./ClickEvent";

export class SceneImageInstance {
  sk = uuidv4();
  customId = null;
  name = "";
  enabled = true;
  withCollisions = false;
  position = { x: 8, y: 1, z: 8 };
  scale = { x: 1, y: 1, z: 1 };
  rotation = { x: 0, y: 0, z: 0 };
  clickEvent = { ...new ClickEvent(), synced: true };

  constructor(config = {}) {
    this.sk = config.sk || this.sk;
    this.customId = config.customId || this.customId;
    this.name = config.name || this.name;
    this.enabled = config.enabled || this.enabled;
    this.withCollisions = config.withCollisions || this.withCollisions;
    this.position = config.position || this.position;
    this.scale = config.scale || this.scale;
    this.rotation = config.rotation || this.rotation;
    this.clickEvent = config.clickEvent || this.clickEvent;
  }

  getId = () => {
    return this.customId || this.id;
  };
}
