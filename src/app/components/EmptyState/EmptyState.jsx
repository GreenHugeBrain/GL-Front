import Link from 'next/link';
import styles from './EmptyState.module.css';

const EmptyState = ({ type, searchTerm, onClearSearch }) => {
  if (type === 'no-results') {
    return (
      <div className={styles.no_results}>
        <i className="bi bi-search"></i>
        <p>ძებნისას არ მოიძებნა შედეგი "{searchTerm}"-სთვის</p>
        <button onClick={onClearSearch} className={styles.clear_search_btn_large}>
          ძებნის გასუფთავება
        </button>
      </div>
    );
  }

  return (
    <div className={styles.empty_state}>
      <i className="bi bi-people"></i>
      <p>ჯერ არ არის ხელმისაწვდომი პროფესიონალები</p>
      <Link href="/pages/SignUp" className={styles.join_btn}>
        შემოგვიერთდით
      </Link>
    </div>
  );
};

export default EmptyState;