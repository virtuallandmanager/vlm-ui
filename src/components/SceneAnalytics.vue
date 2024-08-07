<template>
  <content-sub-panel :loading="loadingAnalytics" :hasContent="true" loadingMessage="Loading analytics data...">
    <template v-slot:header>
      <v-tabs v-model="tab" centered dark grow icons-and-text>
        <v-tabs-slider></v-tabs-slider>
        <v-tab href="#tab-1">
          Live Status
          <v-icon>mdi-sync</v-icon>
        </v-tab>
        <!-- <v-tab href="#tab-2" @click="getRecentSceneMetrics">
          Recent Metrics
          <v-icon>mdi-history</v-icon>
        </v-tab>
        <v-tab href="#tab-3" @click="loadHistoricalData">
          Historical Graphs
          <v-icon>mdi-chart-line</v-icon>
        </v-tab> -->
      </v-tabs>
    </template>
    <v-tabs-items v-model="tab">
      <v-tab-item value="tab-1">
        <v-container>
          <v-card>
            <v-card-title>Active Connections</v-card-title>
            <v-card-text>
              <div class="h4">Scene Admins</div>
              <v-data-table :headers="userHeaders" :items="activeSceneHosts" :items-per-page="10" class="elevation-1">
                <template v-slot:item.country="{ item }">
                  <v-flag :country="item.country" />
                </template>
              </v-data-table>
            </v-card-text>
            <v-card-text>
              <div class="h4">Scene Visitors</div>
              <v-data-table :headers="userHeaders" :items="activeSceneVisitors" :items-per-page="10" class="elevation-1">
                <template v-slot:item.country="{ item }">
                  <v-flag :country="item.country" />
                </template>
              </v-data-table>
            </v-card-text>
            <v-card-actions class="justify-space-between">
              <v-spacer />
              <v-btn color="primary" @click="downloadSnapshotCSV">Guestlist Snapshot</v-btn>
            </v-card-actions>
          </v-card>
          <v-card>
            <v-card-title
              >Live Actions <v-spacer />
              <v-layout align-center>
                <v-flex xs12 sm6 offset-sm3>
                  <v-select v-model="duration" :items="durations" label="Hide After" single-line bottom></v-select>
                </v-flex>
              </v-layout>
            </v-card-title>
            <v-card-text>
              <v-card tile color="black" class="pa-2" min-height="420" max-height="420" style="overflow-y: auto">
                <v-container>
                  <v-layout>
                    <v-flex xs12>
                      <transition-group v-for="(message, index) in sessionActions" :key="index || message.action" name="fade" tag="div">
                        <div class="message-item" :key="index">
                          <v-card color="grey darken-2" dark class="my-2 pa-2">
                            <div class="d-flex justify-space-between">
                              <div>
                                <strong>{{ message.displayName }}</strong> {{ message.action }}
                              </div>
                              <div>{{ getLocalDateTime(message.timestamp) }}</div>
                            </div>
                            <div v-if="message.metadata">
                              {{ renderMetadata(message.metadata) }}
                            </div>
                          </v-card>
                        </div>
                      </transition-group>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-card-text>
          </v-card>
        </v-container>
      </v-tab-item>

      <v-tab-item value="tab-2">
        <v-container>
          <v-card>
            <v-card-title>Currently In Scene</v-card-title>
            <v-card-text>
              <v-card tile color="black" class="pa-2" min-height="420"> </v-card>
            </v-card-text>
          </v-card>
          <v-card>
            <v-card-title>Live Actions</v-card-title>
            <v-card-text>
              <v-card tile color="black" class="pa-2" min-height="420">Stuff</v-card>
            </v-card-text>
          </v-card>
        </v-container>
      </v-tab-item>
      <v-tab-item value="tab-3">
        <date-range-bar />
        <v-container>
          <v-card>
            <v-card-title>Interactions Chart</v-card-title>
            <v-card-text>
              <v-card tile class="pa-2" min-height="420">
                <div id="wrapper">
                  <div id="chart-line2">
                    <apexchart type="line" height="230" :options="chartOptions" :series="series"></apexchart>
                  </div>
                  <div id="chart-line">
                    <apexchart type="area" height="130" :options="chartOptionsLine" :series="seriesLine"></apexchart>
                  </div>
                </div>
              </v-card>
            </v-card-text>
          </v-card>
          <v-card>
            <v-card-title>Interactions Breakdown</v-card-title>
            <v-card-text>
              <v-card tile color="black" class="pa-2" min-height="420">Graph</v-card>
            </v-card-text>
          </v-card>
          <v-card-actions class="justify-space-between">
            <v-btn color="primary">Send Message</v-btn>
          </v-card-actions>
        </v-container>
      </v-tab-item>
    </v-tabs-items>
  </content-sub-panel>
