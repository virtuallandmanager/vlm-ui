<template>
  <div>
    <edit-select-dialog
      v-if="editingSelections"
      :selections="customization.selections"
      v-model="editingSelections"
      @onChange="editCustomization()"
    />
    <delete-dialog
      v-model="deleteDialog"
      :entity="customization"
      entityType="customization"
      :removeAll="true"
      @onRemove="removeCustomization()"
    />
    <div class="grey darken-3 dark pa-6">
      <div class="d-flex justify-space-between">
        <div class="text-h5 white--text" v-if="!editingName">
          {{ customization.name }}
          <v-btn icon small dark @click="toggleEditMode()">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </div>
        <div class="text-h5" v-if="editingName">
          <v-text-field
            autofocus
            dark
            label="Customization Name"
            v-model="customization.name"
            hide-details="auto"
            append-outer-icon="mdi-content-save"
            @click:append-outer="toggleEditMode()"
            @blur="toggleEditMode()"
            dense
          ></v-text-field>
        </div>
        <div>
          <v-select
            dark
            label="Customization Type"
            :items="customizationTypes"
            hide-details="auto"
            v-model="customization.type"
            :disabled="locked"
            @change="changeCustomizationType()"
          >
          </v-select>
        </div>
        <div>
          <v-text-field
            dark
            label="Customization Id"
            v-model="customization.id"
            hide-details="auto"
            :disabled="locked"
            @blur="editCustomization()"
          ></v-text-field>
        </div>
        <div>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                dark
                color="gray"
                @click="toggleCustomizationLock()"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>{{ locked ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ locked ? 'Unlock' : 'Lock' }} Customization Settings</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                dark
                color="gray"
                @click="openDeleteDialog()"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </template>
            <span>Remove Customization</span>
          </v-tooltip>
        </div>
      </div>
    </div>
    <div class="blue-grey lighten-5 pa-4">
      <v-switch
        v-if="customization.type == 0"
        v-model="customization.value"
        hide-details
        class="mt-0"
        @change="editCustomization()"
        ><template v-slot:label>
          <div class="text-body">
            {{ customization.name }} is
            <strong
              :class="customization.value ? 'green--text' : 'red--text'"
              >{{ customization.value ? 'Enabled' : 'Disabled' }}</strong
            >
          </div>
        </template></v-switch
      >
      <v-text-field
        v-if="customization.type == 1"
        v-model="customization.value"
        :label="`${customization.name} Value`"
        @change="editCustomization()"
      ></v-text-field>

      <div
        class="d-flex align-center justify-space-between"
        v-if="customization.type == 2"
      >
        <v-select
          :items="customizationSelections"
          v-model="customization.value"
          :label="`${customization.name} State`"
          hide-details="auto"
          @change="editCustomization()"
        ></v-select>
        <v-btn
          class="ml-4"
          :disabled="locked"
          @click.stop="openEditSelectDialog"
        >
          Edit Selections
        </v-btn>
      </div>
      <div class="d-flex justify-center">
        <v-btn
          v-if="customization.type == 3"
          color="green"
          dark
          @click="triggerCustomization()"
          >Trigger {{ customization.name }}</v-btn
        >
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions } from 'vuex'
import DeleteDialog from './dialogs/DeleteDialog'
import { SceneCustomization } from '../models/SceneCustomization'
import EditSelectDialog from '../components/dialogs/EditSelectDialog'

export default {
  components: {
    EditSelectDialog,
    DeleteDialog
  },
  name: 'SceneCustomization',
  data: () => ({
    editingName: false,
    editingSelections: false,
    deleteDialog: false,
    customizationTypes: [
      { text: 'Toggle', value: 0 },
      { text: 'Text', value: 1 },
      { text: 'Selector', value: 2 },
      { text: 'Trigger', value: 3 }
    ],
    locked: false
  }),
  props: {
    customization: {
      type: Object,
      default: function () {
        return new SceneCustomization()
      }
    }
  },
  mounted () {
    this.locked = this.customization.locked
  },
  computed: {
    customizationSelections () {
      return this.customization.selections.map(customization => ({
        text: `${customization.text}  [ id: ${customization.value} ]`,
        value: customization.value
      }))
    }
  },
  methods: {
    ...mapActions({
      uploadImage: 'image/uploadImage'
    }),
    removeCustomization () {
      this.$emit('onRemove')
    },
    editCustomization () {
      this.updateProperties({
        action: 'update',
        entity: 'customization',
        id: this.customization.id,
        customizationData: this.customization
      })
    },
    triggerCustomization () {
      this.customization.value = true;
      this.updateProperties({
        action: 'update',
        entity: 'customization',
        id: this.customization.id,
        customizationData: this.customization
      })
    },
    openEditSelectDialog () {
      this.editingSelections = true
    },
    openDeleteDialog () {
      this.deleteDialog = true
    },
    toggleEditMode () {
      this.editingName = !this.editingName

      if (!this.editingName && !this.locked) {
        this.customization.id = this.customization.name.createSlug()
      }
      
      this.editCustomization()
    },
    changeCustomizationType () {
      if (this.customization.type == 0) {
        this.customization.value = false
      } else if (this.customization.type == 1) {
        this.customization.value = ''
      }
      this.editCustomization()
    },
    toggleCustomizationLock () {
      this.locked = !this.locked
      Vue.set(this.customization, 'locked', this.locked)
      this.editCustomization()
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', { ...wssMessages })
    }
  }
}
</script>
