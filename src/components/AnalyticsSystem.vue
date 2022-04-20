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
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="visitors"
          :items-per-page="25"
        ></v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AnalyticsSystem',

  data: () => ({
    dateRangeMenu: false,
    dateRange: [moment().format('YYYY-MM-DD')],
    headers: [
      {
        text: 'Event Tag',
        align: 'start',
        value: 'eventType'
      },
      { text: 'Total Unique Visitors', value: 'uniqueVisitors' },
      { text: 'With Web3 Account', value: 'uniqueWeb3' },
      { text: 'With Guest Account', value: 'uniqueGuests' }
    ],
    visitors: []
  }),
  props: {
    baseParcel: {
      type: String
    }
  },
  mounted () {
    this.runQuery()
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
        this.visitors = visitors
      } catch (error) {
        console.log(error)
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
