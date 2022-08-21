<template>
  <v-container class="py-6 mx-auto">
    <v-row>
      <v-col no-gutters>
        <h1 class="text-h5 mb-6">Analytics</h1>
      </v-col>
    </v-row>
    <div v-if="features.connectionData">
      <v-row class="grey darken-3 mx-n3">
        <v-col no-gutters>
          <h1 class="text-h6 white--text">Connections</h1>
        </v-col>
        <v-col
          cols="12"
          xs="12"
          sm="4"
          md="4"
          align="right"
          order="1"
          order-sm="12"
        >
        </v-col>
      </v-row>
      <v-row v-if="loadingConnections">
        <v-col cols="12">
          <loader
            message="Loading connection data..."
            :loading="loadingConnections"
            :grid="true"
          />
        </v-col>
      </v-row>
      <v-row cols="12">
        <v-col cols="6">
          <v-card>
            <v-card-title>Users In Scene</v-card-title>
            <v-card-text class="d-flex justify-space-between">
              <div class="text-h6">
                Active Connections:
              </div>
              <div class="text-body-1">
                {{ connectedUsers }}
              </div>
            </v-card-text>
            <v-card-text class="d-flex justify-space-between">
              <div class="text-h6">
                Authentic Connections:
              </div>
              <div class="text-body-1">
                {{ connectedUsers - vpnConnections }}
              </div>
            </v-card-text>
            <v-card-text class="d-flex justify-space-between">
              <div class="text-h6">
                VPN Connections:
              </div>
              <div class="text-body-1">
                {{ vpnConnections }}
              </div>
            </v-card-text>
          </v-card>
          <v-card class="mt-4" v-if="connectedUsers">
            <v-card-text class="text-center">
              <MapChart
                :countryData="activeCountryCodes"
                highColor="#000000"
                lowColor="#ffffff"
                countryStrokeColor="#909090"
                defaultCountryFillColor="#ffffff"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card>
            <v-card-title>Average Connection Time (7 Days)</v-card-title>
            <v-card-text class="text-h5">{{
              sevenDayConnectionAverage
            }}</v-card-text>
            <v-card-title>Average Connection Time (30 Days)</v-card-title>
            <v-card-text class="text-h5">{{
              thirtyDayConnectionAverage
            }}</v-card-text>
          </v-card>
          <v-card class="mt-4" v-if="connectedUsers">
            <v-card-title>Active Countries</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="activeCountryHeaders"
                :items="activeCountries"
              ></v-data-table>
              <div class="text-body1 text-center mt-2">
                Does not include users on VPN or proxy connections
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6"> </v-col>

        <v-col cols="6"> </v-col>
      </v-row>
    </div>
    <div v-if="features.interactions">
      <v-row class="grey darken-3 mx-n3">
        <v-col no-gutters>
          <h1 class="text-h6 white--text">Interactions</h1>
        </v-col>
        <v-col
          cols="12"
          xs="12"
          sm="4"
          md="4"
          align="right"
          order="1"
          order-sm="12"
        >
          <v-dialog v-model="exportDialog" width="500" retain-focus>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-if="true"
                v-bind="attrs"
                v-on="on"
                :loading="exportingQuery"
              >
                Export As CSV
              </v-btn>
            </template>

            <v-card>
              <v-card-title class="text-h5 grey lighten-2">
                Export Analytics Data
              </v-card-title>

              <v-card-text class="pt-4">
                Select the data you would like to include in the CSV file:
              </v-card-text>
              <v-card-text>
                <div v-for="(value, key) in exportOptions" :key="key">
                  <v-checkbox
                    v-model="value.selected"
                    :label="value.text"
                    :hint="value.hint"
                    @change="updateExportOptions(key, value)"
                    class="py-0 my-0"
                  ></v-checkbox>
                </div>
                <div class="text-body-1 red">{{ selectDataError }}</div>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  text
                  @click="exportQuery"
                  :loading="exportingQuery"
                >
                  Export
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="4" md="4" order="1">
          <v-select
            label="Interaction Types"
            :items="dataMetrics"
            v-model="selectedMetric"
            prepend-icon="mdi-chart-line"
            @change="changeSelectedMetric"
          >
          </v-select>
        </v-col>
        <v-col cols="12" sm="4" md="4" order="2">
          <v-menu
            ref="dateRangeMenu"
            v-model="dateRangeMenu"
            :close-on-content-click="false"
            :return-value.sync="dateRange"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="dateRangeText"
                label="Date range"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="dateRange" no-title scrollable range>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="runQuery()"> OK </v-btn>
              <v-btn text color="primary" @click="dateRangeMenu = false">
                Cancel
              </v-btn>
            </v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" sm="4" md="4" order="3">
          <v-autocomplete
            label="Time Zone"
            :items="timezoneList"
            v-model="tz"
            prepend-icon="mdi-clock"
            @change="runQuery"
          >
          </v-autocomplete>
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
      <v-row v-if="!totalInteractions.length">
        <v-col cols="12">
          <div class="text-body1 text-center">
            There are no recorded interactions for this date range.
          </div>
        </v-col>
      </v-row>
      <v-row v-if="totalInteractions.length">
        <v-col>
          <ccv-donut-chart
            v-if="!loadingAnalytics"
            :data="totalInteractions"
            :options="donutChartOptions"
          ></ccv-donut-chart>
        </v-col>
      </v-row>
      <v-row v-if="dateRange[1] && totalInteractions.length">
        <v-col>
          <ccv-line-chart
            v-if="!loadingAnalytics"
            :data="uniqueVisitorsGraph"
            :options="interactionChartOptions"
          ></ccv-line-chart>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import Vue from 'vue'
