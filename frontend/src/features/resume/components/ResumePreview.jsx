function ResumePreview({
  formData,
}) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">

      <h1 className="text-4xl font-bold">

        {formData.fullName ||
          "Your Name"}

      </h1>

      <p className="text-gray-600 mt-2">

        {formData.email}

      </p>

      <p className="text-gray-600">

        {formData.phone}

      </p>

      <hr className="my-6" />

      <h3 className="font-bold text-xl">
        Skills
      </h3>

      <p className="mt-2">
        {formData.skills}
      </p>

      <h3 className="font-bold text-xl mt-6">
        Education
      </h3>

      <p className="mt-2">
        {formData.education}
      </p>

      <h3 className="font-bold text-xl mt-6">
        Experience
      </h3>

      <p className="mt-2">
        {formData.experience}
      </p>

    </div>
  );
}

export default ResumePreview;