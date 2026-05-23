import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Grid3X3 } from 'lucide-react';
import MapComponent from '../components/Map/MapComponent';
import PhotoCard from '../components/Photo/PhotoCard';
import PhotoDetail from '../components/Photo/PhotoDetail';
import DecadeFilter from '../components/UI/DecadeFilter';
import { usePhotoStore } from '../store/photoStore';
import type { Photo, Decade } from '../types';

const MapPage = () => {
  const navigate = useNavigate();
  const { photos, comments, fetchPhotos, fetchComments, addComment, filterOptions, setFilterOptions } = usePhotoStore();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showGridView, setShowGridView] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchPhotos(filterOptions);
  }, [filterOptions]);

  useEffect(() => {
    if (selectedPhoto) {
      fetchComments(selectedPhoto.id);
    }
  }, [selectedPhoto]);

  const handleMarkerClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const handlePhotoClick = (photo: Photo) => {
    navigate(`/photo/${photo.id}`);
  };

  const handleDecadeChange = (decade: Decade | 'all') => {
    setFilterOptions({ decade });
  };

  const handleAddComment = (content: string, author: string) => {
    if (selectedPhoto) {
      addComment(selectedPhoto.id, content, author);
    }
  };

  return (
    <div className="min-h-screen bg-nostalgic-cream">
      <div className="relative h-[calc(100vh-64px)]">
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className={`card-vintage p-4 transition-all duration-300 ${
            showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-nostalgic-brown" />
                <span className="font-medium text-nostalgic-brown">年代筛选:</span>
              </div>
              <DecadeFilter
                selectedDecade={filterOptions.decade || 'all'}
                onChange={handleDecadeChange}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-nostalgic-brownLight">
                  共 {photos.length} 个记忆点
                </span>
                <button
                  onClick={() => setShowGridView(!showGridView)}
                  className={`p-2 rounded-vintage transition-colors ${
                    showGridView
                      ? 'bg-nostalgic-brown text-nostalgic-cream'
                      : 'hover:bg-nostalgic-creamDark text-nostalgic-brown'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {showGridView ? (
          <div className="absolute inset-0 pt-24 pb-6 px-4 overflow-y-auto scrollbar-vintage">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-fade-in"
                  >
                    <PhotoCard photo={photo} onClick={handlePhotoClick} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <MapComponent
            photos={photos}
            onMarkerClick={handleMarkerClick}
            selectedDecade={filterOptions.decade}
          />
        )}

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute top-4 right-4 z-20 p-2 card-vintage md:hidden"
        >
          <Filter className="w-5 h-5 text-nostalgic-brown" />
        </button>
      </div>

      {selectedPhoto && (
        <PhotoDetail
          photo={selectedPhoto}
          comments={comments}
          onClose={() => setSelectedPhoto(null)}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
};

export default MapPage;
