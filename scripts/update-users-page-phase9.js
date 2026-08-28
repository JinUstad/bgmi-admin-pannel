const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/dashboard/users/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Interfaces
content = content.replace(
  `interface Registration {`,
  `interface Game {
  id: string;
  name: string;
  category_id: string;
  game_categories?: { name: string; slug: string };
}

interface Registration {`
);

// 2. Add games state
content = content.replace(
  `const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);`,
  `const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [games, setGames] = useState<Game[]>([]);`
);

// 3. Add game_id to forms
content = content.replace(
  `total_amount: 0,\n    pending_amount: 0\n  });`,
  `total_amount: 0,\n    pending_amount: 0,\n    game_id: ''\n  });`
);
content = content.replace(
  `total_amount: 0,\n    pending_amount: 0\n  });`,
  `total_amount: 0,\n    pending_amount: 0,\n    game_id: ''\n  });`
);

// 4. Update fetchUsers
content = content.replace(
  `.select('*')`,
  `.select('*, games(name, category_id, game_categories(name, slug))')`
);

// 5. Add fetchGames and update useEffect
content = content.replace(
  `fetchTimeSlots();\n    fetchUsers();\n  }, []);`,
  `fetchTimeSlots();\n    fetchUsers();\n    fetchGames();\n  }, []);\n\n  const fetchGames = async () => {\n    const { data } = await supabase\n      .from('games')\n      .select('*, game_categories(name, slug)')\n      .order('name');\n    if (data) setGames(data);\n  };`
);

// 6. Table Header
content = content.replace(
  `<th className="px-4 py-3 text-left text-xs font-bold text-white/50 uppercase tracking-widest">Time Slot</th>`,
  `<th className="px-4 py-3 text-left text-xs font-bold text-white/50 uppercase tracking-widest">Game</th>\n                  <th className="px-4 py-3 text-left text-xs font-bold text-white/50 uppercase tracking-widest">Time Slot</th>`
);

// 7. Table Cell
content = content.replace(
  `<td className="px-4 py-4 border-b border-white/5 text-white/70 whitespace-nowrap">\n                      {user.time_slot || 'N/A'}\n                    </td>`,
  `<td className="px-4 py-4 border-b border-white/5 text-white/70 whitespace-nowrap">\n                      {user.games?.name || 'N/A'}\n                    </td>\n                    <td className="px-4 py-4 border-b border-white/5 text-white/70 whitespace-nowrap">\n                      {user.time_slot || 'N/A'}\n                    </td>`
);

// 8. Add Game Dropdown and Dynamic form logic to Add User Modal
const addRegex = /<div>\\s*<label className="text-xs font-bold text-white\\/50 uppercase tracking-widest mb-1 block">Full Name \\*<\\/label>[\\s\\S]*?<input type="text" value=\\{formData.team_name\\}[^>]*>\\s*<\\/div>/;

const gameDropdownHtml = `
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Select Game *</label>
                <select 
                  required
                  value={formData.game_id}
                  onChange={e => setFormData({ ...formData, game_id: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                >
                  <option value="">Select Game</option>
                  {games.map(g => (
                    <option key={g.id} value={g.id}>{g.game_categories?.name ? \`\${g.game_categories.name} - \` : ''}{g.name}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const selectedGame = games.find(g => g.id === formData.game_id);
                const isFighting = selectedGame?.game_categories?.slug === 'fighting' || selectedGame?.name?.toLowerCase().includes('tekken');
                
                return (
                  <>
                    <div>
                      <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">
                        {isFighting ? 'Player Name *' : 'Team Name'}
                      </label>
                      <input 
                        required={isFighting}
                        value={formData.team_name}
                        onChange={e => setFormData({ ...formData, team_name: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" 
                        placeholder={isFighting ? "John Doe" : "Team Soul"}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">
                        {isFighting ? 'Full Name' : 'Full Name *'}
                      </label>
                      <input 
                        required={!isFighting}
                        value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" 
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">
                        {isFighting ? 'In-Game Name (IGN) (Optional)' : 'BGMI ID *'}
                      </label>
                      <input 
                        required={!isFighting}
                        value={formData.bgmi_id}
                        onChange={e => setFormData({ ...formData, bgmi_id: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" 
                        placeholder={isFighting ? "Faker" : "e.g. 22222, 33333"}
                      />
                    </div>
                  </>
                );
              })()}`;

content = content.replace(addRegex, gameDropdownHtml);

// 9. Add Game Dropdown and Dynamic form logic to Edit User Modal
const editRegex = /<div>\\s*<label className="text-xs font-bold text-white\\/50 uppercase tracking-widest mb-1 block">Full Name \\*<\\/label>[\\s\\S]*?<input type="text" value=\\{editFormData.team_name\\}[^>]*>\\s*<\\/div>/;

const editGameDropdownHtml = `
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Select Game *</label>
                <select 
                  required
                  value={editFormData.game_id}
                  onChange={e => setEditFormData({ ...editFormData, game_id: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                >
                  <option value="">Select Game</option>
                  {games.map(g => (
                    <option key={g.id} value={g.id}>{g.game_categories?.name ? \`\${g.game_categories.name} - \` : ''}{g.name}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const selectedGame = games.find(g => g.id === editFormData.game_id);
                const isFighting = selectedGame?.game_categories?.slug === 'fighting' || selectedGame?.name?.toLowerCase().includes('tekken');
                
                return (
                  <>
                    <div>
                      <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">
                        {isFighting ? 'Player Name *' : 'Team Name'}
                      </label>
                      <input 
                        required={isFighting}
                        value={editFormData.team_name}
                        onChange={e => setEditFormData({ ...editFormData, team_name: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" 
                        placeholder={isFighting ? "John Doe" : "Team Soul"}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">
                        {isFighting ? 'Full Name' : 'Full Name *'}
                      </label>
                      <input 
                        required={!isFighting}
                        value={editFormData.full_name}
                        onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" 
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">
                        {isFighting ? 'In-Game Name (IGN) (Optional)' : 'BGMI ID *'}
                      </label>
                      <input 
                        required={!isFighting}
                        value={editFormData.bgmi_id}
                        onChange={e => setEditFormData({ ...editFormData, bgmi_id: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" 
                        placeholder={isFighting ? "Faker" : "e.g. 22222, 33333"}
                      />
                    </div>
                  </>
                );
              })()}`;

content = content.replace(editRegex, editGameDropdownHtml);

// 10. Update edit user click to set game_id
content = content.replace(
  `setEditFormData({
      full_name: user.full_name || '',`,
  `setEditFormData({
      game_id: user.game_id || '',
      full_name: user.full_name || '',`
);

fs.writeFileSync(pagePath, content);
console.log('Successfully updated page.tsx');
