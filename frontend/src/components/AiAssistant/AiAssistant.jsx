import React, { useState, useContext, useRef, useEffect } from 'react';
import './AiAssistant.css';
import { StoreContext } from '../context/StoreContext';
import { ThemeContext } from '../context/ThemeContext';

const AiAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! 👋 I can help you find the perfect food, suggest combos, track orders, filter the menu, or recommend based on your mood. How can I assist?' }
  ]);
  const [input, setInput] = useState('');
  const { allFoods, cartItems, setSearchFilters } = useContext(StoreContext);
  const { theme } = useContext(ThemeContext);
  const messagesEndRef = useRef(null);

  const scrollToEnd = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const botReply = (text) => {
    setTimeout(() => {
      addMessage('bot', text);
    }, 500);
  };

  const processUser = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('recommend')) {
      recommendFood();
    } else if (lower.includes('combo')) {
      suggestCombo();
    } else if (lower.includes('track')) {
      trackOrders();
    } else if (lower.includes('filter')) {
      const words = lower.split(' ');
      const cat = allFoods.find((i) =>
        words.includes(i.category.toLowerCase())
      );
      if (cat) {
        applyFilter(cat.category);
      } else {
        botReply('Which category would you like to filter by? (Salad, Rolls, Deserts, Sandwich, Cake, Pure Veg, Pasta, Noodles)');
      }
    } else if (lower.includes('mood')) {
      botReply('Tell me how you are feeling: happy, sad, tired, angry, or energetic? 😊');
    } else if (lower.match(/\b(angry|sad|happy|energetic|tired)\b/)) {
      suggestByMood(lower);
    } else {
      botReply("I can help with: recommendations, combos, order tracking, filtering the menu, or mood-based suggestions. Try asking! 🤖");
    }
  };

  const recommendFood = () => {
    if (!allFoods || allFoods.length === 0) {
      botReply('No food data available.');
      return;
    }
    const sorted = [...allFoods].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const top3 = sorted.slice(0, 3).map((f) => `${f.name} (⭐ ${f.rating || 0})`);
    botReply(`⭐ Check these top picks: ${top3.join(', ')}`);
  };

  const suggestCombo = () => {
    if (!allFoods || allFoods.length === 0) {
      botReply('No food data available.');
      return;
    }
    const random = () => allFoods[Math.floor(Math.random() * allFoods.length)];
    const picks = [random(), random(), random()];
    const comboName = picks.map((p) => p.name).join(' + ');
    botReply(`🍽️ Perfect Combo: ${comboName}`);
  };

  const trackOrders = () => {
    const entries = Object.entries(cartItems || {});
    if (entries.length === 0) {
      botReply('Your cart is empty. Start adding items! 🛒');
      return;
    }
    const lines = entries.map(([id, qty]) => {
      const itm = allFoods.find((f) => f._id === id);
      return itm ? `${itm.name} (x${qty})` : '';
    });
    botReply(`🛒 Cart: ${lines.filter(Boolean).join(', ')}`);
  };

  const applyFilter = (category) => {
    const filtered = allFoods.filter((i) => i.category === category);
    setSearchFilters(filtered);
    botReply(`✅ Showing ${filtered.length} items in ${category}!`);
  };

  const suggestByMood = (text) => {
    if (text.includes('sad')) {
      botReply('😔 Comfort food coming up! Try ice cream, cake, or desserts. Sweet treats always help!');
    } else if (text.includes('angry')) {
      botReply('😠 Spicy might help! Go for rolls or pasta with some heat. Or try something fresh like salad.');
    } else if (text.includes('happy')) {
      botReply('😄 Awesome! Light & fresh options like salads sound perfect for this mood!');
    } else if (text.includes('energetic')) {
      botReply('⚡ Full energy needed? Hearty pasta, noodles, or sandwich will keep you going!');
    } else if (text.includes('tired')) {
      botReply('😴 Feeling tired? A warm, comforting dish like pasta or soup will soothe you.');
    } else {
      botReply("Tell me your mood and I'll suggest the perfect food! 💭");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    addMessage('user', input);
    processUser(input);
    setInput('');
  };

  const handleQuick = (action) => {
    addMessage('user', action);
    switch (action) {
      case 'Recommend food':
        recommendFood();
        break;
      case 'Suggest combo':
        suggestCombo();
        break;
      case 'Track orders':
        trackOrders();
        break;
      case 'Filter menu':
        botReply('Which category? Choose from: Salad, Rolls, Deserts, Sandwich, Cake, Pure Veg, Pasta, Noodles');
        break;
      case 'Mood suggestion':
        botReply('How are you feeling? (happy, sad, tired, angry, energetic)');
        break;
      default:
        break;
    }
  };

  const clearChat = () => {
    setMessages([{ sender: 'bot', text: 'Chat cleared! How can I help you? 👋' }]);
  };

  return (
    <>
      <div
        className={`ai-icon ${theme}`}
        onClick={() => setOpen((o) => !o)}
        title="AI Assistant"
      >
        🤖
      </div>
      {open && (
        <div className={`ai-panel ${theme}`}>
          <div className={`ai-header ${theme}`}>
            <h3>Food Assistant 🍽️</h3>
            <button
              className={`clear-btn ${theme}`}
              onClick={clearChat}
              title="Clear chat"
            >
              🗑️
            </button>
          </div>

          <div className={`messages ${theme}`}>
            {messages.map((m, idx) => (
              <div key={idx} className={`message-wrapper ${m.sender}`}>
                <div className={`message ${m.sender} ${theme}`}>
                  <span className="avatar">{m.sender === 'user' ? '👤' : '🤖'}</span>
                  <div className="message-content">{m.text}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={`quick-actions ${theme}`}>
            {['Recommend food', 'Suggest combo', 'Track orders', 'Filter menu', 'Mood suggestion'].map((label) => (
              <button
                key={label}
                className={`quick-btn ${theme}`}
                onClick={() => handleQuick(label)}
              >
                {label}
              </button>
            ))}
          </div>

          <form className={`input-area ${theme}`} onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className={theme}
            />
            <button type="submit" className={`send-btn ${theme}`}>
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
