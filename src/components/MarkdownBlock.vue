<template>
  <div class="markdown-block" v-html="compiledMarkdown"></div>
</template>
<script>
import MarkdownIt from "markdown-it";
const md = new MarkdownIt();

export default {
  props: {
    input: String
  },
  computed: {
    compiledMarkdown: function () {
      return md.render(this.input);
    }
  }
};
</script>
<style>
.markdown-block {
  min-height: 1rem;
}
</style>