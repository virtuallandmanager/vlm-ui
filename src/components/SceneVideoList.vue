<template>
  <div>
    <div class="d-flex pa-6 mx-auto align-baseline justify-space-between">
      <div class="text-h5">Video Screens</div>
      <v-btn @click="addVideoScreen()">
        <v-icon class="mr-1">mdi-plus</v-icon>
        Add Video Source
      </v-btn>
    </div>
    <v-row v-if="videos && videos.length < 1" class="mt-6">
      <v-col cols="12">
        <div class="text-body1 text-center">
          There are no video screens in this scene
        </div>
      </v-col>
    </v-row>
    <div v-if="videos && videos.length > 0">
      <div v-for="(video, i) in videos" :key="video.id">
        <video-card
          :video="video"
          :i="i"
          :features="features"
          @updateProperties="updateProperties"
          @onRemove="removeVideoScreen(i)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions } from 'vuex'
import VideoCard from './VideoCard'
import { SceneVideo } from '../models/SceneVideo'

export default {
  components: {
    VideoCard
  },
  name: 'SceneVideoList',
  data: () => ({
    deleteVideoDialog: false
  }),
  props: {
    videos: {
      type: Array,
      default: function () {
        return []
      }
    },
    features: Object,
  },
  methods: {
    ...mapActions({
      uploadImage: 'image/uploadImage'
    }),
    addVideoScreen () {
      const screenCount = this.videos.length + 1
      const nextItem = {
        ...new SceneVideo(),
        name: `Screen ${screenCount}`
      }

      this.videos.push(nextItem)

      window.scrollTo(
        0,
        document.body.scrollHeight || document.documentElement.scrollHeight
      )
    },
    removeVideoScreen (i) {
      const videoId = this.videos[i].id
      Vue.delete(this.videos, i)

      this.updateProperties({
        action: 'delete',
        entity: 'video',
        id: videoId,
        entityData: this.videos[i]
      })
    },
    toggleEditMode (i) {
      Vue.set(this.videos[i], 'editing', !this.videos[i].editing)

      if (!this.videos[i].editing && !this.videos[i].locked) {
        Vue.set(this.videos[i], 'id', this.videos[i].name.createSlug())
      }
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', { wssMessages })
    }
  }
}
</script>
