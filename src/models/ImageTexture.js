import { nanoid } from "nanoid";
import { ImageInstance } from "./ImageInstance";

export class ImageTexture {
  id = nanoid(6);
  show = true;
  name = "";
  imageLink = "";
  clickEvent = {
    type: 0,
    externalLink: "",
    sound: "",
    moveTo: "",
    teleportTo: ""
  };
  instances = [new ImageInstance()];

  constructor() {}
}
