<template>
  <gantt-component :input="src" @change="update($event)"></gantt-component>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import Gantt from "./gantt.vue";

export default defineComponent({
  props: {
    input: String
  },
  emits: ["change"],

  data() {
    return {};
  },
  computed: {
    src() {
      if (this.input === undefined) {
        return "";
      }

      const firstRowEndPos = this.input.indexOf("\n", 0);
      return this.input.substr(firstRowEndPos + 1);
    }
  },
  methods: {
    update(src: string) {
      this.$emit("change", src);
    }
  },
  mounted() { },
  components: {
    GanttComponent: Gantt
  }
})
</script>
<style></style>