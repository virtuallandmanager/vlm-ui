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
              <div class="text-h6">Active Connections:</div>
              <div class="text-body-1">
                {{ connectedUsers }}
              </div>
            </v-card-text>
            <v-card-text class="d-flex justify-space-between">
              <div class="text-h6">Authentic Connections:</div>
              <div class="text-body-1">
                {{ connectedUsers - vpnConnections }}
              </div>
            </v-card-text>
            <v-card-text class="d-flex justify-space-between">
              <div class="text-h6">VPN Connections:</div>
              <div class="text-body-1">
                {{ vpnConnections }}
              </div>
            </v-card-text>
          </v-card>
          <v-card class="mt-4" v-if="connectedUsers">
            <v-card-text class="text-center">
              <MapChart
                :countryData="activeCountryCodes"
                highColor="purple"
                lowColor="black"
                countryStrokeColor="#909090"
                defaultCountryFillColor="#000000"
                legendHeaderBackgroundColor="#000000"
                legendContentBackgroundColor="#000000"
                :showLegend="false"
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
          <h1 class="text-h6">Interactions</h1>
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
                v-if="isDev || features.dataExports"
                v-bind="attrs"
                v-on="on"
                :loading="exportingQuery"
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
                CSV exports are not currently supported for date ranges larger
                than 60 days.
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
                        eventTypeFilter.length ? eventTypeFilter.length - 3 : 0
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
                            eventTypeFilter.length && eventTypeFilter.length > 0
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
            <v-date-picker
              v-model="dateRange"
              no-title
              scrollable
              range
              @change="validateDateRange"
            >
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
      <v-row v-if="!totalInteractions.length && !loadingAnalytics">
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
      <v-row v-if="totalInteractions.length">
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
import { mapActions } from 'vuex'

import '@carbon/styles/css/styles.css'
import '@carbon/charts/styles.css'

Vue.use(chartsVue)

export default {
  name: 'AnalyticsSystem',
  components: { Loader, MapChart },
  data: () => ({
    loadingAnalytics: true,
    loadingConnections: true,
    exportingQuery: false,
    dateRangeMenu: false,
    selectDataError: '',
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
    totalInteractions: {},
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
      },
      theme: 'g100'
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
      },
      theme: 'g100'
    },
    timezoneList: ['UTC', ...timezones.map(tz => tz.tzCode)],
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
  mounted() {
    this.runQuery()

    if (this.features.connectionData) {
      this.getActiveConnections()
      this.connectionsInterval = setInterval(
        () => this.getActiveConnections(),
        60000
      )
    }
  },
  computed: {
    errorMessage: {
      get() {
        return this.$store.getters['land/errorMessage']
      },
      set(value) {
        this.setErrorMessage(value)
      }
    },
    dateRangeText() {
      if (this.dateRange && this.dateRange.length > 1) {
        return this.dateRange.join(' to ')
      } else {
        return this.dateRange[0]
      }
    },
    dateRangeCount() {
      const startDate = DateTime.fromISO(this.dateRange[0]),
        endDate = DateTime.fromISO(this.dateRange[1]),
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
    }
  },
  methods: {
    ...mapActions({
      setErrorMessage: 'land/setErrorMessage'
    }),
    validateDateRange() {
      let dateRange = [this.dateRange[0], this.dateRange[1]]
      if (dateRange[0] > dateRange[1]) {
        this.dateRange[0] = dateRange[1]
        this.dateRange[1] = dateRange[0]
      }
    },
    handleSelectAll() {
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
    validateActions() {
      if (this.eventTypeFilter.length == 0) {
        this.errorMessage = 'Select at least one type of action to export.'
        this.eventTypeFilter = this.eventTypes.map(eventType => eventType.value)
      }
    },
    async runQuery() {
      this.loadingAnalytics = true
      let startDate = DateTime.fromISO(this.dateRange[0]),
        endDate = this.dateRange[1]
          ? DateTime.fromISO(this.dateRange[1])
          : DateTime.fromISO(this.dateRange[0]),
        timescale =
          Interval.fromDateTimes(startDate, endDate).length('days') <= 2
            ? 'hour'
            : 'day',
        tz = this.tz

      if (!endDate) {
        this.dateRange[1] = this.dateRange[0]
        endDate = DateTime.fromISO(this.dateRange[1])
      }

      this.$refs.dateRangeMenu.save(this.dateRange)
      const baseParcel = this.baseParcel.split(','),
        x = baseParcel[0],
        y = baseParcel[1]

      let apiUrl = `${process.env.VUE_APP_API_URL}/analytics/visitors/${x}/${y}`

      const requestBody = {
        startDate,
        endDate,
        timescale,
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
        }
        const visitorOptions = await res.json()
        let eventTypes = visitorOptions.eventTypes || [],
          totalInteractions = visitorOptions.totalInteractions || [],
          uniqueVisits = visitorOptions.uniqueVisits || [];

        this.uniqueVisitorsGraph = uniqueVisits
        this.totalInteractions = totalInteractions

        this.loadingAnalytics = false
        this.interactionChartOptions.data.loading = false
        if (eventTypes) {
          this.eventTypes = eventTypes.map(eventType => ({
            value: eventType,
            text:
              eventType == 'player_expression'
                ? 'Emote'
                : eventType.capitalize().removeUnderscore().removeDash()
          }))
          this.eventTypeFilter = eventTypes
        }
      } catch (error) {
        console.log(error)
      }
    },

    async getActiveConnections() {
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

    async exportQuery() {
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
      let startDate = this.dateRange[0] || '',
        endDate = this.dateRange[1] || this.dateRange[0] || '',
        removeDuplicateWallets = this.removeDuplicateWallets,
        removeDuplicateIps = this.removeDuplicateIps

      const requestBody = {
        startDate,
        endDate,
        eventTypes: this.eventTypeFilter,
        tz: this.tz,
        removeDuplicateWallets,
        removeDuplicateIps
      }

      this.$refs.dateRangeMenu.save(this.dateRange)
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
    changeSelectedMetric() {
      this.interactionChartOptions.title = this.dataMetrics.find(
        metric => metric.value == this.selectedMetric
      ).text
      this.interactionChartOptions.axes.left.mapsTo = this.selectedMetric
      this.donutChartOptions.pie.valueMapsTo = this.selectedMetric
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
    }
  }
}
</script>
