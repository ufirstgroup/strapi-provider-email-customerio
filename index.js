const { APIClient, SendEmailRequest, RegionEU } = require('customerio-node')

/* eslint-disable fp/no-mutation */
module.exports = {
  init: (providerOptions, _settings) => {
    const api = new APIClient(providerOptions.apiKey, { region: RegionEU })

    return {
      send: async (options) => {
        const { to, subject, text } = options // subject is used as message identifier, text shall contain link (pw-reset, invite, ...)
        // extremely dirty due to limited configuration options in wowi_backoffice/config/usersAndPermissions/mailConfig.ts
        // This is because strapi transforms the ? into $1
        // please feel to workaround this differently
        const normalisedText = subject === 'confirm_fe_email' ? text.replace('EMAIL_CONFIRM_PARAM_NAME', '?confirmation=') : text

        const request = new SendEmailRequest({
          to,
          transactional_message_id: subject,
          message_data: {
            link: normalisedText
          },
          identifiers: {
            email: to,
          },
        })

        api
          .sendEmail(request)
          .then((res) => console.log(JSON.stringify({ key: 'Customerio Transactional API', text: `code: ${JSON.stringify(res)}` })))
          .catch((err) => console.error(JSON.stringify({ key: 'Customerio Transactional API', text: `code: ${err.statusCode}, message: ${err.message}` })))
      },
    }
  },
}

// https://docs.strapi.io/developer-docs/latest/development/providers.html#creating-providers
// https://github.com/customerio/customerio-node#transactional-api
// https://github.com/strapi/strapi/blob/main/packages/providers/email-sendgrid/lib/index.js
