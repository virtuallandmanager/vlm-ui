import { v4 as uuidv4 } from "uuid";
import { ClickEvent } from "./ClickEvent";

export class SceneModelInstance {
  sk = uuidv4();
  customId = null;
  customRendering = false;
  parent = null;
  name = "";
  enabled = true;
  position = { x: 8, y: 1, z: 8 };
  scale = { x: 1, y: 1, z: 1 };
  rotation = { x: 0, y: 0, z: 0 };
  clickEvent = { ...new ClickEvent(), synced: true };

  constructor(config = {}) {
    this.sk = config.sk || this.sk;
    this.customId = config.customId || this.customId;
    this.customRendering = config.customRendering || this.customRendering;
    this.parent = config.parent || this.parent;
    this.name = config.name || this.name;
    this.enabled = config.enabled || this.enabled;
    this.type = config.type || this.type;
    this.position = config.position || this.position;
    this.scale = config.scale || this.scale;
    this.rotation = config.rotation || this.rotation;
    this.clickEvent = config.clickEvent || this.clickEvent;
  }
}
