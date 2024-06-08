<template>
  <div class="kanban" @blur="onBlur" tabindex="0" @keydown.exact="globalKeydown" @keydown.ctrl.67="onCopy"
    @keydown.ctrl.86="onPaste" @keydown.ctrl.88="onCut">
    <div v-if="compiled.length === 0" class="kanban__col">
      <button @click="addColumn">New Column</button>
    </div>
    <draggable v-if="compiled.length > 0" v-model="compiled" group="everykanbanCol" @change="onEnd"
      style="display: flex; flex: 1; position: relative;" handle=".kanban__col-title" ghost-class="ghost"
      @start="drag = true" @end="drag = false" item-key="id">
      <template #item="{ element: col, index: colIndex }">
        <div class="kanban__col" @click.exact="addSelectionCol(colIndex, false)"
          @click.ctrl="addSelectionCol(colIndex, true)" :class="{ selected: isSelectedCol(colIndex) }"
          @dblclick="addTaskByDblclick(colIndex, $event)">
          <div class="kanban__col__add" @click="addTask(colIndex)">
            <svg style="cursor: pointer;" width="20" height="20">
              <g transform="translate(0.5, 0.5)">
                <line x1="10" x2="10" y1="5" y2="15" stroke="ForestGreen" />
                <line x1="5" x2="15" y1="10" y2="10" stroke="ForestGreen" />
              </g>
            </svg>
          </div>
          <div class="kanban__col-title" @dblclick="editTitle(colIndex)">
            <span v-if="editingTitleCol !== colIndex">{{ col.name }}</span>
            <form v-if="editingTitleCol === colIndex" @submit.prevent="endEditingTitle(colIndex)" style="margin: 0;">
              <input class="kanban__col__input" v-model="editingTitleColText" @blur="endEditingTitle(colIndex)" />
            </form>
          </div>
          <div class="kanban__wrapper">
            <draggable v-model="col.cards" group="everykanban" class="draggable--max" @change="onEnd"
              ghost-class="ghost" @start="drag = true" @end="drag = false" item-key="id">
              <template #item="{ element: card, index }">
                <div class="kanban__row" @dblclick="startEditing(colIndex, index)"
                  @click.exact.stop="addSelectionCard(colIndex, index, false)"
                  @click.ctrl.stop="addSelectionCard(colIndex, index, true)"
                  :class="{ selected: isSelectedCard(colIndex, index) }">
                  <div class="kanban__row__remove" @click="removeTask(colIndex, index)">×</div>
                  <div class="kanban__row__label" v-if="!(editingCol === colIndex && editingIndex === index)"
                    v-text="card.name">
                  </div>
                  <form v-if="editingCol === colIndex && editingIndex === index"
                    @submit.prevent="endEditingAndNew(colIndex, index)" style="margin: 0;">
                    <input class="kanban__row__input" v-model="editingText" @blur="endEditing(colIndex, index)" />
                  </form>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </template>
    </draggable>
    <div class="addColumnHit">
      <div class="addColumn" @click="addColumn">
        <div>+</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import draggable from "vuedraggable";
import * as compiler from "./kanban-compiler";

