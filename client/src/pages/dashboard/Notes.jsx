import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNoteStore } from "../../store";

const buildInstitutionContentPath = (institutionId, semesterId, subjectId) => {
  if (!institutionId) {
    return "/institutions";
  }

  const params = new URLSearchParams();
  if (semesterId) {
    params.set("semester", String(semesterId));
  }
  if (subjectId) {
    params.set("subject", String(subjectId));
  }

  const query = params.toString();
  return `/institutions/${institutionId}/content${query ? `?${query}` : ""}`;
};

export default function Notes() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { subjects, fetchSubjects } = useNoteStore();

  useEffect(() => {
    const redirectToInstitutionContent = async () => {
      let availableSubjects = subjects;

      if (!Array.isArray(availableSubjects) || availableSubjects.length === 0) {
        availableSubjects = await fetchSubjects();
      }

      const matchedSubject = availableSubjects.find(
        (subject) => String(subject._id) === String(subjectId),
      );

      if (!matchedSubject) {
        navigate("/institutions", { replace: true });
        return;
      }

      const institutionId =
        matchedSubject.institution?._id || matchedSubject.institution || null;
      const semesterId =
        matchedSubject.semester?._id || matchedSubject.semester || null;

      navigate(
        buildInstitutionContentPath(institutionId, semesterId, subjectId),
        { replace: true },
      );
    };

    redirectToInstitutionContent().catch(() => {
      navigate("/institutions", { replace: true });
    });
  }, [fetchSubjects, navigate, subjectId, subjects]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner" />
    </div>
  );
}
