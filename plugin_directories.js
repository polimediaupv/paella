export default [
    require.context("./src/js/plugins", true, /\.js/),
    require.context("./src/js/layouts", true, /\.js/),
    require.context("./src/js/videoFormats", true, /\.js/),
]