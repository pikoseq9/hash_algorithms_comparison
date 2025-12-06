import { StrictMode } from 'react'
import {createBrowserRouter, RouterProvider } from "react-router-dom"
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './App.css'
import HashView from './components/HashView.jsx'
import CompareView from './components/CompareView.jsx'
import "@fortawesome/fontawesome-free/css/all.min.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {path: "/", element: <HashView /> }, 
      {path: "/compare", element: <CompareView />}
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}>
    <StrictMode>
      <App />
    </StrictMode>
  </RouterProvider>
)
