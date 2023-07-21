export class ClickEvent {
  type = 0;
  showFeedback = "";
  hoverText = "";
  externalLink = "";
  sound = "";
  moveTo = {
    position: { x: 0, y: 0, z: 0 },
    cameraTarget: { x: 0, y: 0, z: 0 },
    setCameraTarget: false,
  };
  teleportTo = "";

  constructor(config = {}) {
    Object.keys(config).forEach((key) => {
      this[key] = config[key];
    });
  }
}

export const EClickEventContext = {
  group: 0,
  instance: 1,
};

export const EClickEventType = {
  none: 0,
  trackingOnly: 1,
  externalLink: 2,
  sound: 3,
  stream: 4,
  moveTo: 5,
  teleportTo: 6,
};

export const EClickEventDashText = {
  0: "No Click Event",
  1: "Website Link",
  2: "Tracking Only",
  3: "Plays Sound",
  4: "Controls Stream",
  5: "Move Player",
  6: "Teleport Player",
};
