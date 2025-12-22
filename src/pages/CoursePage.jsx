import React from "react";
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle,
  BarChart3,
  Shield,
} from "lucide-react";

const CoursePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HERO */}
        <div className="bg-white rounded-xl shadow-md border border-[#E8E1F2] p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-r from-[#694F8E] to-[#8B5CF6] rounded-lg">
              <GraduationCap className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                Japanese Candlestick Crash Course
              </h1>
              <p className="text-gray-600 mt-2 max-w-3xl">
                A practical, structured bootcamp designed to help traders read price action,
                spot high-probability setups, and execute trades with confidence.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Calendar size={16} /> 5 Live Sessions
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} /> Beginner to Intermediate
            </span>
            <span className="flex items-center gap-2">
              <Shield size={16} /> Certification Included
            </span>
          </div>
        </div>

        {/* ABOUT */}
        <div className="bg-white rounded-xl shadow-md border border-[#E8E1F2] p-8">
          <h2 className="text-xl font-semibold text-[#694F8E] mb-4">
            About the Bootcamp
          </h2>
          <p className="text-gray-700 leading-relaxed max-w-4xl">
            Markets move based on demand, supply, and trader behaviour. Japanese candlesticks
            capture this behaviour visually, making them one of the most powerful tools in
            technical analysis.
            <br /><br />
            This crash course focuses on helping you understand what price is communicating,
            how momentum shifts occur, and how to align entries and exits with structure instead
            of emotion.
            <br /><br />
            By the end of the program, you will not only understand patterns but also know when
            *not* to trade — a key skill most traders miss.
          </p>
        </div>

        {/* LEARNING OUTCOMES */}
        <div className="bg-white rounded-xl shadow-md border border-[#E8E1F2] p-8">
          <h2 className="text-xl font-semibold text-[#694F8E] mb-6">
            What You Will Learn
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Spot potential market turning points using candlestick behaviour",
              "Improve trade timing with confirmation-based entries",
              "Combine candlesticks with support, resistance, trendlines, RSI and volume",
              "Understand and apply 25+ widely used candlestick patterns",
              "Develop rule-based setups and a repeatable trading routine",
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle size={18} className="text-green-600 mt-1" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BONUS TOOLKIT */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
          <h3 className="font-semibold text-blue-700 mb-3">
            Bonus Toolkit (Included Free)
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Candlestick Pattern Reference Guide</li>
            <li>• Trading Plan Framework</li>
            <li>• Trading Journal Template</li>
            <li>• Community Access</li>
            <li>• Discount on Annual Learning Plan</li>
          </ul>
        </div>

        {/* SESSIONS */}
        <div className="bg-white rounded-xl shadow-md border border-[#E8E1F2] p-8">
          <h2 className="text-xl font-semibold text-[#694F8E] mb-6">
            Live Session Breakdown
          </h2>

          <div className="space-y-5">
            {[
              {
                title: "Foundations & Reversal Patterns",
                desc: "Understand candle structure, buyer-seller control, and high-impact reversal formations such as engulfing patterns, hammers, and cloud setups."
              },
              {
                title: "Blending Candlesticks with Technical Tools",
                desc: "Learn how to align candles with support & resistance, trendlines, momentum indicators, volume, and retracements to form complete trade plans."
              },
              {
                title: "Advanced Reversal Structures",
                desc: "Explore professional-grade reversal patterns including stars, harami structures, multi-candle formations, and exhaustion setups."
              },
              {
                title: "Continuation & Pause Patterns",
                desc: "Identify patterns that signal trend continuation after consolidation rather than false reversals."
              },
              {
                title: "Live Market Application & Q&A",
                desc: "Apply concepts on live charts, understand real-time decision making, and clarify doubts directly."
              }
            ].map((s, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800">
                  Session {i + 1}: {s.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* WHO IS THIS FOR */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-[#E8E1F2] p-6">
            <h3 className="font-semibold text-green-600 mb-3">
              This Program Is Suitable For
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• New traders seeking a strong technical foundation</li>
              <li>• Traders wanting better entry and exit precision</li>
              <li>• Self-learners looking for structured guidance</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-[#E8E1F2] p-6">
            <h3 className="font-semibold text-red-500 mb-3">
              This Program May Not Suit
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Those expecting guaranteed profits</li>
              <li>• Traders looking for tips or signals</li>
              <li>• Anyone unwilling to follow rules</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl shadow-md border border-[#E8E1F2] p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Ready to Build Clarity in Your Trading?
          </h2>
          <p className="text-gray-600 m-4">
            Learn to read price action with structure and discipline.
          </p>

          <a href="https://upstox.com/uplearn/bootcamps/japanese-candlestick-crash-course-28-july/?utm_source=BT6304&utm_medium=&utm_campaign=ap_partner&referrerID=BT6304&referrerType=ap_partner" target="/blank" className="mt-8 px-8 py-3 bg-[#694F8E] text-white rounded-lg shadow-md hover:bg-[#563C70] transition-colors">
            Enroll in Bootcamp
          </a>

          <p className="text-xs text-gray-500 mt-4">
            Educational program only. Market risks apply.
          </p>
        </div>

      </div>
    </div>
  );
};

export default CoursePage;
