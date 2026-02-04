import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import ImageUploader from './ImageUploader';
import QuizPlayer from './QuizPlayer';
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
    if (path.startsWith('/play/')) {
      const id = path.split('/play/')[1];
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

  const startNewQuiz = () => {
    setCurrentQuizId(null); setQuizTitle(''); setQuestions([]);
    setResults([{ min: 0, max: 100, title: '', text: '' }]); setView('editor');
  };

  const editQuiz = (quiz) => {
    setCurrentQuizId(quiz.id); setQuizTitle(quiz.title); setQuestions(quiz.questions);
    setResults(quiz.results); setView('editor');
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

  if (view === 'play' && publicQuiz) {
    return (
      <div className="min-h-screen bg-white">
        <QuizPlayer quizData={publicQuiz} />
      </div>
    );
  }

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
                        // AUTOMATICKÉ GENEROVÁNÍ SPRÁVNÉ URL
                        const baseUrl = window.location.origin;
                        const embed = `<iframe src="${baseUrl}/play/${quiz.id}" style="width:100%; border:none; min-height:600px; overflow:hidden;" scrolling="no" allow="clipboard-write"></iframe>`;
                        navigator.clipboard.writeText(embed); 
                        alert('Kód s URL ' + baseUrl + ' byl zkopírován!');
                      }}
                      className="border border-gray-200 text-gray-500 py-2 rounded-lg text-xs font-bold uppercase hover:bg-gray-50"
                    >Embed</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : view === 'editor' ? (
          <div className="space-y-6 max-w-4xl mx-auto">
             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">NÁZEV KVÍZU</label>
              <input 
                className="w-full bg-white border border-gray-200 p-3 rounded-xl text-xl font-bold outline-none focus:border-yellow-400"
                value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Zadejte název..."
              />
            </div>

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div key={q.id} className="bg-white border border-gray-200 p-6 rounded-2xl relative shadow-sm">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-4">
                    <span className="font-black text-xs uppercase tracking-tighter">Otázka #{qIdx + 1}</span>
                    <button onClick={() => setQuestions(questions.filter(item => item.id !== q.id))} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                    <div className="md:col-span-3">
                      <textarea 
                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl h-24 text-base font-bold outline-none focus:border-yellow-400"
                        value={q.text} onChange={(e) => { const n = [...questions]; n[qIdx].text = e.target.value; setQuestions(n); }} placeholder="Znění otázky..."
                      />
                    </div>
                    <div className="flex flex-col">
                       <ImageUploader currentImage={q.image} onUpload={(url) => { const n = [...questions]; n[qIdx].image = url; setQuestions(n); }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {q.answers.map((ans, aIdx) => (
                      <div key={aIdx} className={`p-3 rounded-xl border flex items-center gap-3 ${ans.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
                        <button 
                          onClick={() => { const n = [...questions]; n[qIdx].answers[aIdx].isCorrect = !n[qIdx].answers[aIdx].isCorrect; setQuestions(n); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${ans.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <input className="bg-transparent flex-1 font-bold text-sm outline-none" value={ans.text} onChange={(e) => { const n = [...questions]; n[qIdx].answers[aIdx].text = e.target.value; setQuestions(n); }} placeholder="Odpověď..." />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={() => setQuestions([...questions, { id: Date.now(), text: '', answers: Array(4).fill(0).map(() => ({ id: Math.random(), text: '', isCorrect: false })) }])} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-bold uppercase">
              + Přidat otázku
            </button>
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