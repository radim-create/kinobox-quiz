import React, { useState, useEffect } from 'react';
import { Check, RefreshCcw, Star } from 'lucide-react';

const AppPromotion = () => (
  <div className="mt-8 pt-8 border-t border-gray-100 text-center">
    <h3 className="text-lg font-black mb-6 leading-tight text-black">
      Přidejte se k milovníkům filmů a seriálů a stáhněte si naši aplikaci
    </h3>
    
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
      {/* Google Play Button */}
      <a href="https://play.google.com/store/apps/details?id=cz.kinobox" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
          alt="Google Play" 
          className="h-10"
        />
      </a>
      {/* Apple App Store Button - POUŽITÍ JINÉHO STABILNÍHO ZDROJE */}
      <a href="https://apps.apple.com/cz/app/kinobox/id1527331566" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
        <img 
          src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1314144000&h=791e8e25253896504a9d031952e47e3a" 
          alt="Download on the App Store" 
          className="h-10"
        />
      </a>
    </div>

    <div className="flex items-center justify-center gap-2">
      <span className="text-xs font-bold text-gray-400">100 000+ stažení</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={12} fill="#fbbf24" className="text-yellow-400" />
        ))}
      </div>
    </div>
  </div>
);

export default function QuizPlayer({ quizData }) {
  const [currentStep, setCurrentStep] = useState('intro'); 
  const [userAnswers, setUserAnswers] = useState({}); 
  const [score, setScore] = useState(0);

  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'setHeight', height: height }, '*');
    };
    sendHeight();
    window.addEventListener('resize', sendHeight);
    return () => window.removeEventListener('resize', sendHeight);
  }, [currentStep, userAnswers]);

  const toggleAnswer = (qIdx, aId) => {
    const current = userAnswers[qIdx] || [];
    const next = current.includes(aId) ? current.filter(id => id !== aId) : [...current, aId];
    setUserAnswers({ ...userAnswers, [qIdx]: next });
  };

  const finishQuiz = () => {
    let correctPoints = 0;
    quizData.questions.forEach((q, idx) => {
      const selected = userAnswers[idx] || [];
      const correctOnes = q.answers.filter(a => a.isCorrect).map(a => a.id);
      if (correctOnes.length === selected.length && correctOnes.every(id => selected.includes(id))) correctPoints++;
    });
    setScore(Math.round((correctPoints / quizData.questions.length) * 100));
    setCurrentStep('result');
  };

  if (currentStep === 'intro') return (
    <div className="text-center p-10 bg-white text-black border border-gray-100 rounded-3xl">
      <h1 className="text-xl font-black mb-6 uppercase tracking-tight">{quizData.title}</h1>
      <button onClick={() => setCurrentStep('quiz')} className="bg-black text-white px-8 py-3 rounded-full font-black hover:bg-yellow-400 hover:text-black transition-all">
        SPUSTIT KVÍZ
      </button>
    </div>
  );

  if (currentStep === 'result') {
    const resultMsg = quizData.results.find(r => score >= r.min && score <= r.max) || quizData.results[0];
    return (
      <div className="bg-white text-black border border-gray-200 rounded-[2rem] shadow-lg animate-in fade-in duration-500">
        <div className="p-8 text-center">
          <div className="text-gray-400 font-black uppercase text-[9px] tracking-widest mb-1">Úspěšnost</div>
          <div className="text-6xl font-black mb-4 tracking-tighter">{score}%</div>
          <h2 className="text-lg font-black mb-2 uppercase italic leading-tight">{resultMsg.title}</h2>
          <p className="text-gray-500 mb-6 font-bold text-sm leading-relaxed">{resultMsg.text}</p>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 mx-auto text-gray-400 hover:text-black font-black uppercase text-[9px] tracking-widest transition-colors mb-4">
            <RefreshCcw size={12} /> Zkusit znovu
          </button>
          <AppPromotion />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white">
      {quizData.questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h3 className="text-base font-black mb-3 text-black">
            <span className="text-gray-300 mr-1">{qIdx + 1}.</span> {q.text}
          </h3>
          {q.image && <img src={q.image} className="w-full h-48 object-cover rounded-lg mb-4 border border-gray-200" alt="scéna" />}
          <div className="grid grid-cols-1 gap-2">
            {q.answers.map((ans) => {
              const isSelected = (userAnswers[qIdx] || []).includes(ans.id);
              return (
                <button 
                  key={ans.id}
                  onClick={() => toggleAnswer(qIdx, ans.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left font-bold text-sm ${isSelected ? 'border-yellow-400 bg-yellow-50 text-black' : 'border-gray-100 bg-white text-gray-600'}`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-yellow-400 border-yellow-400' : 'border-gray-200 bg-gray-50'}`}>
                    {isSelected && <Check size={12} className="text-black font-black" />}
                  </div>
                  <span>{ans.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <button onClick={finishQuiz} className="w-full bg-black text-white py-4 rounded-xl font-black text-lg hover:bg-yellow-400 hover:text-black transition-all uppercase tracking-tighter mt-4">
        VYHODNOTIT
      </button>
    </div>
  );
}