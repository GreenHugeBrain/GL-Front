import styles from './JobCard.module.css';

const JobCard = ({ icon, title, count }) => {
  return (
    <div className={styles.popular_card}>
      <div className={styles.popular_icon}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className={styles.popular_text}>
        <p>{title}</p>
        <span>{count} სამუშაო</span>
      </div>
    </div>
  );
};

export default JobCard;