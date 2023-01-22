<template>
  <div>
    <click-event-dialog
      v-if="clickEventDialog"
      v-model="clickEventDialog"
      :entity="selectedImage"
      :instance="selectedInstance"
      entityType="image"
      @onChange="dialogCallback"
    />
    <transform-dialog
      v-if="transformDialog"
      v-model="transformDialog"
      :entity="selectedInstance"
      entityType="image"
      @onChange="dialogCallback"
    />
    <properties-dialog
      v-if="propertiesDialog"
      v-model="propertiesDialog"
      :entity="selectedImage"
      :instance="selectedInstance"
      :entityType="selectedInstance ? 'instance' : 'image'"
      @onChange="dialogCallback"
    />
    <delete-dialog
      v-if="deleteDialog"
      v-model="deleteDialog"
      :entity="selectedInstance || selectedImage"
      :entityType="selectedInstance ? 'image instance' : 'image'"
      :removeAll="!selectedInstance"
      @onRemove="dialogCallback"
    />
    <div class="d-flex pa-6 mx-auto align-baseline justify-start">
      <div class="text-h5 flex-grow-1">Images</div>
      <v-btn small @click="$refs.fileInput.click()">
        <v-icon small class="mr-1">mdi-plus</v-icon>
        Add Image
      </v-btn>
    </div>

    <input
      style="display: none"
      ref="fileInput"
      type="file"
      accept=".png,.jpg,.jpeg"
      @change="addImage"
    />
    <div v-if="images.length < 1" class="mt-6">
      <div class="text-body1 text-center">
        There are no images in this scene
      </div>
    </div>
    <div v-if="images.length > 0">
      <v-container>
        <v-row>
          <v-col md="4" sm="12" v-for="(image, i) in images" :key="image.id">
            <v-card>
              <image-card
                v-if="images.length > 0"
                :image="image"
                :i="i"
                :property="property"
                @updateProperties="updateProperties"
                @onReplace="replaceImage"
                @handleDialog="handleDialog"
              />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions } from 'vuex'
import { SceneImage } from '../models/SceneImage'
import ImageCard from './ImageCard'
import ClickEventDialog from './dialogs/ClickEventDialog'
import PropertiesDialog from './dialogs/PropertiesDialog'
import TransformDialog from './dialogs/TransformDialog'
import DeleteDialog from './dialogs/DeleteDialog'
import { EDialogType } from '../models/Dialog'

export default {
  components: {
    ClickEventDialog,
    PropertiesDialog,
    TransformDialog,
    DeleteDialog,
    ImageCard
  },
  name: 'SceneImageList',
  data: () => ({
    clickEventDialog: false,
    propertiesDialog: false,
    transformDialog: false,
    deleteDialog: false,
    detailedMode: true,
    selectedImage: '',
    dialogCallback: () => {}
  }),
  props: {
    images: {
      type: Array,
      default: function () {
        return []
      }
    },
    property: Object
  },
  methods: {
    ...mapActions({
      uploadImage: 'image/uploadImage'
    }),
    async addImage (e) {
      const options = {
        image: e.target.files[0],
        baseParcel: this.property.baseParcel
      }
      e.target.value = null
      const img = new Image()
      const uploadImageRes = await this.uploadImage(options)
      const imageJson = await uploadImageRes.json()
      const imageLink = `${process.env.VUE_APP_API_URL}/${imageJson.path}`
      img.src = imageLink
      img.onload = () => {
        const height = img.height,
          width = img.width,
          newImage = {
            ...new SceneImage(),
            name: options.image.name,
            height,
            width,
            imageLink
          }

        this.images.push(newImage)
        this.updateProperties({
          action: 'create',
          entity: 'image',
          id: newImage.id,
          entityData: newImage
        })
      }
    },
    async replaceImage (options) {
      this.images.splice(options.i, 1, options.image)
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'imageLink',
        entityData: options.image,
        id: options.image.customId || options.image.id
      })
    },
    removeImage (i) {
      const imageId = this.images[i].id,
        instanceIds = this.images[i].instances.map(instance => instance.id)
      Vue.delete(this.images, i)

      this.updateProperties({
        action: 'delete',
        entity: 'image',
        id: imageId,
        instanceIds
      })
    },
    toggleDetailedMode () {
      this.detailedMode = !this.detailedMode
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', { wssMessages })
    },
    handleDialog (dialogOptions) {
      this.selectedImage = dialogOptions.entity
      this.selectedInstance = dialogOptions.instance || null
      this.dialogCallback = dialogOptions.callback
      console.log(dialogOptions, this.dialogCallback)

      switch (dialogOptions.type) {
        case EDialogType.delete:
          this.deleteDialog = dialogOptions.show
          break
        case EDialogType.clickEvent:
          this.clickEventDialog = dialogOptions.show
          break
        case EDialogType.properties:
          this.propertiesDialog = dialogOptions.show
          break
        case EDialogType.transform:
          this.transformDialog = dialogOptions.show
          break
      }
    }
  }
}
</script>
