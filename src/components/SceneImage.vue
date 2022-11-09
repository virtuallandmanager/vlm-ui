<template>
  <div>
    <click-event-dialog
      v-if="clickEventDialog"
      v-model="clickEventDialog"
      :entity="image"
      entityType="image"
      @onChange="updateImageClickEvent"
    />
    <properties-dialog
      v-if="propertiesDialog"
      v-model="propertiesDialog"
      :entity="image"
      entityType="image"
      @onChange="updateImageProperties"
    />
    <delete-dialog
      v-if="deleteDialog"
      v-model="deleteDialog"
      :entity="image"
      entityType="image"
      :removeAll="true"
      @onRemove="removeImage"
    />
    <div>
      <div
        class="d-flex justify-space-between align-center grey darken-3 dark pa-4"
      >
        <div class="text-h6 white--text d-flex-shrink-1" v-if="!editingName">
          {{ truncatedName }}
        </div>
        <v-btn
          class="d-flex-grow-0"
          icon
          small
          dark
          @click="toggleEditMode()"
          v-if="!editingName"
        >
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
        <div class="text-h5" v-if="editingName">
          <v-text-field
            autofocus
            dark
            label="Image Name"
            v-model="image.name"
            hide-details="auto"
            class="mt-2 mb-n2"
            append-outer-icon="mdi-content-save"
            @click:append-outer="toggleEditMode()"
            @blur="toggleEditMode()"
            dense
            @change="editImageName()"
          ></v-text-field>
        </div>
      </div>
      <div
        class="d-flex flex-column justify-space-between align-center black dark py-1"
      >
        <div>
          <v-btn
            icon
            dark
            @click="toggleVisibility()"
            :disabled="image.customRendering"
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                  :class="image.show ? '' : 'red--text'"
                >
                  {{ image.show ? 'mdi-eye' : 'mdi-eye-off' }}
                </v-icon>
              </template>
              <span>Show/Hide All</span>
            </v-tooltip>
          </v-btn>
          <input
            style="display: none"
            ref="replaceFileInput"
            type="file"
            accept=".png,.jpg,.jpeg"
            @change="replaceImage(image, i)"
          />
          <v-btn icon dark @click.stop="openImageClickEventDialog()">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on"> mdi-mouse </v-icon>
              </template>
              <span>Click Event</span>
            </v-tooltip>
          </v-btn>
          <v-btn icon dark @click.stop="openImagePropertiesDialog()">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
              </template>
              <span>Image Properties</span>
            </v-tooltip>
          </v-btn>
          <v-btn icon dark @click="$refs.replaceFileInput.click()">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on"> mdi-upload </v-icon>
              </template>
              <span>Replace Image</span>
            </v-tooltip>
          </v-btn>
          <v-btn icon dark @click.stop="openImageDeleteDialog()">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
              </template>
              <span>Remove Image</span>
            </v-tooltip>
          </v-btn>
        </div>
      </div>
      <div class="grey lighten-2">
        <h1 class="d-block text-body-1 font-weight-bold pa-4" dark>
          Image Preview
        </h1>
      </div>
      <div class="py-4">
        <v-img
          max-height="250"
          max-width="250"
          contain
          :src="imageLink"
          class="mx-auto"
        ></v-img>
      </div>
      <div>
        <div
          class="d-flex justify-space-between align-center grey lighten-3 pa-4"
        >
          <h1 class="text-body-1 font-weight-bold" dark>
            Instances
          </h1>
          <v-btn @click="addInstance()"><v-icon>mdi-plus</v-icon> Add</v-btn>
        </div>
        <div class="d-flex flex-column pa-4" v-if="!image.instances.length">
          <div class="text-body1 text-center">
            Add an instance for this image to see it in the scene.
          </div>
        </div>
        <div class="d-flex flex-column my-0" v-if="image.instances.length">
          <div v-for="(instance, ii) in image.instances" :key="instance.id">
            <click-event-dialog
              v-if="instance.clickEventDialog"
              v-model="instance.clickEventDialog"
              title="Instance Click Event"
              :entity="image"
              entityType="image"
              :instance="instance"
              @onChange="updateInstanceClickEvent(instance)"
            />
            <properties-dialog
              v-if="instance.propertiesDialog"
              v-model="instance.propertiesDialog"
              title="Instance Properties"
              :instance="instance"
              :entity="image"
              entityType="image instance"
              @onChange="updateInstanceProperties(instance)"
            />
            <transform-dialog
              v-if="instance.transformDialog"
              v-model="instance.transformDialog"
              title="Image Transformations"
              :entity="instance"
              entityType="image"
              @onChange="updateInstanceTransform(instance)"
            />
            <delete-dialog
              v-if="instance.deleteDialog"
              v-model="instance.deleteDialog"
              :entity="instance"
              entityType="image instance"
              @onRemove="removeImageInstance(image, ii)"
            />
            <div
              class="lighten-4 my-0 py-2 px-2"
              :class="ii % 2 ? 'grey' : 'white'"
            >
              <div class="lighten-4 d-flex justify-end mb-n4" :class="ii % 2 ? 'grey' : 'white'">
                <v-btn icon small @click="addInstance(instance)">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on" small>
                        mdi-content-copy
                      </v-icon>
                    </template>
                    <span>Duplicate</span>
                  </v-tooltip>
                </v-btn>
                <v-btn icon small @click.stop="openInstanceDeleteDialog(ii)">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon small v-bind="attrs" v-on="on">
                        mdi-trash-can
                      </v-icon>
                    </template>
                    <span>Remove</span>
                  </v-tooltip>
                </v-btn>
              </div>
              <div class="d-flex flex-column">
                <v-text-field
                  hide-details="true"
                  v-model="instance.name"
                  :label="`Instance ${ii + 1}`"
                  @blur="editInstanceName(instance)"
                ></v-text-field>
                <div class="mt-3 d-flex flex-row justify-center">
                  <v-btn
                    icon
                    @click="toggleVisibility(instance, ii)"
                    :disabled="
                      image.customRendering || instance.customRendering
                    "
                  >
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          v-bind="attrs"
                          v-on="on"
                          :class="
                            image.show && instance.show ? '' : 'red--text'
                          "
                        >
                          {{
                            image.show && instance.show
                              ? 'mdi-eye'
                              : 'mdi-eye-off'
                          }}
                        </v-icon>
                      </template>
                      <span>Show/Hide</span>
                    </v-tooltip>
                  </v-btn>
                  <v-btn icon @click.stop="openInstanceTransformDialog(ii)">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on">
                          mdi-axis-arrow
                        </v-icon>
                      </template>
                      <span>Transform</span>
                    </v-tooltip>
                  </v-btn>
                  <v-btn icon @click.stop="openInstanceClickEventDialog(ii)">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on"> mdi-mouse </v-icon>
                      </template>
                      <span>Click Event</span>
                    </v-tooltip>
                  </v-btn>
                  <v-btn icon @click.stop="openInstancePropertiesDialog(ii)">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
                      </template>
                      <span>Instance Properties</span>
                    </v-tooltip>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions } from 'vuex'
