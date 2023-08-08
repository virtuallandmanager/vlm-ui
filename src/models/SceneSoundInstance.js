import { v4 as uuidv4 } from "uuid";

export const SceneSoundType = {
  AMBIENT: 0,
  OMNI: 1,
  DIRECTIONAL: 2,
};

export class SceneSoundInstance {
  sk = uuidv4();
  customId = null;
  name = "";
  enabled = true;
  type = SceneSoundType.AMBIENT;
  position = { x: 8, y: 5, z: 0 };
  scale = { x: 1, y: 1, z: 1 };
  rotation = { x: 0, y: 0, z: 0 };

  constructor(config = {}) {
    this.sk = config.sk || this.sk;
    this.customId = config.customId || this.customId;
    this.name = config.name || this.name;
    this.enabled = config.enabled || this.enabled;
    this.type = config.type || this.type;
    this.position = config.position || this.position;
    this.scale = config.scale || this.scale;
    this.rotation = config.rotation || this.rotation;
  }
}
