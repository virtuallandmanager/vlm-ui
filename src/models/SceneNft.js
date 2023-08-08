import { v4 as uuidv4 } from "uuid";
import { ClickEvent } from "./ClickEvent";

export class SceneNft {
  sk = uuidv4();
  customId = "";
  customRendering = false;
  name = "New NFT";
  clickEvent = new ClickEvent();
  emission;
  contractAddress = "";
  tokenId = "";
  instances = [];
  parent = "";
  enabled = true;
  isTransparent;
  withCollisions;
  ts;

  constructor(config={}) {
    this.sk = config.sk || this.sk;
    this.customId = config.customId || this.customId;
    this.enabled = config.enabled || this.enabled;
    this.name = config.name || this.name;
    this.imageLink = config.imageLink || this.imageLink;
    this.offType = config.offType || this.offType;
    this.emission = config.emission || this.emission;
    this.clickEvent = config.clickEvent || this.clickEvent;
    this.contractAddress = config.contractAddress || this.contractAddress;
    this.tokenId = config.tokenId || this.tokenId;
    this.instances = config.instances || this.instances;
    this.isTransparent = config.isTransparent || this.isTransparent;
    this.withCollisions = config.withCollisions || this.withCollisions;
  }
}
