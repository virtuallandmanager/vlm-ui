<template>
  <div class="pa-1">
    <div class="d-flex">
      <div class="flex-row justify-space-between flex-grow-1">
        <mini-stat icon="mdi-axis-arrow" :stats="instance.position" />
        <mini-stat
          icon="mdi-resize"
          :stats="{ w: instance.scale.x, h: instance.scale.y }"
        />
        <mini-stat icon="mdi-rotate-360" :stats="instance.rotation" />
      </div>
    </div>
    <div class="d-flex">
      <div class="flex-row justify-space-between flex-grow-1">
        <mini-dash
          icon="mdi-mouse"
          v-if="
            instance.clickEvent &&
            (instance.clickEvent.type > 0 ||
              (!instance.clickEvent.synced && image.clickEvent.type > 0))
          "
          :stats="clickEventStats"
        />
        <mini-dash icon="mdi-tune" :stats="propertiesStats" />
      </div>
    </div>
  </div>
</template>

<script>
import { SceneImage } from '../models/SceneImage'
import { SceneImageInstance } from '../models/SceneImageInstance'
import MiniStat from './MiniStat'
import MiniDash from './MiniDash'
import { EClickEventDashText, EClickEventType } from '../models/ClickEvent'

export default {
  components: { MiniStat, MiniDash },
  name: 'QuickView',
  props: {
    property: Object,
    i: Number,
    instance: {
      type: Object,
      default: function () {
        return new SceneImageInstance()
      }
    },
    image: {
      type: Object,
      default: function () {
        return new SceneImage()
      }
    }
  },
  data: () => ({
    editingName: false
  }),
  computed: {
    clickEventStats () {
      const clickEvent = this.instance.clickEvent,
        icons = []

      if (!clickEvent) {
        return []
      }
      if (clickEvent.synced) {
        icons.push({ icon: 'mdi-cog-sync', tooltip: 'Uses Image Default' })
      }

      let clickEventDashText =
        EClickEventDashText[this.instance.clickEvent.type]

      if (clickEvent.type == EClickEventType.moveTo) {
        clickEventDashText += ` to: ${this.instance.clickEvent.moveTo.position.x}, ${this.instance.clickEvent.moveTo.position.y}, ${this.instance.clickEvent.moveTo.position.z}`
      }
      if (clickEvent.type == EClickEventType.teleportTo) {
        clickEventDashText += ` to: ${this.instance.clickEvent.teleportTo}`
      }

      icons.push({
        text: clickEventDashText,
        tooltip: 'Click Action Type'
      })

      return icons
    },
    propertiesStats () {
      const icons = []
      if (this.instance.withCollisions) {
        icons.push({ icon: 'mdi-grid', tooltip: 'Collider Enabled' })
      } else {
        icons.push({ icon: 'mdi-grid-off', tooltip: 'Collider Disabled' })
      }
      if (this.instance.customRendering) {
        icons.push({
          icon: 'mdi-cube-scan',
          tooltip: 'Custom Rendering Enabled'
        })
      }
      if (this.instance.customId) {
        icons.push({
          icon: 'mdi-variable',
          text: this.instance.customId,
          tooltip: 'Custom ID'
        })
      }
      if (this.instance.parent) {
        icons.push({
          icon: 'mdi-file-tree',
          text: this.instance.parent,
          tooltip: 'Parent'
        })
      }
      return icons
    }
  }
}
</script>

<style lang="scss" scoped>
.row-label {
  font-size: 0.5em;
  text-transform: uppercase;
  font-weight: bold;
}
</style>
