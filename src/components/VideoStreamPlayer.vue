<template>
  <div>
    <div class="video-player-wrapper">
      <div ref="videoContainer" class="video-container"></div>
    </div>
    <div class="d-flex justify-space-between mt-4">
      <v-chip label small>{{ localeText('Stream Status') }}:</v-chip>
      <div v-if="streamUrls.length && isValidUrl">
        <v-chip small label color="success" v-if="isLiveStream && isValidUrl && isStreaming && enabled"
          ><v-icon x-small class="mr-1">mdi-check-circle</v-icon>{{ localeText('Live').toUpperCase() }}</v-chip
        >
        <v-chip small label color="success" v-if="isLiveStream && isValidUrl && isStreaming && !enabled"
          ><v-icon x-small class="mr-1">mdi-check-circle</v-icon>{{ localeText('Live').toUpperCase() }}</v-chip
        >
        <v-chip small label color="info" v-if="!isLiveStream && isValidUrl && isStreaming"
          ><v-icon x-small class="mr-1">mdi-help-circle</v-icon>{{ localeText('Static Content').toUpperCase() }}</v-chip
        >
        <v-chip small label color="error" v-if="(!isLiveStream && !isValidUrl) || !isStreaming"
          ><v-icon x-small class="mr-1">mdi-minus-circle</v-icon>{{ localeText('Inactive').toUpperCase() }} /
          {{ localeText('Invalid').toUpperCase() }}</v-chip
        >
      </div>
      <v-chip small label color="info" v-else-if="streamUrls.length && !isStreaming" class="text-center">
        <v-icon x-small class="mr-1">mdi-server-off</v-icon>{{ localeText('No Live Content').toUpperCase() }}
      </v-chip>
      <v-chip small label color="error" v-else class="text-center"
        ><v-icon class="mr-1" x-small>mdi-minus-circle</v-icon>{{ localeText('No Stream URL').toUpperCase() }}</v-chip
      >
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import axios from 'axios'