import { DateTime, Interval, Duration } from 'luxon'
import timezones from 'timezones-list'
import Loader from '../components/Loader'
import { downloadCsv } from '../helpers/download.js'
import chartsVue from '@carbon/charts-vue'
import MapChart from 'vue-map-chart'

import '@carbon/styles/css/styles.css'
import '@carbon/charts/styles.css'

Vue.use(chartsVue)

export default {
  name: 'AnalyticsSystem',
  components: { Loader, MapChart },
  data: () => ({
    loadingAnalytics: false,
    loadingConnections: true,
    exportingQuery: false,
    dateRangeMenu: false,
    selectDataError: '',
    dateRange: [
      DateTime.now().toFormat('yyyy-MM-dd'),
      DateTime.now()
        .endOf('day')
        .toFormat('yyyy-MM-dd')
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
    totalInteractions: {},
    visitors: [],
    filteredVisitors: [],
    eventTypes: [],
    connectedUsers: 0,
    vpnConnections: 0,
    eventTypeFilter: 'all',
    exportDialog: false,
    exportOptions: {
      wallets: { selected: false, text: 'Wallet Addresses' },
      clientIps: { selected: false, text: 'IP Addresses' },
      names: { selected: false, text: 'Usernames' },
      guests: {
        selected: false,
        text: 'Include Guest Users',
        hint: '(Wallet addresses will not be included)'
      }
    },
    sevenDayConnectionAverage: 0,
    thirtyDayConnectionAverage: 0,
    uniqueVisitorsGraph: [],
    activeCountryCodes: {},
    activeCountries: [],
    interactionChartOptions: {
      title: 'Interactions Over Time',
      axes: {
        bottom: {
          title: 'Date',
          mapsTo: 'date',
          scaleType: 'time'
        },
        left: {
          mapsTo: 'uniqueVisitors',
          title: 'Events Triggered',
          scaleType: 'linear'
        }
      },
      curve: 'curveMonotoneX',
      data: {
        loading: true
      }
    },
    donutChartOptions: {
      title: 'Total Interactions',
      resizable: true,
      legend: {
        alignment: 'center'
      },
      pie: {
        valueMapsTo: 'uniqueVisitors'
      },
      donut: {
        center: {
          label: 'Interactions'
        },
        alignment: 'center'
      }
    },
    timezoneList: timezones.map(tz => tz.tzCode),
    tz: DateTime.local().toFormat('z')
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

    this.getActiveConnections()
    this.connectionsInterval = setInterval(
      () => this.getActiveConnections(),
      60000
    )
  },
  computed: {
    dateRangeText () {
      if (this.dateRange.length > 1) {
        return this.dateRange.join(' to ')
      } else {
        return this.dateRange[0]
      }
    },
    defaultDate () {
      const today = new Date().toISOString()
      return this.formatDate(today)
    }
  },
  methods: {
    async runQuery () {
      this.loadingAnalytics = true
      let startDate = DateTime.fromISO(this.dateRange[0]) || '',
        endDate = DateTime.fromISO(this.dateRange[1]) || '',
        timescale =
          Interval.fromDateTimes(startDate, endDate).length('days') <= 2
            ? 'hour'
            : 'day'

      if (!endDate) {
        this.dateRange[1] = this.dateRange[0]
        endDate = DateTime.fromISO(this.dateRange[1])
      }

      this.$refs.dateRangeMenu.save(this.dateRange)
      const baseParcel = this.baseParcel.split(','),
        x = baseParcel[0],
        y = baseParcel[1]

      let apiUrl = `${process.env.VUE_APP_API_URL}/analytics/visitors/${x}/${y}?startDate=${startDate}`

      if (endDate) {
        apiUrl += `&endDate=${endDate}`
      }

      if (this.tz) {
        apiUrl += `&tz=${this.tz}`
      }

      if (timescale) {
        apiUrl += `&timescale=${timescale}`
      }

      // if (this.eventTypeFilter) {
      //   apiUrl += `&eventType=${this.eventTypeFilter}`
      // }

      try {
        const res = await fetch(apiUrl)
        const { usersData, uniqueVisits, totalInteractions } = await res.json()

        console.log(usersData)

        this.uniqueVisitorsGraph = uniqueVisits
        this.totalInteractions = totalInteractions

        this.loadingAnalytics = false
        this.interactionChartOptions.data.loading = false
        this.eventTypes.unshift({ value: 'all', text: 'All Actions' })
        this.eventTypeFilter = 'all'
      } catch (error) {
        console.log(error)
      }
    },

    async getActiveConnections () {
      const baseParcel = this.baseParcel.split(','),
        x = baseParcel[0],
        y = baseParcel[1]

      let apiUrl = `${process.env.VUE_APP_API_URL}/analytics/connections/${x}/${y}`

      const res = await fetch(apiUrl)
      const usersData = await res.json()
      this.loadingConnections = true
      this.connectedUsers = usersData ? usersData.activeConnections : 0
      this.vpnConnections = usersData ? usersData.activeVpnConnections : 0
      this.activeCountries = usersData ? usersData.activeCountries : []
      this.sevenDayConnectionAverage = usersData
        ? Duration.fromMillis(usersData.sevenDayConnectionAverage).toFormat(
            "mm'm' ss's'"
          )
        : 0
      this.thirtyDayConnectionAverage = usersData
        ? Duration.fromMillis(usersData.thirtyDayConnectionAverage).toFormat(
            "mm'm' ss's'"
          )
        : 0
      this.loadingConnections = false

      Object.keys(this.activeCountryCodes).forEach(countryCode => {
        this.activeCountryCodes[countryCode] = 0
      })

      this.activeCountryCodes = {
        ...this.activeCountryCodes,
        ...usersData.activeCountryCodes
      }
    },

    async exportQuery () {
      const selectedExportOptions = Object.entries(this.exportOptions).map(
        ([key, value]) => {
          if (key) return value.selected
        }
      )
      const hasExportOptions = selectedExportOptions.some(selected => selected)
      if (!hasExportOptions) {
        this.selectDataError = "Please select the data you'd like to export."
        return
      }
      this.exportDialog = false
      this.exportingQuery = true
      let startDate = this.dateRange[0] || '',
        endDate = this.dateRange[1] || this.dateRange[0] || ''

      this.$refs.dateRangeMenu.save(this.dateRange)
      const baseParcel = this.baseParcel.split(','),
        x = baseParcel[0],
        y = baseParcel[1]

      let queryString = `?startDate=${startDate}&endDate=${endDate}`
      if (this.eventTypeFilter) {
        queryString += `&eventType=${this.eventTypeFilter}`
      }
      let hasEventFilter = this.eventTypeFilter !== 'all'
      let fileName = `_${startDate ? startDate : ''}${
        startDate && endDate ? '-' + endDate : ''
      }${hasEventFilter ? '-' + this.eventTypeFilter : ''}`
      Object.entries(this.exportOptions).forEach(([key, value]) => {
        if (value.selected) {
          queryString += `&${key}=${value.selected}`
        }
      })

      try {
        const response = await fetch(
          `${process.env.VUE_APP_API_URL}/analytics/export/${x}/${y}${queryString}`
        )
        const responseText = await response.text()
        downloadCsv(`vlm_analytics${fileName}.csv`, responseText)

        this.exportingQuery = false
      } catch (error) {
        this.exportingQuery = false
        console.log(error)
      }
    },
    changeSelectedMetric () {
      this.interactionChartOptions.title = this.dataMetrics.find(
        metric => metric.value == this.selectedMetric
      ).text
      this.interactionChartOptions.axes.left.mapsTo = this.selectedMetric
      this.donutChartOptions.pie.valueMapsTo = this.selectedMetric
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
