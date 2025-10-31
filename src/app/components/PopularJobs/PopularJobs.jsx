import styles from './PopularJobs.module.css';
import JobCard from '../JobCard/JobCard';

const PopularJobs = () => {
  const jobCategories = [
    { icon: "bi-brush", title: "გრაფიკული დიზაინი", count: 1 },
    { icon: "bi-code-slash", title: "დეველოპერი", count: 12 },
    { icon: "bi-megaphone", title: "ციფრული მარკეტინგი", count: 10 },
    { icon: "bi-camera-reels", title: "ვიდეომონტაჟი", count: 10 },
    { icon: "bi-music-note-beamed", title: "მუსიკა", count: 100 },
    { icon: "bi-bar-chart-line", title: "ფინანსები", count: 21 },
    { icon: "bi-heart-pulse", title: "ჯანმრთელობა", count: 8 },
    { icon: "bi-database", title: "მონაცემთა ანალიზი", count: 15 }
  ];

  return (
    <div className={styles.popular_jobs}>
      <div className={styles.popular_header}>
        <h1>პოპულარული</h1>
        <a href="/pages/Hire">ნახე ყველა <i className="bi bi-arrow-right"></i></a>
      </div>
      <div className={styles.popular_cards_div}>
        {jobCategories.map((job, index) => (
          <JobCard 
            key={index}
            icon={job.icon}
            title={job.title}
            count={job.count}
          />
        ))}
      </div>
    </div>
  );
};

export default PopularJobs;