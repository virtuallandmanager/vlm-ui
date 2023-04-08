<template>
  <div>
    <properties-dialog
      v-if="propertiesDialog"
      v-model="propertiesDialog"
      :entity="selectedVideo"
      entityType="video"
      @onChange="updateVideoProperties"
    />
    <properties-dialog
      v-if="instancePropertiesDialog"
      v-model="instancePropertiesDialog"
      :entity="selectedVideoInstance"
      entityType="video instance"
      @onChange="updateVideoInstanceProperties"
    />
    <delete-dialog
      v-if="deleteDialog"
      v-model="deleteDialog"
      :entity="video"
      entityType="video"
      :removeAll="true"
      @onRemove="removeVideo"
    />
    <delete-dialog
      v-if="deleteInstanceDialog"
      v-model="deleteInstanceDialog"
      :entity="selectedVideoInstance"
      entityType="video instance"
      @onRemove="removeInstance(selectedVideoInstance)"
    />
    <delete-dialog
      v-if="deletePlaylistItemDialog"
      v-model="deletePlaylistItemDialog"
      :entity="selectedPlaylistItem"
      entityType="video from playlist"
      @onRemove="removePlaylistItem(selectedPlaylistItem)"
      text="Are you sure you want to remove this video from the playlist?"
    />
    <div class="purple darken-3 pa-4">
      <div class="d-flex align-center">
        <div class="text-h5 white--text flex-grow-1" v-if="!editingName">
          {{ video.name }}
          <v-btn icon small dark @click="toggleEditMode()">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </div>
        <div class="text-h5" v-if="editingName">
          <v-text-field
            autofocus
            label="Video Name"
            v-model="video.name"
            hide-details="auto"
            append-outer-icon="mdi-content-save"
            @click:append-outer="toggleEditMode()"
            @blur="toggleEditMode()"
            dense
            @change="updateVideoName()"
          ></v-text-field>
        </div>
        <div class="flex-grow-1">
          <v-slider
            color="white"
            v-model="video.volume"
            @change="updateVolume"
            label="Volume"
            max="1"
            min="0"
            step=".1"
            class="mt-4 mb-0"
            dense
          ></v-slider>
          <v-slider
            color="white"
            v-model="video.emission"
            @change="updateEmission"
            label="Backlight"
            max="1"
            min="0"
            step=".1"
            dense
          ></v-slider>
        </div>
        <div>
          <v-btn
            icon
            dark
            @click="toggleVisibility()"
            :disabled="video.customRendering"
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  v-bind="attrs"
                  v-on="on"
                  :class="video.show ? '' : 'red--text'"
                >
                  {{ video.show ? "mdi-eye" : "mdi-eye-off" }}
                </v-icon>
              </template>
              <span>Show/Hide All</span>
            </v-tooltip>
          </v-btn>
          <v-btn icon dark @click.stop="openPropertiesDialog()">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
              </template>
              <span>Video Properties</span>
            </v-tooltip>
          </v-btn>
          <v-btn icon dark @click.stop="openDeleteDialog()">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
              </template>
              <span>Remove Video Screen</span>
            </v-tooltip>
          </v-btn>
        </div>
      </div>
    </div>
    <div class="grey darken-2">
      <h1 class="d-block text-body-1 font-weight-bold pa-4" dark>
        Video Source
      </h1>
    </div>
    <div class="my-0 pa-4 d-flex">
      <v-text-field
        v-model="video.liveLink"
        label="Live Video Link"
        hide-details="auto"
        :rules="[validateStreamLink]"
        @blur="updateLiveLink"
      >
      </v-text-field>
      <v-switch
        v-if="features.liveStreamToggle"
        v-model="video.enableLiveStream"
        :disabled="!this.video.liveLink"
        label="Enable Live Streaming"
        color="red"
        hide-details
        @change="updateLiveToggle"
        class="pl-6"
      ></v-switch>
    </div>

    <div class="my-0 pa-4">
      <v-select
        v-model="video.offType"
        label="Off Air Content"
        :items="offTypes"
        :persistent-hint="true"
        @change="updateOffType"
        hint="Off-air content is shown when the live video is disabled or not actively streaming"
      >
      </v-select>
    </div>
    <div v-if="video.offType == 1">
      <div class="d-flex justify-space-between align-center grey darken-2 pa-4">
        <h1 class="d-block text-body-1 font-weight-bold" dark>
          Video Playlist
        </h1>
        <v-btn @click="addVideo()"><v-icon>mdi-plus</v-icon> Add Video</v-btn>
      </div>
      <div
        v-for="(item, v) in video.playlist"
        :key="v"
        class="d-flex align-center pa-4"
      >
        <v-text-field
          v-model="video.playlist[v]"
          :label="`Video ${v + 1}`"
          placeholder="Enter Video URL"
          hide-details="true"
          @blur="updatePlaylist()"
          class="flex-grow-1"
        />
        <v-btn
          icon
          @click.stop="openPlaylistItemDeleteDialog(v)"
          v-if="video.playlist.length > 1"
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
            </template>
            <span>Remove Video</span>
          </v-tooltip>
        </v-btn>
      </div>
    </div>
    <div v-if="video.offType == 2">
      <div class="d-flex justify-space-between align-center grey darken-2 pa-4">
        <h1 class="d-block text-body-1 font-weight-bold">Image</h1>
      </div>
      <div class="px-4">
        <v-text-field
          v-model="video.offImageLink"
          label="Image Link"
          placeholder="Enter Image URL"
          @blur="updateOffImage"
        />
      </div>
      <div>
        <v-img
          max-height="250"
          max-width="250"
          contain
          :src="video.videoLink"
          class="mx-auto"
        ></v-img>
      </div>
    </div>
    <div class="d-flex justify-space-between align-center grey darken-2 pa-4">
      <h1 class="d-block text-body-1 font-weight-bold">Instances</h1>
      <v-btn @click="addInstance">
        <v-icon>mdi-plus</v-icon> Add Instance
      </v-btn>
    </div>
    <div>
      <div class="d-flex flex-column pa-4">
        <div class="text-body1 text-center" v-if="!video.instances.length">
          Add an instance for this video screen to see it in the scene.
        </div>
        <div v-for="(instance, i) in video.instances" :key="instance.id">
          <div class="d-flex mx-auto align-center">
            <div class="flex-grow-1">
              <v-text-field
                hide-details="true"
                v-model="instance.name"
                :label="`Instance ${i + 1}`"
                placeholder="Enter Instance Name"
                @blur="updateInstanceName(instance)"
              ></v-text-field>
            </div>
            <div class="mt-3">
              <v-btn
                icon
                @click="toggleVisibility(instance, i)"
                :disabled="video.customRendering || instance.customRendering"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      v-bind="attrs"
                      v-on="on"
                      :class="video.show && instance.show ? '' : 'red--text'"
                    >
                      {{
                        video.show && instance.show ? "mdi-eye" : "mdi-eye-off"
                      }}
                    </v-icon>
                  </template>
                </v-tooltip>
              </v-btn>
              <span>Show/Hide</span>
              <transform-dialog
                v-if="instance.transformDialog"
                v-model="instance.transformDialog"
                :entity="instance"
                entityType="video"
                @onChange="updateInstanceTransform(instance)"
              />
              <v-btn icon @click.stop="openTransformDialog(i)">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on"> mdi-axis-arrow </v-icon>
                  </template>
                  <span>Transform</span>
                </v-tooltip>
              </v-btn>
              <v-btn icon @click.stop="openInstancePropertiesDialog(i)">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
                  </template>
                  <span>Properties</span>
                </v-tooltip>
              </v-btn>
              <v-btn icon @click.stop="openInstanceDeleteDialog(i)">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
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
</template>

