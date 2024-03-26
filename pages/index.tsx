//.app/page.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import Home from '../components/home';
import Resources from '../components/resources';
import { fetchEc2Instances, ServerSideInstances } from '../utils/server_side_utils';
import { GetServerSideProps } from 'next';

const App = ({ serverSideInstances}: { serverSideInstances: ServerSideInstances[] }) => {
  
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Pass the fetched data as a prop to the Resources component */}
          <Route path="/resources" element={<Resources serverSideInstances={serverSideInstances} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const serverSideInstances = await fetchEc2Instances();

  return {
    props: {
      serverSideInstances,
    },
  };
};

export default App;
