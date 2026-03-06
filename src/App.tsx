import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Book, MessageSquare, Send, X, ChevronRight, Globe, TrendingUp, Landmark, ScrollText, Brain, Briefcase } from 'lucide-react';

type Post = {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
};

type JournalEntry = {
  id: number;
  content: string;
  created_at: string;
};

const CATEGORIES = [
  { id: 'Economy', name: '经济', icon: TrendingUp, image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200' },
  { id: 'Politics', name: '政治', icon: Landmark, image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1200' },
  { id: 'History', name: '历史', icon: ScrollText, image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1200' },
  { id: 'Psychology', name: '心理', icon: Brain, image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1200' },
  { id: 'Business', name: '商业', icon: Briefcase, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200' },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'journal'>('posts');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [posts, setPosts] = useState<Post[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Economy');

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    fetchData();
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const fetchData = async () => {
    const postsRes = await fetch(`/api/posts${selectedCategory !== 'All' ? `?category=${selectedCategory}` : ''}`);
    const postsData = await postsRes.json();
    setPosts(postsData);

    const journalRes = await fetch('/api/journal');
    const journalData = await journalRes.json();
    setJournal(journalData);
  };

  const handleAdd = async () => {
    if (!newContent.trim()) return;

    if (activeTab === 'posts') {
      if (!newTitle.trim()) return;
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent, category: newCategory }),
      });
    } else {
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
    }

    setNewTitle('');
    setNewContent('');
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number, type: 'posts' | 'journal') => {
    await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[100]">
        <motion.h1
          initial={{ opacity: 0, scale: 0.5, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, scale: 1, letterSpacing: '0.2em' }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-8xl font-black tracking-tighter text-zinc-900"
        >
          TARMI
        </motion.h1>
      </div>
    );
  }

  const activeCategoryImage = CATEGORIES.find(c => c.id === selectedCategory)?.image;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 font-sans selection:bg-zinc-200 overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50/30 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl px-8 h-16 shadow-sm">
          <div className="flex items-center gap-12">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black tracking-tighter cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500"
              onClick={() => { setSelectedCategory('All'); setActiveTab('posts'); }}
            >
              TARMI
            </motion.h1>
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                Insights
              </button>
              <button
                onClick={() => setActiveTab('journal')}
                className={`text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'journal' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                Journal
              </button>
            </nav>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-3 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {activeTab === 'posts' && (
          <div className="mb-12">
            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative h-32 rounded-3xl overflow-hidden group transition-all border-2 ${selectedCategory === cat.id ? 'border-zinc-900' : 'border-transparent'}`}
                >
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white flex items-center gap-2">
                    <cat.icon size={16} />
                    <span className="text-sm font-bold tracking-wide">{cat.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Category Header Image */}
            <AnimatePresence mode="wait">
              {selectedCategory !== 'All' && (
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: '300px' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative w-full rounded-[40px] overflow-hidden mb-12 shadow-2xl"
                >
                  <img src={activeCategoryImage} className="w-full h-full object-cover" alt={selectedCategory} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h2 className="text-6xl font-black tracking-tighter mb-2">
                      {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                    </h2>
                    <p className="text-sm uppercase tracking-[0.3em] font-medium opacity-80">Exploration & Thoughts</p>
                  </div>
                  <button 
                    onClick={() => setSelectedCategory('All')}
                    className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'posts' ? (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {posts.length === 0 ? (
                <div className="col-span-full py-20 text-center text-zinc-400 bg-white/40 backdrop-blur-md rounded-[40px] border border-white/20">
                  <MessageSquare className="mx-auto mb-4 opacity-20" size={64} />
                  <p className="text-lg font-medium">No insights found in this category.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <motion.article 
                    layout
                    key={post.id} 
                    className="group relative bg-white/60 backdrop-blur-xl border border-white/40 rounded-[40px] p-8 hover:bg-white/80 transition-all hover:shadow-xl hover:shadow-zinc-200/50"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                          {CATEGORIES.find(c => c.id === post.category)?.name || post.category}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(post.id, 'posts')}
                        className="opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight mb-4 leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-zinc-600 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                      {post.content}
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-zinc-900 font-bold text-sm cursor-pointer group/link">
                      <span>Read More</span>
                      <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                    </div>
                  </motion.article>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="journal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              {journal.length === 0 ? (
                <div className="py-20 text-center text-zinc-400 bg-white/40 backdrop-blur-md rounded-[40px] border border-white/20">
                  <Book className="mx-auto mb-4 opacity-20" size={64} />
                  <p className="text-lg font-medium">Your journal is waiting for your thoughts.</p>
                </div>
              ) : (
                journal.map((entry) => (
                  <motion.div 
                    layout
                    key={entry.id} 
                    className="group bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 flex gap-6 items-start"
                  >
                    <div className="flex-shrink-0 w-20 pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                        {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                        {new Date(entry.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                          {entry.content}
                        </p>
                        <button
                          onClick={() => handleDelete(entry.id, 'journal')}
                          className="opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/20 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[40px] p-10"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black tracking-tighter">
                  New {activeTab === 'posts' ? 'Insight' : 'Journal Entry'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-zinc-100 rounded-2xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {activeTab === 'posts' && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setNewCategory(cat.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${newCategory === cat.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Title of your insight"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full text-3xl font-black tracking-tight bg-transparent border-none focus:ring-0 placeholder:text-zinc-200"
                      autoFocus
                    />
                  </>
                )}
                <textarea
                  placeholder={activeTab === 'posts' ? "Deep dive into your thoughts..." : "Capture the moment..."}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={10}
                  className="w-full bg-transparent border-none focus:ring-0 placeholder:text-zinc-200 resize-none text-lg leading-relaxed"
                  autoFocus={activeTab === 'journal'}
                />
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={handleAdd}
                  disabled={!newContent.trim() || (activeTab === 'posts' && !newTitle.trim())}
                  className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl shadow-zinc-200"
                >
                  <span>Publish</span>
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
