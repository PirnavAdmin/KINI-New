import { useMemo } from "react";
import { useProfilePhotos } from "@shared/hooks/useProfilePhoto";
import { embeddedPhotoUrl, mentorPhotoLookup } from "@shared/services/profilePhotoService";

// The photo a mentor uploads is saved on their Employee record, so each
// mentor is looked up by id (see mentorPhotoLookup) with one batch request per
// profile type. The photo API is the source of truth; a URL embedded in the
// record is the fallback. Returns photoFor(trainer) → URL or "".
export default function useMentorPhotos(trainers) {
  const lookups = useMemo(() => trainers.map(mentorPhotoLookup), [trainers]);
  const idsOfType = (type) => lookups.filter((lookup) => lookup.profileType === type).map((lookup) => lookup.profileId);
  const { photos: employeePhotos } = useProfilePhotos("employee", idsOfType("employee"));
  const { photos: mentorPhotos } = useProfilePhotos("mentor", idsOfType("mentor"));
  return (trainer) => {
    const { profileType, profileId } = mentorPhotoLookup(trainer);
    const fetched = profileType === "employee" ? employeePhotos[profileId] : profileType === "mentor" ? mentorPhotos[profileId] : "";
    return fetched || embeddedPhotoUrl(trainer);
  };
}
