import { GetStaticProps } from "next"
import { useSession } from "next-auth/react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { RichText } from "prismic-dom"
import { createClient } from "prismicio"
import { useEffect } from "react"
import styles from '../post.module.scss'

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

interface SessionProps  {
  activeSubscription: string,
  user: {
    name: string,
    email: string,
  }
}

export default function PostPreview({ post }: PostPreviewProps) {
  const { data: session } = useSession() as any
  const router = useRouter()

  useEffect(() => {
    if(session?.activeSubscription) {
      router.push(`/posts/${post.slug}`)
    }
  }, [post.slug, router, session])

  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post} >
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <div className={styles.continueReading}>
              Wanna continue reading?
              <Link href={'/'}>Subscribe now 🤗 </Link>
            </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({
  params,
}) => {

  const client = createClient();

  const post = await client.getByUID("post", String(params?.slug), {});

  const postFormatted = {
    slug: params?.slug,
    title: post.data.title,
    content: RichText.asHtml(post.data.content).split('.').slice(0, 3).map(p => p.concat('.')).join(''),
    updatedAt: new Date(post.last_publication_date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };

  return {
    props: {
      post: postFormatted,
    },
    revalidate: 60 * 30 // 30 minutes
  };
};
