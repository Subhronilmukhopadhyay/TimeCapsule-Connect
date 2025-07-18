// pages/ViewCapsule.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Bookmark,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

/**
 * Extract a Google Drive thumbnail URL from a full Google Drive URL.
 */
function getDriveThumbnailUrl(url) {
  if (!url) return url;
  const match = url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600` : url;
}

/**
 * Content Container zoom utility functions
 */
const ContentZoom = {
  // Get saved zoom level from localStorage
  getSavedZoomLevel: () => {
    const saved = localStorage.getItem('viewCapsuleZoomLevel');
    return saved ? parseFloat(saved) : 1;
  },

  // Save zoom level to localStorage
  saveZoomLevel: (zoomLevel) => {
    localStorage.setItem('viewCapsuleZoomLevel', zoomLevel.toString());
  },

  // Clean up zoom when component unmounts
  cleanup: () => {
    localStorage.removeItem('viewCapsuleZoomLevel');
  }
};

/**
 * Media Element component for displaying images, videos, audio, and files
 */
const MediaElement = ({ attributes, children, element, mediaType }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const renderMedia = () => {
    const url = getDriveThumbnailUrl(element.url);
    
    switch (mediaType) {
      case 'image':
        return (
          <div className={styles.imageContainer}>
            {isLoading && <div className={styles.mediaLoading}>Loading image...</div>}
            {hasError && <div className={styles.mediaError}>Failed to load image</div>}
            <img
              src={url}
              alt={element.alt || 'Image'}
              onLoad={handleLoad}
              onError={handleError}
              style={{ 
                display: isLoading || hasError ? 'none' : 'block',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </div>
        );
      case 'video':
        return (
          <div className={styles.videoContainer}>
            <video
              src={url}
              controls
              style={{ maxWidth: '100%', height: 'auto' }}
              onLoadedData={handleLoad}
              onError={handleError}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'audio':
        return (
          <div className={styles.audioContainer}>
            <audio
              src={url}
              controls
              style={{ width: '100%' }}
              onLoadedData={handleLoad}
              onError={handleError}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      case 'file':
        return (
          <div className={styles.fileContainer}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              📎 {element.name || 'Download File'}
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div {...attributes} contentEditable={false}>
      {renderMedia()}
      {children}
    </div>
  );
};

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
  onBookmark,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom
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

          <div className={styles.zoomControls}>
            <button 
              className={styles.actionButton} 
              onClick={onZoomOut}
              title="Zoom out (Ctrl + -)"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut size={18} />
            </button>
            
            <span className={styles.zoomLevel} title="Current zoom level">
              {Math.round(zoomLevel * 100)}%
            </span>
            
            <button 
              className={styles.actionButton} 
              onClick={onZoomIn}
              title="Zoom in (Ctrl + +)"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn size={18} />
            </button>
            
            <button 
              className={styles.actionButton} 
              onClick={onResetZoom}
              title="Reset zoom (Ctrl + 0)"
            >
              <RotateCcw size={18} />
            </button>
          </div>

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
 * Main content area for the view-only capsule with PDF-like zoom
 */
const ViewContent = ({ value, darkMode, zoomLevel }) => {
  // Create a read-only editor instance
  const readOnlyEditor = React.useMemo(() => {
    const e = withReact(createEditor());
    e.isReadOnly = true;
    return e;
  }, []);

  // Render element function similar to CanvasWorkspace
  const renderElement = useCallback(props => {
    const type = props.element.type;
    
    switch (type) {
      case 'image':
      case 'video':
      case 'audio':
      case 'file':
        return <MediaElement {...props} mediaType={type} />;
      case 'heading-one':
        return <h1 {...props.attributes}>{props.children}</h1>;
      case 'heading-two':
        return <h2 {...props.attributes}>{props.children}</h2>;
      case 'heading-three':
        return <h3 {...props.attributes}>{props.children}</h3>;
      case 'bulleted-list':
        return <ul {...props.attributes}>{props.children}</ul>;
      case 'numbered-list':
        return <ol {...props.attributes}>{props.children}</ol>;
      case 'list-item':
        return <li {...props.attributes}>{props.children}</li>;
      case 'block-quote':
        return <blockquote {...props.attributes}>{props.children}</blockquote>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  // Render leaf function to handle text formatting
  const renderLeaf = useCallback(props => {
    let { attributes, children, leaf } = props;
    
    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }
    
    if (leaf.italic) {
      children = <em>{children}</em>;
    }
    
    if (leaf.underline) {
      children = <u>{children}</u>;
    }
    
    if (leaf.strikethrough) {
      children = <s>{children}</s>;
    }
    
    if (leaf.code) {
      children = <code>{children}</code>;
    }

    // Add font styling
    const style = {};
    
    if (leaf.fontFamily) {
      style.fontFamily = leaf.fontFamily;
    }
    
    if (leaf.fontSize) {
      style.fontSize = leaf.fontSize;
    }
    
    if (leaf.color) {
      style.color = leaf.color;
    }
    
    if (leaf.backgroundColor) {
      style.backgroundColor = leaf.backgroundColor;
    }
    
    return <span {...attributes} style={style}>{children}</span>;
  }, []);

  return (
    <div className={`${styles.viewContent} ${darkMode ? styles.darkMode : ''}`}>
      {/* Scrollable container for zoomed content */}
      <div className={styles.zoomScrollContainer}>
        <div 
          className={styles.contentContainer}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.3s ease-in-out',
            // Calculate the scaled width to maintain proper centering
            width: `${100 / zoomLevel}%`,
            // Add some padding when zoomed to prevent content touching edges
            padding: zoomLevel > 1 ? `${20 * zoomLevel}px` : '20px',
            // Ensure minimum height for proper scrolling
            minHeight: '100vh',
            // Center the content horizontally
            margin: '0 auto',
            // Add background for better PDF-like appearance
            backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
            boxShadow: zoomLevel > 1 ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
            borderRadius: zoomLevel > 1 ? '8px' : '0',
            // Ensure content doesn't get cut off
            overflow: 'visible'
          }}
        >
          <Slate editor={readOnlyEditor} initialValue={value}>
            <Editable
              readOnly
              className={styles.readOnlyEditor}
              placeholder="This capsule appears to be empty..."
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              style={{
                // Ensure text remains readable at all zoom levels
                lineHeight: '1.6',
                fontSize: '16px',
                color: darkMode ? '#ffffff' : '#000000'
              }}
            />
          </Slate>
        </div>
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
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial calculation
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
  const [zoomLevel, setZoomLevel] = useState(1); // Default zoom level (100%)

  // Initialize zoom level from localStorage
  useEffect(() => {
    const savedZoom = ContentZoom.getSavedZoomLevel();
    if (savedZoom !== 1) {
      setZoomLevel(savedZoom);
    }
  }, []);

  // Save zoom level whenever it changes
  useEffect(() => {
    ContentZoom.saveZoomLevel(zoomLevel);
  }, [zoomLevel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Keep zoom level saved for future visits
      // ContentZoom.cleanup();
    };
  }, []);

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
      
      // Process content to fix Google Drive image URLs
      const processedContent = data.content ? data.content.map(item => {
        if (item.type === 'image' && item.url) {
          return { ...item, url: getDriveThumbnailUrl(item.url) };
        }
        return item;
      }) : [{ type: 'paragraph', children: [{ text: '' }] }];
      
      setCapsuleData({
        title: data.title || 'Untitled Capsule',
        author: data.author || 'Unknown Author',
        createdAt: data.createdAt || data.updatedAt,
        content: processedContent
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
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You might want to show a toast notification here
        alert('Link copied to clipboard!');
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Download capsule');
    // You can implement this by converting content to PDF or other formats
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
    // You can implement this with your backend API
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // API call to update bookmark status
    // You can implement this with your backend API
  };

  // Enhanced zoom functionality
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => {
      const newZoom = Math.min(prevZoom + 0.1, 3); // Max zoom 300%
      return Math.round(newZoom * 10) / 10; // Round to 1 decimal place
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prevZoom => {
      const newZoom = Math.max(prevZoom - 0.1, 0.5); // Min zoom 50%
      return Math.round(newZoom * 10) / 10; // Round to 1 decimal place
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1); // Reset to 100%
  };

  // Enhanced keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleResetZoom();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Enhanced mouse wheel zoom (with Ctrl/Cmd key) - only on content area
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        // More granular zoom steps for mouse wheel
        const zoomStep = 0.05;
        
        if (e.deltaY < 0) {
          // Zoom in
          setZoomLevel(prevZoom => {
            const newZoom = Math.min(prevZoom + zoomStep, 3);
            return Math.round(newZoom * 20) / 20; // Round to 0.05 precision
          });
        } else {
          // Zoom out
          setZoomLevel(prevZoom => {
            const newZoom = Math.max(prevZoom - zoomStep, 0.5);
            return Math.round(newZoom * 20) / 20; // Round to 0.05 precision
          });
        }
      }
    };

    // Add event listener only to the content area
    const contentElement = document.querySelector(`.${styles.viewContent}`);
    if (contentElement) {
      contentElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => contentElement.removeEventListener('wheel', handleWheel);
    }
  }, []);

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
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />

      <ViewContent
        value={capsuleData.content}
        darkMode={darkMode}
        zoomLevel={zoomLevel}
      />
    </div>
  );
};

export default ViewCapsule;

/**
 * Loads a capsule by ID for only-view
 * @param {string} id - The capsule ID to load
 * @returns {Promise<Object>} - The capsule data
 */
export const loadViewCapsule = async (id) => {
  try {
    const { data } = await api.get(`/view/capsule/${id}`);
    return data;
  } catch (error) {
    console.error('Error loading capsule:', error);
    throw error;
  }
};