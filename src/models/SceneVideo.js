import { nanoid } from "nanoid";

export class SceneVideo {
  id = nanoid(6);
  customId = "";
  type = 0;
  offType = 1;
  liveLink = "";
  playlist = [""];
  offImageLink = "";
  emission = 1;
  volume = 1;
  instances = [];
  show = true;
  withCollisions = false;

  constructor() {}
}
