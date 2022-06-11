import { nanoid } from "nanoid";
import { SceneVideoInstance } from "./SceneVideoInstance";

export class SceneVideo {
  id = nanoid(6);
  customId = "";
  type = 0;
  offType = 1;
  liveLink = "";
  playlist = [""];
  offImage = "";
  emission = 1;
  volume = 1;
  instances = [new SceneVideoInstance()];
  show = true;

  constructor() {}
}
