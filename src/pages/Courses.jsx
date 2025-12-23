import { Link } from "react-router-dom";
import { GraduationCap, Clock, BookOpen } from "lucide-react";
import { courses } from "../Data/courses";

const Courses = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-800">
            Our Courses
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Structured bootcamps designed to help you trade with clarity,
            confidence, and discipline.
          </p>
        </div>

        {/* COURSE GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-md border p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-3 items-start">
                  <div className="p-3 bg-gradient-to-r from-[#694F8E] to-[#8B5CF6] rounded-lg">
                    <GraduationCap className="text-white" size={22} />
                  </div>

                  <h2 className="text-lg font-semibold text-gray-800">
                    {course.title}
                  </h2>
                </div>

                <p className="text-sm text-gray-600 mt-3">
                  Mentor: {course.mentor}
                </p>

                {/* COURSE META */}
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Clock size={14} />
                    {course.sessionsCount} Live Sessions
                  </p>
                  <p className="flex items-center gap-2">
                    <BookOpen size={14} />
                    {course.level}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <Link
                to={`/course/${course.id}`}
                className="mt-6 inline-block text-center px-4 py-2 bg-[#694F8E] text-white rounded-lg hover:bg-[#563C70] transition-colors"
              >
                View Course
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Courses;
