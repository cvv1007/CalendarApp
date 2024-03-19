module.exports = {   
    collectCoverage: true,
    collectCoverageFrom: [
        "./**/*.js"
    ],
    coverageReporters: [
        "text",
        "html"
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/coverage/',
        'jest.config.js'
    ],
};
      