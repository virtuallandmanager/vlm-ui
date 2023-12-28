import { nanoid } from 'nanoid'
import { ClickEvent } from './ClickEvent'

export class SceneVideo {
  id = nanoid(6)
  customId = ''
  name = 'New Video Screen'
  type = 0
  offType = 0
  liveSrc = ''
  playlist = ['']
  offImageSrc = ''
  clickEvent = new ClickEvent()
  emission = 1
  volume = 1
  instances = []
  enabled = true
  withCollisions = false

  constructor(config = {}) {
    this.id = config.id || this.id
    this.customId = config.customId || this.customId
    this.name = config.name || this.name
    this.type = config.type || this.type
    this.offType = config.offType || this.offType
    this.liveSrc = config.liveSrc || this.liveSrc
    this.playlist = config.playlist || this.playlist
    this.offImageSrc = config.offImageSrc || this.offImageSrc
    this.clickEvent = config.clickEvent || this.clickEvent
    this.emission = config.emission || this.emission
    this.volume = config.volume || this.volume
    this.instances = config.instances || this.instances
    this.enabled = config.enabled || this.enabled
    this.withCollisions = config.withCollisions || this.withCollisions
  }
}
