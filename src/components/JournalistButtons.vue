<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";

// variant "pills": two buttons for the desktop topbar (the first opens a dropdown)
// variant "list":  plain links for the mobile slide-out menu
defineProps({ variant: { type: String, default: "pills" } });
const emit = defineEmits(["navigate"]); // fired after any link/logout, so the mobile menu can close itself

const router = useRouter();

// "logged in" = a journalist token is stored in the browser
const hasToken = ref(false);
const refreshAuth = () => {
  try {
    hasToken.value = !!localStorage.getItem("token");
  } catch {
    hasToken.value = false;
  }
};

const open = ref(false);
const btn = ref(null);
const menu = ref(null);
const pos = ref({ top: "0px", right: "0px" });

const toggle = () => {
  if (!open.value && btn.value) {
    const r = btn.value.getBoundingClientRect();
    pos.value = { top: `${r.bottom + 8}px`, right: `${Math.max(8, window.innerWidth - r.right)}px` };
    refreshAuth();
  }
  open.value = !open.value;
};
const close = () => { open.value = false; };
const go = () => { close(); emit("navigate"); };

const logout = () => {
  try { localStorage.removeItem("token"); } catch { /* ignore */ }
  refreshAuth();
  close();
  emit("navigate");
  router.push("/");
};

const onDocClick = (e) => {
  if (open.value && !(btn.value?.contains(e.target) || menu.value?.contains(e.target))) close();
};
const onKey = (e) => { if (e.key === "Escape") close(); };

let stopAfterEach = () => {};
onMounted(() => {
  refreshAuth();
  stopAfterEach = router.afterEach(refreshAuth); // e.g. right after logging in
  document.addEventListener("click", onDocClick);
  window.addEventListener("keydown", onKey);
  window.addEventListener("scroll", close, { passive: true });
  window.addEventListener("resize", close);
  window.addEventListener("storage", refreshAuth);
});
onUnmounted(() => {
  stopAfterEach();
  document.removeEventListener("click", onDocClick);
  window.removeEventListener("keydown", onKey);
  window.removeEventListener("scroll", close);
  window.removeEventListener("resize", close);
  window.removeEventListener("storage", refreshAuth);
});
</script>

<template>
  <!-- desktop: two pill buttons -->
  <div v-if="variant === 'pills'" class="jb">
    <button
      ref="btn" type="button" class="jb-pill"
      aria-haspopup="menu" :aria-expanded="open" @click="toggle"
    >👤 সাংবাদিক <span class="jb-caret" aria-hidden="true">▾</span></button>

    <router-link to="/journalist/verify" class="jb-pill" @click="emit('navigate')">✔ সাংবাদিক যাচাই</router-link>

    <Teleport to="body">
      <transition name="jb-fade">
        <div v-if="open" ref="menu" class="jb-menu" :style="pos" role="menu" aria-label="সাংবাদিক">
          <template v-if="hasToken">
            <router-link to="/journalist" class="jb-item" role="menuitem" @click="go">
              <span>📋</span> আমার ড্যাশবোর্ড
            </router-link>
            <button type="button" class="jb-item" role="menuitem" @click="logout">
              <span>🚪</span> লগআউট
            </button>
          </template>
          <template v-else>
            <router-link to="/join" class="jb-item" role="menuitem" @click="go">
              <span>✍️</span> সাংবাদিক নিবন্ধন
            </router-link>
            <router-link to="/journalist/login" class="jb-item" role="menuitem" @click="go">
              <span>🔑</span> সাংবাদিক লগইন
            </router-link>
          </template>
        </div>
      </transition>
    </Teleport>
  </div>

  <!-- mobile: a heading and plain links -->
  <div v-else class="jb-list">
    <div class="jb-heading">সাংবাদিক</div>
    <template v-if="hasToken">
      <router-link to="/journalist" class="jb-row" @click="emit('navigate')">আমার ড্যাশবোর্ড</router-link>
      <button type="button" class="jb-row jb-out" @click="logout">লগআউট</button>
    </template>
    <template v-else>
      <router-link to="/join" class="jb-row" @click="emit('navigate')">সাংবাদিক নিবন্ধন</router-link>
      <router-link to="/journalist/login" class="jb-row" @click="emit('navigate')">সাংবাদিক লগইন</router-link>
    </template>
    <router-link to="/journalist/verify" class="jb-row" @click="emit('navigate')">সাংবাদিক যাচাই</router-link>
  </div>
</template>

<style scoped>
/* Override these from the header to match your design, e.g. .topbar { --jb-accent: #006a4e; } */
.jb, .jb-list, .jb-menu {
  --jb-accent: #c62828;
  --jb-pill-fg: #fff;
  --jb-pill-bg: rgba(255, 255, 255, 0.15);
  --jb-pill-outline: rgba(255, 255, 255, 0.6);
  --jb-pill-hover-fg: #b71c1c;
  --jb-pill-hover-bg: #fff;
}

.jb { display: inline-flex; align-items: center; gap: 8px; }
.jb-pill {
  display: inline-block; font-family: inherit; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer;
  line-height: normal; margin: 0; border: 0; border-radius: 50px; padding: 4px 14px; text-decoration: none;
  color: #2e2a2a;
  box-shadow: inset 0 0 0 1px var(--jb-pill-outline);
  transition: background 0.25s, color 0.25s;
}
.jb-pill:hover, .jb-pill[aria-expanded="true"] { background: var(--jb-pill-hover-bg); color: var(--jb-pill-hover-fg); }
.jb-pill:focus-visible { outline: 2px solid var(--jb-pill-fg); outline-offset: 2px; }
.jb-caret { font-size: 10px; margin-left: 2px; }

/* floating dropdown (lives on <body>, so no parent can clip it) */
.jb-menu {
  position: fixed; z-index: 2100; min-width: 230px; background: #fff; border-top: 3px solid var(--jb-accent);
  border-radius: 8px; box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18); padding: 6px;
  font-family: 'Inter', 'Noto Sans Bengali', sans-serif;
}
.jb-item {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 6px;
  border: 0; background: none; font: inherit; font-size: 13.5px; font-weight: 600; text-align: left; cursor: pointer;
  text-decoration: none; color: #333; transition: background 0.2s, color 0.2s;
}
.jb-item span { font-size: 17px; }
.jb-item:hover { background: #f8f8f8; color: var(--jb-accent); }
.jb-item:focus-visible { outline: 2px solid var(--jb-accent); outline-offset: -2px; }
.jb-fade-enter-active, .jb-fade-leave-active { transition: all 0.25s ease; }
.jb-fade-enter-from, .jb-fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* mobile list */
.jb-list { font-family: 'Inter', 'Noto Sans Bengali', sans-serif; }
.jb-heading {
  margin: 12px 20px 4px; padding-top: 12px; border-top: 1px solid #e0e0e0;
  font-size: 13px; font-weight: 700; color: var(--jb-accent);
}
.jb-row {
  display: block; width: 100%; padding: 14px 20px; text-align: left; background: none; border: 0;
  border-left: 3px solid transparent; font: inherit; font-size: 15px; font-weight: 500; color: #333;
  text-decoration: none; cursor: pointer; transition: all 0.3s;
}
.jb-row:hover { background: #fff; border-left-color: var(--jb-accent); color: var(--jb-accent); }
.jb-out { color: #b71c1c; }
</style>