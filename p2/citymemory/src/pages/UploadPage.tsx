import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon } from 'lucide-react';
import PhotoUpload from '../components/Photo/PhotoUpload';
import { usePhotoStore } from '../store/photoStore';

const UploadPage = () => {
  const navigate = useNavigate();
  const { uploadPhoto, loading, error } = usePhotoStore();

  const handleSubmit = async (formData: FormData) => {
    const result = await uploadPhoto(formData);
    if (result) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-nostalgic-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <UploadIcon className="w-10 h-10 text-nostalgic-orange" />
            <h1 className="text-3xl font-display font-bold text-nostalgic-brown">
              上传记忆
            </h1>
          </div>
          <p className="text-nostalgic-brownLight max-w-xl mx-auto">
            分享你的老照片，让更多人看到这座城市的历史。每一张照片都是一段珍贵的记忆。
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-vintage text-red-600 text-center">
            {error}
          </div>
        )}

        <PhotoUpload onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
};

export default UploadPage;
