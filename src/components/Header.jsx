import styles from '../styles/Header.module.css';

/**
 * Static header component displaying event title, subtitle, and instructions.
 * No props required - displays fixed content for Priceline Summer Party.
 */
function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>2025 Priceline Summer Party</h1>
      <p className={styles.instructions}>
        Write the matching person's name. You can only use the same person twice and can't use your name!
      </p>
      <h2 className={styles.subtitle}>Find someone who...</h2>
    </header>
  );
}

export default Header;