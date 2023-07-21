<template>
  <div>
    <div class="d-flex pa-6 mx-auto align-baseline justify-start">
      <div class="text-h5 flex-grow-1">Image Libary</div>
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
      <div class="text-body-1 text-center">
        There are no images in your library.
      </div>
    </div>
    <div v-if="images.length > 0" class="mt-6">
      <v-card
        v-for="(folder, i) in folders"
        :key="i"
        class="text-body-1 text-center"
      >
        <v-icon>mdi-folder</v-icon>
        <v-icon>{{ folder }}</v-icon>
      </v-card>
      <v-card
        v-for="(image, i) in image"
        :key="i"
        class="text-body-1 text-center"
      >
        <v-img :src="image" />
      </v-card>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "ImageLibrary",
  props: {
    folderPath: String,
  },
  data: () => ({
    ...mapGetters({
      imageLibrary: "image/library",
    }),
  }),
  methods: {
    ...mapActions({
      uploadImage: "image/uploadImage",
    }),
    folders() {
      return [];
    },
    images() {
      return [];
    },
  },
};
</script>
