import Image from "next/image";
import ActiveLink from "../ActiveLink";
import { SignInButton } from "../SignInButton";
import styles from './styles.module.scss';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent} >
        <Image src='/images/logo.svg' width='109' height='30' alt='ig news logo'/>
        <nav>
          <ActiveLink activeClassName={styles.active} href="/">
            <a>Home</a>
          </ActiveLink>
          <ActiveLink activeClassName={styles.active} href="/posts">
            <a>Posts</a>
          </ActiveLink>
        </nav>
        <SignInButton />
      </div>
    </header>
  )
}