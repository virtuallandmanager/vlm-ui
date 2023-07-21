<template>
  <content-sub-panel :loading="loadingAnalytics" :hasContent="!lineChartData.length && !donutChartData.length && !loadingAnalytics" loadingMessage="Loading analytics data...">
    <template v-slot:header>
      <v-tabs v-model="tab" centered dark grow icons-and-text>
        <v-tabs-slider></v-tabs-slider>
        <v-tab href="#tab-1">
          Live Status
          <v-icon>mdi-sync</v-icon>
        </v-tab>
        <v-tab href="#tab-2">
          Recent Metrics
          <v-icon>mdi-history</v-icon>
        </v-tab>
        <v-tab href="#tab-3">
          Historical Graphs
          <v-icon>mdi-chart-line</v-icon>
        </v-tab>
      </v-tabs>
    </template>
    <v-tabs-items v-model="tab">
      <v-tab-item value="tab-1">
        <v-container>
          <v-card>
            <v-card-title>Currently In Scene</v-card-title>
            <v-card-content>
              <v-card tile color="black" class="pa-2" min-height="420">Stuff</v-card>
            </v-card-content>
          </v-card>
          <v-card>
            <v-card-title>Live Actions</v-card-title>
            <v-card-content>
              <v-card tile color="black" class="pa-2" min-height="420">Stuff</v-card>
            </v-card-content>
          </v-card>
          <v-card-actions class="justify-space-between">
            <v-btn color="primary">Guestlist Snapshot</v-btn>
            <v-btn color="primary">Send Message</v-btn>
          </v-card-actions>
        </v-container>
      </v-tab-item>

      <v-tab-item value="tab-2">
        <v-container>
          <v-card>
            <v-card-title>Currently In Scene</v-card-title>
            <v-card-content>
              <v-card tile color="black" class="pa-2" min-height="420">Stuff</v-card>
            </v-card-content>
          </v-card>
          <v-card>
            <v-card-title>Live Actions</v-card-title>
            <v-card-content>
              <v-card tile color="black" class="pa-2" min-height="420">Stuff</v-card>
            </v-card-content>
          </v-card>
          <v-card-actions class="justify-space-between">
            <v-btn color="primary">Guestlist Snapshot</v-btn>
            <v-btn color="primary">Send Message</v-btn>
          </v-card-actions>
        </v-container>
      </v-tab-item>
      <v-tab-item value="tab-3">
        <date-range-bar />
        <v-container>
          <v-card>
            <v-card-title>Interactions Chart</v-card-title>
            <v-card-content>
              <v-card tile color="black" class="pa-2" min-height="420">Graph</v-card>
            </v-card-content>
          </v-card>
          <v-card>
            <v-card-title>Interactions Breakdown</v-card-title>
            <v-card-content>
              <v-card tile color="black" class="pa-2" min-height="420">Graph</v-card>
            </v-card-content>
          </v-card>
          <v-card-actions class="justify-space-between">
            <v-btn color="primary">Guestlist Snapshot</v-btn>
            <v-btn color="primary">Send Message</v-btn>
          </v-card-actions>
        </v-container>
      </v-tab-item>
    </v-tabs-items>
  </content-sub-panel>
</template>

<script>
import Vue from "vue";
import "@carbon/styles/css/styles.css";
import "@carbon/charts/styles.css";
import chartsVue from "@carbon/charts-vue";
import { DateTime, Interval } from "luxon";
import timezones from "timezones-list";
import ContentSubPanel from "./ContentSubPanel";
import DateRangeBar from "./DateRangeBar";
// import { downloadCsv } from "../helpers/download.js";
import { mapActions } from "vuex";
import _ from "lodash";

Vue.use(chartsVue);

