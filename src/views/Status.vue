<template>
  <v-container>
    <v-row>
      <v-col v-for="(server, index) in servers" :key="index" cols="12" md="4">
        <v-card>
          <v-card-title>{{ server.name }}</v-card-title>
          <v-card-subtitle>{{ server.url }}</v-card-subtitle>
          <v-card-text>
            <v-chip :color="server.status === 'Online' ? 'green' : 'red'">
              {{ server.status }}
            </v-chip>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="checkServerStatus(server, index)">Check Status</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      servers: [
        { name: "API Server", url: "https://api.vlm.gg/_health", status: "Unknown" },
        { name: "API Server 2", url: "https://api2.vlm.gg/_health", status: "Unknown" },
        // Add more servers as needed
      ],
    };
  },
  methods: {
    async checkServerStatus(server, index) {
      try {
        await axios.get(server.url);
        this.$set(this.servers, index, { ...server, status: "Online" });
      } catch (error) {
        this.$set(this.servers, index, { ...server, status: "Offline" });
      }
    },
  },
  mounted() {
    this.servers.forEach((server, index) => {
      this.checkServerStatus(server, index);
      setInterval(() => {
        this.checkServerStatus(server, index);
      }, 5000); // Check server status every 5 seconds
    });
  },
};
</script>
