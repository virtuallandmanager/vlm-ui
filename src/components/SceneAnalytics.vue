<template>
  <content-sub-panel :loading="loadingAnalytics" :hasContent="true" loadingMessage="Loading analytics data...">
    <template v-slot:header>
      <v-tabs v-model="tab" centered dark grow icons-and-text>
        <v-tabs-slider></v-tabs-slider>
        <v-tab href="#tab-1">
          {{ localeText('Live Status') }}
          <v-icon>mdi-sync</v-icon>
        </v-tab>
        <v-tab href="#tab-2" @click="getRecentSceneMetrics">
          {{ localeText('Recent Metrics') }}
          <v-icon>mdi-history</v-icon>
        </v-tab>
        <v-tab href="#tab-3">
          {{ localeText('Historical Graphs') }}
          <v-icon>mdi-chart-line</v-icon>
        </v-tab>
      </v-tabs>
    </template>
    <v-tabs-items v-model="tab">
      <v-tab-item value="tab-1">
        <v-container>
          <v-card>
            <v-card-title>{{ localeText('Active Connections') }}</v-card-title>
            <v-card-text>
              <div class="h4">{{ localeText('Scene Admins') }}</div>
              <v-data-table :headers="userHeaders" :items="activeSceneHosts" :items-per-page="10" class="elevation-1">
                <template v-slot:item.country="{ item }">
                  <v-flag :country="item.country" />
                </template>
              </v-data-table>
            </v-card-text>
            <v-card-text>
              <div class="h4">{{ localeText('Scene Visitors') }}</div>
              <v-data-table :headers="userHeaders" :items="activeSceneVisitors" :items-per-page="10" class="elevation-1">
                <template v-slot:item.country="{ item }">
                  <v-flag :country="item.country" />
                </template>
              </v-data-table>
            </v-card-text>
            <v-card-actions class="justify-space-between">
              <v-spacer />
              <v-btn color="primary" @click="downloadSnapshotCSV">{{ localeText('Guestlist Snapshot') }}</v-btn>
            </v-card-actions>
          </v-card>
          <v-card>
            <v-card-title
              >{{ localeText('Live Actions') }} <v-spacer />
              <v-layout align-center>
                <v-flex xs12 sm6 offset-sm3>
                  <v-select v-model="duration" :items="durations" :label="localeText('Hide After')" single-line bottom></v-select>
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
        <div v-if="loadingRecentMetrics">
          <loader :message="localeText('Loading Recent Metrics...')" :loading="loadingRecentMetrics" :grid="true" />
        </div>
        <div v-else>
          <v-card class="pa-6 d-flex justify-center align-center flex-column">
            <v-card-title class="text-h4" v-if="recentMetrics?.last24h">{{ localeText('Last 24 Hours') }}</v-card-title>
            <v-container>
              <v-row>
                <v-col>
                  <v-card class="black d-flex justify-center align-center flex-column" v-if="recentMetrics?.last24h">
                    <v-card-title class="text-h2">{{ recentMetrics.last24h.totalSessions }}</v-card-title>
                    <v-card-text class="text-h6 text-center"> {{ localeText('Total Sessions') }} </v-card-text>
                    <v-card-text class="text-caption text-center pt-0"></v-card-text>
                  </v-card>
                </v-col>
                <v-col>
                  <v-card class="black d-flex justify-center align-center flex-column" v-if="recentMetrics?.last24h">
                    <v-card-title class="text-h2"> {{ recentMetrics.last24h.totalUniqueUsers }}</v-card-title>
                    <v-card-text class="text-h6 text-center pb-0"> {{ localeText('Unique Visitors') }} </v-card-text>
                    <v-card-text class="text-caption text-center pt-0"> {{ localeText('Based on IP') }} </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-card class="black d-flex justify-center align-center flex-column" v-if="recentMetrics?.last24h">
                    <v-card-title class="text-h4">{{ averageSessionLength24h }}</v-card-title>
                    <v-card-text class="text-h6 text-center"> {{ localeText('Average Session Duration') }} </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
          <v-card class="pa-6 d-flex justify-center align-center flex-column">
            <v-card-title class="text-h4" v-if="recentMetrics?.lastWeek">{{ localeText('Last 7 Days') }}</v-card-title>
            <v-container>
              <v-row>
                <v-col>
                  <v-card class="black d-flex justify-center align-center flex-column" v-if="recentMetrics?.lastWeek">
                    <v-card-title class="text-h2">{{ recentMetrics.lastWeek.totalSessions }}</v-card-title>
                    <v-card-text class="text-h6 text-center"> {{ localeText('Total Sessions') }} </v-card-text>
                    <v-card-text class="text-caption text-center pt-0"></v-card-text>
                  </v-card>
                </v-col>
                <v-col>
                  <v-card class="black d-flex justify-center align-center flex-column" v-if="recentMetrics?.lastWeek">
                    <v-card-title class="text-h2"> {{ recentMetrics.lastWeek.totalUniqueUsers }}</v-card-title>
                    <v-card-text class="text-h6 text-center pb-0"> {{ localeText('Unique Visitors') }} </v-card-text>
                    <v-card-text class="text-caption text-center pt-0"> {{ localeText('Based on IP') }} </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-card class="black d-flex justify-center align-center flex-column" v-if="recentMetrics?.lastWeek">
                    <v-card-title class="text-h4">{{ averageSessionLength7Days }}</v-card-title>
                    <v-card-text class="text-h6 text-center"> {{ localeText('Average Session Duration') }} </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </div>
      </v-tab-item>
      <v-tab-item value="tab-3">
        <date-range-bar @onChange="onDateRangeChange" />
        <div v-if="loadingHistoricalData">
          <loader :message="localeText('Loading Historical Data...')" :loading="loadingHistoricalData" :grid="true" />
        </div>
        <v-container v-else>
          <v-card>
            <v-card-title>{{ localeText('Interactions Chart') }}</v-card-title>
            <v-card-text v-if="series.length">
              <v-card tile class="pa-2" min-height="450">
                <div id="wrapper">
                  <div id="chart-line2">
                    <apexchart type="line" height="auto" :options="chartOptions" :series="series"></apexchart>
                  </div>
                </div>
              </v-card>
            </v-card-text>
            <v-card-text v-else>
              <div class="text-center">{{ localeText('NoData') }}</div>
            </v-card-text>
          </v-card>
          <v-card>
            <v-card-title>{{ localeText('Total Interactions') }}</v-card-title>
            <v-card-subtitle>{{ localeText('Total Interactions In Selected Time Period') }}</v-card-subtitle>
            <v-card-text v-if="donutSeries.length">
              <v-card tile class="pa-2" min-height="450">
                <div id="wrapper">
                  <div id="chart-line2">
                    <apexchart type="donut" height="auto" :options="donutChartOptions" :series="donutSeries"></apexchart>
                  </div>
                </div>
              </v-card>
            </v-card-text>
            <v-card-text v-else>
              <div class="text-center">{{ localeText('NoData') }}</div>
            </v-card-text>
          </v-card>
        </v-container>
      </v-tab-item>
    </v-tabs-items>
  </content-sub-panel>
