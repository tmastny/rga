import React from 'react';
import { createRoot } from 'react-dom/client';
import RGAEditorDemo from './index';
import './index.css'

const root = createRoot(document.getElementById('root')!);
root.render(<RGAEditorDemo />);