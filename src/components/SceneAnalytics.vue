<template>
  <div>
    <v-container class="py-6 mx-auto">
      <v-row>
        <v-col no-gutters>
          <h1 class="text-h5 mb-6">Analytics</h1>
        </v-col>
      </v-row>
      <v-row v-if="features.interactions" class="grey darken-3 mx-n3">
        <v-col no-gutters>
          <h1 class="text-h6">Interactions</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card>
            <v-container>
              <v-row>
                <v-col cols="12" sm="4" md="4" order="1" class="text-center">
                  <div class="text-h6">Timezone</div>
                  <v-menu
                    ref="timeZoneMenu"
                    v-model="timeZoneMenu"
                    :close-on-content-click="false"
                    :return-value.sync="tzCode"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        @click="
                          open('timeZoneMenu', {
                            set: 'newTzCode',
                            to: 'tzCode'
                          })
                        "
                        v-bind="attrs"
                        v-on="on"
                        class="display-flex flex-row"
                        small
                      >
                        <v-icon small class="mr-2">mdi-map-clock</v-icon>
                        <div class="text-caption">
                          {{ selectedTimezone.tzCode }} (UTC
                          {{ selectedTimezone.utc }})
                        </div>
                      </v-btn>
                    </template>
                    <v-card class="pa-4">
                      <v-autocomplete
                        :items="timezoneList"
                        v-model="newTzCode"
                        placeholder="Timezone Search"
                        prepend-icon="mdi-map-search-outline"
                        @change="save('tzCode', 'newTzCode')"
                      >
                      </v-autocomplete
                      ><v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="saveTz()">
                          Save
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="cancel('newTzCode', 'timeZoneMenu')"
                        >
                          Cancel
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="4" md="4" order="2" class="text-center">
                  <div class="text-h6">Start</div>
                  <div class="display-flex flex-row justify-space-between">
                    <v-menu
                      ref="startDateMenu"
                      v-model="startDateMenu"
                      :close-on-content-click="false"
                      :return-value.sync="startDateTime"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          @click="
                            open('startDateMenu', {
                              set: 'newStartDate',
                              to: 'startDate'
                            })
                          "
                          small
                          v-bind="attrs"
                          v-on="on"
                        >
                          <v-icon small class="mr-2">mdi-calendar</v-icon>
                          {{ startDate }}
                        </v-btn>
                      </template>
                      <v-date-picker v-model="newStartDate" no-title>
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="primary"
                          @click="
                            save(
                              'startDate',
                              'newStartDate',
                              null,
                              'startDateMenu'
                            )
                          "
                        >
                          Save
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="cancel('newStartDate', 'startDateMenu')"
                        >
                          Cancel
                        </v-btn>
                      </v-date-picker>
                    </v-menu>
                    <v-menu
                      ref="startTimeMenu"
                      v-model="startTimeMenu"
                      :close-on-content-click="false"
                      :return-value.sync="startDateTime"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          @click="
                            open('startTimeMenu', {
                              set: 'newStartTime',
                              to: 'startTime'
                            })
                          "
                          v-bind="attrs"
                          v-on="on"
                          small
                          ><v-icon small class="mr-2">{{
                            clockIcon(newStartTime || startTime)
                          }}</v-icon
                          >{{ newStartTime || startTime }}</v-btn
                        >
                      </template>
                      <v-time-picker
                        v-model="newStartTime"
                        no-title
                        use-seconds
                      >
                        <v-btn
                          text
                          color="accent"
                          @click="newStartTime = '00:00:00'"
                        >
                          Start Of Day
                        </v-btn>
                        <v-btn
                          text
                          color="accent"
                          @click="newStartTime = '23:59:59'"
                        >
                          End Of Day
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="primary"
                          @click="
                            save(
                              'startTime',
                              'newStartTime',
                              null,
                              'startTimeMenu'
                            )
                          "
                        >
                          Save
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="cancel('newStartTime', 'startTimeMenu')"
                        >
                          Cancel
                        </v-btn>
                      </v-time-picker>
                    </v-menu>
                  </div>
                </v-col>
                <v-col cols="12" sm="4" md="4" order="3" class="text-center">
                  <div class="text-h6">End</div>
                  <v-menu
                    ref="endDateMenu"
                    v-model="endDateMenu"
                    :close-on-content-click="false"
                    :return-value.sync="endDateTime"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        @click="
                          open('endDateMenu', {
                            set: 'newEndDate',
                            to: 'endDate'
                          })
                        "
                        v-bind="attrs"
                        v-on="on"
                        small
                        ><v-icon small class="mr-2">mdi-calendar</v-icon>
                        {{ endDate }}
                      </v-btn>
                    </template>
                    <v-date-picker
                      v-model="newEndDate"
                      no-title
                      v-if="!endTimeMenu"
                    >
                      <v-spacer></v-spacer>
                      <v-btn
                        text
                        color="primary"
                        @click="
                          save('endDate', 'newEndDate', null, 'endDateMenu')
                        "
                      >
                        Save
                      </v-btn>
                      <v-btn
                        text
                        color="primary"
                        @click="cancel('newEndDate', 'endDateMenu')"
                      >
                        Cancel
                      </v-btn>
                    </v-date-picker>
                  </v-menu>
                  <v-menu
                    ref="endTimeMenu"
                    v-model="endTimeMenu"
                    :close-on-content-click="false"
                    :return-value.sync="endDateTime"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        @click="
                          open('endTimeMenu', {
                            set: 'newEndTime',
                            to: 'endTime'
                          })
                        "
                        v-bind="attrs"
                        v-on="on"
                        small
                        ><v-icon small class="mr-2">{{
                          clockIcon(newEndTime || endTime)
                        }}</v-icon
                        >{{ newEndTime || endTime }}</v-btn
                      >
                    </template>
                    <v-time-picker v-model="newEndTime" no-title>
                      <v-btn text color="accent" @click="newEndTime = '00:00'">
                        Start Of Day
                      </v-btn>
                      <v-btn text color="accent" @click="newEndTime = '23:59'">
                        End Of Day
                      </v-btn>
                      <v-spacer></v-spacer>
                      <v-btn
                        text
                        color="primary"
                        @click="
                          save('endTime', 'newEndTime', null, 'endTimeMenu')
                        "
                      >
                        Save
                      </v-btn>
                      <v-btn
                        text
                        color="primary"
                        @click="cancel('newEndTime', 'endTimeMenu')"
                      >
                        Cancel
                      </v-btn>
                    </v-time-picker>
                  </v-menu>
                </v-col>
              </v-row></v-container
            ></v-card
          >
        </v-col>
      </v-row>
      <v-row v-if="loadingAnalytics">
        <v-col cols="12">
          <loader
            message="Loading analytics data..."
            :loading="loadingAnalytics"
            :grid="true"
          />
        </v-col>
      </v-row>
      <v-row
        v-if="
          !lineChartData.length && !donutChartData.length && !loadingAnalytics
        "
      >
        <v-col cols="12">
          <div class="text-body1 text-center">
            There are no recorded interactions for this date range.
          </div>
        </v-col>
      </v-row>
      <v-row v-if="lineChartData.length && !loadingAnalytics">
        <v-col>
          <v-card>
            <v-card-title class="text-h6">
              Interaction Timeline
              <v-spacer></v-spacer>

              <v-btn-toggle v-model="timescaleEnum" @change="sortByTimescale">
                <v-btn x-small v-if="dateRangeCount < 1.5"> Minute </v-btn>
                <v-btn x-small v-if="dateRangeCount < 7"> Hour </v-btn>
                <v-btn x-small v-if="dateRangeCount > 1"> Day </v-btn>
                <v-btn x-small v-if="dateRangeCount > 7"> Week </v-btn>
              </v-btn-toggle>
            </v-card-title>
            <v-card-text>
              <line-chart
                :data="lineChartData"
                :options="interactionChartOptions"
              ></line-chart>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="donutChartData.length && !loadingAnalytics">
        <v-col cols="6">
          <v-card class="pa-4">
            <div class="text-h6">Unique Visitors</div>
            <div class="d-flex justify-center my-6">
              <div class="text-center text-h4 px-4 flex-grow-1">
                {{ totalActiveUsers }}
                <div class="text-center text-body-1">DCL Accounts</div>
              </div>
              <div class="text-center text-h4 px-4 flex-grow-1">
                {{ totalActiveIps }}
                <div class="text-center text-body-1">IP Addresses</div>
              </div>
            </div>
            <div class="d-flex justify-center my-6">
              <div class="text-center text-h4 px-4 flex-grow-1">
                {{ totalActiveUsers - totalActiveGuests }}
                <div class="text-center text-body-1">Web3 Users</div>
              </div>
              <div class="text-center text-h4 px-4 flex-grow-1">
                {{ totalActiveGuests }}
                <div class="text-center text-body-1">Guests</div>
              </div>
            </div>
            <div class="d-flex justify-center my-6">
              <v-dialog v-model="exportDialog" width="500" retain-focus>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-if="isDev || features.dataExports"
                    v-bind="attrs"
                    v-on="on"
                    :loading="exportingQuery"
                    :disabled="loadingAnalytics"
                  >
                    Export As CSV
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title class="text-h5">
                    Export Analytics Data
                  </v-card-title>
                  <v-card-text
                    class="pt-4 text-subtitle-1"
                    v-if="dateRangeCount > 60"
                  >
                    CSV exports are not currently supported for date ranges
                    larger than 60 days.
                  </v-card-text>
                  <v-card-text
                    class="pt-4 text-subtitle-1"
                    v-if="dateRangeCount <= 60"
                  >
                    Select the data you would like to include in the CSV file:
                    <v-select
                      label="Actions To Include"
                      :items="eventTypes"
                      v-model="eventTypeFilter"
                      multiple
                      hide-details
                      @blur="validateActions"
                      class="mb-4"
                    >
                      <template v-slot:selection="{ item, index }">
                        <v-chip v-if="includeAllActions && index === 0">
                          <span>All Actions</span>
                        </v-chip>
                        <v-chip v-if="!includeAllActions && index < 3">
                          <span>{{ item.text }}</span>
                        </v-chip>
                        <span
                          v-if="!includeAllActions && index === 3"
                          class="grey--text text-caption"
                        >
                          (+{{
                            eventTypeFilter.length
                              ? eventTypeFilter.length - 3
                              : 0
                          }}
                          others)
                        </span>
                      </template>
                      <template v-slot:prepend-item>
                        <v-list-item
                          ripple
                          @mousedown.prevent
                          @click="handleSelectAll"
                        >
                          <v-list-item-action>
                            <v-icon
                              :color="
                                eventTypeFilter.length &&
                                eventTypeFilter.length > 0
                                  ? 'red darken-4'
                                  : ''
                              "
                            >
                              {{ selectAllIcon }}
                            </v-icon>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title> Select All </v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                        <v-divider></v-divider>
                      </template>
                    </v-select>
                    <v-container>
                      <v-row>
                        <v-col
                          v-for="(value, key) in exportOptions"
                          :key="key"
                          class="col-6"
                        >
                          <v-checkbox
                            v-model="value.selected"
                            :label="value.text"
                            :hint="value.hint"
                            @change="updateExportOptions(key, value)"
                            class="py-0 my-0"
                          ></v-checkbox>
                        </v-col>
                      </v-row>
                    </v-container>
                    <v-container>
                      <v-row>
                        <v-col>
                          <v-switch
                            v-if="exportOptions.wallets.selected"
                            v-model="removeDuplicateWallets"
                            label="Remove Duplicate Wallet Addresses"
                            class="py-0 my-0"
                          >
                          </v-switch>
                          <v-switch
                            v-if="exportOptions.clientIps.selected"
                            v-model="removeDuplicateIps"
                            label="Remove Duplicate IP Addresses"
                            class="py-0 my-0"
                          >
                          </v-switch>
                        </v-col>
                      </v-row>
                    </v-container>
                    <div class="text-body-1 red">{{ selectDataError }}</div>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      v-if="dateRangeCount <= 60"
                      color="primary"
                      text
                      @click="exportQuery"
                      :loading="exportingQuery"
                    >
                      Export
                    </v-btn>
                    <v-btn
                      v-if="dateRangeCount > 60"
                      color="primary"
                      text
                      @click="exportDialog = false"
                      :loading="exportingQuery"
                    >
                      Cancel
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" v-if="!loadingAnalytics">
          <v-card class="pa-4">
            <div class="text-h6">User Interactions</div>
            <ccv-donut-chart
              :data="donutChartData"
              :options="donutChartOptions"
            ></ccv-donut-chart>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Vue from 'vue'
