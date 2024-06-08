<template>
  <gantt-component :input="src" @change="update($event)"></gantt-component>
</template>
<script>
import Gantt from "./gantt.vue";

export default {
  props: {
    input: String
  },
  data() {
    return {};
  },
  computed: {
    src() {
      const firstRowEndPos = this.input.indexOf("\n", 0);
      return this.input.substr(firstRowEndPos + 1);
    }
  },
  methods: {
    update(src) {
      this.$emit("change", src);
    }
  },
  mounted() { },
  components: {
    GanttComponent: Gantt
  }
};
</script>
<style></style>