import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import ImageUploader from './ImageUploader';
import QuizPlayer from './QuizPlayer';
import { PlusCircle, Trash2, CheckCircle2, Layout, Save, Award } from 'lucide-react';

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
      newQs[qIdx].answers = newQs[qIdx].answers.map((a, i) => ({ ...a, isCorrect: i === aIdx }));
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

  const addResult = () => {
    setResults([...results, { min: 0, max: 100, title: '', text: '' }]);
  };
  const updateResult = (index, field, value) => {
    const newResults = [...results];
    newResults[index][field] = (field === 'min' || field === 'max') ? parseInt(value) || 0 : value;
    setResults(newResults);
  };
  const removeResult = (index) => {
    setResults(results.filter((_, i) => i !== index));
  };

  if (view === 'play' && publicQuiz) {
    return (
      <div className="min-h-screen bg-white">
        <QuizPlayer quizData={publicQuiz} />
      </div>
    );
  }

  const editQuiz = (quiz) => {
    setCurrentQuizId(quiz.id); setQuizTitle(quiz.title); setQuestions(quiz.questions);
    setResults(quiz.results || [{ min: 0, max: 100, title: '', text: '' }]); 
    setView('editor');
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
              <button onClick={() => { setCurrentQuizId(null); setQuizTitle(''); setQuestions([]); setResults([{ min: 0, max: 100, title: '', text: '' }]); setView('editor'); }} className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:scale-105 transition-all">
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
                        // OPRAVENO: Používá cestu /embed/, výšku 750px a bílé pozadí
                        const embed = `<iframe src="${prodUrl}/embed/${quiz.id}" style="width:100%; height:750px; background-color:white;" frameborder="0" scrolling="no" loading="eager"></iframe>`; 
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
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Název kvízu</label>
              <input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="Název kvízu..." className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-200" />
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-400">Otázky</h3>
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
                  <button onClick={() => removeQuestion(qIdx)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                  <textarea value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} placeholder="Text otázky..." className="w-full text-xl font-bold border-none focus:ring-0 p-0 mb-6 resize-none placeholder:text-slate-200" rows="2" />
                  <ImageUploader onUpload={(url) => updateQuestion(qIdx, 'image', url)} currentImage={q.image} />
                  <div className="space-y-3 mt-6">
                    {q.answers.map((ans, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-3 group/ans">
                        <button onClick={() => updateAnswer(qIdx, aIdx, 'isCorrect', !ans.isCorrect)} className={`p-2 rounded-xl transition-all ${ans.isCorrect ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-300'}`}><CheckCircle2 size={24} fill={ans.isCorrect ? 'currentColor' : 'none'} /></button>
                        <input value={ans.text} onChange={e => updateAnswer(qIdx, aIdx, 'text', e.target.value)} placeholder="Odpověď..." className="flex-1 bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700" />
                        <button onClick={() => removeAnswer(qIdx, aIdx)} className="opacity-0 group-hover/ans:opacity-100 text-slate-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                      </div>
                    ))}
                    <button onClick={() => addAnswer(qIdx)} className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 font-bold text-sm hover:border-blue-200 hover:text-blue-500 transition-all">+ Přidat odpověď</button>
                  </div>
                </div>
              ))}
              <button onClick={addQuestion} className="w-full py-6 border-2 border-dashed border-blue-200 rounded-3xl text-blue-600 font-black uppercase tracking-widest hover:bg-blue-50 transition-all">+ Přidat otázku</button>
            </div>

            <div className="space-y-6 pt-10 border-t border-slate-200">
              <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-400 flex items-center gap-2">
                <Award size={20} /> Výsledná hodnocení
              </h3>
              {results.map((res, rIdx) => (
                <div key={rIdx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative space-y-4">
                  <button onClick={() => removeResult(rIdx)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                  <div className="flex gap-4 items-center mb-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Min %</label>
                      <input type="number" value={res.min} onChange={e => updateResult(rIdx, 'min', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl font-bold p-3" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Max %</label>
                      <input type="number" value={res.max} onChange={e => updateResult(rIdx, 'max', e.target.value)} className="w-full bg-slate-50 border-none rounded-xl font-bold p-3" />
                    </div>
                  </div>
                  <input value={res.title} onChange={e => updateResult(rIdx, 'title', e.target.value)} placeholder="Název hodnocení..." className="w-full text-xl font-bold border-none focus:ring-0 p-0 placeholder:text-slate-200" />
                  <textarea value={res.text} onChange={e => updateResult(rIdx, 'text', e.target.value)} placeholder="Podrobný text hodnocení..." className="w-full text-slate-600 border-none focus:ring-0 p-0 resize-none" rows="2" />
                </div>
              ))}
              <button onClick={addResult} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold uppercase tracking-widest hover:bg-slate-100 transition-all">+ Přidat rozmezí hodnocení</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;