import { nanoid } from "nanoid";
import { ClickEvent } from "./ClickEvent";
import { ImageInstance } from "./ImageInstance";

export class ImageTexture {
  id = nanoid(6);
  show = true;
  name = "";
  imageLink = "";
  clickEvent = new ClickEvent();
  instances = [new ImageInstance()];
  isTransparent = false;

  constructor() {}
}