export default {
  name: "SceneAnalytics",
  components: { ContentSubPanel, DateRangeBar },
  data: () => ({
    tab: "tab-1",
    loadingAnalytics: false,
    loadingConnections: false,
    exportingQuery: false,
    dateRangeMenu: false,
    selectDataError: "",
    startDateMenu: false,
    startTimeMenu: false,
    endDateMenu: false,
    endTimeMenu: false,
    timeZoneMenu: false,
    startDate: DateTime.now().toISODate(),
    startTime: "00:00:00",
    endDate: DateTime.now().toISODate(),
    endTime: "23:59:59",
    dateRange: [DateTime.now().toFormat("yyyy-MM-dd"), DateTime.now().endOf("day").toFormat("yyyy-MM-dd")],
    dataMetrics: [
      { value: "uniqueVisitors", text: "All Unique Visitors" },
      { value: "uniqueWeb3", text: "Visitors With Wallet" },
      { value: "uniqueGuests", text: "Guest Visitors" },
      { value: "uniqueIps", text: "Unique IP Addresses" },
    ],
    selectedMetric: "uniqueVisitors",
    activeCountryHeaders: [
      {
        text: "Country",
        align: "start",
        value: "country",
      },
      { text: "Active Connections", value: "users" },
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
      wallets: { selected: false, text: "Wallet Addresses" },
      names: { selected: false, text: "Usernames" },
      clientIps: { selected: false, text: "IP Addresses" },
      authenticity: { selected: false, text: "IP Authenticity" },
      metadata: { selected: false, text: "Metadata" },
      location: { selected: false, text: "Locations" },
      guests: {
        selected: false,
        text: "Guest Accounts",
      },
      dateTimes: { selected: false, text: "Dates & Times" },
      isoTimestamps: { selected: false, text: "ISO Timestamps" },
      unixTimestamps: { selected: false, text: "Unix Timestamps" },
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
          title: "Date",
          mapsTo: "date",
          scaleType: "time",
        },
        left: {
          mapsTo: "records",
          title: "Events Triggered",
          scaleType: "linear",
        },
      },
      curve: "curveMonotoneX",
      toolbar: { enabled: false },
      resizable: true,
      title: "",
      data: {
        groupMapsTo: "group",
        loading: false,
      },
      zoomBar: {
        top: { enabled: true, type: "slider_view" },
      },
      theme: "g100",
      height: "250px",
      experimental: true,
    },
    donutChartOptions: {
      title: "",
      height: "300px",
      toolbar: { enabled: false },
      resizable: false,
      legend: {
        alignment: "center",
      },
      pie: {
        valueMapsTo: "records",
      },
      donut: {
        center: {
          label: "Records",
        },
        alignment: "center",
      },
      theme: "g100",
    },
    timezoneList: [
      { text: "UTC", value: "UTC" },
      ...timezones.map((tz) => ({
        text: `${tz.tzCode} (UTC ${tz.utc})`,
        value: tz.tzCode,
      })),
    ],
    records: [],
    lineChartData: [],
    donutChartData: [],
    timezoneAbbrList: ["UTC", ...timezones.map((tz) => tz.abbr)],
    tzCode: DateTime.local().zoneName,
    newTzCode: "",
    newStartDate: "",
    newStartTime: "",
    newEndDate: "",
    newEndTime: "",
    timescaleEnum: 1,
  }),
  computed: {
    startDateTime: {
      get() {
        return DateTime.fromFormat(this.startDate + this.startTime, "yyyy-MM-ddt");
      },
      set() {
        return DateTime.fromFormat(this.startDate + this.startTime, "yyyy-MM-ddt");
      },
    },
    endDateTime: {
      get() {
        return DateTime.fromFormat(this.endDate + this.endTime, "yyyy-MM-ddt");
      },
      set() {
        return DateTime.fromFormat(this.endDate + this.endTime, "yyyy-MM-ddt");
      },
    },
    errorMessage: {
      get() {
        return this.$store.getters["land/errorMessage"];
      },
      set(value) {
        this.setErrorMessage(value);
      },
    },
    startDateTimeText() {
      return `${this.startDate} at ${this.startTime}`;
    },
    endDateTimeText() {
      return `${this.endDate} at ${this.endTime}`;
    },
    selectedTimezone() {
      return timezones.find((tz) => tz.tzCode == this.tzCode);
    },
    dateRangeCount() {
      const startDate = DateTime.fromISO(this.startDate),
        endDate = DateTime.fromISO(this.endDate),
        dateRange = Interval.fromDateTimes(startDate, endDate),
        dateRangeDays = dateRange.length("days");

      return dateRangeDays;
    },
    defaultDate() {
      const today = new Date().toISOString();
      return this.formatDate(today);
    },
    isDev() {
      return process.env.VUE_APP_NODE_ENV == "development";
    },
    includeAllActions() {
      return this.eventTypeFilter.length === this.eventTypes.length;
    },
    includeSomeActions() {
      return this.eventTypeFilter.length > 0 && !this.includeAllActions;
    },
    selectAllIcon() {
      if (this.includeAllActions) return "mdi-close-box";
      if (this.includeSomeActions) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    },
    timescale() {
      switch (this.timescaleEnum) {
        case 0:
          return "minute";
        case 1:
          return "hour";
        case 2:
          return "day";
        case 3:
          return "week";
        default:
          return "hour";
      }
    },
  },
  methods: {
    ...mapActions({
      setErrorMessage: "land/setErrorMessage",
    }),
    validateDateRange() {
      //todo
    },
    handleSelectAll() {
      this.$nextTick(() => {
        if (this.includeAllActions) {
          this.eventTypeFilter = [];
        } else {
          this.eventTypeFilter = this.eventTypes.map((eventType) => eventType.value);
        }
      });
    },
    validateActions() {
      if (this.eventTypeFilter.length == 0) {
        this.errorMessage = "Select at least one type of action to export.";
        this.eventTypeFilter = this.eventTypes.map((eventType) => eventType.value);
      }
    },
    open(menuVar, options) {
      const objThis = this;

      Vue.set(this, menuVar, true);
      if (options && options.set) {
        Vue.set(this, options.set, objThis[options.to]);
      }
    },
    save(varName, newVarName, clearVal, menuVar, runQuery = true) {
      const objThis = this;
      Vue.set(this, varName, objThis[newVarName]);
      Vue.set(this, newVarName, clearVal || "");
      if (menuVar) {
        Vue.set(this, menuVar, false);
      }
      if (runQuery) {
        this.runQuery();
      }
    },
    cancel(newVar, menuVar) {
      Vue.set(this, newVar, "");
      Vue.set(this, menuVar, false);
    },
    groupByTime(array, timescale, tz) {
      try {
        return _.groupBy(array, (event) =>
          DateTime.fromMillis(event.timestamp, { zone: tz || "UTC" })
            .startOf(timescale)
            .toISO({ includeOffset: false })
        );
      } catch (error) {
        console.log(error);
      }
    },

    openTimePicker(type) {
      this.startDateMenu = false;
      this.endDateMenu = false;
      switch (type) {
        case "start":
          this.startTimeMenu = true;
          break;
        case "end":
          this.endTimeMenu = true;
          break;
      }
    },
    clockIcon(time) {
      const hour = time.split(":")[0];
      switch (hour) {
        case "00":
        case "12":
          return "mdi-clock-time-twelve";
        case "01":
        case "13":
          return "mdi-clock-time-one";
        case "02":
        case "14":
          return "mdi-clock-time-two";
        case "03":
        case "15":
          return "mdi-clock-time-three";
        case "04":
        case "16":
          return "mdi-clock-time-four";
        case "05":
        case "17":
          return "mdi-clock-time-five";
        case "06":
        case "18":
          return "mdi-clock-time-six";
        case "07":
        case "19":
          return "mdi-clock-time-seven";
        case "08":
        case "20":
          return "mdi-clock-time-eight";
        case "09":
        case "21":
          return "mdi-clock-time-nine";
        case "10":
        case "22":
          return "mdi-clock-time-ten";
        case "11":
        case "23":
          return "mdi-clock-time-eleven";
        default:
          return "mdi-clock";
      }
    },
    formatDate(date) {
      const [dateStr] = new Date(date).toISOString().split("T");
      return dateStr;
    },
    updateExportOptions() {
      this.selectDataError = "";
    },
    updateProperties() {
      this.$emit("updateProperties");
    },
  },
};
</script>
