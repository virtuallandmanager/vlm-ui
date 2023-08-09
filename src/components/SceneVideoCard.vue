<template>
  <v-card elevation="6">
    <div class="d-flex justify-space-between align-center primary pa-4">
      <div class="text-h6" v-if="!editingName">
        {{ truncatedName }}
      </div>
      <v-tooltip v-if="!editingName" top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" class="d-flex-grow-0" icon small dark @click="toggleEditMode()"
            v-if="!editingName">
            <v-icon small>mdi-rename</v-icon>
          </v-btn>
        </template>
        <span>Rename</span>
      </v-tooltip>

      <div class="text-h5 flex-grow-1" v-if="editingName">
        <v-text-field autofocus outlined color="white" label="Video Screen Name" v-model="video.name" hide-details="auto"
          append-outer-icon="mdi-content-save" @click:append-outer="toggleEditMode()" @blur="toggleEditMode()" dense
          @change="editSoundName()"></v-text-field>
      </div>
    </div>
    <div class="black d-flex justify-end align-center pa-2">
      <div class="flex-grow-1">
        <v-slider color="white" v-model="video.volume" @change="updateVolume" prepend-icon="mdi-volume-high" max="1"
          min="0" step=".1" class="ma-0" dense hide-details="auto"></v-slider>
        <v-slider color="white" v-model="video.emission" @change="updateEmission"
          prepend-icon="mdi-television-ambient-light" max="1" min="0" step=".1" class="ma-0" dense
          hide-details="auto"></v-slider>
      </div>
      <v-btn icon dark @click="toggleVisibility()" :disabled="video.customRendering">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on" :class="video.enabled ? '' : 'red--text'">
              {{ video.enabled ? "mdi-eye" : "mdi-eye-off" }}
            </v-icon>
          </template>
          <span>Show/Hide All</span>
        </v-tooltip>
      </v-btn>
      <v-btn icon dark @click.stop="showClickEventDialog({
        element: 'video',
        elementData: video,
      })">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-mouse </v-icon>
          </template>
          <span>Click Action</span>
        </v-tooltip>
      </v-btn>
      <v-btn icon dark @click.stop="showPropertiesDialog({
        element: 'video',
        elementData: video,
      })">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
          </template>
          <span>Video Properties</span>
        </v-tooltip>
      </v-btn>
      <v-btn icon dark @click.stop="
        showDeleteDialog({
          element: 'video',
          elementData: video,
        })
        ">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
          </template>
          <span>Remove Video Screen</span>
        </v-tooltip>
      </v-btn>
    </div>
    <div class="pa-4 grey darken-4">
      <v-img :src="video.offImageSrc" v-if="video.offType == 1 && (!videoState || !video.enableLiveStream)"
        :contain="true"></v-img>
      <video-stream-player :src="video.liveSrc" @updateVideoState="updateVideoState" />
      <div class="d-flex justify-space-between mt-2">
        <v-chip small label>Showing:</v-chip>
        <v-chip small label color="success" class="text-center" v-if="videoState && video.enableLiveStream">
          <v-icon class="mr-1" x-small>mdi-video</v-icon>LIVE STREAM
        </v-chip>
        <v-chip small label class="text-center" v-if="video.offType == 0 && (!videoState || !video.enableLiveStream)">
          NOTHING
        </v-chip>
        <v-chip small label color="primary" class="text-center"
          v-if="video.offType == 1 && (!videoState || !video.enableLiveStream)">
          <v-icon class="mr-1" x-small>mdi-image-area</v-icon>OFF-AIR IMAGE
        </v-chip>
        <v-chip small label color="primary" class="text-center"
          v-if="video.offType == 2 && (!videoState || !video.enableLiveStream)">
          <v-icon class="mr-1" x-small>mdi-playlist-play</v-icon>OFF-AIR PLAYLIST
        </v-chip>
      </div>
    </div>
    <div class="grey darken-2 d-flex justify-space-between align-center">
      <h1 class="d-block text-body-1 font-weight-bold pa-4" dark>Video Source</h1>
      <v-switch v-model="video.enableLiveStream" :disabled="!video.liveSrc" label="Enable Live Streaming" color="red"
        hide-details @change="updateLiveToggle" class="ma-0 pr-4"></v-switch>
    </div>
    <div class="my-0 pa-4 d-flex">
      <v-text-field outlined v-model="video.liveSrc" label="Live Video Link" hide-details="auto"
        :rules="[validateStreamLink]" :persistent-hint="true" @blur="updateLiveSrc"
        hint="Enter a .m3u8 link to enable live streaming"> </v-text-field>
    </div>

    <div class="my-0 pa-4">
      <v-select outlined v-model="video.offType" label="Off Air Content" :items="offTypes" :persistent-hint="true"
        @change="updateOffType()" hint="Off-air content is shown when the live video is disabled or not actively streaming">
      </v-select>
    </div>
    <div v-if="video.offType == 2">
      <div class="d-flex justify-space-between align-center grey darken-2 pa-4">
        <h1 class="d-block text-body-1 font-weight-bold" dark>Video Playlist</h1>
        <v-btn @click="addVideo()"><v-icon>mdi-playlist-plus</v-icon></v-btn>
      </div>
      <div v-for="(item, v) in video.playlist" :key="v" class="d-flex align-center pa-4">
        <v-text-field outlined v-model="video.playlist[v]" :label="`Video ${v + 1}`" placeholder="Enter Video URL"
          hide-details="true" @blur="updatePlaylist()" class="flex-grow-1" />
        <v-btn icon @click.stop="removePlaylistItem(v)" v-if="video.playlist.length > 1">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
            </template>
            <span>Remove Video</span>
          </v-tooltip>
        </v-btn>
      </div>
    </div>
    <div v-if="video.offType == 1">
      <div class="d-flex justify-space-between align-center grey darken-2 pa-4">
        <h1 class="d-block text-body-1 font-weight-bold">Image</h1>
      </div>
      <!-- <div class="px-4"> -->
      <!-- <v-btn>Use External Image</v-btn> -->
      <!-- <v-btn>Image from Library</v-btn> -->
      <!-- <v-btn>New Image</v-btn> -->
      <!-- </div> -->
      <div class="px-4 pt-6">
        <v-text-field outlined v-model="video.offImageSrc" label="Image Link" placeholder="Enter Image URL"
          @blur="updateOffImage" />
      </div>
      <div>
        <v-img max-height="250" max-width="250" contain :src="video.videoLink" class="mx-auto"></v-img>
      </div>
    </div>
    <div class="d-flex justify-space-between align-center grey darken-2 pa-4">
      <h1 class="d-block text-body-1 font-weight-bold">Instances</h1>
      <v-btn @click="addInstance"> <v-icon>mdi-plus</v-icon> Add Instance </v-btn>
    </div>
    <div>
      <div class="d-flex flex-column pa-4">
        <div class="text-body-1 text-center" v-if="!video?.instances?.length">Add an instance for this video screen to see
          it in the scene.</div>
        <div v-for="(instance, i) in video.instances" :key="instance.id" :class="i > 0 ? 'mt-3' : ''">
          <video-instance-card :video="video" :instance="instance" />
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import Vue from "vue";
import { mapActions } from "vuex";
import { SceneVideo } from "../models/SceneVideo";
import { SceneVideoInstance } from "../models/SceneVideoInstance";
import VideoStreamPlayer from "./VideoStreamPlayer";
import VideoInstanceCard from "./VideoInstanceCard.vue";

