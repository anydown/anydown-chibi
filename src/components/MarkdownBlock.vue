<template>
  <div class="markdown-block" v-html="compiledMarkdown"></div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import MarkdownIt from "markdown-it";
const md = new MarkdownIt();

export default defineComponent({
  props: {
    input: String
  },
  computed: {
    compiledMarkdown: function () {
      if (!this.input) return "";
      return md.render(this.input);
    }
  }
});
</script>
<style>
.markdown-block {
  min-height: 1rem;
}
</style>