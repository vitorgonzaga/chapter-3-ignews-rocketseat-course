import { GetServerSideProps } from "next"
import { getSession } from "next-auth/react"
import Head from "next/head"
import { RichText } from "prismic-dom"
import { createClient } from "prismicio"
import styles from './post.module.scss'

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

interface Session {
  activeSubscription: string | null,
  user: {
    name: string,
    email: string,

  }
}

export default function Post({ post }: PostProps) {
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
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const session: Session = await getSession({ req }) as any
  // const { slug } = params;

  console.log('session', session)

  if(!session?.activeSubscription){
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const client = createClient();

  const post = await client.getByUID("post", String(params?.slug), {});

  // console.log(
  //   "constgetServerSideProps:GetServerSideProps= -> post",
  //   JSON.stringify(post, null, 2)
  // );

  const postFormatted = {
    slug: params?.slug,
    title: post.data.title,
    content: RichText.asHtml(post.data.content),
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
  };
};
