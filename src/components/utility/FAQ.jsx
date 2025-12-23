import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ = ({ faqs }) => {
  const [open, setOpen] = useState(null);

  return (
    <div className="bg-white rounded-xl shadow-md border p-8">
      <h2 className="text-xl font-semibold text-[#694F8E] mb-6">
        FAQ
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 cursor-pointer"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-800">
                {faq.question}
              </h4>
              <ChevronDown
                className={`transition-transform ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </div>

            {open === i && (
              <p className="text-sm text-gray-600 mt-3">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
