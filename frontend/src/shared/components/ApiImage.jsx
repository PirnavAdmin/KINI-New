import { useEffect, useState } from "react";
import apiClient from "@shared/services/apiClient";

/** An image value from the backend → a src: data URI, base64, absolute URL or API-host path. */
const resolveImageSrc = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (/^(data:|blob:|https?:)/i.test(text)) return text;
  if (/^[A-Za-z0-9+/=\s]{120,}$/.test(text)) return `data:image/png;base64,${text.replace(/\s/g, "")}`;
  return `${String(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")}/${text.replace(/^\//, "")}`;
};

function ApiImageInner({ value, alt, className, fallback, loader }) {
  const [src, setSrc] = useState(() => resolveImageSrc(value));
  const [failed, setFailed] = useState(false);
  const [triedAuth, setTriedAuth] = useState(false);

  useEffect(() => () => { if (src?.startsWith("blob:")) URL.revokeObjectURL(src); }, [src]);

  // A plain URL that fails may need the auth token: fetch it once through the API client.
  const onError = async () => {
    if (triedAuth || !src || /^(data|blob):/.test(src)) { setFailed(true); return; }
    setTriedAuth(true);
    try {
      const blob = loader ? await loader() : (await apiClient.get(src, { responseType: "blob" })).data;
      setSrc(URL.createObjectURL(blob));
    } catch {
      setFailed(true);
    }
  };

  if (!src || failed) return fallback;
  return <img src={src} alt={alt} className={className} onError={onError} decoding="async" />;
}

/**
 * An image from the backend (data URI, base64, URL or API path). When the
 * plain URL fails — usually because the file needs the auth token — it is
 * fetched once through the API client (or `loader`) and shown from a blob URL.
 */
export default function ApiImage({ value, alt, className, fallback = null, loader }) {
  return <ApiImageInner key={String(value ?? "")} value={value} alt={alt} className={className} fallback={fallback} loader={loader} />;
}
