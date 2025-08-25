import styles from '../styles/Header.module.css';

/**
 * Header component displaying event title, subtitle, and instructions.
 * @param {string} title - The main title text (default: "🌞 2025 Priceline Summer Party 🏖️")
 * @param {string} instructions - The instructions text (default: "You can use the same person only twice and can't use your own name! ✨")
 * @param {string} subtitle - The subtitle text (default: "🔍 Find someone who...")
 */
function Header({ 
  title = "🌞 2025 Priceline Summer Party 🏖️",
  instructions = "You can use the same person only twice and can't use your own name! ✨",
  subtitle = "🔍 Find someone who..."
}) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.instructions}>{instructions}</p>
      <h2 className={styles.subtitle}>{subtitle}</h2>
    </header>
  );
}

export default Header;