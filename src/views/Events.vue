<template>
  <div>
    <content-page loadingMessage="Loading your events..." :loading="loadingEvents" :noContent="filteredEvents?.length == 0">
      <template v-slot:header> {{ localeText('Events') }}</template>
      <template v-slot:header-actions>
        <v-btn @click="openNewEventDialog"><v-icon small class="mr-1">mdi-plus</v-icon> {{ localeText('Event') }}</v-btn>
        <v-menu offset-y :close-on-content-click="true">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" dark v-bind="attrs" v-on="on" class="mx-4">
              <v-icon class="mr-2">mdi-filter</v-icon>
              {{ filterTypes[filterType]?.text }}
            </v-btn>
          </template>

          <v-list>
            <v-list-item v-for="(filter, index) in filterTypes" :key="index" @click="changeFilterType(filter)">
              <v-list-item-content>
                {{ filter?.text }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-slot:no-content-header>{{ localeText('NoData') }}</template>
      <template v-slot:no-content-text> {{ localeText('CTA') }} </template>
      <template v-slot:no-content-cta>
        <v-btn @click="openNewEventDialog"><v-icon class="mr-1">mdi-plus</v-icon> {{ localeText('Event') }} </v-btn>
      </template>
      <v-container fluid>
        <v-row class="text-center" v-if="!loadingEvents">
          <v-col md="4" sm="6" xs="12" v-for="(event, i) in filteredEvents" :key="i">
            <router-link :to="`event/${event.sk}`" class="event-card-link">
              <event-card :event="event" />
            </router-link>
          </v-col>
        </v-row>
      </v-container>
    </content-page>
    <v-dialog v-model="newEventDialog" width="380">
      <v-card>
        <v-card-title class="text-h5"><v-icon class="mr-1">mdi-plus</v-icon> {{ localeText('Event') }} </v-card-title>

        <v-card-text>
          <v-text-field :label="localeText('Event Name')" outlined v-model="newEventName"></v-text-field>
          <v-autocomplete :items="timezoneList" v-model="newTzCode" :placeholder="localeText('Timezone')" outlined> </v-autocomplete>
          <div class="d-flex">
            <v-menu v-model="showStartDatePicker" :close-on-content-click="false" transition="expand-transition" offset-y max-width="380">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="formattedStartDate"
                  clearable
                  :label="localeText('Start Date')"
                  readonly
                  outlined
                  v-bind="attrs"
                  v-on="on"
                  append-icon="mdi-calendar-blank"
                  @click:clear="newEventStartDate = null"
                  class="mr-2"
                ></v-text-field>
              </template>
              <v-date-picker v-model="newEventStartDate" @change="showStartDatePicker = false"></v-date-picker>
            </v-menu>
            <v-menu
              ref="startTimeMenu"
              v-model="showStartTimePicker"
              :close-on-content-click="false"
              :return-value.sync="newEventStartTime"
              transition="expand-transition"
              offset-y
              left
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="newEventStartTime"
                  :label="localeText('Start Time')"
                  outlined
                  :append-icon="clockIcon(newEventStartTime)"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-time-picker
                v-model="newEventStartTime"
                active-picker="HOUR"
                @click:minute="$refs.startTimeMenu.save(newEventStartTime)"
              ></v-time-picker>
            </v-menu>
          </div>
          <div class="d-flex">
            <v-menu v-model="showEndDatePicker" :close-on-content-click="false" transition="expand-transition" offset-y max-width="380">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="formattedEndDate"
                  clearable
                  :label="localeText('End Date')"
                  readonly
                  outlined
                  v-bind="attrs"
                  v-on="on"
                  append-icon="mdi-calendar-blank"
                  @click:clear="newEventEndDate = null"
                  class="mr-2"
                ></v-text-field>
              </template>
              <v-date-picker v-model="newEventEndDate" @change="showEndDatePicker = false"></v-date-picker>
            </v-menu>
            <v-menu
              ref="endTimeMenu"
              v-model="showEndTimePicker"
              :close-on-content-click="false"
              :return-value.sync="newEventEndTime"
              transition="expand-transition"
              offset-y
              left
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="newEventEndTime"
                  :label="localeText('End Time')"
                  outlined
                  :append-icon="clockIcon(newEventEndTime)"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-time-picker v-model="newEventEndTime" @click:minute="$refs.endTimeMenu.save(newEventEndTime)"></v-time-picker>
            </v-menu>
          </div>
          <v-select :label="localeText('Worlds')" multiple outlined :items="metaverseWorlds" v-model="newEventWorlds"></v-select>
          <v-text-field :label="localeText('Location Name/Coordinates')" outlined v-model="newEventLocation"></v-text-field>
          <v-text-field :label="localeText('Location URL')" outlined v-model="newEventLocationUrl"></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="grey darken-1" text @click="newEventDialog = false"> {{ localeAction('cancel') }} </v-btn>

          <v-btn color="primary darken-1" text @click="createNewEvent"> {{ localeAction('create') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import EventCard from '../components/EventCard'
import store from '../store'
import { DateTime } from 'luxon'
import ContentPage from '../components/ContentPage'
import timezones from 'timezones-list'

export default {
  components: { EventCard, ContentPage },
  name: 'Events',
  data: () => ({
    newEventDialog: false,
    newEventName: '',
    newEventStartDate: null,
    newEventEndDate: null,
    newEventStartTime: null,
    newEventEndTime: null,
    newTzCode: null,
    newEventWorlds: [],
    newEventLocation: null,
    newEventLocationUrl: null,
    showStartDatePicker: false,
    showStartTimePicker: false,
    showEndDatePicker: false,
    showEndTimePicker: false,
    activeOwner: null,
    filterType: 0,
    filterTypes: [
      { value: 0, text: 'All Events' },
      { value: 1, text: 'Upcoming Events' },
      { value: 2, text: 'Ongoing Events' },
      { value: 3, text: 'Past Events' },
    ],
    sortType: 0,
    sortTypes: [
      { value: 0, text: 'Name' },
      { value: 1, text: 'Earliest Start Date' },
      { value: 2, text: 'Latest Start Date' },
      { value: 3, text: 'Earliest End Date' },
      { value: 4, text: 'Latest End Date' },
    ],
    metaverseWorlds: [
      { value: 'decentraland', text: 'Decentraland' },
      { value: 'hyperfy', text: 'Hyperfy' },
    ],
    timezoneList: [
      { text: 'UTC', value: 'UTC' },
      ...timezones.map((tz) => ({
        text: `${tz.tzCode} (UTC ${tz.utc})`,
        value: tz.tzCode,
      })),
    ],
  }),
  created() {
    if (!this.$store.getters['auth/authenticated']) {
      this.$store.dispatch('auth/refreshSession')
    }
  },
  async mounted() {
    this.getEvents()
  },
  computed: {
    ...mapGetters({
      events: 'event/eventList',
      loadingEvents: 'event/loadingEvents',
      localeText: 'i18n/events',
      localeAction: 'i18n/actions',
    }),
    mdAndDown() {
      return this.$vuetify.breakpoint.mdAndUp
    },
    formattedStartDate() {
      return this.newEventStartDate ? DateTime.fromFormat(this.newEventStartDate, 'yyyy-MM-dd').toLocaleString(DateTime.DATE_MED) : ''
    },
    formattedStartTime() {
      return this.newEventStartTime ? DateTime.fromFormat(this.newEventStartTime, 'yyyy-MM-dd').toLocaleString(DateTime.TIME_SIMPLE) : ''
    },
    formattedEndDate() {
      return this.newEventEndDate ? DateTime.fromFormat(this.newEventEndDate, 'yyyy-MM-dd').toLocaleString(DateTime.DATE_MED) : ''
    },
    formattedEndTime() {
      return this.newEventEndTime ? DateTime.fromFormat(this.newEventEndTime, 'yyyy-MM-dd').toLocaleString(DateTime.TIME_SIMPLE) : ''
    },
    eventStart() {
      return DateTime.fromFormat(`${this.newEventStartDate} ${this.newEventStartTime}`, 'yyyy-MM-dd HH:mm').toMillis()
    },
    eventEnd() {
      return DateTime.fromFormat(`${this.newEventEndDate} ${this.newEventEndTime}`, 'yyyy-MM-dd HH:mm').toMillis()
    },
    eventOwners() {
      return this.events.map((event) => ({
        creatorId: event.creator,
        creatorDisplayName: event.creatorDisplayName,
      }))
    },
    userInfo() {
      return store.state.user.userInfo
    },
    userOrgs() {
      return store.state.organization.userOrgs
    },
    pastEvents() {
      return this.events
        .filter((event) => event.eventEnd && DateTime.fromMillis(event?.eventEnd).diffNow() < 0)
        .sort((a, b) => a.eventStart > b.eventStart)
    },
    ongoingEvents() {
      return [...this.events]
        .sort((a, b) => {
          return a.eventStart - b.eventStart >= 0 ? a.eventStart : b.eventStart
        })
        .filter(
          (event) => DateTime.fromMillis(event.eventStart).diffNow() < 0 && (!event.eventEnd || DateTime.fromMillis(event?.eventEnd).diffNow() > 0)
        )
    },
    futureEvents() {
      return this.events.filter((event) => DateTime.fromMillis(event.eventStart).diffNow() > 0)
    },
    memberSince() {
      return DateTime.fromMillis(this.userInfo.registeredAt).toLocaleString()
    },
    filteredEvents() {
      switch (this.filterType) {
        case 0:
          return this.events
        case 1:
          return this.futureEvents
        case 2:
          return this.ongoingEvents
        case 3:
          return this.pastEvents
        default:
          return this.events
      }
    },
  },
  methods: {
    ...mapActions({
      getEvents: 'event/getEvents',
      createEvent: 'event/createEvent',
    }),
    async createNewEvent() {
      this.newEventDialog = false
      await this.createEvent({
        name: this.newEventName,
        eventStart: this.eventStart,
        eventEnd: this.eventEnd,
        timeZone: this.newTzCode,
        worlds: this.newEventWorlds,
        location: this.newEventLocation,
        locationUrl: this.newEventLocationUrl,
      })
      this.resetNewEvent()
    },
    resetNewEvent() {
      this.newEventName = ''
      this.newEventStartDate = null
      this.newEventEndDate = null
      this.newEventStartTime = null
      this.newEventEndTime = null
      this.newTzCode = null
      this.newEventWorlds = []
      this.newEventLocation = null
      this.newEventLocationUrl = null
    },
    openNewEventDialog() {
      this.newEventDialog = true
    },
    changeFilterType(filterType) {
      this.filterType = filterType.value
    },
    clockIcon(time) {
      if (!time) {
        return 'mdi-clock-outline'
      }

      const hour = time.split(':')[0]
      switch (hour) {
        case '00':
        case '12':
          return 'mdi-clock-time-twelve-outline'
        case '01':
        case '13':
          return 'mdi-clock-time-one-outline'
        case '02':
        case '14':
          return 'mdi-clock-time-two-outline'
        case '03':
        case '15':
          return 'mdi-clock-time-three-outline'
        case '04':
        case '16':
          return 'mdi-clock-time-four-outline'
        case '05':
        case '17':
          return 'mdi-clock-time-five-outline'
        case '06':
        case '18':
          return 'mdi-clock-time-six-outline'
        case '07':
        case '19':
          return 'mdi-clock-time-seven-outline'
        case '08':
        case '20':
          return 'mdi-clock-time-eight-outline'
        case '09':
        case '21':
          return 'mdi-clock-time-nine-outline'
        case '10':
        case '22':
          return 'mdi-clock-time-ten-outline'
        case '11':
        case '23':
          return 'mdi-clock-time-eleven-outline'
        default:
          return 'mdi-clock-outline'
      }
    },
    formatDate(date) {
      const [dateStr] = new Date(date).toISOString().split('T')
      return dateStr
    },
  },
}
</script>

<style scoped>
.event-card-link {
  text-decoration: none;
}
</style>
