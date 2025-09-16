import React ,{ useEffect } from 'react';
import TabNavigator from './navigation/TabNavigator';
import { database } from './backendjs/watermelondb/database'; // This initializes it
export default function App() {

  return <TabNavigator />;
}
