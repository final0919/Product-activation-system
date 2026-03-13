import { useState, useEffect } from 'react';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className = '',
  fallbackText = '暂无图片',
  loadingText = '加载中...',
  maxRetries = 3,
  retryDelay = 1000
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setImageSrc(src);
    setImageError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    if (retryCount < maxRetries) {
      // 重试机制
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageSrc(src); // 重新尝试加载相同图片
      }, retryDelay);
    } else {
      setImageError(true);
      setIsLoading(false);
    }
  };

  const isValidImage = (imageSrc) => {
    if (!imageSrc) return false;
    
    // 检查是否是有效的base64图片
    if (imageSrc.startsWith('data:image/')) {
      return imageSrc.length < 500 * 1024; // 限制base64图片大小为500KB
    }
    
    // 检查是否是有效的URL
    try {
      new URL(imageSrc);
      return true;
    } catch {
      return false;
    }
  };

  const shouldShowImage = isValidImage(imageSrc) && !imageError;

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm">{loadingText}</span>
        </div>
      )}
      
      {shouldShowImage ? (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm">{fallbackText}</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;