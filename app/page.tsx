'use client';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/footer';
import Home from './components/home';
import Resources, { ServerSideInstances } from './components/resources';
import AWS from 'aws-sdk';

interface Props {
  serverSideInstances: ServerSideInstances[];
}

// only seen on server side
// console.log("Attempting with the following credentials:");
// console.log("accessKeyId:", process.env.AWS_SDK_ID);
// console.log("secretAccessKey:", process.env.AWS_SDK_KEY);

AWS.config.update({
  accessKeyId: process.env.AWS_SDK_ID,
  secretAccessKey: process.env.AWS_SDK_KEY,
  region: "eu-north-1",
});

const ec2 = new AWS.EC2();

export const fetchEc2Instances = async () => {
  try {
    console.log("fetching...");
    const data = await ec2.describeInstances().promise();
    console.log("fetched promise...");
    const instances: ServerSideInstances[] = data.Reservations.flatMap(
      (reservation) => {
        reservation.Instances?.map((instance) => ({
          instanceID: instance.InstanceId,
          state: instance.State?.Name || "N/A",
          publicIP: instance.PublicIpAddress || "N/A",
          privateIP: instance.PrivateIpAddress || "N/A",
        }));
      }
    );
    return instances;
  } catch (error) {
    console.log("error fetching ec2...");
    throw error;
  }
};

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<Resources />}/>
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App