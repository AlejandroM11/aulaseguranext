'use client'
import { signInWithPopup } from 'firebase/auth'
import { ref, get, set } from 'firebase/database'
import { auth, db, googleProvider } from './firebase'
import { User } from '@/types'

/**
 * Sign in with Google and sync with Firebase Realtime DB.
 * Returns the user data or throws.
 */
export async function signInWithGoogle(role?: 'docente' | 'estudiante'): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider)
  const u      = result.user

  const snap = await get(ref(db, `users/${u.uid}`))

  if (snap.exists()) {
    // Existing user — return their data
    const existing = snap.val() as User
    if (role && existing.role !== role) {
      throw new Error(`Esta cuenta ya está registrada como ${existing.role}.`)
    }
    return existing
  }

  // New user — create record
  if (!role) throw new Error('Selecciona un rol para registrarte con Google.')

  const newUser: User = {
    uid:        u.uid,
    email:      u.email ?? '',
    name:       u.displayName ?? '',
    photo:      u.photoURL ?? '',
    role,
    fromGoogle: true,
    createdAt:  new Date().toISOString(),
  }
  await set(ref(db, `users/${u.uid}`), newUser)
  return newUser
}
