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
      <div v-for="(image, i) in images" :key="image.id" class="mt-6">
        <v-row class="grey darken-3 dark mx-n3">
          <v-col cols="6">
            <v-text-field
              dark
              v-model="image.name"
              label="Image Name"
              @blur="saveImageName()"
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
            <input
              style="display: none"
              ref="replaceFileInput"
              type="file"
              accept=".png,.jpg,.jpeg"
              @change="replaceImage(image, i)"
            />
            <v-btn icon dark @click="$refs.replaceFileInput[i].click()">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on">
                    mdi-upload
                  </v-icon>
                </template>
                <span>Replace Image</span>
              </v-tooltip>
            </v-btn>
            <v-dialog v-model="deleteImageDialogs[i]" max-width="350">
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
                  Are you sure you want to delete all instances of
                  {{ image.name }}?
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="red darken-1" text @click="removeImage(i)">
                    Remove All
                  </v-btn>
                  <v-btn
                    color="grey darken-1"
                    text
                    @click="closeDeleteImageDialog(i)"
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
              contain
              :src="image.imageLink"
              class="mx-auto"
            ></v-img>
          </v-col>
        </v-row>
        <v-row class="my-0 pt-2">
          <v-col cols="12" align="center">
            <v-btn @click="addInstance(image, i)"
              ><v-icon>mdi-plus</v-icon> Add Instance</v-btn
            >
          </v-col>
        </v-row>
        <v-row
          v-for="(instance, ii) in image.instances"
          :key="ii"
          class="my-0 mx-auto pt-2"
          align="center"
        >
          <div class="mx-auto d-flex">
            <v-text-field
              class="d-inline"
              hide-details="true"
              v-model="instance.name"
              :label="`Instance ${ii + 1}`"
              @blur="saveInstanceName"
            ></v-text-field>
            <div class="mt-3">
              <v-btn icon @click="toggleVisibility(instance)">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on">
                      {{ instance.show ? 'mdi-eye' : 'mdi-eye-off' }}
                    </v-icon>
                  </template>
                  <span>Show/Hide</span>
                </v-tooltip>
              </v-btn>
              <v-dialog
                v-model="transformInstanceDialogs[i][ii]"
                max-width="350"
                :retain-focus="false"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    v-on="on"
                    @click="storeOriginalTransform(image.instances[ii])"
                  >
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on">
                          mdi-axis-arrow
                        </v-icon>
                      </template>
                      <span>Transform</span>
                    </v-tooltip>
                  </v-btn>
                </template>
                <v-card>
                  <move-scale-rotate
                    :instance="image.instances[ii]"
                    @updateProperties="updateProperties"
                  />
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="green"
                      text
                      @click="saveInstanceTransform(i, ii)"
                    >
                      Save
                    </v-btn>
                    <v-btn
                      color="red darken-1"
                      text
                      @click="revertInstanceTransform(i, ii)"
                    >
                      Revert
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="deleteInstanceDialogs[i][ii]" max-width="350">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on">
                          mdi-trash-can
                        </v-icon>
                      </template>
                      <span>Remove</span>
                    </v-tooltip>
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title class="text-h5">
                    Remove Image Instance?
                  </v-card-title>
                  <v-card-text>
                    Are you sure you want to delete the
                    {{ instance.name }} instance of {{ image.name }}?
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="red darken-1"
                      text
                      @click="removeImageInstance(i, ii)"
                    >
                      Remove
                    </v-btn>
                    <v-btn
                      color="grey darken-1"
                      text
                      @click="closeDeleteInstanceDialog(i, ii)"
                    >
                      Cancel
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </div>
          </div>
        </v-row>
      </div>
    </v-container>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex'
import MoveScaleRotate from './MoveScaleRotate.vue'
import _cloneDeep from 'lodash/cloneDeep'
import nanoid from 'nanoid'