export default defineComponent({
  props: {
    input: {
      type: String,
      required: true
    }
  },
  emits: ["change"],
  data() {
    return {
      compiled: [] as compiler.Kanban[],
      editingText: "",
      editingTitleColText: "",
      editingTitleCol: -1,
      editingCol: -1,
      editingIndex: -1,
      selectedCol: [] as number[],
      selectedCards: { col: -1, cards: [] },
      copied: null as { type: string; data: any } | null,
      drag: false,
    };
  },
  watch: {
    input() {
      this.compiled = compiler.compileKanban(this.input);
    }
  },
  computed: {
    output() {
      this.compiled.join();
    },
    editing() {
      return (
        this.editingTitleCol >= 0 ||
        this.editingCol >= 0 ||
        this.editingIndex >= 0
      );
    }
  },
  components: {
    draggable
  },
  mounted() {
    this.compiled = compiler.compileKanban(this.input);
  },
  methods: {
    globalKeydown(ev: KeyboardEvent) {
      if (ev.key === "Delete") {
        this.onRemove();
      }
    },
    onBlur() {
      this.selectedCol = [];
      this.selectedCards = { col: -1, cards: [] };
    },
    onRemove() {
      for (var i = this.selectedCol.length; i > 0; i--) {
        this.removeColumn(this.selectedCol[i - 1]);
      }
      if (this.selectedCards.col >= 0) {
        for (var i = this.selectedCards.cards.length; i > 0; i--) {
          this.removeTask(
            this.selectedCards.col,
            this.selectedCards.cards[i - 1]
          );
        }
      }
      this.selectedCol = [];
      this.selectedCards = { col: -1, cards: [] };
    },
    onCut() {
      if (this.editing) {
        return;
      }
      this.onCopy();
      this.onRemove();
    },
    onCopy() {
      if (this.editing) {
        return;
      }
      if (this.selectedCol.length > 0) {
        const copied = this.compiled.filter((i, idx) => {
          return this.selectedCol.indexOf(idx) >= 0;
        });
        this.copied = {
          type: "column",
          data: JSON.parse(JSON.stringify(copied))
        };
      }
      if (this.selectedCards.col >= 0) {
        const copied = this.compiled[this.selectedCards.col].cards.filter(
          (i, idx) => {
            return this.selectedCards.cards.indexOf(idx) >= 0;
          }
        );
        this.copied = {
          type: "cards",
          data: JSON.parse(JSON.stringify(copied))
        };
      }
    },
    onPaste() {
      if (this.editing) {
        return;
      }

      //カラム選択中
      if (this.selectedCol.length > 0 && this.copied) {
        const lastIndex = this.selectedCol[this.selectedCol.length - 1];
        if (this.copied.type === "column") {
          this.compiled.splice(lastIndex + 1, 0, ...this.copied.data);
        }
        if (this.copied.type === "cards") {
          const selectedColumnChildren = this.compiled[lastIndex].cards;
          selectedColumnChildren.splice(
            selectedColumnChildren.length,
            0,
            ...this.copied.data
          );
        }

        this.$emit("change", compiler.serializeKanban(this.compiled));
      }

      //カード選択中
      if (
        this.selectedCards.col >= 0 &&
        this.copied &&
        this.copied.type === "cards"
      ) {
        const lastIndex = this.selectedCards.cards[
          this.selectedCards.cards.length - 1
        ];
        this.compiled[this.selectedCards.col].cards.splice(
          lastIndex + 1,
          0,
          ...this.copied.data
        );
        this.$emit("change", compiler.serializeKanban(this.compiled));
      }
    },
    addSelectionCol(col: number, multiple: boolean) {
      this.selectedCards = {
        col: -1,
        cards: []
      };
      if (!multiple) {
        this.selectedCol = [];
      }
      this.selectedCol.push(col);
      this.selectedCol.sort();
    },
    isSelectedCol(selectedCol: number) {
      return this.selectedCol.indexOf(selectedCol) >= 0;
    },
    isSelectedCard(selectedCol: number, cardIndex: number) {
      return (
        this.selectedCards.col === selectedCol &&
        this.selectedCards.cards.indexOf(cardIndex) >= 0
      );
    },
    addSelectionCard(col: number, card: number, multiple: boolean) {
      this.selectedCol = [];
      if (!multiple) {
        this.selectedCards.cards = [];
      }
      this.selectedCards.col = col;
      this.selectedCards.cards.push(card);
      this.selectedCards.cards.sort();
    },
    addColumn() {
      this.compiled.push({
        name: "New Column",
        cards: [],
        id: Math.random()
      });
      this.$emit("change", compiler.serializeKanban(this.compiled));
    },
    removeColumn(idx: number) {
      this.compiled.splice(idx, 1);
      this.$emit("change", compiler.serializeKanban(this.compiled));
    },
    onEnd() {
      this.$emit("change", compiler.serializeKanban(this.compiled));
    },
    startEditing(col: number, row: number) {
      const oldData = this.compiled[col].cards[row];
      this.editingCol = col;
      this.editingIndex = row;
      this.editingText = oldData.name;
      this.$nextTick(() => {
        const el = this.$el.querySelector(".kanban__row__input");
        if (el) {
          el.focus();
        }
      });
    },
    endEditing(col: number, row: number) {
      if (this.editingText === "") {
        this.removeTask(col, row);
      } else {
        this.compiled[col].cards[row].name = this.editingText
        this.$emit("change", compiler.serializeKanban(this.compiled));
      }
      this.editingCol = -1;
      this.editingIndex = -1;
    },
    endEditingAndNew(col: number, row: number) {
      this.endEditing(col, row);
      //for VSCode webview hack, I really want to remove this timeout
      setTimeout(() => {
        this.addTask(col);
      }, 100);
    },
    addTask(col: number) {
      this.compiled[col].cards.push({ name: "", id: Math.random() });
      this.startEditing(col, this.compiled[col].cards.length - 1);
    },
    addTaskByDblclick(col: number, ev: MouseEvent) {
      // because of we use vue-draggable
      const target = ev.target as HTMLElement;

      if (target.classList.contains("draggable--max")) {
        this.addTask(col);
      }
    },
    removeTask(col: number, row: number) {
      const oldData = this.compiled[col].cards[row];
      delete this.compiled[col].cards[row];
      this.$emit("change", compiler.serializeKanban(this.compiled));
    },
    editTitle(col: number) {
      this.editingTitleCol = col;
      const oldData = this.compiled[col].name;
      this.editingTitleColText = oldData;
      this.$nextTick(() => {
        const el = this.$el.querySelector(".kanban__col__input");
        if (el) {
          el.focus();
          el.setSelectionRange(0, el.value.length);
        }
      });
    },
    endEditingTitle(col: number) {
      if (this.editingTitleColText === "") {
        this.editingTitleCol = -1;
      } else {
        this.compiled[col].name = this.editingTitleColText;
        this.$emit("change", compiler.serializeKanban(this.compiled));
        this.editingTitleCol = -1;
      }
    }
  }
})
</script>
<style>
.draggable--max {
  flex: 1;
}

