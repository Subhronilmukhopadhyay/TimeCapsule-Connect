// pages/ViewCapsule.jsx
import React, { useState, useEffect } from 'react';
import { Slate, Editable } from 'slate-react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { loadCapsule } from '../services/capsule-storage';
import styles from '../styles/View-Capsule.module.css';

// Icons (assuming you have these or can replace with your icon library)
import { 
  BookOpen, 
  Calendar, 
  User, 
  Share2, 
  Download, 
  Printer, 
  Moon, 
  Sun,
  ArrowLeft,
  Heart,
  Bookmark
} from 'lucide-react';

/**
 * Header component for the view-only capsule page
 */
const ViewHeader = ({ 
  title, 
  author, 
  createdAt, 
  onBack, 
  onShare, 
  onDownload, 
  onPrint,
  darkMode,
  toggleDarkMode,
  isLiked,
  onLike,
  isBookmarked,
  onBookmark
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className={styles.viewHeader}>
      <div className={styles.headerTop}>
        <button 
          className={styles.backButton} 
          onClick={onBack}
          title="Go back"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className={styles.headerActions}>
          <button 
            className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
            onClick={onLike}
            title="Like capsule"
          >
            <Heart size={18} />
          </button>
          
          <button 
            className={`${styles.actionButton} ${isBookmarked ? styles.bookmarked : ''}`}
            onClick={onBookmark}
            title="Bookmark capsule"
          >
            <Bookmark size={18} />
          </button>

          <button 
            className={styles.actionButton} 
            onClick={onShare}
            title="Share capsule"
          >
            <Share2 size={18} />
          </button>

          <button 
            className={styles.actionButton} 
            onClick={onDownload}
            title="Download capsule"
          >
            <Download size={18} />
          </button>

          <button 
            className={styles.actionButton} 
            onClick={onPrint}
            title="Print capsule"
          >
            <Printer size={18} />
          </button>

          <button 
            className={styles.actionButton} 
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.capsuleTitle}>{title || 'Untitled Capsule'}</h1>
          
          <div className={styles.capsuleMeta}>
            {author && (
              <div className={styles.metaItem}>
                <User size={16} />
                <span>By {author}</span>
              </div>
            )}
            
            {createdAt && (
              <div className={styles.metaItem}>
                <Calendar size={16} />
                <span>{formatDate(createdAt)}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.readingIndicator}>
          <BookOpen size={20} />
          <span>Reading Mode</span>
        </div>
      </div>
    </header>
  );
};

/**
 * Main content area for the view-only capsule
 */
const ViewContent = ({ editor, value, darkMode }) => {
  // Create a read-only editor instance
  const readOnlyEditor = React.useMemo(() => {
    const e = withReact(createEditor());
    e.isReadOnly = true;
    return e;
  }, []);

  return (
    <div className={`${styles.viewContent} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.contentContainer}>
        <Slate editor={readOnlyEditor} initialValue={value}>
          <Editable
            readOnly
            className={styles.readOnlyEditor}
            placeholder="This capsule appears to be empty..."
          />
        </Slate>
      </div>
    </div>
  );
};

/**
 * Reading progress indicator
 */
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className={styles.progressContainer}>
      <div 
        className={styles.progressBar}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

/**
 * Main ViewCapsule component
 */
const ViewCapsule = ({ 
  capsuleId, 
  initialTitle = '',
  initialAuthor = '',
  initialCreatedAt = null,
  initialValue = [{ type: 'paragraph', children: [{ text: '' }] }]
}) => {
  // State management
  const [capsuleData, setCapsuleData] = useState({
    title: initialTitle,
    author: initialAuthor,
    createdAt: initialCreatedAt,
    content: initialValue
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Create editor instance
  const editor = React.useMemo(() => withReact(createEditor()), []);

  // Extract capsule ID from URL if not provided
  useEffect(() => {
    const extractIdFromUrl = () => {
      const pathParts = window.location.pathname.split('/');
      const lastPathPart = pathParts[pathParts.length - 1];
      
      if (lastPathPart && lastPathPart.includes('-')) {
        return lastPathPart;
      }
      return null;
    };

    const effectiveId = capsuleId || extractIdFromUrl();
    
    if (effectiveId) {
      loadCapsuleData(effectiveId);
    } else {
      setError('No capsule ID provided');
      setIsLoading(false);
    }
  }, [capsuleId]);

  // Load capsule data from backend
  const loadCapsuleData = async (id) => {
    try {
      setIsLoading(true);
      
      // Use your capsule-storage service
      const data = await loadCapsule(id);
      
      setCapsuleData({
        title: data.title || 'Untitled Capsule',
        author: data.author || 'Unknown Author',
        createdAt: data.createdAt || data.updatedAt,
        content: data.content || [{ type: 'paragraph', children: [{ text: '' }] }]
      });
      
      // Load user preferences (if available in the data)
      setIsLiked(data.isLiked || false);
      setIsBookmarked(data.isBookmarked || false);
      
    } catch (err) {
      console.error('Error loading capsule:', err);
      setError(err.message || 'Failed to load capsule');
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleBack = () => {
    window.history.back();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: capsuleData.title,
          text: `Check out this capsule: ${capsuleData.title}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast notification here
    }
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Download capsule');
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // API call to update like status
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // API call to update bookmark status
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <BookOpen size={32} />
          <p>Loading capsule...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={handleBack} className={styles.backButton}>
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.viewCapsulePage} ${darkMode ? styles.darkMode : ''}`}>
      <ReadingProgress />
      
      <ViewHeader
        title={capsuleData.title}
        author={capsuleData.author}
        createdAt={capsuleData.createdAt}
        onBack={handleBack}
        onShare={handleShare}
        onDownload={handleDownload}
        onPrint={handlePrint}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        isLiked={isLiked}
        onLike={handleLike}
        isBookmarked={isBookmarked}
        onBookmark={handleBookmark}
      />

      <ViewContent
        editor={editor}
        value={capsuleData.content}
        darkMode={darkMode}
      />
    </div>
  );
};

export default ViewCapsule;