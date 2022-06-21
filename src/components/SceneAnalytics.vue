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
            <v-btn v-if="false" v-bind="attrs" v-on="on" :loading="exportingQuery">
              Export To CSV
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
              label="UTC Date range"
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
        <v-select
          label="Action Type"
          :items="eventTypes"
          v-model="eventTypeFilter"
          @change="filterByEventType"
        >
        </v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <loader
          message="Loading analytics data..."
          :loading="loadingAnalytics"
          :grid="true"
        />
        <v-data-table
          v-if="!loadingAnalytics"
          :headers="headers"
          :items="filteredVisitors"
          :items-per-page="25"
        ></v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment";
import Loader from "../components/Loader";
import { downloadCsv } from "../helpers/download.js";

export default {
  name: "AnalyticsSystem",
  components: { Loader },
  data: () => ({
    loadingAnalytics: false,
    exportingQuery: false,
    dateRangeMenu: false,
    selectDataError: "",
    dateRange: [moment().format("YYYY-MM-DD")],
    headers: [
      {
        text: "Player Action",
        align: "start",
        value: "eventTypeText",
      },
      { text: "Total Unique Visitors", value: "uniqueVisitors" },
      { text: "With Web3 Account", value: "uniqueWeb3" },
      { text: "With Guest Account", value: "uniqueGuests" },
      { text: "Unique IP Addresses", value: "uniqueIps" },
    ],
    visitors: [],
    filteredVisitors: [],
    eventTypes: [],
    eventTypeFilter: "all",
    exportDialog: false,
    exportOptions: {
      wallets: { selected: false, text: "Wallet Addresses" },
      clientIps: { selected: false, text: "IP Addresses" },
      names: { selected: false, text: "Usernames" },
      // connectionTime: { selected: false, text: 'Time In Scene' },
      guests: {
        selected: false,
        text: "Include Guest Users",
        hint: "(Wallet addresses will not be included)",
      },
    },
  }),
  props: {
    baseParcel: {
      type: String,
    },
  },
  mounted() {
    this.runQuery();
  },
  computed: {
    dateRangeText() {
      if (this.dateRange.length > 1) {
        return this.dateRange.join(" ~ ");
      } else {
        return this.dateRange[0];
      }
    },
    defaultDate() {
      const today = new Date().toISOString();
      return this.formatDate(today);
    },
  },
  methods: {
    async runQuery() {
      this.loadingAnalytics = true;
      let startDate = this.dateRange[0] || "",
        endDate = this.dateRange[1] || "";

      if (endDate && moment(startDate).isAfter(endDate)) {
        this.dateRange = [endDate, startDate];
        startDate = this.dateRange[0] || "";
        endDate = this.dateRange[1] || "";
      }

      this.$refs.dateRangeMenu.save(this.dateRange);
      const baseParcel = this.baseParcel.split(","),
        x = baseParcel[0],
        y = baseParcel[1];

      try {
        const res = await fetch(
          `${process.env.VUE_APP_API_URL}/analytics/visitors/${x}/${y}?startDate=${startDate}&endDate=${endDate}`
        );
        const { visitors } = await res.json();
        this.visitors = visitors.map((data) => ({
          ...data,
          eventTypeText: data.eventType.removeUnderscore().capitalize(),
        }));
        this.eventTypes = visitors.map((data) => ({
          value: data.eventType,
          text: data.eventType.removeUnderscore().capitalize(),
        }));
        this.eventTypes.unshift({ value: "all", text: "All Actions" });
        this.filteredVisitors = this.visitors;
        this.filterByEventType();
        this.loadingAnalytics = false;
      } catch (error) {
        console.log(error);
      }
    },
    async exportQuery() {
      const selectedExportOptions = Object.entries(this.exportOptions).map(
        ([key, value]) => {
          if (key) return value.selected;
        }
      );
      const hasExportOptions = selectedExportOptions.some(
        (selected) => selected
      );
      if (!hasExportOptions) {
        this.selectDataError = "Please select the data you'd like to export.";
        return;
      }
      this.exportDialog = false;
      this.exportingQuery = true;
      let startDate = this.dateRange[0] || "",
        endDate = this.dateRange[1] || "";

      if (endDate && moment(startDate).isAfter(endDate)) {
        this.dateRange = [endDate, startDate];
        startDate = this.dateRange[0] || "";
        endDate = this.dateRange[1] || "";
      }

      this.$refs.dateRangeMenu.save(this.dateRange);
      const baseParcel = this.baseParcel.split(","),
        x = baseParcel[0],
        y = baseParcel[1];

      let queryString = `?startDate=${startDate}&endDate=${endDate}&eventType=${this.eventTypeFilter}`;
      let hasEventFilter = this.eventTypeFilter !== "all";
      let fileName = `_${startDate ? startDate : ""}${
        startDate && endDate ? "-" + endDate : ""
      }${hasEventFilter ? "-" + this.eventTypeFilter : ""}`;
      Object.entries(this.exportOptions).forEach(([key, value]) => {
        if (value.selected) {
          queryString += `&${key}=${value.selected}`;
        }
      });

      try {
        const response = await fetch(
          `${process.env.VUE_APP_API_URL}/analytics/export/${x}/${y}${queryString}`
        );
        const responseText = await response.text();
        downloadCsv(`vlm_analytics${fileName}.csv`, responseText);

        this.exportingQuery = false;
      } catch (error) {
        this.exportingQuery = false;
        console.log(error);
      }
    },
    filterByEventType() {
      if (this.eventTypeFilter == "all") {
        this.filteredVisitors = this.visitors;
      } else if (this.eventTypeFilter) {
        this.filteredVisitors = this.visitors.filter(
          (data) => data.eventType == this.eventTypeFilter
        );
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
