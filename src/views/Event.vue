<template>
  <div>
    <focus-page :loadingMessage="`Loading ${event?.name}`" :loading="loadingEvent" :noContent="!event" :imageLink="placeholder">
      <template v-slot:header>{{ event?.name }}</template>
      <template v-slot:header-actions
        ><v-chip v-if="ongoing" class="green ma-4"><span>Ongoing</span></v-chip>
        <v-chip v-else-if="future" class="orange ma-4"
          ><span>Starts {{ startTimeRelative }}</span></v-chip
        >
        <v-chip v-else-if="past" class="grey ma-4">
          <span>Ended {{ endTimeRelative }}</span>
        </v-chip>
      </template>
      <template v-slot:no-content-header>Could Not Load Event</template>
      <template v-slot:no-content-text> Please try again and contact support if the problem continues. </template>
      <v-card class="cyberpunk-border mx-4 my-2">
        <v-card-text>
          <v-container fluid>
            <v-row class="d-flex justify-space-between">
              <v-col md="4" sm="6" xs="6">
                <div class="d-flex flex-column align-stretch justify-stretch flex-grow-2">
                  <v-text-field
                    label="Event Name"
                    v-model="event.name"
                    outlined
                    :disabled="propertyLoading('name')"
                    :loading="propertyLoading('name')"
                    @change="updateEventProperty('name')"
                  ></v-text-field>
                  <v-textarea
                    label="Event Description"
                    v-model="event.description"
                    outlined
                    :disabled="propertyLoading('description')"
                    :loading="propertyLoading('description')"
                    @change="updateEventProperty('description')"
                    :rules="[event?.description?.length <= 500]"
                    counter="500"
                  ></v-textarea>
                  <v-select label="Worlds" multiple outlined :items="metaverseWorlds" v-model="event.worlds"></v-select>
                  <v-text-field label="Location Name/Coordinates" outlined v-model="event.location"></v-text-field>
                  <v-text-field label="Location URL" outlined v-model="event.locationUrl"></v-text-field>
                </div>
              </v-col>
              <v-col md="8" sm="6" xs="6">
                <v-row>
                  <v-col>
                    <v-card class="date-time-card frosted cyberpunk-border flex-grow-0" elevation="12">
                      <v-card-title v-if="future" class="date-time-title justify-space-around text-center">Starts</v-card-title>
                      <v-card-title v-if="ongoing" class="date-time-title justify-space-around text-center">Started</v-card-title>
                      <v-card-title v-if="!event.eventStart" class="date-time-title justify-space-around text-center">Event Start</v-card-title>
                      <v-card-text class="justify-space-around text-center flex-column flex-grow-1">
                        <div v-if="!eventStartDate && !eventStartTime" class="date-text text-center" :min-height="42">
                          <v-icon x-large>mdi-infinity</v-icon>
                        </div>
                        <div class="date-text justify-space-around text-center">{{ startTimeRelative }}</div>
                        <div v-if="event.eventStart" class="date-text justify-space-around text-center">{{ startDateTimeLocal }}</div>
                      </v-card-text>
                      <v-card-actions class="d-flex flex-column justify-center pa-2">
                        <v-menu v-model="editingStartDate" :close-on-content-click="false" max-width="290">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn text color="primary" x-small v-bind="attrs" v-on="on" :loading="propertyLoading('eventStartDate')"
                              ><v-icon class="mr-1" x-small>mdi-calendar</v-icon>Set Date</v-btn
                            >
                          </template>
                          <v-card>
                            <v-date-picker color="primary" v-model="eventStartDate" @change="updateEventProperty('eventStartDate')"></v-date-picker>
                            <v-card-actions class="d-flex justify-end">
                              <v-btn text color="primary" @click="updateEventProperty('eventStartDate')">Save</v-btn>
                              <v-btn text color="grey" @click="editingStartDate = false">Cancel</v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-menu>
                        <v-menu v-model="editingStartTime" :close-on-content-click="false" max-width="290">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn text color="primary" v-bind="attrs" v-on="on" x-small :loading="propertyLoading('eventStartTime')"
                              ><v-icon class="mr-1" x-small>mdi-clock</v-icon>Set Time</v-btn
                            >
                          </template>
                          <v-card>
                            <v-time-picker
                              v-if="editingStartTime"
                              color="primary"
                              v-model="eventStartTime"
                              @change="updateEventProperty('eventStartTime')"
                            ></v-time-picker>
                            <v-card-actions class="d-flex justify-end">
                              <v-btn text color="primary" @click="updateEventProperty('eventStartTime')">Save</v-btn>
                              <v-btn text color="grey" @click="editingStartTime = false">Cancel</v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-menu>
                        <v-btn v-if="event.eventStart" text color="primary" x-small :loading="propertyLoading('eventStart')" @click="clearStartDate"
                          ><v-icon class="mr-1" x-small>mdi-close</v-icon>Clear</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-col>
                  <v-col>
                    <v-card dense class="date-time-card frosted cyberpunk-border" elevation="12">
                      <v-card-title v-if="eventEndDate && !past" class="date-time-title justify-space-around text-center">Ends</v-card-title>
                      <v-card-title v-if="eventEndDate && past" class="date-time-title justify-space-around text-center">Ended</v-card-title>
                      <v-card-title v-if="!event.eventEnd" class="date-time-title justify-space-around text-center">Event End</v-card-title>
                      <v-card-text class="">
                        <div v-if="!eventEndDate && !eventEndTime" class="date-text text-center" :min-height="42">
                          <v-icon x-large>mdi-infinity</v-icon>
                        </div>
                        <div v-if="eventEndDate && eventEndTime" class="date-text justify-space-around text-center">{{ endTimeRelative }}</div>
                        <div v-if="event.eventEnd" class="date-text justify-space-around text-center">{{ endDateTimeLocal }}</div>
                      </v-card-text>
                      <v-card-actions class="d-flex flex-column justify-center pa-2">
                        <v-menu v-model="editingEndDate" :close-on-content-click="false" max-width="290">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn text color="primary" x-small v-bind="attrs" v-on="on" :loading="propertyLoading('eventEndDate')"
                              ><v-icon class="mr-1" x-small>mdi-calendar</v-icon>Set Date</v-btn
                            >
                          </template>
                          <v-card>
                            <v-date-picker color="primary" v-model="eventEndDate" @change="updateEventProperty('eventEndDate')"></v-date-picker>
                            <v-card-actions class="d-flex justify-end">
                              <v-btn text color="primary" @click="updateEventProperty('eventEndDate')">Save</v-btn>
                              <v-btn text color="grey" @click="editingEndDate = false">Cancel</v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-menu>
                        <v-menu v-model="editingEndTime" :close-on-content-click="false" max-width="290">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn text color="primary" v-bind="attrs" v-on="on" x-small :loading="propertyLoading('eventEndTime')"
                              ><v-icon class="mr-1" x-small>mdi-clock</v-icon>Set Time</v-btn
                            >
                          </template>
                          <v-card>
                            <v-time-picker
                              v-if="editingEndTime"
                              color="primary"
                              v-model="eventEndTime"
                              @change="updateEventProperty('eventEndTime')"
                            ></v-time-picker>
                            <v-card-actions class="d-flex justify-end">
                              <v-btn text color="primary" @click="updateEventProperty('eventEndTime')">Save</v-btn>
                              <v-btn text color="grey" @click="editingEndTime = false">Cancel</v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-menu>
                        <v-btn v-if="event.eventEnd" text color="primary" x-small :loading="propertyLoading('eventEnd')" @click="clearEndDate"
                          ><v-icon class="mr-1" x-small>mdi-close</v-icon>Clear</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-select
                      label="Linked Scenes"
                      multiple
                      outlined
                      :items="userSceneSelection"
                      item-text="name"
                      item-value="sk"
                      v-model="sceneLinkIds"
                      :loading="propertyLoading('linkedScenes')"
                      @change="sceneLinksUpdate"
                    ></v-select>
                    <v-select
                      label="Linked Giveaways"
                      multiple
                      outlined
                      :items="userGiveawaySelection"
                      item-text="name"
                      item-value="sk"
                      v-model="giveawayLinkIds"
                      :loading="propertyLoading('linkedGiveaways')"
                      @change="giveawayLinksUpdate"
                    ></v-select>
                  </v-col>
                  <v-col>
                    <v-card class="black pa-2">
                      <claim-limits
                        :itemName="event.name"
                        :claimLimits="event.claimLimits"
                        @updateClaimLimits="updateEventProperty('claimLimits')"
                      ></claim-limits>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
      <v-container>
        <v-row>
          <v-col>
            <v-card>
              <v-card-title class="d-flex justify-space-between align-start">
                <div>Event Attendees</div>
              </v-card-title>
              <v-card-text class="text-center"> Analytics coming soon... </v-card-text>
            </v-card>
          </v-col>
          <v-col>
            <v-card>
              <v-card-title class="d-flex justify-space-between align-start">
                <div>Giveaway Claims</div>
                <!-- <v-btn><v-icon class="mr-1">mdi-export</v-icon>Export CSV</v-btn> -->
              </v-card-title>
              <v-card-text class="text-center">Claim data coming soon...</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </focus-page>
    <v-dialog v-model="linkSceneDialog" max-width="300">
      <v-card>
        <v-card-title>Link Scene To Event</v-card-title>
        <v-card-text>
          <v-select outlined :items="userSceneList" label="Scene" item-text="name" item-value="sk" v-model="sceneToLink" hide-details></v-select>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn text color="primary" @click="linkSelectedScene">Link</v-btn>
          <v-btn text color="grey" @click="linkSceneDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="linkGiveawayDialog" max-width="300">
      <v-card>
        <v-card-title>Link Giveaway To Event</v-card-title>
        <v-card-text>
          <v-select
            outlined
            :items="userGiveawayList"
            label="Giveaway"
            item-text="name"
            item-value="sk"
            v-model="giveawayToLink"
            hide-details
          ></v-select>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn text color="primary" @click="linkSelectedGiveaway">Link</v-btn>
          <v-btn text color="grey" @click="linkGiveawayDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { DateTime } from 'luxon'
