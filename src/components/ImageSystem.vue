<template>
  <v-card>
    <v-container class="py-6 mx-auto">
      <v-row>
        <v-col no-gutters>
          <h1 class="text-h5 ml-2">Images</h1>
        </v-col>
        <v-col align="right">
          <v-btn class="mr-2" @click="$refs.fileInput.click()">
            <v-icon class="mr-1">mdi-plus</v-icon>
            Add Image
          </v-btn>
          <input
            style="display: none"
            ref="fileInput"
            type="file"
            accept=".png,.jpg,.jpeg"
            @change="addImage"
          />
        </v-col>
      </v-row>
      <v-row v-if="images.length < 1" class="mt-6">
        <v-col cols="12">
          <div class="text-body1 text-center">
            You haven't added any images to this scene yet.
          </div>
        </v-col>
      </v-row>
      <div v-for="(image, i) in images" :key="i" class="mt-6">
        <v-row class="grey darken-3 dark mx-n3">
          <v-col cols="6">
            <v-text-field
              dark
              v-model="image.name"
              label="Image Name"
              @blur="updateProperties()"
            ></v-text-field>
          </v-col>
          <v-col cols="6" align="right">
            <v-btn icon dark @click="toggleVisibility(image)">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on">
                    {{ image.show ? 'mdi-eye' : 'mdi-eye-off' }}
                  </v-icon>
                </template>
                <span>Show/Hide</span>
              </v-tooltip>
            </v-btn>
            <v-dialog
              v-model="psrDialog"
              persistent
              max-width="350"
              :retain-focus="false"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  dark
                  v-bind="attrs"
                  v-on="on"
                  @click="storeOriginalTransform(i)"
                >
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on">
                        mdi-axis-arrow
                      </v-icon>
                    </template>
                    <span>Move/Scale/Rotate</span>
                  </v-tooltip>
                </v-btn>
              </template>
              <v-card>
                <move-scale-rotate
                  :transform="image.transform"
                  @updateProperties="updateProperties"
                />
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="green" text @click="saveImageTransform(i)">
                    Save
                  </v-btn>
                  <v-btn
                    color="red darken-1"
                    text
                    @click="cancelImageTransform(i)"
                  >
                    Revert
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="deleteImageDialog" persistent max-width="350">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon dark v-bind="attrs" v-on="on">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on">
                        mdi-trash-can
                      </v-icon>
                    </template>
                    <span>Remove Image</span>
                  </v-tooltip>
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="text-h5">
                  Remove Image?
                </v-card-title>
                <v-card-text>
                  Are you sure you want to delete
                  {{ image.name }}?
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="red darken-1" text @click="removeImage(i)">
                    Remove
                  </v-btn>
                  <v-btn
                    color="grey darken-1"
                    text
                    @click="deleteImageDialog = false"
                  >
                    Cancel
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
        <v-row class="my-0 pt-2">
          <v-col cols="12">
            <v-img
              max-height="250"
              max-width="250"
              :src="image.imageLink"
              class="mx-auto"
            ></v-img>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex'
import MoveScaleRotate from './MoveScaleRotate.vue'
import _cloneDeep from 'lodash/cloneDeep'

export default {
  components: { MoveScaleRotate },
  name: 'ImageSystem',

  data: () => ({
    addImageDialog: false,
    deleteImageDialog: false,
    psrDialog: false,
    selectedImage: '',
    defaultTransform: {
      position: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      rotation: { x: 0, y: 0, z: 0 }
    },
    originalTransform: {}
  }),
  props: {
    images: {
      type: Array,
      default: function () {
        return [
          {
            id: Date.now(),
            show: true,
            name: '',
            imageLink: '',
            transform: {
              position: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
              rotation: { x: 0, y: 0, z: 0 }
            }
          }
        ]
      }
    },
    property: Object
  },
  mounted () {},
  methods: {
    ...mapActions({
      uploadImage: 'image/uploadImage'
    }),
    removeImage (i) {
      this.deleteImageDialog = false
      this.images.splice(i, 1)
      this.updateProperties({
        action: 'remove',
        entity: 'image'
      })
    },
    storeOriginalTransform (i) {
      console.log('storing original transform:', this.images[i].transform)
      this.originalTransform = _cloneDeep(this.images[i].transform)
    },
    saveImageTransform (i) {
      console.log(i)
      this.psrDialog = false
    },
    cancelImageTransform (i) {
      console.log(i)
      this.psrDialog = false
      this.images[i].transform = this.originalTransform
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'transform'
      })
    },
    editImageName () {
      this.editingImageName = true
    },
    saveImageName () {
      this.editingImageName = false
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'name'
      })
    },
    toggleVisibility (image) {
      image.show = !image.show
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'visibility'
      })
    },
    async addImage (e) {
      const options = {
        image: e.target.files[0],
        baseParcel: this.property.baseParcel
      }
      e.target.value = ''

      const img = new Image()
      const uploadImageRes = await this.uploadImage(options)
      const imageJson = await uploadImageRes.json()
      const imageLink = `${process.env.VUE_APP_API_URL}/${imageJson.path}`
      img.src = imageLink
      img.onload = () => {
        const height = img.height,
          width = img.width,
          transform = {
            ...this.defaultTransform,
            scale: { x: width / 1000, y: height / 1000, z: 0.01 }
          }
        this.images.push({
          id: imageJson.id,
          name: options.image.name,
          imageLink,
          transform,
          show: true
        })
        this.updateProperties({ wssMessage: 'createImage' })
      }
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', { wssMessages })
    }
  }
}
</script>
