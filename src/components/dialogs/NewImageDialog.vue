<template>
  <div>
    <v-dialog v-model="newImageDialog" width="600">
      <v-card>
        <v-card-title class="text-h5 primary"> New Image </v-card-title>

        <v-card-text>
          <div class="d-flex justify-space-between pt-6">
            <v-card class="mr-4 pa-6 text-center grey darken-2 flex-grow-1" @click="newExternalImage">
              <v-icon x-large>mdi-link</v-icon>
              <div class="text-button font-weight-heavy">Enter A URL</div>
            </v-card>
            <v-card class="ml-4 pa-6 text-center grey darken-2 flex-grow-1" @click="$refs.fileInput.click()">
              <v-icon x-large>mdi-laptop</v-icon>
              <div class="text-button">Upload From Computer</div>
            </v-card>
            <input style="display: none" ref="fileInput" type="file" accept=".png,.jpg,.jpeg" @change="newImageUpload()" />
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="resetNewImageDialog()">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="externalImageDialog" width="600">
      <v-card>
        <v-card-title class="text-h5 primary">Externally Hosted Image</v-card-title>
        <v-card-text class="pt-6">
          <v-text-field v-model="newImageSrc" label="Image URL" :rules="[validateExternalLink]" dense></v-text-field>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="addExternalImage()">Add Image</v-btn>
          <v-btn text color="grey" @click="resetNewImageDialog()">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="newNftDialog" width="600">
      <v-card>
        <v-card-title class="text-h5 primary"> New NFT </v-card-title>

        <v-card-text>
          <div class="d-flex justify-space-between pt-6">
            <v-card class="mr-4 pa-6 text-center grey darken-2 flex-grow-1 grey--text">
              <v-icon x-large class="grey--text">mdi-wallet</v-icon>
              <div class="text-button font-weight-heavy">Import From Wallet</div>
              <div class="text-caption font-weight-heavy">Coming Soon!</div>
            </v-card>
            <v-card class="ml-4 pa-6 text-center grey darken-2 flex-grow-1" @click="showOtherNFTDialog()">
              <v-icon x-large>mdi-image-frame</v-icon>
              <div class="text-button">Other NFT</div>
              <div class="text-caption font-weight-heavy">By Contract Address & Token ID</div>
            </v-card>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="resetNewNftDialog()">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="otherNftDialog" width="600">
      <v-card>
        <v-card-title class="text-h5 primary"> New NFT </v-card-title>
        <v-card-text class="pt-6">
          <v-select v-model="nftDetails.chain" :items="nftBlockchains" label="Blockchain"></v-select>
          <v-text-field v-model="nftDetails.contractAddress" label="Contract Address" @input="showNftDialogError = false"></v-text-field>
          <v-text-field v-model="nftDetails.tokenId" label="Token ID" @input="showNftDialogError = false"></v-text-field>
          <div class="error--text" v-if="showNftDialogError">Please enter a value for all fields.</div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="addNft()">Add NFT</v-btn>
          <v-btn text color="grey" @click="resetOtherNftDialog()">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { SceneImage } from "../models/SceneImage";
import { SceneNft } from "../models/SceneNft";

export default {
  name: "NewImageDialog",
  data: () => ({
    newImageDialog: false,
    externalImageDialog: false,
    newNftDialog: false,
    otherNftDialog: false,
    nftWalletDialog: false,
  }),
  mounted() {},
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
  methods: {
    newImage() {
      this.newImageDialog = true;
    },
    async newNft() {
      this.newNftDialog = true;
    },
    showNFTWalletDialog() {
      this.newNftDialog = false;
      this.otherNftDialog = false;
      this.nftWalletDialog = true;
    },
    showOtherNFTDialog() {
      this.newNftDialog = false;
      this.otherNftDialog = true;
    },
    resetOtherNftDialog() {
      this.newImageDialog = false;
      this.otherNftDialog = false;
    },
    async resetNewImageDialog() {
      this.newImageDialog = false;
      this.externalImageDialog = false;
      this.newImageSrc = "";
    },
    async resetNewNftDialog() {
      this.newNftDialog = false;
      this.otherNftDialog = false;
      this.nftWalletDialog = false;
    },
    async newExternalImage() {
      this.newImageDialog = false;
      this.externalImageDialog = true;
    },
    async addNft() {
      if (this.nftDetails.contractAddress && this.nftDetails.tokenId) {
        const newNft = new SceneNft({
          ...this.nftDetails,
        });
        this.createSceneElement({
          element: "nft",
          elementData: newNft,
        });
        this.resetNewNftDialog();
      } else {
        this.showNftDialogError = true;
      }
    },
    async addExternalImage() {
      const img = new Image();
      img.src = this.newImageSrc;
      img.onload = () => {
        const height = img.height,
          width = img.width,
          newImage = new SceneImage({
            name: this.newImageSrc,
            height,
            width,
            imageLink: this.newImageSrc,
          });

        this.resetNewImageDialog();
        this.createSceneElement({
          element: "image",
          elementData: newImage,
        });
      };
    },
    async addImageUpload(e) {
      const options = {
        image: e.target.files[0],
        sceneId: this.property.baseParcel,
      };
      e.target.value = null;
      const img = new Image();
      const uploadImageRes = await this.uploadImage(options);
      const imageJson = await uploadImageRes.json();
      const imageLink = `${process.env.VUE_APP_API_URL}/${imageJson.path}`;
      img.src = imageLink;
      img.onload = () => {
        const height = img.height,
          width = img.width,
          newImage = {
            ...new SceneImage(),
            name: options.image.name,
            height,
            width,
            imageLink,
          };

        this.createSceneElement({
          element: "image",
          elementData: newImage,
        });

        this.resetNewImageDialog();
      };
    },
    async replaceImage(image, i) {
      const options = {
        image: this.$refs.replaceFileInput.files[0],
        baseParcel: this.property.baseParcel,
        id: image.id,
      };
      this.$refs.replaceFileInput.value = null;
      const img = new Image();
      const uploadImageRes = await this.uploadImage(options);
      const imageJson = await uploadImageRes.json();
      const imageLink = `${process.env.VUE_APP_API_URL}/${imageJson.path}`;
      this.imageLink = imageLink;
      img.src = this.imageLink;
      img.onload = () => {
        const height = img.height,
          width = img.width;

        this.$emit("onReplace", {
          i,
          image: {
            ...image,
            id: image.id,
            imageLink: this.imageLink,
            height,
            width,
          },
        });
      };
    },
    complete() {
      this.show = false;
      this.$emit("onComplete");
    },
    cancel() {
      this.show = false;
    },
  },
};
</script>