export default {
  components: {
    VideoStreamPlayer,
    VideoInstanceCard,
  },
  name: "SceneVideoCard",
  data: () => ({
    propertiesDialog: false,
    instancePropertiesDialog: false,
    deleteDialog: false,
    deleteInstanceDialog: false,
    deletePlaylistItemDialog: false,
    selectedPlaylistItem: "",
    editingName: false,
    offTypes: [
      { text: "None", value: 0 },
      { text: "Image", value: 1 },
      { text: "Video Playlist", value: 2 },
    ],
    videoState: 0,
  }),
  props: {
    video: {
      type: Object,
      default: function () {
        return new SceneVideo();
      },
    },
  },
  computed: {
    truncatedName() {
      const videoNameArr = this.video && this.video.name.split("");
      let noSpacesLength = 0;
      let truncated = this.video.name;
      videoNameArr.forEach((char) => {
        if (char !== " ") {
          noSpacesLength++;
        } else {
          noSpacesLength = 0;
        }

        if (noSpacesLength > 18) {
          truncated = truncated.substr(truncated.length - 18);
          noSpacesLength = 0;
        }
      });

      if (truncated !== this.video.name) {
        return `...${truncated}`;
      } else {
        return this.video.name;
      }
    },
  },
  methods: {
    ...mapActions({
      showPropertiesDialog: "dialog/showPropertiesDialog",
      showClickEventDialog: "dialog/showClickEventDialog",
      showDeleteDialog: "dialog/showDeleteDialog",
      createSceneElement: "scene/createSceneElement",
      updateSceneElement: "scene/updateSceneElement",
      deleteSceneElement: "scene/deleteSceneElement",
    }),
    addVideo() {
      const nextItem = "";
      this.video.playlist.push(nextItem);
      this.updateSceneElement({
        action: "update",
        element: "video",
        property: "playlist",
        id: this.video.id,
        elementData: this.video,
      });
    },
    addInstance() {
      const newInstance = new SceneVideoInstance({
        name: `Instance ${this.video.instances.length + 1}`,
      });

      this.createSceneElement({
        element: "video",
        instance: true,
        id: newInstance.sk,
        elementData: this.video,
        instanceData: newInstance,
      });
    },
    removePlaylistItem(i) {
      Vue.delete(this.video.playlist, i);

      this.updateSceneElement({
        element: "video",
        property: "playlist",
        id: this.video.sk,
        elementData: this.video,
      });
    },
    toggleEditMode() {
      this.editingName = !this.editingName;
    },
    toggleVisibility(instance, i) {
      if (instance) {
        Vue.set(this.video.instances[i], "enabled", !this.video.instances[i].enabled);
        this.updateSceneElement({
          action: "update",
          element: "video",
          instance: true,
          property: "enabled",
          id: instance.sk,
          elementData: this.video,
          instanceData: instance,
        });
      } else {
        this.video.enabled = !this.video.enabled;
        this.updateSceneElement({
          action: "update",
          element: "video",
          property: "enabled",
          id: this.video.sk,
          elementData: this.video,
        });
      }
    },
    toggleLiveStream() {
      this.updateSceneElement({
        action: "update",
        element: "video",
        property: "enableLiveStream",
        id: this.video.sk,
        elementData: this.video,
      });
    },
    updateVideoProperties() {
      this.updateSceneElement({
        action: "update",
        element: "video",
        property: "properties",
        id: this.video.sk,
        elementData: this.video,
      });
    },
    updateVideoInstanceProperties(instance) {
      this.updateSceneElement({
        element: "video",
        instance: true,
        property: "properties",
        id: instance.sk,
        elementData: this.video,
        instanceData: instance,
      });
    },
    updateVideoName() {
      this.updateSceneElement({
        element: "video",
        property: "name",
        id: this.video.sk,
        elementData: this.video,
      });
    },
    updateInstanceName(instance) {
      this.updateSceneElement({
        element: "video",
        instance: true,
        property: "name",
        id: instance.sk,
        elementData: this.video,
        instanceData: instance,
      });
    },
    updateInstanceTransform(instance) {
      this.updateSceneElement({
        element: "video",
        instance: true,
        property: "transform",
        id: instance.sk,
        elementData: this.video,
        instanceData: instance,
      });
    },
    updateLiveSrc() {
      const video = { ...this.video };
      if (!video.liveSrc) {
        video.enableLiveStream = false;
      }
      this.updateSceneElement({
        element: "video",
        property: "liveSrc",
        id: video.sk,
        elementData: video,
      });
    },
    updateLiveToggle() {
      this.updateSceneElement({
        element: "video",
        property: "enableLiveStream",
        id: this.video.sk,
        elementData: this.video,
      });
    },
    updateVolume() {
      this.updateSceneElement({
        element: "video",
        property: "volume",
        id: this.video.sk,
        elementData: this.video,
      });
    },
    updateEmission() {
      this.updateSceneElement({
        element: "video",
        property: "emission",
        id: this.video.sk,
        elementData: this.video,
      });
    },
    updatePlaylist() {
      this.updateSceneElement({
        element: "video",
        property: "playlist",
        id: this.video.sk,
        elementData: this.video,
      });
    },
    updateOffType() {
      this.updateSceneElement({
        element: "video",
        property: "offType",
        id: this.video.sk,
        elementData: this.video,
      });
    },
    updateOffImage() {
      this.updateSceneElement({
        element: "video",
        property: "offImageSrc",
        id: this.video.sk,
        elementData: this.video,
      });
    },
    updateVideoState(state) {
      this.videoState = state;
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

<style scoped>
.visible {
  opacity: 1;
}

.hidden {
  opacity: 0;
}

.frosted {
  background-color: rgba(75, 75, 125, 0.3);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.cyberpunk-border {
  border: 1px solid rgb(128, 0, 255);
}
</style>
