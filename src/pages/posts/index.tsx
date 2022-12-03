import * as prismic from '@prismicio/client'
import Head from 'next/head'
import Link from 'next/link'
import { createClient } from 'prismicio'
import styles from './styles.module.scss'

type Post = {
  slug: string,
  title: string,
  excerpt: string,
  updatedAt: string
}

interface PostsProps {
  posts: Post[]
}

export default function posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={styles.container} >
        <div className={styles.posts}>
          { posts.map(post => (
            <Link key={post.slug} href={`/posts/${post.slug}`} passHref legacyBehavior>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          )) }
        </div>
      </main>
    </>
  )
}

export async function getStaticProps() {
  const client = createClient()

  const posts = await client.get({
    predicates: [
      prismic.predicate.at('document.type', 'post')
    ],
    fetch: ['post.title', 'post.content'],
    pageSize: 100
  })

  console.log('getStaticProps -> posts', JSON.stringify(posts, null, 2))

  const postsFormatted = posts.results.map(post => {
    return {
      slug: post.uid,
      title: post.data.title,
      excerpt: post.data.content.find((content: { type: string }) => content.type === 'paragraph')?.text.slice(0, 300).concat('...') ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: {
      posts: postsFormatted
    }
  }

}