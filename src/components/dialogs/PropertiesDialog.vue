<template>
  <v-dialog v-model="show" max-width="350" @click:outside="revert">
    <v-card>
      <v-card-title class="text-h5">
        {{ entityType.capitalize() }} Properties
      </v-card-title>
      <v-card-text>
        <v-switch
          v-if="entityType == 'image' && !instance"
          v-model="refObj.isTransparent"
          label="Enable Transparency"
          @change="changeTransparency"
        ></v-switch>
        <v-text-field
          v-model="refObj.customId"
          label="Custom ID"
          dense
          @change="changeId"
        ></v-text-field>
        <v-text-field
          v-model="refObj.parent"
          label="Parent Entity"
          dense
          @change="changeParent"
        ></v-text-field>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="save"> Save </v-btn>
        <v-btn color="grey darken-1" text @click="revert"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue'
export default {
  name: 'PropertiesDialog',
  data: () => ({
    refObj: {}
  }),
  props: {
    title: { type: String, default: 'Properties' },
    entity: Object,
    entityType: { type: String, default: 'Entity' },
    isInstance: { type: Boolean, default: false },
    instance: [Object, null],
    value: Boolean
  },
  mounted () {
    this.refObj = this.instance || this.entity
    this.originalProperties = { ...this.refObj }
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
    getRefObj () {
      if (this.instance) {
        const i = this.entity.instances.findIndex(
          instance => instance.id == this.instance.id
        )
        return this.entity.instances[i]
      } else {
        return this.entity
      }
    },
    changeTransparency () {
      Vue.set(this.getRefObj(), 'isTransparent', this.refObj.isTransparent)
      this.$emit('onChange')
    },
    changeParent () {
      Vue.set(this.getRefObj(), 'parent', this.refObj.parent)
      this.$emit('onChange')
    },
    changeId () {
      Vue.set(this.getRefObj(), 'customId', this.refObj.customId)
      this.$emit('onChange')
    },
    save () {
      this.show = false
    },
    revert () {
      this.show = false
      Vue.set(
        this.getRefObj(),
        'isTransparent',
        this.originalProperties.isTransparent
      )
      Vue.set(this.getRefObj(), 'customId', this.originalProperties.customId)
      Vue.set(this.getRefObj(), 'parent', this.originalProperties.parent)
      this.$emit('onChange')
    }
  }
}
</script>
