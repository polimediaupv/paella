
export function getPluginContext() {
    return require.context("./plugins", true, /\.js/)
}
