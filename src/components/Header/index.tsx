import Link from 'next/link';
import stylesCommon from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  // TODO
  return (
    <header>
      <div className={stylesCommon.container}>
        <title> Posts </title>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="logo" className={styles.logo} />
          </a>
        </Link>
      </div>
    </header>
  );
}
