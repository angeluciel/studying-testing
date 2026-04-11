import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
        globalSetup: "./src/modules/globalSetup.ts",
        setupFiles: ["./src/modules/setup.ts"],
        coverage: {
            provider: 'v8'
        }
    }
})