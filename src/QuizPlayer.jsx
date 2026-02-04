import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const QuizPlayer = ({ quizData }) => {
  const [currentStep, setCurrentStep] = useState(0); 
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answersHistory, setAnswersHistory] = useState([]); // Sledujeme historii pro tlačítko zpět

  const questions = quizData.questions || [];
  const results = quizData.results || [];

  const handleAnswer = (isCorrect) => {
    // Uložíme si, jestli byla odpověď správně, abychom ji mohli při "Zpět" odečíst
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
      if (lastAnswerWasCorrect) setScore(score - 1); // Odečteme bod, pokud byl připsán
      
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
      <div className="p-8 text-center bg-white rounded-3xl animate-in fade-in duration-500">
        <h2 className="text-4xl font-black mb-2 italic uppercase tracking-tighter text-black">HOTOVO!</h2>
        <div className="inline-block bg-yellow-400 text-black font-black text-3xl px-6 py-2 rounded-2xl mb-6 shadow-sm">
          {score} / {questions.length}
        </div>
        <h3 className="text-2xl font-bold mb-4 text-black">{res?.title}</h3>
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
  if (!q) return <div className="p-10 text-center text-black">Načítání otázek...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      {/* Progress Bar */}
      <div className="bg-gray-100 h-2 w-full">
        <div 
          className="bg-blue-600 h-full transition-all duration-700 ease-out" 
          style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-6">
        {/* Horní lišta s navigací */}
        <div className="flex justify-between items-center mb-8">
          {currentStep > 0 ? (
            <button 
              onClick={handleBack}
              className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
            >
              <ChevronLeft size={14} /> Zpět
            </button>
          ) : (
            <div /> // Prázdné místo pro zarovnání
          )}
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Otázka {currentStep + 1} z {questions.length}
          </span>
        </div>

        {/* Text otázky - Přidána výrazná barva a velikost */}
        <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight text-slate-900 min-h-[4rem]">
          {q.text}
        </h2>

        {q.image && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <img src={q.image} alt="Otázka" className="w-full h-64 object-cover" />
          </div>
        )}

        {/* Odpovědi */}
        <div className="grid grid-cols-1 gap-3">
          {q.answers.map((ans, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(ans.isCorrect)}
              className="group flex items-center p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-left hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-xs mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors text-black">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-bold text-slate-700 group-hover:text-blue-900">{ans.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;