</template>

<script>
import Vue from 'vue'
import { DateTime, Interval, Duration } from 'luxon'
import timezones from 'timezones-list'
import ContentSubPanel from './ContentSubPanel'
import DateRangeBar from './DateRangeBar'
import Loader from './Loader'
import { mapActions, mapGetters } from 'vuex'
import VueApexCharts from 'vue-apexcharts'
import _ from 'lodash'

export default {
  name: 'SceneAnalytics',
  components: {
    ContentSubPanel,
    DateRangeBar,
    Loader,
    apexchart: VueApexCharts,
  },
  data: () => ({
    tab: 'tab-1',
    loadingAnalytics: false,
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
    dataMetrics: [
      { value: 'uniqueVisitors', text: 'All Unique Visitors' },
      { value: 'uniqueWeb3', text: 'Visitors With Wallet' },
      { value: 'uniqueGuests', text: 'Guest Visitors' },
      { value: 'uniqueIps', text: 'Unique IP Addresses' },
    ],
    durations: [],
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
  mounted() {
    this.durations = [
      { value: 5, text: `5 ${this.localeUnit('seconds')}` },
      { value: 10, text: `10 ${this.localeUnit('seconds')}` },
      { value: 15, text: `15 ${this.localeUnit('seconds')}` },
      { value: 30, text: `30 ${this.localeUnit('seconds')}` },
    ]
  },
  computed: {
    ...mapGetters({
      activeScene: 'scene/activeScene',
      activeSceneHosts: 'scene/activeSceneHosts',
      activeSceneVisitors: 'scene/activeSceneVisitors',
      sessionActions: 'scene/sessionActions',
      sessionActionDuration: 'scene/sessionActionDuration',
      recentSceneMetrics: 'analytics/recentSceneMetrics',
      historicalData: 'analytics/historicalData',
      totalInteractions: 'analytics/totalInteractions',
      loadingRecentMetrics: 'analytics/loadingRecentMetrics',
      loadingHistoricalData: 'analytics/loadingHistoricalData',
      localeText: 'i18n/analytics',
      localeUnit: 'i18n/units',
      selectedLocale: 'i18n/localeCode',
    }),
    historicalDataSeries() {
      const historicalDataSeries = this.historicalData(this.activeScene.sk)
      return historicalDataSeries
    },
    chartOptions() {
      const categories = this.extractDateTimes(this.historicalDataSeries)
      console.log('categories', categories)
      return {
        theme: {
          mode: 'dark', // Switches the theme to dark
        },
        chart: {
          id: `interactions-graph-${DateTime.now().toISO()}`,
        },
        xaxis: {
          categories,
        },
        yaxis: {
          title: {
            text: 'Interactions',
          },
        },
      }
    },
    donutChartOptions() {
      const totalInteractions = this.totalInteractions(this.activeScene.sk)

      return {
        theme: {
          mode: 'dark', // Switches the theme to dark
        },
        chart: {
          id: 'interaction-totals',
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return Math.round(val) + '%'
          },
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
              },
            },
          },
        },
        labels: Object.keys(totalInteractions),
      }
    },
    series() {
      const historicalDataSeries = this.historicalData(this.activeScene.sk)
      return Object.entries(historicalDataSeries).map(([name, data]) => ({
        name,
        data: Object.values(data).map((count) => {
          return count
        }),
      }))
    },
    donutSeries() {
      const totalInteractions = this.totalInteractions(this.activeScene.sk)
      return Object.values(totalInteractions)
    },
    recentMetrics() {
      return this.recentSceneMetrics(this.activeScene.sk) || {}
    },
    averageSessionLength24h() {
      if (!this.recentMetrics?.last24h?.averageSessionLength) return '0 seconds'
      console.log('averageSessionLength', this.recentMetrics.last24h.averageSessionLength)
      return this.durationToWords(this.recentMetrics.last24h.averageSessionLength)
    },
    averageSessionLength7Days() {
      if (!this.recentMetrics?.lastWeek?.averageSessionLength) return '0 seconds'
      console.log('averageSessionLength', this.recentMetrics.lastWeek.averageSessionLength)
      return this.durationToWords(this.recentMetrics.lastWeek.averageSessionLength)
    },
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
      set(val) {
        this.startDate = DateTime.fromISO(val).toISODate()
        this.startTime = DateTime.fromISO(val).toISOTime()
        return DateTime.fromISO(val)
      },
    },
    endDateTime: {
      get() {
        return DateTime.fromFormat(this.endDate + this.endTime, 'yyyy-MM-ddt')
      },
      set(val) {
        this.endDate = DateTime.fromISO(val).toISODate()
        this.endTime = DateTime.fromISO(val).toISOTime()
        return DateTime.fromISO(val)
      },
    },
    startDateTimeText() {
      return this.startDateTime.toLocaleString(DateTime.DATETIME_SHORT)
    },
    endDateTimeText() {
      return this.endDateTime.toLocaleString(DateTime.DATETIME_SHORT)
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
      const today = new Date().minus({ days: 1 }).toISOString()
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
      setSessionActionDuration: 'scene/setSessionActionDuration',
      recentMetricsPromise: 'analytics/getRecentSceneMetrics',
      getHistoricalData: 'analytics/getHistoricalData',
    }),
    async getRecentSceneMetrics() {
      await this.recentMetricsPromise(this.activeScene.sk)
    },
    async loadHistoricalData() {
      await this.getHistoricalData({ sceneId: this.activeScene.sk, scale: this.timescale })
    },
    extractDateTimes(data) {
      const dateTimes = new Set()

      // Iterate through the top-level keys
      for (const key in data) {
        console.log('key', key)
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          // Iterate through the keys in the nested dictionary
          for (const datetimeKey in data[key]) {
            if (Object.prototype.hasOwnProperty.call(data[key], datetimeKey)) {
              dateTimes.add(datetimeKey)
            }
          }
        }
      }

      // Convert to an array and sort it
      let sortedDateTimes = Array.from(dateTimes).sort()

      // Create a new set to hold all DateTimes including missing hours
      const filledDateTimes = new Set()

      // Iterate through sorted DateTimes and fill missing hours
      sortedDateTimes.forEach((datetime) => {
        const datePart = datetime.split('T')[0] // Get the date part (e.g., "2024-08-05")
        for (let hour = 0; hour < 24; hour++) {
          const hourString = hour.toString().padStart(2, '0')
          const fullDateTime = `${datePart}T${hourString}:00:00.000`
          filledDateTimes.add(fullDateTime)
        }
      })

      return Array.from(filledDateTimes).map((dt) => DateTime.fromISO(dt).toLocaleString(DateTime.DATETIME_SHORT))
    },
    durationToWords(milliseconds) {
      const locale = this.selectedLocale
      console.log('durationToWords', milliseconds, locale)
      let duration = Duration.fromMillis(milliseconds).shiftTo('days', 'hours', 'minutes', 'seconds')

      // Round seconds to the nearest integer
      duration = duration.set({ seconds: Math.round(duration.seconds) })
      duration = duration.reconfigure({ locale })

      // Get the duration as an object
      const durationObj = duration.toObject()

      // Define the units you want to consider
      const units = ['days', 'hours', 'minutes', 'seconds']

      // Filter out units that are zero
      const nonZeroUnits = units.filter((unit) => durationObj[unit])

      // Shift the duration to only include non-zero units
      duration = duration.shiftTo(...nonZeroUnits)

      // Output in human-readable form
      console.log(duration.toHuman({ unitDisplay: 'short', locale }))
      return duration.toHuman({ unitDisplay: 'short', locale })
    },
    onDateRangeChange({ start, end, timescale, tz }) {
      console.log('onDateRangeChange', start, end, timescale, tz)
      this.startDateTime = start
      this.endDateTime = end
      this.timescaleEnum = timescale
      this.tzCode = tz
      this.loadHistoricalData()
    },
    downloadSnapshotCSV() {
      const rows = [
        [this.localeText('Display Name'), this.localeText('Wallet Address')], // This is your header row
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
