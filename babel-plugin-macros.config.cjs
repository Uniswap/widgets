const isDev = process.env.NODE_ENV !== 'production'
console.log('zzmp', isDev)

module.exports = {
  styledComponents: {
    fileName: isDev,
    displayName: isDev,
  },
}
