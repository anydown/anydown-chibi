<template>
  <div class="markdown-body">
    <component :is="block.type" :input="block.text" v-for="block in blocks" :key="block.id"
      @change="onChange($event, block)">
    </component>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MarkdownBlock from "./MarkdownBlock.vue";
import CodeBlockKanban from "./CodeBlockKanban.vue";
import CodeBlockGantt from "./CodeBlockGantt.vue";
import CodeBlockPre from "./CodeBlockPre.vue";

interface Block {
  id: string;
  type: string;
  text: string;
}

export default defineComponent({
  props: ["blocks"],
  emits: ["change"],
  methods: {
    onChange(ev: string, block: Block) {
      this.$emit("change", {
        id: block.id,
        type: block.type,
        body: ev
      });
    }
  },
  components: {
    markdown: MarkdownBlock,
    kanban: CodeBlockKanban,
    gantt: CodeBlockGantt,
    plain: CodeBlockPre
  }
})
</script>

<style></style>