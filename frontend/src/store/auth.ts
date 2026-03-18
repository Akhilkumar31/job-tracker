import { create } from 'zustand'
import api from '../api/http'

type UserInfo = {
  email: string
  name: string
}

type ProfileResponse = {
  email: string
  displayName: string | null
}

type State = {
  token?: string
  user?: UserInfo
  login: (email: string, pw: string) => Promise<void>
  register: (email: string, pw: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => void
  loadProfile: () => Promise<void>
}

/**
 * Broadcast the current JWT token to the Chrome extension.
 * content-script.js listens for JT_TOKEN_FROM_APP and stores it in chrome.storage.local.
 */
function broadcastTokenToExtension(token?: string | null) {
  if (typeof window === 'undefined') return

  try {
    window.postMessage(
      {
        type: 'JT_TOKEN_FROM_APP',
        token: token ?? null,
      },
      window.location.origin
    )
  } catch (err) {
    console.error('Failed to broadcast token to extension', err)
  }
}

// Read any existing token from localStorage on first load
const initialToken =
  typeof window !== 'undefined'
    ? localStorage.getItem('token') || undefined
    : undefined

export const useAuth = create<State>((set, get) => ({
  token: initialToken,
  user: undefined,

  async login(email, pw) {
    const { data } = await api.post<{ token: string }>('/auth/login', {
      email,
      password: pw,
    })

    localStorage.setItem('token', data.token)
    set({ token: data.token })

    // 🔴 Send token to extension
    broadcastTokenToExtension(data.token)

    await get().loadProfile()
  },

  async register(email, pw) {
    const { data } = await api.post<{ token: string }>('/auth/register', {
      email,
      password: pw,
    })

    localStorage.setItem('token', data.token)
    set({ token: data.token })

    // 🔴 Send token to extension
    broadcastTokenToExtension(data.token)

    await get().loadProfile()
  },

  async loginWithGoogle(idToken) {
    const { data } = await api.post<{ token: string }>(
      '/api/auth/oauth/google',
      { idToken }
    )

    localStorage.setItem('token', data.token)
    set({ token: data.token })

    // 🔴 Send token to extension
    broadcastTokenToExtension(data.token)

    await get().loadProfile()
  },

  async loadProfile() {
    try {
      const { data } = await api.get<ProfileResponse>('/me/profile')
      set({
        user: {
          email: data.email,
          name:
            data.displayName && data.displayName.trim().length > 0
              ? data.displayName
              : 'User',
        },
      })
    } catch (err) {
      console.error('Failed to load profile for navbar', err)
      // If it fails, leave user undefined
    }
  },

  logout() {
    localStorage.removeItem('token')
    set({ token: undefined, user: undefined })

    // 🔴 Clear token in extension as well
    broadcastTokenToExtension(null)
  },
}))

// If a token already existed before this file was loaded, broadcast it once
if (typeof window !== 'undefined' && initialToken) {
  broadcastTokenToExtension(initialToken)
}
