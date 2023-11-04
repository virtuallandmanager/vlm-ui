import { v4 as uuidv4 } from "uuid";
import { ClickEvent } from "./ClickEvent";

export class SceneVideoInstance {
  sk = uuidv4();
  customId = null;
  name = "";
  enabled = true;
  position = { x: 8, y: 9 / 2, z: 8 };
  scale = { x: 16 / 2, y: 9 / 2, z: 1 };
  rotation = { x: 0, y: 0, z: 0 };
  withCollisions = false;
  clickEvent = { ...new ClickEvent(), synced: true };

  constructor(config = {}) {
    this.sk = config.sk || this.sk;
    this.customId = config.customId || this.customId;
    this.name = config.name || this.name;
    this.enabled = config.enabled || this.enabled;
    this.position = config.position || this.position;
    this.scale = config.scale || this.scale;
    this.rotation = config.rotation || this.rotation;
    this.withCollisions = config.withCollisions || this.withCollisions;
    this.clickEvent = config.clickEvent || this.clickEvent;
  }
}
