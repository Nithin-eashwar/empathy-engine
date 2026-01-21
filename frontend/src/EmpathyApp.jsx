import { useState } from "react";

export default function App() {
  // State variables: This is how React "remembers" things
  const [inputText, setInputText] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // This function sends your message to the Python Backend
  const analyzeMessage = async () => {
    if (!inputText) return;
    setLoading(true);

    try {
      // Talking to your friend's backend on Port 8000
      const response = await fetch("http://localhost:8000/api/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          sender: "user",
        }),
      });

      const result = await response.json();
      setData(result); // Storing the AI's response
    } catch (err) {
      alert(
        "Error: Backend not found. Make sure your friend's server is running!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          Empathy Engine
        </h1>
        <p className="text-gray-500 mb-6">
          Mastering React by building an AI Interface.
        </p>

        {/* Input Area */}
        <textarea
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all"
          rows="4"
          placeholder="Type something that needs more empathy..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <button
          onClick={analyzeMessage}
          disabled={loading}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors"
        >
          {loading ? "AI is thinking..." : "Analyze & Rewrite"}
        </button>

        {/* Results Section */}
        {data && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3">
                Empathy Scores:
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(data.empathy_scores).map(([label, score]) => (
                  <div key={label} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="capitalize font-medium text-sm">
                        {label}
                      </span>
                      <span className="text-sm font-bold">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-1000"
                        style={{ width: `${score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Rewrite */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <h3 className="text-blue-800 text-sm font-bold uppercase tracking-wider mb-2">
                AI Suggested Rewrite
              </h3>
              <p className="text-lg text-gray-800 italic font-medium">
                "{data.rewrites[0].text}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
