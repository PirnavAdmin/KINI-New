import { useEffect, useId, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { coursePosterUrl, validateCoursePoster } from './coursePosterUtils';

export function CoursePosterThumbnail({ url, name = 'Course', className = '' }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const resolved = coursePosterUrl(url);
  return resolved && failedUrl !== resolved
    ? <img src={resolved} alt={`${name} poster`} loading="lazy" onError={() => setFailedUrl(resolved)} className={`h-12 w-20 rounded-lg border border-slate-200 object-cover ${className}`} />
    : <span className="inline-flex h-12 w-20 items-center justify-center rounded-lg bg-slate-50 text-xs text-slate-500">No poster</span>;
}

export default function CoursePoster({ savedUrl, file, removed, onChange, disabled }) {
  const id = useId();
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    let active = true;
    queueMicrotask(() => { if (active) setPreview(url); });
    return () => { active = false; URL.revokeObjectURL(url); };
  }, [file]);
  const pick = event => {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;
    const problem = validateCoursePoster(selected);
    setError(problem);
    if (!problem) onChange(selected, false);
  };
  const hasImage = file || (savedUrl && !removed);
  return <div className="cfm-poster">
    <label htmlFor={id} className="cfm-label">Course Poster <span className="text-sm font-normal text-slate-500">(Optional)</span></label>
    <div className="cfm-poster-picker">
      {file && preview ? <img src={preview} alt="Selected course poster" className="h-14 w-20 rounded-lg object-cover" /> : savedUrl && !removed ? <CoursePosterThumbnail url={savedUrl} /> : <ImagePlus aria-hidden="true" className="h-8 w-8 shrink-0 text-slate-400" />}
      <div className="min-w-0 flex-1"><p className="break-all text-sm">{file ? file.name : removed ? 'Poster marked for removal' : savedUrl ? 'Current course poster' : 'JPG, PNG, WebP · up to 5 MB'}</p>
        {file && <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB · uploads when you save</p>}
        <div className="mt-2 flex flex-wrap gap-2"><label htmlFor={id} className={`rounded-lg border border-slate-200 px-3 py-1.5 text-sm ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>{hasImage ? 'Replace' : 'Choose image'}</label>
          {hasImage && <button type="button" disabled={disabled} onClick={() => { setError(''); onChange(null, Boolean(savedUrl)); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">Remove</button>}
          {removed && <button type="button" disabled={disabled} onClick={() => onChange(null, false)} className="text-sm underline">Keep saved poster</button>}
        </div>
      </div>
      <input id={id} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={pick} disabled={disabled} aria-describedby={`${id}-hint`} className="sr-only" />
    </div>
    <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">The poster is saved when you save the course, and shown on the public course card.</p>
    {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
  </div>;
}
