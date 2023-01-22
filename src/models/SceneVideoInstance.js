import { nanoid } from "nanoid";

export class SceneVideoInstance {
  id = nanoid(12);
  name = "";
  show = true;
  position = { x: 8, y: 5, z: 0 };
  scale = { x: 16/2, y: 9/2, z: 1 };
  rotation = { x: 0, y: 0, z: 0 };
  withCollisions = false;

  constructor() {}
}
