'use client';
import { useState, useEffect } from 'react';
import "./username.css";

import { useRouter, usePathname } from 'next/navigation';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { CalendarIcon, BookOpen, Briefcase, Mail, Phone, MapPin, Edit, Trash2, Plus, X, Download, FileText, MessageCircle } from 'lucide-react';

const Profile = () => {
    const pathname = usePathname();
    const router = useRouter();

    const encodedUsername = pathname?.split('/').pop();
    const username = encodedUsername ? decodeURIComponent(encodedUsername) : null;

    // Server-side Dropbox download function
    const downloadResume = async (fileName) => {
        try {
            setLoading(true);
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
            setLoading(false);
        }
    };

    // Server-side Dropbox upload function
    const uploadResume = async () => {
        if (!selectedFile) {
            alert("გთხოვ აირჩიე ფაილი");
            return;
        }

        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));

            const formData = new FormData();
            formData.append('resume', selectedFile);

            const response = await fetch(`http://127.0.0.1:25608/upload-resume`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                alert("ფაილი აიტვირთა და შეინახა წარმატებით!");

                // Update user data with new resume file name
                setUserData(prevData => ({
                    ...prevData,
                    resume_file: result.fileName
                }));
            } else {
                const errorData = await response.json();
                console.error("Upload Error:", errorData);
                alert(`ატვირთვის შეცდომა: ${errorData.message || 'უცნობი შეცდომა'}`);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("ატვირთვის შეცდომა");
        } finally {
            setLoading(false);
            setSelectedFile(null);
        }
    };

    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [activeTab, setActiveTab] = useState('about');
    const [previousChats, setPreviousChats] = useState([]);
    const [chatsLoading, setChatsLoading] = useState(false);

    // Function to generate profile image based on username
    const generateProfileImage = (username) => {
        if (!username) return '';
        
        const firstLetter = username.charAt(0).toUpperCase();
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
            '#0ABDE3', '#10AC84', '#F79F1F', '#A3CB38', '#FDA7DF'
        ];
        
        const colorIndex = username.charCodeAt(0) % colors.length;
        const backgroundColor = colors[colorIndex];
        
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="40" fill="${backgroundColor}"/>
                <text x="40" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">${firstLetter}</text>
            </svg>
        `)}`;
    };

    // Function to fetch previous chats
    const fetchPreviousChats = async () => {
        try {
            setChatsLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch('http://127.0.0.1:25608/api/previous-chats', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch previous chats');
            }

            const data = await response.json();
            setPreviousChats(data.previous_chats || []);
        } catch (error) {
            console.error('Error fetching previous chats:', error);
            setPreviousChats([]);
        } finally {
            setChatsLoading(false);
        }
    };

    // Function to handle chat click
    const handleChatClick = (otherUserId) => {
        router.push(`/pages/Chat/${otherUserId}`);
    };

    // Function to handle chat deletion
    const handleDeleteChat = async (otherUserId, e) => {
        e.stopPropagation(); // Prevent chat click event
        
        if (!confirm('ნამდვილად გსურთ ამ საუბრის წაშლა თქვენი ისტორიიდან?')) {
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://127.0.0.1:25608/api/previous-chats/${otherUserId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Remove the chat from the local state
                setPreviousChats(prev => 
                    prev.filter(chat => chat.other_user_id !== otherUserId)
                );
            } else {
                throw new Error('Failed to delete chat');
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            alert('საუბრის წაშლა ვერ მოხერხდა');
        }
    };

    // Function to format last message time
    const formatLastMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            return diffInMinutes < 1 ? 'ახლახან' : `${diffInMinutes} წუთის წინ`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} საათის წინ`;
        } else if (diffInDays < 7) {
            return `${Math.floor(diffInDays)} დღის წინ`;
        } else {
            return date.toLocaleDateString('ka-GE');
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);

        if (!username) {
            if (user?.username) {
                router.push(`/pages/profile/${encodeURIComponent(user.username)}`);
            }
            return;
        }

        const isOwner = user?.username === username;
        setIsOwnProfile(isOwner);

        const fetchProfileData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:25608/profile/${encodeURIComponent(username)}`, {
                    headers: user?.token ? {
                        'Authorization': `Bearer ${user.token}`
                    } : {}
                });

                if (!response.ok) {
                    throw new Error('პროფილის მონაცემების მიღება ვერ მოხერხდა');
                }

                const data = await response.json();
                setUserData(data);
                setEducation(data.education || []);
                setExperience(data.experience || []);

                if (isOwner) {
                    setFormData({
                        name: data.username || '',
                        job: data.job || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        cover_letter: data.cover_letter || '',
                        paypal_email: data.paypal_email || '', // Initialize paypal_email
                    });
                    
                    // Fetch previous chats only for own profile
                    fetchPreviousChats();
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [username, router]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://127.0.0.1:25608/profile/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...formData,
                    education: education,
                    experience: experience,
                    paypal_email: formData.paypal_email, // Send paypal_email in the update request
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'პროფილის განახლება ვერ მოხერხდა');
            }

            const data = await response.json();
            setUserData(prevData => ({
                ...prevData,
                username: formData.name,
                job: formData.job,
                phone: formData.phone,
                address: formData.address,
                cover_letter: formData.cover_letter,
                paypal_email: formData.paypal_email, // Update local state with new paypal_email
                education: education,
                experience: experience
            }));
            setIsEditing(false);
            alert('პროფილი წარმატებით განახლდა!');
        } catch (err) {
            console.error("Profile update error:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEducationChange = (index, field, value) => {
        const newEducation = [...education];
        newEducation[index] = {
            ...newEducation[index],
            [field]: value
        };
        setEducation(newEducation);
    };

    const handleExperienceChange = (index, field, value) => {
        const newExperience = [...experience];
        newExperience[index] = {
            ...newExperience[index],
            [field]: value
        };
        setExperience(newExperience);
    };

    const addEducation = () => {
        setEducation([...education, {
            degree: '',
            field: '',
            start_date: '',
            end_date: '',
            school_name: ''
        }]);
    };

    const addExperience = () => {
        setExperience([...experience, {
            position: '',
            company_name: '',
            start_date: '',
            end_date: ''
        }]);
    };

    const handleDeleteEducation = async (educationId) => {
        if (!window.confirm('ნამდვილად გსურთ განათლების ჩანაწერის წაშლა?')) {
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://127.0.0.1:25608/profile/${username}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    type: 'education',
                    id: educationId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'განათლების ჩანაწერის წაშლა ვერ მოხერხდა');
            }

            setEducation(prevEducation =>
                prevEducation.filter(edu => edu.id !== educationId)
            );
            alert('განათლების ჩანაწერი წარმატებით წაიშალა!');
        } catch (err) {
            console.error("Delete education error:", err.message);
            setError(err.message);
        }
    };

    const handleDeleteExperience = async (experienceId) => {
        if (!window.confirm('ნამდვილად გსურთ გამოცდილების ჩანაწერის წაშლა?')) {
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://127.0.0.1:25608/profile/${username}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    type: 'experience',
                    id: experienceId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'გამოცდილების ჩანაწერის წაშლა ვერ მოხერხდა');
            }

            setExperience(prevExperience =>
                prevExperience.filter(exp => exp.id !== experienceId)
            );
            alert('გამოცდილების ჩანაწერი წარმატებით წაიშალა!');
        } catch (err) {
            console.error("Delete experience error:", err.message);
            setError(err.message);
        }
    };

    const deleteProfile = async () => {
        const isConfirmed = window.confirm(
            'ნამდვილად გსურთ თქვენი პროფილის წაშლა? ეს მოქმედება შეუქცევადია და ყველა თქვენი მონაცემი წაიშლება.'
        );

        if (!isConfirmed) {
            return;
        }

        const finalConfirmation = window.confirm(
            'ბოლო გაფრთხილება! ამ მოქმედების შემდეგ თქვენი ანგარიში და ყველა მონაცემი სამუდამოდ წაიშლება. გაგრძელება?'
        );

        if (!finalConfirmation) {
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));

            if (!user || !user.token) {
                alert('ავტორიზაციის შეცდომა. გთხოვთ, თავიდან შეხვიდეთ სისტემაში.');
                return;
            }

            const currentUsername = user.username || user.name;

            if (!currentUsername) {
                alert('მომხმარებლის სახელი ვერ მოიძებნა.');
                return;
            }

            setLoading(true); // Set loading state for the button

            const response = await fetch(`http://127.0.0.1:25608/profile/${currentUsername}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    type: "profile"
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('პროფილი წარმატებით წაიშალა.');
                localStorage.removeItem('user');
                localStorage.clear();
                window.location.href = '/pages/SignIn';

            } else {
                throw new Error(data.message || 'პროფილის წაშლისას მოხდა შეცდომა');
            }

        } catch (error) {
            console.error('Profile deletion error:', error);
            alert(`შეცდომა: ${error.message}`);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const deleteResume = async () => {
        if (!window.confirm('ნამდვილად გსურთ რეზიუმეს წაშლა?')) {
            return;
        }

        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));

            const response = await fetch(`http://127.0.0.1:25608/delete-resume`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    fileName: userData.resume_file
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'რეზიუმეს წაშლა ვერ მოხერხდა');
            }

            setUserData(prevData => ({
                ...prevData,
                resume_file: null
            }));

            alert("რეზიუმე წარმატებით წაიშალა!");

        } catch (err) {
            console.error('Resume deletion error:', err);
            alert(`რეზიუმეს წაშლის შეცდომა: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleViewDetails = (jobId) => {
        localStorage.setItem('jobId', jobId);
        router.push(`/pages/JobDetail`);
    };

    if (loading && !userData) return ( // Only show full loading screen if no user data yet
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>მიმდინარეობს ჩამოტვირთვა...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <div className="error-icon">❌</div>
            <p>შეცდომა: {error}</p>
            <button onClick={() => window.location.reload()}>სცადეთ თავიდან</button>
        </div>
    );

    if (!userData) return (
        <div className="not-found-container">
            <div className="not-found-icon">🔍</div>
            <p>პროფილი ვერ მოიძებნა</p>
            <button onClick={() => router.push('/')}>მთავარ გვერდზე დაბრუნება</button>
        </div>
    );

    const profileImage = userData.profileImage
        ? userData.profileImage
        : `https://ui-avatars.com/api/?name=${userData.username[0]}`;

    const renderTabContent = () => {
        if (isEditing) {
            return renderEditForm();
        }

        switch (activeTab) {
            case 'about':
                return (
                    <div className="tab-content">
                        <section className="about-section">
                            <h2>პროფესიული შეჯამება</h2>
                            <p>{userData.cover_letter || 'შეჯამება არ არის მითითებული.'}</p>
                        </section>
                    </div>
                );
            case 'education':
                return (
                    <div className="tab-content">
                        <section className="education-section">
                            <h2>განათლება</h2>
                            {education.length > 0 ? (
                                <div className="education-grid">
                                    {education.map((edu, index) => (
                                        <div key={index} className="education-card">
                                            <div className="education-header">
                                                <BookOpen size={20} />
                                                <h3>{edu.degree} - {edu.field}</h3>
                                            </div>
                                            <div className="education-body">
                                                <p className="school-name">{edu.school_name}</p>
                                                <p className="date-range">
                                                    <CalendarIcon size={16} />
                                                    <span>{edu.start_date} - {edu.end_date}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">განათლება არ არის მითითებული.</p>
                            )}
                        </section>
                    </div>
                );
            case 'experience':
                return (
                    <div className="tab-content">
                        <section className="experience-section">
                            <h2>გამოცდილება</h2>
                            {experience.length > 0 ? (
                                <div className="experience-grid">
                                    {experience.map((exp, index) => (
                                        <div key={index} className="experience-card">
                                            <div className="experience-header">
                                                <Briefcase size={20} />
                                                <h3>{exp.position}</h3>
                                            </div>
                                            <div className="experience-body">
                                                <p className="company-name">{exp.company_name}</p>
                                                <p className="date-range">
                                                    <CalendarIcon size={16} />
                                                    <span>{exp.start_date} - {exp.end_date}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">გამოცდილება არ არის მითითებული.</p>
                            )}
                        </section>
                    </div>
                );
            case 'resume':
                return (
                    <div className="tab-content">
                        <section className="resume-section">
                            <h2>რეზიუმე</h2>

                            {/* Display existing resume if available */}
                            {userData.resume_file && (
                                <div className="resume-display">
                                    <div className="resume-card">
                                        <div className="resume-icon">
                                            <FileText size={48} />
                                        </div>
                                        <div className="resume-info">
                                            <h3>ატვირთული რეზიუმე</h3>
                                            <p className="resume-filename">{userData.resume_file}</p>
                                            <div className="resume-actions">
                                                <button
                                                    className="download-button"
                                                    onClick={() => downloadResume(userData.resume_file)}
                                                    disabled={loading}
                                                >
                                                    <Download size={18} />
                                                    {loading ? 'მიმდინარეობს...' : 'გადმოწერა'}
                                                </button>
                                                {/* წაშლა მხოლოდ საკუთარი პროფილისთვის */}
                                                {isOwnProfile && (
                                                    <button
                                                        className="delete-resume-button"
                                                        onClick={deleteResume}
                                                        disabled={loading}
                                                    >
                                                        <Trash2 size={18} />
                                                        {loading ? 'მიმდინარეობს...' : 'წაშლა'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ატვირთვის ზონა - მხოლოდ საკუთარი პროფილისთვის და თუ რეზიუმე არ არის ატვირთული */}
                            {isOwnProfile && !userData.resume_file && (
                                <div className="upload-area">
                                    <input
                                        type="file"
                                        id="resume"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx"
                                    />
                                    <label htmlFor="resume">
                                        {selectedFile ? (
                                            <div className="selected-file">
                                                <FileText size={24} />
                                                <span>{selectedFile.name}</span>
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <div className="upload-icon">📄</div>
                                                <p>აირჩიეთ ფაილი ან ჩააგდეთ აქ</p>
                                                <small>მხარდაჭერილი ფორმატები: PDF, DOC, DOCX</small>
                                            </div>
                                        )}
                                    </label>

                                    {selectedFile && (
                                        <button
                                            className="upload-button"
                                            onClick={uploadResume}
                                            disabled={loading}
                                        >
                                            {loading ? 'მიმდინარეობს...' : 'ატვირთე'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* არ არის რეზიუმე და არ არის საკუთარი პროფილი */}
                            {!userData.resume_file && !isOwnProfile && (
                                <div className="no-resume">
                                    <FileText size={48} className="no-resume-icon" />
                                    <p>რეზიუმე არ არის ატვირთული</p>
                                </div>
                            )}

                            {/* არ არის რეზიუმე და არის საკუთარი პროფილი */}
                            {!userData.resume_file && isOwnProfile && (
                                <div className="no-resume">
                                    <FileText size={48} className="no-resume-icon" />
                                    <p>ჯერ არ გაქვთ ატვირთული რეზიუმე</p>
                                    <small>გამოიყენეთ ზემოთ მდებარე ფორმა ატვირთვისთვის</small>
                                </div>
                            )}
                        </section>
                    </div>
                );
            case 'jobs':
                return (
                    <div className="tab-content">
                        <section className="jobs-section">
                            <h2>გამოქვეყნებული სამუშაოები</h2>
                            {userData.jobs && userData.jobs.length > 0 ? (
                                <div className="jobs-grid">
                                    {userData.jobs.map((job, index) => (
                                        <article key={index} className="job-card">
                                            <div className="job-header">
                                                <h3 title={job.title}>
                                                    {job.title.length > 50 ? `${job.title.substring(0, 50)}...` : job.title}
                                                </h3>
                                            </div>
                                            <div className="job-details">
                                                <div className="detail-item">
                                                    <span className="icon">💰</span>
                                                    <span className="value">{job.min_budget} ₾ - {job.max_budget} ₾</span>
                                                </div>
                                            </div>
                                            <p className="job-description" title={job.description}>
                                                {job.description.length > 100 ?
                                                    `${job.description.substring(0, 100)}...` :
                                                    job.description}
                                            </p>
                                            <div className="job-footer">
                                                <span className="date">{job.created_at}</span>
                                                <button className="view-details" onClick={() => handleViewDetails(job.id)}>
                                                    დეტალურად
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">სამუშაოები არ არის გამოქვეყნებული.</p>
                            )}
                        </section>
                    </div>
                );
            case 'chats':
                return (
                    <div className="tab-content">
                        <section className="chats-section">
                            <div className="chats-header">
                                <h2>წინა საუბრები</h2>
                                <p className="chats-count">{previousChats.length} საუბარი</p>
                            </div>

                            {chatsLoading ? (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p>იტვირთება...</p>
                                </div>
                            ) : previousChats.length === 0 ? (
                                <div className="no-chats-container">
                                    <div className="no-chats-icon">
                                        <MessageCircle size={48} />
                                    </div>
                                    <h3>საუბრები არ მოიძებნა</h3>
                                    <p>თქვენ ჯერ არ გაქვთ საუბრის ისტორია</p>
                                </div>
                            ) : (
                                <div className="chats-list">
                                    {previousChats.map((chat) => (
                                        <div
                                            key={chat.id}
                                            className="chat-item"
                                            onClick={() => handleChatClick(chat.other_user_id)}
                                        >
                                            <div className="chat-avatar">
                                                <img 
                                                    src={generateProfileImage(chat.other_user_name)} 
                                                    alt={chat.other_user_name || 'User'} 
                                                />
                                            </div>
                                            
                                            <div className="chat-info">
                                                <div className="chat-header-info">
                                                    <h3 className="chat-user-name">
                                                        {chat.other_user_name || 'Unknown User'}
                                                    </h3>
                                                    <span className="chat-time">
                                                        {formatLastMessageTime(chat.last_message_at)}
                                                    </span>
                                                </div>
                                                
                                                <div className="chat-preview">
                                                    <p className="last-message-preview">
                                                        ბოლო საუბარი იყო {formatLastMessageTime(chat.last_message_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="chat-actions">
                                                <button
                                                    className="delete-chat-btn"
                                                    onClick={(e) => handleDeleteChat(chat.other_user_id, e)}
                                                    title="საუბრის წაშლა"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                );
            default:
                return <div className="tab-content">კონტენტი ვერ მოიძებნა</div>;
        }
    };

    const renderEditForm = () => {
        return (
            <form onSubmit={handleUpdate} className="edit-form">
                <div className="form-section">
                    <h2>ძირითადი ინფორმაცია</h2>
                    <div className="form-group">
                        <label>სახელი</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>სამუშაო პოზიცია</label>
                        <input
                            type="text"
                            name="job"
                            value={formData.job}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group half">
                            <label>ტელეფონი</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group half">
                            <label>მისამართი</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>PayPal ელ.ფოსტა (გადახდებისთვის)</label>
                        <input
                            type="email"
                            name="paypal_email"
                            value={formData.paypal_email}
                            onChange={handleChange}
                            placeholder="your.paypal@example.com"
                        />
                        <small>ეს ელ.ფოსტა გამოყენებული იქნება PayPal-ის მეშვეობით გადახდების მისაღებად.</small>
                    </div>
                    <div className="form-group">
                        <label>პროფესიული შეჯამება</label>
                        <textarea
                            name="cover_letter"
                            value={formData.cover_letter}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <div className="section-header">
                        <h2>განათლება</h2>
                        <button type="button" className="add-button" onClick={addEducation}>
                            <Plus size={18} />
                            <span>დამატება</span>
                        </button>
                    </div>
                    {education.map((edu, index) => (
                        <div key={index} className="form-card">
                            <div className="form-card-header">
                                <h3>განათლება #{index + 1}</h3>
                                <button
                                    type="button"
                                    className="delete-button"
                                    onClick={() => handleDeleteEducation(edu.id)}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="form-card-body">
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>ხარისხი</label>
                                        <input
                                            type="text"
                                            value={edu.degree || ''}
                                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>სფერო</label>
                                        <input
                                            type="text"
                                            value={edu.field || ''}
                                            onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>სასწავლებლის სახელი</label>
                                    <input
                                        type="text"
                                        value={edu.school_name || ''}
                                        onChange={(e) => handleEducationChange(index, 'school_name', e.target.value)}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>დაწყების თარიღი</label>
                                        <input
                                            type="date"
                                            value={edu.start_date || ''}
                                            onChange={(e) => handleEducationChange(index, 'start_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>დასრულების თარიღი</label>
                                        <input
                                            type="date"
                                            value={edu.end_date || ''}
                                            onChange={(e) => handleEducationChange(index, 'end_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="form-section">
                    <div className="section-header">
                        <h2>გამოცდილება</h2>
                        <button type="button" className="add-button" onClick={addExperience}>
                            <Plus size={18} />
                            <span>დამატება</span>
                        </button>
                    </div>
                    {experience.map((exp, index) => (
                        <div key={index} className="form-card">
                            <div className="form-card-header">
                                <h3>გამოცდილება #{index + 1}</h3>
                                <button
                                    type="button"
                                    className="delete-button"
                                    onClick={() => handleDeleteExperience(exp.id)}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="form-card-body">
                                <div className="form-group">
                                    <label>პოზიცია</label>
                                    <input
                                        type="text"
                                        value={exp.position || ''}
                                        onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>კომპანიის სახელი</label>
                                    <input
                                        type="text"
                                        value={exp.company_name || ''}
                                        onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>დაწყების თარიღი</label>
                                        <input
                                            type="date"
                                            value={exp.start_date || ''}
                                            onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>დასრულების თარიღი</label>
                                        <input
                                            type="date"
                                            value={exp.end_date || ''}
                                            onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="form-actions">
                    <button type="submit" className="save-button" disabled={loading}>
                        {loading ? 'მიმდინარეობს...' : 'შენახვა'}
                    </button>
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => setIsEditing(false)}
                    >
                        გაუქმება
                    </button>
                </div>
            </form>
        );
    };

    return (
        <>
            <Header />
            <div className="profile-page">
                <div className="profile-header-bg">
                    <div className="profile-header-content">
                        <div className="profile-avatar">
                            <img src={profileImage} alt={userData.username} />
                        </div>
                        <div className="profile-header-info">
                            <h1>{userData.username}</h1>
                            <p className="profile-title">{userData.job || 'პროფესია არ არის მითითებული'}</p>
                            <div className="profile-badges">
                                <span className={`badge ${userData.is_confirmed ? 'verified' : 'unverified'}`}>
                                    {userData.is_confirmed ? '✓ ვერიფიცირებული' : 'არავერიფიცირებული'}
                                </span>
                                <span className="badge role">{userData.role}</span>
                            </div>
                        </div>
                        <div className="profile-actions">
                            {isOwnProfile ? (
                                <button
                                    className={isEditing ? "edit-button active" : "edit-button"}
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    <Edit size={16} />
                                    <span>{isEditing ? 'რედაქტირების რეჟიმი' : 'პროფილის რედაქტირება'}</span>
                                </button>
                            ) : (
                                <button
                                    className="message-button"
                                    onClick={() => router.push(`/pages/Chat/${userData.user_id}`)}
                                >
                                    <Mail size={16} />
                                    <span>მიწერა</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-container">
                    <div className="profile-sidebar">
                        <div className="sidebar-section contact-info">
                            <h3>საკონტაქტო ინფორმაცია</h3>
                            <ul>
                                <li>
                                    <Mail size={16} />
                                    <span>{userData.email}</span>
                                </li>
                                {userData.phone && (
                                    <li>
                                        <Phone size={16} />
                                        <span>{userData.phone}</span>
                                    </li>
                                )}
                                {userData.address && (
                                    <li>
                                        <MapPin size={16} />
                                        <span>{userData.address}</span>
                                    </li>
                                )}
                                {userData.paypal_email && ( // Display PayPal email if available
                                    <li>
                                        <Mail size={16} />
                                        <span>{userData.paypal_email} (PayPal)</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="sidebar-section stats">
                            <h3>სტატისტიკა</h3>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <span className="stat-value">{userData.recoins}</span>
                                    <span className="stat-label">ReCoins</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-value">₾{userData.totalEarnings}</span>
                                    <span className="stat-label">შემოსავალი</span>
                                </div>
                            </div>
                        </div>

                        {!isEditing && (
                            <div className="sidebar-section quick-actions">
                                {isOwnProfile && (
                                    <button className="danger-button" onClick={deleteProfile}>
                                        <Trash2 size={16} />
                                        <span>პროფილის წაშლა</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="profile-main">
                        {!isEditing && (
                            <div className="profile-tabs">
                                <button
                                    className={activeTab === 'about' ? 'active' : ''}
                                    onClick={() => setActiveTab('about')}
                                >
                                    შეჯამება
                                </button>
                                <button
                                    className={activeTab === 'education' ? 'active' : ''}
                                    onClick={() => setActiveTab('education')}
                                >
                                    განათლება
                                </button>
                                <button
                                    className={activeTab === 'experience' ? 'active' : ''}
                                    onClick={() => setActiveTab('experience')}
                                >
                                    გამოცდილება
                                </button>
                                <button
                                    className={activeTab === 'resume' ? 'active' : ''}
                                    onClick={() => setActiveTab('resume')}
                                >
                                    რეზიუმე
                                </button>
                                <button
                                    className={activeTab === 'jobs' ? 'active' : ''}
                                    onClick={() => setActiveTab('jobs')}
                                >
                                    სამუშაოები
                                </button>
                                {/* Only show chats tab for own profile */}
                                {isOwnProfile && (
                                    <button
                                        className={activeTab === 'chats' ? 'active' : ''}
                                        onClick={() => setActiveTab('chats')}
                                    >
                                        წინა საუბრები
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="profile-content">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Profile;