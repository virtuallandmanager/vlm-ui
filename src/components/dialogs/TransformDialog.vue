<template>
  <v-dialog v-if="show" v-model="show" max-width="375" persistent>
    <v-card>
      <v-card-title>Move, Scale, Rotate</v-card-title>
      <v-card-subtitle>
        {{ subtitle }}
      </v-card-subtitle>
      <v-card-text>
        <move-scale-rotate :instanceData="instanceData" @onChange="onChange" :isPlane="element == 'image' || element == 'video'" />
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="save"> Save </v-btn>
        <v-btn :color="dirty ? 'red' : 'grey'" text @click="revert">{{ dirty ? 'Revert' : 'Cancel' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
// import Vue from 'vue'
import MoveScaleRotate from '../MoveScaleRotate'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'TransformDialog',
  components: { MoveScaleRotate },
  data: () => ({
    dirty: false,
    originalInstance: null,
  }),
  props: {
    value: Boolean,
  },
  mounted() {
    this.dirty = false
  },
  watch: {
    instanceData(newValue, oldValue) {
      console.log('instanceData:', newValue, oldValue)
      if (!this.originalInstance && newValue.sk) {
        console.log(newValue.sk, this.originalInstance?.sk)
        console.log('Setting originalInstance')
        this.originalInstance = Object.freeze({
          ...newValue,
          position: Object.freeze({ ...newValue.position }),
          scale: Object.freeze({ ...newValue.scale }),
          rotation: Object.freeze({ ...newValue.rotation }),
        })
      } else if (!newValue.sk) {
        this.dirty = false
        this.originalInstance = null
      }
    },
    show(newValue, oldValue) {
      console.log('Show:', newValue, oldValue)
      if (!newValue) {
        this.dirty = false
        this.originalInstance = null
      }
    },
  },
  computed: {
    ...mapGetters({ show: 'dialog/transformDialogOpen', dialogProps: 'dialog/transformDialogProps' }),
    subtitle() {
      return this.dialogProps?.title
    },
    element() {
      return this.dialogProps.element
    },
    instance() {
      return this.dialogProps.instance
    },
    elementData() {
      if (this.activeSceneElements) {
        return this.activeSceneElements.find((element) => element.sk == this.dialogProps.elementData.sk)
      } else {
        return this.dialogProps.elementData
      }
    },
    instanceData() {
      return this.dialogProps.instanceData
    },
    id() {
      return this.instanceData ? this.instanceData.sk : this.elementData?.sk
    },
  },
  methods: {
    ...mapActions({
      updateSceneElement: 'scene/updateSceneElement',
      directUpdateSceneElement: 'scene/directUpdateSceneElement',
      showTransformDialog: 'dialog/showTransformDialog',
      hideTransformDialog: 'dialog/hideTransformDialog',
    }),
    onChange() {
      this.dirty = true
      this.directUpdateSceneElement({
        property: 'transform',
        element: this.element,
        elementData: this.elementData,
        instance: this.instanceData ? true : false,
        id: this.id,
        instanceData: this.instanceData,
      })
    },
    save() {
      this.dirty = false
      this.updateSceneElement({
        property: 'transform',
        element: this.element,
        elementData: this.elementData,
        instance: true,
        id: this.instanceData?.sk,
        instanceData: this.instanceData,
      })
      this.hideTransformDialog()
    },
    revert() {
      if (this.dirty) {
        this.dirty = false
        this.updateSceneElement({
          property: 'transform',
          element: this.element,
          elementData: this.elementData,
          instance: true,
          id: this.instanceData?.sk,
          instanceData: this.originalInstance,
        })
      }

      this.hideTransformDialog()
    },
  },
}
</script>
