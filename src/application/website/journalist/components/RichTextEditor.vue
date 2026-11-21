<script setup>
import { ref, watch, onBeforeUnmount, defineProps, defineEmits } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { api, errorMessage } from "../journalistApi";

const props = defineProps({
  modelValue: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);

const msg = ref("");
const uploading = ref(false);
const fileInput = ref(null);
const SIZES = [25, 50, 75, 100];
const toBn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

// Image with a width (a percentage of the article width), changed by dragging the corner handle
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const m = /width:\s*(\d+(?:\.\d+)?)%/.exec(el.getAttribute("style") || "");
          return m ? Math.round(parseFloat(m[1])) : null;
        },
        renderHTML: (attrs) => (attrs.width ? { style: `width: ${attrs.width}%` } : {}),
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let current = node;
      const dom = document.createElement("div");
      dom.className = "rimg";
      const img = document.createElement("img");
      const handle = document.createElement("span");
      handle.className = "rimg-handle";
      handle.title = "টেনে ছবির আকার বদলান";
      dom.append(img, handle);

      const apply = (n) => {
        img.src = n.attrs.src;
        img.alt = n.attrs.alt || "";
        dom.style.width = n.attrs.width ? `${n.attrs.width}%` : "";
      };
      apply(node);

      handle.addEventListener("pointerdown", (e) => {
        if (!editor.isEditable) return;
        e.preventDefault();
        e.stopPropagation();
        handle.setPointerCapture(e.pointerId);

        const parent = dom.parentElement;
        const cs = getComputedStyle(parent);
        const parentWidth = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const startX = e.clientX;
        const startWidth = dom.getBoundingClientRect().width;
        let pct = current.attrs.width || Math.round((startWidth / parentWidth) * 100);

        const onMove = (ev) => {
          // the image is centred, so its edge moves half as far as the width changes
          const w = startWidth + 2 * (ev.clientX - startX);
          pct = Math.max(10, Math.min(100, Math.round((w / parentWidth) * 100)));
          dom.style.width = `${pct}%`;
        };
        const onUp = (ev) => {
          handle.releasePointerCapture(ev.pointerId);
          handle.removeEventListener("pointermove", onMove);
          handle.removeEventListener("pointerup", onUp);
          handle.removeEventListener("pointercancel", onUp);
          const pos = getPos();
          if (typeof pos !== "number") return;
          editor.view.dispatch(editor.view.state.tr.setNodeMarkup(pos, undefined, { ...current.attrs, width: pct }));
        };
        handle.addEventListener("pointermove", onMove);
        handle.addEventListener("pointerup", onUp);
        handle.addEventListener("pointercancel", onUp);
      });

      return {
        dom,
        update: (updated) => {
          if (updated.type !== current.type) return false;
          current = updated;
          apply(updated);
          return true;
        },
        stopEvent: (event) => event.target === handle,
      };
    };
  },
});

const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled,
  extensions: [
    // only the formats the server keeps: no code blocks or rules
    StarterKit.configure({ heading: { levels: [2, 3] }, horizontalRule: false, code: false, codeBlock: false }),
    Underline,
    Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow" } }),
    ResizableImage.configure({ allowBase64: false }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  onUpdate: ({ editor }) => emit("update:modelValue", editor.isEmpty ? "" : editor.getHTML()),
});

// the parent loads the article after the editor exists (edit mode)
watch(() => props.modelValue, (v) => {
  const ed = editor.value;
  if (!ed) return;
  if (!v && ed.isEmpty) return;
  if (v !== ed.getHTML()) ed.commands.setContent(v || "", false);
});
watch(() => props.disabled, (d) => editor.value?.setEditable(!d));
onBeforeUnmount(() => editor.value?.destroy());

const setImageWidth = (pct) => editor.value.chain().focus().updateAttributes("image", { width: pct === 100 ? null : pct }).run();
const imageWidthIs = (pct) => {
  const w = editor.value.getAttributes("image").width;
  return pct === 100 ? !w || w >= 100 : w === pct;
};

