import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, BarChart3, GraduationCap } from "lucide-react";

/* ================= ANIMATION VARIANTS ================= */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

/* ================= MAIN PAGE ================= */

const Home = () => {
  return (
    <div className="bg-[#FAFAFB]">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
  {/* Subtle SaaS gradient background */}
  <div className="absolute inset-0">
    {/* Base soft gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#F1ECFA] via-white to-[#FAFAFB]" />

    {/* Very subtle radial glow (SaaS feel) */}
    <div
      className="absolute top-[-30%] left-1/2 -translate-x-1/2
                 w-[800px] h-[800px]
                 bg-[radial-gradient(circle,rgba(105,79,142,0.08)_0%,rgba(105,79,142,0.04)_30%,transparent_60%)]"
    />
  </div>


        <motion.div
          className="relative max-w-4xl mx-auto px-6 md:px-8 py-32 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <span className="inline-block text-xs font-semibold tracking-wide text-[#694F8E] bg-[#EDE7F6] px-4 py-1.5 rounded-full mb-6">
            Financial Tools & Market Education
          </span>

          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 leading-tight">
            Better Financial Decisions <br />
            Are Built on <span className="text-[#694F8E]">Structure</span>
          </h1>

          <p className="mt-8 text-lg text-gray-600 max-w-2xl mx-auto">
            Finxbox helps investors and traders eliminate guesswork using
            disciplined tools, risk frameworks, and evidence-based market education —
            designed specifically for Indian markets.
          </p>

          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <Link
              to="/portfolio-calculator"
              className="px-8 py-4 bg-[#694F8E] text-white rounded-xl shadow hover:scale-[1.03] transition"
            >
              Use Free Financial Tools
            </Link>

            <Link
              to="/course"
              className="px-8 py-4 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
            >
              Learn the Framework
            </Link>
          </div>

          <p className="mt-8 text-xs text-gray-500">
            No sign-up required · Risk-aware · Built for long-term thinking
          </p>
        </motion.div>
      </section>

      {/* ================= OFFICIAL PARTNERS ================= */}
<section className="bg-white border-t border-gray-200">
  <div className="max-w-7xl mx-auto px-6 md:px-8 py-32 text-center">

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
    >
      <span className="inline-block text-xs font-semibold tracking-wide text-[#694F8E] bg-[#EDE7F6] px-4 py-1.5 rounded-full mb-6">
        Trusted Partnerships
      </span>

      <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
        Our Official Financial Partner
      </h2>

      <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
        We collaborate only with regulated and trusted financial institutions
        to ensure transparency, accuracy, and investor protection.
      </p>
    </motion.div>

    {/* Partner Card */}
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="mt-20 flex justify-center"
    >
      <div className="group bg-gray-50 border border-gray-200 rounded-3xl px-14 py-10 text-center transition hover:shadow-xl">

        {/* Logo */}
        <img
          src="/upstox logo.png"
          alt="Upstox Official Partner"
          className="h-28 w-auto mx-auto mb-6 object-contain"
        />
        {/* Partner Description */}
        <p className="mt-3 text-gray-600 max-w-sm mx-auto">
          SEBI-registered stock broker providing secure and reliable access
          to Indian equity and derivatives markets.
        </p>

        {/* Trust Badge */}
        <p className="mt-6 text-xs text-gray-500">
          Official Technology & Brokerage Partner
        </p>
      </div>
    </motion.div>

    {/* Disclaimer */}
    <p className="mt-16 text-xs text-gray-500 max-w-3xl mx-auto leading-relaxed">
      Partnerships do not influence Finxbox’s tools, calculations, or educational
      content. Finxbox does not provide investment advice or recommendations.
    </p>

  </div>
</section>


      {/* ================= STATS / VALUE PROPOSITION ================= */}
      <section className="relative -mt-24">
        <motion.div
          className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 px-10 py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <p className="text-xs uppercase tracking-wider text-gray-500 text-center mb-14">
            Platform at a glance
          </p>

          <div className="grid sm:grid-cols-3 gap-16">
            <StatCard
              icon={<BarChart3 size={28} />}
              label="Reliable Financial Tools"
              description="Transparent logic. No hidden assumptions."
              accent="bg-[#EDE7F6] text-[#694F8E]"
            />

            <StatCard
              icon={<ShieldCheck size={28} />}
              label="Capital Protection Focus"
              description="Designed to survive market uncertainty."
              accent="bg-[#F1F5F9] text-gray-800"
            />

            <StatCard
              icon={<GraduationCap size={28} />}
              label="Skill-Based Growth"
              description="Learn systems, not shortcuts."
              accent="bg-[#F8FAFC] text-gray-800"
            />
          </div>
        </motion.div>
      </section>

      {/* ================= CORE TOOLS ================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-20 items-start">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-4xl font-semibold text-gray-900">
              Tools Built for Capital Protection
            </h2>
            <p className="mt-4 text-gray-600 max-w-lg">
              Every tool prioritizes risk control before returns.
            </p>
          </motion.div>

          <div className="grid gap-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeUp}>
                <FeatureCard title="Portfolio Calculator" />
              </motion.div>

              <motion.div variants={fadeUp}>
                <FeatureCard title="Position Size Calculator" />
              </motion.div>

              <motion.div variants={fadeUp}>
                <FeatureCard title="Financial Statement Generator" />
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ================= DEMAT CTA ================= */}
<section className="bg-[#694F8E]">
  <div className="max-w-7xl mx-auto px-6 md:px-8 py-28 grid lg:grid-cols-2 gap-20 items-center">

    {/* LEFT CONTENT */}
    <div>
      <span className="inline-block text-xs font-semibold tracking-wide text-[#694F8E] bg-white px-4 py-1.5 rounded-full mb-6">
        Start Your Market Journey
      </span>

      <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
        Open Your Demat Account <br />
        With Confidence
      </h2>

      <p className="mt-6 text-lg text-[#EDE7F6] max-w-xl">
        To invest or trade in Indian markets, a Demat account is essential.
        Open one with a trusted, SEBI-registered broker and start your journey
        with the right foundation.
      </p>

      <ul className="mt-8 space-y-4 text-[#EDE7F6]">
        <li>✔ Secure & SEBI-compliant account opening</li>
        <li>✔ Fast onboarding with paperless process</li>
        <li>✔ Access to equity, F&O, mutual funds & more</li>
        <li>✔ Integrated with learning & tools ecosystem</li>
      </ul>

      <div className="mt-10 flex gap-4 flex-wrap">
        <a
          href="https://upstox.com/open-account/?f=GXP7"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 bg-white text-[#694F8E] font-semibold rounded-xl shadow hover:scale-[1.03] transition"
        >
          Open Demat Account
        </a>

        <Link
          to="/course"
          className="px-8 py-4 border border-white/40 text-white rounded-xl hover:bg-white/10 transition"
        >
          Learn Before You Invest
        </Link>
      </div>

      <p className="mt-6 text-xs text-[#EDE7F6]/80 max-w-xl">
        Opening a Demat account does not imply investment advice.
        Finxbox provides educational tools only.
      </p>
    </div>

    {/* RIGHT VISUAL CARD */}
    <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-200">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">
        Why a Demat Account?
      </h3>

      <div className="space-y-5 text-gray-600">
        <p>
          A Demat account holds your shares and securities electronically,
          making investing safer, faster, and more transparent.
        </p>
        <p>
          Whether you’re a long-term investor or an active trader,
          a Demat account is the gateway to Indian financial markets.
        </p>
      </div>

      <div className="mt-8 border-t pt-6 text-sm text-gray-500">
        Official partner: <span className="font-medium text-gray-800">Upstox</span><br />
        SEBI-registered Stock Broker
      </div>
    </div>

  </div>
</section>


    

    </div>
  );
};

/* ================= SUB COMPONENTS ================= */

const StatCard = ({ icon, label, description, accent }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -8 }}
    className="group flex flex-col gap-6"
  >
    <div
      className={`p-3 rounded-xl w-fit ${accent} transition-transform duration-300 group-hover:scale-110`}
    >
      {icon}
    </div>

    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight relative w-fit">
      {label}
      <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#694F8E] transition-all duration-300 group-hover:w-full" />
    </h3>

    <p className="text-base text-gray-600 leading-relaxed max-w-sm">
      {description}
    </p>
  </motion.div>
);

const FeatureCard = ({ title }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -6 }}
    className="bg-white border border-gray-200 rounded-2xl p-7 shadow hover:shadow-lg transition"
  >
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
  </motion.div>
);

export default Home;
