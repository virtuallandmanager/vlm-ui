<template>
  <v-dialog v-model="show" max-width="400" persistent>
    <instance-click-event v-if="show && instance" :element="element" :instanceData="instanceData" :elementData="elementData" @onUpdate="updateInstance" />
    <default-click-event v-else-if="show && element" :element="element" :elementData="elementData" @onUpdate="updateElement" />
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { ClickEvent } from '../../models/ClickEvent'
import InstanceClickEvent from '../forms/InstanceClickEvent.vue'
import DefaultClickEvent from '../forms/DefaultClickEvent.vue'

export default {
  name: 'ClickEventDialog',
  components: { InstanceClickEvent, DefaultClickEvent },
  data: () => ({
    clickEvent: null,
    originalClickEvent: null,
    displayedClickEvent: new ClickEvent(),
    baseEntityType: '',
    hasErrors: false,
    EClickEventType: {
      NONE: 0,
      EXTERNAL: 1,
      TRACKING_ONLY: 2,
      SOUND: 3,
      STREAM: 4,
      MOVE: 5,
      TELEPORT: 6,
    },
    clickEvents: [
      { text: 'None', value: 0, default: true },
      { text: 'Tracking Only', value: 2 },
      { text: 'Website Link', value: 1 },
      { text: 'Play Sound', value: 3 },
      // { text: 'Play Audio Stream (Coming Soon)', value: this.EClickEventType.STREAM },
      { text: 'Move Player in Scene', value: 5 },
      { text: 'Teleport Player', value: 6 },
    ],
  }),
  computed: {
    ...mapGetters({
      show: 'dialog/clickEventDialogOpen',
      dialogProps: 'dialog/clickEventDialogProps',
      activeSceneElements: 'scene/activeSceneElements',
    }),
    element() {
      return this.dialogProps.element
    },
    elementData() {
      return this.activeSceneElements.find((element) => element.sk == this.dialogProps.elementData.sk)
    },
    instance() {
      return this.dialogProps.instance
    },
    instanceData() {
      if (this.dialogProps.instance && this.dialogProps.elementData) {
        return this.elementData.instances.find((element) => element.sk == this.dialogProps.instanceData.sk)
      } else {
        return this.dialogProps.instanceData
      }
    },
  },
  methods: {
    ...mapActions({
      updateSceneElement: 'scene/updateSceneElement',
      showClickEventDialog: 'dialog/showClickEventDialog',
      hideClickEventDialog: 'dialog/hideClickEventDialog',
    }),
    updateInstance(clickEvent, done) {
      const instanceData = this.elementData.instances.find((element) => element.sk == this.dialogProps.instanceData.sk)

      this.updateSceneElement({
        element: this.element,
        property: 'clickEvent',
        elementData: this.elementData,
        instance: true,
        id: this.instanceData?.sk,
        instanceData: { ...instanceData, clickEvent },
      })
      if (done) {
        this.hideClickEventDialog()
      }
    },
    updateElement(clickEvent, done) {
      if (done) {
        this.hideClickEventDialog()
        return
      }
      const elementData = this.activeSceneElements.find((element) => element.sk == this.dialogProps.elementData.sk)
      this.updateSceneElement({
        element: this.element,
        property: 'clickEvent',
        elementData: { ...elementData, clickEvent },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.coords {
  .v-input {
    padding-right: 4px;
    padding-left: 4px;

    &:first-child {
      padding-right: 4px;
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
      padding-left: 4px;
    }
  }
}
</style>
