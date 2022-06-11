<template>
  <div>
    <div class="d-flex pa-6 mx-auto align-baseline justify-space-between">
      <div class="text-h5">Images</div>
      <v-btn @click="$refs.fileInput.click()">
        <v-icon class="mr-1">mdi-plus</v-icon>
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
      <div v-for="(image, i) in images" :key="image.id">
        <scene-image
          :image="image"
          :i="i"
          @updateProperties="updateProperties"
          @onRemove="removeImage(i)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions } from 'vuex'
import SceneImage from '../components/SceneImage'
import { SceneImage as SceneImageModel } from '../models/SceneImage'
import { SceneImageInstance } from '../models/SceneImageInstance'
import _cloneDeep from 'lodash/cloneDeep'

export default {
  components: {
    SceneImage
  },
  name: 'SceneImageList',
  data: () => ({
    clickEventDialog: false,
    deleteDialog: false,
    selectedImage: ''
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
          newInstance = {
            ...new SceneImageInstance(),
            scale: { x: width / 1000, y: height / 1000, z: 0.01 }
          }
        this.images.push({
          ...new SceneImageModel(),
          id: imageJson.id,
          name: options.image.name,
          height,
          width,
          imageLink,
          instances: [{ ...newInstance }]
        })
        this.updateProperties({
          action: 'create',
          entity: 'image',
          id: imageJson.id
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

        const clonedImages = _cloneDeep(this.images)
        clonedImages[i] = {
          ...image,
          imageLink,
          height,
          width
        }

        this.property.sceneData.imageTextures = clonedImages

        this.updateProperties({
          action: 'update',
          entity: 'image',
          property: 'link',
          id: image.id
        })
      }
    },
    removeImage (i) {
      const imageId = this.images[i].id
      Vue.delete(this.images, i)

      this.updateProperties({
        action: 'remove',
        entity: 'image',
        id: imageId
      })
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', { wssMessages })
    }
  }
}
</script>
