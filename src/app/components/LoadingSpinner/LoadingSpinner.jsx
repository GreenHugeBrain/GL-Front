import styles from './LoadingSpinner.module.css';

const LoadingSpinner = () => {
  return (
    <div className={styles.loading_container}>
      <div className={styles.loading_spinner}></div>
      <p>იტვირთება პროფესიონალები...</p>
    </div>
  );
};

export default LoadingSpinner;