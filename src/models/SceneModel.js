import { v4 as uuidv4 } from "uuid";
import { ClickEvent } from "./ClickEvent";

export class SceneModel {
  sk = uuidv4();
  enabled = true;
  customId = null;
  customRendering = false;
  name = "";
  modelSrc = "";
  instances = [];
  clickEvent = new ClickEvent();
  createdAt;

  constructor(config = {}) {
    this.sk = config.sk || this.sk;
    this.enabled = config.enabled || this.enabled;
    this.customId = config.customId || this.customId;
    this.customRendering = config.customRendering || this.customRendering;
    this.name = config.name || this.name;
    this.modelSrc = config.modelSrc || this.modelSrc;
    this.instances = config.instances || this.instances;
    this.volume = config.volume || this.volume;
    this.clickEvent = config.clickEvent || this.clickEvent;
    this.createdAt = config.createdAt || this.createdAt;
  }
}
