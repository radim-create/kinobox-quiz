import React, { useState } from 'react';
import { ChevronLeft, Star, StarHalf } from 'lucide-react';

const QuizPlayer = ({ quizData }) => {
  const [currentStep, setCurrentStep] = useState(0); 
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answersHistory, setAnswersHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const questions = quizData.questions || [];
  const results = quizData.results || [];

  const handleAnswer = (isCorrect) => {
    if (isProcessing) return;
    setIsProcessing(true);

    setAnswersHistory([...answersHistory, isCorrect]);
    if (isCorrect) setScore(score + 1);

    const nextStep = currentStep + 1;
    
    setTimeout(() => {
      if (nextStep < questions.length) {
        setCurrentStep(nextStep);
        setIsProcessing(false);
      } else {
        setShowResult(true);
        setIsProcessing(false);
      }
    }, 350); 
  };

  const handleBack = () => {
    if (currentStep > 0 && !isProcessing) {
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
      /* FINÁLNÍ FIX: scroll probíhá v tomto absolutním divu o výšce 100% (750px) */
      <div 
        className="absolute inset-0 bg-white overflow-y-scroll"
        style={{ 
          WebkitOverflowScrolling: 'touch', 
          height: '100%',
          zIndex: 9999
        }}
      >
        <div className="p-8 text-center max-w-xl mx-auto pb-24">
          <h2 className="text-4xl font-black mb-2 italic uppercase tracking-tighter text-black">DOKONČENO!</h2>
          <div className="inline-block bg-yellow-400 text-black font-black text-3xl px-6 py-2 rounded-2xl mb-6 shadow-sm">
            {score} / {questions.length}
          </div>
          <h3 className="text-2xl font-bold mb-4 text-black">{res?.title}</h3>
          <p className="text-gray-600 leading-relaxed mb-8">{res?.text}</p>
          
          <button 
            type="button"
            onPointerUp={() => window.location.reload()} 
            className="bg-black text-white px-8 py-4 rounded-full font-black uppercase hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer mb-12"
          >
            Zkusit znovu
          </button>

          <div className="text-left space-y-4 max-w-md mx-auto">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b pb-2">
              Přehled tvých odpovědí:
            </h4>
            {questions.map((q, idx) => {
              const isUserCorrect = answersHistory[idx];
              const correctAnswer = q.answers.find(a => a.isCorrect)?.text;
              return (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-bold text-sm text-slate-800 mb-2 leading-tight">{idx + 1}. {q.text}</p>
                  <div className="flex items-start gap-2">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${isUserCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Správná odpověď: <span className="font-bold text-slate-900">{correctAnswer}</span><br />
                      <span className={`font-black uppercase text-[9px] tracking-widest ${isUserCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isUserCorrect ? '✓ Správně' : '✗ Chyba'}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
              <h2 className="text-lg font-black text-slate-900 mb-6 leading-tight max-w-xs mx-auto">
                Přidejte se k milovníkům filmů a stáhněte si naši aplikaci
              </h2>
              <div className="flex flex-row justify-center gap-3 mb-6 items-center">
                <a href="https://play.google.com/store/apps/details?id=cz.kinobox.kinobox" target="_blank" rel="noreferrer">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10" />
                </a>
                <a href="https://apps.apple.com/cz/app/kinobox-filmov%C3%A1-datab%C3%A1ze/id6464039616" target="_blank" rel="noreferrer">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-10" />
                </a>
              </div>
              <div className="flex justify-center items-center gap-2 text-slate-500 font-bold text-[12px]">
                <span>100 000+ stažení</span>
                <div className="flex text-yellow-500">
                  <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><StarHalf size={14} fill="currentColor" />
                </div>
              </div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentStep];
  if (!q) return <div className="p-10 text-center text-black font-bold">Načítání...</div>;

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <div className="bg-gray-100 h-2 w-full">
        <div 
          className="bg-blue-600 h-full transition-all duration-700 ease-out" 
          style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        <div className="flex justify-between items-center mb-8">
          {currentStep > 0 ? (
            <button 
              type="button"
              onPointerUp={handleBack}
              className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
            >
              <ChevronLeft size={14} /> Zpět
            </button>
          ) : <div />}
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Otázka {currentStep + 1} z {questions.length}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight text-slate-900">{q.text}</h2>

        {q.image && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
            <img src={q.image} alt="Otázka" className="w-full h-44 object-cover" />
          </div>
        )}

        <div className={`grid grid-cols-1 gap-3 pb-8 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
          {q.answers.map((ans, idx) => (
            <button
              key={`${currentStep}-${idx}`}
              type="button"
              onPointerUp={(e) => { e.preventDefault(); handleAnswer(ans.isCorrect); }}
              className="group flex items-center p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-left hover:border-blue-500 active:scale-[0.98] transition-all"
            >
              <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-xs mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-bold text-slate-700 group-hover:text-blue-900 pointer-events-none">{ans.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;