<template>
  <div>
    <!-- Render login or register modal based on internal mode -->
    <LoginModal
      v-if="mode === 'login'"
      :show="show"
      @close="onClose"
      @authenticated="onAuthenticated"
      @show-register="() => setMode('register')"
    />

    <RegisterModal
      v-else
      :show="show"
      @close="onClose"
      @registered="onRegistered"
      @show-login="() => setMode('login')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import LoginModal from './loginModal.vue'
import RegisterModal from './registerModal.vue'
import type { User } from '../../types/user'

const props = defineProps<{ show: boolean; initialMode?: 'login' | 'register' }>()
const emit = defineEmits<{
  (e: 'close'): void
  // authenticated / registered emit the User shape that matches the backend
  (e: 'authenticated', user: User): void
  (e: 'registered', user: User): void
}>()

const mode = ref<'login' | 'register'>(props.initialMode ?? 'login')

watch(() => props.initialMode, (v) => {
  if (v) mode.value = v
})

watch(() => props.show, (val) => {
  // when opening, keep current mode; when closing, reset to login by default
  if (!val) mode.value = 'login'
})

function setMode(m: 'login' | 'register') {
  mode.value = m
}

function onClose() {
  emit('close')
}

function onAuthenticated(user: any) {
  emit('authenticated', user)
  emit('close')
}

function onRegistered() {
  // After successful registration, switch to the login view so the user can authenticate.
  // Do not auto-close the modal; keep it open and show login.
  setMode('login')
}
</script>

<style scoped>
/* No styles here; children modals provide layout */
</style>