import '@carbon/styles/css/styles.css'
import '@carbon/charts/styles.css'
import chartsVue from '@carbon/charts-vue'
import { DateTime, Interval } from 'luxon'
import timezones from 'timezones-list'
import Loader from '../components/Loader'
import { downloadCsv } from '../helpers/download.js'
import { mapActions } from 'vuex'
import LineChart from './LineChart.vue'
import _ from 'lodash'

Vue.use(chartsVue)

export default {
  name: 'SceneAnalytics',
  components: { Loader, LineChart },
  data: () => ({
    loadingAnalytics: true,
    loadingConnections: true,
    exportingQuery: false,
    dateRangeMenu: false,
    selectDataError: '',
    startDateMenu: false,
    startTimeMenu: false,
    endDateMenu: false,
    endTimeMenu: false,
    timeZoneMenu: false,
    startDate: DateTime.now().toISODate(),
    startTime: '00:00:00',
    endDate: DateTime.now().toISODate(),
    endTime: '23:59:59',
    dateRange: [
      DateTime.now().toFormat('yyyy-MM-dd'),
      DateTime.now().endOf('day').toFormat('yyyy-MM-dd')
    ],
    dataMetrics: [
      { value: 'uniqueVisitors', text: 'All Unique Visitors' },
      { value: 'uniqueWeb3', text: 'Visitors With Wallet' },
      { value: 'uniqueGuests', text: 'Guest Visitors' },
      { value: 'uniqueIps', text: 'Unique IP Addresses' }
    ],
    selectedMetric: 'uniqueVisitors',
    activeCountryHeaders: [
      {
        text: 'Country',
        align: 'start',
        value: 'country'
      },
      { text: 'Active Connections', value: 'users' }
    ],
    analyticsByDate: {},
    analyticsByEventType: {},
    totalActiveUsers: 0,
    totalActiveIps: 0,
    visitors: [],
    filteredVisitors: [],
    eventTypes: [],
    connectedUsers: 0,
    vpnConnections: 0,
    eventTypeFilter: [],
    exportDialog: false,
    exportOptions: {
      wallets: { selected: false, text: 'Wallet Addresses' },
      names: { selected: false, text: 'Usernames' },
      clientIps: { selected: false, text: 'IP Addresses' },
      authenticity: { selected: false, text: 'IP Authenticity' },
      metadata: { selected: false, text: 'Metadata' },
      location: { selected: false, text: 'Locations' },
      guests: {
        selected: false,
        text: 'Guest Accounts'
      },
      dateTimes: { selected: false, text: 'Dates & Times' },
      isoTimestamps: { selected: false, text: 'ISO Timestamps' },
      unixTimestamps: { selected: false, text: 'Unix Timestamps' }
    },
    removeDuplicateWallets: false,
    removeDuplicateIps: false,
    sevenDayConnectionAverage: 0,
    thirtyDayConnectionAverage: 0,
    uniqueVisitorsGraph: [],
    activeCountryCodes: {},
    activeCountries: [],
    interactionChartOptions: {
      axes: {
        bottom: {
          title: 'Date',
          mapsTo: 'date',
          scaleType: 'time'
        },
        left: {
          mapsTo: 'records',
          title: 'Events Triggered',
          scaleType: 'linear'
        }
      },
      curve: 'curveMonotoneX',
      toolbar: { enabled: false },
      resizable: true,
      title: '',
      data: {
        groupMapsTo: 'group',
        loading: false
      },
      zoomBar: {
        top: { enabled: true, type: 'slider_view' }
      },
      theme: 'g100',
      height: '250px',
      experimental: true
    },
    donutChartOptions: {
      title: '',
      height: '300px',
      toolbar: { enabled: false },
      resizable: false,
      legend: {
        alignment: 'center'
      },
      pie: {
        valueMapsTo: 'records'
      },
      donut: {
        center: {
          label: 'Records'
        },
        alignment: 'center'
      },
      theme: 'g100'
    },
    timezoneList: [
      { text: 'UTC', value: 'UTC' },
      ...timezones.map(tz => ({
        text: `${tz.tzCode} (UTC ${tz.utc})`,
        value: tz.tzCode
      }))
    ],
    records: [],
    lineChartData: [],
    donutChartData: [],
    timezoneAbbrList: ['UTC', ...timezones.map(tz => tz.abbr)],
    tzCode: DateTime.local().zoneName,
    newTzCode: '',
    newStartDate: '',
    newStartTime: '',
    newEndDate: '',
    newEndTime: '',
    timescaleEnum: 1
  }),
  props: {
    baseParcel: {
      type: String
    },
    features: {
      type: Object
    }
  },
  mounted () {
    this.runQuery()
  },
  computed: {
    startDateTime: {
      get () {
        return DateTime.fromFormat(
          this.startDate + this.startTime,
          'yyyy-MM-ddt'
        )
      },
      set () {
        return DateTime.fromFormat(
          this.startDate + this.startTime,
          'yyyy-MM-ddt'
        )
      }
    },
    endDateTime: {
      get () {
        return DateTime.fromFormat(this.endDate + this.endTime, 'yyyy-MM-ddt')
      },
      set () {
        return DateTime.fromFormat(this.endDate + this.endTime, 'yyyy-MM-ddt')
      }
    },
    errorMessage: {
      get () {
        return this.$store.getters['land/errorMessage']
      },
      set (value) {
        this.setErrorMessage(value)
      }
    },
    startDateTimeText () {
      return `${this.startDate} at ${this.startTime}`
    },
    endDateTimeText () {
      return `${this.endDate} at ${this.endTime}`
    },
    selectedTimezone () {
      return timezones.find(tz => tz.tzCode == this.tzCode)
    },
    dateRangeCount () {
      const startDate = DateTime.fromISO(this.startDate),
        endDate = DateTime.fromISO(this.endDate),
        dateRange = Interval.fromDateTimes(startDate, endDate),
        dateRangeDays = dateRange.length('days')

      return dateRangeDays
    },
    defaultDate () {
      const today = new Date().toISOString()
      return this.formatDate(today)
    },
    isDev () {
      return process.env.VUE_APP_NODE_ENV == 'development'
    },
    includeAllActions () {
      return this.eventTypeFilter.length === this.eventTypes.length
    },
    includeSomeActions () {
      return this.eventTypeFilter.length > 0 && !this.includeAllActions
    },
    selectAllIcon () {
      if (this.includeAllActions) return 'mdi-close-box'
      if (this.includeSomeActions) return 'mdi-minus-box'
      return 'mdi-checkbox-blank-outline'
    },
    timescale () {
      switch (this.timescaleEnum) {
        case 0:
          return 'minute'
        case 1:
          return 'hour'
        case 2:
          return 'day'
        case 3:
          return 'week'
        default:
          return 'hour'
      }
    }
  },
  methods: {
    ...mapActions({
      setErrorMessage: 'land/setErrorMessage'
    }),
    validateDateRange () {
      //todo
    },
    handleSelectAll () {
      this.$nextTick(() => {
        if (this.includeAllActions) {
          this.eventTypeFilter = []
        } else {
          this.eventTypeFilter = this.eventTypes.map(
            eventType => eventType.value
          )
        }
      })
    },
    validateActions () {
      if (this.eventTypeFilter.length == 0) {
        this.errorMessage = 'Select at least one type of action to export.'
        this.eventTypeFilter = this.eventTypes.map(eventType => eventType.value)
      }
    },
    open (menuVar, options) {
      const objThis = this

      Vue.set(this, menuVar, true)
      if (options && options.set) {
        Vue.set(this, options.set, objThis[options.to])
      }
    },
    save (varName, newVarName, clearVal, menuVar, runQuery = true) {
      const objThis = this
      Vue.set(this, varName, objThis[newVarName])
      Vue.set(this, newVarName, clearVal || '')
      if (menuVar) {
        Vue.set(this, menuVar, false)
      }
      if (runQuery) {
        this.runQuery()
      }
    },
    cancel (newVar, menuVar) {
      Vue.set(this, newVar, '')
      Vue.set(this, menuVar, false)
    },
    groupByTime (array, timescale, tz) {
      try {
        return _.groupBy(array, event =>
          DateTime.fromMillis(event.timestamp, { zone: tz || 'UTC' })
            .startOf(timescale)
            .toISO({ includeOffset: false })
        )
      } catch (error) {
        console.log(error)
      }
    },
    async runQuery () {
      this.loadingAnalytics = true
      this.interactionChartOptions.data.loading = true
      let startDate = this.startDate,
        endDate = this.endDate,
        startTime = this.startTime,
        endTime = this.endTime,
        tz = this.tzCode

      const baseParcel = this.baseParcel.split(','),
        x = baseParcel[0],
        y = baseParcel[1]

      let apiUrl = `${process.env.VUE_APP_API_URL}/analytics/visitors/${x}/${y}`

      const requestBody = {
        startDate,
        endDate,
        startTime,
        endTime,
        tz
      }

      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }

      try {
        const res = await fetch(apiUrl, fetchOptions)
        if (res.status >= 400) {
          const error = await res.json()
          this.setErrorMessage(error.text)
          return
        }
        const response = await res.json()
        const { records } = response
        this.records = records

        this.loadingAnalytics = false
        let eventTypes = response.eventTypes || [],
          totalActiveUsers = response.totalActiveUsers || 0,
          totalActiveGuests = response.totalActiveGuests || 0,
          totalActiveIps = response.totalActiveIps || 0

        this.totalActiveUsers = totalActiveUsers
        this.totalActiveGuests = totalActiveGuests
        this.totalActiveIps = totalActiveIps

        if (eventTypes) {
          this.eventTypes = eventTypes.map(eventType => ({
            value: eventType,
            text: eventType.capitalize().removeUnderscore().removeDash()
          }))
          this.eventTypeFilter = eventTypes
        }
        if (this.dateRangeCount > 1.5) {
          this.timescaleEnum = 2
        } else {
          this.timescaleEnum = 1
        }
        this.sortByTimescale()
      } catch (error) {
        console.log(error)
      }
    },

    async sortByTimescale () {
      this.loadingAnalytics = true
      await new Promise((res) => {
        const groupedDatesByEvent = {},
          startTime = this.startTime,
          endTime = this.endTime,
          startTimeArr = startTime.split(':'),
          endTimeArr = endTime.split(':'),
          startDateTime = DateTime.fromFormat(this.startDate, 'yyyy-MM-dd', {
            zone: this.tzCode
          }).set({
            hour: startTimeArr[0],
            minute: startTimeArr[1],
            second: startTimeArr[2]
          }),
          endDateTime = DateTime.fromFormat(this.endDate, 'yyyy-MM-dd', {
            zone: this.tzCode
          }).set({
            hour: endTimeArr[0],
            minute: endTimeArr[1],
            second: endTimeArr[2]
          }),
          timescale = this.timescale,
          lineChartData = [],
          donutChartData = []

        Object.keys(this.records).forEach(event => {
          groupedDatesByEvent[event] = this.groupByTime(
            this.records[event],
            this.timescale,
            this.tzCode
          )
        })
        Object.keys(this.records).forEach(eventType => {
          const eventTypeText =
            eventType === 'player_expression'
              ? 'Emote'
              : eventType.removeUnderscore().capitalize()

          donutChartData.push({
            group: eventTypeText,
            records: this.records[eventType].length
          })

          Object.keys(groupedDatesByEvent[eventType]).forEach((date, i) => {
            const keys = Object.keys(groupedDatesByEvent[eventType])
            const durationFromStartDate = Interval.fromDateTimes(
              startDateTime,
              DateTime.fromISO(date)
            ).length(timescale + 's')
            const durationToEndDate = Interval.fromDateTimes(
              DateTime.fromISO(date),
              endDateTime
            ).length(timescale + 's')
            const durationToNow = Interval.fromDateTimes(
              DateTime.fromISO(date),
              DateTime.now()
            ).length(timescale + 's')
            const isFirstEvent = i === 0
            const isLastEvent =
              i === Object.keys(groupedDatesByEvent[eventType]).length - 1
            const prependedDateTimes = []
            const insertedDateTimes = []
            const appendedDateTimes = []
            const iDate = DateTime.fromISO(date)
            const lastDate = i > 0 && DateTime.fromISO(keys[i - 1])
            const durationFromLastDate =
              lastDate &&
              Interval.fromDateTimes(lastDate, DateTime.fromISO(date)).length(
                timescale + 's'
              )

            if (isFirstEvent && +durationFromStartDate >= 1) {
              prependedDateTimes.length = durationFromStartDate
              prependedDateTimes.fill(true)
            }

            if (isLastEvent && +durationToEndDate >= 1) {
              appendedDateTimes.length =
                durationToEndDate > durationToNow
                  ? Math.ceil(durationToNow) - 1
                  : Math.ceil(durationToEndDate) - 1
              appendedDateTimes.fill(true)
            }

            if (!isFirstEvent && +durationFromLastDate > 1) {
              insertedDateTimes.length = durationFromLastDate - 1
              insertedDateTimes.fill(true)
            }

            if (prependedDateTimes.length) {
              prependedDateTimes.forEach((dateTime, i) => {
                const missingDateTime = startDateTime
                  .plus({ [timescale + 's']: i })
                  .toISO()
                lineChartData.unshift({
                  group: eventTypeText,
                  date: missingDateTime,
                  records: 0
                })
              })
            }

            if (insertedDateTimes.length) {
              insertedDateTimes.forEach((dateTime, i) => {
                const missingDateTime = lastDate
                  .plus({ [timescale + 's']: i + 1 })
                  .toISO()
                lineChartData.push({
                  group: eventTypeText,
                  date: missingDateTime,
                  records: 0
                })
              })
            }

            lineChartData.push({
              group: eventTypeText,
              date,
              records: groupedDatesByEvent[eventType][date].length
            })

            if (appendedDateTimes.length) {
              appendedDateTimes.forEach((dateTime, i) => {
                const missingDateTime = iDate
                  .plus({ [timescale + 's']: i + 1 })
                  .toISO()
                lineChartData.push({
                  group: eventTypeText,
                  date: missingDateTime,
                  records: 0
                })
              })
            }

          })
        })
        this.lineChartData = lineChartData
        this.donutChartData = donutChartData
        res()
      })
      this.loadingAnalytics = false
      this.interactionChartOptions.data.loading = false
    },
    async exportQuery () {
      const selectedExportOptions = Object.entries(this.exportOptions).map(
        ([key, value]) => {
          if (key) return value.selected
        }
      )
      const hasExportOptions = selectedExportOptions.some(selected => selected)
      if (!hasExportOptions) {
        this.errorMessage = "Please select the data you'd like to export."
        return
      }
      this.exportDialog = false
      this.exportingQuery = true
      let startDate = this.startDate || '',
        endDate = this.endDate || this.startDate || '',
        removeDuplicateWallets = this.removeDuplicateWallets,
        removeDuplicateIps = this.removeDuplicateIps

      const requestBody = {
        startDate,
        endDate,
        eventTypes: this.eventTypeFilter,
        tz: this.tzCode,
        removeDuplicateWallets,
        removeDuplicateIps
      }

      const baseParcel = this.baseParcel.split(','),
        x = baseParcel[0],
        y = baseParcel[1]

      let hasEventFilter =
        this.eventTypeFilter.length &&
        this.eventTypeFilter.length !== this.eventTypes.length
      let fileName = `_${startDate ? startDate : ''}${
        startDate && endDate ? '-' + endDate : ''
      }${hasEventFilter ? '-' + this.eventTypeFilter.join('_') : ''}`

      Object.entries(this.exportOptions).forEach(([key, value]) => {
        requestBody[key] = value.selected
      })

      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }

      try {
        const response = await fetch(
          `${process.env.VUE_APP_API_URL}/analytics/export/${x}/${y}`,
          fetchOptions
        )
        if (response.status >= 400) {
          const error = await response.json()
          this.setErrorMessage(error.text)
        }
        const responseText = await response.text()
        downloadCsv(`vlm_analytics${fileName}.csv`, responseText)

        this.exportingQuery = false
      } catch (error) {
        this.exportingQuery = false
        console.log(error)
      }
    },
    openTimePicker (type) {
      this.startDateMenu = false
      this.endDateMenu = false
      switch (type) {
        case 'start':
          this.startTimeMenu = true
          break
        case 'end':
          this.endTimeMenu = true
          break
      }
    },
    clockIcon (time) {
      const hour = time.split(':')[0]
      switch (hour) {
        case '00':
        case '12':
          return 'mdi-clock-time-twelve'
        case '01':
        case '13':
          return 'mdi-clock-time-one'
        case '02':
        case '14':
          return 'mdi-clock-time-two'
        case '03':
        case '15':
          return 'mdi-clock-time-three'
        case '04':
        case '16':
          return 'mdi-clock-time-four'
        case '05':
        case '17':
          return 'mdi-clock-time-five'
        case '06':
        case '18':
          return 'mdi-clock-time-six'
        case '07':
        case '19':
          return 'mdi-clock-time-seven'
        case '08':
        case '20':
          return 'mdi-clock-time-eight'
        case '09':
        case '21':
          return 'mdi-clock-time-nine'
        case '10':
        case '22':
          return 'mdi-clock-time-ten'
        case '11':
        case '23':
          return 'mdi-clock-time-eleven'
        default:
          return 'mdi-clock'
      }
    },
    formatDate (date) {
      const [dateStr] = new Date(date).toISOString().split('T')
      return dateStr
    },
    updateExportOptions () {
      this.selectDataError = ''
    },
    updateProperties () {
      this.$emit('updateProperties')
    }
  }
}
</script>
