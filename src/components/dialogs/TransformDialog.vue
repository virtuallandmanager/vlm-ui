<template>
  <v-dialog v-model="show" max-width="350" persistent>
    <v-card>
      <v-card-title>Move, Scale, Rotate</v-card-title>
      <v-card-subtitle>
        {{ subtitle }}
      </v-card-subtitle>
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
        <v-btn color="accenttext" text @click="save"> Save </v-btn>
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
    subtitle () {
      return this.entity.name
    },
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
      this.onChange()
    },
    onChange () {
      this.$emit('onChange')
    }
  }
}
</script>
