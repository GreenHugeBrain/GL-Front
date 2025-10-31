'use client';
import { useState, useEffect } from 'react';
import "./Job.css";
import { useRouter } from 'next/navigation';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Link from 'next/link';

const JobDetail = () => {
    const router = useRouter();
    const [jobData, setJobData] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false);
    const [downloadingResume, setDownloadingResume] = useState(null); // Track which resume is being downloaded

    useEffect(() => {
        const jobId = localStorage.getItem('jobId');
        if (!jobId) {
            router.push('/pages/profile');
            return;
        }

        const fetchJobData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const response = await fetch(`http://127.0.0.1:25608/jobs/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch job details');
                }

                const data = await response.json();
                console.log('Job data:', data);
                console.log('Current user:', user);
                console.log('data.author_id:', data.author_id);
                console.log('user.user_id:', user.user_id);
                console.log('Author check:', data.author_id === user.user_id);
                
                setJobData(data);
                
                // Check if current user is the author of the job
                if (data.author_id && user && data.author_id === user.user_id) {
                    console.log('User is author - showing applicants');
                    setIsAuthor(true);
                    // Set applicants from the job data
                    setApplicants(data.applicants || []);
                    console.log('Applicants:', data.applicants);
                } else {
                    console.log('User is NOT author - showing application form');
                    setIsAuthor(false);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobData();
    }, [router]);

    const downloadResume = async (fileName, applicantId) => {
        try {
            setDownloadingResume(applicantId);
            const user = JSON.parse(localStorage.getItem('user'));

            const response = await fetch(`http://127.0.0.1:25608/download-resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    fileName: fileName
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } else {
                const errorData = await response.json();
                console.error("Download Error:", errorData);
                alert("ფაილის გადმოწერა ვერ მოხერხდა: " + (errorData.message || 'უცნობი შეცდომა'));
            }
        } catch (error) {
            console.error("Download error:", error);
            alert("გადმოწერის შეცდომა");
        } finally {
            setDownloadingResume(null);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <>
            <Header />
            <div className="job-detail-container">
                {jobData && (
                    <div className="job-detail">
                        <div className="job-header">
                            <h1>{jobData.title}</h1>
                            <div className="job-meta">
                                <span className="budget">
                                    <span className="label">ბიუჯეტი:</span>
                                    {jobData.min_budget} ₾ - {jobData.max_budget} ₾
                                </span>
                                {jobData.author && (
                                    <div className="author-info">
                                        <span className="label">განმათავსებელი:</span>
                                        <Link href={`/pages/profile/${jobData.author.name}`} className="author-link">
                                            {jobData.author.name}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="job-description">
                            <p>{jobData.description}</p>
                        </div>
                        {jobData.keywords && (
                            <div className="job-keywords">
                                <h3>საკვანძო სიტყვები:</h3>
                                <div className="keywords-list">
                                    {jobData.keywords.split(',').map((keyword, index) => (
                                        <span key={index} className="keyword-tag">
                                            {keyword.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Only show applicants section if user is the author */}
                {isAuthor && (
                    <section className="applicants-section">
                        <h2>აპლიკანტები</h2>
                        {applicants.length > 0 ? (
                            <ul className="applicants-list">
                                {applicants.map((applicant, index) => (
                                    <li key={applicant.applicant_id || index} className="applicant-card">
                                        <Link href={`/pages/profile/${applicant.username}`} className="applicant-name">
                                            {applicant.username}
                                        </Link>
                                        {applicant.user_job && (
                                            <p className="applicant-exp">პროფესია: {applicant.user_job}</p>
                                        )}
                                        <p className="applicant-exp">ჯამში გამომუშავებული: {applicant.user_total_earnings}₾</p>
                                        {applicant.cover_letter && (
                                            <p className="applicant-letter">{applicant.cover_letter}</p>
                                        )}
                                        {applicant.resume_file && (
                                            <div className="applicant-resume">
                                                <span className="resume-icon">📄</span>
                                                <span className="resume-filename">რეზუმე: {applicant.resume_file}</span>
                                                <button 
                                                    className="download-resume-btn"
                                                    onClick={() => downloadResume(applicant.resume_file, applicant.applicant_id)}
                                                    disabled={downloadingResume === applicant.applicant_id}
                                                >
                                                    {downloadingResume === applicant.applicant_id ? 'იტვირთება...' : 'გადმოწერა'}
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-applicants">0 აპლიკანტი.</p>
                        )}
                    </section>
                )}

                {/* Show application form for non-authors */}
                {!isAuthor && jobData && (
                    <section className="application-section">
                        <h2>განცხადების გაგზავნა</h2>
                        <p>თუ დაინტერესდით ამ ვაკანსიით, შეგიძლიათ განცხადება გააგზავნოთ.</p>
                        <button 
                            className="apply-button"
                            onClick={() => router.push('/pages/Hire')}
                        >
                            უკან დაბრუნება ვაკანსიებზე
                        </button>
                    </section>
                )}
            </div>
            <Footer />
        </>
    );
};

export default JobDetail;