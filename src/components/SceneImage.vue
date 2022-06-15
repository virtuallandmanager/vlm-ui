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
        <div class="text-h5 white--text" v-if="!editingName">
          {{ image.name }}
          <v-btn icon small dark @click="toggleEditMode()">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </div>
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
        <div>
          <v-btn icon dark @click="toggleVisibility()">
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
            @change="replaceImage(image)"
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
          <v-btn icon dark @click="$refs.replaceFileInput[i].click()">
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
          :src="image.imageLink"
          class="mx-auto"
        ></v-img>
      </div>
      <div>
        <div
          class="d-flex justify-space-between align-center grey lighten-2 pa-4"
        >
          <h1 class="text-body-1 font-weight-bold" dark>
            Instances
          </h1>
          <v-btn @click="addInstance(image)"><v-icon>mdi-plus</v-icon> Add Instance</v-btn>
        </div>
        <div class="d-flex flex-column pa-4">
          <div v-for="(instance, i) in image.instances" :key="instance.id">
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
              @onRemove="removeImageInstance(image, i)"
            />
            <div class="d-flex mx-auto align-center">
              <v-text-field
                hide-details="true"
                v-model="instance.name"
                :label="`Instance ${i + 1}`"
                @blur="editInstanceName(instance)"
              ></v-text-field>
              <div class="mt-3">
                <v-btn icon @click="toggleVisibility(instance, i)">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        v-bind="attrs"
                        v-on="on"
                        :class="image.show && instance.show ? '' : 'red--text'"
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
                <v-btn icon @click.stop="openInstanceTransformDialog(i)">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on">
                        mdi-axis-arrow
                      </v-icon>
                    </template>
                    <span>Transform</span>
                  </v-tooltip>
                </v-btn>
                <v-btn icon @click.stop="openInstanceClickEventDialog(i)">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on"> mdi-mouse </v-icon>
                    </template>
                    <span>Click Event</span>
                  </v-tooltip>
                </v-btn>
                <v-btn icon @click.stop="openInstancePropertiesDialog(i)">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
                    </template>
                    <span>Instance Properties</span>
                  </v-tooltip>
                </v-btn>
                <v-btn icon @click.stop="openInstanceDeleteDialog(i)">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on">
                        mdi-trash-can
                      </v-icon>
                    </template>
                    <span>Remove</span>
                  </v-tooltip>
                </v-btn>
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
    ]
  }),
  props: {
    image: {
      type: Object,
      default: function () {
        return new SceneImage()
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
      const instanceId = image.instances[i].id
      Vue.delete(image.instances, i)

      this.updateProperties({
        action: 'remove',
        entity: 'imageInstance',
        id: instanceId
      })
    },
    addInstance (image) {
      const newInstance = new SceneImageInstance()
      image.instances.push(newInstance)
      this.updateProperties({
        action: 'add',
        entity: 'imageInstance',
        id: newInstance.id
      })
    },
    editInstanceName (instance) {
      this.updateProperties({
        action: 'update',
        entity: 'imageInstance',
        property: 'name',
        id: instance.id
      })
    },
    editImageName () {
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'name',
        id: this.image.id
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
          custom: this.instance.customRendering,
          id: instance.id
        })
      } else {
        this.image.show = !this.image.show
        this.updateProperties({
          action: 'update',
          entity: 'image',
          property: 'visibility',
          custom: this.image.customRendering,
          id: this.image.id
        })
      }
    },
    async replaceImage (image, i) {
      const options = {
        image: this.$refs.replaceFileInput[i].files[0],
        baseParcel: this.property.baseParcel,
        id: image.id
      }
      this.$refs.replaceFileInput[i].value = null

      const img = new Image()
      const uploadImageRes = await this.uploadImage(options)
      const imageJson = await uploadImageRes.json()
      const imageLink = `${process.env.VUE_APP_API_URL}/${imageJson.path}`
      img.src = imageLink
      img.onload = () => {
        const height = img.height,
          width = img.width

        this.image = {
          ...this.image,
          imageLink,
          height,
          width
        }

        this.updateProperties({
          action: 'update',
          entity: 'image',
          property: 'link',
          id: image.id
        })
      }
    },
    openImageClickEventDialog () {
      this.selectedImage = this.image
      this.clickEventDialog = true
    },
    openInstanceClickEventDialog (i) {
      Vue.set(this.image.instances[i], 'clickEventDialog', true)
    },
    openImagePropertiesDialog () {
      this.selectedImage = this.image
      this.propertiesDialog = true
    },
    openInstancePropertiesDialog (i) {
      Vue.set(this.image.instances[i], 'propertiesDialog', true)
    },
    openImageDeleteDialog () {
      this.deleteDialog = true
    },
    openInstanceDeleteDialog (i) {
      Vue.set(this.image.instances[i], 'deleteDialog', true)
    },
    openInstanceTransformDialog (i) {
      Vue.set(this.image.instances[i], 'transformDialog', true)
    },
    updateImageClickEvent () {
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'clickEvent',
        id: this.image.id
      })
    },
    updateImageProperties () {
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'properties',
        id: this.image.id
      })
    },
    updateInstanceClickEvent (instance) {
      this.updateProperties({
        action: 'update',
        entity: 'imageInstance',
        property: 'clickEvent',
        id: instance.id
      })
    },
    updateInstanceProperties (instance) {
      this.updateProperties({
        action: 'update',
        entity: 'imageInstance',
        property: 'properties',
        id: instance.id
      })
    },
    updateInstanceTransform (instance) {
      this.updateProperties({
        action: 'update',
        entity: 'imageInstance',
        property: 'transform',
        custom: instance.customRendering,
        id: instance.id
      })
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', wssMessages)
    }
  }
}
</script>
