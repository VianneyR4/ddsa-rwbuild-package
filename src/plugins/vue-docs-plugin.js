// see https://stackoverflow.com/questions/74763160/how-to-make-vite-ignore-docs-blocks
export default {
  name: 'vue-docs',
  transform(_code, id) {
    if (!/vue&type=docs/.test(id)) return
    return `export default ''`
  }
}
