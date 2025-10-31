import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Bookmark, Trash2, Clock, DollarSign, FileText } from 'lucide-react';
import styles from './SavedJobs.module.css';

// Job Application Form Component
const JobApplicationForm = ({ jobId, onClose }) => {
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume_file: ''
  });
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile to get resume file
  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.username) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:25608/profile/${user.username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const profileData = await response.json();
          setUserProfile(profileData);
          setFormData(prev => ({
            ...prev,
            resume_file: profileData.resume_file || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      const response = await fetch(`http://127.0.0.1:25608/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('განცხადება წარმატებით გაიგზავნა!');
        onClose();
      } else {
        alert(data.message || 'დაფიქსირდა შეცდომა');
      }
    } catch (error) {
      alert('დაფიქსირდა შეცდომა');
    }
  };

  if (loading) {
    return (
      <div className={styles.applicationForm}>
        <div className={styles.applicationFormContent}>
          <div className={styles.loadingMessage}>
            <span>პროფილის ინფორმაციის ჩატვირთვა...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.applicationForm}>
      <div className={styles.applicationFormContent}>
        <div className={styles.applicationHeader}>
          <h3>განცხადების გაგზავნა</h3>
        </div>
        
        {/* Resume info section */}
        <div className={styles.resumeInfo}>
          <div className={styles.resumeInfoHeader}>
            <FileText className={styles.resumeIcon} />
            <span>რეზიუმეს ინფორმაცია</span>
          </div>
          {userProfile?.resume_file ? (
            <div className={styles.resumeDetails}>
              <p className={styles.resumeText}>
                <strong>ფაილი:</strong> {userProfile.resume_file}
              </p>
              <p className={styles.autoSendText}>
                📎 გაგზავნისას თქვენი რეზიუმე ავტომატურად დაერთვება განცხადებას
              </p>
            </div>
          ) : (
            <div className={styles.noResumeWarning}>
              <p>⚠️ თქვენს პროფილში რეზიუმე არ არის ატვირთული</p>
              <p>გთხოვთ, პირველ ატვირთოთ რეზიუმე თქვენს პროფილში</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>სამოტივაციო წერილი</label>
            <textarea
              value={formData.cover_letter}
              onChange={(e) => setFormData({...formData, cover_letter: e.target.value})}
              placeholder="დაწერეთ თქვენი მოტივაცია..."
              required
            />
          </div>
          
          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={!userProfile?.resume_file}
            >
              გაგზავნა
            </button>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              გაუქმება
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SavedJobsModal = ({ onClose }) => {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [activeApplicationId, setActiveApplicationId] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:25608';

  const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token || 'გთხოვთ გაიაროთ ავტორიზაცია.';
  };

  const fetchSavedJobs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/saved_jobs?page=${page}&per_page=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved jobs');
      }

      const data = await response.json();
      setSavedJobs(data.saved_jobs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (savedJobId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/saved_job/${savedJobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove saved job');
      }

      fetchSavedJobs(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewDetails = (jobId) => {
    localStorage.setItem('jobId', jobId);
    router.push(`/pages/JobDetail`);
  };

  const handleApplyClick = (jobId) => {
    setActiveApplicationId(activeApplicationId === jobId ? null : jobId);
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchSavedJobs(newPage);
  };

  useEffect(() => {
    fetchSavedJobs(1);
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Bookmark className={styles.headerIcon} />
            <h2 className={styles.title}>შენახული სამუშაოები</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.content}>
          {loading && (
            <div className={styles.loaderWrapper}>
              <div className={styles.loader}></div>
              <span>იტვირთება...</span>
            </div>
          )}

          {error && (
            <div className={styles.errorBox}>
              <p>შეცდომა: {error}</p>
            </div>
          )}

          {!loading && !error && savedJobs.length === 0 && (
            <div className={styles.emptyState}>
              <Bookmark className={styles.emptyIcon} />
              <h3>შენახული სამუშაოები არ გაქვთ</h3>
              <p>შეინახეთ სამუშაოები რომ შემდეგ ადვილად იპოვოთ</p>
            </div>
          )}

          {!loading && !error && savedJobs.length > 0 && (
            <div className={styles.jobsList}>
              {savedJobs.map((savedJob) => (
                <div key={savedJob.id} className={styles.jobCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleBlock}>
                      <h3>{savedJob.job?.title || 'სათაური არ არის'}</h3>
                      <div className={styles.cardMeta}>
                        <Clock className={styles.metaIcon} />
                        <span>შენახულია: {formatDate(savedJob.saved_at)}</span>
                      </div>
                    </div>
                    <button onClick={() => removeSavedJob(savedJob.id)} className={styles.deleteButton}>
                      <Trash2 className={styles.deleteIcon} />
                    </button>
                  </div>

                  {savedJob.job && (
                    <>
                      <p className={styles.description}>
                        {truncateText(savedJob.job.description)}
                      </p>
                      <div className={styles.keywords}>
                        {savedJob.job.keywords && savedJob.job.keywords.split(',').map((keyword, index) => (
                          <span key={index} className={styles.keyword}>
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                      <div className={styles.cardFooter}>
                        <div className={styles.budget}>
                          <DollarSign className={styles.budgetIcon} />
                          <span>{savedJob.job.min_budget}₾ - {savedJob.job.max_budget}₾</span>
                        </div>
                        <div className={styles.buttons}>
                          <button 
                            className={styles.detailsButton}
                            onClick={() => handleViewDetails(savedJob.job.id)}
                          >
                            დეტალების ნახვა
                          </button>
                          <button 
                            className={`${styles.applyButton} ${activeApplicationId === savedJob.job.id ? styles.active : ''}`}
                            onClick={() => handleApplyClick(savedJob.job.id)}
                          >
                            {activeApplicationId === savedJob.job.id ? 'დახურვა' : 'განაცხადის გაგზავნა'}
                          </button>
                        </div>
                      </div>

                      {/* Application Form */}
                      {activeApplicationId === savedJob.job.id && (
                        <JobApplicationForm 
                          jobId={savedJob.job.id}
                          onClose={() => setActiveApplicationId(null)}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && !error && pagination.pages > 1 && (
          <div className={styles.pagination}>
            <div>სულ: {pagination.total} სამუშაო</div>
            <div className={styles.pageControls}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.has_prev}
                className={styles.pageButton}
              >
                წინა
              </button>
              <span>{currentPage} / {pagination.pages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.has_next}
                className={styles.pageButton}
              >
                შემდეგი
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobsModal;