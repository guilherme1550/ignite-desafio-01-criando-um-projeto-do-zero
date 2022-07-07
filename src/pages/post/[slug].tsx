import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import PrismicDom from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  // TODO
  const router = useRouter();
  let key = 0;

  if (!post) {
    return null;
  }

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  function readingTime(): number {
    const totalWords = post.data.content.reduce((acc, content) => {
      const heading = content.heading.split(' ').length;
      const body = PrismicDom.RichText.asText(content.body).split(' ').length;

      return acc + heading + body;
    }, 0);

    const time = Math.ceil(totalWords / 200);

    return time;
  }

  function getKey(): number {
    key += 1;
    return key;
  }

  return (
    <>
      <img src={post.data.banner.url} alt="banner" className={styles.banner} />
      <main className={commonStyles.container}>
        <div className={styles.title}>{post.data.title}</div>
        <div className={styles.infos}>
          <div className={styles.createdAt}>
            <FiCalendar size={20} />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </div>
          <div className={styles.author}>
            <FiUser size={20} />
            <p>{post.data.author}</p>
          </div>
          <div className={styles.readingTime}>
            <FiClock size={20} />
            <p>{readingTime()} min</p>
          </div>
        </div>
        {post.data.content.map(content => {
          return (
            <article key={getKey()}>
              <>
                <div className={styles.heading}> {content.heading} </div>
                <div
                  className={styles.contentBody}
                  dangerouslySetInnerHTML={{
                    __html: PrismicDom.RichText.asHtml(content.body),
                  }}
                />
              </>
            </article>
          );
        })}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const uidPosts = posts.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  // TODO
  return {
    paths: uidPosts,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', params.slug as string);

  // TODO
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60, // 1 min
  };
};
