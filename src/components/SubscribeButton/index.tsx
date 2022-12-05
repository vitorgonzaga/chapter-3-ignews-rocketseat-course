import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { api } from 'src/services/api'
import { getStripeJs } from 'src/services/stripe-js'
import styles from './styles.module.scss'

interface SubscribeButtonProps {
  priceId: string
}

export default function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { data: session } = useSession() as any
  const router = useRouter()

  const handleSubscribe = async () => {
    if(!session) {
      signIn('github')
      return
    }

    if(session.activeSubscription) {
      router.push('/posts')
      return
    }

    try {
      const response = await api.post('/subscribe')
      const { sessionId } = response?.data
      const stripe = await getStripeJs()
      stripe?.redirectToCheckout({ sessionId })
    } catch (error) {
      alert(error)
    }

  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  )
}