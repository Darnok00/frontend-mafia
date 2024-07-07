import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function PlayerView() {
  const { name } = useParams();
  const [players, setPlayers] = useState([]);
  const [alivePlayers, setAlivePlayers] = useState([]);
  const [deadPlayers, setDeadPlayers] = useState([]);
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState('');
  const [role, setRole] = useState('');
  const [isMafia, setIsMafia] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasActed, setHasActed] = useState(false);
  const [votingResults, setVotingResults] = useState({});
  const [nightResults, setNightResults] = useState({});
  const [gameState, setGameState] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://127.0.0.1:8000/game_state')
        .then(response => response.json())
        .then(data => {
          console.log(data);
          setPlayers(data.players || []);
          setAlivePlayers(data.alive_players || []);
          setDeadPlayers(data.dead_players || []);
          setPhase(data.phase || '');
          setRole(data.game_state[name]);
          setIsMafia(data.game_state[name] === 'Mafia');
          setVotingResults(data.voting_results || {});
          setNightResults(data.night_actions || {});
          setGameState(data.game_state || {});
          if (name in data.votes) setHasVoted(true);
          if (data.phase !== "day_vote") setHasVoted(false);
          if (name in data.night_actions) setHasActed(true);
          if (data.phase !== "night_actions") setHasActed(false);
        })
        .catch(error => console.error("Error fetching game state:", error));
    }, 1000);
    return () => clearInterval(interval);
  }, [name]);

  const vote = (target) => {
    fetch('http://127.0.0.1:8000/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ player: name, target: target }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('x')
      setMessage(data.message);
      setHasVoted(true);
    })
    .catch(error => console.error("Error voting:", error));
  };

  const performAction = (target) => {
    fetch('http://127.0.0.1:8000/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ player: name, target: target }),
    })
    .then(response => response.json())
    .then(data => {
      setMessage(data.message);
      setHasActed(true);
    })
    .catch(error => console.error("Error performing action:", error));
  };

  const renderVotingResults = () => (
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
  );

  const renderNightResults = () => {
    if (role !== "Detektyw" || phase !== "night_results") return null;
    const target = nightResults[name];

    return (
      <div>
        <h2>Night Results</h2>
        <p>The {target} is {gameState[target]}</p>
      </div>
    );
  };

  const renderActionButtons = () => (
    <ul>
      {alivePlayers.map((player, index) => (
        player !== name && (
          <li key={index}>
            {player}
            {phase === "day_vote" && !hasVoted && (
              <button onClick={() => vote(player)} disabled={hasVoted}>Vote</button>
            )}
            {phase === "night_actions" && role !== "Mieszkaniec" && !hasActed && (
              <button onClick={() => performAction(player)} disabled={hasActed}>Perform Action</button>
            )}
          </li>
        )
      ))}
    </ul>
  );

  const renderMafiaMembers = () => {
    if (!isMafia) return null;
    return (
      <div>
        <h2>Other Mafia Members</h2>
        <ul>
          {players.filter(player => player !== name && alivePlayers.includes(player) && gameState[player] === 'Mafia').map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="player-view">
      <h1>Player View</h1>
      <p>Your role: {role}</p>
      <p>Current Phase: {phase}</p>
      <p>{message}</p>
      {alivePlayers.includes(name) ? renderActionButtons() : (
        <div>
          <h2>Players</h2>
          <ul>
            {players.map((player, index) => (
              <li key={index} style={{ color: alivePlayers.includes(player) ? 'green' : 'red' }}>
                {player}
              </li>
            ))}
          </ul>
        </div>
      )}
      {renderMafiaMembers()}
      {phase === "day_results" && renderVotingResults()}
      {renderNightResults()}
    </div>
  );
}

export default PlayerView;
