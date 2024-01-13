import * as logDal from '../dal/logs'
export default {
  namespaced: true,
  state: () => ({
    showBugReport: false,
  }),
  getters: {
    showBugReport: (state) => state.showBugReport,
  },
  mutations: {
    SET_BUG_REPORT_DIALOG(state, show) {
      state.showBugReport = show
    },
  },
  actions: {
    toggleBugReportDialog: ({ commit }, show) => {
      commit('SET_BUG_REPORT_DIALOG', show)
    },
    submitBugReport: async ({ rootGetters }, { message, reproduction, stack, url, line, column, error, userContactInfo }) => {
      try {
        const userInfo = rootGetters['user/userInfo']
        const payload = {
          message,
          reproduction,
          stack,
          url,
          line,
          column,
          error,
          userContactInfo,
        }
        payload.discordMessage = `
        # :lady_beetle: -- USER-REPORTED ERROR REPORTED FROM ${process.env.VUE_APP_NODE_ENV.toUpperCase()} ENVIRONMENT -- :lady_beetle:\n
        <@&1041552453918801973>\n
        TIME:\n
        **${new Date().toLocaleString()}**\n\n
        FROM URL:\n
        \`\`\`${url}\`\`\`\n
        BUG REPORT:\n
        \`\`\`json\n${message}\n\`\`\`\n
        REPRO STEPS:\n
        \`\`\`json\n${reproduction}\n\`\`\`\n`

        payload.discordMessage += userInfo.sk ? `FROM: ${userInfo.displayName} (${userInfo.sk})\n\n` : `FROM GUEST USER\n\n`
        payload.discordMessage += payload.userContactInfo?.contactUser ? `## CONTACT USER: YES\n\n` : `CONTACT USER: NO\n\n`
        payload.discordMessage +=
          payload.userContactInfo?.contactUser && payload.userContactInfo?.contactInfo
            ? `CONTACT INFO:\n
          \`\`\`json\n${payload.userContactInfo.contactInfo}\n\`\`\`\n`
            : ''

        payload.discordMessage += `# :lady_beetle: -- END ERROR -- :lady_beetle:\n`
        console.log('Logging bug report', payload)
        await logDal.logWAT(payload)
      } catch (error) {
        console.error(error)
      }
    },
    logError: ({ rootGetters }, { log, metadata }) => {
      const payload = {
        userInfo: rootGetters['user/userInfo'],
        log,
        metadata,
      }

      logDal.logError(log, metadata, payload)
    },
    logWarning: ({ rootGetters }, { log, metadata }) => {
      const payload = {
        userInfo: rootGetters['user/userInfo'],
        log,
        metadata,
      }

      logDal.logWarning(log, metadata, payload)
    },
    logInfo: ({ rootGetters }, { log, metadata }) => {
      const payload = {
        userInfo: rootGetters['user/userInfo'],
        log,
        metadata,
      }

      logDal.logInfo(log, metadata, payload)
    },
    logWAT: ({ rootGetters }, { log, metadata }) => {
      const payload = {
        userInfo: rootGetters['user/userInfo'],
        log,
        metadata,
      }

      logDal.logWAT(log, metadata, payload)
    },
  },
}
