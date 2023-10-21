import { v4 as uuidv4 } from "uuid";

export class SceneSound {
  sk = uuidv4();
  enabled = true;
  customId = null;
  customRendering = false;
  name = "";
  audioSrc = "";
  instances = [];
  volume = 1;
  createdAt;

  constructor(config = {}) {
    this.sk = config.sk || this.sk;
    this.enabled = config.enabled || this.enabled;
    this.customId = config.customId || this.customId;
    this.customRendering = config.customRendering || this.customRendering;
    this.name = config.name || this.name;
    this.audioSrc = config.audioSrc || this.audioSrc;
    this.instances = config.instances || this.instances;
    this.volume = config.volume || this.volume;
    this.createdAt = config.createdAt || this.createdAt;
  }
}
