<template>
  <div>
    <div v-if="src && isStreaming && enabled">
      <video ref="videoPlayer" class="video-js"></video>
    </div>
    <div class="d-flex justify-space-between">
      <v-chip label small>{{ localeText('Stream Status') }}:</v-chip>
      <div v-if="src && isValidUrl">
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
      <v-chip small label color="info" v-else-if="src && !isStreaming" class="text-center">
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

export default {
  name: 'VideoStreamPlayer',
  props: {
    src: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      player: null,
      isStreaming: true,
      isLiveStream: false,
      isValidUrl: true,
    }
  },
  computed: {
    ...mapGetters({
      localeText: 'i18n/videoScreens',
    }),
  },
  mounted() {
    try {
      this.player = videojs(this.$refs.videoPlayer, this.getOptions(), function onPlayerReady() {})

      this.player.on('loadedmetadata', () => {
        this.isLiveStream = this.player.duration() === Infinity
        this.isStreaming = !this.player.paused()
        this.updateVideoState()
      })

      this.player.on('error', () => {
        this.isStreaming = false
        const error = this.player.error()
        if (error && error.code === 2) {
          // Check if it's a network error
          this.isValidUrl = false
          this.updateVideoState()
        }
      })
    } catch (e) {
      this.isLiveStream = false
      this.isValidUrl = false
      this.isStreaming = false
      this.updateVideoState()
    }
  },
  beforeDestroy() {
    if (this.player) {
      if (this.player.hasEventListener('error')) {
        this.player.off('error')
      }
      this.player.dispose()
    }
  },
  watch: {
    src(newSource) {
      if (this.player) {
        this.player.src({ type: 'application/x-mpegURL', src: newSource })
      }
    },
  },
  methods: {
    updateVideoState() {
      this.$emit('updateVideoState', this.isValidUrl)
    },
    getOptions() {
      return {
        autoplay: true,
        muted: true,
        loop: true,
        controls: true,
        controlBar: {
          volumePanel: true, // shows volume control
          fullscreenToggle: false, // hides fullscreen toggle
          pictureInPictureToggle: false,
          playToggle: false, // hides play/pause button
          currentTimeDisplay: false, // hides current time display
          timeDivider: false, // hides time divider
          durationDisplay: false, // hides duration display
          remainingTimeDisplay: false, // hides remaining time display
          progressControl: false, // hides progress control
        },
        sources: [
          {
            src: this.src,
            type: 'application/x-mpegURL',
          },
        ],
      }
    },
  },
}
</script>

<style>
.video-js {
  width: 100%;
  height: 100%;
  min-height: 250px;
}
</style>
