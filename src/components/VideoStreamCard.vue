<template>
  <v-card class="mx-auto my-5" max-width="600">
    <v-card-title>
      <span>{{ stream.name }}</span>
    </v-card-title>
    <v-card-text v-if="stream.running">
      <div>
        <v-alert type="success" text>Streaming server is running.</v-alert>
      </div>
      <div v-if="isLive">
        <video ref="hlsPlayer" controls autoplay style="width: 100%"></video>
      </div>
      <div v-else>
        <v-alert type="info" text> Live stream is inactive. </v-alert>
      </div>
      <ul class="text-left">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="d-flex justify-space-between align-center">
              <span>Streaming URL</span>
              <v-btn small @click="copyToClipboard(stream.streamUrl, 'Streaming URL')"> Copy </v-btn>
            </v-list-item-title>
            <v-list-item-subtitle>{{ stream.streamUrl }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="d-flex justify-space-between align-center">
              <span>Viewing URL</span>
              <v-btn small @click="copyToClipboard(stream.watchUrl, 'Viewing URL')"> Copy </v-btn>
            </v-list-item-title>
            <v-list-item-subtitle>{{ stream.watchUrl }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="d-flex justify-space-between align-center">
              <span>Stream Key</span>
              <v-btn small @click="copyToClipboard(stream.streamKey, 'Stream Key')"> Copy </v-btn>
            </v-list-item-title>
            <v-list-item-subtitle>{{ stream.streamKey }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="d-flex justify-space-between align-center">
              <span>Authorization Key</span>
              <v-btn icon @click="toggleAuthKeyVisibility">
                <v-icon>{{ showAuthKey ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
              </v-btn>
              <v-btn small @click="copyToClipboard(stream.authKey, 'Authorization Key')"> Copy </v-btn>
            </v-list-item-title>
            <v-list-item-subtitle>
              <span v-if="showAuthKey">{{ stream.authKey }}</span>
              <span v-else class="text-h6">••••••••••••••••••••••••</span>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </ul>
    </v-card-text>
    <v-card-text v-if="stream.starting">
      <loader :loading="stream.starting" :grid="true" />
      <div>Starting the streaming server...</div>
    </v-card-text>
  </v-card>
</template>

<script>
import Hls from 'hls.js'
import { mapActions } from 'vuex/dist/vuex.common.js'
import Loader from '../components/Loader'

export default {
  name: 'VideoStreamCard',
  props: {
    stream: {
      type: Object,
      required: true,
    },
  },
  components: {
    Loader,
  },
  data() {
    return {
      showAuthKey: false,
      isLive: false, // This will track the live status
    }
  },
  watch: {
    'stream.watchUrl': function (newVal) {
      if (newVal) {
        this.checkStreamStatus(newVal)
      }
    },
  },
  mounted() {
    if (this.stream.watchUrl) {
      this.checkStreamStatus(this.stream.watchUrl)
    }
  },
  methods: {
    ...mapActions({
      showSuccess: 'banner/showSuccess',
      showError: 'banner/showError',
    }),
    toggleAuthKeyVisibility() {
      this.showAuthKey = !this.showAuthKey
    },
    copyToClipboard(text, paramName) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.showSuccess({ message: `${paramName} copied to clipboard` })
        })
        .catch(() => {
          this.showError({ message: 'Could not copy to clipboard' })
        })
    },
    playHlsStream() {
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(this.stream.watchUrl)
        hls.attachMedia(this.$refs.hlsPlayer)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.$refs.hlsPlayer.play()
        })
      } else if (this.$refs.hlsPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        this.$refs.hlsPlayer.src = this.stream.watchUrl
        this.$refs.hlsPlayer.play()
      }
    },
    checkStreamStatus(url) {
      // Check if the stream is live by attempting to load the manifest file
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(url)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.isLive = true // Stream is live
          this.playHlsStream()
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
            this.isLive = false // Stream is not live
          }
        })
      } else if (this.$refs.hlsPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        // Handle for devices that natively support HLS
        this.$refs.hlsPlayer.src = url
        this.$refs.hlsPlayer.addEventListener('loadedmetadata', () => {
          this.isLive = true
          this.$refs.hlsPlayer.play()
        })
        this.$refs.hlsPlayer.addEventListener('error', () => {
          this.isLive = false
        })
      }
    },
  },
}
</script>

<style scoped>
.v-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
