import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronUp } from 'lucide-react';
import PhotoCard from '../components/Photo/PhotoCard';
import { usePhotoStore } from '../store/photoStore';
import type { Photo } from '../types';

const TimelinePage = () => {
  const navigate = useNavigate();
  const { photos, fetchPhotos } = usePhotoStore();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhotoClick = (photo: Photo) => {
    navigate(`/photo/${photo.id}`);
  };

  const photosByYear = photos.reduce((acc, photo) => {
    const year = photo.year.toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  const sortedYears = Object.keys(photosByYear).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="min-h-screen bg-nostalgic-cream py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Clock className="w-10 h-10 text-nostalgic-orange" />
            <h1 className="text-4xl font-display font-bold text-nostalgic-brown">
              时光长廊
            </h1>
          </div>
          <p className="text-nostalgic-brownLight max-w-xl mx-auto">
            沿着时间的轨迹，重温这座城市的记忆。每一张照片都是一段珍贵的历史。
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-nostalgic-brownLighter/30" />

          {sortedYears.map((year, yearIndex) => (
            <div
              key={year}
              className="relative mb-12 animate-fade-in"
              style={{ animationDelay: `${yearIndex * 100}ms` }}
            >
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-12 h-12 bg-nostalgic-paper rounded-full border-4 border-nostalgic-orange flex items-center justify-center shadow-paper z-10">
                <span className="text-sm font-bold text-nostalgic-brown">
                  {year.slice(-2)}
                </span>
              </div>

              <div className="ml-16 md:ml-0">
                <div className="md:flex md:items-center mb-6">
                  <div className={`md:w-1/2 ${yearIndex % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:ml-auto'}`}>
                    <h2 className="text-3xl font-display font-bold text-nostalgic-brown inline-flex items-center gap-2">
                      {year}年
                      <span className="text-lg font-normal text-nostalgic-brownLight">
                        ({photosByYear[year].length} 张照片)
                      </span>
                    </h2>
                  </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
                  yearIndex % 2 === 0 ? 'md:gap-x-8 md:pr-8 md:mr-auto md:max-w-[calc(50%-2rem)]' : 'md:gap-x-8 md:pl-8 md:ml-auto md:max-w-[calc(50%-2rem)]'
                }`}>
                  {photosByYear[year].map((photo, photoIndex) => (
                    <div
                      key={photo.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${photoIndex * 100}ms` }}
                    >
                      <PhotoCard
                        photo={photo}
                        onClick={handlePhotoClick}
                        variant="timeline"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="relative flex justify-center">
            <div className="w-8 h-8 bg-nostalgic-brownLighter rounded-full border-4 border-nostalgic-paper" />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-nostalgic-brownLight mb-4">
            记忆还在继续，来添加你的故事吧~
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-vintage"
          >
            上传记忆
          </button>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 card-vintage text-nostalgic-brown hover:bg-nostalgic-creamDark transition-all duration-300 animate-fade-in"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default TimelinePage;
