module.exports = {
  hooks: {
    'pre-commit': 'yarn lint && yarn build',
    'pre-push': 'yarn lint'
  }
}
