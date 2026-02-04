import React, { useState } from 'react';

const QuizPlayer = ({ quizData }) => {
  const [currentStep, setCurrentStep] = useState(0); // Index aktuální otázky
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const questions = quizData.questions || [];
  const results = quizData.results || [];

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(score + 1);

    const nextStep = currentStep + 1;
    if (nextStep < questions.length) {
      setCurrentStep(nextStep);
    } else {
      setShowResult(true);
    }
  };

  const getFinalResult = () => {
    const percent = (score / questions.length) * 100;
    return results.find(r => percent >= r.min && percent <= r.max) || results[0];
  };

  if (showResult) {
    const res = getFinalResult();
    return (
      <div className="p-8 text-center bg-white rounded-3xl">
        <h2 className="text-4xl font-black mb-2 italic uppercase tracking-tighter">HOTOVO!</h2>
        <div className="inline-block bg-yellow-400 text-black font-black text-3xl px-6 py-2 rounded-2xl mb-6 shadow-sm">
          {score} / {questions.length}
        </div>
        <h3 className="text-2xl font-bold mb-4">{res?.title}</h3>
        <p className="text-gray-600 leading-relaxed mb-8">{res?.text}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-black text-white px-8 py-4 rounded-full font-black uppercase hover:scale-105 transition-all shadow-lg"
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  const q = questions[currentStep];

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-100 h-2 w-full">
        <div 
          className="bg-blue-600 h-full transition-all duration-500" 
          style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Otázka {currentStep + 1} z {questions.length}
          </span>
        </div>

        <h2 className="text-2xl font-bold mb-6 leading-tight">{q.text}</h2>

        {q.image && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <img src={q.image} alt="Otázka" className="w-full h-64 object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {q.answers.map((ans, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(ans.isCorrect)}
              className="group flex items-center p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-left hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-xs mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-bold text-gray-700 group-hover:text-blue-900">{ans.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;