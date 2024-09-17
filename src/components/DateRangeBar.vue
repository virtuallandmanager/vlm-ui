<template>
  <v-container class="py-6 mx-auto">
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
                          to: 'tzCode',
                        })
                      "
                      v-bind="attrs"
                      v-on="on"
                      class="display-flex flex-row"
                      small
                    >
                      <v-icon small class="mr-2">mdi-map-clock</v-icon>
                      <div class="text-caption">{{ selectedTimezone.tzCode }} (UTC {{ selectedTimezone.utc }})</div>
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
                      <v-btn text color="primary" @click="saveTz()"> Save </v-btn>
                      <v-btn text color="primary" @click="cancel('newTzCode', 'timeZoneMenu')"> Cancel </v-btn>
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
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        @click="
                          open('startDateMenu', {
                            set: 'newStartDate',
                            to: 'startDate',
                          })
                        "
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon small class="mr-2">mdi-calendar</v-icon>
                        {{ newStartDate || startDate }}
                      </v-btn>
                    </template>
                    <v-date-picker v-model="newStartDate" no-title>
                      <v-spacer></v-spacer>
                      <v-btn text color="primary" @click="save('startDate', 'newStartDate', 'newStartDate', 'startDateMenu')"> Save </v-btn>
                      <v-btn text color="primary" @click="cancel('newStartDate', 'startDateMenu')"> Cancel </v-btn>
                    </v-date-picker>
                  </v-menu>
                  <v-menu
                    ref="startTimeMenu"
                    v-model="startTimeMenu"
                    :close-on-content-click="false"
                    :return-value.sync="startTime"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                    offset-overflow
                    left
                    origin="top right"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        @click="
                          open('startTimeMenu', {
                            set: 'newStartTime',
                            to: 'startTime',
                          })
                        "
                        v-bind="attrs"
                        v-on="on"
                        small
                        ><v-icon small class="mr-2">{{ clockIcon(newStartTime || startTime) }}</v-icon
                        >{{ newStartTime || startTime }}</v-btn
                      >
                    </template>
                    <v-time-picker v-model="newStartTime" no-title use-seconds>
                      <v-btn text color="accent" @click="newStartTime = '00:00:00'"> Start Of Day </v-btn>
                      <v-btn text color="accent" @click="newStartTime = '23:59:59'"> End Of Day </v-btn>
                      <v-spacer></v-spacer>
                      <v-btn text color="primary" @click="save('startTime', 'newStartTime', 'newStartTime', 'startTimeMenu')"> Save </v-btn>
                      <v-btn text color="primary" @click="cancel('newStartTime', 'startTimeMenu')"> Cancel </v-btn>
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
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      @click="
                        open('endDateMenu', {
                          set: 'newEndDate',
                          to: 'endDate',
                        })
                      "
                      v-bind="attrs"
                      v-on="on"
                      small
                      ><v-icon small class="mr-2">mdi-calendar</v-icon>
                      {{ newEndDate || endDate }}
                    </v-btn>
                  </template>
                  <v-date-picker v-model="newEndDate" no-title v-if="!endTimeMenu">
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="save('endDate', 'newEndDate', 'newEndDate', 'endDateMenu')"> Save </v-btn>
                    <v-btn text color="primary" @click="cancel('newEndDate', 'endDateMenu')"> Cancel </v-btn>
                  </v-date-picker>
                </v-menu>
                <v-menu
                  ref="endTimeMenu"
                  v-model="endTimeMenu"
                  :close-on-content-click="false"
                  :return-value.sync="endTime"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                  offset-overflow
                  left
                  origin="top right"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      @click="
                        open('endTimeMenu', {
                          set: 'newEndTime',
                          to: 'endTime',
                        })
                      "
                      v-bind="attrs"
                      v-on="on"
                      small
                      ><v-icon small class="mr-2">{{ clockIcon(newEndTime || endTime) }}</v-icon
                      >{{ newEndTime || endTime }}</v-btn
                    >
                  </template>
                  <v-time-picker v-model="newEndTime" no-title>
                    <v-btn text color="accent" @click="newEndTime = '00:00'"> Start Of Day </v-btn>
                    <v-btn text color="accent" @click="newEndTime = '23:59'"> End Of Day </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="save('endTime', 'newEndTime', 'newEndTime', 'endTimeMenu')"> Save </v-btn>
                    <v-btn text color="primary" @click="cancel('newEndTime', 'endTimeMenu')"> Cancel </v-btn>
                  </v-time-picker>
                </v-menu>
              </v-col>
            </v-row></v-container
          ></v-card
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from 'vue'
import '@carbon/styles/css/styles.css'
import '@carbon/charts/styles.css'
import chartsVue from '@carbon/charts-vue'
import { DateTime, Interval } from 'luxon'
import timezones from 'timezones-list'
import { downloadCsv } from '../helpers/download.js'
import { mapActions, mapGetters } from 'vuex'
import _ from 'lodash'

