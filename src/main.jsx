import React from 'react';
import {createRoot} from 'react-dom/client';
import './app.css';
import {HomePage,DownloadsPage,SpeakerPage,ConceptsPage,WorkflowsPage,ToolsPage} from './pages.jsx';
const page=document.body.dataset.page||'home';const PAGES={home:HomePage,downloads:DownloadsPage,speaker:SpeakerPage,concepts:ConceptsPage,workflows:WorkflowsPage,tools:ToolsPage};const Current=PAGES[page]||HomePage;createRoot(document.getElementById('root')).render(<Current/>);
