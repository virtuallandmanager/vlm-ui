<template>
  <content-page loadingMessage="Loading the admin panel..." :loading="loading" :noContent="false">
    <template v-slot:header>Admin Panel</template>
    <template v-slot:header-actions>
      <!-- <v-menu offset-y :close-on-content-click="true">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on" class="mr-4">
            <v-icon class="mr-2">mdi-filter</v-icon
            >{{ filterTypes[filterType].text }}
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="(filter, index) in filterTypes"
            :key="index"
            @click="changeFilterType(filter)"
          >
            <v-list-item-content>
              {{ filter.text }}
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu> -->
      <!-- <v-menu offset-y :close-on-content-click="true">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on" class="mr-4">
            <v-icon class="mr-2">mdi-account</v-icon>
            {{ eventOwners[activeOwner].text }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(owner, index) in owners"
            :key="index"
            @click="changeAdminScope(owner)"
          >
            <v-list-item-content>
              {{ owner.text }}
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu> -->
      <!-- <v-menu :close-on-content-click="true" v-model="sortTypes[0]">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on">
            <v-icon class="mr-2">mdi-sort</v-icon>{{ sortTypes[sortType].text }}
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="(sort, index) in sortTypes"
            :key="index"
            v-model="sortType"
          >
            <v-list-item-title @click="changeSortType(sort.value)">{{
              sort.text
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->
    </template>
    <v-card>
      <v-card-title>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
      </v-card-title>
      <v-data-table :headers="userHeaders" :items="composite" group-by="group" :items-per-page="100" :search="search">
        <template v-slot:item.actions="{ item }">
          <v-btn small color="primary" @click="editItem(item)"> <v-icon small class="mr-1"> mdi-pencil </v-icon> Edit </v-btn>
        </template></v-data-table
      >
    </v-card>
  </content-page>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ContentPage from "../components/ContentPage.vue";
import router from "../router";

export default {
  name: "AdminPanel",
  components: { ContentPage },
  data: () => ({
    search: "",
    userHeaders: [
      {
        text: "Display Name",
        align: "start",
        value: "name",
      },
      { text: "Email Address", value: "emailAddress" },
      { text: "SMS", value: "smsPhoneNumber.formattedNumber" },
      { text: "Last IP Address", value: "lastIp" },
      { text: "First Connected", value: "createdAt" },
      { text: "Registration Date", value: "registeredAt" },
      { text: "Category", value: "group" },
      { text: "Edit", value: "actions" },
    ],
  }),
  beforeRouteEnter(to, from, next) {
    const isAuthenticated = this.$store.getters["auth/authenticated"];
    const isAdmin = this.$store.getters["user/isVlmAdmin"];

    if (!isAuthenticated || !isAdmin) {
      next("/"); // Redirect to the login page if the user is not authenticated
    } else {
      this.getAdminPanelKeys();
      next(); // Continue rendering the component
    }
  },
  computed: {
    ...mapGetters({
      demoMode: "app/demoMode",
      adminUsers: "admin/users",
      adminOrgs: "admin/organizations",
      adminScenes: "admin/scenes",
      adminEvents: "admin/events",
      userSessions: "admin/userSessions",
      analyticsSessions: "admin/analyticsSessions",
    }),
    composite() {
      const users = this.adminUsers?.map((user) => ({
          ...user,
          name: user.displayName,
          group: "Users",
        })),
        orgs = this.adminOrgs?.map((org) => ({
          ...org,
          name: org.displayName,
          group: "Organizations",
        })),
        scenes = this.adminScenes?.map((scene) => ({
          ...scene,
          group: "Scenes",
        })),
        events = this.adminEvents?.map((event) => ({
          ...event,
          group: "Events",
        })),
        userSessions = this.userSessions?.map((event) => ({
          ...event,
          group: "VLM User Sessions",
        })),
        analyticsSessions = this.analyticsSessions?.map((event) => ({
          ...event,
          group: "Metaverse Sessions",
        }));
      return [...users, ...orgs, ...scenes, ...events, ...userSessions, ...analyticsSessions];
    },
    loading() {
      return this.$store.state?.admin?.processing;
    },
  },
  methods: {
    editItem(item) {
      if (item.group == "Events") {
        router.push(`event/${item.sk}`);
      }
    },
    ...mapActions({
      getAdminPanelKeys: "admin/getAdminPanelKeys",
      showError: "banner/showError",
    }),
  },
};
</script>