Vue.use(chartsVue)

export default {
  name: 'DateRangeBar',
  data: () => ({
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
    errorMessage: '',
  }),
  props: {
    baseParcel: {
      type: String,
    },
    features: {
      type: Object,
    },
  },
  mounted() {
    this.startDate = this.defaultDate
    this.endDate = this.defaultDate
    this.loadHistoricalData()
  },
  computed: {
    ...mapGetters({
      activeScene: 'scene/activeScene',
      eventTypes: 'analytics/eventTypes',
      eventTypeFilter: 'analytics/eventTypeFilter',
      removeDuplicateWallets: 'analytics/removeDuplicateWallets',
      removeDuplicateIps: 'analytics/removeDuplicateIps',
      exportOptions: 'analytics/exportOptions',
    }),
    startDateTime: {
      get() {
        return DateTime.fromFormat(this.startDate + ' ' + this.startTime, 'yyyy-MM-dd HH:mm:ss', { zone: this.selectedTimezone.tzCode })
      },
      set(value) {
        console.log('this.startDate', this.startDate)
        console.log('this.startTime', this.startTime)
        const dt = DateTime.fromMillis(value, { zone: this.selectedTimezone.tzCode })

        // Only update if the values have changed to avoid infinite loop
        const newDate = dt.toFormat('yyyy-MM-dd')
        const newTime = dt.toFormat('HH:mm:ss')

        if (this.startDate !== newDate) {
          this.startDate = newDate
        }
        if (this.startTime !== newTime) {
          this.startTime = newTime
        }
      },
    },
    endDateTime: {
      get() {
        console.log('this.endDate', this.endDate)
        console.log('this.endTime', this.endTime)
        return DateTime.fromFormat(this.endDate + ' ' + this.endTime, 'yyyy-MM-dd HH:mm:ss', { zone: this.selectedTimezone.tzCode })
      },
      set(value) {
        const dt = DateTime.fromMillis(value, { zone: this.selectedTimezone.tzCode })

        // Only update if the values have changed to avoid infinite loop
        const newDate = dt.toFormat('yyyy-MM-dd')
        const newTime = dt.toFormat('HH:mm:ss')

        if (this.endDate !== newDate) {
          this.endDate = newDate
        }
        if (this.endTime !== newTime) {
          this.endTime = newTime
        }
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
      const today = DateTime.now().minus({ days: 1 }).toISODate()
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
      getHistoricalData: 'analytics/getHistoricalData',
    }),
    async loadHistoricalData() {
      console.log('startDateTime', this.startDateTime)
      console.log('endDateTime', this.endDateTime)
      await this.getHistoricalData({
        sceneId: this.activeScene.sk,
        start: this.startDateTime.toMillis(),
        end: this.endDateTime.toMillis(),
        tz: this.selectedTimezone.tzCode,
        scale: this.timescale,
      })
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
      this[varName] = objThis[newVarName]
      // Vue.set(this, varName, objThis[newVarName])
      // Vue.set(this, newVarName, clearVal || '')
      if (clearVal && Object.prototype.hasOwnProperty.call(this, clearVal)) {
        this[clearVal] = ''
      }
      if (menuVar && Object.prototype.hasOwnProperty.call(this, menuVar)) {
        this[menuVar] = false
        // Vue.set(this, menuVar, false)
      }

      this.onChange()

      if (runQuery) {
        this.loadHistoricalData()
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

    async exportQuery() {
      const selectedExportOptions = Object.entries(this.exportOptions).map(([key, value]) => {
        if (key) return value.selected
      })
      const hasExportOptions = selectedExportOptions.some((selected) => selected)
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
        removeDuplicateIps,
      }

      const baseParcel = this.baseParcel.split(','),
        x = baseParcel[0],
        y = baseParcel[1]

      let hasEventFilter = this.eventTypeFilter.length && this.eventTypeFilter.length !== this.eventTypes.length
      let fileName = `_${startDate ? startDate : ''}${startDate && endDate ? '-' + endDate : ''}${
        hasEventFilter ? '-' + this.eventTypeFilter.join('_') : ''
      }`

      Object.entries(this.exportOptions).forEach(([key, value]) => {
        requestBody[key] = value.selected
      })

      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }

      try {
        const response = await fetch(`${process.env.VUE_APP_API_URL}/analytics/export/${x}/${y}`, fetchOptions)
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
    formatDate(date) {
      console.log('date', date)
      return date
    },
    updateExportOptions() {
      this.selectDataError = ''
    },
    updateProperties() {
      this.$emit('updateProperties')
    },
    onChange() {
      console.log('onChange')
      this.$emit('onChange', {
        start: this.startDateTime.toISO(),
        end: this.endDateTime.toISO(),
        tz: this.selectedTimezone.tzCode,
        timescale: this.timescale,
      })
    },
  },
}
</script>