export default {
  name: 'VideoStreamPlayer',
  props: {
    streamUrls: {
      type: Array,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    checkInterval: {
      type: Number,
      default: 60000, // 60 seconds
    },
    playerOptions: {
      type: Object,
      default: () => ({
        autoplay: true,
        controls: false,
      }),
    },
  },
  data() {
    return {
      player: null,
      streams: [],
      statusCheckInterval: null,
      activeListeners: new Set(),
      currentState: {
        playing: false,
        currentTime: 0,
        duration: 0,
        currentStream: null,
        isLive: false,
        allStreamStatuses: [],
      },
      lastCheckedSegment: null,
      segmentCheckInterval: null,
      lastStatusCheckTime: 0,
      playerInitialized: false,
    }
  },
  computed: {
    ...mapGetters({
      localeText: 'i18n/videoScreens',
    }),
    isStreaming() {
      return this.streams.some((stream) => stream.status === 'Live')
    },
    isValidUrl() {
      return this.streams.every((stream) => stream.status !== 'Error')
    },
    isLiveStream() {
      return this.currentState.isLive
    },
  },
  watch: {
    streamUrls: {
      handler(newUrls) {
        this.streams = newUrls.map((url) => ({ url, isLive: false, checked: false }))
        this.checkStreams()
      },
      immediate: true,
    },
  },
  async mounted() {
    await this.initializePlayer()
    await this.checkStreams()
  },
  beforeDestroy() {
    this.cleanup()
  },
  methods: {
    async initializePlayer() {
      const container = this.$refs.videoContainer
      if (!container) {
        console.warn('Video container not found. Retrying in 100ms.')
        return new Promise((resolve) => setTimeout(() => resolve(this.initializePlayer()), 100))
      }

      container.innerHTML = '<video class="video-js"></video>'
      const videoElement = container.querySelector('video')

      return new Promise((resolve) => {
        this.player = videojs(videoElement, this.playerOptions, () => {
          console.log('Player is ready')
          this.addEventListeners()
          resolve()
        })
      })
    },
    addEventListeners() {
      this.addEventListenerOnce('loadedmetadata', this.handleLoadedMetadata)
      this.addEventListenerOnce('timeupdate', this.handleTimeUpdate)
      this.addEventListenerOnce('durationchange', this.checkIfLiveStream)
    },
    addEventListenerOnce(event, handler) {
      if (!this.activeListeners.has(event)) {
        this.player.on(event, handler)
        this.activeListeners.add(event)
      }
    },
    removeEventListener(event) {
      if (this.activeListeners.has(event)) {
        this.player.off(event)
        this.activeListeners.delete(event)
      }
    },
    removeAllEventListeners() {
      this.activeListeners.forEach((event) => {
        this.player.off(event)
      })
      this.activeListeners.clear()
    },
    async checkStreams() {
      for (const stream of this.streams) {
        if (!stream.checked) {
          const status = await this.checkStreamStatus(stream)
          stream.status = status.status
          stream.isLive = status.isLive
          stream.checked = true
        }
      }

      this.updateAllStreamStatuses()

      const liveStream = this.streams.find((s) => s.isLive)
      if (liveStream) {
        this.loadStream(liveStream.url)
      } else if (this.streams.length > 0) {
        this.loadStream(this.streams[0].url)
      }
    },
    async checkStreamStatus(stream) {
      try {
        const response = await axios.get(stream.url, {
          timeout: 5000,
          headers: { 'Cache-Control': 'no-cache' },
        })
        const content = response.data

        let isLive = false
        let details = []

        if (content.includes('#EXTM3U')) {
          details.push('Valid M3U8 file')

          if (content.includes('#EXT-X-STREAM-INF')) {
            details.push('Contains stream information')
            isLive = true
          }

          if (content.includes('#EXT-X-TARGETDURATION')) {
            details.push('Contains target duration')
            isLive = true
          }

          if (content.includes('#EXT-X-MEDIA-SEQUENCE')) {
            details.push('Contains media sequence')
            isLive = true
          }

          if (!content.includes('#EXT-X-ENDLIST')) {
            details.push('No end list marker (likely live)')
            isLive = true
          }
        } else {
          details.push('Not a valid M3U8 file')
        }

        return {
          status: isLive ? 'Live' : 'Not Live',
          isLive: isLive,
          details: details.join(', '),
        }
      } catch (error) {
        console.warn(`Error checking stream ${stream.url}:`, error.message)
        return {
          status: error.code === 'ECONNABORTED' ? 'Timeout' : 'Error',
          isLive: false,
          details: `Error: ${error.message}`,
        }
      }
    },
    updateAllStreamStatuses() {
      this.currentState.allStreamStatuses = this.streams.map((stream) => ({
        url: stream.url,
        status: stream.status,
        isLive: stream.isLive,
      }))
      this.emitVideoState()
    },
    async checkIfStreamIsLive(url) {
      try {
        const response = await axios.get(url, {
          timeout: 5000,
          headers: { 'Cache-Control': 'no-cache' },
        })
        const content = response.data

        const isLive =
          content.includes('#EXT-X-PLAYLIST-TYPE:EVENT') || !content.includes('#EXT-X-PLAYLIST-TYPE:VOD') || !content.includes('#EXT-X-ENDLIST')

        console.log(`Stream ${url} is ${isLive ? 'live' : 'not live'}`)
        return isLive
      } catch (error) {
        console.error(`Error checking stream ${url}:`, error.message)
        return false
      }
    },
    loadStream(url) {
      if (this.player) {
        this.player.src({ type: 'application/x-mpegURL', src: url })
        this.currentState.currentStream = url
        this.player.play().catch((error) => {
          console.warn('Autoplay prevented:', error)
        })
      } else {
        console.warn('Player not initialized. Unable to load stream.')
      }
    },
    handleLoadedMetadata() {
      this.checkIfLiveStream()
      this.currentState.duration = this.player.duration()
      this.emitVideoState()
    },
    handleTimeUpdate() {
      this.currentState.currentTime = this.player.currentTime()
      this.emitVideoState()
    },
    checkIfLiveStream() {
      const duration = this.player.duration()
      console.log('Stream duration:', duration)

      if (duration === Infinity) {
        console.log('This is a live stream (duration is Infinity)')
        this.currentState.isLive = true
      } else if (isNaN(duration) || duration <= 0) {
        console.log('Duration is invalid, might be still loading')
        setTimeout(() => this.checkIfLiveStream(), 1000)
      } else {
        console.log('This is not a live stream (finite duration)')
        this.currentState.isLive = false
      }

      this.emitVideoState()
    },
    emitVideoState() {
      this.$emit('updateVideoState', this.currentState)
    },
    cleanup() {
      this.removeAllEventListeners()
      if (this.player) {
        this.player.dispose()
      }
    },
  },
}
</script>

<style scoped>
.video-player-wrapper {
  width: 100%;
  max-width: 100%;
}

.video-container {
  width: 100%;
  max-width: 100%;
}

:deep(.video-js) {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}
</style>
