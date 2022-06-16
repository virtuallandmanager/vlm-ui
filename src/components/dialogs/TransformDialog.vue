<template>
  <v-dialog v-model="show" max-width="350" @click:outside="revert">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ title }}
      </v-card-title>
      <v-card-text>
        <move-scale-rotate
          :entity="entity"
          :isPlane="entityType == 'image' || entityType == 'video'"
          @onChange="onChange"
        />
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" text @click="save"> Save </v-btn>
        <v-btn color="red darken-1" text @click="revert"> Revert </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue'
import MoveScaleRotate from '../MoveScaleRotate'

export default {
  name: 'TransformDialog',
  components: { MoveScaleRotate },
  data: () => ({}),
  props: {
    title: { type: String, default: 'Edit Transform' },
    entity: Object,
    entityType: { type: String, default: 'entity' },
    value: Boolean
  },
  mounted () {
    this.originalPosition = { ...this.entity.position }
    this.originalScale = { ...this.entity.scale }
    this.originalRotation = { ...this.entity.rotation }
  },
  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    save () {
      this.show = false
      this.onChange()
    },
    revert () {
      Vue.set(this.entity, 'position', this.originalPosition)
      Vue.set(this.entity, 'scale', this.originalScale)
      Vue.set(this.entity, 'rotation', this.originalRotation)
      this.show = false
      this.$emit('onChange')
    }
  }
}
</script>
