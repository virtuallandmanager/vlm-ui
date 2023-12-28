import { v4 as uuidv4 } from 'uuid'

export const ClaimPointType = {
  IMAGE: 0,
  MODEL: 1,
  MANNEQUIN: 2,
}

export const MannequinType = {
  MALE: 0,
  FEMALE: 1,
  MATCH_PLAYER: 2,
}

export class GiveawayClaimPointInstance {
  sk = uuidv4()
  customId = null
  name = ''
  enabled = true
  properties = null
  position = { x: 8, y: 0, z: 8 }
  scale = { x: 1, y: 1, z: 1 }
  rotation = { x: 0, y: 0, z: 0 }
  giveawayId = null

  constructor(config = {}) {
    this.sk = config?.sk || this.sk
    this.customId = config?.customId || this.customId
    this.name = config?.name || this.name
    this.enabled = config?.enabled || this.enabled
    this.properties = config?.properties || this.properties
    this.position = config?.position || this.position
    this.scale = config?.scale || this.scale
    this.rotation = config?.rotation || this.rotation
    this.giveawayId = config?.giveawayId || null
  }
}
