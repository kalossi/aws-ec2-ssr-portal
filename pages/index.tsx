//.pages/index.tsx
import Header from '../components/header';
import Footer from '../components/footer';
import Home from '../components/home';
import Resources from '../components/resources';
import { fetchEc2Instances, ServerSideInstances } from '../utils/server_side_utils';
import { GetServerSideProps } from 'next';

const App = ({ serverSideInstances}: { serverSideInstances: ServerSideInstances[] }) => {
  
  return (
      <div>
        <Header />
          <Home />
          <Resources serverSideInstances={serverSideInstances} />
        <Footer />
      </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const serverSideInstances = fetchEc2Instances();

  return {
    props: {
      serverSideInstances,
    },
  };
};

export default App;
