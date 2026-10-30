function ATSScoreCard({
  score,
}) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">

      <h3 className="text-xl font-bold mb-4">
        ATS Score
      </h3>

      <div className="text-5xl font-extrabold text-green-600">

        {score}%

      </div>

      <p className="text-gray-500 mt-2">
        Resume Quality Score
      </p>

    </div>
  );
}

export default ATSScoreCard;