export default {
  components: { MoveScaleRotate },
  name: 'ImageSystem',

  data: () => ({
    deleteImageDialogs: [false],
    deleteInstanceDialogs: [[false]],
    transformInstanceDialogs: [[false]],
    selectedImage: '',
    defaultInstance: {
      show: true,
      name: '',
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
            instances: [
              {
                show: true,
                name: '',
                position: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                rotation: { x: 0, y: 0, z: 0 }
              }
            ]
          }
        ]
      }
    },
    property: Object
  },
  created () {
  },
  methods: {
    ...mapActions({
      uploadImage: 'image/uploadImage'
    }),
    removeImage (i) {
      this.images.splice(i, 1)
      this.updateProperties({
        action: 'remove',
        entity: 'image'
      })
      this.closeDeleteImageDialog(i)
    },
    addInstance (image, i) {
      const scale = { x: image.width / 1000, y: image.height / 1000, z: 0.01 }
      if (image.instances) {
        this.images[i].instances.push({
          ...this.defaultInstance,
          scale,
          id: nanoid(6)
        })
      } else {
        this.images[i].instances = [
          { ...this.defaultInstance, scale, id: nanoid(6) }
        ]
      }
      this.updateProperties({
        action: 'create',
        entity: 'image',
        property: 'instance'
      })
    },
    removeImageInstance (i, ii) {
      this.images[i].instances.splice(ii, 1)
      this.updateProperties({
        action: 'remove',
        entity: 'image',
        property: 'instance'
      })
    },
    closeDeleteInstanceDialog (i, ii) {
      const clone = _cloneDeep(this.deleteInstanceDialogs)
      clone[i][ii] = false
      this.deleteInstanceDialogs = clone
    },
    closeDeleteImageDialog (i) {
      const clone = _cloneDeep(this.deleteImageDialogs)
      clone[i] = false
      this.deleteImageDialogs = clone
    },
    storeOriginalTransform (instance) {
      console.log('storing original transform:', instance)
      this.originalTransform = _cloneDeep(instance)
    },
    saveInstanceTransform (i, ii) {
      this.closeTransformDialog(i, ii)
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'transform'
      })
    },
    revertInstanceTransform (i, ii) {
      this.closeTransformDialog(i, ii)
      this.images[i].instances[ii] = this.originalTransform
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'transform'
      })
    },
    closeTransformDialog (i, ii) {
      const clone = _cloneDeep(this.transformInstanceDialogs)
      clone[i][ii] = false
      this.transformInstanceDialogs = clone
    },
    saveInstanceName () {
      this.updateProperties({
        action: 'update',
        entity: 'image',
        property: 'instanceName'
      })
    },
    saveImageName () {
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
      e.target.value = null
      this.deleteInstanceDialogs.push([])
      this.transformInstanceDialogs.push([])
      const img = new Image()
      const uploadImageRes = await this.uploadImage(options)
      const imageJson = await uploadImageRes.json()
      const imageLink = `${process.env.VUE_APP_API_URL}/${imageJson.path}`
      img.src = imageLink
      img.onload = () => {
        const height = img.height,
          width = img.width,
          instances = [
            {
              ...this.defaultInstance,
              scale: { x: width / 1000, y: height / 1000, z: 0.01 }
            }
          ]
        this.images.push({
          id: imageJson.id,
          name: options.image.name,
          height,
          width,
          imageLink,
          show: true,
          instances
        })
        this.updateProperties({ action: 'create', entity: 'image' })
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
          width = img.width,
          aspectRatio = width / height,
          sameSize =
            image.transform.x == width / 1000 &&
            image.transform.y == height / 1000,
          transform = image.transform

        if (sameSize) {
          //don't adjust scale
        } else if (aspectRatio > 1) {
          transform.scale = {
            x: image.transform.scale.x,
            y: image.transform.scale.x / aspectRatio,
            z: image.transform.scale.z
          }
        } else if (aspectRatio < 1) {
          transform.scale = {
            x: image.transform.scale.y / aspectRatio,
            y: image.transform.scale.y,
            z: image.transform.scale.z
          }
        } else if (width > height) {
          transform.scale = {
            x: image.transform.scale.x,
            y: image.transform.scale.x,
            z: image.transform.scale.z
          }
        } else if (height < width) {
          transform.scale = {
            x: image.transform.scale.y,
            y: image.transform.scale.y,
            z: image.transform.scale.z
          }
        }

        const clonedImages = [...this.images]
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
          property: 'link'
        })
      }
    },
    async duplicateImage (copied, i) {
      let dupeNumber = 0
      this.images.forEach(image => {
        if (image.name.includes(copied.name)) {
          dupeNumber++
        }
      })
      this.images.splice(i + 1, 0, {
        id: copied.id,
        name: copied.name + ' ' + dupeNumber,
        imageLink: copied.imageLink,
        transform: copied.transform,
        show: copied.show
      })
      this.updateProperties({ action: 'create', entity: 'image' })
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', { wssMessages })
    }
  }
}
</script>
