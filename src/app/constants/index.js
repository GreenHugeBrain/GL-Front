// constants/index.js

export const JOB_CATEGORIES = [
  { icon: "bi-brush", title: "გრაფიკული დიზაინი", count: 1 },
  { icon: "bi-code-slash", title: "დეველოპერი", count: 12 },
  { icon: "bi-megaphone", title: "ციფრული მარკეტინგი", count: 10 },
  { icon: "bi-camera-reels", title: "ვიდეომონტაჟი", count: 10 },
  { icon: "bi-music-note-beamed", title: "მუსიკა", count: 100 },
  { icon: "bi-bar-chart-line", title: "ფინანსები", count: 21 },
  { icon: "bi-heart-pulse", title: "ჯანმრთელობა", count: 8 },
  { icon: "bi-database", title: "მონაცემთა ანალიზი", count: 15 }
];

export const ROUTES = {
  HOME: '/',
  HIRE: '/pages/Hire',
  SIGNUP: '/pages/SignUp',
  PROFILE: (name) => `/pages/profile/${name}`
};

export const MESSAGES = {
  LOADING: 'იტვირთება პროფესიონალები...',
  NO_RESULTS: (searchTerm) => `ძებნისას არ მოიძებნა შედეგი "${searchTerm}"-სთვის`,
  RESULTS_COUNT: (count, searchTerm) => `ნაპოვნია ${count} შედეგი "${searchTerm}"-სთვის`,
  EMPTY_STATE: 'ჯერ არ არის ხელმისაწვდომი პროფესიონალები',
  CLEAR_SEARCH: 'ძებნის გასუფთავება',
  JOIN_US: 'შემოგვიერთდით'
};

export const SEARCH_PLACEHOLDERS = {
  MAIN_SEARCH: 'სამუშაო',
  PROFESSIONAL_SEARCH: 'მოძებნეთ მომხმარებელი სახელით, როლით ან სამუშაოთ...',
  PROFESSIONAL_SEARCH_MOBILE: 'მოძებნეთ პროფესიონალი...'
};

export const API_ENDPOINTS = {
  PROFESSIONAL_NETWORK: '/professional_network'
};

export const DEBOUNCE_DELAY = 300; // milliseconds