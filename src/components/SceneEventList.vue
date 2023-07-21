<template>
  <div>
    <div class="d-flex mx-auto align-baseline justify-start">
      <div class="text-h5 flex-grow-1">Events</div>
      <v-btn small @click="$refs.fileInput.click()">
        <v-icon small class="mr-1">mdi-plus</v-icon>
        Link Event
      </v-btn>
    </div>

    <input style="display: none" ref="fileInput" type="file" accept=".png,.jpg,.jpeg" @change="addImage" />
    <div v-if="images.length < 1" class="mt-6">
      <div class="text-body-1 text-center">There are no events linked to this this scene</div>
    </div>
    <div v-if="images.length > 0">
      <v-container>
        <v-row>
          <v-col md="4" sm="12" v-for="(image, i) in images" :key="image.id">
            <v-card>
              <event-card v-if="images.length > 0" :image="image" :i="i" :property="property" @updateProperties="updateProperties" @onReplace="replaceImage" @onRemove="removeImage(i)" @handleDialog="handleDialog" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import EventCard from "./EventCard";

export default {
  components: {
    EventCard,
  },
  name: "SceneImageList",
  data: () => ({
    clickEventDialog: false,
    propertiesDialog: false,
    transformDialog: false,
    deleteDialog: false,
    detailedMode: true,
    selectedImage: "",
    dialogCallback: () => {},
  }),
  props: {
    images: {
      type: Array,
      default: function () {
        return [];
      },
    },
    property: Object,
  },
  methods: {
    updateProperties(wssMessages) {
      this.$emit("updateProperties", { wssMessages });
    },
  },
};
</script>
