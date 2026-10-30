import { useState } from "react";
import { useProfilePhoto } from "@shared/hooks/useProfilePhoto";

const SIZES = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

const getProfileInitials = (name) => {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (parts[0][0] + last).toUpperCase();
};

/**
 * Photo-or-fallback content for an existing avatar shell (which keeps its own
 * size, shape and colours). Falls back when there is no src or it fails to load,
 * so a broken image is never shown.
 */
export function AvatarPhoto({ src, fallback, alt = "" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full rounded-[inherit] object-cover"
      loading="lazy"
      onError={() => setFailedSrc(src)}
    />
  );
}

/**
 * Circular profile photo with an initials fallback.
 *
 * Fetches GET /api/v1/profile/photo/{profileType}/{profileId} unless `photoUrl`
 * is passed in — lists should resolve photos once through useProfilePhotos
 * (the batch endpoint) and hand each row its `photoUrl` here.
 */
export default function ProfileImage({
  profileType,
  profileId,
  name,
  photoUrl,
  size = "md",
  className = "",
  fallbackClassName = "bg-[#E8F1FF] text-[#16558A]",
}) {
  const hasProvidedPhoto = photoUrl !== undefined;
  const { photoUrl: fetchedUrl, loading } = useProfilePhoto(profileType, profileId, { enabled: !hasProvidedPhoto });
  const src = hasProvidedPhoto ? photoUrl : fetchedUrl;

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-bold ${SIZES[size] || SIZES.md} ${fallbackClassName} ${loading ? "animate-pulse" : ""} ${className}`}
      aria-busy={loading || undefined}
    >
      <AvatarPhoto
        src={src}
        alt={name ? `${name} profile photo` : "Profile photo"}
        fallback={<span aria-hidden="true">{getProfileInitials(name)}</span>}
      />
    </span>
  );
}
