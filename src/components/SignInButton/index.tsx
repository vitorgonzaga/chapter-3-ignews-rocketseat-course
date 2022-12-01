import { signIn, signOut, useSession } from "next-auth/react"
import { FaGithub } from 'react-icons/fa'
import { FiX } from 'react-icons/fi'

import styles from './styles.module.scss'

export function SignInButton() {
  const { data: session, status } = useSession()

  console.log('SignInButton -> status', status)
  console.log('SignInButton -> session', session)

  return session ? (
    <button type="button" className={styles.signInButton} onClick={() => signOut()}>
      <FaGithub color="#04d361" />
      {session?.user?.name}
      <FiX color="#737380" className={styles.closeIcon} />
    </button>

  ) : (
    <button type="button" className={styles.signInButton}>
      <FaGithub color="#eba417" onClick={() => signIn('github')}/>
      Sign in with Github
    </button>
  )
}