module.exports = {
  ci: {
    collect: {
      // 1. The URL of your map (once deployed to a dev/staging environment)
      url: ['https://your-dev-site.com/map'],

      // 2. Number of runs (3-5 is best to get an average and avoid "fluky" results)
      numberOfRuns: 3,

      // 3. Settings for heavy Map components
      settings: {
        preset: 'desktop', // Maps are often tested on desktop first
        chromeFlags: '--no-sandbox',
        // Optional: Simulate a slower API by throttling
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      // 4. This is where you define "Pass/Fail" for Xray
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }], // Fail if under 80%
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }], // Warn if > 2s
        interactive: ['error', { maxNumericValue: 5000 }], // Fail if map takes > 5s to be usable
      },
    },
    upload: {
      // 5. Where the report goes (local is best for CI/CD to Xray)
      target: 'filesystem',
      outputDir: './lhci-reports',
    },
  },
}
