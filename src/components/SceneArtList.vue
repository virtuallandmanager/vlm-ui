<template>
  <div>
    <input type="file" ref="fileInput" accept="image/*" style="display: none" @change="onFileSelected" />
    <v-dialog v-model="newImageDialog" width="500">
      <v-card>
        <v-card-title class="text-h5"> {{ localeText('Add New Image') }} </v-card-title>

        <v-card-text class="d-flex justify-space-between lighten-1">
          <v-card class="flex-grow-1 text-center pa-4 mr-2" @click.stop="selectImage">
            <v-icon>mdi-file-image</v-icon>
            <div class="text-button">{{ localeText('From My Computer') }}</div>
          </v-card>
          <v-card class="flex-grow-1 text-center pa-4 ml-2" @click.stop="showExternalUrlDialog">
            <v-icon>mdi-link-variant</v-icon>
            <div class="text-button">{{ localeText('From URL') }}</div>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="externalImageDialog" width="500">
      <v-card>
        <v-card-title class="text-h5"> {{ localeText('Add Image From URL') }} </v-card-title>

        <v-card-text class="d-flex justify-space-between lighten-1">
          <v-text-field v-model="newImageSrc" label="Image URL" prepend-icon="mdi-file-image"> </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="resetDialogs">{{ actionText('Cancel') }}</v-btn>
          <v-btn color="primary" text @click="createExternalImage">{{ actionText('Create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <content-sub-panel :loading="false" :hasContent="art.length > 0" loadingMessage="Loading art...">
      <template v-slot:header>
        <div class="h4">Art</div>
        <v-spacer></v-spacer>
        <v-btn @click="showNewImageDialog()" class="mr-4" v-if="art?.length">
          <v-icon class="mr-2">mdi-plus</v-icon>
          Image
        </v-btn>
        <v-btn @click="showNewNFTDialog()" disabled v-if="art?.length">
          <v-icon class="mr-2">mdi-plus</v-icon>
          NFT
        </v-btn>
      </template>
      <template v-slot:no-content-header> {{ localeText('NoData') }} </template>
      <template v-slot:no-content-text>
        <div v-if="sometimesLlama">{{ sometimesLlama }}</div>
        <div class="d-flex justify-center pa-4"><v-img position="center center" max-width="250px" :src="luckyLlama" v-if="sometimesLlama" /></div>
        {{ localeText('CTA') }}
      </template>
      <template v-slot:no-content-cta>
        <v-btn @click.stop="showNewImageDialog" class="mr-4">
          <v-icon class="mr-2">mdi-plus</v-icon>
          {{ localeText('Image') }}
        </v-btn>
        <v-btn @click.stop="showNewNFTDialog" disabled>
          <v-icon class="mr-2">mdi-plus</v-icon>
          {{ localeText('NFT') }}
        </v-btn>
      </template>

      <v-container fluid class="pa-0">
        <v-row>
          <v-col md="4" sm="6" xs="12" v-for="(artwork, i) in art" :key="artwork.sk">
            <div v-if="artwork.pk == 'vlm:scene:image'">
              <scene-image-card :image="artwork" :i="i" />
            </div>
            <div v-if="artwork.pk == 'vlm:scene:nft'">
              <scene-nft-card :nft="artwork" :i="i" />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </content-sub-panel>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import SceneImageCard from './SceneImageCard'
import SceneNftCard from './SceneNftCard'
import { SceneImage } from '@/models/SceneImage'
import ContentSubPanel from './ContentSubPanel'
import llama from '@/assets/lucky_llama.jpg'

export default {
  components: {
    ContentSubPanel,
    SceneImageCard,
    SceneNftCard,
  },
  name: 'SceneArtList',
  data: () => ({
    creatingNewItem: false,
    luckyLlama: llama,
    newImageDialog: false,
    newNftDialog: false,
    nftWalletDialog: false,
    otherNftDialog: false,
    externalImageDialog: false,
    showNftDialogError: false,
    externalImageMode: false,
    detailedMode: true,
    selectedImage: '',
    newImageSrc: '',
    newImage: {},
    nftDetails: {
      chain: 1,
      contractAddress: '',
      tokenId: '',
    },
    nftBlockchains: [
      { value: 1, text: 'Ethereum', selected: true },
      { value: 137, text: 'Polygon' },
    ],
  }),
  computed: {
    ...mapGetters({
      activePreset: 'scene/activePreset',
      sceneImages: 'scene/sceneImages',
      sceneNfts: 'scene/sceneNfts',
      localeText: 'i18n/art',
      actionText: 'i18n/actions',
    }),
    sometimesLlama() {
      const randomNumber = Math.floor(Math.random() * 100)
      if (randomNumber < 10) {
        return "But here's a Virtual Llama to keep you company."
      } else {
        return ''
      }
    },
    art() {
      if (!this.$store?.state?.scene?.activePreset) {
        return []
      }

      const artArray = [...this.sceneImages, ...this.sceneNfts]

      if (artArray.length) {
        return this.sortByCreatedAt(artArray)
      } else {
        return []
      }
    },
  },

  methods: {
    ...mapActions({
      createSceneElement: 'scene/createSceneElement',
      updateSceneElement: 'scene/updateSceneElement',
      uploadImage: 'media/uploadUserImage',
    }),
    resetDialogs() {
      this.newImageDialog = false
      this.externalImageDialog = false
      this.newNftDialog = false
    },
    selectImage() {
      this.$refs.fileInput.click()
    },
    createExternalImage() {
      const objThis = this
      const currentImage = objThis.newImage || {}
      if (this.validateExternalLink(this.newImageSrc) === true) {
        let img = new Image()
        img.src = this.newImageSrc
        img.onload = function () {
          currentImage.width = this.width
          currentImage.height = this.height
          currentImage.textureSrc = ''
          currentImage.thumbnailSrc = ''
          currentImage.externalUrl = true
          const newImage = new SceneImage({
            ...currentImage,
            name: objThis.stripFilenameAndExtension(this.src),
            imageSrc: this.src,
            externalUrl: true,
          })

          objThis.createSceneElement({ element: 'image', elementData: newImage })
          objThis.newImageSrc = ''
          objThis.resetDialogs()
        }
      }
    },
    stripFilenameAndExtension(url) {
      // Use the URL constructor to parse the URL
      const parsedUrl = new URL(url)

      // Get the pathname from the URL
      let path = parsedUrl.pathname

      // Find the last index of '/' in the path
      const lastSlashIndex = path.lastIndexOf('/')

      // If there is a slash, slice the path up to the last slash
      if (lastSlashIndex !== -1) {
        path = path.slice(0, lastSlashIndex + 1)
      }

      return path
    },
    async onFileSelected(e) {
      this.resetDialogs()
      const options = {
        image: e.target.files[0],
      }
      e.target.value = null

      try {
        const uploadImageRes = await this.uploadImage(options)
        const imageSrc = `${process.env.VUE_APP_API_URL}/${uploadImageRes.imageSrc}`
        const textureSrc = `${process.env.VUE_APP_API_URL}/${uploadImageRes.textureSrc}`
        const thumbnailSrc = `${process.env.VUE_APP_API_URL}/${uploadImageRes.thumbnailSrc}`
        const metadata = uploadImageRes.metadata

        const newImage = new SceneImage({
          name: metadata.name,
          height: metadata.height,
          width: metadata.width,
          density: metadata.density,
          imageSrc,
          textureSrc,
          thumbnailSrc,
        })

        await this.createImage(newImage)
      } catch (err) {
        console.log(err)
      }
    },
    async createImage(image) {
      return await this.createSceneElement({
        element: 'image',
        elementData: image,
      })
    },
    sortByCreatedAt(objects) {
      return objects.sort((a, b) => {
        const createdAtA = a.createdAt
        const createdAtB = b.createdAt
        return createdAtA - createdAtB
      })
    },
    validateExternalLink(value) {
      if (!value) {
        this.hasErrors = true
        return 'Enter a website URL'
      } else if (value.includes('https://')) {
        this.hasErrors = false
        return true
      } else {
        this.hasErrors = true
        return 'Must use https:// links'
      }
    },
    showNewImageDialog() {
      this.newImageDialog = true
    },
    showExternalUrlDialog() {
      this.externalImageDialog = true
      this.newImageDialog = false
    },
    showNewNFTDialog() {
      this.newNftDialog = true
    },
    newNft() {
      this.newImageDialog = true
    },
    async replaceImage(options) {
      this.updateSceneElement({
        action: 'update',
        element: 'image',
        property: 'imageLink',
        elementData: options.image,
        id: options.image.customId || options.image.sk,
      })
    },
  },
}
</script>
