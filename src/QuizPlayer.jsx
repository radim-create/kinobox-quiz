import React, { useState } from 'react';
import { ChevronLeft, Star, StarHalf } from 'lucide-react';

const QuizPlayer = ({ quizData }) => {
  const [currentStep, setCurrentStep] = useState(0); 
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answersHistory, setAnswersHistory] = useState([]);

  const questions = quizData.questions || [];
  const results = quizData.results || [];

  const handleAnswer = (isCorrect) => {
    setAnswersHistory([...answersHistory, isCorrect]);
    if (isCorrect) setScore(score + 1);

    const nextStep = currentStep + 1;
    if (nextStep < questions.length) {
      setCurrentStep(nextStep);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const lastAnswerWasCorrect = answersHistory[answersHistory.length - 1];
      if (lastAnswerWasCorrect) setScore(score - 1);
      
      const newHistory = [...answersHistory];
      newHistory.pop();
      setAnswersHistory(newHistory);
      setCurrentStep(currentStep - 1);
    }
  };

  const getFinalResult = () => {
    const percent = questions.length > 0 ? (score / questions.length) * 100 : 0;
    return results.find(r => percent >= r.min && percent <= r.max) || results[0];
  };

  if (showResult) {
    const res = getFinalResult();
    return (
      <div className="p-8 text-center bg-white rounded-3xl animate-in fade-in duration-500 max-w-xl mx-auto border border-gray-100 shadow-sm">
        <h2 className="text-4xl font-black mb-2 italic uppercase tracking-tighter text-black">HOTOVO!</h2>
        <div className="inline-block bg-yellow-400 text-black font-black text-3xl px-6 py-2 rounded-2xl mb-6 shadow-sm">
          {score} / {questions.length}
        </div>
        <h3 className="text-2xl font-bold mb-4 text-black">{res?.title}</h3>
        <p className="text-gray-600 leading-relaxed mb-8">{res?.text}</p>
        
        <button 
          type="button"
          onPointerDown={() => window.location.reload()} 
          className="bg-black text-white px-8 py-4 rounded-full font-black uppercase hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
        >
          Zkusit znovu
        </button>

        <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-black text-slate-900 mb-6 leading-tight max-w-xs mx-auto">
              Přidejte se k milovníkům filmů a stáhněte si naši aplikaci
            </h2>

            <div className="flex flex-row justify-center gap-3 mb-6 items-center">
              <a href="https://play.google.com/store/apps/details?id=cz.kinobox" target="_blank" rel="noreferrer" className="active:opacity-70 transition-opacity">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10" />
              </a>
              <a href="https://apps.apple.com/cz/app/kinobox/id1501170940" target="_blank" rel="noreferrer" className="active:opacity-70 transition-opacity">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-10" />
              </a>
            </div>

            <div className="flex justify-center items-center gap-2 text-slate-500 font-bold text-[12px]">
              <span>100 000+ stažení</span>
              <div className="flex text-yellow-500">
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <StarHalf size={14} fill="currentColor" />
              </div>
            </div>
        </div>
      </div>
    );
  }

  const q = questions[currentStep];
  if (!q) return <div className="p-10 text-center text-black font-bold">Načítání otázek...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 touch-manipulation">
      <div className="bg-gray-100 h-2 w-full">
        <div 
          className="bg-blue-600 h-full transition-all duration-700 ease-out" 
          style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          {currentStep > 0 ? (
            <button 
              type="button"
              onPointerDown={handleBack}
              className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black active:text-blue-600 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} /> Zpět
            </button>
          ) : (
            <div />
          )}
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Otázka {currentStep + 1} z {questions.length}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight text-slate-900 min-h-[4rem]">
          {q.text}
        </h2>

        {q.image && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
            <img src={q.image} alt="Otázka" className="w-full h-48 md:h-64 object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 relative z-10">
          {q.answers.map((ans, idx) => (
            <button
              key={idx}
              type="button"
              // KLÍČOVÁ ZMĚNA: onPointerDown místo onClick pro okamžitou reakci v aplikaci
              onPointerDown={(e) => {
                e.preventDefault();
                handleAnswer(ans.isCorrect);
              }}
              className="group flex items-center p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-left hover:border-blue-500 active:border-blue-600 active:bg-blue-50 active:scale-[0.98] transition-all duration-100 cursor-pointer overflow-hidden"
            >
              <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-xs mr-4 group-hover:bg-blue-600 group-hover:text-white group-active:bg-blue-700 transition-colors text-black pointer-events-none">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-bold text-slate-700 group-hover:text-blue-900 pointer-events-none">
                {ans.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;