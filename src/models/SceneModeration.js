export class SceneModeration {
  allowCertainWearables = false;
  banCertainWearables = false;
  banCertainNames = false;
  banBugs = false;
  banRoaches = false;
  banFlies = false;
  allowedWearables = [{ contractId: "", itemId: "" }];
  bannedWearables = [{ contractId: "", itemId: "" }];
  allowedUsers = [{ walletAddress: "", displayName: "" }];
  bannedUsers = [{ walletAddress: "", displayName: "" }];
  banActions = [EBanActions.BLACKOUT];
  allowActions = [EAllowActions.MOVE];

  constructor() {}
}

export const EBanActions = {
  WALL: 0,
  BLACKOUT: 1
};

export const EBanWallTypes = {
  BLACK: 0,
  INVISIBLE: 1,
  MIRROR: 2
};

export const EAllowActions = {
  MOVE: 0
};