</template>

<script>
import Vue from 'vue'
import { DateTime, Interval } from 'luxon'
import timezones from 'timezones-list'
import ContentSubPanel from './ContentSubPanel'
import DateRangeBar from './DateRangeBar'
import { mapActions, mapGetters } from 'vuex'
import VueApexCharts from 'vue-apexcharts'
import _ from 'lodash'

export default {
  name: 'SceneAnalytics',
  components: { ContentSubPanel, DateRangeBar, apexchart: VueApexCharts },
  data: () => ({
    tab: 'tab-1',
    loadingAnalytics: false,
    loadingConnections: false,
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
    dateRange: [DateTime.now().toFormat('yyyy-MM-dd'), DateTime.now().endOf('day').toFormat('yyyy-MM-dd')],
    dataMetrics: [
      { value: 'uniqueVisitors', text: 'All Unique Visitors' },
      { value: 'uniqueWeb3', text: 'Visitors With Wallet' },
      { value: 'uniqueGuests', text: 'Guest Visitors' },
      { value: 'uniqueIps', text: 'Unique IP Addresses' },
    ],
    durations: [
      { value: 5, text: '5 seconds' },
      { value: 10, text: '10 seconds' },
      { value: 15, text: '15 seconds' },
      { value: 30, text: '30 seconds' },
    ],
    selectedMetric: 'uniqueVisitors',
    activeCountryHeaders: [
      {
        text: 'Country',
        align: 'start',
        value: 'country',
      },
      { text: 'Active Connections', value: 'users' },
    ],
    userHeaders: [
      {
        text: 'Display Name',
        align: 'start',
        value: 'displayName',
      },
      { text: 'Wallet Address', value: 'connectedWallet' },
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
        text: 'Guest Accounts',
      },
      dateTimes: { selected: false, text: 'Dates & Times' },
      isoTimestamps: { selected: false, text: 'ISO Timestamps' },
      unixTimestamps: { selected: false, text: 'Unix Timestamps' },
    },
    removeDuplicateWallets: false,
    removeDuplicateIps: false,
    series: [
      {
        data: [],
      },
    ],
    chartOptions: {
      chart: {
        id: 'chart2',
        type: 'line',
        height: 230,
        toolbar: {
          autoSelected: 'pan',
          show: false,
        },
      },
      colors: ['#546E7A'],
      stroke: {
        width: 3,
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        opacity: 1,
      },
      markers: {
        size: 0,
      },
      xaxis: {
        type: 'datetime',
      },
    },

    seriesLine: [
      {
        data: [],
      },
    ],
    chartOptionsLine: {
      chart: {
        id: 'chart1',
        height: 130,
        type: 'area',
        brush: {
          target: 'chart2',
          enabled: true,
        },
        selection: {
          enabled: true,
          xaxis: {
            min: new Date('19 Jun 2017').getTime(),
            max: new Date('14 Aug 2017').getTime(),
          },
        },
      },
      colors: ['#008FFB'],
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.91,
          opacityTo: 0.1,
        },
      },
      xaxis: {
        type: 'datetime',
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        tickAmount: 2,
      },
    },
    timezoneList: [
      { text: 'UTC', value: 'UTC' },
      ...timezones.map((tz) => ({
        text: `${tz.tzCode} (UTC ${tz.utc})`,
        value: tz.tzCode,
      })),
    ],
    timezoneAbbrList: ['UTC', ...timezones.map((tz) => tz.abbr)],
    tzCode: DateTime.local().zoneName,
    newTzCode: '',
    newStartDate: '',
    newStartTime: '',
    newEndDate: '',
    newEndTime: '',
    timescaleEnum: 1,
  }),
  computed: {
    ...mapGetters({
      activeScene: 'scene/activeScene',
      activeSceneHosts: 'scene/activeSceneHosts',
      activeSceneVisitors: 'scene/activeSceneVisitors',
      sessionActions: 'scene/sessionActions',
      sessionActionDuration: 'scene/sessionActionDuration',
    }),
    duration: {
      get() {
        return this.sessionActionDuration
      },
      set(value) {
        this.setSessionActionDuration(value)
      },
    },
    startDateTime: {
      get() {
        return DateTime.fromFormat(this.startDate + this.startTime, 'yyyy-MM-ddt')
      },
      set() {
        return DateTime.fromFormat(this.startDate + this.startTime, 'yyyy-MM-ddt')
      },
    },
    endDateTime: {
      get() {
        return DateTime.fromFormat(this.endDate + this.endTime, 'yyyy-MM-ddt')
      },
      set() {
        return DateTime.fromFormat(this.endDate + this.endTime, 'yyyy-MM-ddt')
      },
    },
    errorMessage: {
      get() {
        return this.$store.getters['land/errorMessage']
      },
      set(value) {
        this.setErrorMessage(value)
      },
    },
    startDateTimeText() {
      return `${this.startDate} at ${this.startTime}`
    },
    endDateTimeText() {
      return `${this.endDate} at ${this.endTime}`
    },
    selectedTimezone() {
      return timezones.find((tz) => tz.tzCode == this.tzCode)
    },
    dateRangeCount() {
      const startDate = DateTime.fromISO(this.startDate),
        endDate = DateTime.fromISO(this.endDate),
        dateRange = Interval.fromDateTimes(startDate, endDate),
        dateRangeDays = dateRange.length('days')

      return dateRangeDays
    },
    defaultDate() {
      const today = new Date().toISOString()
      return this.formatDate(today)
    },
    isDev() {
      return process.env.VUE_APP_NODE_ENV == 'development'
    },
    includeAllActions() {
      return this.eventTypeFilter.length === this.eventTypes.length
    },
    includeSomeActions() {
      return this.eventTypeFilter.length > 0 && !this.includeAllActions
    },
    selectAllIcon() {
      if (this.includeAllActions) return 'mdi-close-box'
      if (this.includeSomeActions) return 'mdi-minus-box'
      return 'mdi-checkbox-blank-outline'
    },
    timescale() {
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
    },
  },
  methods: {
    ...mapActions({
      setErrorMessage: 'land/setErrorMessage',
      setSessionActionDuration: 'scene/setSessionActionDuration',
      recentMetricsPromise: 'analytics/getRecentSceneMetrics',
      getHistoricalData: 'analytics/getHistoricalData',
    }),
    async getRecentSceneMetrics() {
      await this.recentMetricsPromise(this.activeScene.sk)
    },
    async loadHistoricalData() {
      await this.getHistoricalData(this.activeScene.sk, this.dateRange)
    },
    downloadSnapshotCSV() {
      const rows = [
        ['Display Name', 'Wallet Address'], // This is your header row
        ...this.activeSceneVisitors.map((item) => [encodeURIComponent(item.displayName), encodeURIComponent(item.connectedWallet)]),
      ]

      let csvContent = 'data:text/csv;charset=utf-8,'
      rows.forEach(function (rowArray) {
        let row = rowArray.join(',')
        csvContent += row + '\r\n'
      })

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `${this.activeScene.name} Visitors @ ${DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss')}.csv`)
      document.body.appendChild(link) // Required for FF

      link.click()
    },
    validateDateRange() {
      //todo
    },
    handleSelectAll() {
      this.$nextTick(() => {
        if (this.includeAllActions) {
          this.eventTypeFilter = []
        } else {
          this.eventTypeFilter = this.eventTypes.map((eventType) => eventType.value)
        }
      })
    },
    validateActions() {
      if (this.eventTypeFilter.length == 0) {
        this.errorMessage = 'Select at least one type of action to export.'
        this.eventTypeFilter = this.eventTypes.map((eventType) => eventType.value)
      }
    },
    open(menuVar, options) {
      const objThis = this

      Vue.set(this, menuVar, true)
      if (options && options.set) {
        Vue.set(this, options.set, objThis[options.to])
      }
    },
    save(varName, newVarName, clearVal, menuVar, runQuery = true) {
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
    cancel(newVar, menuVar) {
      Vue.set(this, newVar, '')
      Vue.set(this, menuVar, false)
    },
    groupByTime(array, timescale, tz) {
      try {
        return _.groupBy(array, (event) =>
          DateTime.fromMillis(event.timestamp, { zone: tz || 'UTC' })
            .startOf(timescale)
            .toISO({ includeOffset: false })
        )
      } catch (error) {
        console.log(error)
      }
    },

    openTimePicker(type) {
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
    clockIcon(time) {
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
    getLocalDateTime(ts) {
      return DateTime.fromMillis(ts).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
    },
    renderMetadata(metadata) {
      return Object.entries(metadata)
        .map(([key, value]) => {
          return `${key.capitalize()}: ${JSON.stringify(value)}`
        })
        .join(', ')
    },
    formatDate(date) {
      const [dateStr] = new Date(date).toISOString().split('T')
      return dateStr
    },
    updateExportOptions() {
      this.selectDataError = ''
    },
    updateProperties() {
      this.$emit('updateProperties')
    },
  },
}
</script>
