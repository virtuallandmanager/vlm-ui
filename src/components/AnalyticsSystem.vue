<template>
  <v-container class="py-6 mx-auto">
    <v-row>
      <v-col no-gutters>
        <h1 class="text-h5 ml-2 mb-4">Analytics</h1>
      </v-col>
    </v-row>
    <v-row class="grey darken-3 mx-n3">
      <v-col no-gutters>
        <h1 class="text-h6 white--text">Visitors</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6" md="4">
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
              label="UTC Date range"
              prepend-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="dateRange" no-title scrollable range>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="runQuery()">
              OK
            </v-btn>
            <v-btn text color="primary" @click="dateRangeMenu = false">
              Cancel
            </v-btn>
          </v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-select
          label="Event Type"
          :items="eventTypes"
          v-model="eventTypeFilter"
          @change="filterByEventType"
        >
        </v-select>
      </v-col>
      <v-col cols="12" sm="6" md="4" align="right">
        <v-dialog v-model="exportDialog" width="500">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" disabled>
              Export To CSV
            </v-btn>
          </template>

          <v-card>
            <v-card-title class="text-h5 grey lighten-2">
              Export Analytics Data
            </v-card-title>

            <v-card-text>
              <div v-for="(value, key) in exportOptions" :key="key">
                <v-checkbox
                  :v-model="value.selected"
                  :label="value.text"
                  dense
                ></v-checkbox>
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="exportDialog = false">
                I accept
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <loader message="Loading analytics data..." :loading="loadingAnalytics" :grid="true"/>
        <v-data-table v-if="!loadingAnalytics"
          :headers="headers"
          :items="filteredVisitors"
          :items-per-page="25"
        ></v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from 'moment'
import Loader from '../components/Loader'

export default {
  name: 'AnalyticsSystem',
  components: { Loader },
  data: () => ({
    loadingAnalytics: false,
    dateRangeMenu: false,
    dateRange: [moment().format('YYYY-MM-DD')],
    headers: [
      {
        text: 'Event Tag',
        align: 'start',
        value: 'eventTypeText'
      },
      { text: 'Total Unique Visitors', value: 'uniqueVisitors' },
      { text: 'With Web3 Account', value: 'uniqueWeb3' },
      { text: 'With Guest Account', value: 'uniqueGuests' }
    ],
    visitors: [],
    filteredVisitors: [],
    eventTypes: [],
    eventTypeFilter: null,
    exportDialog: false,
    exportOptions: {
      wallets: { selected: false, text: 'Wallet Addresses' },
      names: { selected: false, text: 'Usernames' },
      entryDate: { selected: false, text: 'Enter Date' },
      entryTime: { selected: false, text: 'Enter Time' },
      exitDate: { selected: false, text: 'Enter Time' },
      exitTime: { selected: false, text: 'Enter Time' },
      guests: {
        selected: false,
        text: 'Include Guest Users (Wallet addresses will not be included)'
      }
    }
  }),
  props: {
    baseParcel: {
      type: String
    }
  },
  mounted () {
    this.runQuery()
    String.prototype.capitalize = function () {
      return this.toLowerCase().replace(/\b\w/g, function (m) {
        return m.toUpperCase()
      })
    }
    String.prototype.removeUnderscore = function () {
      return this.replace(/_/g, ' ')
    }
  },
  computed: {
    dateRangeText () {
      if (this.dateRange.length > 1) {
        return this.dateRange.join(' ~ ')
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
      let startDate = this.dateRange[0] || '',
        endDate = this.dateRange[1] || ''

      if (endDate && moment(startDate).isAfter(endDate)) {
        this.dateRange = [endDate, startDate]
        startDate = this.dateRange[0] || ''
        endDate = this.dateRange[1] || ''
      }

      this.$refs.dateRangeMenu.save(this.dateRange)
      const baseParcel = this.baseParcel.split(','),
        x = baseParcel[0],
        y = baseParcel[1]

      try {
        const res = await fetch(
          `${process.env.VUE_APP_API_URL}/analytics/visitors/${x}/${y}?startDate=${startDate}&endDate=${endDate}`
        )
        const { visitors } = await res.json()
        this.visitors = visitors.map(data => ({
          ...data,
          eventTypeText: data.eventType.removeUnderscore().capitalize()
        }))
        this.eventTypes = visitors.map(data => ({
          value: data.eventType,
          text: data.eventType.removeUnderscore().capitalize()
        }))
        this.filteredVisitors = this.visitors
        this.filterByEventType()
        this.loadingAnalytics = false
      } catch (error) {
        console.log(error)
      }
    },
    filterByEventType () {
      if (this.eventTypeFilter) {
        this.filteredVisitors = this.visitors.filter(
          data => data.eventType == this.eventTypeFilter
        )
      }
    },
    formatDate (date) {
      const [dateStr] = new Date(date).toISOString().split('T')
      return dateStr
    },
    updateProperties () {
      this.$emit('updateProperties')
    }
  }
}
</script>
