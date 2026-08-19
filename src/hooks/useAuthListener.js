import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { setUser } from '../features/auth/authSlice'

export function useAuthListener() {
  const dispatch = useDispatch()

  useEffect(() => {
    // onAuthStateChanged fires immediately with the current state,
    // then again every time the user logs in or out.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(setUser({ uid: firebaseUser.uid, email: firebaseUser.email }))
      } else {
        dispatch(setUser(null))
      }
    })

    // Cleanup: stop listening if this component ever unmounts
    return () => unsubscribe()
  }, [dispatch])
}