<template>
  <v-card>
    <v-container class="py-6 mx-auto">
      <v-row>
        <v-col no-gutters>
          <h1 class="text-h5 ml-2">Video Screens</h1>
        </v-col>
        <v-col align="right">
          <v-btn @click="addVideoScreen()" class="mr-2">
            <v-icon class="mr-1">mdi-plus</v-icon>
            Add Screen
          </v-btn>
        </v-col>
      </v-row>
      <v-row v-if="screens.length < 1" class="mt-6">
        <v-col cols="12">
          <div class="text-body1 text-center">
            You haven't added any videos to this scene yet.
          </div>
        </v-col>
      </v-row>
      <div v-for="(screen, s) in screens" :key="s" class="my-6">
        <v-row class="grey darken-3 dark mx-n3">
          <v-col>
            <v-text-field
              dark
              v-model="screen.name"
              label="Screen Name"
              @blur="updateVideoScreenName"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-slider
              dark
              v-model="screen.volume"
              @change="updateVolume"
              label="Volume"
              max="1"
              min="0"
              step=".1"
              class="mt-4"
              dense
            ></v-slider>
          </v-col>
          <v-col cols="2" align="right">
            <v-dialog
              v-model="moveScreenDialog"
              persistent
              max-width="350"
              :retain-focus="false"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon dark v-bind="attrs" v-on="on">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on">
                        mdi-cursor-move
                      </v-icon>
                    </template>
                    <span>Move Screen</span>
                  </v-tooltip>
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="text-h5">
                  Move Video Screen
                </v-card-title>
                <v-card-text>This feature is coming soon!</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <!-- <v-btn text disabled @click="saveScreenMove(s)">
                    Save
                  </v-btn>
                  <v-btn
                    color="grey darken-1"
                    text
                    @click="cancelScreenMove(s)"
                  >
                    Cancel
                  </v-btn> -->
                  <v-btn
                    color="grey darken-1"
                    text
                    @click="cancelScreenMove(s)"
                  >
                    OK
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="deleteScreenDialog" persistent max-width="350">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon dark v-bind="attrs" v-on="on">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon v-bind="attrs" v-on="on">
                        mdi-trash-can
                      </v-icon>
                    </template>
                    <span>Delete Screen</span>
                  </v-tooltip>
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="text-h5">
                  Remove Video Screen?
                </v-card-title>
                <v-card-text
                  >Are you sure you want to delete
                  {{ screen.name }}?</v-card-text
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="red darken-1"
                    text
                    @click="removeVideoScreen(s)"
                  >
                    Remove
                  </v-btn>
                  <v-btn
                    color="grey darken-1"
                    text
                    @click="deleteScreenDialog = false"
                  >
                    Cancel
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
        <v-row class="grey lighten-2">
          <v-col cols="12">
            <h1 class="text-body-1 font-weight-bold d-block" dark>
              Live Video Stream
            </h1>
          </v-col>
        </v-row>
        <v-row class="my-0 py-2">
          <v-col cols="12">
            <v-text-field
              v-model="screen.liveLink"
              label="Live Video Link"
              hide-details="true"
              @blur="updateLiveLink(s)"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col align="left">
            <v-select
              v-model="screen.offType"
              label="Off-Air Content"
              :items="offTypes"
              class="my-0"
              hide-details="true"
              @change="updateOffType"
              dense
            >
            </v-select>
          </v-col>
        </v-row>
        <div v-if="screen.offType == 1">
          <v-row class="grey lighten-2 my-4">
            <v-col cols="12">
              <h1 class="text-body-1 font-weight-bold d-block" dark>
                Video Playlist
              </h1>
            </v-col>
          </v-row>
          <v-row>
            <v-col v-for="(item, v) in screen.playlist" :key="v" cols="12">
              <v-text-field
                v-model="screen.playlist[v]"
                label="Video Link"
                @blur="updatePlaylist(s)"
              >
                <template v-slot:append-outer>
                  <v-dialog
                    v-model="deleteVideoDialog"
                    persistent
                    max-width="375"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">
                              mdi-trash-can
                            </v-icon>
                          </template>
                          <span>Remove Video</span>
                        </v-tooltip>
                      </v-btn>
                    </template>
                    <v-card>
                      <v-card-title class="text-h5">
                        Remove Video From Playlist?
                      </v-card-title>
                      <v-card-text
                        >Are you sure you want to remove this
                        video?</v-card-text
                      >
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="red darken-1"
                          text
                          @click="removeVideo(s, v)"
                        >
                          Remove
                        </v-btn>
                        <v-btn
                          color="grey darken-1"
                          text
                          @click="deleteVideoDialog = false"
                        >
                          Cancel
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </template>
              </v-text-field>
            </v-col>
            <v-col>
              <v-btn @click="addVideo(s)">Add Video</v-btn>
            </v-col>
          </v-row>
        </div>
        <div v-if="screen.offType == 2">
          <v-row class="grey lighten-2 my-4">
            <v-col cols="12">
              <h1 class="text-body-1 font-weight-bold d-block" dark>
                Image
              </h1>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="screen.offImage"
                label="Image Link"
                @blur="updateOffImage"
              >
                <template v-slot:append-outer>
                  <v-dialog
                    v-model="deleteVideoDialog"
                    persistent
                    max-width="375"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon v-bind="attrs" v-on="on">
                              mdi-trash-can
                            </v-icon>
                          </template>
                          <span>Remove Video</span>
                        </v-tooltip>
                      </v-btn>
                    </template>
                    <v-card>
                      <v-card-title class="text-h5">
                        Remove Video From Playlist?
                      </v-card-title>
                      <v-card-text
                        >Are you sure you want to remove this
                        video?</v-card-text
                      >
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="red darken-1"
                          text
                          @click="removeVideo(s, v)"
                        >
                          Remove
                        </v-btn>
                        <v-btn
                          color="grey darken-1"
                          text
                          @click="deleteVideoDialog = false"
                        >
                          Cancel
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: 'VideoSystem',

  data: () => ({
    deleteScreenDialog: false,
    deleteVideoDialog: false,
    moveScreenDialog: false,
    offTypes: [
      { text: 'None', value: 3 },
      { text: 'Video Playlist', value: 1 },
      { text: 'Image', value: 2 }
    ]
  }),
  props: {
    screens: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  methods: {
    addVideoScreen () {
      const screenCount = this.screens.length + 1
      const nextItem = {
        liveLink: '',
        playlist: [''],
        name: `Screen ${screenCount}`
      }
      return this.screens.push(nextItem)
    },
    removeVideoScreen (s) {
      this.deleteScreenDialog = false
      this.screens.splice(s, 1)
      this.updateProperties({
        action: 'remove',
        entity: 'videoScreen'
      })
    },
    saveScreenMove (s) {
      console.log(s)
      this.moveScreenDialog = false
      this.updateProperties({
        action: 'update',
        entity: 'videoScreen',
        property: 'transform'
      })
    },
    updateOffImage () {
      this.updateProperties({
        action: 'update',
        entity: 'videoScreen',
        property: 'offImage'
      })
    },
    cancelScreenMove (s) {
      console.log(s)
      this.moveScreenDialog = false
      this.updateProperties({
        action: 'update',
        entity: 'videoScreen',
        property: 'transform'
      })
    },
    addVideo (s) {
      console.log(this.screens)
      const nextItem = ''
      this.screens[s].playlist.push(nextItem)
    },
    removeVideo (s, v) {
      console.log(this.screens)
      this.screens[s].playlist.splice(v, 1)
      this.updateProperties({
        action: 'update',
        entity: 'videoScreen',
        property: 'playlist'
      })
    },
    updateLiveLink (s) {
      if (this.screens[s].liveLink) {
        this.screens[s].type = 0
      } else {
        this.screens[s].type = 1
      }
      this.updateProperties({
        action: 'update',
        entity: 'videoScreen',
        property: 'liveLink'
      })
    },
    updateVideoScreenName () {
      this.updateProperties({
        action: 'update',
        entity: 'videoScreen',
        property: 'name'
      })
    },
    updateVolume () {
      this.updateProperties({
        action: 'update',
        entity: 'videoScreen',
        property: 'volume'
      })
    },
    updateOffType () {
      this.updateProperties({
        action: 'update',
        entity: 'videoScreen',
        property: 'offType'
      })
    },
    updatePlaylist () {
      this.updateProperties({
        action: 'update',
        entity: 'videoScreen',
        property: 'playlist'
      })
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', { wssMessages })
    }
  }
}
</script>
