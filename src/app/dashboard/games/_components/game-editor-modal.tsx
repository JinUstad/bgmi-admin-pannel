"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ImageUploadField from "./image-upload-field";

type GameEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  game: any | null; // if null, it's add mode
  categoryId: string;
  categories: any[];
  onSaved: (game: any) => void;
};

const TABS = ["General", "Home Content", "Tournaments Content", "Registration", "Blog & SEO", "Assets"];

export default function GameEditorModal({ isOpen, onClose, game, categoryId, categories, onSaved }: GameEditorModalProps) {
  const [activeTab, setActiveTab] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (game) {
      let cards = game.tournament_category_cards;
      if (typeof cards === 'string') {
        try { cards = JSON.parse(cards); } catch (e) { cards = []; }
      }
      if (!Array.isArray(cards) || cards.length === 0) {
        cards = [
          { title: "Card 1", entryFee: "₹100", prizePool: "₹500", timing: "Daily", image: "", disabled: false },
          { title: "Card 2", entryFee: "₹200", prizePool: "₹1000", timing: "Weekly", image: "", disabled: false },
          { title: "Card 3", entryFee: "₹500", prizePool: "₹5000", timing: "Monthly", image: "", disabled: false }
        ];
      }
      setFormData({ ...game, show_tournament_categories: game.show_tournament_categories ?? true, tournament_category_cards: cards });
    } else {
      setFormData({
        name: "",
        category_id: categoryId,
        theme_identifier: "",
        registration_fee: "",
        game_primary_color: "",
        game_secondary_color: "",
        game_accent_color: "",
        tagline: "",
        short_description: "",
        long_description: "",
        hero_heading: "",
        hero_subheading: "",
        hero_paragraph: "",
        hero_primary_cta: "",
        hero_secondary_cta: "",
        why_choose_us_heading: "",
        why_choose_us_description: "",
        why_choose_us_features: "[]",
        about_heading: "",
        about_subheading: "",
        about_paragraph: "",
        about_cta: "",
        tournaments_category_heading: "",
        tournaments_category_description: "",
        tournament_formats: "[]",
        how_it_works_heading: "",
        how_it_works_description: "",
        how_it_works_steps: "[]",
        cta_heading: "",
        cta_description: "",
        cta_button_text: "",
        registration_heading: "",
        registration_description: "",
        registration_instructions: "",
        registration_requirements: "[]",
        registration_confirmation: "",
        tournament_page_heading: "",
        tournament_page_description: "",
        upcoming_battles_heading: "",
        daily_battle_heading: "",
        faq_heading: "",
        faq_description: "",
        game_faqs: "[]",
        blog_page_heading: "",
        blog_page_description: "",
        blog_introductory_text: "",
        seo_meta_title: "",
        seo_meta_description: "",
        seo_og_title: "",
        seo_og_description: "",
        hero_background: "",
        why_choose_us_background: "",
        why_choose_us_side_image: "",
        tournament_categories_background: "",
        upcoming_battles_background: "",
        daily_battle_side_image: "",
        faq_background: "",
        registration_background: "",
        blog_background: "",
        show_tournament_categories: true,
        tournament_category_cards: [
          { title: "Card 1", entryFee: "₹100", prizePool: "₹500", timing: "Daily", image: "", disabled: false },
          { title: "Card 2", entryFee: "₹200", prizePool: "₹1000", timing: "Weekly", image: "", disabled: false },
          { title: "Card 3", entryFee: "₹500", prizePool: "₹5000", timing: "Monthly", image: "", disabled: false }
        ]
      });
    }
  }, [game, categoryId]);

  if (!isOpen) return null;

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Name is required");

    setIsSubmitting(true);
    
    // Parse JSON fields safely before saving
    let payload = { ...formData };
    payload.slug = payload.theme_identifier || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    payload.theme_identifier = payload.slug;
    payload.series_id = payload.category_id; // backward compat
    
    if (payload.registration_fee === "") {
      payload.registration_fee = null;
    } else if (payload.registration_fee !== null && payload.registration_fee !== undefined) {
      payload.registration_fee = parseFloat(payload.registration_fee);
    }
    
    // Remove game_categories object from payload
    delete payload.game_categories;

    const jsonFields = ["why_choose_us_features", "tournament_formats", "how_it_works_steps", "registration_requirements", "game_faqs", "tournament_category_cards"];
    for (const field of jsonFields) {
      if (typeof payload[field] === "string") {
        try {
          payload[field] = JSON.parse(payload[field] || "[]");
        } catch(e) {
          console.error(`Invalid JSON in ${field}`);
          payload[field] = [];
        }
      }
    }

    let response;
    if (game?.id) {
      response = await supabase.from("games").update(payload).eq("id", game.id).select("*, game_categories!games_category_id_fkey(*)").single();
    } else {
      payload.is_active = false;
      response = await supabase.from("games").insert(payload).select("*, game_categories!games_category_id_fkey(*)").single();
    }

    setIsSubmitting(false);

    if (response.error) {
      console.error(response.error);
      alert("Error saving game: " + response.error.message);
    } else if (response.data) {
      onSaved(response.data);
      onClose();
    }
  };

  const renderJsonField = (name: string, label: string, placeholder: string) => (
    <div className="col-span-full">
      <label className="text-xs font-semibold text-white/40 mb-1.5 block">{label} (Valid JSON Array)</label>
      <textarea 
        name={name}
        value={typeof formData[name] === 'object' ? JSON.stringify(formData[name], null, 2) : formData[name]}
        onChange={handleChange}
        rows={4} 
        className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40 font-mono"
        placeholder={placeholder}
      ></textarea>
    </div>
  );

  const renderField = (name: string, label: string, type = "text", placeholder = "", fullWidth = false) => (
    <div className={fullWidth ? "col-span-full" : "col-span-1"}>
      <label className="text-xs font-semibold text-white/40 mb-1.5 block">{label}</label>
      {type === "textarea" ? (
        <textarea name={name} value={formData[name] || ""} onChange={handleChange} rows={3} className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40" placeholder={placeholder}></textarea>
      ) : type === "color" ? (
        <input type="color" name={name} value={formData[name] || "#000000"} onChange={handleChange} className="w-10 h-10 rounded-lg border border-white/[0.1] cursor-pointer bg-transparent" />
      ) : (
        <input type={type} name={name} value={formData[name] || ""} onChange={handleChange} className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40" placeholder={placeholder} />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-5xl flex flex-col h-[90vh] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {game ? "Edit Game" : "Add New Game"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] overflow-x-auto">
          {TABS.map(tab => (
            <button 
              key={tab} 
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === tab ? "text-purple-400 border-b-2 border-purple-400" : "text-white/40 hover:text-white/70"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/20">
          <form id="gameEditorForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {activeTab === "General" && (
              <>
                {renderField("name", "Game Name *")}
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1.5 block">Category *</label>
                  <select name="category_id" required value={formData.category_id || ""} onChange={handleChange} className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40 appearance-none">
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
                {renderField("theme_identifier", "Theme Identifier / Slug (e.g. bgmi)")}
                {renderField("tagline", "Tagline")}
                {renderField("short_description", "Short Description", "textarea", "", true)}
                {renderField("long_description", "Long Description", "textarea", "", true)}
                
                <div className="col-span-full border-t border-white/5 pt-4">
                  <h4 className="text-white/60 font-bold mb-3">Brand Colors</h4>
                </div>
                {renderField("game_primary_color", "Primary Color", "color")}
                {renderField("game_secondary_color", "Secondary Color", "color")}
                {renderField("game_accent_color", "Accent Color", "color")}
              </>
            )}

            {activeTab === "Home Content" && (
              <>
                <div className="col-span-full mb-2"><h4 className="text-purple-400 font-bold">Hero Section</h4></div>
                {renderField("hero_heading", "Heading")}
                {renderField("hero_subheading", "Subheading")}
                {renderField("hero_paragraph", "Paragraph", "textarea", "", true)}
                {renderField("hero_primary_cta", "Primary CTA Button")}
                {renderField("hero_secondary_cta", "Secondary CTA Button")}

                <div className="col-span-full mb-2 mt-4"><h4 className="text-purple-400 font-bold">Why Choose Us</h4></div>
                {renderField("why_choose_us_heading", "Heading")}
                {renderField("why_choose_us_description", "Description")}
                {renderJsonField("why_choose_us_features", "Features", '[{"title":"...", "description":"..."}]')}

                <div className="col-span-full mb-2 mt-4"><h4 className="text-purple-400 font-bold">About / Expo Section</h4></div>
                {renderField("about_heading", "Heading")}
                {renderField("about_subheading", "Subheading")}
                {renderField("about_cta", "CTA Text")}
                {renderField("about_paragraph", "Paragraph", "textarea", "", true)}
                
                <div className="col-span-full mb-2 mt-4"><h4 className="text-purple-400 font-bold">Global CTA Section</h4></div>
                {renderField("cta_heading", "CTA Heading")}
                {renderField("cta_description", "CTA Description")}
                {renderField("cta_button_text", "CTA Button Text")}
              </>
            )}

            {activeTab === "Tournaments Content" && (
              <>
                <div className="col-span-full mb-2"><h4 className="text-purple-400 font-bold">Tournament Categories</h4></div>
                
                <div className="col-span-full flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 mb-4">
                  <div>
                    <label className="text-sm font-bold text-white block">Show Categories Section</label>
                    <p className="text-xs text-white/40">Toggle visibility of this section on the home page.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.show_tournament_categories !== false} onChange={(e) => setFormData({...formData, show_tournament_categories: e.target.checked})} />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>

                {/* The 3 Cards */}
                <div className="col-span-full space-y-6 mb-4">
                  {[0, 1, 2].map((idx) => {
                    const card = formData.tournament_category_cards?.[idx] || {};
                    const updateCard = (key: string, value: any) => {
                      const newCards = [...(formData.tournament_category_cards || [])];
                      newCards[idx] = { ...newCards[idx], [key]: value };
                      setFormData({ ...formData, tournament_category_cards: newCards });
                    };

                    return (
                      <div key={idx} className="p-5 border border-white/10 rounded-xl bg-zinc-900/50 space-y-4">
                        <h5 className="font-bold text-white/80">Category Card {idx + 1}</h5>
                        
                        <ImageUploadField 
                          label={`Card ${idx + 1} Image (1920x1080)`} 
                          name={`card_image_${idx}`} 
                          value={card.image || ""} 
                          onChange={(n, v) => updateCard("image", v)} 
                          folderPath={`games/${formData.theme_identifier || 'draft'}/categories`} 
                        />
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="text-xs font-semibold text-white/40 mb-1.5 block">Title</label>
                            <input type="text" value={card.title || ""} onChange={(e) => updateCard("title", e.target.value)} className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-white/40 mb-1.5 block">Entry Fee</label>
                            <input type="text" value={card.entryFee || ""} onChange={(e) => updateCard("entryFee", e.target.value)} className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-white/40 mb-1.5 block">Prize Pool</label>
                            <input type="text" value={card.prizePool || ""} onChange={(e) => updateCard("prizePool", e.target.value)} className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-white/40 mb-1.5 block">Timing</label>
                            <input type="text" value={card.timing || ""} onChange={(e) => updateCard("timing", e.target.value)} className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40" />
                          </div>
                          <div className="col-span-2 flex items-center gap-2 mt-2">
                            <input type="checkbox" id={`disable_card_${idx}`} checked={card.disabled || false} onChange={(e) => updateCard("disabled", e.target.checked)} className="rounded border-white/20 bg-zinc-900 w-4 h-4" />
                            <label htmlFor={`disable_card_${idx}`} className="text-sm text-white/70 cursor-pointer">Disable / Mark as Unavailable</label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {renderField("tournaments_category_heading", "Heading")}
                {renderField("tournaments_category_description", "Description")}
                {renderJsonField("tournament_formats", "Formats", '[{"name":"...", "description":"..."}]')}

                <div className="col-span-full mb-2 mt-4"><h4 className="text-purple-400 font-bold">How It Works</h4></div>
                {renderField("how_it_works_heading", "Heading")}
                {renderField("how_it_works_description", "Description")}
                {renderJsonField("how_it_works_steps", "Steps", '[{"title":"...", "description":"..."}]')}

                <div className="col-span-full mb-2 mt-4"><h4 className="text-purple-400 font-bold">Tournaments Page Copy</h4></div>
                {renderField("tournament_page_heading", "Page Heading")}
                {renderField("tournament_page_description", "Page Description")}
                {renderField("upcoming_battles_heading", "Upcoming Battles Heading")}
                {renderField("daily_battle_heading", "Daily Battle Heading")}
                {renderField("faq_heading", "FAQ Heading")}
                {renderField("faq_description", "FAQ Description")}
                {renderJsonField("game_faqs", "FAQs Array", '[{"q":"...", "a":"..."}]')}
              </>
            )}

            {activeTab === "Registration" && (
              <>
                <div className="col-span-full mb-2">
                  <h4 className="text-purple-400 font-bold">Registration Settings</h4>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1.5 block">Registration Fee (₹) [Leave blank to use global setting]</label>
                  <input 
                    type="number" 
                    name="registration_fee"
                    value={formData.registration_fee || ""} 
                    onChange={handleChange} 
                    className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40" 
                    placeholder="e.g. 149"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1.5 block">Team Size (Number of players in a team)</label>
                  <input 
                    type="number" 
                    name="team_size"
                    value={formData.team_size || ""} 
                    onChange={handleChange} 
                    className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40" 
                    placeholder="e.g. 4 for BGMI, 1 for Tekken"
                  />
                </div>
                
                <div className="col-span-full mb-2 mt-4">
                  <h4 className="text-purple-400 font-bold">Registration Page Content</h4>
                </div>
                {renderField("registration_heading", "Heading")}
                {renderField("registration_description", "Description")}
                {renderField("registration_confirmation", "Confirmation Message")}
                {renderField("registration_instructions", "Instructions", "textarea", "", true)}
                {renderJsonField("registration_requirements", "Requirements Array", '["Requirement 1", "Requirement 2"]')}
              </>
            )}

            {activeTab === "Blog & SEO" && (
              <>
                <div className="col-span-full mb-2"><h4 className="text-purple-400 font-bold">Blogs</h4></div>
                {renderField("blog_page_heading", "Blog Page Heading")}
                {renderField("blog_page_description", "Blog Page Description")}
                {renderField("blog_introductory_text", "Introductory Text", "textarea", "", true)}

                <div className="col-span-full mb-2 mt-4"><h4 className="text-purple-400 font-bold">SEO Meta Tags</h4></div>
                {renderField("seo_meta_title", "Meta Title")}
                {renderField("seo_meta_description", "Meta Description")}
                {renderField("seo_og_title", "OG Title")}
                {renderField("seo_og_description", "OG Description")}
              </>
            )}

            {activeTab === "Assets" && (
              <>
                <div className="col-span-full mb-2">
                  <h4 className="text-purple-400 font-bold">Image Assets</h4>
                  <p className="text-xs text-white/50 mt-1">Upload images via Supabase Storage and paste the URLs here.</p>
                </div>
                <ImageUploadField label="Hero Background (1920x1080)" name="hero_background" value={formData.hero_background} onChange={(n, v) => setFormData({ ...formData, [n]: v })} folderPath={`games/${formData.theme_identifier || formData.name || 'draft'}`} />
                <ImageUploadField label="Why Choose Us Background (1920x1080)" name="why_choose_us_background" value={formData.why_choose_us_background} onChange={(n, v) => setFormData({ ...formData, [n]: v })} folderPath={`games/${formData.theme_identifier || formData.name || 'draft'}`} />
                <ImageUploadField label="Why Choose Us Side Character (800x800 Transparent PNG)" name="why_choose_us_side_image" value={formData.why_choose_us_side_image} onChange={(n, v) => setFormData({ ...formData, [n]: v })} folderPath={`games/${formData.theme_identifier || formData.name || 'draft'}`} />
                <ImageUploadField label="Tournament Categories Background (1920x1080)" name="tournament_categories_background" value={formData.tournament_categories_background} onChange={(n, v) => setFormData({ ...formData, [n]: v })} folderPath={`games/${formData.theme_identifier || formData.name || 'draft'}`} />
                <ImageUploadField label="Upcoming Battles Hero (1920x1080)" name="upcoming_battles_background" value={formData.upcoming_battles_background} onChange={(n, v) => setFormData({ ...formData, [n]: v })} folderPath={`games/${formData.theme_identifier || formData.name || 'draft'}`} />
                <ImageUploadField label="Daily Battle Character (600x800 Transparent PNG)" name="daily_battle_side_image" value={formData.daily_battle_side_image} onChange={(n, v) => setFormData({ ...formData, [n]: v })} folderPath={`games/${formData.theme_identifier || formData.name || 'draft'}`} />
                <ImageUploadField label="FAQ Background (1920x1080)" name="faq_background" value={formData.faq_background} onChange={(n, v) => setFormData({ ...formData, [n]: v })} folderPath={`games/${formData.theme_identifier || formData.name || 'draft'}`} />
                <ImageUploadField label="Registration Background (1920x1080)" name="registration_background" value={formData.registration_background} onChange={(n, v) => setFormData({ ...formData, [n]: v })} folderPath={`games/${formData.theme_identifier || formData.name || 'draft'}`} />
                <ImageUploadField label="Blog Background (1920x1080)" name="blog_background" value={formData.blog_background} onChange={(n, v) => setFormData({ ...formData, [n]: v })} folderPath={`games/${formData.theme_identifier || formData.name || 'draft'}`} />
              </>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.06] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-white hover:bg-white/[0.05] transition-colors font-medium">
            Cancel
          </button>
          <button form="gameEditorForm" type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? 'Saving...' : 'Save Game'}
          </button>
        </div>

      </div>
    </div>
  );
}