.kanban {
  display: flex;
  margin: 0 -0.5rem;
  overflow-x: hidden;
  outline: none;
  user-select: none;
}

.kanban__col {
  flex: 1;
  margin: 0.5rem;
  padding: 0.5rem;
  background: #f5f5f5;
  text-align: center;
  position: relative;
  border: 1px solid #f5f5f5;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
}

.kanban__col.selected {
  box-sizing: border-box;
  border: 1px solid #666;
}

.kanban__col-title {
  font-size: 0.8rem;
  font-weight: 900;
  color: #888888;
  cursor: pointer;
  margin-top: 4px;
}

.kanban__row:hover>.kanban__row__remove {
  display: block;
}

.kanban__col__add {
  position: absolute;
  top: 10px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 4px;
  border: 1px solid #999;
  color: forestgreen;
  cursor: pointer;
}

.kanban__col__add:hover {
  background: #eee;
}

.kanban__row__remove {
  display: none;
  position: absolute;
  top: 8px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  color: #888888;
  cursor: pointer;
  text-align: center;
  line-height: 20px;
}

.kanban__row__remove:hover {
  color: #ff3333;
}

.kanban__row {
  margin: 0.5rem 0 0 0;
  padding: 0.5rem 0.75rem;
  text-align: left;
  background: #fefefe;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.16), 0 2px 4px 0 rgba(0, 0, 0, 0.12);
  cursor: pointer;
  border-radius: 3px;
  line-height: 1.6rem;
  word-break: break-all;
  position: relative;
  border: 1px solid #fefefe;
  box-sizing: border-box;
}

.kanban__row.selected {
  border: 1px solid #666;
}

.kanban__row__input {
  font-size: 1rem;
  font-family: inherit;
  width: 100%;
}

.kanban__row__label {
  min-height: 1.5rem;
}

.kanban__wrapper {
  min-height: 10rem;
  padding-top: 4px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.addColumnHit {
  position: relative;
  width: 10px;
}

.addColumn {
  transition: all ease 0.2s;
  color: white;
  height: 100%;
  width: 32px;
  text-align: center;
  position: absolute;
  top: 0;
  right: -24px;
  opacity: 0.2;
  background: gray;
  border-radius: 20px 0 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.addColumnHit:hover .addColumn {
  right: -4px;
  opacity: 1;
}

.ghost {
  opacity: 0.2;
}
</style>