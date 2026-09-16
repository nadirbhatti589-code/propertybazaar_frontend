import { useRef, useState } from 'react';
import api from '../api/axios';

const normaliseImage = (image, order) => (typeof image === 'string' ? { url: image, publicId: null, order } : { ...image, order });

const compressImageIfNeeded = async (file) => {
  // If file is smaller than 3MB, no compression needed
  if (file.size <= 3 * 1024 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const MAX_DIM = 1920;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.82
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
};

const ImageUpload = ({ images = [], onChange }) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const inputRef = useRef(null);
  const orderedImages = images.map(normaliseImage).sort((a, b) => a.order - b.order);

  const uploadFiles = async (files) => {
    const selected = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
    if (!selected.length) return;
    if (orderedImages.length + selected.length > 10) {
      setError('You can upload a maximum of 10 images.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      // Auto-compress large phone camera photos (>3MB) so they smoothly fit under 4.5MB
      const preparedFiles = await Promise.all(selected.map(compressImageIfNeeded));

      // Check individual file sizes (max 4.5MB for Vercel serverless functions)
      const MAX_SIZE = 4.5 * 1024 * 1024;
      const oversized = preparedFiles.find((file) => file.size > MAX_SIZE);
      if (oversized) {
        setError(`"${oversized.name}" exceeds the 4.5MB size limit. Please choose a smaller image.`);
        setUploading(false);
        return;
      }

      // Upload each file independently so requests stay well under Vercel serverless payload limits
      const uploadPromises = preparedFiles.map(async (file) => {
        const body = new FormData();
        body.append('images', file);
        const { data } = await api.post('/upload', body);
        return data.images || [];
      });

      const uploadedBatches = await Promise.all(uploadPromises);
      const newImages = uploadedBatches.flat();
      onChange([...orderedImages, ...newImages].map(normaliseImage));
    } catch (err) {
      setError(err.response?.data?.message || 'Images could not be uploaded. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const moveImage = (from, to) => {
    if (from === to || from === null || to === null) return;
    const next = [...orderedImages]; const [image] = next.splice(from, 1); next.splice(to, 0, image);
    onChange(next.map(normaliseImage));
  };

  return <div>
    <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); uploadFiles(event.dataTransfer.files); }} className={`border border-dashed p-6 text-center transition-colors ${dragging ? 'border-teal-500 bg-teal-50' : 'border-sand-400 bg-sand-100/50 hover:border-teal-400'}`}>
      <p className="font-medium text-ink">Drop property photos here</p><p className="mt-1 text-xs text-sand-600">JPG, PNG, or WEBP · up to 10 images · 5MB each</p>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-secondary mt-4">{uploading ? <><span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-sand-400 border-t-teal-500" /> Uploading…</> : 'Choose photos'}</button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(event) => { uploadFiles(event.target.files); event.target.value = ''; }} />
    </div>
    {error && <p className="mt-2 text-sm text-brand-500">{error}</p>}
    {orderedImages.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{orderedImages.map((image, index) => <div key={image.publicId || image.url} draggable onDragStart={() => setDraggedIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { moveImage(draggedIndex, index); setDraggedIndex(null); }} className="group relative aspect-[4/3] overflow-hidden border border-sand-200 bg-sand-100"><img src={image.url} alt={`Property upload ${index + 1}`} className="h-full w-full object-cover" />{index === 0 && <span className="absolute left-2 top-2 rounded-full bg-teal-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Cover</span>}<div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/75 px-2 py-1.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"><button type="button" onClick={() => onChange([image, ...orderedImages.filter((_, current) => current !== index)].map(normaliseImage))} className="text-xs font-medium text-paper">Set cover</button><button type="button" onClick={() => onChange(orderedImages.filter((_, current) => current !== index).map(normaliseImage))} className="text-xs font-medium text-gold-400">Remove</button></div><span className="absolute right-2 top-2 rounded bg-ink/70 px-1.5 py-1 text-[10px] text-paper">Drag</span></div>)}</div>}
  </div>;
};

export default ImageUpload;
