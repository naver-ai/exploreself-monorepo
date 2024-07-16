import React, {FC, useEffect, useState} from 'react';
import axios from "axios";
import { BrowserRouter , Route, Routes } from 'react-router-dom';
import Main from '../Pages/Main';
// import '../style/index.css'
import InitialNarrative from '../Pages/InitialNarrative';
import ValueSet from '../Pages/ValueSet';
import Login from '../Pages/Login';
import 'apps/reauthor-monorepo/src/styles.css'
const App: FC = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Main/>}
        />
        <Route
          path="/narrative"
          element={<InitialNarrative/>}
        />
        <Route
          path="/value"
          element={<ValueSet/>}
        />
        <Route
          path="/login"
          element={<Login/>}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
