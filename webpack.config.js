import {DEV_FOLDER} from "./config"

export const webpackConfig = {
    mode: 'development',
    watch: false,
    entry: {
        app: DEV_FOLDER + '/js/app.js',
    },
    output: {
        filename: '[name].js',
    }
}