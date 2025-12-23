const CourseContent = ({ course }) => {
  if (!course) return null;

  return (
    <div className="space-y-10">

      {/* ABOUT */}
      {course.about && (
        <div className="bg-white rounded-xl shadow-md border p-8">
          <h2 className="text-xl font-semibold text-[#694F8E] mb-4">
            About this Bootcamp
          </h2>

          {course.about.intro?.map((para, i) => (
            <p key={i} className="text-gray-700 mb-3">
              {para}
            </p>
          ))}

          {course.about.bonuses && (
            <ul className="mt-4 text-sm text-gray-700 space-y-1">
              {course.about.bonuses.map((b, i) => (
                <li key={i}>• {b}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* LEARNING OUTCOMES */}
      {course.learningOutcomes?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border p-8">
          <h2 className="text-xl font-semibold text-[#694F8E] mb-4">
            You Will Learn
          </h2>

          <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
            {course.learningOutcomes.map((item, i) => (
              <li key={i}>✅ {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SESSIONS */}
      {course.sessions?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border p-8">
          <h2 className="text-xl font-semibold text-[#694F8E] mb-6">
            Sessions
          </h2>

          <div className="space-y-5">
            {course.sessions.map((s, i) => (
              <div key={i} className="bg-gray-50 p-5 rounded-lg">
                <h4 className="font-medium text-gray-800">
                  Session {i + 1}: {s.title}
                </h4>
                <p className="text-sm text-gray-500 mb-2">{s.time}</p>

                {s.topics?.length > 0 && (
                  <ul className="text-sm text-gray-700 space-y-1">
                    {s.topics.map((t, idx) => (
                      <li key={idx}>• {t}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WHO IS THIS FOR */}
      {course.suitableFor?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border p-8">
          <h2 className="text-xl font-semibold text-[#694F8E] mb-4">
            This Bootcamp Is For
          </h2>

          <ul className="text-gray-700 space-y-2">
            {course.suitableFor.map((item, i) => (
              <li key={i}>✔ {item}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};

export default CourseContent;
