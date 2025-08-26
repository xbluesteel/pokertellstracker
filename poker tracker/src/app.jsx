import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// --- CONFIGURATION ---
const TELL_CATEGORIES_DEFAULT = {
  'Avant un bet': { force: ['Souffle avant de jouer', 'Snap referme ses cartes'], faiblesse: ['Double-look ses cartes'] },
  'Pendant un bet': { force: ['Timing long avant de big Bet', 'Mise nonchalamment river', 'Fait le distrait par événement externe', 'Annonce fermement sa mise', 'Regarde l’adversaire sur big bet', 'Mise ostentatoire bruyante flop', 'Mise nonchalante'], faiblesse: ['Timing long avant de check', 'Check ostentatoire', 'Mise en avançant loin les jetons', 'Annonce ostentatoire une mise weak river', 'Attitude ostentatoire sur mise', 'Cbet sans annoncer sa mise', 'Mise nonchalamment', 'Utilise les petits jetons', 'Pousse les jetons loin devant'] },
  'Après un bet': { force: ['Parle sur mise river', 'Agite la jambe', 'Sourire véritable sur all-in', 'Yeux relâchés', 'Regarde l’adversaire après grosse mise', 'Fait les yeux doux', 'Bouge la tête sur big bet'], faiblesse: ['Parle sur mise river', 'Regarde longuement le board', 'Faux sourire', 'Raideur', 'Claque ses cartes', 'Sourire en attendant l’action'] }
};
const CERTITUDE_LEVELS = [1, 2, 5];

