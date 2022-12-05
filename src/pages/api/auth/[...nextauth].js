import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

import { query as q } from 'faunadb';
import { fauna } from '../../../services/fauna';


export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: 'read:user',
    }),
  ],
  callbacks: {
    async session(session) {
      try {
        const { email } = session.session?.user
        console.log('session -> email', email)
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                q.Casefold("active")
              )
            ])
          )
        )
        return { ...session.session, activeSubscription: userActiveSubscription }
      } catch (error) {
        console.log('session -> error', error)
        return { ...session.session, activeSubscription: null }
      }
    },
    async signIn({ user, _account, _profile, _email, _credentials }) {
      const { email } = user
      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(email)
                )
              )
            ),
            q.Create(
              q.Collection('users'),
              { data: { email } }
            ),
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(email)
              )
            )
          )
        )
        return true
      } catch (error) {
        console.log('signIn -> error', error)
        return false
      }
    },
  },
  debug: true,
  // secret: process.env.GITHUB_SECRET,
};

export default NextAuth(authOptions);
