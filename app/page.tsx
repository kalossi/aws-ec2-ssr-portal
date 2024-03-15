// .app/index.tsx (ssr?)
'use client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import Home from '../components/home';
import Resources from '../components/resources';
import { ServerSideInstances, fetchEc2Instances } from '../utils/server_side_utils';

const App: React.FC<{serversideInstances: { serverSideInstances: ServerSideInstances[]}}> = ( {serverSideInstances} ) => {

  console.log('inside the APP:', serverSideInstances);

  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<Resources serverSideInstances={ serverSideInstances }/>}/>
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export const serverSideInstances = async () => { 
  await fetchEc2Instances();

  return {
    props: {
      serverSideInstances,
    },
  };
};

export default App