<script>
import Vue from "vue";
import { mapActions } from "vuex";
import PropertiesDialog from "./dialogs/PropertiesDialog";
import TransformDialog from "./dialogs/TransformDialog";
import DeleteDialog from "./dialogs/DeleteDialog";
import { SceneVideo } from "../models/SceneVideo";
import { SceneVideoInstance } from "../models/SceneVideoInstance";

export default {
  components: {
    PropertiesDialog,
    TransformDialog,
    DeleteDialog,
  },
  name: "SceneVideo",
  data: () => ({
    propertiesDialog: false,
    instancePropertiesDialog: false,
    deleteDialog: false,
    deleteInstanceDialog: false,
    deletePlaylistItemDialog: false,
    selectedPlaylistItem: "",
    editingName: false,
    offTypes: [
      { text: "None", value: 3 },
      { text: "Video Playlist", value: 1 },
      { text: "Image", value: 2 },
    ],
  }),
  props: {
    video: {
      type: Object,
      default: function () {
        return new SceneVideo();
      },
    },
    features: Object,
  },
  mounted() {},
  methods: {
    ...mapActions({
      uploadImage: "video/uploadImage",
    }),
    addVideo() {
      const nextItem = "";
      this.video.playlist.push(nextItem);
      this.updateProperties({
        action: "update",
        entity: "video",
        property: "playlist",
        id: this.video.id,
        entityData: this.video,
      });
    },

    addInstance() {
      const newInstance = new SceneVideoInstance();
      if (!this.video.instances) {
        this.video.instances = [];
      }
      this.video.instances.push(newInstance);
      this.updateProperties({
        action: "create",
        entity: "videoInstance",
        id: newInstance.id,
        entityData: this.video,
        instanceData: newInstance,
      });
    },
    removeVideo() {
      this.$emit("onRemove");
    },
    removeInstance() {
      const i = this.video.instances.findIndex(
          (instance) => instance.id == this.selectedVideoInstance.id
        ),
        instance = this.selectedVideoInstance;

      Vue.delete(this.video.instances, i);

      this.updateProperties({
        action: "delete",
        entity: "videoInstance",
        id: instance.id,
        entityData: this.video,
        instanceData: instance,
      });
    },
    removePlaylistItem() {
      const i = this.video.playlist.findIndex(
        (video) => video == this.selectedPlaylistItem
      );

      Vue.delete(this.video.playlist, i);

      this.updateProperties({
        action: "update",
        entity: "video",
        property: "playlist",
        id: this.video.id,
        entityData: this.video,
      });
    },
    toggleEditMode() {
      this.editingName = !this.editingName;
    },
    toggleVisibility(instance, i) {
      if (instance) {
        Vue.set(this.video.instances[i], "show", !this.video.instances[i].show);
        this.updateProperties({
          action: "update",
          entity: "videoInstance",
          property: "visibility",
          id: instance.id,
          entityData: this.video,
          instanceData: instance,
        });
      } else {
        this.video.show = !this.video.show;
        this.updateProperties({
          action: "update",
          entity: "video",
          property: "visibility",
          id: this.video.id,
          entityData: this.video,
        });
      }
    },
    toggleLiveStream() {
      this.updateProperties({
        action: "update",
        entity: "video",
        property: "type",
        id: this.video.id,
        entityData: this.video,
      });
    },
    updateVideoProperties() {
      this.updateProperties({
        action: "update",
        entity: "video",
        property: "properties",
        id: this.video.id,
        entityData: this.video,
      });
    },
    openClickEventDialog() {
      this.selectedImage = this.video;
      this.clickEventDialog = true;
    },
    openPropertiesDialog() {
      this.selectedVideo = this.video;
      this.propertiesDialog = true;
    },
    openDeleteDialog() {
      this.deleteDialog = true;
    },
    openInstancePropertiesDialog(i) {
      this.selectedVideoInstance = this.video.instances[i];
      this.instancePropertiesDialog = true;
    },
    openInstanceDeleteDialog(i) {
      this.selectedVideoInstance = this.video.instances[i];
      this.deleteInstanceDialog = true;
    },
    openPlaylistItemDeleteDialog(i) {
      this.selectedPlaylistItem = this.video.playlist[i];
      this.deletePlaylistItemDialog = true;
    },
    openTransformDialog(i) {
      Vue.set(this.video.instances[i], "transformDialog", true);
    },
    updateVideoInstanceProperties(instance) {
      this.updateProperties({
        action: "update",
        entity: "videoInstance",
        property: "properties",
        id: this.video.id,
        entityData: this.video,
        instanceData: instance,
      });
    },
    updateVideoName() {
      this.updateProperties({
        action: "update",
        entity: "video",
        property: "name",
        id: this.video.id,
        entityData: this.video,
      });
    },
    updateInstanceName(instance) {
      this.updateProperties({
        action: "update",
        entity: "videoInstance",
        property: "name",
        id: instance.id,
        entityData: this.video,
        instanceData: instance,
      });
    },
    updateInstanceTransform(instance) {
      this.updateProperties({
        action: "update",
        entity: "videoInstance",
        property: "transform",
        id: instance.id,
        entityData: this.video,
        instanceData: instance,
      });
    },
    updateLiveLink() {
      if (!this.video.liveLink) {
        this.video.enableLiveStream = false;
      }
      this.updateProperties({
        action: "update",
        entity: "video",
        property: "liveLink",
        id: this.video.id,
        entityData: this.video,
      });
    },
    updateLiveToggle() {
      this.updateProperties({
        action: "update",
        entity: "video",
        property: "enableLiveStream",
        id: this.video.id,
        entityData: this.video,
      });
    },
    updateVolume() {
      this.updateProperties({
        action: "update",
        entity: "video",
        property: "volume",
        id: this.video.id,
        entityData: this.video,
      });
    },
    updateEmission() {
      this.updateProperties({
        action: "update",
        entity: "video",
        property: "emission",
        id: this.video.id,
        entityData: this.video,
      });
    },
    updatePlaylist() {
      this.updateProperties({
        action: "update",
        entity: "video",
        property: "playlist",
        id: this.video.id,
        entityData: this.video,
      });
    },
    updateOffType() {
      this.updateProperties({
        action: "update",
        entity: "video",
        property: "offType",
        id: this.video.id,
        entityData: this.video,
      });
    },
    updateOffImage() {
      this.updateProperties({
        action: "update",
        entity: "video",
        property: "offImage",
        id: this.video.id,
        entityData: this.video,
      });
    },
    updateProperties(wssMessages) {
      this.$emit("updateProperties", wssMessages);
    },
    validateStreamLink(value) {
      if (value && value.includes("http://")) {
        return "Insecure url detected - Must be an https:// link";
      } else if (value && !value.includes("https://")) {
        return "Stream url must include https://";
      } else if (value && !value.includes(".m3u8")) {
        return "Stream format must be a .m3u8";
      } else {
        return true;
      }
    },
  },
};
</script>
