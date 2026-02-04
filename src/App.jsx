import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import ImageUploader from './ImageUploader';
import QuizPlayer from './QuizPlayer';
// ODEBRÁNY STAR A STARHALF
import { PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';

function App() {
  const [view, setView] = useState('list');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [publicQuiz, setPublicQuiz] = useState(null);
  
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([{ min: 0, max: 100, title: '', text: '' }]);

 useEffect(() => {
  const path = window.location.pathname;
  // Přidáme podporu pro /play/ i /embed/
  if (path.includes('/play/') || path.includes('/embed/')) {
    const parts = path.split('/');
    const id = parts[parts.length - 1]; // Vezme poslední část URL (to ID)
    fetchPublicQuiz(id);
  } else {
    loadQuizzes();
  }
}, []);

  const fetchPublicQuiz = async (id) => {
    const { data, error } = await supabase.from('quizzes').select('*').eq('id', id).single();
    if (data) {
      setPublicQuiz(data);
      setView('play');
    }
  };

  const loadQuizzes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
    if (!error) setQuizzes(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!quizTitle || questions.length === 0) return alert('Doplňte název a otázky.');
    const quizData = { title: quizTitle, slug: quizTitle.toLowerCase().replace(/ /g, '-'), questions, results };
    const { error } = currentQuizId 
      ? await supabase.from('quizzes').update(quizData).eq('id', currentQuizId)
      : await supabase.from('quizzes').insert([quizData]);

    if (error) alert('Chyba: ' + error.message);
    else { alert('Uloženo!'); setView('list'); loadQuizzes(); }
  };

  // --- ZDE BYL BANNER ODEBRÁN, ZŮSTÁVÁ JEN QUIZPLAYER ---
  if (view === 'play' && publicQuiz) {
    return (
  <div className="min-h-screen bg-white text-black font-sans selection:bg-yellow-200">
        <div className="w-full max-w-xl">
          <QuizPlayer quizData={publicQuiz} />
        </div>
      </div>
    );
  }

  const startNewQuiz = () => {
    setCurrentQuizId(null); setQuizTitle(''); setQuestions([]);
    setResults([{ min: 0, max: 100, title: '', text: '' }]); setView('editor');
  };

  const editQuiz = (quiz) => {
    setCurrentQuizId(quiz.id); setQuizTitle(quiz.title); setQuestions(quiz.questions);
    setResults(quiz.results); setView('editor');
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 p-3">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-black tracking-tighter cursor-pointer" onClick={() => setView('list')}>KINOBOX BUILDER</h1>
          <button onClick={handleSave} className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-yellow-400 hover:text-black transition-all">
            {view === 'list' ? 'MOJE KVÍZY' : 'ULOŽIT'}
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {view === 'list' ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic uppercase">Moje Kvízy</h2>
              <button onClick={startNewQuiz} className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-sm hover:scale-105 transition-all">
                <PlusCircle size={18} /> NOVÝ KVÍZ
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="border border-gray-200 p-4 rounded-xl hover:shadow-md transition-shadow">
                  <h3 className="font-bold mb-4 line-clamp-1">{quiz.title}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => editQuiz(quiz)} className="bg-gray-900 text-white py-2 rounded-lg text-xs font-bold uppercase">Upravit</button>
                    <button 
                      onClick={() => {
                        const productionUrl = 'https://kinobox-quiz-lake.vercel.app';
                        // Vrátil jsem min-height na 750px, protože banner už není pod otázkami
                        const embed = `<iframe src="${productionUrl}/play/${quiz.id}" style="width:100%; border:none; min-height:750px; overflow:hidden;" scrolling="no" allow="clipboard-write"></iframe>`;
                        navigator.clipboard.writeText(embed); 
                        alert('Embed kód zkopírován!');
                      }}
                      className="border border-gray-200 text-gray-500 py-2 rounded-lg text-xs font-bold uppercase hover:bg-gray-50"
                    >Embed</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto border border-gray-100 p-4 rounded-3xl shadow-sm">
            <QuizPlayer quizData={{ title: quizTitle, questions, results }} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;