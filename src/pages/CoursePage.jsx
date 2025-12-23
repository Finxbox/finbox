import { useParams } from "react-router-dom";
import { courses } from "../Data/courses";
import CourseContent from "../components/utility/CourseContent";
import Testimonials from "../components/utility/Testimonials";
import FAQ from "../components/utility/FAQ";

const CoursePage = () => {
  const { courseId } = useParams();
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB]">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F1ECFA] via-white to-[#F8F6FC]" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT */}
            <div>
              <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#EFEAF6] text-[#694F8E]">
                Live Trading Bootcamp
              </span>

              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
                {course.title}
              </h1>

              <p className="mt-5 text-lg text-gray-600 max-w-xl">
                A structured, practical bootcamp to help you read price action,
                improve entries & exits, and trade with clarity instead of emotion.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={course.enrollLink}
                  target="_blank"
                  className="px-7 py-3 bg-[#694F8E] text-white rounded-xl shadow-lg hover:bg-[#563C70] transition"
                >
                  Enroll Now
                </a>

                <div className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-600">
                  {course.sessionsCount} Sessions · {course.level}
                </div>
              </div>
            </div>

            {/* RIGHT – INFO CARD */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mentor</span>
                <span className="font-medium text-gray-900">{course.mentor}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Language</span>
                <span className="font-medium text-gray-900">{course.language}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Certification</span>
                <span className="font-medium text-gray-900">
                  {course.certification}
                </span>
              </div>

              <div className="pt-4 border-t border-dashed">
                <p className="text-xs text-gray-500">
                  Educational program only. Market risks apply.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-20 space-y-20">

        {/* COURSE DETAILS */}
        <section>
          <CourseContent course={course} />
        </section>

        {/* SOCIAL PROOF */}
        <section>
          <Testimonials testimonials={course.testimonials} />
        </section>

        {/* FAQ */}
        <section>
          <FAQ faqs={course.faqs} />
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#694F8E] to-[#8B5CF6] rounded-3xl opacity-90" />

          <div className="relative rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Trade With Structure, Not Guesswork
            </h2>

            <p className="mt-4 max-w-2xl mx-auto text-white/90">
              Join traders who focus on discipline, price action,
              and repeatable setups instead of emotions.
            </p>

            <a
              href={course.enrollLink}
              target="_blank"
              className="inline-block mt-8 px-10 py-4 bg-white text-[#694F8E] font-medium rounded-xl shadow hover:scale-[1.03] transition"
            >
              Join the Bootcamp
            </a>
          </div>
        </section>

      </main>
    </div>
  );
};

export default CoursePage;
