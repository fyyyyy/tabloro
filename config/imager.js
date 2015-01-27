
/**
 * Expose
 */

module.exports = {
  variants: {
    article: {
      resize: {
        detail: 'x440',
        mini: '252x210>'
      }
    },

    gallery: {
      crop: {
        thumb: '100x100'
      }
    },

    piece: {
      resize: {
        original: '100%',
        detail: 'x300>'
      },
      resizeAndCrop: {
        mini: { resize: '63504@', crop: '252x210' }
      }
    },

    box: {
      resize: {
        detail: 'x300>',
        mini: '252x210'
      }
    }
  },

  storage: {
    Local: {
      path: '/tmp',
      mode: 0777
    },
    S3: {
      key: process.env.IMAGER_S3_KEY,
      secret: process.env.IMAGER_S3_SECRET,
      bucket: process.env.IMAGER_S3_BUCKET,
      region: 'us-standard'
    }
  },

  // region: 'Frankfurt',

  debug: true
};