import eventImgPlaceholder from '@/assets/placeholder.png'
import FocusPage from '../components/FocusPage'
import ClaimLimits from '../components/ClaimLimits'

export default {
  name: 'Event',
  components: {
    ClaimLimits,
    FocusPage,
  },
  data: () => ({
    showParcelMap: false,
    deleteScreenDialog: false,
    updateHistoryDialog: false,
    editingScreenName: false,
    tab: null,
    metaverseWorlds: [
      { text: 'Decentraland', value: 'decentraland' },
      { text: 'Hyperfy', value: 'hyperfy' },
      { text: 'Monaverse', value: 'monaverse' },
      { text: 'Roblox', value: 'roblox' },
      { text: 'Spatial', value: 'spatial' },
      { text: 'The Sandbox', value: 'the sandbox' },
      { text: 'VRChat', value: 'vrchat' },
      { text: 'Other', value: 'other' },
    ],
    editingStartDate: false,
    editingStartTime: false,
    editingEndDate: false,
    editingEndTime: false,
    endDialog: false,
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    updatedEvent: {},
    linkGiveawayDialog: false,
    linkSceneDialog: false,
    sceneToLink: null,
    giveawayToLink: null,
    sceneLinkIds: [],
    giveawayLinkIds: [],
    userSceneSelection: [],
    userGiveawaySelection: [],
  }),

  async mounted() {
    this.setActiveEvent(this.$route.params.eventId)
    await this.getEvent(this.$route.params.eventId)
    this.eventStart = this.event.eventStart
    this.eventEnd = this.event.eventEnd || null
    this.sceneLinkIds = this.linkedScenes
    this.giveawayLinkIds = this.linkedGiveaways
    this.userSceneSelection = this.userSceneList
    this.userGiveawaySelection = this.userGiveawayList
  },

  beforeDestroy() {
    this.clearActiveEvent()
  },
  computed: {
    ...mapGetters({
      user: 'user/userInfo',
      activeEvent: 'event/activeEvent',
      giveawayLinks: 'event/giveawayLinks',
      scenesForEvent: 'event/scenesForEvent',
      giveawaysForEvent: 'event/giveawaysForEvent',
      loadingEvent: 'event/loadingEvent',
      loadingProperties: 'event/loadingProperties',
      userSceneList: 'scene/sceneList',
      userGiveawayList: 'giveaway/giveawayList',
    }),
    event: {
      get() {
        return this.activeEvent || {}
      },
      set(value) {
        return value
      },
    },
    linkedGiveaways() {
      const giveawayLinks = this.giveawaysForEvent(this.event?.sk)
      if (giveawayLinks?.length) {
        return giveawayLinks.map((giveaway) => giveaway.sk)
      }
      return []
    },
    linkedScenes() {
      const sceneLinks = this.scenesForEvent(this.event?.sk)
      if (sceneLinks?.length) {
        return sceneLinks.map((scene) => scene.sk)
      }
      return []
    },
    placeholder() {
      return eventImgPlaceholder
    },
    claims() {
      return []
    },
    worlds() {
      const worldNames = []
      if (this.event.worlds) {
        this.event.worlds.forEach((world) => {
          switch (world) {
            case 0:
              worldNames.push('Decentraland')
              break
            case 1:
              worldNames.push('Hyperfy')
          }
        })
      }
      return worldNames.join(', ') || 'None'
    },
    startDateTimeLocal() {
      if (!this.event?.eventStart) {
        return ''
      }
      return DateTime.fromMillis(this.event.eventStart).toLocaleString(DateTime.DATETIME_MED)
    },
    endDateTimeLocal() {
      if (!this.event?.eventEnd) {
        return ''
      }
      return DateTime.fromMillis(this.event.eventEnd).toLocaleString(DateTime.DATETIME_MED)
    },
    startTimeRelative() {
      if (!this.event?.eventStart) {
        return ''
      }
      return DateTime.fromMillis(this.event.eventStart).toRelative()
    },
    endTimeRelative() {
      if (!this.event?.eventEnd) {
        return ''
      }
      return DateTime.fromMillis(this.event.eventEnd).toRelative()
    },
    ongoing() {
      if (!this.event || (!this.event?.eventStart && !this.event?.eventEnd)) {
        return null
      }
      return DateTime.now().toSeconds() >= this.event.eventStart && (!this.event.eventEnd || DateTime.now().toSeconds() <= this.event.eventEnd)
    },
    future() {
      if (!this.event || (!this.event?.eventStart && !this.event?.eventEnd)) {
        return ''
      }
      return DateTime.now().toSeconds() < this.event.eventStart
    },
    past() {
      if (!this.event || (!this.event?.eventStart && !this.event?.eventEnd)) {
        return ''
      }
      return DateTime.now().toSeconds() > this.event.eventEnd
    },
    eventStartDate: {
      get() {
        return this.event.eventStart ? DateTime.fromMillis(this.event.eventStart).toISODate() : null
      },
      set(value) {
        const date = DateTime.fromISO(value)
        const time = this.event.eventStart ? DateTime.fromMillis(this.event.eventStart) : DateTime.local()
        this.updatedEvent.eventStart = date.set({ hour: time.hour, minute: time.minute }).toMillis()
        this.event.eventStart = date.set({ hour: time.hour, minute: time.minute }).toMillis()
        return date.set({ hour: time.hour, minute: time.minute }).toMillis()
      },
    },
    eventStartTime: {
      get() {
        return this.event.eventStart ? DateTime.fromMillis(this.event.eventStart).toFormat('HH:mm') : null
      },
      set(value) {
        const parts = value.split(':')
        const date = DateTime.fromMillis(this.event.eventStart)
        this.updatedEvent.eventStart = date.set({ hour: parts[0], minute: parts[1] }).toMillis()
        this.event.eventStart = date.set({ hour: parts[0], minute: parts[1] }).toMillis()
        return date.set({ hour: parts[0], minute: parts[1] }).toMillis()
      },
    },
    eventEndDate: {
      get() {
        return this.event.eventEnd ? DateTime.fromMillis(this.event.eventEnd).toISODate() : null
      },
      set(value) {
        if (value) {
          // Check if the value is not null or undefined
          const date = DateTime.fromISO(value)
          const time = this.event.eventEnd ? DateTime.fromMillis(this.event.eventEnd) : DateTime.local()
          this.updatedEvent.eventEnd = date.set({ hour: time.hour, minute: time.minute }).toMillis()
          this.event.eventEnd = date.set({ hour: time.hour, minute: time.minute }).toMillis()
          return date.set({ hour: time.hour, minute: time.minute }).toMillis()
        } else {
          return this.event.eventEnd
        }
      },
    },
    eventEndTime: {
      get() {
        return this.event.eventEnd ? DateTime.fromMillis(this.event.eventEnd).toFormat('HH:mm') : null
      },
      set(value) {
        if (value && this.event.eventEnd) {
          // Check if the value and this.eventEnd are not null or undefined
          const parts = value.split(':')
          const date = DateTime.fromMillis(this.event.eventEnd)
          this.updatedEvent.eventEnd = date.set({ hour: parts[0], minute: parts[1] }).toMillis()
          this.event.eventEnd = date.set({ hour: parts[0], minute: parts[1] }).toMillis()
          return date.set({ hour: parts[0], minute: parts[1] }).toMillis()
        } else {
          return this.event.eventEnd
        }
      },
    },
  },
  methods: {
    ...mapActions({
      setActiveEvent: 'event/setActiveEvent',
      clearActiveEvent: 'event/clearActiveEvent',
      getEvent: 'event/getEvent',
      sendUiMessage: 'moderation/sendUiMessage',
      updateEvent: 'event/updateEvent',
      updateSceneLinks: 'event/updateSceneLinks',
      updateGiveawayLinks: 'event/updateGiveawayLinks',
    }),
    goBack() {
      this.$router.go(-1)
    },
    openLinkGiveawayDialog() {
      this.linkGiveawayDialog = true
    },
    openLinkSceneDialog() {
      this.linkSceneDialog = true
    },
    propertyLoading(property) {
      return this.loadingProperties.includes(property)
    },
    async sceneLinksUpdate() {
      this.updateSceneLinks({ eventId: this.event?.sk, sceneLinkIds: this.sceneLinkIds })
    },
    async giveawayLinksUpdate() {
      this.updateGiveawayLinks({ eventId: this.event?.sk, giveawayLinkIds: this.giveawayLinkIds })
    },
    async updateEventProperty(property) {
      if (!property == 'eventStartDate' && !property == 'eventStartTime') {
        // do nothing in this block
      } else if (this.updatedEvent.eventStart && this.updatedEvent.eventEnd && this.updatedEvent.eventStart >= this.updatedEvent.eventEnd) {
        this.$store.dispatch('banner/showError', {
          message: 'End date must be before end date',
        })
      }
      if (!property == 'eventEndDate' && !property == 'eventEndTime') {
        // do nothing in this block
      } else if (this.updatedEvent.eventEnd && this.updatedEvent.eventStart && this.updatedEvent.eventEnd <= this.updatedEvent.eventStart) {
        this.$store.dispatch('banner/showError', {
          message: 'End date must be after start date',
        })
      }
      if (property == 'description' && this.event?.description?.length > 500) {
        this.$store.dispatch('banner/showError', {
          message: 'Description must be less than 500 characters',
        })
      }

      this.editingEndDate = false
      this.editingEndTime = false
      this.editingStartDate = false
      this.editingStartTime = false
      await this.updateEvent({ eventConfig: { ...this.event, ...this.updatedEvent }, property })
      this.updatedEvent = {}
    },
    clearStartDate() {
      this.event.eventStart = null
      this.eventStartDate = null
      this.eventStartTime = null
      this.updateEventProperty('eventStart')
    },
    clearEndDate() {
      this.event.eventEnd = null
      this.eventEndDate = null
      this.eventEndTime = null
      this.updateEventProperty('eventEnd')
    },
    linkSelectedScene() {
      // check if link is already present
      this.sceneLinks.forEach((scene) => {
        if (scene.sk == this.sceneToLink) {
          this.$store.dispatch('banner/showError', {
            message: 'Scene has already been linked.',
          })
          return
        }
      })
      this.linkScene({
        eventId: this.event.sk,
        sceneId: this.sceneToLink,
      })
      this.linkSceneDialog = false
    },
    linkSelectedGiveaway() {
      // check if link is already present
      this.giveawayLinks.forEach((giveaway) => {
        if (giveaway.sk == this.giveawayToLink) {
          this.$store.dispatch('banner/showError', {
            message: 'Giveaway has already been linked.',
          })
          return
        }
      })
      this.linkGiveaway({
        eventId: this.event.sk,
        giveawayId: this.giveawayToLink,
      })
      this.linkGiveawayDialog = false
    },
    unlinkScene(sceneId) {
      this.unlinkSceneFromEvent({
        eventId: this.event.sk,
        sceneId,
      })
    },
    unlinkGiveaway(giveawayId) {
      this.unlinkGiveawayFromEvent({
        eventId: this.event.sk,
        giveawayId,
      })
    },
  },
}
</script>

<style scoped>
.date-text {
  line-height: 14pt;
}

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
