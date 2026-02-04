import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import ImageUploader from './ImageUploader';
import QuizPlayer from './QuizPlayer';
import { PlusCircle, Trash2, CheckCircle2, List, Save, Layout } from 'lucide-react';

function App() {
  const [view, setView] = useState('list'); // 'list' | 'editor' | 'play'
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [publicQuiz, setPublicQuiz] = useState(null);
  
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([{ min: 0, max: 100, title: '', text: '' }]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/play/') || path.includes('/embed/')) {
      const parts = path.split('/');
      const id = parts[parts.length - 1];
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
    
    setLoading(true);
    const { error } = currentQuizId 
      ? await supabase.from('quizzes').update(quizData).eq('id', currentQuizId)
      : await supabase.from('quizzes').insert([quizData]);

    if (error) {
      alert('Chyba: ' + error.message);
    } else {
      alert('Kvíz byl úspěšně uložen!');
      setView('list');
      loadQuizzes();
    }
    setLoading(false);
  };

  // --- POMOCNÉ FUNKCE PRO EDITOR ---
  const addQuestion = () => {
    setQuestions([...questions, { text: '', image: '', answers: [{ text: '', isCorrect: false }] }]);
  };

  const updateQuestion = (index, field, value) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addAnswer = (qIdx) => {
    const newQs = [...questions];
    newQs[qIdx].answers.push({ text: '', isCorrect: false });
    setQuestions(newQs);
  };

  const updateAnswer = (qIdx, aIdx, field, value) => {
    const newQs = [...questions];
    if (field === 'isCorrect') {
      // Pouze jedna odpověď může být správná
      newQs[qIdx].answers = newQs[qIdx].answers.map((a, i) => ({
        ...a, isCorrect: i === aIdx
      }));
    } else {
      newQs[qIdx].answers[aIdx][field] = value;
    }
    setQuestions(newQs);
  };

  const removeAnswer = (qIdx, aIdx) => {
    const newQs = [...questions];
    newQs[qIdx].answers = newQs[qIdx].answers.filter((_, i) => i !== aIdx);
    setQuestions(newQs);
  };

  // --- VEŘEJNÉ ZOBRAZENÍ (PRO EMBED) ---
  if (view === 'play' && publicQuiz) {
    return (
      <div className="min-h-screen bg-white">
        <QuizPlayer quizData={publicQuiz} />
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 p-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tighter cursor-pointer flex items-center gap-2" onClick={() => setView('list')}>
            <Layout className="text-blue-600" /> KINOBOX BUILDER
          </h1>
          <div className="flex gap-3">
            {view === 'editor' && (
              <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
                <Save size={18} /> {loading ? 'Ukládám...' : 'ULOŽIT'}
              </button>
            )}
            <button onClick={() => setView('list')} className="bg-slate-100 text-slate-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-all">
              MOJE KVÍZY
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {view === 'list' ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tight">Moje Kvízy</h2>
              <button onClick={startNewQuiz} className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:scale-105 transition-all">
                <PlusCircle size={20} /> NOVÝ KVÍZ
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                  <h3 className="font-bold text-lg mb-6 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">{quiz.title}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => editQuiz(quiz)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-600 transition-all">Upravit</button>
                    <button 
                      onClick={() => {
                        const prodUrl = 'https://kinobox-quiz-lake.vercel.app';
                        const embed = `<iframe src="${prodUrl}/play/${quiz.id}" style="width:100%; border:none; min-height:800px; overflow:hidden;" scrolling="no"></iframe>`;
                        navigator.clipboard.writeText(embed); 
                        alert('Embed kód zkopírován!');
                      }}
                      className="bg-slate-100 text-slate-500 px-4 py-3 rounded-xl text-xs font-bold uppercase hover:bg-slate-200 transition-all"
                    >Embed</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* EDITOR HLAVIČKA */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Název kvízu</label>
              <input 
                value={quizTitle} 
                onChange={e => setQuizTitle(e.target.value)}
                placeholder="Např. Poznáte filmy podle Ms. Marvel?"
                className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-200"
              />
            </div>

            {/* OTÁZKY */}
            <div className="space-y-6">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative group">
                  <button onClick={() => removeQuestion(qIdx)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                  
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6">
                    Otázka {qIdx + 1}
                  </span>

                  <textarea 
                    value={q.text}
                    onChange={e => updateQuestion(qIdx, 'text', e.target.value)}
                    placeholder="Zadejte text otázky..."
                    className="w-full text-xl font-bold border-none focus:ring-0 p-0 mb-6 resize-none placeholder:text-slate-200"
                    rows="2"
                  />

                  <div className="mb-8">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Obrázek k otázce</label>
                    <ImageUploader 
                      onUpload={(url) => updateQuestion(qIdx, 'image', url)} 
                      currentImage={q.image}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Odpovědi</label>
                    {q.answers.map((ans, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-3 group/ans">
                        <button 
                          onClick={() => updateAnswer(qIdx, aIdx, 'isCorrect', !ans.isCorrect)}
                          className={`p-2 rounded-xl transition-all ${ans.isCorrect ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-300 hover:text-slate-400'}`}
                        >
                          <CheckCircle2 size={24} fill={ans.isCorrect ? 'currentColor' : 'none'} />
                        </button>
                        <input 
                          value={ans.text}
                          onChange={e => updateAnswer(qIdx, aIdx, 'text', e.target.value)}
                          placeholder={`Možnost ${aIdx + 1}`}
                          className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        <button onClick={() => removeAnswer(qIdx, aIdx)} className="opacity-0 group-hover/ans:opacity-100 text-slate-300 hover:text-red-500 transition-all p-2">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addAnswer(qIdx)} className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 font-bold text-sm hover:border-blue-200 hover:text-blue-500 transition-all mt-2">
                      + Přidat odpověď
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addQuestion} className="w-full py-6 border-2 border-dashed border-blue-200 rounded-3xl text-blue-600 font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
              + Přidat další otázku
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;