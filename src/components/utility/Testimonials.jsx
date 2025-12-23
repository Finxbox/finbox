const Testimonials = ({ testimonials }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border p-8">
      <h2 className="text-xl font-semibold text-[#694F8E] mb-6">
        What Traders Are Saying
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-gray-50 p-5 rounded-lg">
            <p className="italic text-gray-700">“{t.feedback}”</p>
            <div className="mt-4">
              <p className="font-medium text-gray-800">{t.name}</p>
              <p className="text-xs text-gray-500">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
