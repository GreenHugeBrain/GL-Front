import Link from 'next/link';
import styles from './ProfessionalCard.module.css';

const ProfessionalCard = ({ person }) => {
  return (
    <div className={styles.pro_list_row}>
      <i className="bi bi-person-circle"></i>
      <div>
        <h3>
          <Link href={`/pages/profile/${person.name}`} className={styles.name_link}>
            {person.name}
          </Link>
        </h3>
        <p>როლი: {person.role ? person.role.toUpperCase() : 'არ არის მითითებული'}</p>
        <p>სამუშაო: {person.job || 'არ არის მითითებული'}</p>
      </div>
    </div>
  );
};

export default ProfessionalCard;