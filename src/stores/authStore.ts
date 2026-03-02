import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/stores/supabase'

import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/user'


export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const initialized = ref<boolean>(false)

  const isAdmin = computed(() => profile.value?.role == "admin")

  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    if (user.value) await fetchProfile()

    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null
      if (user.value) await fetchProfile()
      else profile.value = null
    })

    initialized.value = true
  }

  async function fetchProfile() {
    if (!user.value) return
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, role')
      .eq('id', user.value.id)
      .single()
    profile.value = data
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  return { user, profile, initialized, isAdmin, init, signIn, signUp, signOut }
})
