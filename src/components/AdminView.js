import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminView() {
  const [players, setPlayers] = useState([]);
  const [alivePlayers, setAlivePlayers] = useState([]);
  const [deadPlayers, setDeadPlayers] = useState([]);
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState('');
  const [actionHistory, setActionHistory] = useState([]);
  const [votingResults, setVotingResults] = useState({});
  const [waitingForPlayers, setWaitingForPlayers] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [roles, setRoles] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://127.0.0.1:8000/game_state')
        .then(response => response.json())
        .then(data => {
          setPlayers(data.players || []);
          setAlivePlayers(data.alive_players || []);
          setDeadPlayers(data.dead_players || []);
          setPhase(data.phase || '');
          setActionHistory(data.action_history || []);
          setVotingResults(data.voting_results || {});
          setWaitingForPlayers(data.waiting_for_players || []);
          setRoles(data.game_state || {});
        })
        .catch(error => console.error("Error fetching game state:", error));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addPlayer = () => {
    fetch('http://127.0.0.1:8000/add_player', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: playerName }),
    })
    .then(response => response.json())
    .then(data => {
      setMessage(data.message);
      setPlayers(data.players || []);
    })
    .catch(error => console.error("Error adding player:", error));
  };

  const startGame = () => {
    fetch('http://127.0.0.1:8000/start_game', {
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
      setMessage(data.message);
    })
    .catch(error => console.error("Error starting game:", error));
  };

  const nextPhase = () => {
    fetch('http://127.0.0.1:8000/next_phase', {
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage(data.message);
        setPhase(data.phase);
      }
    })
    .catch(error => console.error("Error changing phase:", error));
  };

  return (
    <div className="admin-view">
      <h1>Admin View</h1>
      {phase === "setup" && (
        <div>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name"
          />
          <button onClick={addPlayer}>Add Player</button>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
      {phase !== "setup" && (
        <div>
          <button onClick={nextPhase}>Next Phase</button>
        </div>
      )}
      <p>Current Phase: {phase}</p>
      <p>{message}</p>
      <div>
        <h2>Players</h2>
        <ul>
          {players.map((player, index) => (
            <li
              key={index}
              style={{ color: alivePlayers.includes(player) ? 'green' : 'red' }}
              onClick={() => navigate(`/player/${player}`)}
            >
              {player} - {roles[player]}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Action History</h2>
        <ul>
          {actionHistory.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Waiting for Players</h2>
        <ul>
          {waitingForPlayers.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
      {phase === "day_results" && (
        <div>
          <h2>Voting Results</h2>
          <ul>
            {Object.entries(votingResults.vote_count || {}).map(([player, count], index) => (
              <li key={index}>{player}: {count} votes</li>
            ))}
          </ul>
          {votingResults.eliminated && (
            <p>{votingResults.eliminated} was eliminated.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminView;
