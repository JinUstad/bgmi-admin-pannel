"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Loader2, Plus, Trash2, X, ToggleLeft, ToggleRight, 
  ChevronRight, ArrowLeft, Sparkles, FolderOpen, Power, Upload, Edit
} from 'lucide-react';
import GameEditorModal from './_components/game-editor-modal';

type GameCategory = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  sort_order: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  color_background: string;
  color_text: string;
  color_muted: string;
  color_surface: string;
  color_card: string;
  color_border: string;
  color_glow: string;
  gradient_start: string;
  gradient_end: string;
  overall_feel: string;
  is_active: boolean;
};

type Game = {
  id: string;
  name: string;
  series_id: string;
  category_id: string;
  is_active: boolean;
  slug: string;
  description: string;
  hero_heading: string;
  hero_subheading: string;
  hero_image_url: string;
  logo_url: string;
  bg_image_url: string;
  game_primary_color: string;
  game_secondary_color: string;
  game_accent_color: string;
  registration_fee?: number | null;
  game_categories?: GameCategory;
};

export default function GamesPage() {
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [gameToActivate, setGameToActivate] = useState<Game | null>(null);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const [feeModalGame, setFeeModalGame] = useState<Game | null>(null);
  const [feeModalValue, setFeeModalValue] = useState<string>("");

  const [gameForm, setGameForm] = useState({
    name: '',
    category_id: '',
    description: '',
    hero_heading: '',
    hero_subheading: '',
    hero_image_url: '',
    game_primary_color: '',
    game_secondary_color: '',
    game_accent_color: '',
    is_active: false,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    emoji: '🎮',
    primary_color: '#A855F7',
    secondary_color: '#6366F1',
    accent_color: '#22D3EE',
    color_background: '#000000',
    color_text: '#FFFFFF',
    color_muted: '#888888',
    color_surface: '#111111',
    color_card: '#222222',
    color_border: '#333333',
    color_glow: '#A855F7',
    gradient_start: '#A855F7',
    gradient_end: '#000000',
    overall_feel: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch categories (game_categories, formerly game_series)
    const { data: catData } = await supabase
      .from('game_categories')
      .select('*')
      .order('sort_order');
    
    if (catData) setCategories(catData);

    // Fetch games with category relation
    const { data: gamesData } = await supabase
      .from('games')
      .select(`*, game_categories!games_category_id_fkey(*)`)
      .order('name');

    if (gamesData) setGames(gamesData as Game[]);

    // Fetch active game config
    try {
      const { data: config } = await supabase
        .from('active_game_config')
        .select('active_game_id')
        .eq('id', 1)
        .single();
      if (config) setActiveGameId(config.active_game_id);
    } catch (e) {
      // Table may not exist yet
    }
    
    setLoading(false);
  };

  const confirmSetActiveGame = async () => {
    if (!gameToActivate) return;
    const newActiveId = gameToActivate.id;
    
    // Call atomic RPC function
    const { error } = await supabase.rpc('activate_game_atomic', { new_game_id: newActiveId });
    
    if (!error) {
      setActiveGameId(newActiveId);
      setGames(games.map(g => ({ ...g, is_active: g.id === newActiveId })));
      setGameToActivate(null);
    } else {
      console.error("Failed to activate game:", error);
      alert("Failed to activate game. Make sure you have admin privileges.");
    }
  };

  const handleSetActiveGame = (game: Game) => {
    if (activeGameId === game.id) return; // Ignore if already active
    setGameToActivate(game);
  };

  const handleDeleteGame = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (!error) {
      setGames(games.filter(g => g.id !== id));
      if (activeGameId === id) setActiveGameId(null);
    }
  };

  const handleOpenFeeModal = (game: Game) => {
    setFeeModalGame(game);
    setFeeModalValue(game.registration_fee?.toString() || "");
  };

  const handleSaveFee = async () => {
    if (!feeModalGame) return;
    const game = feeModalGame;
    
    let parsedFee: number | null = null;
    if (feeModalValue.trim() !== "") {
      parsedFee = parseFloat(feeModalValue);
      if (isNaN(parsedFee) || parsedFee < 0) {
        alert("Invalid fee amount. Please enter a valid number.");
        return;
      }
    }

    const { error } = await supabase.from('games').update({ registration_fee: parsedFee }).eq('id', game.id);
    if (error) {
      alert("Failed to update fee: " + error.message);
    } else {
      setGames(games.map(g => g.id === game.id ? { ...g, registration_fee: parsedFee } : g));
      setFeeModalGame(null);
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameForm.name || !gameForm.category_id) return;
    
    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('games')
      .insert([{
        name: gameForm.name,
        series_id: gameForm.category_id,
        category_id: gameForm.category_id,
        description: gameForm.description,
        hero_heading: gameForm.hero_heading,
        hero_subheading: gameForm.hero_subheading,
        hero_image_url: gameForm.hero_image_url,
        game_primary_color: gameForm.game_primary_color || null,
        game_secondary_color: gameForm.game_secondary_color || null,
        game_accent_color: gameForm.game_accent_color || null,
        is_active: false,
      }])
      .select(`*, game_categories!games_category_id_fkey(*)`)
      .single();

    if (!error && data) {
      setGames([...games, data as Game]);
      setIsAddGameModalOpen(false);
      setGameForm({ name: '', category_id: selectedCategory?.id || '', description: '', hero_heading: '', hero_subheading: '', hero_image_url: '', game_primary_color: '', game_secondary_color: '', game_accent_color: '', is_active: false });
    }
    setIsSubmitting(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) return;

    setIsSubmitting(true);
    const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data, error } = await supabase
      .from('game_categories')
      .insert([{
        name: categoryForm.name,
        slug,
        emoji: categoryForm.emoji,
        primary_color: categoryForm.primary_color,
        secondary_color: categoryForm.secondary_color,
        accent_color: categoryForm.accent_color,
        color_background: categoryForm.color_background,
        color_text: categoryForm.color_text,
        color_muted: categoryForm.color_muted,
        color_surface: categoryForm.color_surface,
        color_card: categoryForm.color_card,
        color_border: categoryForm.color_border,
        color_glow: categoryForm.color_glow,
        gradient_start: categoryForm.gradient_start,
        gradient_end: categoryForm.gradient_end,
        overall_feel: categoryForm.overall_feel,
        sort_order: categories.length + 1,
        is_active: true,
      }])
      .select()
      .single();

    if (!error && data) {
      setCategories([...categories, data]);
      setIsAddCategoryModalOpen(false);
      setCategoryForm({ 
        name: '', slug: '', emoji: '🎮', primary_color: '#A855F7', secondary_color: '#6366F1', accent_color: '#22D3EE', 
        color_background: '#000000', color_text: '#FFFFFF', color_muted: '#888888', color_surface: '#111111', 
        color_card: '#222222', color_border: '#333333', color_glow: '#A855F7', gradient_start: '#A855F7', gradient_end: '#000000', overall_feel: '' 
      });
    }
    setIsSubmitting(false);
  };

  const gamesInCategory = (catId: string) => games.filter(g => g.category_id === catId || g.series_id === catId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white/30 text-sm font-medium">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <span className="text-[11px] text-white/30 font-semibold uppercase tracking-[0.2em]">
              {selectedCategory ? (
                <button onClick={() => setSelectedCategory(null)} className="hover:text-white/50 transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to Categories
                </button>
              ) : 'Games Management'}
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black font-heading text-white tracking-tight flex items-center gap-3"
          >
            {selectedCategory ? (
              <>
                <span className="text-4xl">{selectedCategory.emoji}</span>
                <span>{selectedCategory.name}</span>
                <span className="text-lg font-medium text-white/30">({gamesInCategory(selectedCategory.id).length} games)</span>
              </>
            ) : (
              <>
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/15">
                  <Gamepad2 className="w-6 h-6 text-purple-400" />
                </div>
                Game Categories
              </>
            )}
          </motion.h1>
        </div>
        
        <div className="flex items-center gap-3">
          {!selectedCategory && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.12] text-white font-semibold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all text-sm"
            >
              <FolderOpen className="w-4 h-4 text-purple-400" />
              Add Category
            </motion.button>
          )}
          {selectedCategory && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                setSelectedGame(null);
                setIsAddGameModalOpen(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Game
            </motion.button>
          )}
        </div>
      </div>

      {/* Category Grid View */}
      {!selectedCategory && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {categories.map((cat, index) => {
            const catGames = gamesInCategory(cat.id);
            const activeGame = catGames.find(g => g.id === activeGameId);
            
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCategory(cat)}
                className="group cursor-pointer relative overflow-hidden rounded-2xl glassmorphism hover:border-white/[0.12] transition-all duration-500"
                style={{
                  boxShadow: `0 0 0 0 transparent`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 32px ${cat.primary_color}20, 0 0 0 1px ${cat.primary_color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 0 transparent`;
                }}
              >
                {/* Category color accent bar */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${cat.primary_color}, ${cat.secondary_color})` }} />
                
                {/* Background glow */}
                <div 
                  className="absolute -right-12 -top-12 w-36 h-36 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity duration-700"
                  style={{ backgroundColor: cat.primary_color }}
                />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cat.emoji}</span>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-white transition-colors">{cat.name}</h3>
                        <p className="text-[11px] text-white/30 font-medium">{cat.overall_feel}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all mt-1" />
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex flex-col gap-3 shrink-0">
                      <span className="text-xs text-white/40 font-medium whitespace-nowrap">{catGames.length} games</span>
                      {/* Color swatches */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: cat.primary_color }} title="Primary" />
                        <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: cat.secondary_color }} title="Secondary" />
                        <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: cat.accent_color }} title="Accent" />
                      </div>
                    </div>
                    
                    {activeGame && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider min-w-0 max-w-[65%]" style={{ backgroundColor: `${cat.primary_color}15`, color: cat.primary_color, border: `1px solid ${cat.primary_color}30` }}>
                        <Power className="w-3 h-3 shrink-0" />
                        <span className="truncate">{activeGame.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Games List for Selected Category */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {gamesInCategory(selectedCategory.id).length === 0 ? (
            <div className="glassmorphism rounded-2xl p-16 text-center">
              <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-8 h-8 text-white/15" />
              </div>
              <p className="text-white/30 text-sm font-medium mb-1">No games in this category</p>
              <p className="text-white/20 text-xs">Click &ldquo;Add Game&rdquo; to add the first game</p>
            </div>
          ) : (
            gamesInCategory(selectedCategory.id).map((game, index) => {
              const isActive = game.id === activeGameId;
              
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glassmorphism rounded-2xl p-5 transition-all duration-500 ${
                    isActive ? 'ring-1' : ''
                  }`}
                  style={isActive ? {
                    '--tw-ring-color': selectedCategory.primary_color + '40',
                    boxShadow: `0 0 30px ${selectedCategory.primary_color}15, 0 0 0 1px ${selectedCategory.primary_color}25`,
                  } as React.CSSProperties : {}}
                >
                  <div className="flex items-center gap-5">
                    {/* Game icon / color indicator */}
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: (game.game_primary_color || selectedCategory.primary_color) + '15',
                        borderColor: (game.game_primary_color || selectedCategory.primary_color) + '20',
                      }}
                    >
                      <Gamepad2 className="w-6 h-6" style={{ color: game.game_primary_color || selectedCategory.primary_color }} />
                    </div>

                    {/* Game info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{game.name}</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{ 
                              backgroundColor: selectedCategory.primary_color + '15', 
                              color: selectedCategory.primary_color,
                              border: `1px solid ${selectedCategory.primary_color}30`
                            }}
                          >
                            ✦ Active on Website
                          </span>
                        )}
                      </div>
                      {game.hero_heading && (
                        <p className="text-xs text-white/40 truncate">{game.hero_heading}</p>
                      )}
                      {game.description && (
                        <p className="text-xs text-white/25 truncate mt-0.5">{game.description}</p>
                      )}
                      
                      {/* Game-specific color swatches */}
                      {game.game_primary_color && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-[10px] text-white/20 mr-1">Brand:</span>
                          <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: game.game_primary_color }} />
                          {game.game_secondary_color && <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: game.game_secondary_color }} />}
                          {game.game_accent_color && <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: game.game_accent_color }} />}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      
                      {/* Fees */}
                      <button 
                        onClick={() => handleOpenFeeModal(game)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.1] border border-white/[0.06] hover:border-white/[0.2] text-white/60 hover:text-white transition-all text-xs font-semibold"
                        title="Set Registration Fee"
                      >
                        <span className="font-mono">₹</span>
                        {game.registration_fee !== null && game.registration_fee !== undefined ? game.registration_fee : "Global"}
                      </button>

                      {/* Edit */}
                      <button 
                        onClick={() => {
                          setSelectedGame(game);
                          setIsAddGameModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.1] border border-white/[0.06] hover:border-white/[0.2] text-white/30 hover:text-white transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Toggle Active */}
                      <button 
                        onClick={() => handleSetActiveGame(game)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive 
                            ? 'text-white shadow-lg' 
                            : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
                        }`}
                        style={isActive ? {
                          background: `linear-gradient(135deg, ${selectedCategory.primary_color}, ${selectedCategory.secondary_color})`,
                          boxShadow: `0 4px 15px ${selectedCategory.primary_color}40`,
                        } : {}}
                      >
                        {isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {isActive ? 'Live' : 'Activate'}
                      </button>

                      {/* Delete */}
                      <button 
                        onClick={() => handleDeleteGame(game.id)}
                        className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 text-white/30 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      <GameEditorModal 
        isOpen={isAddGameModalOpen} 
        onClose={() => {
          setIsAddGameModalOpen(false);
          setSelectedGame(null);
        }}
        game={selectedGame}
        categoryId={selectedCategory?.id || ''}
        categories={categories}
        onSaved={(newGame) => {
          setGames(games.map(g => g.id === newGame.id ? newGame : g));
          setIsAddGameModalOpen(false);
        }}
      />

      {/* Fee Editor Modal */}
      <AnimatePresence>
        {feeModalGame && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setFeeModalGame(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Set Registration Fee</h3>
                <button onClick={() => setFeeModalGame(null)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-white/50 mb-4">
                  Set a custom fee for <strong>{feeModalGame.name}</strong>. Leave it blank to use the global default fee.
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono">₹</span>
                  <input
                    type="number"
                    value={feeModalValue}
                    onChange={(e) => setFeeModalValue(e.target.value)}
                    placeholder="e.g. 149"
                    className="w-full bg-black border border-white/[0.06] rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
              <div className="p-5 border-t border-white/[0.06] flex justify-end gap-3 bg-white/[0.02]">
                <button 
                  onClick={() => setFeeModalGame(null)} 
                  className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveFee} 
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-5 rounded-xl transition-colors shadow-lg shadow-purple-500/20 text-sm"
                >
                  Save Fee
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        {isAddCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setIsAddCategoryModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-1 border border-white/[0.08] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-purple-400" />
                  Add Category
                </h3>
                <button onClick={() => setIsAddCategoryModalOpen(false)} className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden flex">
                <form id="categoryForm" onSubmit={handleAddCategory} className="w-1/2 p-5 space-y-4 overflow-y-auto border-r border-white/[0.06]">
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-white/40 mb-1.5 block">Emoji</label>
                      <input type="text" value={categoryForm.emoji} onChange={e => setCategoryForm({...categoryForm, emoji: e.target.value})} className="w-full bg-surface-0 border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-center text-xl focus:outline-none focus:border-purple-500/40" />
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs font-semibold text-white/40 mb-1.5 block">Category Name *</label>
                      <input required type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full bg-surface-0 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40" placeholder="e.g. Fighting" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/40 mb-1.5 block">Overall Feel</label>
                    <input type="text" value={categoryForm.overall_feel} onChange={e => setCategoryForm({...categoryForm, overall_feel: e.target.value})} className="w-full bg-surface-0 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40" placeholder="e.g. Aggressive, fiery" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/40 mb-2 block">Theme Colors *</label>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.primary_color} onChange={e => setCategoryForm({...categoryForm, primary_color: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Primary</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.secondary_color} onChange={e => setCategoryForm({...categoryForm, secondary_color: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Secondary</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.accent_color} onChange={e => setCategoryForm({...categoryForm, accent_color: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Accent</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.color_background} onChange={e => setCategoryForm({...categoryForm, color_background: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Background</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.color_text} onChange={e => setCategoryForm({...categoryForm, color_text: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Text</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.color_muted} onChange={e => setCategoryForm({...categoryForm, color_muted: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Muted</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.color_surface} onChange={e => setCategoryForm({...categoryForm, color_surface: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Surface</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.color_card} onChange={e => setCategoryForm({...categoryForm, color_card: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Card</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.color_border} onChange={e => setCategoryForm({...categoryForm, color_border: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Border</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.color_glow} onChange={e => setCategoryForm({...categoryForm, color_glow: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Glow</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.gradient_start} onChange={e => setCategoryForm({...categoryForm, gradient_start: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Grad Start</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <input type="color" value={categoryForm.gradient_end} onChange={e => setCategoryForm({...categoryForm, gradient_end: e.target.value})} className="w-10 h-10 rounded-xl border border-white/[0.1] cursor-pointer bg-transparent" />
                        <span className="text-[10px] text-white/30 text-center">Grad End</span>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Live Preview Pane */}
                <div className="w-1/2 p-5 bg-black overflow-y-auto" style={{ backgroundColor: categoryForm.color_background, color: categoryForm.color_text }}>
                  <h4 className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: categoryForm.color_muted }}>Live Preview</h4>
                  
                  <div className="space-y-6 relative">
                    {/* Background Glow */}
                    <div className="absolute inset-0 blur-[100px] opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${categoryForm.color_glow} 0%, transparent 70%)` }} />

                    {/* Hero Section */}
                    <div className="text-center space-y-4 py-8 relative z-10" style={{ background: `linear-gradient(180deg, ${categoryForm.gradient_start}30 0%, ${categoryForm.gradient_end}10 100%)` }}>
                      <span className="text-4xl">{categoryForm.emoji}</span>
                      <h1 className="text-4xl font-black uppercase tracking-tight" style={{ color: categoryForm.color_text }}>
                        {categoryForm.name || 'Category Name'}
                      </h1>
                      <p className="text-sm max-w-sm mx-auto" style={{ color: categoryForm.color_muted }}>
                        {categoryForm.overall_feel || 'This is a sample description of the category theme.'}
                      </p>
                      <button className="px-6 py-2 rounded-full font-bold text-sm shadow-lg mt-4 transition-all hover:scale-105" style={{ backgroundColor: categoryForm.primary_color, color: '#fff', boxShadow: `0 0 20px ${categoryForm.color_glow}60` }}>
                        Join Tournament
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="grid gap-4 relative z-10">
                      <div className="p-4 rounded-xl border" style={{ backgroundColor: categoryForm.color_surface, borderColor: categoryForm.color_border }}>
                        <h3 className="text-lg font-bold mb-2" style={{ color: categoryForm.accent_color }}>Surface Element</h3>
                        <p className="text-sm mb-3" style={{ color: categoryForm.color_muted }}>Muted text looks like this inside a surface container.</p>
                        <div className="p-3 rounded-lg border" style={{ backgroundColor: categoryForm.color_card, borderColor: categoryForm.color_border }}>
                          <p className="text-sm font-semibold" style={{ color: categoryForm.secondary_color }}>Card Element inside Surface</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-white/[0.06] bg-surface-1">
                <button form="categoryForm" type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />}
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Activation Confirmation Modal */}
      <AnimatePresence>
        {gameToActivate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setGameToActivate(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-1 border border-white/[0.08] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Activate {gameToActivate.name}?</h3>
                <p className="text-sm text-white/50 mb-6">
                  This will change the public website to feature {gameToActivate.name} and apply the {selectedCategory?.name || 'selected'} theme. The previous active game will be deactivated.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setGameToActivate(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.1] text-white hover:bg-white/[0.05] transition-colors font-medium">
                    Cancel
                  </button>
                  <button onClick={confirmSetActiveGame} className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 transition-colors font-medium">
                    Activate Game
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
