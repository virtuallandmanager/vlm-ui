<template>
  <v-dialog v-model="show" max-width="350" @click:outside="revert">
    <v-card>
      <v-card-title class="text-h5">
        {{ entityType.capitalize() }} Properties
      </v-card-title>
      <v-card-text>
        <div
          v-if="entityType == 'image' && !instance"
          class="text-body1 font-weight-bold"
        >
          Appearance
        </div>
        <v-switch
          v-if="entityType == 'image' && !instance"
          v-model="refObj.isTransparent"
          label="Enable Transparency"
          @change="changeTransparency"
        ></v-switch>
        <div class="text-body1 font-weight-bold">Advanced Features</div>
        <v-text-field
          v-model="refObj.customId"
          label="Custom ID"
          @change="changeId"
          placeholder="Custom ID"
        ></v-text-field>
        <v-text-field
          v-model="refObj.parent"
          label="Parent Entity"
          dense
          @change="changeParent"
          hide-details="true"
          placeholder="Parent Entity"
        ></v-text-field>
        <v-switch
          v-model="customRendering"
          label="Enable Custom Rendering"
          :disabled="instance && baseObj.customRendering"
          :messages="customRenderingMessage()"
          hide-details="auto"
          @change="changeCustomRendering"
        ></v-switch>
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
    refObj: {},
    baseObj: {}
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
    this.baseObj = this.entity
    this.originalProperties = {
      isTransparent: this.refObj.isTransparent,
      customRendering: this.refObj.customRendering,
      customId: this.refObj.customId,
      parent: this.refObj.parent
    }
  },
  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },
    customRendering: {
      get () {
        return this.baseObj.customRendering || this.refObj.customRendering
      },
      set (value) {
        if (
          (this.instance && !this.baseObj.customRendering) ||
          !this.instance
        ) {
          this.refObj.customRendering = value
        }
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
    changeCustomRendering () {
      Vue.set(this.getRefObj(), 'customRendering', this.refObj.customRendering)
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
    customRenderingMessage () {
      let baseEntity
      if (this.entityType.includes('image')) {
        baseEntity = 'image'
      } else if (this.entityType.includes('video')) {
        baseEntity = 'video'
      }
      if (this.instance && this.baseObj.customRendering) {
        return `Enabled on base ${baseEntity || 'entity'}`
      }
    },
    save () {
      this.show = false
      this.$emit('onChange')
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
      Vue.set(this.getRefObj(), 'customRendering', this.originalProperties.customRendering)
      this.$emit('onChange')
    }
  }
}
</script>
