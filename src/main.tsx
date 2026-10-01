import React from 'react';
import ReactDOM from 'react-dom/client';
import 'mdui/mdui.css';
import 'mdui/components/button.js';
import 'mdui/components/button-icon.js';
import 'mdui/components/card.js';
import 'mdui/components/chip.js';
import 'mdui/components/dialog.js';
import 'mdui/components/text-field.js';
import 'mdui/components/switch.js';
import { setColorScheme } from 'mdui/functions/setColorScheme.js';
import App from './App';
import './styles.css';

setColorScheme('#557c72');
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
