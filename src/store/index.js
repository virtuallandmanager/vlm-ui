import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import admin from './modules/admin'
import analytics from './modules/analytics'
import auth from './modules/auth'
import balances from './modules/balances'
import banner from './modules/banner'
import channels from './modules/channels'
import collectables from './modules/collectables'
import dialog from './modules/dialog'
import event from './modules/event'
import feature from './modules/feature'
import giveaway from './modules/giveaway'
import i18n from './modules/i18n'
import logs from './modules/logs'
import media from './modules/media'
import scene from './modules/scene'
import stream from './modules/stream'
import moderation from './modules/moderation'
import organization from './modules/organization'
import user from './modules/user'
import video from './modules/video'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    admin,
    analytics,
    auth,
    balances,
    banner,
    channels,
    collectables,
    dialog,
    event,
    feature,
    giveaway,
    i18n,
    logs,
    media,
    scene,
    stream,
    moderation,
    organization,
    user,
    video,
  },
})
