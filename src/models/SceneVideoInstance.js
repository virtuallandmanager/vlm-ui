import { nanoid } from "nanoid";

export class SceneVideoInstance {
  id = nanoid(6);
  name = "";
  show = true;
  position = { x: 8, y: 5, z: 0 };
  scale = { x: 16, y: 9, z: 1 };
  rotation = { x: 0, y: 0, z: 0 };

  constructor() {}
}