import ClickEventDialog from './dialogs/ClickEventDialog'
import PropertiesDialog from './dialogs/PropertiesDialog'
import TransformDialog from './dialogs/TransformDialog'
import DeleteDialog from './dialogs/DeleteDialog'
import { SceneImage } from '../models/SceneImage'
import { SceneImageInstance } from '../models/SceneImageInstance'

export default {
  components: {
    ClickEventDialog,
    PropertiesDialog,
    TransformDialog,
    DeleteDialog
  },
  name: 'SceneImage',
  data: () => ({
    propertiesDialog: false,
    clickEventDialog: false,
    deleteDialog: false,
    selectedImage: new SceneImage(),
    editingName: false,
    clickEvents: [
      { text: 'None', value: 0, default: true },
      { text: 'Website Link', value: 1 },
      { text: 'Play Sound (Coming Soon)', value: 2, disabled: true },
      { text: 'Move Player in Scene (Coming Soon)', value: 3, disabled: true },
      { text: 'Teleport Player (Coming Soon)', value: 4, disabled: true }
    ],
    imageLink: ''
  }),
  props: {
    property: Object,
    i: Number,
    image: {
      type: Object,
      default: function () {
        return new SceneImage()
      }
    }
  },
  mounted () {
    this.imageLink = this.image.imageLink
  },
  computed: {
    truncatedName () {
      const imageNameArr = this.image.name.split('')
      let noSpacesLength = 0
      let truncated = this.image.name
      imageNameArr.forEach(char => {
        if (char !== ' ') {
          noSpacesLength++
        } else {
          noSpacesLength = 0
        }

        if (noSpacesLength > 18) {
          truncated = truncated.substr(truncated.length - 18)
          noSpacesLength = 0
        }
      })

      if (truncated !== this.image.name) {
        return `...${truncated}`
      } else {
        return this.image.name
      }
    }
  },
  methods: {
    ...mapActions({
      uploadImage: 'image/uploadImage'
    }),
    toggleEditMode () {
      this.editingName = !this.editingName
    },
    removeImage () {
      this.deleteDialog = false
      this.$emit('onRemove')
    },
    removeImageInstance (image, i) {
      const instanceData = image.instances[i]
      Vue.delete(image.instances, i)

      this.updateProperties({
        action: 'remove',
        entity: 'imageInstance',
        id: instanceData.id,
        materialId: this.image.id,
        entityData: this.image,
        instanceData
      })
    },
    addInstance (duplicate) {
      const newInstance = new SceneImageInstance()
      newInstance.scale.x = this.image.width / 1000
      newInstance.scale.y = this.image.height / 1000

      if (duplicate) {
        newInstance.position = duplicate.position
        newInstance.scale = duplicate.scale
        newInstance.rotation = duplicate.rotation
        newInstance.name = `${duplicate.name} (Copy)`
      }

      this.image.instances.push(newInstance)
      this.updateProperties({
        action: 'create',
        entity: 'imageInstance',
        id: newInstance.id,
        entityData: this.image,
        instanceData: newInstance
      })
    },
    editInstanceName (instance) {
      this.updateProperties({
        action: 'update',
        entity: 'imageInstance',
        property: 'name',
        id: instance.id,
        entityData: this.image,
        instanceData: instance
      })
    },
    editImageName () {
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'name',
        id: this.image.id,
        entityData: this.image
      })
    },
    saveImageProperties () {
      this.closePropertiesDialog()
    },
    toggleVisibility (instance, i) {
      if (instance) {
        Vue.set(this.image.instances[i], 'show', !this.image.instances[i].show)
        this.updateProperties({
          action: 'update',
          entity: 'imageInstance',
          property: 'visibility',
          id: instance.id,
          entityData: this.image,
          instanceData: instance
        })
      } else {
        Vue.set(this.image, 'show', !this.image.show)
        this.updateProperties({
          action: 'update',
          entity: 'image',
          property: 'visibility',
          id: this.image.id,
          entityData: this.image
        })
      }
    },
    async replaceImage (image, i) {
      const options = {
        image: this.$refs.replaceFileInput.files[0],
        baseParcel: this.property.baseParcel,
        id: image.id
      }
      this.$refs.replaceFileInput.value = null
      const img = new Image()
      const uploadImageRes = await this.uploadImage(options)
      const imageJson = await uploadImageRes.json()
      const imageLink = `${process.env.VUE_APP_API_URL}/${imageJson.path}`
      this.imageLink = imageLink
      img.src = this.imageLink
      img.onload = () => {
        const height = img.height,
          width = img.width

        this.$emit('onReplace', {
          i,
          image: {
            ...image,
            id: image.id,
            imageLink: this.imageLink,
            height,
            width
          }
        })
      }
    },
    openImageClickEventDialog () {
      this.selectedImage = this.image
      this.clickEventDialog = true
    },
    openInstanceClickEventDialog (ii) {
      Vue.set(this.image.instances[ii], 'clickEventDialog', true)
    },
    openImagePropertiesDialog () {
      this.selectedImage = this.image
      this.propertiesDialog = true
    },
    openInstancePropertiesDialog (ii) {
      Vue.set(this.image.instances[ii], 'propertiesDialog', true)
    },
    openImageDeleteDialog () {
      this.deleteDialog = true
    },
    openInstanceDeleteDialog (ii) {
      Vue.set(this.image.instances[ii], 'deleteDialog', true)
    },
    openInstanceTransformDialog (ii) {
      Vue.set(this.image.instances[ii], 'transformDialog', true)
    },
    updateImageClickEvent () {
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'clickEvent',
        id: this.image.id,
        entityData: this.image
      })
    },
    updateImageProperties (property) {
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: property || 'properties',
        id: this.image.id,
        entityData: this.image
      })
    },
    updateInstanceClickEvent (instance) {
      this.updateProperties({
        action: 'update',
        entity: 'imageInstance',
        property: 'clickEvent',
        id: instance.id,
        entityData: this.image,
        instanceData: instance
      })
    },
    updateInstanceProperties (instance) {
      this.updateProperties({
        action: 'update',
        entity: 'imageInstance',
        property: 'properties',
        id: instance.id,
        entityData: this.image,
        instanceData: instance
      })
    },
    updateInstanceTransform (instance) {
      this.updateProperties({
        action: 'update',
        entity: 'imageInstance',
        property: 'transform',
        custom: instance.customRendering,
        id: instance.id,
        entityData: this.image,
        instanceData: instance
      })
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', wssMessages)
    }
  }
}
</script>
