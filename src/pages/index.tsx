import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  // TODO
  const [posts, setPosts] = useState(postsPagination);

  async function nextPage(paginationUrl: string): Promise<void> {
    const nextPosts = await fetch(paginationUrl).then(data => data.json());

    const results = nextPosts.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts({
      next_page: nextPosts.next_page,
      results: posts.results.concat(results),
    });
  }
  return (
    <>
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.results.map(result => {
            return (
              <Link key={result.uid} href={`/post/${result.uid}`}>
                <a>
                  <div className={styles.title}>{result.data.title}</div>
                  <div className={styles.subtitle}>{result.data.subtitle}</div>
                  <div className={styles.info}>
                    <p className={styles.createdAt}>
                      <FiCalendar size={20} />
                      {format(
                        new Date(result.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </p>
                    <p className={styles.author}>
                      <FiUser size={20} />
                      {result.data.author}
                    </p>
                  </div>
                </a>
              </Link>
            );
          })}
          {posts.next_page && (
            <div className={styles.pagination}>
              <button type="button" onClick={() => nextPage(posts.next_page)}>
                <p>Carregar mais posts</p>
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 1 });

  // TODO
  const results = postsResponse.results.map(result => {
    return {
      uid: result.uid,
      first_publication_date: result.first_publication_date,
      data: {
        title: result.data.title,
        subtitle: result.data.subtitle,
        author: result.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
