import { v4 as uuidv4 } from 'uuid'
import { ClickEvent } from './ClickEvent'

export class SceneImage {
  sk = uuidv4()
  customId = null
  enabled = true
  name = ''
  height
  width
  density
  imageSrc = ''
  textureSrc = ''
  thumbnailSrc = ''
  emission = 1
  clickEvent = new ClickEvent()
  instances = []
  isTransparent = false
  withCollisions = false
  createdAt

  constructor(config = {}) {
    this.sk = config.sk || this.sk
    this.customId = config.customId || this.customId
    this.enabled = config.enabled || this.enabled
    this.name = config.name || this.name
    this.height = config.height
    this.width = config.width
    this.density = config.density
    this.imageSrc = config.imageSrc || this.imageSrc
    this.textureSrc = config.textureSrc || this.textureSrc
    this.thumbnailSrc = config.thumbnailSrc || this.thumbnailSrc
    this.emission = config.emission || this.emission
    this.clickEvent = config.clickEvent || this.clickEvent
    this.instances = config.instances || this.instances
    this.isTransparent = config.isTransparent || this.isTransparent
    this.withCollisions = config.withCollisions || this.withCollisions
    this.createdAt = config.createdAt || this.createdAt
  }
}
