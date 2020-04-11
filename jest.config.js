module.exports = {
    moduleNameMapper: {
        '^vue$': 'vue/dist/vue.common.js'
    },
    moduleFileExtensions: ['js', 'json'],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.js'
    ]
}
