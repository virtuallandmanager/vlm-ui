<template>
  <v-container>
    <!-- Organization Creation -->
    <div v-if="!organization">
      <v-card class="mb-5">
        <v-card-title>{{ localeText('Create Organization') }}</v-card-title>
        <v-card-text>
          <v-form ref="orgForm" v-model="orgFormValid">
            <v-text-field
              v-model="organizationName"
              :rules="[(v) => !!v || 'Name is required']"
              :label="localeText('Organization Name')"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled="!orgFormValid" color="primary" @click="createOrganization"> {{ localeText('Create Organization') }} </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- Organization Management -->
    <div v-else>
      <!-- Organization Details -->
      <v-card class="mb-5">
        <v-card-title>
          {{ organization.name }}
          <v-spacer></v-spacer>
          <v-btn icon @click="editOrganizationName = true">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </v-card-title>
      </v-card>

      <!-- Edit Organization Name Dialog -->
      <v-dialog v-model="editOrganizationName" max-width="500px">
        <v-card>
          <v-card-title>{{ localeText('Edit Organization Name') }}</v-card-title>
          <v-card-text>
            <v-form ref="editOrgForm" v-model="editOrgFormValid">
              <v-text-field
                v-model="organizationName"
                :rules="[(v) => !!v || 'Name is required']"
                :label="localeText('Organization Name')"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn text @click="editOrganizationName = false">{{ localeAction('cancel') }}</v-btn>
            <v-btn :disabled="!editOrgFormValid" color="primary" @click="updateOrganizationName"> {{ localeAction('save') }} </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Invite Users -->
      <v-card class="mb-5">
        <v-card-title>{{ localeText('Invite Organization Member') }}</v-card-title>
        <v-card-text>
          <v-form ref="inviteForm" v-model="inviteFormValid">
            <v-text-field
              v-model="inviteAddress"
              :rules="[(v) => !!v || 'Wallet address is required']"
              label="Staff Member Wallet Address"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled="!inviteFormValid" color="primary" @click="inviteUser"> {{ localeText('Send Invitation') }} </v-btn>
        </v-card-actions>
      </v-card>

      <!-- User List -->
      <v-card>
        <v-card-title>{{ localeText('Organization Members') }}</v-card-title>
        <v-data-table :headers="userHeaders" :items="organizationUsers" class="elevation-1">
          <template v-slot:item.role="{ item }">
            <v-select v-model="item.role" :items="roles" label="Role" @change="updateUserRole(item)"></v-select>
          </template>
        </v-data-table>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      // Organization Data
      organization: null,
      organizationName: '',
      editOrganizationName: false,
      orgFormValid: false,
      editOrgFormValid: false,

      // Invite User
      inviteAddress: '',
      inviteFormValid: false,

      // Users
      organizationUsers: [],
      userHeaders: [
        { text: 'Name', value: 'name' },
        { text: 'Wallet Address', value: 'walletAddress' },
        { text: 'Role', value: 'role' },
      ],
      roles: ['Admin', 'Editor', 'Viewer'],
    }
  },
  computed: {
    ...mapGetters({
      localeText: 'i18n/organization',
      localeAction: 'i18n/actions',
    }),
  },
  methods: {
    createOrganization() {
      // Simulate API call to create organization
      this.organization = {
        name: this.organizationName,
        id: Date.now(),
      }
      this.organizationName = ''
    },
    updateOrganizationName() {
      // Simulate API call to update organization name
      this.organization.name = this.organizationName
      this.editOrganizationName = false
    },
    inviteUser() {
      // Simulate sending an invitation to the wallet address
      this.organizationUsers.push({
        name: 'Pending User',
        walletAddress: this.inviteAddress,
        role: 'Viewer',
      })
      this.inviteAddress = ''
    },
    updateUserRole(user) {
      // Simulate API call to update user role
      console.log(`Updated ${user.walletAddress} role to ${user.role}`)
    },
  },
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
