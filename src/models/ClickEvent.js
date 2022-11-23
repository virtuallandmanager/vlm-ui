export class ClickEvent {
  type = 0;
  showFeedback = "";
  hoverText = "";
  externalLink = "";
  sound = "";
  moveTo = {
    position: { x: 0, y: 0, z: 0 },
    cameraTarget: { x: 0, y: 0, z: 0 },
  };
  teleportTo = "";
  synced = false;

  constructor() {}
}
