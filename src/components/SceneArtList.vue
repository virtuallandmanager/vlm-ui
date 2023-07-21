<template>
  <content-sub-panel :loading="false" :hasContent="art.length > 0" loadingMessage="Loading art...">
    <template v-slot:header>
      <div class="h4">Art</div>
      <v-spacer></v-spacer>
      <v-btn @click="newImage()" class="mr-4" v-if="art?.length">
        <v-icon class="mr-2">mdi-image</v-icon>
        New Image
      </v-btn>
      <v-btn @click="newNft()" disabled v-if="art?.length">
        <v-icon class="mr-2">mdi-image-frame</v-icon>
        New NFT
      </v-btn>
    </template>
    <template v-slot:no-content-header> No Art Has Been Added </template>
    <template v-slot:no-content-text>
      <div v-if="sometimesLlama">{{ sometimesLlama }}</div>
      <div class="d-flex justify-center pa-4"><v-img position="center center" max-width="250px" :src="luckyLlama" v-if="sometimesLlama" /></div>
      Would you like to add something{{ sometimesLlama ? " else" : "" }}?
    </template>
    <template v-slot:no-content-cta>
      <v-btn @click="newImage()" class="mr-4">
        <v-icon class="mr-2">mdi-image</v-icon>
        New Image
      </v-btn>
      <v-btn @click="newNft()" disabled>
        <v-icon class="mr-2">mdi-image-frame</v-icon>
        New NFT
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
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import SceneImageCard from "./SceneImageCard";
import SceneNftCard from "./SceneNftCard";
import ContentSubPanel from "./ContentSubPanel";
import llama from "@/assets/lucky_llama.jpg";

export default {
  components: {
    ContentSubPanel,
    SceneImageCard,
    SceneNftCard,
  },
  name: "SceneArtList",
  data: () => ({
    luckyLlama: llama,
    newImageDialog: false,
    newNftDialog: false,
    nftWalletDialog: false,
    otherNftDialog: false,
    externalImageDialog: false,
    showNftDialogError: false,
    externalImageMode: false,
    detailedMode: true,
    selectedImage: "",
    newImageSrc: "",
    nftDetails: {
      chain: 1,
      contractAddress: "",
      tokenId: "",
    },
    nftBlockchains: [
      { value: 1, text: "Ethereum", selected: true },
      { value: 137, text: "Polygon" },
    ],
    dialogCallback: () => {},
  }),
  computed: {
    ...mapGetters({ activePreset: "scene/activePreset", sceneImages: "scene/sceneImages", sceneNfts: "scene/sceneNfts" }),
    sometimesLlama() {
      const randomNumber = Math.floor(Math.random() * 100);
      if (randomNumber > -10) {
        return "But here's a Virtual Llama to keep you company.";
      } else {
        return "";
      }
    },
    art() {
      if (!this.$store?.state?.scene?.activePreset) {
        return [];
      }

      const artArray = [...this.sceneImages, ...this.sceneNfts];

      if (artArray.length) {
        return this.sortByCreatedAt(artArray);
      } else {
        return [];
      }
    },
  },

  methods: {
    ...mapActions({
      createSceneElement: "scene/createSceneElement",
      updateSceneElement: "scene/updateSceneElement",
      uploadImage: "image/uploadImage",
    }),
    sortByCreatedAt(objects) {
      return objects.sort((a, b) => {
        const createdAtA = a.createdAt;
        const createdAtB = b.createdAt;
        return createdAtA - createdAtB;
      });
    },
    validateExternalLink(value) {
      if (!value) {
        this.hasErrors = true;
        return "Enter a website URL";
      } else if (value.includes("https://")) {
        this.hasErrors = false;
        return true;
      } else {
        this.hasErrors = true;
        return "Must use https:// links";
      }
    },
    async replaceImage(options) {
      this.updateSceneElement({
        action: "update",
        element: "image",
        property: "imageLink",
        elementData: options.image,
        id: options.image.customId || options.image.sk,
      });
    },
  },
};
</script>
