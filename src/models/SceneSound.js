import { v4 as uuidv4 } from "uuid";

export class SceneSound {
  sk = uuidv4();
  customId = null;
  enabled = true;
  name = "";
  soundSrc = "";
  instances = [];
  volume = 1;
  createdAt;

  constructor(config = {}) {
    this.sk = config.sk || this.sk;
    this.customId = config.customId || this.customId;
    this.enabled = config.enabled || this.enabled;
    this.name = config.name || this.name;
    this.soundSrc = config.soundSrc || this.soundSrc;
    this.instances = config.instances || this.instances;
    this.volume = config.volume || this.volume;
    this.createdAt = config.createdAt || this.createdAt;
  }
}
