import { nanoid } from "nanoid";

export class SceneEvent {
  id = nanoid();
  name = "";
  baseParcel = "";
  startDateTime = "";
  endDateTime = "";
  totalClaimLimit = 0;
  giveaways = [];
  constructor(config) {
    if (config) {
      Object.keys(config).forEach((key) => {
        this[key] = config[key];
      });
    }
  }
}