function setLink() {
  const ed = editor.value;
  const prev = ed.getAttributes("link").href || "";
  const url = window.prompt("লিংকের ঠিকানা (যেমন https://example.com)", prev);
  if (url === null) return;
  const href = url.trim();
  if (!href) {
    ed.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  if (!/^(https?:\/\/|mailto:)/i.test(href)) {
    msg.value = "লিংক http://, https:// বা mailto: দিয়ে শুরু হতে হবে।";
    return;
  }
  msg.value = "";
  ed.chain().focus().extendMarkRange("link").setLink({ href }).run();
}

async function onImage(e) {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  msg.value = "";
  if (!/\.(jpe?g|png|webp)$/i.test(file.name) || file.size > 3 * 1024 * 1024) {
    msg.value = "ছবি JPG, PNG বা WEBP হতে হবে এবং সর্বোচ্চ ৩ এমবি।";
    return;
  }
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post("/journalist/uploads", fd);
    editor.value.chain().focus().setImage({ src: res.data.url }).run();
  } catch (err) {
    msg.value = errorMessage(err);
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <div class="rte" :class="{ off: disabled }">
    <div v-if="editor && !disabled" class="toolbar" role="toolbar" aria-label="লেখার টুলবার">
      <div class="group">
        <button type="button" title="পূর্বাবস্থা" :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run()">↶</button>
        <button type="button" title="আবার করুন" :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run()">↷</button>
      </div>

      <div class="group">
        <button type="button" :class="{ on: editor.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">শিরোনাম</button>
        <button type="button" :class="{ on: editor.isActive('heading', { level: 3 }) }" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">উপ-শিরোনাম</button>
        <button type="button" :class="{ on: editor.isActive('paragraph') }" @click="editor.chain().focus().setParagraph().run()">অনুচ্ছেদ</button>
      </div>

      <div class="group">
        <button type="button" title="বোল্ড" :class="{ on: editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()"><b>B</b></button>
        <button type="button" title="ইটালিক" :class="{ on: editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()"><i>I</i></button>
        <button type="button" title="আন্ডারলাইন" :class="{ on: editor.isActive('underline') }" @click="editor.chain().focus().toggleUnderline().run()"><u>U</u></button>
      </div>

      <div class="group">
        <button type="button" :class="{ on: editor.isActive('blockquote') }" @click="editor.chain().focus().toggleBlockquote().run()">❝ উদ্ধৃতি</button>
        <button type="button" :class="{ on: editor.isActive('bulletList') }" @click="editor.chain().focus().toggleBulletList().run()">• তালিকা</button>
        <button type="button" :class="{ on: editor.isActive('orderedList') }" @click="editor.chain().focus().toggleOrderedList().run()">১. তালিকা</button>
      </div>

      <div class="group">
        <button type="button" :class="{ on: editor.isActive({ textAlign: 'left' }) }" @click="editor.chain().focus().setTextAlign('left').run()">বাম</button>
        <button type="button" :class="{ on: editor.isActive({ textAlign: 'center' }) }" @click="editor.chain().focus().setTextAlign('center').run()">মাঝে</button>
        <button type="button" :class="{ on: editor.isActive({ textAlign: 'right' }) }" @click="editor.chain().focus().setTextAlign('right').run()">ডান</button>
        <button type="button" :class="{ on: editor.isActive({ textAlign: 'justify' }) }" @click="editor.chain().focus().setTextAlign('justify').run()">দুই পাশে</button>
      </div>

      <div class="group">
        <button type="button" :class="{ on: editor.isActive('link') }" @click="setLink">🔗 লিংক</button>
        <button v-if="editor.isActive('link')" type="button" @click="editor.chain().focus().unsetLink().run()">লিংক সরান</button>
        <button type="button" :disabled="uploading" @click="fileInput.click()">{{ uploading ? "আপলোড হচ্ছে ..." : "🖼 ছবি" }}</button>
      </div>

      <!-- image size: only while an image is selected -->
      <div v-if="editor.isActive('image')" class="group">
        <span class="size-label">ছবির আকার:</span>
        <button
          v-for="s in SIZES" :key="s" type="button"
          :class="{ on: imageWidthIs(s) }" @click="setImageWidth(s)"
        >{{ toBn(s) }}%</button>
      </div>
    </div>

    <p v-if="msg" class="msg" role="alert">{{ msg }}</p>
    <EditorContent :editor="editor" class="content" />
    <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onImage" />
  </div>
</template>

<style scoped>
.rte { border: 1px solid #cfcfcf; border-radius: 6px; background: #fff; }
.rte.off { background: #f6f6f6; }

.toolbar {
  display: flex; flex-wrap: wrap; gap: 6px 14px; padding: 8px 10px; background: #f4f4f4;
  border-bottom: 1px solid #cfcfcf; border-radius: 6px 6px 0 0; position: sticky; top: 0; z-index: 5;
}
.group { display: flex; gap: 4px; align-items: center; padding-right: 12px; border-right: 1px solid #ddd; }
.group:last-child { border-right: 0; }
.size-label { font-size: 13px; color: #666; margin-right: 2px; }
.toolbar button {
  font: inherit; font-size: 13.5px; color: #333; background: #fff; border: 1px solid #d0d0d0; border-radius: 4px;
  padding: 4px 10px; cursor: pointer; min-width: 30px; transition: all 0.15s;
}
.toolbar button:hover:not(:disabled) { border-color: #006a4e; color: #006a4e; }
.toolbar button.on { background: #006a4e; border-color: #006a4e; color: #fff; }
.toolbar button:disabled { opacity: 0.45; cursor: not-allowed; }
.toolbar button:focus-visible { outline: 2px solid #f21b3f; outline-offset: 1px; }

.msg { margin: 8px 12px 0; padding: 6px 12px; font-size: 13.5px; color: #b71c1c; background: #fdecec; border-radius: 4px; }

.content :deep(.ProseMirror) {
  min-height: 340px; padding: 14px 18px; outline: none; font-size: 16.5px; line-height: 1.9; color: #2b2b2b;
}
.content :deep(.ProseMirror p) { margin: 0 0 14px; }
.content :deep(.ProseMirror h2), .content :deep(.ProseMirror h3) {
  font-family: 'Noto Serif Bengali', serif; line-height: 1.45; margin: 22px 0 10px; color: #1b1b1b;
}
.content :deep(.ProseMirror h2) { font-size: 24px; }
.content :deep(.ProseMirror h3) { font-size: 20px; }
.content :deep(.ProseMirror blockquote) { margin: 0 0 14px; padding: 4px 18px; border-left: 4px solid #006a4e; color: #444; background: #f7faf8; }
.content :deep(.ProseMirror ul), .content :deep(.ProseMirror ol) { margin: 0 0 14px; padding-left: 26px; }
.content :deep(.ProseMirror a) { color: #006a4e; text-decoration: underline; }
.content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder); float: left; color: #aaa; height: 0; pointer-events: none;
}

/* resizable image: the wrapper holds the width, the red dot is the drag handle */
.content :deep(.ProseMirror .rimg) {
  position: relative; display: block; max-width: 100%; margin: 8px auto 14px; line-height: 0;
}
.content :deep(.ProseMirror .rimg img) { width: 100%; height: auto; display: block; margin: 0; }
.content :deep(.ProseMirror .rimg.ProseMirror-selectednode img) { outline: 3px solid #f21b3f; }
.content :deep(.ProseMirror .rimg-handle) {
  display: none; position: absolute; right: -9px; bottom: -9px; width: 18px; height: 18px;
  background: #f21b3f; border: 2px solid #fff; border-radius: 50%; cursor: nwse-resize; touch-action: none;
}
.content :deep(.ProseMirror .rimg.ProseMirror-selectednode .rimg-handle) { display: block; }
</style>