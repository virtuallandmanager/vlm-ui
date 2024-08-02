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

export class GiveawayClaimPoint {
  sk = uuidv4()
  customId = null
  customRendering = false
  name = ''
  enabled = true
  giveawayId = null
  properties = { hoverText: 'Claim Item', hoverTextEnabled: true }
  instances = []

  constructor(config = {}) {
    this.sk = config?.sk || this.sk
    this.customId = config?.customId || this.customId
    this.customRendering = config?.customRendering || this.customRendering
    this.name = config?.name || this.name
    this.enabled = config?.enabled || this.enabled
    this.giveawayId = config?.giveawayId || null
    this.properties = config?.properties || this.properties
    this.instances = config?.instances || []
  }
}
