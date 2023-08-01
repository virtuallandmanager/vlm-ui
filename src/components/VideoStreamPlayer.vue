<template>
  <div v-if="src && isValidUrl">
    <div class="mb-4">
      <video ref="videoPlayer" class="video-js"></video>
    </div>
    <div class="d-flex justify-center align-center" v-if="src">
      <div class="text-center mr-2">Stream Status:</div>
      <div v-if="isLiveStream && isValidUrl && isStreaming" class="success--text"><v-icon class="success--text mr-1" small>mdi-check-circle</v-icon>LIVE</div>
      <div v-if="!isLiveStream && isValidUrl && isStreaming" class="info--text"><v-icon class="info--text mr-1" small>mdi-help-circle</v-icon>STATIC CONTENT</div>
      <div v-if="(!isLiveStream && !isValidUrl) || !isStreaming" class="error--text"><v-icon class="error--text mr-1" small>mdi-minus-circle</v-icon>INACTIVE / INVALID</div>
    </div>
  </div>
</template>

<script>
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default {
  name: "VideoStreamPlayer",
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      player: null,
      isStreaming: false,
      isLiveStream: false,
      isValidUrl: true,
    };
  },
  mounted() {
    try {
      this.player = videojs(this.$refs.videoPlayer, this.getOptions(), function onPlayerReady() {});

      this.player.on("loadedmetadata", () => {
        this.isLiveStream = this.player.duration() === Infinity;
        this.isStreaming = !this.player.paused();
        this.updateVideoState();
      });

      this.player.on("error", () => {
        this.isStreaming = false;
        const error = this.player.error();
        if (error && error.code === 2) {
          // Check if it's a network error
          this.isValidUrl = false;
          this.updateVideoState();
        }
      });
    } catch (e) {
      this.isLiveStream = false;
      this.isValidUrl = false;
      this.isStreaming = false;
      this.updateVideoState();
    }
  },
  beforeDestroy() {
    if (this.player) {
      if (this.player.hasEventListener("error")) {
        this.player.off("error");
      }
      this.player.dispose();
    }
  },
  watch: {
    src(newSource) {
      if (this.player) {
        this.player.src({ type: "application/x-mpegURL", src: newSource });
      }
    },
  },
  methods: {
    updateVideoState() {
      this.$emit("updateVideoState", this.isValidUrl);
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
            type: "application/x-mpegURL",
          },
        ],
      };
    },
  },
};
</script>

<style>
.video-js {
  width: 100%;
  height: 100%;
  min-height: 250px;
}
</style>
