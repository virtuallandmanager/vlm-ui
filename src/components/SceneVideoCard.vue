<template>
  <v-card elevation="6">
    <div class="d-flex justify-space-between align-center primary pa-4">
      <div class="text-h6 flex-grow-1" v-if="!editingName">
        {{ truncatedName }}
      </div>
      <div class="text-h5 flex-grow-1" v-if="editingName">
        <v-text-field
          autofocus
          outlined
          color="white"
          :label="localeText('Video Screen Name')"
          v-model="video.name"
          hide-details="auto"
          append-outer-icon="mdi-content-save"
          @click:append-outer="toggleEditMode"
          @blur="toggleEditMode"
          dense
          @change="updateVideoName()"
        ></v-text-field>
      </div>
      <v-tooltip v-if="videoNotConfigured || noInstancesAdded" bottom color="error">
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" class="d-flex-grow-0 ml-2 white" icon small dark @click="openRelevantPanels">
            <v-icon color="red">mdi-exclamation-thick</v-icon>
          </v-btn>
        </template>
        <div v-if="videoNotConfigured" class="text-center">{{ localeText('No Content Configured') }}</div>
        <div v-if="noInstancesAdded" class="text-center">{{ localeText('No Instances Added') }}</div>
      </v-tooltip>
      <v-tooltip v-if="!editingName" top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" class="d-flex-grow-0 ml-2" icon small dark @click="toggleEditMode" v-if="!editingName">
            <v-icon small>mdi-rename</v-icon>
          </v-btn>
        </template>
        <span>{{ tooltipText('Rename') }}</span>
      </v-tooltip>
    </div>
    <div class="black d-flex justify-end align-center pa-4">
      <div class="flex-grow-1">
        <v-slider
          color="white"
          v-model="video.volume"
          @change="updateVolume"
          prepend-icon="mdi-volume-high"
          max="1"
          min="0"
          step=".1"
          class="ma-0"
          dense
          hide-details="auto"
        ></v-slider>
        <v-slider
          color="white"
          v-model="video.emission"
          @change="updateEmission"
          prepend-icon="mdi-television-ambient-light"
          max="3"
          min="0"
          step=".1"
          class="ma-0"
          dense
          hide-details="auto"
        ></v-slider>
      </div>
      <v-btn icon dark @click="toggleVisibility" :disabled="video.customRendering">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on" :class="video.enabled ? '' : 'red--text'">
              {{ video.enabled ? 'mdi-eye' : 'mdi-eye-off' }}
            </v-icon>
          </template>
          <span>{{ video.enabled ? tooltipText('Hide All') : tooltipText('Show All') }}</span>
        </v-tooltip>
      </v-btn>
      <v-btn
        icon
        dark
        @click.stop="
          showClickEventDialog({
            element: 'video',
            elementData: video,
          })
        "
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-mouse </v-icon>
          </template>
          <span>{{ tooltipText('Click Action') }}</span>
        </v-tooltip>
      </v-btn>
      <v-btn
        icon
        dark
        @click.stop="
          showPropertiesDialog({
            element: 'video',
            elementData: video,
          })
        "
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-tune </v-icon>
          </template>
          <span>{{ tooltipText('Video Properties') }}</span>
        </v-tooltip>
      </v-btn>
      <v-btn
        icon
        dark
        @click.stop="
          showDeleteDialog({
            element: 'video',
            elementData: video,
          })
        "
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
          </template>
          <span>{{ tooltipText('Remove') }}</span>
        </v-tooltip>
      </v-btn>
    </div>
    <div class="pa-2 grey darken-4">
      <v-img :src="video.offImageSrc" v-if="video.offType == 1 && (!videoState.isLive || !video.enableLiveStream)" :contain="true"></v-img>
      <video-stream-player v-if="videoContent.length" :streamUrls="videoContent" @updateVideoState="updateVideoState" />
      <div class="d-flex justify-space-between mt-2">
        <v-chip small label>{{ localeText('Showing') }}:</v-chip>
        <v-chip small label color="success" class="text-center" v-if="videoState.isLive && video.enableLiveStream">
          <v-icon class="mr-1" x-small>mdi-broadcast</v-icon>{{ localeText('Live Stream').toUpperCase() }}
        </v-chip>
        <v-chip small label class="text-center" v-if="video.offType == 0 && (!videoState.isLive || !video.enableLiveStream)"> NOTHING </v-chip>
        <v-chip small label color="primary" class="text-center" v-if="video.offType == 1 && (!videoState.isLive || !video.enableLiveStream)">
          <v-icon class="mr-1" x-small>mdi-image-area</v-icon>{{ localeText('Off Air Image').toUpperCase() }}
        </v-chip>
        <v-chip small label color="primary" class="text-center" v-if="video.offType == 2 && (!videoState.isLive || !video.enableLiveStream)">
          <v-icon class="mr-1" x-small>mdi-playlist-play</v-icon>{{ localeText('Off Air Playlist').toUpperCase() }}
        </v-chip>
        <v-chip small label color="primary" class="text-center" v-if="video.offType == 3 && (!videoState.isLive || !video.enableLiveStream)">
          <v-icon class="mr-1" x-small>mdi-broadcast</v-icon>{{ localeText('Community Channels').toUpperCase() }}
        </v-chip>
      </div>
    </div>
    <v-expansion-panels multiple accordion class="d-flex justify-space-between align-center grey darken-2 pa-0" v-model="openPanels">
      <v-expansion-panel class="pa-0">
        <v-expansion-panel-header class="d-flex justify-space-between">
          <h1 class="text-body-1 font-weight-bold inline" dark>{{ localeText('Video Config') }}</h1>
          <span class="text-right font-weight-light inline mx-2" dark v-if="!openPanels.includes(0)">
            {{ localeAction('click to expand') }}
          </span>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="pa-0 mx-n6 mb-n4" ref="videoConfigPanel">
          <v-card :outlined="highlightConfigPanel" :class="highlightConfigPanel ? 'highlight' : ''">
            <div class="grey darken-2 d-flex align-center text-right pa-2 ma-0">
              <h1 class="text-body-1 font-weight-bold pa-4 flex-grow-1 text-left" dark>{{ localeText('Live Stream') }}</h1>
              <v-switch
                v-model="video.enableLiveStream"
                :disabled="!video.liveSrc"
                color="red"
                hide-details
                @change="updateLiveToggle"
                class="ma-0 pr-4 flex-shrink-0 red--text"
              >
                <template v-slot:label>
                  <v-tooltip bottom color="error" v-if="video.enableLiveStream">
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon color="red" v-bind="attrs" v-on="on">mdi-broadcast</v-icon>
                    </template>
                    <span>{{ localeText('On Air') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom v-else>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon color="grey" v-bind="attrs" v-on="on">mdi-broadcast-off</v-icon>
                    </template>
                    <span>{{ localeText('Off Air') }}</span>
                  </v-tooltip>
                </template>
              </v-switch>
            </div>
            <div class="my-0 pa-4 d-flex">
              <v-text-field
                outlined
                v-model="video.liveSrc"
                :label="localeText('Live Video URL')"
                hide-details="auto"
                :rules="[validateStreamLink]"
                :placeholder="localeText('Enter Live Video URL')"
                :persistent-hint="true"
                @blur="updateLiveSrc"
                :hint="localeText('LiveVideoHint')"
              >
              </v-text-field>
            </div>
            <div class="d-flex justify-center flex-column align-center pa-4 pt-0">
              <div class="text-label mb-2">{{ localeText('Off Air Content') }}</div>
              <v-select
                outlined
                :items="offTypes"
                :full-width="true"
                block
                hide-details
                v-model="video.offType"
                @change="updateOffType"
                :style="{ width: '100%' }"
              />
            </div>
            <div v-if="video.offType == 2">
              <div class="d-flex justify-space-between align-center grey darken-2 pa-4">
                <h1 class="d-block text-body-1 font-weight-bold" dark>{{ localeText('On-Demand Playlist') }}</h1>
                <v-btn @click="addVideo"><v-icon>mdi-playlist-plus</v-icon></v-btn>
              </div>
              <div v-for="(item, v) in video.playlist" :key="v" class="d-flex align-center pa-4">
                <v-text-field
                  outlined
                  v-model="video.playlist[v]"
                  :label="`Video ${v + 1}`"
                  :placeholder="localeText('Enter Video URL')"
                  hide-details="true"
                  @blur="updatePlaylist"
                  class="flex-grow-1"
                />
                <v-btn icon @click.stop="removePlaylistItem(v)" v-if="video.playlist.length > 1">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
                    </template>
                    <span>{{ localeText('Remove Video') }}</span>
                  </v-tooltip>
                </v-btn>
              </div>
            </div>
            <div v-if="video.offType == 1">
              <div class="d-flex justify-space-between align-center grey darken-2 pa-4">
                <h1 class="d-block text-body-1 font-weight-bold">{{ localeText('Placeholder Image') }}</h1>
              </div>
              <!-- <div class="px-4"> -->
              <!-- <v-btn>Use External Image</v-btn> -->
              <!-- <v-btn>Image from Library</v-btn> -->
              <!-- <v-btn>New Image</v-btn> -->
              <!-- </div> -->
              <div class="px-4 pt-6">
                <v-text-field
                  outlined
                  v-model="video.offImageSrc"
                  :label="localeText('Image URL')"
                  :placeholder="localeText('Enter Image URL')"
                  @blur="updateOffImage"
                  hide-details
                />
              </div>
              <div>
                <v-img max-height="250" max-width="250" contain :src="video.videoLink" class="mx-auto"></v-img>
              </div>
            </div>
            <div v-if="video.offType == 3">
              <div class="d-flex justify-space-between align-center grey darken-2 pa-4">
                <h1 class="d-block text-body-1 font-weight-bold">{{ localeText('Community Channels') }}</h1>
              </div>
              <!-- Draggable List of Channels -->
              <v-list class="ma-0 pa-0">
                <!-- Draggable List Items -->
                <draggable
                  v-model="sortedCommunityChannels"
                  :move="checkMove"
                  @start="dragging = true"
                  @end="onDragEnd"
                  ghost-class="ghost"
                  handle=".drag-handle"
                >
                  <!-- Use v-list-item directly inside draggable -->
                  <v-list-item v-for="(channel, i) in sortedCommunityChannels" :key="channel.name" class="pa-0 pr-4">
                    <v-list-item-content class="py-0">
                      <v-list-item-title class="d-flex align-center py-4">
                        <v-switch v-model="channel.selected" :label="channel.name" @change="updateChannelList" hide-details class="my-0 ml-6" />
                      </v-list-item-title>
                      <v-list-item-subtitle class="pl-6">{{ channel.description }}</v-list-item-subtitle>
                      <v-list-item-subtitle
                        class="d-flex text-center mt-4 grey--text text--darken-1 justify-space-around align-center"
                        v-if="channel.selected"
                      >
                        <div>
                          <v-icon x-small :color="streamStatuses[i]?.status == 'Live' ? 'red' : 'grey'" class="mr-2 mb-1">mdi-circle</v-icon
                          >{{ streamStatuses[i]?.status || localeText('Off Air') }}
                        </div>
                        <div>{{ calculateOrder(i) }}</div>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-icon class="drag-handle" color="grey">mdi-drag</v-icon>
                    </v-list-item-action>
                  </v-list-item>
                </draggable>
                <v-list-item class="grey darken-3 ma-0 mt-4">
                  <v-list-item-content class="ma-0 pa-0">
                    <v-list-item-title class="text-center">{{ localeText('ChannelSortHint') }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>
            <v-expand-transition>
              <v-banner color="primary" dark tile v-if="highlightConfigPanel" class="text-center">
                {{ localeText('ConfigureContentBanner') }}
              </v-banner>
            </v-expand-transition>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel class="pa-0">
        <v-card :outlined="highlightInstancePanel" :class="highlightInstancePanel ? 'highlight' : ''">
          <v-expansion-panel-header class="d-flex text-body justify-space-between text-left">
            <h1 class="text-body-1 font-weight-bold flex-shrink-0" dark>{{ localeText('Instances') }}</h1>
            <v-btn @click="addInstance" small class="mr-2 flex-grow-0">
              <v-icon small class="mr-1">mdi-plus</v-icon> {{ localeText('Instance') }}
            </v-btn>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="pa-0 mx-n6 mb-n4" ref="instancePanel">
            <div class="d-flex flex-column pa-0 pb-4">
              <div class="text-body-1 text-center" v-if="!video?.instances?.length">{{ localeText('NoInstances') }}</div>
              <div v-for="(instance, i) in video.instances" :key="instance.id" :class="i > 0 ? 'mt-3' : ''" class="pa-0">
                <video-instance-card :video="video" :instance="instance" />
              </div>
            </div>
            <v-expand-transition>
              <v-banner color="primary" dark tile v-if="highlightInstancePanel" class="text-center mb-n4">{{
                localeText('AddInstancesBanner')
              }}</v-banner>
            </v-expand-transition>
          </v-expansion-panel-content>
        </v-card>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { SceneVideo } from '../models/SceneVideo'
import { SceneVideoInstance } from '../models/SceneVideoInstance'
import VideoStreamPlayer from './VideoStreamPlayer'
import VideoInstanceCard from './VideoInstanceCard.vue'
import draggable from 'vuedraggable'

export default {
  components: {
    VideoStreamPlayer,
    VideoInstanceCard,
    draggable,
  },
  name: 'SceneVideoCard',
  data: () => ({
    isChecking: false,
    checkingComplete: false,
    streamStatuses: [],
    dragging: false,
    showConfig: true,
    offAirContent: false,
    propertiesDialog: false,
    instancePropertiesDialog: false,
    deleteDialog: false,
    deleteInstanceDialog: false,
    deletePlaylistItemDialog: false,
    selectedPlaylistItem: '',
    editingName: false,
    openPanels: [1],
    highlightConfigPanel: false,
    highlightInstancePanel: false,
    statusCheckInterval: null,
    offTypes: [
      { text: 'None', nativeText: 'None', value: 0 },
      { text: 'On-Demand Playlist', nativeText: 'On-Demand Playlist', value: 2 },
      { text: 'Placeholder Image', nativeText: 'Placeholder Image', value: 1 },
      // { text: 'Community Channels', nativeText: 'Community Channels', value: 3 },
    ],
    sortedCommunityChannels: [],
    videoState: 0,
  }),
  props: {
    video: {
      type: Object,
      default: function () {
        return new SceneVideo()
      },
    },
  },
  mounted() {
    if (this.video.showConfig && !this.openPanels.includes(0)) {
      this.openPanels.push(0)
    }

    this.offTypes = this.offTypes.map((type) => {
      return {
        ...type,
        text: this.localeText(type.nativeText),
      }
    })
    this.sortedCommunityChannels = this.channels.map((channel) => {
      return {
        ...channel,
        selected: this.video?.channelList?.includes(channel.sk) || false,
      }
    })

    if (this.videoNotConfigured) {
      this.openPanels.push(0)
    }
  },
  watch: {
    localeCode: {
      handler() {
        console.log('Locale code changed:', this.localeCode)
        this.offTypes = this.offTypes.map((type) => {
          return {
            ...type,
            text: this.localeText(type.nativeText),
          }
        })
      },
      deep: true, // Use this if you need to watch nested properties
      immediate: true, // Use this if you want to run the handler immediately upon component creation
    },
    openPanels() {
      this.video.showConfig = this.openPanels.includes(0)
      this.updateSceneElement({
        action: 'update',
        element: 'video',
        property: 'showConfig',
        id: this.video.id,
        elementData: this.video,
      })
    },
  },
  computed: {
    ...mapGetters({
      localeText: 'i18n/videoScreens',
      localeAction: 'i18n/actions',
      tooltipText: 'i18n/tooltips',
      channels: 'channels/community',
      localeCode: 'i18n/localeCode',
    }),
    videoContent() {
      if (this.video.enableLiveStream && this.video.liveSrc && this.video.offType === 3) {
        return [this.video.liveSrc, ...this.sortedCommunityChannels.filter((c) => c.selected).map((c) => c.url)]
      } else if (!this.video.enableLiveStream && this.video.offType === 3) {
        return [...this.sortedCommunityChannels.filter((c) => c.selected).map((c) => c.url)]
      } else {
        return []
      }
    },
    videoNotConfigured() {
      return (
        (!this.video.liveSrc && this.video.offType == 0) ||
        (!this.video.offImageSrc && this.video.offType == 1) ||
        (!this.video.playlist?.length && this.video.offType == 2) ||
        (!this.video.channelList?.length && this.video.offType == 3)
      )
    },
    noInstancesAdded() {
      return !this.video?.instances?.length || this.video.instances.length < 1
    },
    truncatedName() {
      const videoNameArr = this.video && this.video.name.split('')
      let noSpacesLength = 0
      let truncated = this.video.name
      videoNameArr.forEach((char) => {
        if (char !== ' ') {
          noSpacesLength++
        } else {
          noSpacesLength = 0
        }

        if (noSpacesLength > 18) {
          truncated = truncated.substr(truncated.length - 18)
          noSpacesLength = 0
        }
      })

      if (truncated !== this.video.name) {
        return `...${truncated}`
      } else {
        return this.video.name
      }
    },
  },
  methods: {
    ...mapActions({
      showPropertiesDialog: 'dialog/showPropertiesDialog',
      showClickEventDialog: 'dialog/showClickEventDialog',
      showDeleteDialog: 'dialog/showDeleteDialog',
      createSceneElement: 'scene/createSceneElement',
      updateSceneElement: 'scene/updateSceneElement',
      deleteSceneElement: 'scene/deleteSceneElement',
      showInfoBanner: 'banner/showInfo',
    }),
    startPeriodicCheck() {
      this.checkStreamStatus() // Initial check
      this.statusCheckInterval = setInterval(() => {
        this.checkStreamStatus()
      }, this.checkInterval)
    },
    stopPeriodicCheck() {
      if (this.statusCheckInterval) {
        clearInterval(this.statusCheckInterval)
        this.statusCheckInterval = null
      }
    },
    onDragEnd(evt) {
      console.log('List reordered:', this.sortedCommunityChannels, evt)
    },
    checkMove(e) {
      console.log('Future index:', e.draggedContext.futureIndex)
    },
    calculateOrder(i) {
      const isSelected = this.sortedCommunityChannels[i].selected
      const selectedChannels = this.sortedCommunityChannels.filter((c) => c.selected)
      const isFirstSelected = selectedChannels.length && selectedChannels[0].sk === this.sortedCommunityChannels[i].sk
      const thisChannel = selectedChannels[i]
      const previousChannel = selectedChannels[i - 1]
      console.log('Selected:', isSelected, 'First:', isFirstSelected, 'Previous:', previousChannel)
      console.log(selectedChannels, this.sortedCommunityChannels[i])
      if (isSelected && isFirstSelected && this.video.enableLiveStream) {
        return this.localeText('FirstChannelText')
      } else if (isSelected && isFirstSelected) {
        return this.localeText('SecondChannelText').replace('{{ channelName }}', thisChannel.name)
      } else if (isSelected) {
        return this.localeText('AdditionalChannelText').replace('{{ channelName }}', previousChannel.name)
      } else {
        return ''
      }
    },
    openRelevantPanels() {
      this.openPanels = []
      if (this.videoNotConfigured && !this.openPanels.includes(0)) {
        this.openPanels.push(0)
      }
      if (this.noInstancesAdded && !this.openPanels.includes(1)) {
        this.openPanels.push(1)
      }

      if (this.videoNotConfigured && this.noInstancesAdded) {
        this.scrollToElement('videoConfigPanel')
        this.highlightPanel('videoConfigPanel')
        setTimeout(() => {
          this.scrollToElement('instancePanel')
          this.highlightPanel('instancePanel')
        }, 3000)
      } else if (this.videoNotConfigured) {
        this.scrollToElement('videoConfigPanel')
        this.highlightPanel('videoConfigPanel')
      } else if (this.noInstancesAdded) {
        this.scrollToElement('instancePanel')
        this.highlightPanel('instancePanel')
      }
    },
    scrollToElement(elementId) {
      this.$nextTick(() => {
        const element = this.$refs[elementId]
        if (element) {
          // If it's a Vue component, use $el to get the DOM element
          const el = element.$el || element

          // Get the offset of the element relative to the document
          const offset = this.getOffsetTop(el)

          // Scroll to the element
          window.scrollTo({
            top: offset,
            behavior: 'smooth',
          })
        } else {
          console.error('Element not found:', elementId)
        }
      })
    },
    highlightPanel(panelRef) {
      if (panelRef === 'videoConfigPanel') {
        this.highlightConfigPanel = true
      } else if (panelRef === 'instancePanel') {
        this.highlightInstancePanel = true
      }

      setTimeout(() => {
        this.highlightConfigPanel = false
        this.highlightInstancePanel = false
      }, 3000)
    },
    getOffsetTop(element) {
      let offsetTop = 0
      while (element) {
        offsetTop += element.offsetTop
        element = element.offsetParent
      }
      return offsetTop
    },
    addVideo() {
      const nextItem = ''
      this.video.playlist.push(nextItem)
      this.updateSceneElement({
        action: 'update',
        element: 'video',
        property: 'playlist',
        id: this.video.id,
        elementData: this.video,
      })
    },
    addInstance() {
      if (!this.openPanels.includes(1)) {
        this.openPanels.push(1)
      }
      const newInstance = new SceneVideoInstance({
        name: `Instance ${this.video.instances.length + 1}`,
      })

      this.createSceneElement({
        element: 'video',
        instance: true,
        id: newInstance.sk,
        elementData: this.video,
        instanceData: newInstance,
      })
    },
    removePlaylistItem(i) {
      Vue.delete(this.video.playlist, i)

      this.updateSceneElement({
        element: 'video',
        property: 'playlist',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    toggleEditMode() {
      this.editingName = !this.editingName
    },
    toggleVisibility() {
      this.video.enabled = !this.video?.enabled
      this.updateSceneElement({
        action: 'update',
        element: 'video',
        property: 'enabled',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    toggleLiveStream() {
      this.updateSceneElement({
        action: 'update',
        element: 'video',
        property: 'enableLiveStream',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    updateChannelList() {
      this.video.channelList = this.sortedCommunityChannels.filter((channel) => channel.selected).map((channel) => channel.sk)

      this.updateSceneElement({
        element: 'video',
        property: 'channelList',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    updateVideoProperties() {
      this.updateSceneElement({
        action: 'update',
        element: 'video',
        property: 'properties',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    updateVideoInstanceProperties(instance) {
      this.updateSceneElement({
        element: 'video',
        instance: true,
        property: 'properties',
        id: instance.sk,
        elementData: this.video,
        instanceData: instance,
      })
    },
    updateVideoName() {
      this.updateSceneElement({
        element: 'video',
        property: 'name',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    updateInstanceName(instance) {
      this.updateSceneElement({
        element: 'video',
        instance: true,
        property: 'name',
        id: instance.sk,
        elementData: this.video,
        instanceData: instance,
      })
    },
    updateInstanceTransform(instance) {
      this.updateSceneElement({
        element: 'video',
        instance: true,
        property: 'transform',
        id: instance.sk,
        elementData: this.video,
        instanceData: instance,
      })
    },
    updateLiveSrc() {
      const video = { ...this.video }
      if (!video.liveSrc) {
        video.enableLiveStream = false
      }
      this.updateSceneElement({
        element: 'video',
        property: 'liveSrc',
        id: video.sk,
        elementData: video,
      })
    },
    updateLiveToggle() {
      this.updateSceneElement({
        element: 'video',
        property: 'enableLiveStream',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    updateVolume() {
      this.updateSceneElement({
        element: 'video',
        property: 'volume',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    updateEmission() {
      this.updateSceneElement({
        element: 'video',
        property: 'emission',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    updatePlaylist() {
      this.updateSceneElement({
        element: 'video',
        property: 'playlist',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    updateOffType() {
      this.updateSceneElement({
        element: 'video',
        property: 'offType',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    updateOffImage() {
      this.updateSceneElement({
        element: 'video',
        property: 'offImageSrc',
        id: this.video.sk,
        elementData: this.video,
      })
    },
    updateVideoState(state) {
      this.videoState = state
      this.streamStatuses = state.allStreamStatuses
      console.log('Video state updated:', state)
    },
    validateStreamLink(value) {
      if (process.env.VUE_APP_NODE_ENV === 'development') {
        return true
      }
      if (value && value.includes('http://')) {
        return 'Insecure url detected - Must be an https:// link'
      } else if (value && !value.includes('https://')) {
        return 'Stream url must include https://'
      } else if (value && !value.includes('.m3u8')) {
        return 'Stream format must be a .m3u8'
      } else {
        return true
      }
    },
  },
}
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #424242;
}
.drag-handle {
  cursor: move;
}

.visible {
  opacity: 1;
}

.hidden {
  opacity: 0;
}

.v-card {
  position: relative;
  border: 0;
}

.v-card::after {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: 0;
  border: 3px solid rgba(0, 0, 0, 0);
  transition: all 0.1s ease-in;
  pointer-events: none;
}

.highlight::after {
  border-color: #8077ff;
}

.v-card:not(.highlight)::after {
  border: 0 solid rgba(0, 0, 0, 0);
  transition: all 2s ease-out;
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