// --- Icônes ---
const Icon = ({ path, className = "w-6 h-6" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d={path} clipRule="evenodd" /></svg>;
const PencilIcon = () => <Icon path="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />;
const XMarkIcon = () => <Icon path="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" />;
const TrashIcon = () => <Icon path="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.742.742H5.654a.75.75 0 01-.742-.742L3.907 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.347-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.498.058l.347-9z" />;
const SwitchIcon = () => <Icon path="M3 7.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 7.5zM3 16.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM16.125 12a.75.75 0 01-.75-.75V6.375a.75.75 0 011.5 0v4.875a.75.75 0 01-.75.75zM8.625 12a.75.75 0 01-.75-.75V6.375a.75.75 0 011.5 0v4.875a.75.75 0 01-.75.75zM12.375 18a.75.75 0 01-.75-.75v-4.875a.75.75 0 011.5 0v4.875a.75.75 0 01-.75.75z" className="w-4 h-4" />;
const PlusCircleIcon = () => <Icon path="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5" />;
const HamburgerIcon = () => <Icon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />;

// --- Composant TellSelection ---
function TellSelection({ stagedTells, setStagedTells, allTells, onShowCreateTellWithDefaults }) {
  const [category, setCategory] = useState(Object.keys(allTells)[0]);
  const [tellToCertify, setTellToCertify] = useState(null);
  const longPressTimer = useRef();
  const isLongPress = useRef(false);

  const handlePressStart = (tell) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onShowCreateTellWithDefaults(tell);
    }, 500); // 500ms for long press
  };

  const handlePressEnd = (tell) => {
    clearTimeout(longPressTimer.current);
    if (!isLongPress.current) {
        !stagedTells.some(t => t.behavior === tell.text && t.category === category) && setTellToCertify(tell);
    }
  };

  const handleCertitudeSelect = (certainty) => {
    setStagedTells(prev => [...prev, { ...tellToCertify, certainty, id: crypto.randomUUID(), category }]);
    setTellToCertify(null);
  };
  
  const isTellStaged = (tellText, cat) => stagedTells.some(t => t.text === tellText && t.category === cat);
  
  return (
    <div className="flex flex-col flex-grow min-h-0 relative">
      <div className="mb-4 flex-shrink-0">
        <label className="block text-sm font-medium text-gray-300 mb-2">Moment de l'action</label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(allTells).map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} type="button"
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${category === cat ? 'bg-cyan-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <h3 className="text-center font-bold text-green-400">Confort / Force</h3>
            <div className="flex flex-col space-y-2 mt-2">
              {allTells[category].force.map(tellText => (
                <button key={tellText} 
                  onMouseDown={() => handlePressStart({ text: tellText, strength: 'force', category })}
                  onMouseUp={() => handlePressEnd({ text: tellText, strength: 'force' })}
                  onTouchStart={() => handlePressStart({ text: tellText, strength: 'force', category })}
                  onTouchEnd={() => handlePressEnd({ text: tellText, strength: 'force' })}
                  disabled={isTellStaged(tellText, category)}
                  className="p-2 text-sm text-left rounded-lg border-2 bg-gray-700/50 border-transparent hover:bg-gray-600/50 disabled:opacity-40 disabled:cursor-not-allowed">
                  {tellText}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-center font-bold text-red-400">Inconfort / Faiblesse</h3>
            <div className="flex flex-col space-y-2 mt-2">
              {allTells[category].faiblesse.map(tellText => (
                <button key={tellText} 
                  onMouseDown={() => handlePressStart({ text: tellText, strength: 'faiblesse', category })}
                  onMouseUp={() => handlePressEnd({ text: tellText, strength: 'faiblesse' })}
                  onTouchStart={() => handlePressStart({ text: tellText, strength: 'faiblesse', category })}
                  onTouchEnd={() => handlePressEnd({ text: tellText, strength: 'faiblesse' })}
                  disabled={isTellStaged(tellText, category)}
                  className="p-2 text-sm text-left rounded-lg border-2 bg-gray-700/50 border-transparent hover:bg-gray-600/50 disabled:opacity-40 disabled:cursor-not-allowed">
                  {tellText}
                </button>
              ))}
            </div>
          </div>
        </div>

      {tellToCertify && (
        <div className="absolute inset-0 bg-black/60 flex justify-center items-center">
          <div className="flex gap-2 bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-lg flex-col">
            <p className="text-center text-gray-300 mb-2">Certitude pour :<br/><strong className="text-white">{tellToCertify.text}</strong></p>
            <div className="flex gap-2">
              {CERTITUDE_LEVELS.map(level => (
                <button key={level} onClick={() => handleCertitudeSelect(level)} type="button"
                  className="w-12 h-12 flex items-center justify-center text-lg font-bold rounded-lg bg-gray-700 hover:bg-cyan-600">
                  {level}
                </button>
              ))}
              <button onClick={() => setTellToCertify(null)} type="button"
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-red-600">
                <XMarkIcon className="w-6 h-6"/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Composant HistoryView ---
function HistoryView({ player, onDeleteTell }) {
    const getCertitudeColor = (c) => c === 5 ? 'bg-green-600' : c === 2 ? 'bg-yellow-600' : 'bg-gray-600';
    const tellsToDisplay = player.tells || [];
    if (tellsToDisplay.length === 0) return <p className="text-gray-400 text-center mt-8">Aucun tell enregistré.</p>;
    
    return <div className="overflow-y-auto h-full pr-2 -mr-2"><div className="space-y-3">{[...tellsToDisplay].reverse().map(tell => <div key={tell.id} className="bg-gray-700 p-3 rounded-lg relative"><div className="flex justify-between items-start"><div><p className="font-semibold text-gray-300">{tell.category} - <span className={tell.strength.includes('Force') ? 'text-green-400' : 'text-red-400'}>{tell.strength}</span></p><p>{tell.behavior}</p></div><span className={`text-xs font-bold px-2 py-1 rounded-full ${getCertitudeColor(tell.certainty)}`}>Cert. {tell.certainty}</span></div>{tell.notes && <p className="mt-2 text-sm italic text-gray-400">"{tell.notes}"</p>}<button onClick={() => onDeleteTell(player.id, tell.id)} className="absolute bottom-2 right-2 text-gray-500 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button></div>)}</div></div>;
}

// --- Composant PlayerDetailsModal ---
function PlayerDetailsModal({ player, onClose, onSaveTells, onDeleteTell, onNameChange, onResetPlayer, allTells, onShowCreateTellWithDefaults }) {
    const [activeTab, setActiveTab] = useState('add'); const [isEditingName, setIsEditingName] = useState(false); const [newName, setNewName] = useState(player?.name || ''); const nameInputRef = useRef(null);
    const [stagedTells, setStagedTells] = useState([]); const [notes, setNotes] = useState('');
    const getCertitudeColor = (c) => c === 5 ? 'bg-green-600' : c === 2 ? 'bg-yellow-600' : 'bg-gray-600';

    useEffect(() => { setActiveTab('add'); setIsEditingName(false); if (player) { setNewName(player.name); setStagedTells([]); setNotes(''); } }, [player]);
    useEffect(() => { if (isEditingName && nameInputRef.current) nameInputRef.current.select(); }, [isEditingName]);
    const handleNameSave = () => { if (newName.trim()) onNameChange(player.id, newName.trim()); setIsEditingName(false); };
    const removeStagedTell = (id) => setStagedTells(prev => prev.filter(t => t.id !== id));
    
    const handleSubmit = () => {
        const newTells = stagedTells.map(tell => ({ ...tell, notes, timestamp: new Date().toISOString(), strength: tell.strength === 'force' ? 'Force 💪' : 'Faiblesse 👻', behavior: tell.text }));
        onSaveTells(player.id, newTells);
        onClose();
    };
    
    const handleReset = () => {
        onResetPlayer(player.id);
        onClose();
    };

    if (!player) return null;
    return <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-2 sm:p-4"><div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[700px] p-4 sm:p-6 border border-gray-700 flex flex-col overflow-hidden"><div className="flex justify-between items-center mb-4 flex-shrink-0"><div className="flex items-center gap-2">{isEditingName ? <input ref={nameInputRef} value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleNameSave} onKeyDown={(e) => e.key === 'Enter' && handleNameSave()} className="bg-gray-700 text-xl font-bold text-cyan-400 rounded p-1" /> : <h2 className="text-lg sm:text-xl font-bold">Détails de <span className="text-cyan-400">{player.name}</span></h2>}{!player.isHero && !isEditingName && <><button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-white" title="Modifier le nom"><PencilIcon className="w-4 h-4" /></button><button onClick={handleReset} className="text-gray-400 hover:text-white" title="Remplacer le joueur"><SwitchIcon /></button></>}</div><button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon /></button></div><div className="flex space-x-2 border-b border-gray-700 mb-4 flex-shrink-0"><button onClick={() => setActiveTab('add')} className={`py-2 px-4 font-semibold ${activeTab === 'add' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400'}`}>Ajouter</button><button onClick={() => setActiveTab('history')} className={`py-2 px-4 font-semibold ${activeTab === 'history' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400'}`}>Historique ({player.tells.length})</button><button onClick={() => {onClose(); onShowCreateTellWithDefaults(null);}} className="py-2 px-4 font-semibold text-gray-400 flex items-center gap-2"><PlusCircleIcon/> Créer</button></div><div className="flex-grow min-h-0 overflow-y-auto pr-2 -mr-2">{activeTab === 'add' ? <TellSelection stagedTells={stagedTells} setStagedTells={setStagedTells} allTells={allTells} onShowCreateTellWithDefaults={onShowCreateTellWithDefaults} /> : <HistoryView player={player} onDeleteTell={onDeleteTell} />}</div>{activeTab === 'add' && <div className="mt-4 pt-4 border-t border-gray-700 flex-shrink-0"><div className="mb-3 space-y-2 max-h-24 overflow-y-auto">{stagedTells.length > 0 && <h4 className="text-sm font-semibold text-gray-300">Tells à enregistrer :</h4>}{stagedTells.map(t => <div key={t.id} className="flex justify-between items-center bg-gray-900/50 p-1.5 rounded-md text-sm"><span className="truncate pr-2">{t.text}</span><div className="flex items-center gap-2"><span className={`text-xs font-bold px-2 py-1 rounded-full ${getCertitudeColor(t.certainty)}`}>Cert. {t.certainty}</span><button type="button" onClick={() => removeStagedTell(t.id)} className="text-gray-500 hover:text-white"><XMarkIcon className="w-4 h-4" /></button></div></div>)}</div><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" className="w-full bg-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500" placeholder="Notes communes (optionnel)"></textarea><div className="flex justify-end mt-3"><button type="button" onClick={handleSubmit} disabled={stagedTells.length === 0} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-600">Enregistrer ({stagedTells.length})</button></div></div>}</div></div>;
}

// --- Composant CreateTellModal ---
function CreateTellModal({ onClose, onSaveCustomTell, defaultData }) {
    const [text, setText] = useState(defaultData?.text || ''); 
    const [category, setCategory] = useState(defaultData?.category || Object.keys(TELL_CATEGORIES_DEFAULT)[0]); 
    const [strength, setStrength] = useState(defaultData?.strength || 'force');
    
    useEffect(() => {
        if(defaultData) {
            setText(defaultData.text);
            setCategory(defaultData.category);
            setStrength(defaultData.strength);
        }
    }, [defaultData]);

    return <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"><div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-700"><h2 className="text-xl font-bold mb-4">Créer un Tell Personnalisé</h2><form onSubmit={(e) => { e.preventDefault(); onSaveCustomTell({ text, category, strength }); onClose(); }} className="space-y-4"><div><label className="block text-sm font-medium text-gray-300 mb-1">Description du Tell</label><input type="text" value={text} onChange={(e) => setText(e.target.value)} required className="w-full bg-gray-700 rounded p-2" /></div><div><label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-700 rounded p-2">{Object.keys(TELL_CATEGORIES_DEFAULT).map(c => <option key={c} value={c}>{c}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-300 mb-1">Type</label><select value={strength} onChange={(e) => setStrength(e.target.value)} className="w-full bg-gray-700 rounded p-2"><option value="force">Confort / Force</option><option value="faiblesse">Inconfort / Faiblesse</option></select></div><div className="flex justify-end gap-2 mt-4"><button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded-lg">Annuler</button><button type="submit" className="bg-cyan-600 hover:bg-cyan-700 py-2 px-4 rounded-lg">Sauvegarder</button></div></form></div></div>;
}

// --- Composant PlayerSeat ---
function PlayerSeat({ player, onSelectPlayer }) {
  const seatColor = player.isHero ? 'border-yellow-500' : 'border-gray-600'; const seatHoverColor = player.isHero ? 'hover:border-yellow-400' : 'hover:border-cyan-500';
  return <div className="absolute" style={player.position}><div className="relative w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center"><div onClick={() => onSelectPlayer(player.id)} className={`w-20 h-12 sm:w-24 sm:h-14 bg-gray-800 rounded-xl shadow-lg border-2 ${seatColor} ${seatHoverColor} cursor-pointer transition-all flex items-center justify-center p-1`}><span className="text-white font-semibold text-sm text-center truncate px-1">{player.name}</span></div>{player.tells.length > 0 && <div className="absolute -top-2 -left-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-900">{player.tells.length}</div>}</div></div>;
}

// --- Composant PokerTable ---
function PokerTable({ players, onSelectPlayer }) {
  const tableWidth = 300; const tableHeight = 550;
  const playerCoordinates = [{ x: 15, y: tableHeight * 0.75 }, { x: 15, y: tableHeight * 0.55 }, { x: 15, y: tableHeight * 0.35 }, { x: 15, y: tableHeight * 0.15 }, { x: tableWidth / 2, y: tableHeight - 15 }, { x: tableWidth - 15, y: tableHeight * 0.15 }, { x: tableWidth - 15, y: tableHeight * 0.35 }, { x: tableWidth - 15, y: tableHeight * 0.55 }, { x: tableWidth - 15, y: tableHeight * 0.75 }];
  const getPlayerPosition = (p) => { const map = { 1:3, 2:2, 3:1, 4:0, 5:4, 6:5, 7:6, 8:7, 9:8 }; return { left: `${playerCoordinates[map[p.id]].x}px`, top: `${playerCoordinates[map[p.id]].y}px`, transform: 'translate(-50%, -50%)' }; };
  return <div className="relative w-full h-full flex items-center justify-center"><div className="relative" style={{ width: `${tableWidth}px`, height: `${tableHeight}px` }}><div className="w-full h-full bg-green-800 rounded-[150px] shadow-2xl border-8 border-gray-900 flex items-center justify-center"><div className="w-[calc(100%-40px)] h-[calc(100%-40px)] border-2 border-yellow-600 rounded-[130px]"></div></div>{players.map((p) => <PlayerSeat key={p.id} player={{...p, position: getPlayerPosition(p)}} onSelectPlayer={onSelectPlayer} />)}</div></div>;
}

// --- Composant AllTellsSummary ---
function AllTellsSummary({ players, archivedPlayers, onClose, onResetPlayerTells }) {
    const rankedPlayers = useMemo(() => {
        const allPlayersInSession = [...players, ...archivedPlayers];
        const playersWithTells = allPlayersInSession.filter(p => p.tells.length > 0 && !p.isHero);

        const consolidated = playersWithTells.map(player => {
            const totalPlayerScore = player.tells.reduce((sum, tell) => sum + tell.certainty, 0);
            return { ...player, totalPlayerScore };
        });

        return consolidated.sort((a, b) => b.totalPlayerScore - a.totalPlayerScore);
    }, [players, archivedPlayers]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] p-6 border border-gray-700 flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold">Classement des Joueurs</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon /></button>
                </div>
                <div className="overflow-y-auto pr-2">
                    {rankedPlayers.length === 0 ? (
                        <p className="text-gray-400 text-center mt-8">Aucun tell n'a été enregistré.</p>
                    ) : (
                        <div className="space-y-3">
                            {rankedPlayers.map((p, index) => (
                                <div key={p.playerInstanceId} className="flex justify-between items-center bg-gray-700/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-bold text-gray-500 w-8 text-center">{index + 1}</span>
                                        <div>
                                            <h3 className="text-xl font-semibold text-cyan-400">{p.name}</h3>
                                            <p className="text-sm text-gray-400">{p.tells.length} tell(s) enregistré(s)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-bold text-white">{p.totalPlayerScore} <span className="text-base font-normal text-gray-400">pts</span></span>
                                        <button onClick={() => onResetPlayerTells(p.playerInstanceId)} className="text-gray-500 hover:text-red-500" title={`Effacer les tells de ${p.name}`}>
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Composant principal App ---
export default function App() {
  const [players, setPlayers] = useState([]); 
  const [customTells, setCustomTells] = useState([]); 
  const [archivedPlayers, setArchivedPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null); 
  const [showAllTells, setShowAllTells] = useState(false); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [showCreateTell, setShowCreateTell] = useState(false); 
  const [defaultTellData, setDefaultTellData] = useState(null);
  const fileInputRef = useRef(null);
  const defaultNames = useRef({ 5: 'Hero', 4: 'Joueur 1', 3: 'Joueur 2', 2: 'Joueur 3', 1: 'Joueur 4', 9: 'Joueur 8', 8: 'Joueur 7', 7: 'Joueur 6', 6: 'Joueur 5' });
  
  const initializePlayers = useCallback(() => Array.from({ length: 9 }, (_, i) => ({ id: i + 1, playerInstanceId: crypto.randomUUID(), name: defaultNames.current[i + 1], tells: [], isHero: i + 1 === 5 })), []);
  
  useEffect(() => { 
    try { 
      const saved = localStorage.getItem('pokerTrackerSession'); 
      if (saved) { 
        const { players: p, customTells: c, archivedPlayers: a } = JSON.parse(saved); 
        setPlayers(p || initializePlayers()); 
        setCustomTells(c || []); 
        setArchivedPlayers(a || []);
      } else { 
        setPlayers(initializePlayers()); 
      } 
    } catch (error) { 
      console.error("Failed to load session", error); 
      setPlayers(initializePlayers()); 
    } 
  }, [initializePlayers]);
  
  useEffect(() => { 
    if (players.length > 0) localStorage.setItem('pokerTrackerSession', JSON.stringify({ players, customTells, archivedPlayers })); 
  }, [players, customTells, archivedPlayers]);

  const handleNameChange = (id, newName) => setPlayers(p => p.map(player => player.id === id ? { ...player, name: newName } : player));
  const handleSelectPlayer = (id) => setSelectedPlayerId(id); 
  const handleCloseModal = () => setSelectedPlayerId(null);
  const handleSaveTells = (playerId, newTells) => setPlayers(p => p.map(player => player.id === playerId ? { ...player, tells: [...player.tells, ...newTells] } : player));
  const handleDeleteTell = (playerId, tellId) => setPlayers(p => p.map(player => player.id === playerId ? { ...player, tells: player.tells.filter(t => t.id !== tellId) } : player));
  const handleNewGame = () => { if (window.confirm("Commencer une nouvelle partie ?")) { localStorage.removeItem('pokerTrackerSession'); setPlayers(initializePlayers()); setCustomTells([]); setArchivedPlayers([]); setIsMenuOpen(false); } };
  
  const handleResetPlayer = (playerId) => { 
    const playerToReset = players.find(pl => pl.id === playerId); 
    if (window.confirm(`Remplacer ${playerToReset.name} ?`)) {
        if(playerToReset.tells.length > 0) {
            setArchivedPlayers(prev => [...prev, playerToReset]);
        }
        setPlayers(prev => prev.map(pl => pl.id === playerId ? { ...pl, name: defaultNames.current[pl.id], tells: [], playerInstanceId: crypto.randomUUID() } : pl)); 
    }
  };

  const handleResetPlayerTells = (playerInstanceId) => { 
      const playerInActive = players.find(p => p.playerInstanceId === playerInstanceId);
      const playerInArchive = archivedPlayers.find(p => p.playerInstanceId === playerInstanceId);
      const playerName = playerInActive?.name || playerInArchive?.name;

      if (window.confirm(`Effacer tous les tells de ${playerName} ?`)) {
          setPlayers(prev => prev.map(p => p.playerInstanceId === playerInstanceId ? { ...p, tells: [] } : p));
          setArchivedPlayers(prev => prev.filter(p => p.playerInstanceId !== playerInstanceId));
      }
  };

  const handleSaveCustomTell = (tell) => setCustomTells(prev => [...prev, tell]);
  const handleShowCreateTellWithDefaults = (data) => {
    setDefaultTellData(data);
    setShowCreateTell(true);
    setSelectedPlayerId(null); // Close player modal if open
  };
  const handleExport = () => { const data = JSON.stringify({ players, customTells, archivedPlayers }, null, 2); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'poker_session.json'; a.click(); URL.revokeObjectURL(url); setIsMenuOpen(false); };
  const handleImport = (event) => { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => { try { const { players: p, customTells: c, archivedPlayers: a } = JSON.parse(e.target.result); if (p && window.confirm("Importer cette session ?")) { setPlayers(p); setCustomTells(c || []); setArchivedPlayers(a || []); } } catch (err) { alert("Fichier de session invalide."); } }; reader.readAsText(file); } setIsMenuOpen(false); };
  const allTells = useMemo(() => { const combined = JSON.parse(JSON.stringify(TELL_CATEGORIES_DEFAULT)); customTells.forEach(tell => { if (combined[tell.category]) combined[tell.category][tell.strength].push(tell.text); }); return combined; }, [customTells]);
  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <main className="w-screen h-screen bg-gray-900 text-white font-sans overflow-hidden flex flex-col">
      <header className="flex justify-between items-center p-4 bg-gray-900/50 backdrop-blur-sm z-30 flex-shrink-0">
        <h1 className="text-xl font-bold text-cyan-400">Poker Tell Tracker</h1>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 text-white"><HamburgerIcon /></button>
          {isMenuOpen && <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-40"><button onClick={() => { setShowAllTells(true); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 rounded-t-lg">Voir tous les Tells</button><button onClick={() => fileInputRef.current.click()} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700">Importer les données</button><button onClick={handleExport} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700">Enregistrer les données</button><button onClick={handleNewGame} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg">Nouvelle Partie</button></div>}
        </div>
      </header>
      <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
      <div className="flex-grow relative"><PokerTable players={players} onSelectPlayer={handleSelectPlayer} /></div>
      <PlayerDetailsModal player={selectedPlayer} onClose={handleCloseModal} onSaveTells={handleSaveTells} onDeleteTell={handleDeleteTell} onNameChange={handleNameChange} onResetPlayer={handleResetPlayer} allTells={allTells} onShowCreateTellWithDefaults={handleShowCreateTellWithDefaults} />
      {showCreateTell && <CreateTellModal onClose={() => { setShowCreateTell(false); setDefaultTellData(null); }} onSaveCustomTell={handleSaveCustomTell} defaultData={defaultTellData} />}
      {showAllTells && <AllTellsSummary players={players} archivedPlayers={archivedPlayers} onClose={() => setShowAllTells(false)} onResetPlayerTells={handleResetPlayerTells} />}
    </main>
  );
}
